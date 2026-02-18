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

    const {
      firstName,
      lastName,
      email,
      phone,
      nationality,
      currentLocation,
      caseType,
      urgency,
      caseDescription,
      previousAttorney,
      courtDate,
      preferredContactMethod,
      preferredConsultationTime,
      language,
    } = body

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nationality ||
      !currentLocation ||
      !caseType ||
      !urgency ||
      !caseDescription ||
      !preferredContactMethod
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.from("consultation_requests").insert({
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      nationality: String(nationality).trim(),
      current_location: String(currentLocation).trim(),
      case_type: String(caseType),
      urgency: String(urgency),
      case_description: String(caseDescription).trim(),
      previous_attorney: previousAttorney ? String(previousAttorney).trim() : null,
      court_date: courtDate ? String(courtDate) : null,
      preferred_contact_method: String(preferredContactMethod),
      preferred_consultation_time: preferredConsultationTime ? String(preferredConsultationTime) : null,
      language: language === "es" ? "es" : "en",
      status: "new",
    })

    if (error) {
      console.error("General consult insert error:", error)
      return NextResponse.json({ error: "Failed to save consultation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("General consult API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
