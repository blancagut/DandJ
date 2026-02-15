import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

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
    const adminEmail = requiredEnv("LEADS_TO_EMAIL")

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

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #f4f5f8; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #0B1E3A; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 22px; margin: 0; letter-spacing: 1px;">DÍAZ & JOHNSON</h1>
      <p style="color: #B58B2B; font-size: 11px; margin: 6px 0 0; letter-spacing: 2px;">ATTORNEYS AT LAW PLLC</p>
    </div>
    <div style="border-top: 3px solid #B58B2B;"></div>
    <div style="padding: 32px;">
      <h2 style="color: #0B1E3A; font-size: 18px; margin: 0 0 8px;">Contrato Firmado Exitosamente</h2>
      <p style="color: #666; font-size: 13px; margin: 0 0 20px;">Contract Successfully Signed</p>

      <div style="background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px; color: #333;">
          <tr><td style="padding: 4px 0; color: #888;">ID del Contrato:</td><td style="padding: 4px 0; font-weight: 600; color: #0B1E3A;">${contractId}</td></tr>
          <tr><td style="padding: 4px 0; color: #888;">Cliente:</td><td style="padding: 4px 0; font-weight: 600;">${clientName}</td></tr>
          <tr><td style="padding: 4px 0; color: #888;">Abogado:</td><td style="padding: 4px 0; font-weight: 600;">${lawyerName || "N/A"}</td></tr>
          <tr><td style="padding: 4px 0; color: #888;">Firmado:</td><td style="padding: 4px 0; font-weight: 600;">${signedDate}</td></tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #555; line-height: 1.6;">
        Adjunto a este correo encontrará una copia en PDF de su contrato de prestación de servicios legales para el trámite de visa H-2B, firmado electrónicamente conforme al E-SIGN Act (15 U.S.C. § 7001) y la Florida Electronic Signature Act.
      </p>
      <p style="font-size: 13px; color: #555; line-height: 1.6;">
        Attached you will find a PDF copy of your H-2B visa legal services contract, electronically signed in compliance with the E-SIGN Act and the Florida Electronic Signature Act.
      </p>

      <div style="margin-top: 20px; padding: 14px 16px; background: #fffbf0; border: 1px solid #B58B2B44; border-radius: 8px;">
        <p style="font-size: 12px; color: #0B1E3A; margin: 0; font-weight: 600;">⚠ Conserve este documento para sus registros.</p>
        <p style="font-size: 11px; color: #888; margin: 4px 0 0;">Please keep this document for your records.</p>
      </div>
    </div>
    <div style="background: #0B1E3A; padding: 16px 32px; text-align: center;">
      <p style="color: #ffffff88; font-size: 11px; margin: 0;">Díaz and Johnson Attorneys at Law PLLC</p>
      <p style="color: #ffffff55; font-size: 10px; margin: 4px 0 0;">1680 Michigan Ave Suite 700, Miami Beach, FL 33139 · +1 (305) 307-1677</p>
    </div>
  </div>
</body>
</html>`

    // Send to client
    await resend.emails.send({
      from,
      to: clientEmail,
      subject: `Contrato H-2B Firmado — ${clientName} · Díaz & Johnson`,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    // Send copy to admin/firm
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `[Contrato Firmado] ${clientName} — H-2B · ${contractId.slice(0, 8)}`,
      html: htmlBody,
      replyTo: clientEmail,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    return NextResponse.json({ success: true, message: "Emails sent successfully" })
  } catch (err) {
    console.error("Contract email error:", err)
    return NextResponse.json(
      { error: "Error sending contract email" },
      { status: 500 }
    )
  }
}
