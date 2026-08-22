import { createClient } from "./server";
import type { Contract } from "@/lib/types";

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
