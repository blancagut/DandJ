/**
 * Branded HTML email template — Diaz & Johnson Immigration Law
 * Header and footer mirror the actual website design (navy/gold/cream palette,
 * logo, navigation, multi-column footer with practice areas, social links, legal).
 * Uses email-safe table-based layout with inline styles.
 */

export interface EmailTemplateOptions {
  /** The site base URL (logo href, nav links). Defaults to https://diazandjohnson.online */
  siteUrl?: string
  /** Hidden preview text shown in email client inbox list */
  preheader?: string
  /** Path to logo under siteUrl. Defaults to /logo.png */
  logoPath?: string
  /** Support phone displayed in header and footer */
  supportPhone?: string
  /** Support email displayed in footer */
  supportEmail?: string
  /** Optional unsubscribe link URL */
  unsubscribeUrl?: string
}

const DEFAULT_SITE_URL = "https://diazandjohnson.online"
const DEFAULT_LOGO_PATH = "/logo.png"
const DEFAULT_PHONE = "305-728-0029"
const DEFAULT_EMAIL = "info@diazandjohnson.online"

// ── Brand colors (exact match to globals.css + Tailwind config) ──────────────
const NAVY = "#0B1E3A"
const GOLD = "#C4943D"
const CREAM = "#FAF8F5"
const WHITE = "#ffffff"
const BODY_TEXT = "#1a1a2e"
const MUTED = "#6b7280"

