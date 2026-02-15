/**
 * Branded HTML email template for Diaz & Johnson Immigration Law
 * Produces responsive, email-client-safe HTML with the firm's branding.
 */

export interface EmailTemplateOptions {
  /** The site base URL for logo and links (defaults to https://diazandjohnson.com) */
  siteUrl?: string
  /** Optional preheader text (hidden preview text in email clients) */
  preheader?: string
}

const DEFAULT_SITE_URL = "https://diazandjohnson.com"

// Brand colors
const NAVY = "#0B1E3A"
const GOLD = "#C4943D"
const CREAM = "#FAF8F5"
const DARK_TEXT = "#1a1a2e"
const MUTED_TEXT = "#6b7280"
const WHITE = "#ffffff"

export function buildBrandedEmail(
  subject: string,
  bodyHtml: string,
  options: EmailTemplateOptions = {},
): string {
  const siteUrl = options.siteUrl ?? DEFAULT_SITE_URL
  const logoUrl = `${siteUrl}/logo.png`
  const preheader = options.preheader ?? ""

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${CREAM}; }

    /* Typography */
    body, td, p { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, Helvetica, sans-serif; }

    /* Links */
    a { color: ${GOLD}; text-decoration: underline; }
    a:hover { color: ${NAVY}; }

    /* Content styles */
    .email-body h1, .email-body h2, .email-body h3 {
      color: ${NAVY};
      margin-top: 24px;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .email-body h1 { font-size: 24px; }
    .email-body h2 { font-size: 20px; }
    .email-body h3 { font-size: 17px; }
    .email-body p { margin: 0 0 16px 0; line-height: 1.65; color: ${DARK_TEXT}; font-size: 15px; }
    .email-body ul, .email-body ol { margin: 0 0 16px 0; padding-left: 24px; color: ${DARK_TEXT}; font-size: 15px; }
    .email-body li { margin-bottom: 6px; line-height: 1.55; }
    .email-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .email-body img { max-width: 100%; height: auto; }
    .email-body blockquote { border-left: 3px solid ${GOLD}; padding-left: 16px; margin: 16px 0; color: ${MUTED_TEXT}; font-style: italic; }

    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-padding { padding: 24px 20px !important; }
      .header-padding { padding: 20px !important; }
      .footer-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};width:100%;">

  <!-- Preheader (hidden preview text) -->
  ${preheader ? `<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" class="email-container" style="max-width:580px;width:100%;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td class="header-padding" style="background-color:${NAVY};padding:28px 36px;border-radius:12px 12px 0 0;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" target="_blank" style="text-decoration:none;">
                      <img src="${logoUrl}" alt="Diaz &amp; Johnson Immigration Law" width="200" style="display:block;max-width:200px;height:auto;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-weight:600;">
                      Immigration Law Firm
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== GOLD ACCENT LINE ===== -->
          <tr>
            <td style="background:linear-gradient(90deg, ${GOLD}, ${NAVY});height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td class="email-padding email-body" style="background-color:${WHITE};padding:36px 40px;font-size:15px;line-height:1.65;color:${DARK_TEXT};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ===== CTA / DIVIDER ===== -->
          <tr>
            <td style="background-color:${WHITE};padding:0 40px 32px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top:2px solid ${CREAM};padding-top:24px;" align="center">
                    <a href="${siteUrl}/consult" target="_blank" style="display:inline-block;background-color:${NAVY};color:${WHITE};font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
                      Schedule a Consultation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td class="footer-padding" style="background-color:${NAVY};padding:32px 36px;border-radius:0 0 12px 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                <!-- Firm info -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:${WHITE};letter-spacing:0.5px;">
                      Diaz &amp; Johnson Immigration Law
                    </p>
                    <p style="margin:0;font-size:12px;color:${GOLD};letter-spacing:1px;text-transform:uppercase;">
                      Trusted Legal Counsel
                    </p>
                  </td>
                </tr>

                <!-- Contact details -->
                <tr>
                  <td align="center" style="padding-bottom:18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 12px;">
                          <a href="tel:+1-555-000-0000" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;">
                            &#9742; (555) 000-0000
                          </a>
                        </td>
                        <td style="color:rgba(255,255,255,0.3);font-size:13px;">|</td>
                        <td style="padding:0 12px;">
                          <a href="mailto:info@diazandjohnson.com" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;">
                            &#9993; info@diazandjohnson.com
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Website link -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <a href="${siteUrl}" target="_blank" style="color:${GOLD};text-decoration:none;font-size:13px;font-weight:600;">
                      www.diazandjohnson.com
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="border-top:1px solid rgba(255,255,255,0.15);"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Disclaimer -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.5);">
                      This email was sent by Diaz &amp; Johnson Immigration Law. You are receiving this because you submitted a form on our website or engaged with our services.
                    </p>
                  </td>
                </tr>

                <!-- Legal -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:10px;line-height:1.5;color:rgba(255,255,255,0.35);">
                      &copy; ${new Date().getFullYear()} Diaz &amp; Johnson Immigration Law. All rights reserved.<br />
                      This email may contain privileged or confidential information. If you received it in error, please notify us immediately.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
