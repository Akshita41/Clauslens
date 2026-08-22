import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for React components running in the browser.
 * Uses the publishable key, which is safe to ship: every table it can reach
 * is protected by the row-level security policies in the migration.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