export function buildBrandedEmail(
  subject: string,
  bodyHtml: string,
  options: EmailTemplateOptions = {},
): string {
  const siteUrl = options.siteUrl ?? DEFAULT_SITE_URL
  const logoUrl = `${siteUrl}${options.logoPath ?? DEFAULT_LOGO_PATH}`
  const preheader = options.preheader ?? ""
  const supportPhone = options.supportPhone ?? DEFAULT_PHONE
  const supportEmail = options.supportEmail ?? DEFAULT_EMAIL
  const unsubscribeUrl = options.unsubscribeUrl
  const telHref = normalizeTelHref(supportPhone)
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; display:block; }
    body { margin:0; padding:0; width:100% !important; background-color:${CREAM}; }
    body, td, p, a, span { font-family:'Segoe UI',Tahoma,Geneva,Verdana,Arial,Helvetica,sans-serif; }

    /* Body content styles */
    .email-body h1, .email-body h2, .email-body h3 { color:${NAVY}; margin-top:24px; margin-bottom:12px; line-height:1.3; }
    .email-body h1 { font-size:24px; }
    .email-body h2 { font-size:20px; }
    .email-body h3 { font-size:17px; }
    .email-body p { margin:0 0 16px 0; line-height:1.65; color:${BODY_TEXT}; font-size:15px; }
    .email-body ul, .email-body ol { margin:0 0 16px 0; padding-left:24px; color:${BODY_TEXT}; font-size:15px; }
    .email-body li { margin-bottom:6px; line-height:1.55; }
    .email-body hr { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
    .email-body blockquote { border-left:3px solid ${GOLD}; padding-left:16px; margin:16px 0; color:${MUTED}; font-style:italic; }
    .email-body img { max-width:100%; height:auto; }
    a { color:${GOLD}; }

    /* Responsive */
    @media only screen and (max-width:620px) {
      .outer-wrap { padding:0 !important; }
      .email-container { width:100% !important; max-width:100% !important; }
      .header-topbar { padding:16px 20px !important; }
      .header-phone { display:none !important; }
      .nav-row { display:none !important; font-size:0 !important; max-height:0 !important; overflow:hidden !important; }
      .body-cell { padding:28px 20px !important; }
      .cta-wrap { padding:0 20px 32px !important; }
      .footer-grid { padding:28px 20px 16px !important; }
      .footer-col-1 { display:block !important; width:100% !important; padding-right:0 !important; padding-bottom:24px !important; }
      .footer-col-2, .footer-col-3, .footer-col-4 { display:none !important; font-size:0 !important; max-height:0 !important; overflow:hidden !important; }
      .footer-bottom { padding:14px 20px !important; }
      .footer-legal-links { display:none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">

  ${preheader ? `<div style="display:none;font-size:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <!-- ╔══════════════════════════════════════════════════╗ -->
  <!-- ║  OUTER WRAPPER                                   ║ -->
  <!-- ╚══════════════════════════════════════════════════╝ -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${CREAM};">
    <tr>
      <td class="outer-wrap" align="center" style="padding:32px 16px;">

        <!-- EMAIL CARD (600px, matches site max-content width feel) -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container"
          style="max-width:600px;width:100%;box-shadow:0 4px 32px rgba(11,30,58,0.18);">


          <!-- ┌─────────────────────────────────────────────────────┐ -->
          <!-- │  HEADER — mirrors site <header>                     │ -->
          <!-- │  navy bg · logo left · phone + CTA right · nav bar  │ -->
          <!-- └─────────────────────────────────────────────────────┘ -->
          <tr>
            <td style="background-color:${NAVY};">

              <!-- Top bar: logo + phone + CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                class="header-topbar" style="padding:20px 32px 16px 32px;">
                <tr>
                  <!-- Logo -->
                  <td align="left" valign="middle" width="1">
                    <a href="${siteUrl}" target="_blank" style="text-decoration:none;border:0;">
                      <img src="${logoUrl}" alt="Diaz &amp; Johnson Immigration Law"
                        height="68" style="max-height:68px;width:auto;display:block;" />
                    </a>
                  </td>
                  <!-- Phone + CTA -->
                  <td align="right" valign="middle" class="header-phone" style="white-space:nowrap;">
                    <a href="tel:${telHref}"
                      style="color:rgba(255,255,255,0.80);text-decoration:none;font-size:13px;font-weight:500;margin-right:18px;vertical-align:middle;">
                      &#9742;&nbsp;${escapeHtml(supportPhone)}
                    </a>
                    <a href="${siteUrl}/consult" target="_blank"
                      style="display:inline-block;background-color:${GOLD};color:${NAVY};font-size:12px;font-weight:700;padding:8px 18px;border-radius:5px;text-decoration:none;vertical-align:middle;letter-spacing:0.2px;">
                      Free Consultation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Navigation bar (matches desktop nav) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                class="nav-row" style="border-top:1px solid rgba(255,255,255,0.10);">
                <tr>
                  <td align="center" style="padding:10px 32px;">
                    <a href="${siteUrl}" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Home</a>
                    <span style="color:rgba(255,255,255,0.18);font-size:11px;">|</span>
                    <a href="${siteUrl}/areas" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Practice Areas</a>
                    <span style="color:rgba(255,255,255,0.18);font-size:11px;">|</span>
                    <a href="${siteUrl}/team" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Our Team</a>
                    <span style="color:rgba(255,255,255,0.18);font-size:11px;">|</span>
                    <a href="${siteUrl}/#success-stories" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Success Stories</a>
                    <span style="color:rgba(255,255,255,0.18);font-size:11px;">|</span>
                    <a href="${siteUrl}/consult" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Consultation</a>
                    <span style="color:rgba(255,255,255,0.18);font-size:11px;">|</span>
                    <a href="${siteUrl}/#contact" target="_blank"
                      style="color:rgba(255,255,255,0.78);text-decoration:none;font-size:11.5px;font-weight:500;margin:0 8px;">Contact</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GOLD ACCENT BAR (matches site gold accent stripe below header) -->
          <tr>
            <td style="background:linear-gradient(90deg,${GOLD} 0%,#b07e29 60%,${NAVY} 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>


          <!-- ┌─────────────────────────────────────────────────────┐ -->
          <!-- │  EMAIL BODY                                         │ -->
          <!-- └─────────────────────────────────────────────────────┘ -->
          <tr>
            <td class="body-cell email-body"
              style="background-color:${WHITE};padding:40px 40px 28px 40px;font-size:15px;line-height:1.65;color:${BODY_TEXT};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- CTA BLOCK -->
          <tr>
            <td class="cta-wrap" style="background-color:${WHITE};padding:0 40px 44px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top:2px solid ${CREAM};padding-top:28px;" align="center">
                    <p style="margin:0 0 18px 0;font-size:14px;color:${MUTED};line-height:1.5;">
                      Ready to take the next step in your immigration journey?
                    </p>
                    <a href="${siteUrl}/consult" target="_blank"
                      style="display:inline-block;background-color:${NAVY};color:${WHITE};font-size:14px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.4px;">
                      Schedule a Free Consultation
                    </a>
                    <br />
                    <a href="tel:${telHref}"
                      style="display:inline-block;color:${GOLD};text-decoration:none;font-size:13px;font-weight:600;margin-top:12px;">
                      &#9742;&nbsp;Call us: ${escapeHtml(supportPhone)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- ┌─────────────────────────────────────────────────────┐ -->
          <!-- │  FOOTER — mirrors site <footer>                     │ -->
          <!-- │  navy · logo+tagline+social · 3 link cols · legal   │ -->
          <!-- └─────────────────────────────────────────────────────┘ -->
          <tr>
            <td style="background-color:${NAVY};">

              <!-- Footer 4-column grid -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                class="footer-grid" style="padding:40px 32px 24px 32px;">
                <tr valign="top">

                  <!-- Col 1: Logo + tagline + social icons -->
                  <td class="footer-col-1" width="36%" style="padding-right:20px;vertical-align:top;">
                    <a href="${siteUrl}" target="_blank" style="border:0;display:inline-block;">
                      <img src="${logoUrl}" alt="Diaz &amp; Johnson" height="50"
                        style="max-height:50px;width:auto;display:block;" />
                    </a>
                    <p style="margin:14px 0 18px 0;font-size:12.5px;color:rgba(255,255,255,0.60);line-height:1.65;max-width:190px;">
                      Experienced immigration attorneys fighting for your future and your family.
                    </p>
                    <!-- Social badges -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:6px;">
                          <a href="https://facebook.com/diazandjohnson" target="_blank"
                            style="display:inline-block;width:30px;height:30px;line-height:30px;background:rgba(255,255,255,0.12);border-radius:50%;text-align:center;color:${WHITE};text-decoration:none;font-size:13px;font-weight:700;">f</a>
                        </td>
                        <td style="padding-right:6px;">
                          <a href="https://x.com/" target="_blank"
                            style="display:inline-block;width:30px;height:30px;line-height:30px;background:rgba(255,255,255,0.12);border-radius:50%;text-align:center;color:${WHITE};text-decoration:none;font-size:12px;font-weight:800;">X</a>
                        </td>
                        <td style="padding-right:6px;">
                          <a href="https://linkedin.com/" target="_blank"
                            style="display:inline-block;width:30px;height:30px;line-height:30px;background:rgba(255,255,255,0.12);border-radius:50%;text-align:center;color:${WHITE};text-decoration:none;font-size:11px;font-weight:700;">in</a>
                        </td>
                        <td>
                          <a href="https://www.instagram.com/" target="_blank"
                            style="display:inline-block;width:30px;height:30px;line-height:28px;background:rgba(255,255,255,0.12);border-radius:50%;text-align:center;color:${WHITE};text-decoration:none;font-size:16px;">&#9633;</a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Col 2: Practice Areas -->
                  <td class="footer-col-2" width="20%" style="padding-right:12px;vertical-align:top;">
                    <p style="margin:0 0 10px 0;font-size:11.5px;font-weight:700;color:${WHITE};text-transform:uppercase;letter-spacing:0.8px;">Practice Areas</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/areas/immigration" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Immigration Law</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/areas/greencard" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Green Card</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/areas/criminal-defense" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Criminal Defense</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/areas/civil-rights" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Civil Rights</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/areas/family-law" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Family Law</a></td></tr>
                      <tr><td><a href="${siteUrl}/areas/business-immigration" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Business Immigration</a></td></tr>
                    </table>
                  </td>

                  <!-- Col 3: Company -->
                  <td class="footer-col-3" width="19%" style="padding-right:12px;vertical-align:top;">
                    <p style="margin:0 0 10px 0;font-size:11.5px;font-weight:700;color:${WHITE};text-transform:uppercase;letter-spacing:0.8px;">Company</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/about" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">About Us</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/team" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Our Team</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/#success-stories" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Success Stories</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/#contact" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Contact</a></td></tr>
                    </table>
                  </td>

                  <!-- Col 4: Resources + contact -->
                  <td class="footer-col-4" width="25%" style="vertical-align:top;">
                    <p style="margin:0 0 10px 0;font-size:11.5px;font-weight:700;color:${WHITE};text-transform:uppercase;letter-spacing:0.8px;">Resources</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/resources#blog" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Blog</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/resources#faqs" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">FAQs</a></td></tr>
                      <tr><td style="padding-bottom:7px;"><a href="${siteUrl}/resources#case-studies" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">Case Studies</a></td></tr>
                      <tr><td style="padding-bottom:14px;"><a href="${siteUrl}/resources#news" target="_blank" style="color:rgba(255,255,255,0.60);text-decoration:none;font-size:11.5px;line-height:1.4;">News</a></td></tr>
                    </table>
                    <p style="margin:0 0 8px 0;font-size:11.5px;font-weight:700;color:${WHITE};text-transform:uppercase;letter-spacing:0.8px;">Get in Touch</p>
                    <a href="tel:${telHref}" style="display:block;color:${GOLD};text-decoration:none;font-size:12px;font-weight:700;margin-bottom:5px;">${escapeHtml(supportPhone)}</a>
                    <a href="mailto:${escapeHtml(supportEmail)}" style="display:block;color:rgba(255,255,255,0.55);text-decoration:none;font-size:11.5px;">${escapeHtml(supportEmail)}</a>
                    <a href="${siteUrl}/consult" target="_blank"
                      style="display:inline-block;margin-top:14px;background-color:${GOLD};color:${NAVY};font-size:11px;font-weight:700;padding:7px 14px;border-radius:4px;text-decoration:none;letter-spacing:0.2px;">
                      Free Consultation
                    </a>
                  </td>

                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                style="padding:0 32px;">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Bottom bar: copyright + legal links -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                class="footer-bottom" style="padding:16px 32px;">
                <tr>
                  <td align="left" valign="middle">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.38);">
                      &copy;&nbsp;${year} Diaz &amp; Johnson Immigration Law.
                    </p>
                  </td>
                  <td align="right" valign="middle" class="footer-legal-links" style="white-space:nowrap;">
                    <a href="${siteUrl}/legal#privacy" target="_blank"
                      style="color:rgba(255,255,255,0.38);text-decoration:none;font-size:11px;margin-left:14px;">Privacy Policy</a>
                    <a href="${siteUrl}/legal#terms" target="_blank"
                      style="color:rgba(255,255,255,0.38);text-decoration:none;font-size:11px;margin-left:14px;">Terms</a>
                    <a href="${siteUrl}/legal#disclaimer" target="_blank"
                      style="color:rgba(255,255,255,0.38);text-decoration:none;font-size:11px;margin-left:14px;">Disclaimer</a>
                  </td>
                </tr>
              </table>

              <!-- Legal disclaimer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                style="padding:0 32px 24px 32px;">
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:10px;line-height:1.65;color:rgba(255,255,255,0.28);text-align:center;max-width:480px;">
                      This email was sent by Diaz &amp; Johnson Immigration Law because you submitted a form or engaged with our services.
                      The content is for informational purposes only and does not constitute legal advice.
                      An attorney-client relationship is not established by receipt of this email.${unsubscribeUrl ? `&nbsp;<a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color:rgba(196,148,61,0.65);text-decoration:underline;">Unsubscribe</a>.` : ""}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <!-- /FOOTER -->

        </table>
        <!-- /EMAIL CARD -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

function normalizeTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "")
  if (cleaned.startsWith("+")) return cleaned
  if (cleaned.length === 10) return `+1${cleaned}`
  return `+1${cleaned}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
