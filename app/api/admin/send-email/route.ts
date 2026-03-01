import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { requireAdminFromRequest } from "@/lib/server/admin-auth"
import { buildBrandedEmail } from "@/lib/server/email-template"

export const runtime = "nodejs"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const normalized = raw.trim().toLowerCase()
  if (!normalized) return null
  return EMAIL_REGEX.test(normalized) ? normalized : null
}

function getResendIds(data: unknown): string[] {
  if (!data || typeof data !== "object" || !("data" in data)) return []
  const wrapped = (data as { data?: unknown }).data
  if (!Array.isArray(wrapped)) return []
  return wrapped
    .map((item) => {
      if (!item || typeof item !== "object" || !("id" in item)) return null
      const id = (item as { id?: unknown }).id
      return typeof id === "string" ? id : null
    })
    .filter((id): id is string => Boolean(id))
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(label))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timer) clearTimeout(timer)
  }
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
      recipientEmails: unknown[]
      recipientSource: string
    }

    if (!subject || !bodyHtml || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: subject, bodyHtml, recipientEmails",
          errorMessage: "Missing required fields: subject, bodyHtml, or recipientEmails.",
        },
        { status: 400 },
      )
    }

    const validEmailSet = new Set<string>()
    const invalidRecipients: string[] = []

    for (const raw of recipientEmails) {
      const normalized = normalizeEmail(raw)
      if (normalized) {
        validEmailSet.add(normalized)
      } else if (typeof raw === "string" && raw.trim()) {
        invalidRecipients.push(raw.trim())
      } else {
        invalidRecipients.push(String(raw))
      }
    }

    const normalizedRecipients = Array.from(validEmailSet)
    const originalRecipientCount = recipientEmails.length

    if (normalizedRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          sentCount: 0,
          failedCount: originalRecipientCount,
          invalidRecipientsCount: invalidRecipients.length,
          failedRecipientsSample: invalidRecipients.slice(0, 10),
          errorMessage: "No valid recipient emails found.",
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
    const batches = chunk(normalizedRecipients, BATCH_SIZE)

    const allResendIds: string[] = []
    let sentCount = 0
    let failedCount = invalidRecipients.length
    let errorMessage: string | null = null
    const failedRecipients = [...invalidRecipients]
    let firstError: string | null =
      invalidRecipients.length > 0
        ? "Some recipient emails are invalid."
        : null

    for (const batch of batches) {
      try {
        const emails = batch.map((email) => ({
          from,
          to: email,
          subject,
          html: fullHtml,
          reply_to: replyTo,
        }))

        const { data, error } = await withTimeout(
          resend.batch.send(emails),
          25000,
          "Resend batch send timed out",
        )

        if (error) {
          throw new Error(error.message || "Resend batch send failed")
        } else if (data) {
          const ids = getResendIds(data)
          if (ids.length > 0) {
            allResendIds.push(...ids)
          }
          sentCount += batch.length
        }
      } catch (err) {
        const batchError = err instanceof Error ? err.message : "Unknown batch error"
        console.error("Batch send error (falling back to single sends):", batchError)
        if (!firstError) firstError = batchError

        for (const email of batch) {
          try {
            const { data, error } = await withTimeout(
              resend.emails.send({
                from,
                to: email,
                subject,
                html: fullHtml,
                reply_to: replyTo,
              }),
              15000,
              `Resend single send timed out for ${email}`,
            )

            if (error) {
              failedCount += 1
              failedRecipients.push(email)
              if (!firstError) firstError = error.message || "Single send failed"
              continue
            }

            const id =
              data && typeof data === "object" && "id" in data
                ? (data as { id?: unknown }).id
                : null
            if (typeof id === "string" && id) {
              allResendIds.push(id)
            }
            sentCount += 1
          } catch (singleErr) {
            failedCount += 1
            failedRecipients.push(email)
            const singleMessage =
              singleErr instanceof Error ? singleErr.message : "Unknown single send error"
            if (!firstError) firstError = singleMessage
          }
        }
      }
    }

    if (failedCount > 0) {
      const sample = failedRecipients.slice(0, 5)
      const sampleText = sample.length > 0 ? ` Failed sample: ${sample.join(", ")}.` : ""
      errorMessage = `${firstError || "Some emails failed to send."} Sent ${sentCount}/${normalizedRecipients.length}.${sampleText}`
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
        recipient_count: originalRecipientCount,
        recipient_emails: normalizedRecipients,
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
      invalidRecipientsCount: invalidRecipients.length,
      failedRecipientsSample: failedRecipients.slice(0, 10),
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
