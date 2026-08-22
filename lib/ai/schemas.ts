import { z } from "zod";

/** The eight deal terms ClauseLens extracts. Order is the display order. */
export const EXTRACTION_FIELDS = [
  { name: "parties", label: "Parties" },
  { name: "effective_date", label: "Effective date" },
  { name: "term_length", label: "Term length" },
  { name: "renewal", label: "Renewal" },
  { name: "termination_notice", label: "Termination notice" },
  { name: "liability_cap", label: "Liability cap" },
  { name: "indemnity", label: "Indemnity" },
  { name: "governing_law", label: "Governing law" },
] as const;

export const FIELD_NAMES = EXTRACTION_FIELDS.map((f) => f.name);

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  EXTRACTION_FIELDS.map((f) => [f.name, f.label]),
);

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);

export const ExtractedFieldSchema = z.object({
  field_name: z.enum(
    FIELD_NAMES as [string, ...string[]],
  ),
  /** Null when the contract genuinely does not address this term. */
  value: z.string().nullable(),
  /** Must name a clause from the supplied document whenever value is not null. */
  clause_id: z.string().nullable(),
  confidence: ConfidenceSchema,
});

export const ExtractionResponseSchema = z.object({
  fields: z.array(ExtractedFieldSchema),
});

export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;
