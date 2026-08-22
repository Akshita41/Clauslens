export type ContractStatus =
  | "uploaded"
  | "parsing"
  | "extracting"
  | "analyzing"
  | "ready"
  | "failed";

export type Severity = "OK" | "CAUTION" | "HIGH_RISK";
export type Confidence = "high" | "medium" | "low";
export type HumanVerdict = "accepted" | "rejected" | null;

export type Clause = {
  id: string;
  clauseNo: string | null;
  heading: string;
  text: string;
  page: number;
};

export type Contract = {
  id: string;
  filename: string;
  title: string;
  counterparty: string;
  pageCount: number;
  clauseCount: number;
  status: ContractStatus;
  createdAt: string;
  /** Why parsing failed, shown instead of a bare Failed badge. */
  errorMessage?: string | null;
  /** true when the clause splitter fell back to paragraph chunking */
  splitFallback?: boolean;
};

export type Extraction = {
  id: string;
  fieldName: string;
  label: string;
  value: string | null;
  confidence: Confidence;
  clauseId: string | null;
};

export type RiskFlag = {
  id: string;
  clauseId: string;
  severity: Severity;
  reason: string;
  ruleId: string;
  ruleTitle: string;
  standardPosition: string;
  confidence: Confidence;
  humanVerdict: HumanVerdict;
};

export type Citation = {
  clauseId: string;
  clauseNo: string | null;
  heading: string;
  page: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  /** clauses the retriever surfaced, in fused rank order */
  retrieved?: { clauseId: string; heading: string; score: number }[];
  notFound?: boolean;
};

export type FieldAccuracy = {
  fieldName: string;
  label: string;
  correct: number;
  total: number;
};

export type EvalRun = {
  id: string;
  label: string;
  date: string;
  model: string;
  contracts: number;
  fields: FieldAccuracy[];
  totalCostUsd: number;
  avgLatencyMs: number;
  misses: {
    contract: string;
    field: string;
    expected: string;
    actual: string;
  }[];
};
