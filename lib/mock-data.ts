import type {
  ChatMessage,
  Clause,
  Contract,
  EvalRun,
  Extraction,
  RiskFlag,
} from "./types";

/* ------------------------------------------------------------------ *
 * MOCK DATA — placeholder only.
 * Every export here gets replaced by a Supabase query once the backend
 * lands. Nothing else in the UI should need to change when it does:
 * the shapes match `lib/types.ts`, which matches the database schema.
 * ------------------------------------------------------------------ */

export const contracts: Contract[] = [
  {
    id: "msa-brightharbor",
    filename: "BrightHarbor_MSA_executed.pdf",
    title: "Master Services Agreement",
    counterparty: "Bright Harbor Technologies, Inc.",
    pageCount: 14,
    clauseCount: 31,
    status: "ready",
    createdAt: "2026-08-21T09:12:00Z",
  },
  {
    id: "nda-lumen",
    filename: "Lumen_Mutual_NDA.pdf",
    title: "Mutual Non-Disclosure Agreement",
    counterparty: "Lumen Analytics Ltd.",
    pageCount: 6,
    clauseCount: 18,
    status: "ready",
    createdAt: "2026-08-20T16:40:00Z",
  },
  {
    id: "saas-verdant",
    filename: "Verdant_SaaS_Order_Form.pdf",
    title: "SaaS Subscription Agreement",
    counterparty: "Verdant Systems B.V.",
    pageCount: 11,
    clauseCount: 24,
    status: "analyzing",
    createdAt: "2026-08-22T08:05:00Z",
  },
  {
    id: "sow-atelier",
    filename: "Atelier_SOW_Q3.pdf",
    title: "Statement of Work",
    counterparty: "Atelier Creative Partners",
    pageCount: 5,
    clauseCount: 9,
    status: "ready",
    createdAt: "2026-08-18T11:22:00Z",
    splitFallback: true,
  },
  {
    id: "lease-fieldstone",
    filename: "Fieldstone_Office_Lease.pdf",
    title: "Commercial Office Lease",
    counterparty: "Fieldstone Property Group",
    pageCount: 22,
    clauseCount: 0,
    status: "failed",
    createdAt: "2026-08-17T14:03:00Z",
  },
];

