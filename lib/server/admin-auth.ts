import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"

function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) return false
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS)
  // If ADMIN_EMAILS is not set, allow any authenticated user.
  if (allowlist.size === 0) return true
  return allowlist.has(user.email.toLowerCase())
}

/**
 * Authenticates and authorises an admin from an API route request.
 * 1. First checks for `Authorization: Bearer <jwt>` header (works in all
 *    environments — the browser client always sends this).
 * 2. Falls back to cookie-based session reading (via @supabase/ssr).
 *
 * Throws on auth failure so callers can catch and return 401.
 */
export async function requireAdminFromRequest(request: NextRequest | Request): Promise<User> {
  // ── Strategy 1: Bearer token from Authorization header ──────────────────
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (!user) throw new Error("Not authenticated")
    if (!isAdminUser(user)) throw new Error("Not authorized")
    return user
  }

  // ── Strategy 2: Cookie-based session (fallback) ──────────────────────────
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  if (!isAdminUser(user)) throw new Error("Not authorized")
  return user
}
