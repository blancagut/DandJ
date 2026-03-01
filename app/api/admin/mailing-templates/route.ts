import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminFromRequest } from "@/lib/server/admin-auth"

type TemplateType = "campaign" | "header" | "footer"
type TemplateLanguage = "ES" | "EN"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function validatePayload(payload: Record<string, unknown>) {
  const name = String(payload.name ?? "").trim()
  const templateType = String(payload.templateType ?? "") as TemplateType
  const language = String(payload.language ?? "") as TemplateLanguage
  const audience = String(payload.audience ?? "All").trim() || "All"
  const subject = String(payload.subject ?? "").trim()
  const bodyHtml = String(payload.bodyHtml ?? "").trim()
  const sortOrderRaw = payload.sortOrder
  const sortOrder = typeof sortOrderRaw === "number" ? sortOrderRaw : parseInt(String(sortOrderRaw ?? "0"), 10)

  if (!name) throw new Error("Missing template name")
  if (!["campaign", "header", "footer"].includes(templateType)) {
    throw new Error("Invalid template type")
  }
  if (!["ES", "EN"].includes(language)) {
    throw new Error("Invalid language")
  }
  if (!bodyHtml) throw new Error("Missing body HTML")

  return {
    name,
    templateType,
    language,
    audience,
    subject,
    bodyHtml,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from("mailing_templates")
    .select("id, name, template_type, audience, language, subject, body_html, sort_order, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>
    const validated = validatePayload(payload)

    const db = getServiceClient()
    const { data, error } = await db
      .from("mailing_templates")
      .insert({
        name: validated.name,
        template_type: validated.templateType,
        audience: validated.audience,
        language: validated.language,
        subject: validated.subject,
        body_html: validated.bodyHtml,
        sort_order: validated.sortOrder,
        created_by: user.email ?? null,
      })
      .select("id, name, template_type, audience, language, subject, body_html, sort_order, is_active, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>
    const id = String(payload.id ?? "").trim()
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const validated = validatePayload(payload)

    const db = getServiceClient()
    const { data, error } = await db
      .from("mailing_templates")
      .update({
        name: validated.name,
        template_type: validated.templateType,
        audience: validated.audience,
        language: validated.language,
        subject: validated.subject,
        body_html: validated.bodyHtml,
        sort_order: validated.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, template_type, audience, language, subject, body_html, sort_order, is_active, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const db = getServiceClient()
  const { error } = await db
    .from("mailing_templates")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
