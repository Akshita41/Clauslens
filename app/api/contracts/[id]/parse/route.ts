import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractPdfText, NoTextLayerError } from "@/lib/pdf/extract";
import { splitIntoClauses } from "@/lib/clauses/split";

export const maxDuration = 60;

/**
 * Step one of the pipeline: read the PDF, split it into clauses, store them.
 *
 * Runs as its own request rather than inside a job queue. A single contract
 * parses in a few seconds, the client drives the steps in sequence and polls
 * status, and there is no infrastructure to operate. That stops being enough
 * with concurrent users or very long contracts — at which point the answer is
 * a queue, deliberately not built yet.
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

  // RLS already scopes this to the signed-in user; if the row comes back at
  // all, it is theirs.
  const { data: contract, error: loadError } = await supabase
    .from("contracts")
    .select("id, storage_path, status")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const fail = async (message: string, status = 400) => {
    await supabase
      .from("contracts")
      .update({ status: "failed", error_message: message })
      .eq("id", id);
    return NextResponse.json({ error: message }, { status });
  };

  await supabase.from("contracts").update({ status: "parsing" }).eq("id", id);

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from("contracts")
      .download(contract.storage_path);

    if (downloadError || !file) {
      return await fail("Could not read the uploaded file from storage.", 500);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { pages, pageCount } = await extractPdfText(bytes);
    const { clauses, fallback } = splitIntoClauses(pages);

    if (clauses.length === 0) {
      return await fail("No readable text was found in this PDF.");
    }

    // Re-parsing replaces the previous split rather than duplicating it.
    await supabase.from("clauses").delete().eq("contract_id", id);

    const { error: insertError } = await supabase.from("clauses").insert(
      clauses.map((c) => ({
        contract_id: id,
        clause_no: c.clauseNo,
        heading: c.heading,
        text: c.text,
        page: c.page,
        char_start: c.charStart,
        char_end: c.charEnd,
      })),
    );

    if (insertError) return await fail(insertError.message, 500);

    await supabase
      .from("contracts")
      .update({
        status: "ready",
        page_count: pageCount,
        clause_count: clauses.length,
        split_fallback: fallback,
        error_message: null,
      })
      .eq("id", id);

    return NextResponse.json({
      pageCount,
      clauseCount: clauses.length,
      fallback,
    });
  } catch (error) {
    if (error instanceof NoTextLayerError) return await fail(error.message);
    const message =
      error instanceof Error ? error.message : "Could not read this PDF.";
    return await fail(message, 500);
  }
}
