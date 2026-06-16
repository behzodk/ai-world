import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Safe to use in Client Components ("use client").
// Reads the public env vars, which are inlined into the client bundle at build time.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
