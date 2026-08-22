import type { PageText } from "@/lib/clauses/split";

export type ExtractResult = {
  pages: PageText[];
  pageCount: number;
  /** Characters of text per page. Low values mean a scan with no text layer. */
  charsPerPage: number;
};

export class NoTextLayerError extends Error {
  constructor(charsPerPage: number) {
    super(
      `This PDF has almost no selectable text (${Math.round(charsPerPage)} characters per page). ` +
        `It is probably a scan. ClauseLens does not run OCR, so it cannot read it.`,
    );
    this.name = "NoTextLayerError";
  }
}

/**
 * Below this many characters per page, the document is a scan or an image.
 * Refusing is the honest outcome: a silent bad read produces confident
 * citations pointing at text that was never in the contract.
 */
const MIN_CHARS_PER_PAGE = 120;

/**
 * Pulls text out of a PDF, one entry per page.
 *
 * Page numbers are the whole point — every citation ClauseLens shows depends
 * on knowing which page a clause came from, so text is never flattened into
 * one anonymous blob.
 */
export async function extractPdfText(data: Uint8Array): Promise<ExtractResult> {
  // The legacy build is the one that runs under Node without a DOM. Imported
  // lazily so it never gets pulled into a browser bundle.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
  });

  const pages: PageText[] = [];
  let totalChars = 0;
  let pageCount = 0;

  try {
    const doc = await loadingTask.promise;
    pageCount = doc.numPages;

    for (let n = 1; n <= pageCount; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      const text = itemsToLines(content.items);
      pages.push({ page: n, text });
      totalChars += text.length;
      page.cleanup();
    }
  } finally {
    // Releases the worker. Lives on the loading task, not the document.
    await loadingTask.destroy();
  }

  const charsPerPage = pageCount > 0 ? totalChars / pageCount : 0;
  if (charsPerPage < MIN_CHARS_PER_PAGE) {
    throw new NoTextLayerError(charsPerPage);
  }

  return { pages, pageCount, charsPerPage };
}

type TextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
};

/**
 * pdfjs hands back positioned text fragments, not lines. Reassembling lines
 * matters because the clause splitter reads line starts to find headings —
 * "4.2 Limitation of Liability" is only recognisable as a heading if it is
 * still at the beginning of a line.
 */
type Fragment = { x: number; width: number; height: number; str: string };

function itemsToLines(items: unknown[]): string {
  const rows = new Map<number, Fragment[]>();

  for (const raw of items) {
    const item = raw as TextItem;
    if (typeof item.str !== "string" || item.str.length === 0) continue;
    if (!Array.isArray(item.transform)) continue;

    const x = item.transform[4];
    const y = item.transform[5];
    // Round the baseline so fragments on the same visual line group together
    // despite sub-pixel differences.
    const key = Math.round(y / 2) * 2;

    const fragment: Fragment = {
      x,
      width: item.width ?? 0,
      height: item.height ?? 10,
      str: item.str,
    };

    const row = rows.get(key);
    if (row) row.push(fragment);
    else rows.set(key, [fragment]);
  }

  // PDF y-coordinates increase upward, so descending y is top-to-bottom.
  const ordered = [...rows.entries()].sort((a, b) => b[0] - a[0]);

  return ordered
    .map(([, fragments]) => joinFragments(fragments))
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Joins fragments left to right, inserting a space where the horizontal gap is
 * wide enough to be a real one. PDFs emit no spaces of their own — two columns
 * on the same baseline would otherwise be glued together into one nonsense word,
 * which then defeats the heading patterns the clause splitter relies on.
 */
function joinFragments(fragments: Fragment[]): string {
  const sorted = fragments.sort((a, b) => a.x - b.x);
  let line = "";
  let previousEnd: number | null = null;

  for (const f of sorted) {
    if (previousEnd !== null) {
      const gap = f.x - previousEnd;
      const threshold = Math.max(1, f.height * 0.2);
      if (gap > threshold && !/\s$/.test(line) && !/^\s/.test(f.str)) {
        line += " ";
      }
    }
    line += f.str;
    previousEnd = f.x + f.width;
  }

  return line.replace(/\s+/g, " ").trim();
}
