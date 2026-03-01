import { NextRequest, NextResponse } from "next/server"
import { requireAdminFromRequest } from "@/lib/server/admin-auth"
import { buildBrandedEmail } from "@/lib/server/email-template"

export async function POST(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { subject, bodyHtml } = await request.json()

  if (!subject || !bodyHtml) {
    return NextResponse.json({ error: "Missing subject or bodyHtml" }, { status: 400 })
  }

  const html = buildBrandedEmail(subject, bodyHtml, {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL,
    preheader: subject,
    supportPhone: process.env.FIRM_PHONE,
    supportEmail: process.env.FIRM_SUPPORT_EMAIL || process.env.LEADS_TO_EMAIL,
    unsubscribeUrl: process.env.MARKETING_UNSUBSCRIBE_URL,
  })

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
