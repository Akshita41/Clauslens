import Anthropic from "@anthropic-ai/sdk";

/**
 * Model choice follows the plan: Haiku for extraction, which is reading rather
 * than judgement, and Sonnet reserved for risk reasoning where the analysis
 * actually has to weigh things up.
 */
export const MODELS = {
  extract: "claude-haiku-4-5",
  risk: "claude-sonnet-5",
} as const;

/** USD per million tokens. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
  "claude-sonnet-5": { input: 3.0, output: 15.0 },
};

let client: Anthropic | null = null;

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
    );
  }
  client ??= new Anthropic();
  return client;
}

export type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/**
 * Cost of a single call, in USD.
 *
 * Cached reads bill at roughly a tenth of the input rate and cache writes at
 * about 1.25x — which is the whole reason the contract text sits behind a
 * cache breakpoint. Reported so the accuracy page can show a real number
 * rather than an estimate.
 */
export function costOf(model: string, usage: Usage): number {
  const price = PRICING[model];
  if (!price) return 0;

  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;

  const inputCost =
    (usage.input_tokens * price.input +
      cacheWrite * price.input * 1.25 +
      cacheRead * price.input * 0.1) /
    1_000_000;

  const outputCost = (usage.output_tokens * price.output) / 1_000_000;
  return inputCost + outputCost;
}