export const clauses: Clause[] = [
  {
    id: "c-01",
    clauseNo: "1.1",
    heading: "Definitions",
    text: '"Services" means the professional services described in each Statement of Work executed by the parties under this Agreement. "Deliverables" means any work product, report, design, or software created by Provider in the course of performing the Services. "Confidential Information" means non-public information disclosed by either party that is designated as confidential or that a reasonable person would understand to be confidential given the nature of the information.',
    page: 1,
  },
  {
    id: "c-02",
    clauseNo: "2.1",
    heading: "Engagement",
    text: "Client engages Provider, and Provider accepts the engagement, to perform the Services in accordance with the terms of this Agreement and each applicable Statement of Work. Each Statement of Work shall be deemed incorporated into this Agreement by reference upon execution by both parties.",
    page: 2,
  },
  {
    id: "c-03",
    clauseNo: "3.1",
    heading: "Term",
    text: "This Agreement shall commence on the Effective Date and shall continue for an initial period of twenty-four (24) months (the “Initial Term”), unless earlier terminated in accordance with Section 9.",
    page: 2,
  },
  {
    id: "c-04",
    clauseNo: "3.2",
    heading: "Renewal",
    text: "Upon expiry of the Initial Term, this Agreement shall automatically renew for successive periods of twelve (12) months each (each, a “Renewal Term”) unless either party provides written notice of non-renewal not less than ninety (90) days prior to the end of the then-current term. Fees for any Renewal Term may be increased by Provider at its sole discretion upon notice to Client.",
    page: 3,
  },
  {
    id: "c-05",
    clauseNo: "4.2",
    heading: "Fees and Payment",
    text: "Client shall pay all undisputed invoices within thirty (30) days of receipt. Amounts not paid when due shall accrue interest at the rate of one and one-half percent (1.5%) per month or the maximum rate permitted by applicable law, whichever is lower.",
    page: 4,
  },
  {
    id: "c-06",
    clauseNo: "6.1",
    heading: "Confidentiality",
    text: "Each party shall hold the other party's Confidential Information in strict confidence and shall not disclose it to any third party without prior written consent, except to its employees, contractors and advisors who have a need to know and who are bound by confidentiality obligations no less protective than those set out herein. These obligations shall survive termination of this Agreement for a period of five (5) years.",
    page: 6,
  },
  {
    id: "c-07",
    clauseNo: "7.3",
    heading: "Intellectual Property",
    text: "Upon full payment of all applicable fees, Provider assigns to Client all right, title and interest in and to the Deliverables, excluding any pre-existing materials, tools, libraries or know-how of Provider (“Provider Background IP”), which shall remain the sole property of Provider. Provider grants Client a perpetual, non-exclusive licence to use Provider Background IP solely as embedded in the Deliverables.",
    page: 7,
  },
  {
    id: "c-08",
    clauseNo: "8.1",
    heading: "Limitation of Liability",
    text: "EXCEPT FOR A PARTY'S INDEMNIFICATION OBLIGATIONS UNDER SECTION 8.4 AND BREACHES OF SECTION 6, IN NO EVENT SHALL PROVIDER'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL FEES PAID BY CLIENT TO PROVIDER IN THE TWENTY-FOUR (24) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.",
    page: 8,
  },
  {
    id: "c-09",
    clauseNo: "8.4",
    heading: "Indemnification",
    text: "Client shall defend, indemnify and hold harmless Provider, its affiliates, officers, directors and employees from and against any and all claims, damages, losses, liabilities, costs and expenses (including reasonable attorneys' fees) arising out of or relating to Client's use of the Deliverables, without limitation as to amount. Provider's indemnification obligations to Client are limited to claims of third-party intellectual property infringement and are subject to the cap in Section 8.1.",
    page: 8,
  },
  {
    id: "c-10",
    clauseNo: "9.2",
    heading: "Termination for Convenience",
    text: "Either party may terminate this Agreement for convenience upon one hundred and twenty (120) days' prior written notice to the other party. Client shall remain liable for all fees accrued through the effective date of termination and for any non-cancellable third-party commitments made by Provider in reliance on the applicable Statement of Work.",
    page: 9,
  },
  {
    id: "c-11",
    clauseNo: "10.1",
    heading: "Assignment",
    text: "Neither party may assign or transfer this Agreement, in whole or in part, without the prior written consent of the other party, except that Provider may assign this Agreement without consent to a successor in connection with a merger, acquisition, or sale of all or substantially all of its assets.",
    page: 10,
  },
  {
    id: "c-12",
    clauseNo: "11.4",
    heading: "Governing Law and Jurisdiction",
    text: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles. The parties irrevocably submit to the exclusive jurisdiction of the state and federal courts located in Wilmington, Delaware.",
    page: 12,
  },
  {
    id: "c-13",
    clauseNo: "11.7",
    heading: "Entire Agreement",
    text: "This Agreement, together with all Statements of Work and exhibits, constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior or contemporaneous understandings, whether written or oral.",
    page: 13,
  },
];

export const clauseById = new Map(clauses.map((c) => [c.id, c]));

export const extractions: Extraction[] = [
  {
    id: "e-1",
    fieldName: "parties",
    label: "Parties",
    value:
      "Bright Harbor Technologies, Inc. (Client) and Northwind Studio LLC (Provider)",
    confidence: "high",
    clauseId: "c-02",
  },
  {
    id: "e-2",
    fieldName: "effective_date",
    label: "Effective date",
    value: "March 1, 2026",
    confidence: "high",
    clauseId: "c-03",
  },
  {
    id: "e-3",
    fieldName: "term_length",
    label: "Term length",
    value: "24 months (initial term)",
    confidence: "high",
    clauseId: "c-03",
  },
  {
    id: "e-4",
    fieldName: "renewal",
    label: "Renewal",
    value: "Auto-renews for successive 12-month terms",
    confidence: "high",
    clauseId: "c-04",
  },
  {
    id: "e-5",
    fieldName: "termination_notice",
    label: "Termination notice",
    value: "120 days for convenience; 90 days to prevent auto-renewal",
    confidence: "medium",
    clauseId: "c-10",
  },
  {
    id: "e-6",
    fieldName: "liability_cap",
    label: "Liability cap",
    value: "Fees paid in the preceding 24 months",
    confidence: "high",
    clauseId: "c-08",
  },
  {
    id: "e-7",
    fieldName: "indemnity",
    label: "Indemnity",
    value: "Client indemnifies Provider without limitation as to amount",
    confidence: "medium",
    clauseId: "c-09",
  },
  {
    id: "e-8",
    fieldName: "governing_law",
    label: "Governing law",
    value: "Delaware, USA",
    confidence: "high",
    clauseId: "c-12",
  },
];

