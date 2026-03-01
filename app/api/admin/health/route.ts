import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import { listWorkItems } from "@/lib/server/work-items"

export const dynamic = "force-dynamic"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

function looksLikeEmail(raw: string | undefined): boolean {
  if (!raw) return false
  return EMAIL_REGEX.test(raw.trim())
}

export async function GET() {
  const env = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    adminEmails: Boolean(process.env.ADMIN_EMAILS),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    resendFromEmail: Boolean(process.env.RESEND_FROM_EMAIL),
    leadsToEmail: Boolean(process.env.LEADS_TO_EMAIL),
  }

  const resend = {
    fromEmail: process.env.RESEND_FROM_EMAIL ?? null,
    fromEmailLooksValid: looksLikeEmail(process.env.RESEND_FROM_EMAIL),
    usingResendOnboardingFrom: (process.env.RESEND_FROM_EMAIL ?? "").trim().toLowerCase() === "onboarding@resend.dev",
    leadsToEmail: process.env.LEADS_TO_EMAIL ?? null,
    leadsToEmailLooksValid: looksLikeEmail(process.env.LEADS_TO_EMAIL),
  }

  let authError: string | null = null
  let userEmail: string | null = null
  let isAdmin = false

  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      authError = error.message
    } else if (user?.email) {
      userEmail = user.email
      isAdmin = isAdminUser(user)
    }
  } catch (e) {
    authError = e instanceof Error ? e.message : "Auth check failed"
  }

  let dbOk: boolean | null = null
  let dbError: string | null = null

  if (env.serviceRoleKey && env.supabaseUrl) {
    try {
      await listWorkItems()
      dbOk = true
    } catch (e) {
      dbOk = false
      dbError = e instanceof Error ? e.message : "DB check failed"
    }
  } else {
    dbOk = null
    dbError = "Missing service role or Supabase URL"
  }

  const ok = env.supabaseUrl && env.supabaseAnonKey && dbOk !== false

  return NextResponse.json({
    ok,
    env,
    resend,
    auth: {
      userEmail,
      isAdmin,
      error: authError,
    },
    db: {
      ok: dbOk,
      error: dbError,
    },
  })
}
