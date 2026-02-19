import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, contactName, contactEmail, contactPhone } = body

    if (!data || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.from("h2b_intake_submissions").insert({
      data,
      status: "new",
      contact_name: String(contactName).trim(),
      contact_email: String(contactEmail).trim().toLowerCase(),
      contact_phone: String(contactPhone).trim(),
    })

    if (error) {
      console.error("H2B intake insert error:", error)
      return NextResponse.json({ error: "Failed to save H2B intake" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("H2B intake API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
