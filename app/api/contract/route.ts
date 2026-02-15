import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      clientName,
      clientDob,
      clientPassport,
      clientCountry,
      clientCity,
      clientEmail,
      clientPhone,
      lawyerName,
      contractDay,
      contractMonth,
      contractYear,
      clientSignature,
    } = body

    // Validate required fields
    if (
      !clientName ||
      !clientDob ||
      !clientPassport ||
      !clientCountry ||
      !clientCity ||
      !clientEmail ||
      !clientSignature ||
      !lawyerName
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos / Missing required fields" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const { data, error } = await supabase.from("h2b_contracts").insert({
      client_name: clientName.trim(),
      client_dob: clientDob,
      client_passport: clientPassport.trim(),
      client_country: clientCountry.trim(),
      client_city: clientCity.trim(),
      client_email: clientEmail.trim().toLowerCase(),
      client_phone: clientPhone?.trim() || null,
      lawyer_name: lawyerName,
      contract_day: contractDay,
      contract_month: contractMonth,
      contract_year: contractYear,
      client_signature: clientSignature,
      ip_address: ip,
      user_agent: userAgent,
    }).select("id, signed_at").single()

    if (error) {
      console.error("Contract insert error:", error)
      return NextResponse.json(
        { error: "Error al guardar el contrato / Error saving contract" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contractId: data.id,
      signedAt: data.signed_at,
      ipAddress: ip,
      userAgent: userAgent,
      message: "Contrato firmado exitosamente / Contract signed successfully",
    })
  } catch (err) {
    console.error("Contract API error:", err)
    return NextResponse.json(
      { error: "Error interno del servidor / Internal server error" },
      { status: 500 }
    )
  }
}
