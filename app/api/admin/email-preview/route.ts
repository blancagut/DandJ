import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import { buildBrandedEmail } from "@/lib/server/email-template"

async function requireAdmin() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  if (!isAdminUser(user)) throw new Error("Not authorized")
  return user
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { subject, bodyHtml } = await request.json()

  if (!subject || !bodyHtml) {
    return NextResponse.json({ error: "Missing subject or bodyHtml" }, { status: 400 })
  }

  const html = buildBrandedEmail(subject, bodyHtml)

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
