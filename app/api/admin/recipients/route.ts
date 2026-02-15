import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"

interface Recipient {
  email: string
  name: string
  source: string
}

type SourceKey =
  | "all"
  | "consultations"
  | "leads"
  | "petitions"
  | "waivers"
  | "work"
  | "contracts"
  | "chat"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
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

async function fetchFromTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase generic types mismatch between createClient overloads
  supabase: any,
  table: string,
  emailCol: string,
  nameCol: string | null,
  source: string,
): Promise<Recipient[]> {
  const cols = nameCol ? `${emailCol},${nameCol}` : emailCol
  const { data, error } = await supabase.from(table).select(cols)
  if (error) {
    console.error(`Error fetching ${table}:`, error.message)
    return []
  }
  return (data ?? [])
    .filter((row: Record<string, unknown>) => row[emailCol] && typeof row[emailCol] === "string" && (row[emailCol] as string).includes("@"))
    .map((row: Record<string, unknown>) => ({
      email: (row[emailCol] as string).toLowerCase().trim(),
      name: nameCol && row[nameCol]
        ? String(row[nameCol])
        : "",
      source,
    }))
}

const TABLE_MAP: Record<Exclude<SourceKey, "all">, { table: string; emailCol: string; nameCol: string | null; source: string }> = {
  consultations: { table: "consultation_requests", emailCol: "email", nameCol: "first_name", source: "Consultation" },
  leads:         { table: "leads",                 emailCol: "email", nameCol: "first_name", source: "Contact" },
  petitions:     { table: "petition_screenings",   emailCol: "contact_email", nameCol: "contact_name", source: "Petition" },
  waivers:       { table: "waiver_screenings",     emailCol: "contact_email", nameCol: "contact_name", source: "Waiver" },
  work:          { table: "work_screenings",       emailCol: "contact_email", nameCol: "contact_name", source: "Work Visa" },
  contracts:     { table: "h2b_contracts",         emailCol: "client_email",  nameCol: "client_name",  source: "Contract" },
  chat:          { table: "chat_conversations",    emailCol: "visitor_email", nameCol: "visitor_name", source: "Chat" },
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const source = (request.nextUrl.searchParams.get("source") ?? "all") as SourceKey
  const supabase = getServiceClient()

  let allRecipients: Recipient[] = []

  if (source === "all") {
    // Fetch from all tables in parallel
    const results = await Promise.all(
      Object.values(TABLE_MAP).map((cfg) =>
        fetchFromTable(supabase, cfg.table, cfg.emailCol, cfg.nameCol, cfg.source),
      ),
    )
    allRecipients = results.flat()
  } else {
    const cfg = TABLE_MAP[source]
    if (!cfg) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 })
    }
    allRecipients = await fetchFromTable(supabase, cfg.table, cfg.emailCol, cfg.nameCol, cfg.source)
  }

  // Deduplicate by email — keep the first occurrence (with name if available)
  const seen = new Map<string, Recipient>()
  for (const r of allRecipients) {
    const existing = seen.get(r.email)
    if (!existing) {
      seen.set(r.email, r)
    } else if (!existing.name && r.name) {
      // Prefer the entry with a name
      seen.set(r.email, r)
    }
  }

  const recipients = Array.from(seen.values()).sort((a, b) => a.email.localeCompare(b.email))

  return NextResponse.json({
    recipients,
    totalCount: recipients.length,
    source,
  })
}
