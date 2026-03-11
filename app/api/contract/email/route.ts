import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { buildBrandedEmail } from "@/lib/server/email-template"
import { CONTRACTS_EMAIL } from "@/lib/site-config"

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractId, clientEmail, clientName, lawyerName, signedAt, pdfBase64 } = body

    if (!contractId || !clientEmail || !clientName || !pdfBase64) {
      return NextResponse.json(
        { error: "Missing required fields for email delivery" },
        { status: 400 }
      )
    }

    const resend = new Resend(requiredEnv("RESEND_API_KEY"))
    const from = requiredEnv("RESEND_FROM_EMAIL")
    const adminEmail = process.env.LEADS_TO_EMAIL?.trim() || CONTRACTS_EMAIL

    const signedDate = signedAt
      ? new Date(signedAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"

    const filename = `Contrato-H2B-${clientName.replace(/\s+/g, "-")}-${contractId.slice(0, 8)}.pdf`

    // Convert base64 to Buffer for attachment
    const pdfBuffer = Buffer.from(pdfBase64, "base64")

    const bodyHtml = `
      <h2 style="color:#0B1E3A;margin-top:0;">Contrato Firmado Exitosamente</h2>
      <p style="color:#6b7280;margin-top:0;">Contract Successfully Signed</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;">
        <tr><td style="padding:8px 12px;color:#888;width:40%;">ID del Contrato:</td><td style="padding:8px 12px;font-weight:700;color:#0B1E3A;">${contractId}</td></tr>
        <tr><td style="padding:8px 12px;color:#888;">Cliente:</td><td style="padding:8px 12px;font-weight:600;">${clientName}</td></tr>
        <tr><td style="padding:8px 12px;color:#888;">Abogado:</td><td style="padding:8px 12px;font-weight:600;">${lawyerName || "N/A"}</td></tr>
        <tr><td style="padding:8px 12px;color:#888;">Firmado:</td><td style="padding:8px 12px;font-weight:600;">${signedDate}</td></tr>
      </table>

      <p>Adjunto a este correo encontrará una copia en PDF de su contrato de prestación de servicios legales para el trámite de visa H-2B, firmado electrónicamente conforme al <strong>E-SIGN Act (15 U.S.C. § 7001)</strong> y la <strong>Florida Electronic Signature Act</strong>.</p>
      <p>Attached you will find a PDF copy of your H-2B visa legal services contract, electronically signed in compliance with the E-SIGN Act and the Florida Electronic Signature Act.</p>

      <blockquote><strong>⚠ Conserve este documento para sus registros.</strong><br />Please keep this document for your records.</blockquote>
    `

    const html = buildBrandedEmail(
      `Contrato H-2B Firmado — ${clientName} · Díaz & Johnson`,
      bodyHtml,
    )

    const attachments = [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ]

    const [adminResult, clientResult] = await Promise.allSettled([
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `[Contrato Firmado] ${clientName} — H-2B · ${contractId.slice(0, 8)}`,
        html,
        replyTo: clientEmail,
        attachments,
      }),
      resend.emails.send({
        from,
        to: clientEmail,
        subject: `Contrato H-2B Firmado — ${clientName} · Díaz & Johnson`,
        html,
        attachments,
      }),
    ])

    const adminSent = adminResult.status === "fulfilled"
    const clientSent = clientResult.status === "fulfilled"

    if (!adminSent || !clientSent) {
      console.error("Contract email partial failure:", {
        contractId,
        adminEmail,
        clientEmail,
        adminError: adminResult.status === "rejected" ? adminResult.reason : null,
        clientError: clientResult.status === "rejected" ? clientResult.reason : null,
      })
    }

    if (!adminSent && !clientSent) {
      return NextResponse.json(
        {
          error: "Error sending contract email",
          adminSent: false,
          clientSent: false,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: adminSent && clientSent,
      adminSent,
      clientSent,
      message:
        adminSent && clientSent
          ? "Emails sent successfully"
          : "Contract saved, but one email delivery failed",
    })
  } catch (err) {
    console.error("Contract email error:", err)
    return NextResponse.json(
      { error: "Error sending contract email" },
      { status: 500 }
    )
  }
}
