import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Clause } from "@/lib/types";
import { costOf, getClient, MODELS, type Usage } from "./client";
import { ExtractionResponseSchema, type ExtractedField } from "./schemas";
import {
  buildInstruction,
  PROMPT_VERSION,
  renderDocument,
  SYSTEM_PROMPT,
} from "./prompts/extract.v1";
import { buildCorrection, stripUncitedFields, verifyCitations } from "./verify";

export type ExtractionRun = {
  fields: ExtractedField[];
  promptVersion: string;
  model: string;
  costUsd: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  /** How many attempts citation verification needed. 2 means one retry. */
  attempts: number;
  /** Fields that still could not be cited after the retry. */
  uncited: string[];
};

export async function extractDealTerms(
  clauses: Clause[],
): Promise<ExtractionRun> {
  const client = getClient();
  const validIds = new Set(clauses.map((c) => c.id));
  const started = Date.now();

  let cost = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          // The contract is the stable part of the prompt, so it sits behind
          // the cache breakpoint: a retry, or a later stage asking about the
          // same document, reads it back at a tenth of the price.
          text: `<untrusted_document>\n${renderDocument(clauses)}\n</untrusted_document>`,
          cache_control: { type: "ephemeral" },
        },
        { type: "text", text: buildInstruction() },
      ],
    },
  ];

  const call = async () => {
    const response = await client.messages.parse({
      model: MODELS.extract,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages,
      output_config: { format: zodOutputFormat(ExtractionResponseSchema) },
    });

    const usage = response.usage as Usage;
    cost += costOf(MODELS.extract, usage);
    inputTokens +=
      usage.input_tokens +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0);
    outputTokens += usage.output_tokens;

    if (!response.parsed_output) {
      throw new Error("Claude returned a response that did not match the schema.");
    }
    return response;
  };

  let attempts = 1;
  const first = await call();
  let fields = first.parsed_output!.fields;

  let check = verifyCitations(fields, validIds);

  if (!check.ok) {
    // One retry, with the exact violations quoted back. Any more than one and
    // the cost of chasing a citation exceeds the value of getting it.
    attempts = 2;
    messages.push(
      { role: "assistant", content: JSON.stringify(first.parsed_output) },
      { role: "user", content: buildCorrection(check.violations) },
    );
    const second = await call();
    fields = second.parsed_output!.fields;
    check = verifyCitations(fields, validIds);
  }

  const uncited = check.violations.map((v) => v.field);
  if (!check.ok) fields = stripUncitedFields(fields, validIds);

  return {
    fields,
    promptVersion: PROMPT_VERSION,
    model: MODELS.extract,
    costUsd: cost,
    latencyMs: Date.now() - started,
    inputTokens,
    outputTokens,
    attempts,
    uncited,
  };
}
