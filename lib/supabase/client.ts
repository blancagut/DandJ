import { createBrowserClient } from "@supabase/ssr"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Returns a singleton Supabase browser client that stores the session in cookies
 * (via @supabase/ssr) so that API routes using getSupabaseServerClient() can read
 * the same session from the request cookies and authenticate the user server-side.
 */
export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  browserClient = createBrowserClient(url, anonKey)
  return browserClient
}
