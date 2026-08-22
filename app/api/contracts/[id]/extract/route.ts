import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDealTerms } from "@/lib/ai/extract";

export const maxDuration = 60;

/**
 * Step two of the pipeline: read the stored clauses and pull out the eight
 * deal terms, each citing the clause it came from.
 */
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: clauseRows, error: clauseError } = await supabase
    .from("clauses")
    .select("id, clause_no, heading, text, page")
    .eq("contract_id", id)
    .order("char_start", { ascending: true });

  if (clauseError) {
    return NextResponse.json({ error: clauseError.message }, { status: 500 });
  }
  if (!clauseRows || clauseRows.length === 0) {
    return NextResponse.json(
      { error: "This contract has no clauses yet. Parse it first." },
      { status: 400 },
    );
  }

  const clauses = clauseRows.map((row) => ({
    id: row.id,
    clauseNo: row.clause_no,
    heading: row.heading,
    text: row.text,
    page: row.page,
  }));

  await supabase.from("contracts").update({ status: "extracting" }).eq("id", id);

  try {
    const run = await extractDealTerms(clauses);

    await supabase.from("extractions").delete().eq("contract_id", id);

    const { error: insertError } = await supabase.from("extractions").insert(
      run.fields.map((f) => ({
        contract_id: id,
        field_name: f.field_name,
        value: f.value,
        confidence: f.confidence,
        clause_id: f.clause_id,
      })),
    );

    if (insertError) {
      await supabase
        .from("contracts")
        .update({ status: "failed", error_message: insertError.message })
        .eq("id", id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("contracts")
      .update({ status: "ready", error_message: null })
      .eq("id", id);

    return NextResponse.json({
      fields: run.fields.length,
      found: run.fields.filter((f) => f.value !== null).length,
      costUsd: run.costUsd,
      latencyMs: run.latencyMs,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      attempts: run.attempts,
      uncited: run.uncited,
      model: run.model,
      promptVersion: run.promptVersion,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Extraction failed.";
    await supabase
      .from("contracts")
      .update({ status: "failed", error_message: message })
      .eq("id", id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
