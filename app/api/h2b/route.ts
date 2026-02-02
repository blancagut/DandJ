import { z } from "zod"

import { isHoneypotTripped, jsonError, jsonOk, parseRequestBody, zodToFieldErrors } from "@/lib/api/route-utils"
import { createLead, addLeadFile } from "@/lib/server/leads"
import { uploadLeadFile } from "@/lib/server/blob"
import { sendLeadNotification } from "@/lib/server/email"

export const runtime = "nodejs"

const fileSchema = z.custom<File>((v) => typeof v === "object" && v !== null && v instanceof File)

const h2bSchema = z
  .object({
    // Step 1
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    dateOfBirth: z.string().optional(),
    nationality: z.string().min(2),
    currentCountry: z.string().min(2),

    // Step 2
    employerName: z.string().min(2),
    employerAddress: z.string().min(2).optional(),
    jobTitle: z.string().min(2),
    jobDescription: z.string().min(10),
    startDate: z.string().min(4),
    endDate: z.string().min(4),
    workersNeeded: z.string().min(1),

    // Step 3
    yearsExperience: z.string().min(1),
    skills: z.array(z.string()).min(0).optional(),
    previousH2B: z.string().min(1),
    englishLevel: z.string().min(1),

    // Step 4
    documents: z.union([fileSchema, z.array(fileSchema)]).optional(),

    // Step 5
    additionalInfo: z.string().optional(),
    howDidYouHear: z.string().optional(),
    preferredContact: z.string().min(1),
    urgency: z.string().min(1),

    language: z.enum(["en", "es"]).optional(),
    website: z.string().optional(), // honeypot
  })
  .strict()

export async function POST(req: Request) {
  const data = await parseRequestBody(req)

  if (isHoneypotTripped(data, "website")) {
    return jsonError("HONEYPOT_TRIPPED", "Submission rejected.", undefined, 400)
  }

  // Normalize skills if it comes as a single string
  if (typeof data.skills === "string") {
    data.skills = [data.skills]
  }

  const parsed = h2bSchema.safeParse(data)
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid form submission.", zodToFieldErrors(parsed.error), 400)
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  const userAgent = req.headers.get("user-agent")

  const lead = await createLead({
    leadType: "h2b",
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: "h2b",
    message: parsed.data.additionalInfo || parsed.data.jobDescription,
    raw: parsed.data,
    ip,
    userAgent,
  })

  const files: Array<{ fileName: string; url: string }> = []
  const rawDocs = parsed.data.documents
  const docList = rawDocs ? (Array.isArray(rawDocs) ? rawDocs : [rawDocs]) : []

  for (const file of docList) {
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
    leadType: "h2b",
    leadId: lead.id,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    language: parsed.data.language,
    caseType: "h2b",
    message: parsed.data.additionalInfo || parsed.data.jobDescription,
    files: files.length ? files : undefined,
  })

  return jsonOk({
    received: true,
    form: "h2b",
    leadId: lead.id,
    receivedAt: new Date().toISOString(),
  })
}
