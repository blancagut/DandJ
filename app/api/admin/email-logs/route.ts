import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"

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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10)
  const pageSize = parseInt(request.nextUrl.searchParams.get("pageSize") ?? "20", 10)
  const search = request.nextUrl.searchParams.get("search") ?? ""

  const db = getServiceClient()

  let query = db
    .from("email_logs")
    .select("id, subject, sender_email, recipient_count, recipient_source, status, created_at, error_message", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.ilike("subject", `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    logs: data ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  })
}

/** GET a single email log with full details (including body and recipient list) */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db.from("email_logs").select("*").eq("id", id).single()

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ log: data })
}