export const riskFlags: RiskFlag[] = [
  {
    id: "r-1",
    clauseId: "c-09",
    severity: "HIGH_RISK",
    ruleId: "PB-07",
    ruleTitle: "Indemnity must be capped",
    standardPosition:
      "Any indemnity we give should be subject to the same liability cap as the rest of the agreement.",
    reason:
      "The indemnity you give runs “without limitation as to amount” and sits outside the liability cap in 8.1. Their indemnity back to you is capped and covers IP claims only. That asymmetry means a single customer claim could exceed everything you have earned on the deal.",
    confidence: "high",
    humanVerdict: null,
  },
  {
    id: "r-2",
    clauseId: "c-10",
    severity: "HIGH_RISK",
    ruleId: "PB-03",
    ruleTitle: "Termination notice should be 60 days or fewer",
    standardPosition: "Either party may exit on no more than 60 days' notice.",
    reason:
      "Termination for convenience needs 120 days' notice — double your standard. You would also stay liable for non-cancellable third-party commitments the other side made, which is an open-ended amount you cannot see in advance.",
    confidence: "high",
    humanVerdict: null,
  },
  {
    id: "r-3",
    clauseId: "c-04",
    severity: "CAUTION",
    ruleId: "PB-04",
    ruleTitle: "No auto-renewal with uncapped price increases",
    standardPosition:
      "Auto-renewal is acceptable if the notice window is at least 30 days and price rises are capped.",
    reason:
      "It auto-renews for 12 months at a time and fees may be raised “at Provider's sole discretion.” The 90-day non-renewal window is long, so missing it locks in another year at a price you have not agreed.",
    confidence: "high",
    humanVerdict: null,
  },
  {
    id: "r-4",
    clauseId: "c-08",
    severity: "CAUTION",
    ruleId: "PB-01",
    ruleTitle: "Liability cap should not exceed 12 months of fees",
    standardPosition: "Cap liability at fees paid in the preceding 12 months.",
    reason:
      "The cap is set at 24 months of fees rather than 12. A cap does exist and carve-outs are conventional, so this is a negotiating point rather than a blocker.",
    confidence: "medium",
    humanVerdict: null,
  },
  {
    id: "r-5",
    clauseId: "c-11",
    severity: "CAUTION",
    ruleId: "PB-06",
    ruleTitle: "Assignment rights should be mutual",
    standardPosition:
      "If one side can assign on a change of control, both sides should be able to.",
    reason:
      "Provider can assign the agreement on a merger or asset sale without asking you; you cannot do the same. You could end up contracted to a competitor with no say in it.",
    confidence: "high",
    humanVerdict: null,
  },
  {
    id: "r-6",
    clauseId: "c-06",
    severity: "OK",
    ruleId: "PB-05",
    ruleTitle: "Confidentiality must survive termination",
    standardPosition:
      "Confidentiality obligations survive for at least 3 years after termination.",
    reason:
      "Mutual confidentiality surviving five years past termination, with the usual need-to-know carve-out. This is at or above your standard position.",
    confidence: "high",
    humanVerdict: "accepted",
  },
  {
    id: "r-7",
    clauseId: "c-12",
    severity: "OK",
    ruleId: "PB-02",
    ruleTitle: "Governing law must be a named, familiar jurisdiction",
    standardPosition:
      "Delaware, New York, or England & Wales are acceptable without escalation.",
    reason:
      "Delaware law with exclusive jurisdiction in Wilmington. Named, conventional, and on your acceptable list.",
    confidence: "high",
    humanVerdict: null,
  },
];

export const sampleConversation: ChatMessage[] = [
  {
    id: "m-1",
    role: "user",
    content: "Can they walk away early, and what does it cost me?",
  },
  {
    id: "m-2",
    role: "assistant",
    content:
      "Yes. Either party can terminate for convenience on 120 days' written notice. If they do, you still owe fees accrued up to the termination date, plus any non-cancellable third-party commitments they had already made under the active Statement of Work — that second amount is not capped or disclosed anywhere in the agreement.",
    citations: [
      { clauseId: "c-10", clauseNo: "9.2", heading: "Termination for Convenience", page: 9 },
      { clauseId: "c-05", clauseNo: "4.2", heading: "Fees and Payment", page: 4 },
    ],
    retrieved: [
      { clauseId: "c-10", heading: "Termination for Convenience", score: 0.032 },
      { clauseId: "c-04", heading: "Renewal", score: 0.026 },
      { clauseId: "c-05", heading: "Fees and Payment", score: 0.021 },
      { clauseId: "c-03", heading: "Term", score: 0.017 },
    ],
  },
];

export const suggestedQuestions = [
  "Can they walk away early, and what does it cost me?",
  "What happens to the IP in the deliverables?",
  "Is the liability cap mutual?",
  "What is the notice window to stop auto-renewal?",
];

