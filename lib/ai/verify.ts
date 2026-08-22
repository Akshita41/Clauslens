import type { ExtractedField } from "./schemas";

/**
 * Citation verification.
 *
 * zod proves the response has the right *shape*. It cannot prove the clause id
 * inside it refers to a clause that exists in this contract — a model can
 * return a perfectly well-formed citation to a clause it invented, and a
 * schema will wave it through.
 *
 * So every clause_id is checked against the clauses actually supplied. Anything
 * that does not resolve is a hard failure, not a warning: the caller retries
 * once with the violations quoted back, and if the second attempt still cannot
 * cite, the field is reported as not found rather than shown to a user with a
 * citation that goes nowhere.
 */

export type Violation = {
  field: string;
  problem: "unknown_clause" | "missing_citation";
  detail: string;
};

export type VerificationResult = {
  ok: boolean;
  violations: Violation[];
};

export function verifyCitations(
  fields: ExtractedField[],
  validClauseIds: Set<string>,
): VerificationResult {
  const violations: Violation[] = [];

  for (const field of fields) {
    // "Not in this contract" is a legitimate answer and needs no citation.
    if (field.value === null) continue;

    if (!field.clause_id) {
      violations.push({
        field: field.field_name,
        problem: "missing_citation",
        detail: `"${field.field_name}" has a value but cites no clause.`,
      });
      continue;
    }

    if (!validClauseIds.has(field.clause_id)) {
      violations.push({
        field: field.field_name,
        problem: "unknown_clause",
        detail: `"${field.field_name}" cites clause_id ${field.clause_id}, which is not in this contract.`,
      });
    }
  }

  return { ok: violations.length === 0, violations };
}

/** The correction message sent back to the model on the single retry. */
export function buildCorrection(violations: Violation[]): string {
  const list = violations.map((v) => `- ${v.detail}`).join("\n");
  return `Your previous answer had citation problems:

${list}

Answer again. Every value must cite a clause_id that appears in the document above, exactly as written. If you cannot point to a specific clause for a term, set both its value and clause_id to null — that is a correct answer, not a failure.`;
}

/**
 * Last resort after the retry. Rather than dropping an uncitable value into the
 * UI, the field is reported as absent — the user sees "not found in this
 * contract", which is honest, instead of a confident value they cannot check.
 */
export function stripUncitedFields(
  fields: ExtractedField[],
  validClauseIds: Set<string>,
): ExtractedField[] {
  return fields.map((field) => {
    if (field.value === null) return field;
    if (field.clause_id && validClauseIds.has(field.clause_id)) return field;
    return { ...field, value: null, clause_id: null, confidence: "low" as const };
  });
}
