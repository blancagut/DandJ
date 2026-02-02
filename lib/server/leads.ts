import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, key)
}

export type LeadType = "contact" | "consultation" | "h2b"

export type CreateLeadInput = {
  leadType: LeadType
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  language?: string
  caseType?: string
  message?: string
  raw?: unknown
  ip?: string | null
  userAgent?: string | null
}

export async function createLead(input: CreateLeadInput): Promise<{ id: string }> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("leads")
    .insert({
      lead_type: input.leadType,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      language: input.language ?? null,
      case_type: input.caseType ?? null,
      message: input.message ?? null,
      raw: input.raw ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`)
  }

  return { id: data.id }
}

export async function addLeadFile(input: {
  leadId: string
  fileName: string
  contentType?: string | null
  sizeBytes?: number | null
  blobUrl: string
}) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("lead_files").insert({
    lead_id: input.leadId,
    file_name: input.fileName,
    content_type: input.contentType ?? null,
    size_bytes: input.sizeBytes ?? null,
    blob_url: input.blobUrl,
  })

  if (error) {
    throw new Error(`Failed to add lead file: ${error.message}`)
  }
}
