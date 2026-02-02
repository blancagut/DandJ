import { z } from "zod"

import { isHoneypotTripped, jsonError, jsonOk, parseRequestBody, zodToFieldErrors } from "@/lib/api/route-utils"
import { createLead } from "@/lib/server/leads"
import { sendLeadNotification } from "@/lib/server/email"

export const runtime = "nodejs"

const contactSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    caseType: z.string().min(1),
    message: z.string().min(10),
    language: z.enum(["en", "es"]).optional(),
    website: z.string().optional(), // honeypot
  })
  .strict()

export async function POST(req: Request) {
  const data = await parseRequestBody(req)

  if (isHoneypotTripped(data, "website")) {
    return jsonError("HONEYPOT_TRIPPED", "Submission rejected.", undefined, 400)
  }

  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid form submission.", zodToFieldErrors(parsed.error), 400)
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  const userAgent = req.headers.get("user-agent")

  const lead = await createLead({
    leadType: "contact",
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: parsed.data.caseType,
    message: parsed.data.message,
    raw: parsed.data,
    ip,
    userAgent,
  })

  await sendLeadNotification({
    leadType: "contact",
    leadId: lead.id,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: parsed.data.caseType,
    message: parsed.data.message,
  })

  return jsonOk({
    received: true,
    form: "contact",
    leadId: lead.id,
    receivedAt: new Date().toISOString(),
  })
}
