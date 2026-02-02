import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import { listWorkItems } from "@/lib/server/work-items"

export const dynamic = "force-dynamic"

export async function GET() {
  const env = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    adminEmails: Boolean(process.env.ADMIN_EMAILS),
  }

  let authError: string | null = null
  let userEmail: string | null = null
  let isAdmin = false

  try {
    const supabase = getSupabaseServerClient()
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
