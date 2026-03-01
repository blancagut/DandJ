import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { requireAdminFromRequest } from "@/lib/server/admin-auth"
import { buildBrandedEmail } from "@/lib/server/email-template"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
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
  // ── Auth ────────────────────────────────────────────────────
  let adminUser
  try {
    adminUser = await requireAdminFromRequest(request)
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized", errorMessage: "You are not authenticated or not an admin." },
      { status: 401 },
    )
  }

  try {
    // ── Parse body ────────────────────────────────────────────
    const body = await request.json()
    const { subject, bodyHtml, recipientEmails, recipientSource } = body as {
      subject: string
      bodyHtml: string
      recipientEmails: string[]
      recipientSource: string
    }

    if (!subject || !bodyHtml || !recipientEmails?.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: subject, bodyHtml, recipientEmails",
          errorMessage: "Missing required fields: subject, bodyHtml, or recipientEmails.",
        },
        { status: 400 },
      )
    }

    // ── Validate env vars ────────────────────────────────────
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL

    if (!apiKey) {
      console.error("RESEND_API_KEY is not set")
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            "Email service is not configured (missing RESEND_API_KEY). Please add it in Vercel → Settings → Environment Variables and redeploy.",
        },
        { status: 500 },
      )
    }

    if (!from) {
      console.error("RESEND_FROM_EMAIL is not set")
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            "Sender email is not configured (missing RESEND_FROM_EMAIL). Please add it in Vercel → Settings → Environment Variables and redeploy.",
        },
        { status: 500 },
      )
    }

    const resend = new Resend(apiKey)
    const replyTo = process.env.LEADS_TO_EMAIL || undefined

    // ── Build branded HTML ───────────────────────────────────
    const fullHtml = buildBrandedEmail(subject, bodyHtml, {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL,
      preheader: subject,
      supportPhone: process.env.FIRM_PHONE,
      supportEmail: process.env.FIRM_SUPPORT_EMAIL || process.env.LEADS_TO_EMAIL,
      unsubscribeUrl: process.env.MARKETING_UNSUBSCRIBE_URL,
    })

    // ── Send in batches (Resend limit = 100/call) ────────────
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
          reply_to: replyTo,
        }))

        const { data, error } = await resend.batch.send(emails)

        if (error) {
          console.error("Resend batch error:", JSON.stringify(error))
          failedCount += batch.length
          errorMessage = error.message
        } else if (data) {
          // Resend SDK v4 returns { data: [{ id }, ...] }
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

    // ── Determine status ─────────────────────────────────────
    let status: "sent" | "failed" | "partial" = "sent"
    if (failedCount > 0 && sentCount === 0) status = "failed"
    else if (failedCount > 0 && sentCount > 0) status = "partial"

    // ── Log to database ──────────────────────────────────────
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
  } catch (err) {
    // Catch-all: always return JSON so the client can parse the error
    console.error("send-email unhandled error:", err)
    const message = err instanceof Error ? err.message : "Unknown server error"
    return NextResponse.json(
      { success: false, errorMessage: `Server error: ${message}` },
      { status: 500 },
    )
  }
}
