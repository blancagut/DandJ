import { z } from "zod"

import { isHoneypotTripped, jsonError, jsonOk, parseRequestBody, zodToFieldErrors } from "@/lib/api/route-utils"
import { createLead, addLeadFile } from "@/lib/server/leads"
import { uploadLeadFile } from "@/lib/server/blob"
import { sendLeadNotification } from "@/lib/server/email"

export const runtime = "nodejs"

const fileSchema = z.custom<File>((v) => typeof v === "object" && v !== null && v instanceof File)

const consultationSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    dateOfBirth: z.string().optional(),
    nationality: z.string().min(2),
    currentLocation: z.string().min(2),
    caseType: z.string().min(1),
    urgency: z.string().min(1),
    caseDescription: z.string().min(20),
    previousAttorney: z.string().optional(),
    courtDate: z.string().optional(),
    preferredContactMethod: z.string().min(1),
    preferredConsultationTime: z.string().optional(),
    referralSource: z.string().optional(),
    agreeToTerms: z.boolean(),
    files: z.union([fileSchema, z.array(fileSchema)]).optional(),
    language: z.enum(["en", "es"]).optional(),
    website: z.string().optional(), // honeypot
  })
  .strict()
  .refine((v: { agreeToTerms: boolean }) => v.agreeToTerms === true, {
    path: ["agreeToTerms"],
    message: "Must accept terms",
  })

export async function POST(req: Request) {
  const data = await parseRequestBody(req)

  if (isHoneypotTripped(data, "website")) {
    return jsonError("HONEYPOT_TRIPPED", "Submission rejected.", undefined, 400)
  }

  // Convert agreeToTerms if it comes from formData as string
  if (typeof data.agreeToTerms === "string") {
    data.agreeToTerms = data.agreeToTerms === "true" || data.agreeToTerms === "on"
  }

  const parsed = consultationSchema.safeParse(data)
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid form submission.", zodToFieldErrors(parsed.error), 400)
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  const userAgent = req.headers.get("user-agent")

  const lead = await createLead({
    leadType: "consultation",
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: parsed.data.caseType,
    message: parsed.data.caseDescription,
    raw: parsed.data,
    ip,
    userAgent,
  })

  const files: Array<{ fileName: string; url: string }> = []
  const rawFiles = parsed.data.files
  const fileList = rawFiles ? (Array.isArray(rawFiles) ? rawFiles : [rawFiles]) : []

  for (const file of fileList) {
    if (!file || !file.name || file.size === 0) continue
    const uploaded = await uploadLeadFile({ leadId: lead.id, file })
    await addLeadFile({
      leadId: lead.id,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      blobUrl: uploaded.url,
    })
    files.push({ fileName: file.name, url: uploaded.url })
  }

  await sendLeadNotification({
    leadType: "consultation",
    leadId: lead.id,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: parsed.data.caseType,
    message: parsed.data.caseDescription,
    files: files.length ? files : undefined,
  })

  return jsonOk({
    received: true,
    form: "consultation",
    leadId: lead.id,
    receivedAt: new Date().toISOString(),
  })
}
