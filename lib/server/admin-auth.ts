import type { User } from "@supabase/supabase-js"

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

  // If ADMIN_EMAILS is not set, allow any authenticated user (simple default).
  if (allowlist.size === 0) return true

  return allowlist.has(user.email.toLowerCase())
}