export const evalRuns: EvalRun[] = [
  {
    id: "run-2026-08-21",
    label: "extract.v3 — tightened date instructions",
    date: "2026-08-21T18:30:00Z",
    model: "claude-haiku-4-5",
    contracts: 5,
    fields: [
      { fieldName: "parties", label: "Parties", correct: 5, total: 5 },
      { fieldName: "effective_date", label: "Effective date", correct: 5, total: 5 },
      { fieldName: "term_length", label: "Term length", correct: 4, total: 5 },
      { fieldName: "renewal", label: "Renewal", correct: 5, total: 5 },
      { fieldName: "termination_notice", label: "Termination notice", correct: 4, total: 5 },
      { fieldName: "liability_cap", label: "Liability cap", correct: 4, total: 5 },
      { fieldName: "indemnity", label: "Indemnity", correct: 3, total: 5 },
      { fieldName: "governing_law", label: "Governing law", correct: 5, total: 5 },
    ],
    totalCostUsd: 0.21,
    avgLatencyMs: 7400,
    misses: [
      {
        contract: "Verdant_SaaS_Order_Form.pdf",
        field: "Indemnity",
        expected: "Mutual, capped at 12 months of fees",
        actual: "Mutual indemnity (no cap stated)",
      },
      {
        contract: "Atelier_SOW_Q3.pdf",
        field: "Indemnity",
        expected: "None",
        actual: "Client indemnifies Provider",
      },
      {
        contract: "Atelier_SOW_Q3.pdf",
        field: "Term length",
        expected: "Until deliverables accepted",
        actual: "12 months",
      },
      {
        contract: "Lumen_Mutual_NDA.pdf",
        field: "Termination notice",
        expected: "30 days",
        actual: "Not found in this contract",
      },
      {
        contract: "Verdant_SaaS_Order_Form.pdf",
        field: "Liability cap",
        expected: "€50,000",
        actual: "Fees paid in preceding 12 months",
      },
    ],
  },
  {
    id: "run-2026-08-19",
    label: "extract.v2 — added clause-citation requirement",
    date: "2026-08-19T21:10:00Z",
    model: "claude-haiku-4-5",
    contracts: 5,
    fields: [
      { fieldName: "parties", label: "Parties", correct: 5, total: 5 },
      { fieldName: "effective_date", label: "Effective date", correct: 3, total: 5 },
      { fieldName: "term_length", label: "Term length", correct: 4, total: 5 },
      { fieldName: "renewal", label: "Renewal", correct: 4, total: 5 },
      { fieldName: "termination_notice", label: "Termination notice", correct: 4, total: 5 },
      { fieldName: "liability_cap", label: "Liability cap", correct: 4, total: 5 },
      { fieldName: "indemnity", label: "Indemnity", correct: 3, total: 5 },
      { fieldName: "governing_law", label: "Governing law", correct: 4, total: 5 },
    ],
    totalCostUsd: 0.19,
    avgLatencyMs: 6900,
    misses: [],
  },
];

/** Playbook rules ship as data, not a CRUD screen. */
export const playbookRules = [
  {
    id: "PB-01",
    title: "Liability cap should not exceed 12 months of fees",
    standardPosition: "Cap liability at fees paid in the preceding 12 months.",
    severityIfViolated: "CAUTION" as const,
  },
  {
    id: "PB-02",
    title: "Governing law must be a named, familiar jurisdiction",
    standardPosition: "Delaware, New York, or England & Wales without escalation.",
    severityIfViolated: "CAUTION" as const,
  },
  {
    id: "PB-03",
    title: "Termination notice should be 60 days or fewer",
    standardPosition: "Either party may exit on no more than 60 days' notice.",
    severityIfViolated: "HIGH_RISK" as const,
  },
  {
    id: "PB-04",
    title: "No auto-renewal with uncapped price increases",
    standardPosition:
      "Auto-renewal is fine if the notice window is 30+ days and price rises are capped.",
    severityIfViolated: "CAUTION" as const,
  },
  {
    id: "PB-05",
    title: "Confidentiality must survive termination",
    standardPosition: "Obligations survive at least 3 years after termination.",
    severityIfViolated: "HIGH_RISK" as const,
  },
  {
    id: "PB-06",
    title: "Assignment rights should be mutual",
    standardPosition: "If one side can assign on change of control, both should.",
    severityIfViolated: "CAUTION" as const,
  },
  {
    id: "PB-07",
    title: "Indemnity must be capped",
    standardPosition: "Any indemnity given is subject to the liability cap.",
    severityIfViolated: "HIGH_RISK" as const,
  },
];
