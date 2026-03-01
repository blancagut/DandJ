import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { uploadLeadFile } from "@/lib/server/blob"

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let body: { data?: unknown; contactName?: unknown; contactEmail?: unknown; contactPhone?: unknown } = {}
    let signaturePhoto: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const rawPayload = formData.get("payload")
      if (typeof rawPayload === "string") {
        body = JSON.parse(rawPayload) as typeof body
      }
      const maybeFile = formData.get("signaturePhoto")
      signaturePhoto = maybeFile instanceof File ? maybeFile : null
    } else {
      body = await request.json()
    }

    const { data, contactName, contactEmail, contactPhone } = body

    if (!data || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const submissionId = crypto.randomUUID()
    const dataRecord = data && typeof data === "object" ? (data as Record<string, unknown>) : {}

    if (signaturePhoto) {
      const uploaded = await uploadLeadFile({ leadId: submissionId, file: signaturePhoto })
      const h2bIntake =
        dataRecord.h2bIntake && typeof dataRecord.h2bIntake === "object"
          ? (dataRecord.h2bIntake as Record<string, unknown>)
          : {}
      const priorSignature =
        h2bIntake.signature && typeof h2bIntake.signature === "object"
          ? (h2bIntake.signature as Record<string, unknown>)
          : {}

      h2bIntake.signature = {
        ...priorSignature,
        method: "upload",
        url: uploaded.url,
        pathname: uploaded.pathname,
        fileName: signaturePhoto.name,
        fileSize: signaturePhoto.size,
        fileType: signaturePhoto.type,
      }
      dataRecord.h2bIntake = h2bIntake
    }

    const { error } = await supabase.from("h2b_intake_submissions").insert({
      id: submissionId,
      data: dataRecord,
      status: "new",
      contact_name: String(contactName).trim(),
      contact_email: String(contactEmail).trim().toLowerCase(),
      contact_phone: String(contactPhone).trim(),
    })

    if (error) {
      console.error("H2B intake insert error:", error)
      return NextResponse.json({ error: "Failed to save H2B intake" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("H2B intake API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
