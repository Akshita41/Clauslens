import { createClient } from "./server";
import type { Contract } from "@/lib/types";
import { EXTRACTION_FIELDS } from "@/lib/ai/schemas";

/** Database rows are snake_case; the UI works in the shapes in lib/types.ts. */
type ContractRow = {
  id: string;
  filename: string;
  title: string | null;
  counterparty: string | null;
  page_count: number | null;
  clause_count: number;
  status: Contract["status"];
  split_fallback: boolean;
  created_at: string;
};

function toContract(row: ContractRow): Contract {
  return {
    id: row.id,
    filename: row.filename,
    // Until the pipeline reads the document, the filename is all we know.
    title: row.title ?? row.filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "),
    counterparty: row.counterparty ?? "Not identified yet",
    pageCount: row.page_count ?? 0,
    clauseCount: row.clause_count,
    status: row.status,
    createdAt: row.created_at,
    splitFallback: row.split_fallback,
  };
}

export async function listContracts(): Promise<Contract[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select(
      "id, filename, title, counterparty, page_count, clause_count, status, split_fallback, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toContract);
}

export async function getContract(id: string): Promise<Contract | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select(
      "id, filename, title, counterparty, page_count, clause_count, status, split_fallback, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toContract(data) : null;
}

type ClauseRow = {
  id: string;
  clause_no: string | null;
  heading: string;
  text: string;
  page: number;
};

export async function listClauses(contractId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clauses")
    .select("id, clause_no, heading, text, page")
    .eq("contract_id", contractId)
    .order("char_start", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: ClauseRow) => ({
    id: row.id,
    clauseNo: row.clause_no,
    heading: row.heading,
    text: row.text,
    page: row.page,
  }));
}

type ExtractionRow = {
  id: string;
  field_name: string;
  value: string | null;
  confidence: "high" | "medium" | "low" | null;
  clause_id: string | null;
};

export async function listExtractions(contractId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extractions")
    .select("id, field_name, value, confidence, clause_id")
    .eq("contract_id", contractId);

  if (error) throw error;

  const byField = new Map(
    (data ?? []).map((row: ExtractionRow) => [row.field_name, row]),
  );

  // Always return all eight fields in display order, so a term the model never
  // answered still shows up as "not found" rather than silently disappearing.
  return EXTRACTION_FIELDS.map((field) => {
    const row = byField.get(field.name);
    return {
      id: row?.id ?? field.name,
      fieldName: field.name,
      label: field.label,
      value: row?.value ?? null,
      confidence: row?.confidence ?? "low",
      clauseId: row?.clause_id ?? null,
    };
  });
}

export async function hasExtractions(contractId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("extractions")
    .select("id", { count: "exact", head: true })
    .eq("contract_id", contractId);

  if (error) throw error;
  return (count ?? 0) > 0;
}
