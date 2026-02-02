import { Resend } from "resend"

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

  const lines: string[] = []
  lines.push(`Lead type: ${payload.leadType}`)
  lines.push(`Lead id: ${payload.leadId}`)
  if (payload.language) lines.push(`Language: ${payload.language}`)
  if (payload.firstName || payload.lastName) lines.push(`Name: ${(payload.firstName ?? "").trim()} ${(payload.lastName ?? "").trim()}`.trim())
  if (payload.email) lines.push(`Email: ${payload.email}`)
  if (payload.phone) lines.push(`Phone: ${payload.phone}`)
  if (payload.caseType) lines.push(`Case type: ${payload.caseType}`)
  if (payload.message) {
    lines.push("")
    lines.push("Message:")
    lines.push(payload.message)
  }
  if (payload.files?.length) {
    lines.push("")
    lines.push("Files:")
    for (const f of payload.files) {
      lines.push(`- ${f.fileName}: ${f.url}`)
    }
  }

  await resend.emails.send({
    from,
    to,
    subject,
    text: lines.join("\n"),
    replyTo: payload.email ? payload.email : undefined,
  })
}
