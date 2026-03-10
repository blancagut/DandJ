import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { uploadLeadFile } from "@/lib/server/blob"
import { isH2BContractVariant } from "@/lib/h2b-contract-pricing"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let body: Record<string, unknown> = {}
    let signaturePhoto: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const rawPayload = formData.get("payload")
      if (typeof rawPayload === "string") {
        body = JSON.parse(rawPayload) as Record<string, unknown>
      }
      const maybeFile = formData.get("signaturePhoto")
      signaturePhoto = maybeFile instanceof File ? maybeFile : null
    } else {
      body = await request.json()
    }

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
      signatureMethod,
      contractVariant,
    } = body

    const normalizedClientName = String(clientName || "").trim()
    const normalizedClientDob = String(clientDob || "").trim()
    const normalizedClientPassport = String(clientPassport || "").trim()
    const normalizedClientCountry = String(clientCountry || "").trim()
    const normalizedClientCity = String(clientCity || "").trim()
    const normalizedClientEmail = String(clientEmail || "").trim().toLowerCase()
    const normalizedClientPhone = String(clientPhone || "").trim()
    const normalizedLawyerName = String(lawyerName || "").trim()
    const normalizedContractDay = Number(contractDay)
    const normalizedContractMonth = String(contractMonth || "").trim()
    const normalizedContractYear = Number(contractYear)
    const normalizedSignatureMethod = signatureMethod === "upload" ? "upload" : "draw"
    const normalizedContractVariant = isH2BContractVariant(contractVariant)
      ? contractVariant
      : "split_300_200"

    // Validate required fields
    if (
      !normalizedClientName ||
      !normalizedClientDob ||
      !normalizedClientPassport ||
      !normalizedClientCountry ||
      !normalizedClientCity ||
      !normalizedClientEmail ||
      !normalizedLawyerName
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

    const contractId = crypto.randomUUID()
    let signatureValue = ""

    if (normalizedSignatureMethod === "upload" && signaturePhoto) {
      const uploaded = await uploadLeadFile({ leadId: contractId, file: signaturePhoto })
      signatureValue = JSON.stringify({
        method: "upload",
        url: uploaded.url,
        pathname: uploaded.pathname,
        fileName: signaturePhoto.name,
        fileSize: signaturePhoto.size,
        fileType: signaturePhoto.type,
      })
    } else if (typeof clientSignature === "string" && clientSignature.trim().length > 0) {
      signatureValue = JSON.stringify({
        method: "draw",
        dataUrl: clientSignature,
      })
    }

    if (!signatureValue) {
      return NextResponse.json(
        { error: "Falta firma del cliente / Missing client signature" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.from("h2b_contracts").insert({
      id: contractId,
      client_name: normalizedClientName,
      client_dob: normalizedClientDob,
      client_passport: normalizedClientPassport,
      client_country: normalizedClientCountry,
      client_city: normalizedClientCity,
      client_email: normalizedClientEmail,
      client_phone: normalizedClientPhone || null,
      lawyer_name: normalizedLawyerName,
      contract_day: normalizedContractDay,
      contract_month: normalizedContractMonth,
      contract_year: normalizedContractYear,
      contract_variant: normalizedContractVariant,
      client_signature: signatureValue,
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
