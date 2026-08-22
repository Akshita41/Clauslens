/**
 * Clause splitting.
 *
 * The single most consequential decision in this project. A fixed-size window
 * will happily cut a liability cap away from its carve-out, or a termination
 * right away from its notice period. Retrieval then returns half an obligation
 * and the model answers confidently from the half it can see.
 *
 * So contracts are split on their own structure instead: numbered headings,
 * articles, and short capitalised headings. No LLM is involved — this is
 * deterministic, testable, and free.
 */

export type PageText = { page: number; text: string };

export type SplitClause = {
  clauseNo: string | null;
  heading: string;
  text: string;
  page: number;
  charStart: number;
  charEnd: number;
};

export type SplitResult = {
  clauses: SplitClause[];
  /** True when too few headings were found and paragraphs were used instead. */
  fallback: boolean;
};

/**
 * A clause whose body (everything after its heading line) is shorter than this
 * is a bare heading — "SCHEDULE A" — not something a citation can point at.
 * Deliberately not a threshold on total length: "Governing law: Delaware." is
 * a short clause but a perfectly real one, and merging it away would lose a
 * term the extractor needs.
 */
const MIN_BODY_CHARS = 40;
/** A stray line shorter than this is never a clause, heading or not. */
const MIN_CLAUSE_CHARS = 60;
/** Above this, a clause is too coarse to cite usefully; split at sub-items. */
const MAX_CLAUSE_CHARS = 6000;
/** Fewer detected headings than this means the document has no usable structure. */
const MIN_BOUNDARIES = 3;
/** Target size for paragraph groups on the fallback path. */
const FALLBACK_TARGET_CHARS = 1500;

type Boundary = {
  offset: number;
  clauseNo: string | null;
  heading: string;
};

/* ── Heading patterns ─────────────────────────────────────────── */

/** "ARTICLE V", "Section 4.2", "Clause 12" — the most reliable signal. */
const KEYWORD_HEADING =
  /^(?:ARTICLE|Article|SECTION|Section|CLAUSE|Clause)\s+([IVXLCDM]+|\d+(?:\.\d+)*)\.?[\s.:—-]*(.*)$/;

/** "4.2 Limitation of Liability" or "7. Confidentiality". */
const NUMBERED_HEADING = /^(\d+(?:\.\d+)*)\.?\s+(\S.*)$/;

