/**
 * Admin fetch utility — automatically injects `Authorization: Bearer <jwt>`
 * into every request so admin API routes can authenticate the session even
 * when it is stored in localStorage rather than cookies.
 *
 * Usage (drop-in replacement for fetch() in admin components):
 *   const res = await adminFetch("/api/admin/send-email", { method: "POST", body: ... })
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` }
    }
  } catch {
    // No session available — request will fall back to cookie auth
  }
  return {}
}

export async function adminFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders()
  return fetch(url, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers ?? {}),
    },
  })
}
