import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import { buildBrandedEmail } from "@/lib/server/email-template"

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function requireAdmin() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  if (!isAdminUser(user)) throw new Error("Not authorized")
  return user
}

/** Chunk an array into groups of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export async function POST(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { subject, bodyHtml, recipientEmails, recipientSource } = body as {
    subject: string
    bodyHtml: string
    recipientEmails: string[]
    recipientSource: string
  }

  if (!subject || !bodyHtml || !recipientEmails?.length) {
    return NextResponse.json(
      { error: "Missing required fields: subject, bodyHtml, recipientEmails" },
      { status: 400 },
    )
  }

  const resend = new Resend(requiredEnv("RESEND_API_KEY"))
  const from = requiredEnv("RESEND_FROM_EMAIL")
  const replyTo = process.env.LEADS_TO_EMAIL || undefined

  // Build the full branded HTML
  const fullHtml = buildBrandedEmail(subject, bodyHtml)

  // Resend batch API supports up to 100 emails per call
  const BATCH_SIZE = 100
  const batches = chunk(recipientEmails, BATCH_SIZE)

  const allResendIds: string[] = []
  let sentCount = 0
  let failedCount = 0
  let errorMessage: string | null = null

  for (const batch of batches) {
    try {
      const emails = batch.map((email) => ({
        from,
        to: email,
        subject,
        html: fullHtml,
        replyTo,
      }))

      const { data, error } = await resend.batch.send(emails)

      if (error) {
        console.error("Resend batch error:", error)
        failedCount += batch.length
        errorMessage = error.message
      } else if (data) {
        const ids = (data as { data: Array<{ id: string }> }).data
        if (Array.isArray(ids)) {
          allResendIds.push(...ids.map((d) => d.id))
        }
        sentCount += batch.length
      }
    } catch (err) {
      console.error("Batch send error:", err)
      failedCount += batch.length
      errorMessage = err instanceof Error ? err.message : "Unknown error"
    }
  }

  // Determine status
  let status: "sent" | "failed" | "partial" = "sent"
  if (failedCount > 0 && sentCount === 0) status = "failed"
  else if (failedCount > 0 && sentCount > 0) status = "partial"

  // Log to database
  const db = getServiceClient()
  try {
    await db.from("email_logs").insert({
      subject,
      body_html: bodyHtml, // store the raw body, not the wrapped template
      sender_email: adminUser.email ?? "unknown",
      recipient_count: recipientEmails.length,
      recipient_emails: recipientEmails,
      recipient_source: recipientSource,
      status,
      resend_ids: allResendIds,
      error_message: errorMessage,
    })
  } catch (logErr) {
    console.error("Failed to log email:", logErr)
  }

  return NextResponse.json({
    success: status !== "failed",
    sentCount,
    failedCount,
    status,
    errorMessage,
  })
}
