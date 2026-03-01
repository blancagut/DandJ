/**
 * Admin fetch utility — automatically injects `Authorization: Bearer <jwt>`
 * into every request so admin API routes can authenticate the session even
 * when it is stored in localStorage rather than cookies.
 *
 * Usage (drop-in replacement for fetch() in admin components):
 *   const res = await adminFetch("/api/admin/send-email", { method: "POST", body: ... })
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type AdminFetchOptions = RequestInit & {
  timeoutMs?: number
}

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
  init: AdminFetchOptions = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders()
  const { timeoutMs = 30000, ...requestInit } = init

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  if (requestInit.signal) {
    requestInit.signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true },
    )
  }

  try {
    return await fetch(url, {
      ...requestInit,
      signal: controller.signal,
      headers: {
        ...authHeaders,
        ...(requestInit.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timeoutId)
  }
}
