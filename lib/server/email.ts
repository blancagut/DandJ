import { Resend } from "resend"
import { buildBrandedEmail } from "@/lib/server/email-template"

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export type LeadEmailPayload = {
  leadType: string
  leadId: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  language?: string
  caseType?: string
  message?: string
  files?: Array<{ fileName: string; url: string }>
}

export async function sendLeadNotification(payload: LeadEmailPayload) {
  const resend = new Resend(requiredEnv("RESEND_API_KEY"))
  const to = requiredEnv("LEADS_TO_EMAIL")
  const from = requiredEnv("RESEND_FROM_EMAIL")

  const subject = `[Lead] ${payload.leadType} • ${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim()

  // Build branded HTML body
  const rows: string[] = []
  rows.push(`<p><strong>Lead type:</strong> ${esc(payload.leadType)}</p>`)
  rows.push(`<p><strong>Lead ID:</strong> ${esc(payload.leadId)}</p>`)
  if (payload.language) rows.push(`<p><strong>Language:</strong> ${esc(payload.language)}</p>`)
  if (payload.firstName || payload.lastName)
    rows.push(`<p><strong>Name:</strong> ${esc(`${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim())}</p>`)
  if (payload.email)
    rows.push(`<p><strong>Email:</strong> <a href="mailto:${esc(payload.email)}">${esc(payload.email)}</a></p>`)
  if (payload.phone)
    rows.push(`<p><strong>Phone:</strong> <a href="tel:${esc(payload.phone)}">${esc(payload.phone)}</a></p>`)
  if (payload.caseType) rows.push(`<p><strong>Case type:</strong> ${esc(payload.caseType)}</p>`)
  if (payload.message) {
    rows.push(`<hr />`)
    rows.push(`<h3>Message</h3>`)
    rows.push(`<p>${esc(payload.message).replace(/\n/g, "<br />")}</p>`)
  }
  if (payload.files?.length) {
    rows.push(`<hr />`)
    rows.push(`<h3>Attached Files</h3>`)
    rows.push(
      `<ul>${payload.files.map((f) => `<li><a href="${esc(f.url)}">${esc(f.fileName)}</a></li>`).join("")}</ul>`,
    )
  }

  const html = buildBrandedEmail(subject, rows.join("\n"))

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    replyTo: payload.email ? payload.email : undefined,
  })
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