/** A short line in capitals: "LIMITATION OF LIABILITY". */
const CAPS_HEADING = /^[A-Z][A-Z0-9 ,.'&()/-]{3,70}$/;

/** "(a) ..." — too weak to start a clause, but useful for splitting a huge one. */
const SUB_ITEM = /^\(([a-z]|[ivx]+)\)\s+\S/;

/**
 * Pulls a human-readable heading out of the text following a clause number.
 * Contracts write both "4.2 Limitation of Liability" and
 * "4.2 Limitation of Liability. Except for ..." — we want the same answer
 * from each.
 */
function extractHeading(rest: string): string {
  const trimmed = rest.trim();
  if (!trimmed) return "";

  // A short leading segment before a full stop is almost always the heading.
  const sentenceEnd = trimmed.search(/\.\s/);
  if (sentenceEnd > 0 && sentenceEnd <= 70) {
    return trimmed.slice(0, sentenceEnd).trim();
  }
  if (trimmed.length <= 70) return trimmed.replace(/\.$/, "").trim();
  return trimmed.slice(0, 70).trim() + "…";
}

/** Classifies one line. Returns null when it does not begin a clause. */
function detectBoundary(line: string): Omit<Boundary, "offset"> | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const keyword = KEYWORD_HEADING.exec(trimmed);
  if (keyword) {
    return {
      clauseNo: keyword[1],
      heading: extractHeading(keyword[2]) || `Section ${keyword[1]}`,
    };
  }

  const numbered = NUMBERED_HEADING.exec(trimmed);
  if (numbered) {
    // Guard against ordinary sentences that happen to open with a figure,
    // e.g. "2020 was the reference year" or a stray page number.
    const head = numbered[2];
    if (/^[A-Z(]/.test(head)) {
      return { clauseNo: numbered[1], heading: extractHeading(head) };
    }
  }

  if (CAPS_HEADING.test(trimmed) && !/[a-z]/.test(trimmed)) {
    return { clauseNo: null, heading: toTitleCase(trimmed) };
  }

  return null;
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim();
}

/* ── Main entry point ─────────────────────────────────────────── */

export function splitIntoClauses(pages: PageText[]): SplitResult {
  const { document, pageStarts } = joinPages(pages);
  const pageOf = (offset: number) => {
    let page = pages[0]?.page ?? 1;
    for (const start of pageStarts) {
      if (offset >= start.offset) page = start.page;
      else break;
    }
    return page;
  };

  const boundaries: Boundary[] = [];
  let cursor = 0;
  for (const line of document.split("\n")) {
    const hit = detectBoundary(line);
    if (hit) boundaries.push({ ...hit, offset: cursor });
    cursor += line.length + 1;
  }

  if (boundaries.length < MIN_BOUNDARIES) {
    return { clauses: paragraphFallback(document, pageOf), fallback: true };
  }

  // Anything before the first heading is the title page / preamble.
  const preamble: SplitClause[] =
    boundaries[0].offset > MIN_CLAUSE_CHARS
      ? [
          buildClause(
            document,
            0,
            boundaries[0].offset,
            null,
            "Preamble",
            pageOf,
          ),
        ]
      : [];

  const raw = boundaries.map((b, i) => {
    const end = boundaries[i + 1]?.offset ?? document.length;
    return buildClause(document, b.offset, end, b.clauseNo, b.heading, pageOf);
  });

  const merged = mergeRunts([...preamble, ...raw]);
  const clauses = merged.flatMap((c) => splitIfHuge(c, pageOf));

  return { clauses, fallback: false };
}

/* ── Helpers ──────────────────────────────────────────────────── */

function joinPages(pages: PageText[]) {
  const pageStarts: { page: number; offset: number }[] = [];
  let document = "";
  for (const p of pages) {
    pageStarts.push({ page: p.page, offset: document.length });
    document += p.text.replace(/\r\n?/g, "\n");
    if (!document.endsWith("\n")) document += "\n";
  }
  return { document, pageStarts };
}

function buildClause(
  document: string,
  start: number,
  end: number,
  clauseNo: string | null,
  heading: string,
  pageOf: (offset: number) => number,
): SplitClause {
  const text = document.slice(start, end).trim();
  return {
    clauseNo,
    heading: heading || "Untitled clause",
    text,
    page: pageOf(start),
    charStart: start,
    charEnd: end,
  };
}

/**
 * A heading on its own line produces a near-empty clause. Fold those back into
 * the clause before, rather than emitting citations that point at nothing.
 */
function mergeRunts(clauses: SplitClause[]): SplitClause[] {
  const out: SplitClause[] = [];
  for (const clause of clauses) {
    const previous = out[out.length - 1];
    if (previous && isBareHeading(clause.text)) {
      previous.text = `${previous.text}\n${clause.text}`.trim();
      previous.charEnd = clause.charEnd;
    } else {
      out.push({ ...clause });
    }
  }
  return out;
}

/** True when a clause is its heading line and essentially nothing else. */
function isBareHeading(text: string): boolean {
  if (text.trim().length < MIN_CLAUSE_CHARS) return true;
  const body = text.split("\n").slice(1).join(" ").trim();
  return body.length < MIN_BODY_CHARS;
}

/**
 * A clause running past MAX_CLAUSE_CHARS is usually a long enumerated section.
 * Split it at its own "(a)" sub-items — never at an arbitrary offset, because
 * that would reintroduce exactly the problem clause splitting exists to avoid.
 */
function splitIfHuge(
  clause: SplitClause,
  pageOf: (offset: number) => number,
): SplitClause[] {
  if (clause.text.length <= MAX_CLAUSE_CHARS) return [clause];

  const cuts: number[] = [];
  let cursor = 0;
  for (const line of clause.text.split("\n")) {
    if (cursor > 0 && SUB_ITEM.test(line.trim())) cuts.push(cursor);
    cursor += line.length + 1;
  }
  if (cuts.length === 0) return [clause];

  const parts: SplitClause[] = [];
  const offsets = [0, ...cuts, clause.text.length];
  for (let i = 0; i < offsets.length - 1; i++) {
    const text = clause.text.slice(offsets[i], offsets[i + 1]).trim();
    if (!text) continue;
    const charStart = clause.charStart + offsets[i];
    parts.push({
      clauseNo: clause.clauseNo,
      heading: i === 0 ? clause.heading : `${clause.heading} (cont.)`,
      text,
      page: pageOf(charStart),
      charStart,
      charEnd: clause.charStart + offsets[i + 1],
    });
  }
  return parts;
}

/**
 * Used when a document has no detectable headings — a poorly typeset PDF, or
 * one page of prose. Groups paragraphs to roughly FALLBACK_TARGET_CHARS.
 *
 * The contract is marked as a fallback split in the database and in the UI, so
 * the reduced citation precision is visible rather than silent.
 */
function paragraphFallback(
  document: string,
  pageOf: (offset: number) => number,
): SplitClause[] {
  const clauses: SplitClause[] = [];
  let bufferStart = 0;
  let buffer = "";
  let cursor = 0;

  const flush = (end: number) => {
    const text = buffer.trim();
    if (text.length > 0) {
      clauses.push({
        clauseNo: null,
        heading: firstWords(text),
        text,
        page: pageOf(bufferStart),
        charStart: bufferStart,
        charEnd: end,
      });
    }
    buffer = "";
  };

  for (const paragraph of document.split(/\n\s*\n/)) {
    if (buffer === "") bufferStart = cursor;
    buffer += (buffer ? "\n\n" : "") + paragraph;
    cursor += paragraph.length + 2;
    if (buffer.length >= FALLBACK_TARGET_CHARS) flush(cursor);
  }
  flush(cursor);

  return clauses;
}

function firstWords(text: string): string {
  const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 7);
  return words.join(" ") + (words.length === 7 ? "…" : "");
}
