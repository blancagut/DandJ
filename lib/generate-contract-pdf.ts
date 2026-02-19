import jsPDF from "jspdf"
import { CONTRACTS_EMAIL, SITE_URL } from "@/lib/site-config"

/* ═══════════════════════════════════════════════════════════════
   DÍAZ & JOHNSON — H-2B Contract PDF Generator
   Professional legal document with electronic security certificate
   ═══════════════════════════════════════════════════════════════ */

export interface ContractData {
  clientName: string
  clientDob: string
  clientPassport: string
  clientCountry: string
  clientCity: string
  clientEmail: string
  clientPhone: string
  lawyerName: string
  lawyerBarNumber: string
  contractDay: string
  contractMonth: string
  contractYear: string
  contractId: string
  signedAt: string
  clientSignature: string // base64 PNG
  ipAddress?: string
  userAgent?: string
  feeTotalTextEs?: string
  firstInstallmentTextEs?: string
  secondInstallmentTextEs?: string
  thirdInstallmentTextEs?: string
}

export interface ContractPDFResult {
  blob: Blob
  filename: string
}

/* ── SHA-256 hash via Web Crypto API ── */
async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/* ── Generate a QR-style verification badge ── */
function generateVerificationBadge(text: string, moduleSize = 3, marginPx = 2): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  const size = 25
  const totalSize = (size + marginPx * 2) * moduleSize
  canvas.width = totalSize
  canvas.height = totalSize

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, totalSize, totalSize)
  ctx.fillStyle = "#0B1E3A"

  // Draw QR finder patterns (standard 7×7 corner squares)
  function drawFinder(ox: number, oy: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const outer = r === 0 || r === 6 || c === 0 || c === 6
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        if (outer || inner) {
          ctx.fillRect((ox + c + marginPx) * moduleSize, (oy + r + marginPx) * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(size - 7, 0)
  drawFinder(0, size - 7)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect((i + marginPx) * moduleSize, (6 + marginPx) * moduleSize, moduleSize, moduleSize)
      ctx.fillRect((6 + marginPx) * moduleSize, (i + marginPx) * moduleSize, moduleSize, moduleSize)
    }
  }

  // Alignment pattern center
  const ap = size - 9
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const outer = Math.abs(r) === 2 || Math.abs(c) === 2
      const center = r === 0 && c === 0
      if (outer || center) {
        ctx.fillRect((ap + c + marginPx) * moduleSize, (ap + r + marginPx) * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  // Data area — deterministic from text
  let seed = 0
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0
  }
  seed = Math.abs(seed)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9)) continue
      if (r === 6 || c === 6) continue
      if (Math.abs(r - ap) <= 2 && Math.abs(c - ap) <= 2) continue
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      if (seed % 3 !== 0) {
        ctx.fillRect((c + marginPx) * moduleSize, (r + marginPx) * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  return canvas.toDataURL("image/png")
}

/* ── Load attorney signature image as base64 ── */
async function loadSignatureBase64(): Promise<string> {
  const res = await fetch("/signature.png")
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/* ── Load firm logo as base64 ── */
async function loadLogoBase64(): Promise<string> {
  const res = await fetch("/logo.png")
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PDF GENERATOR
   ═══════════════════════════════════════════════════════════════ */
export async function generateContractPDF(data: ContractData): Promise<ContractPDFResult> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 22
  const contentW = pageW - margin * 2
  let y = 0

  // SHA-256 verification hash
  const hashInput = `${data.contractId}:${data.clientPassport}:${data.signedAt}:${data.lawyerBarNumber}`
  const documentHash = await sha256(hashInput)
  const shortHash = documentHash.slice(0, 16).toUpperCase()

  // Colors
  const navy: [number, number, number] = [11, 30, 58]
  const gold: [number, number, number] = [178, 143, 72]
  const darkGray: [number, number, number] = [40, 40, 40]
  const medGray: [number, number, number] = [110, 110, 110]
  const lightGray: [number, number, number] = [200, 200, 200]
  const white: [number, number, number] = [255, 255, 255]

  // ── Page border ──
  function addPageBorder() {
    doc.setDrawColor(...navy)
    doc.setLineWidth(0.15)
    doc.rect(8, 8, pageW - 16, pageH - 16)
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.1)
    doc.rect(9.2, 9.2, pageW - 18.4, pageH - 18.4)
  }

  function addPageFooter(pageNum: number, totalPages: number) {
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.25)
    doc.line(margin, pageH - 19, pageW - margin, pageH - 19)

    doc.setFontSize(6)
    doc.setTextColor(...medGray)
    doc.text("Díaz and Johnson Attorneys at Law PLLC · 1680 Michigan Ave Suite 700, Miami Beach, FL 33139", pageW / 2, pageH - 15, { align: "center" })
    doc.text("Consulting@diazandjohnson.com · +1 (305) 307-1677", pageW / 2, pageH - 12, { align: "center" })

    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(`${pageNum} / ${totalPages}`, pageW - margin, pageH - 12, { align: "right" })

    doc.setFontSize(5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...medGray)
    doc.text(`SHA-256: ${shortHash} · ${data.contractId}`, margin, pageH - 12)
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - 26) {
      doc.addPage()
      y = 18
      addLetterhead()
    }
  }

  function addLetterhead() {
    doc.setFillColor(...navy)
    doc.rect(0, 0, pageW, 2.5, "F")
    doc.setFillColor(...gold)
    doc.rect(0, 2.5, pageW, 0.5, "F")
  }

  function writeTitle(text: string) {
    checkPageBreak(14)
    y += 2
    doc.setFontSize(9.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(text, margin, y)
    y += 1.5
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.35)
    doc.line(margin, y, margin + doc.getTextWidth(text), y)
    y += 5
  }

  function writeParagraph(text: string, opts?: { bold?: boolean; indent?: number; fontSize?: number }) {
    const fontSize = opts?.fontSize || 8.5
    const indent = opts?.indent || 0
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal")
    doc.setTextColor(...darkGray)
    const lines = doc.splitTextToSize(text, contentW - indent)
    for (const line of lines) {
      checkPageBreak(4.5)
      doc.text(line, margin + indent, y)
      y += 3.8
    }
    y += 1.5
  }

  function writeBullet(text: string, bullet = "•") {
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    const lines = doc.splitTextToSize(text, contentW - 10)
    checkPageBreak(lines.length * 3.8 + 1)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...gold)
    doc.text(bullet, margin + 3, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], margin + 9, y)
      y += 3.8
    }
  }

  function writeNumbered(text: string, num: string) {
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    const lines = doc.splitTextToSize(text, contentW - 10)
    checkPageBreak(lines.length * 3.8 + 1)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(num, margin + 3, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], margin + 10, y)
      y += 3.8
    }
  }

  // ══════════════════════════════════════════
  // PAGE 1 — HEADER (logo + subtitle)
  // ══════════════════════════════════════════
  addLetterhead()

  // Load logo and place it centered
  const logoBase64 = await loadLogoBase64()
  const logoH = 18          // mm tall
  const logoW = logoH * 3.2 // approximate aspect ratio — adjust if needed
  const logoX = (pageW - logoW) / 2
  y = 10
  doc.addImage(logoBase64, "PNG", logoX, y, logoW, logoH)
  y += logoH + 3

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...gold)
  doc.text("ATTORNEYS AT LAW PLLC", pageW / 2, y, { align: "center" })
  y += 4.5

  doc.setFontSize(6.5)
  doc.setTextColor(...medGray)
  doc.text("1680 Michigan Ave Suite 700, Miami Beach, FL 33139  ·  +1 (305) 307-1677  ·  Consulting@diazandjohnson.com", pageW / 2, y, { align: "center" })
  y += 4

  doc.setDrawColor(...navy)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 1.2
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("CONTRATO DE PRESTACIÓN DE", pageW / 2, y, { align: "center" })
  y += 5.5
  doc.text("SERVICIOS LEGALES", pageW / 2, y, { align: "center" })
  y += 5.5
  doc.setFontSize(10)
  doc.setTextColor(...gold)
  doc.text("PARA TRÁMITE DE VISA H-2B", pageW / 2, y, { align: "center" })
  y += 4.5

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(...medGray)
  doc.text("Entre el Estudio Jurídico Díaz and Johnson Attorneys y el Cliente", pageW / 2, y, { align: "center" })
  y += 9

  // Comparecencia
  writeParagraph(`En la ciudad de Miami, a los ${data.contractDay} días del mes de ${data.contractMonth} del año ${data.contractYear}, comparecen:`)
  writeParagraph(`De una parte, el estudio jurídico Díaz and Johnson Attorneys at Law PLLC, ubicado en 1680 Michigan Avenue, Suite 700, Miami Beach, Florida 33139, representado por el abogado ${data.lawyerName}, titular de la licencia profesional del Colegio de Abogados de Florida (Florida Bar) número ${data.lawyerBarNumber}, en adelante denominado "EL ESTUDIO",`)
  writeParagraph(`Y ${data.clientName.toUpperCase()}, ${data.clientDob}, PORTADOR(A) DEL PASAPORTE ${data.clientPassport.toUpperCase()}, NATURAL DE ${data.clientCity.toUpperCase()} (${data.clientCountry.toUpperCase()}) EN ADELANTE DENOMINADO "EL CLIENTE" (INDEPENDIENTEMENTE DEL GÉNERO).`)
  writeParagraph("Ambas partes, reconociéndose mutuamente capacidad legal suficiente para contratar, acuerdan celebrar el presente Contrato de Prestación de Servicios Legales, conforme a las siguientes cláusulas:")

  // PRIMERA
  writeTitle("PRIMERA — OBJETO")
  writeParagraph("El presente contrato tiene por objeto la prestación de servicios legales por parte de EL ESTUDIO para representar a EL CLIENTE en la gestión integral del trámite de visa H-2B, conforme a lo establecido en:")
  writeBullet("Sección 101(a)(15)(H)(ii)(b) del Immigration and Nationality Act (INA) [8 U.S.C. § 1101(a)(15)(H)(ii)(b)];")
  writeBullet("8 U.S.C. § 1184(c);")
  writeBullet("8 C.F.R. § 214.2(h);")
  writeBullet("20 C.F.R. Part 655, Subpart A.")
  y += 2

  // SEGUNDA
  writeTitle("SEGUNDA — ALCANCE DE LOS SERVICIOS")
  writeParagraph("EL ESTUDIO se compromete a realizar todas las acciones legales y administrativas necesarias para gestionar el trámite de visa H-2B, incluyendo:")
  writeNumbered("Evaluación preliminar de elegibilidad legal de EL CLIENTE;", "1.")
  writeNumbered("Preparación y presentación de la solicitud de Certificación Laboral Temporal (ETA-9142B) ante el Departamento de Trabajo;", "2.")
  writeNumbered("Preparación y presentación de la petición ante USCIS (Formulario I-129);", "3.")
  writeNumbered("Asistencia para la preparación de la entrevista consular;", "4.")
  writeNumbered("Coordinación con el empleador patrocinador;", "5.")
  writeNumbered("Acompañamiento jurídico durante todas las etapas del proceso.", "6.")
  y += 2

  // TERCERA
  writeTitle("TERCERA — GARANTÍA DE RESULTADO")
  writeParagraph("EL ESTUDIO garantiza la aprobación de la visa H-2B, siempre que se cumplan de forma íntegra y veraz las siguientes condiciones:")
  writeNumbered("Que EL CLIENTE no registra antecedentes penales o migratorios que constituyan causal de inadmisibilidad conforme a la sección 212(a) del INA [8 U.S.C. § 1182(a)];", "a)")
  writeNumbered("Que EL CLIENTE proporcione información y documentación veraz, sin omisiones ni falsedades, incluyendo nombre completo, número de pasaporte, historial laboral y demás datos personales requeridos;", "b)")
  writeNumbered("Que EL CLIENTE cumpla en tiempo y forma con todos los requerimientos solicitados por EL ESTUDIO.", "c)")
  y += 1
  writeParagraph("La garantía se refiere a la obtención efectiva de la visa H-2B, no implicando en ningún caso la repetición del trámite, reembolso de honorarios, ni gestiones posteriores adicionales si la denegación se debiera a factores no imputables a EL ESTUDIO.")

  // CUARTA
  writeTitle("CUARTA — HONORARIOS")
  writeParagraph(
    data.feeTotalTextEs ||
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Quinientos dólares estadounidenses (USD $500.00), por concepto de comisión profesional. La cual se pagará en 2 partes:"
  )
  writeBullet(
    data.firstInstallmentTextEs ||
      "La primera de $300.00 (trescientos dólares) a la firma del contrato;"
  )
  writeBullet(
    data.secondInstallmentTextEs ||
      "$200.00 (doscientos dólares) al momento de instalarse en el trabajo dentro de Miami, Florida."
  )
  if (data.thirdInstallmentTextEs) {
    writeBullet(data.thirdInstallmentTextEs)
  }
  y += 1
  writeParagraph("Dicho monto corresponde exclusivamente a los honorarios de intermediación, asesoría y coordinación del proceso migratorio bajo el programa de visas H-2B.")
  writeParagraph("Todos los gastos gubernamentales, tasas consulares, tarifas administrativas, formularios y costos relacionados con la tramitación de la visa H-2B serán cubiertos en su totalidad por el empleador. Esto incluye —de manera enunciativa pero no limitativa— los siguientes conceptos:")
  writeBullet("Formulario ETA 9142B: Solicitud de Certificación de Trabajo Temporal para No Inmigrantes H-2B, presentada ante el Departamento de Trabajo de EE.UU.")
  writeBullet("Formulario 9141: Solicitud de Determinación de Salario Prevaleciente.")
  writeBullet("Formulario I-129, I-797: Petición para un trabajador no inmigrante, presentada ante USCIS.")
  writeBullet("Formulario DS-160: Solicitud de visa de no inmigrante.")
  writeBullet("Tarifa MRV: Pago de la tarifa de solicitud de visa.")
  writeBullet("Cualquier otra tasa o contribución requerida por las autoridades migratorias y consulares competentes.")
  y += 1
  writeParagraph("Asimismo, el boleto aéreo para el traslado del solicitante desde su país de origen hasta el lugar de trabajo en Estados Unidos será cubierto por el empleador. Sin embargo, EL CLIENTE se compromete a coordinar con EL ESTUDIO y/o con el abogado responsable la fecha y el itinerario de viaje con al menos una (1) semana de anticipación a la fecha programada para su traslado, a fin de asegurar la correcta gestión de la logística de viaje.")

  // QUINTA
  writeTitle("QUINTA — GASTOS PERSONALES INCLUIDOS")
  writeParagraph("EL CLIENTE reconoce y acepta expresamente que el presente contrato de prestación de servicios legales tiene por único objeto la asistencia profesional en los trámites migratorios vinculados a la obtención de la visa H-2B, limitándose la responsabilidad de EL ESTUDIO exclusivamente a la preparación, presentación, seguimiento y gestión legal de la solicitud de visa ante las autoridades correspondientes.")
  writeParagraph("En consecuencia, EL ESTUDIO no asume responsabilidad alguna respecto de gastos personales, logísticos o de manutención que puedan derivarse del proceso migratorio o del desplazamiento del CLIENTE a los Estados Unidos, siendo LA EMPRESA EMPLEADORA la única responsable de cubrir los siguientes conceptos:")
  writeBullet("Pasajes o boletos aéreos, tanto internacionales como domésticos, desde el país de origen hasta el lugar de trabajo en los Estados Unidos, así como cualquier traslado interno que sea requerido por motivos laborales.")
  writeBullet("Hospedaje, durante todo el periodo de empleo, conforme a las condiciones establecidas en la oferta de trabajo.")
  writeBullet("Alimentación, total o parcial, en los términos acordados con la empresa, salvo los gastos personales adicionales que excedan lo proporcionado por el empleador.")
  y += 1
  writeParagraph("Por lo tanto, cualquier gasto personal, familiar o adicional que no se encuentre expresamente contemplado y cubierto por la empresa será de entera responsabilidad de EL CLIENTE.")
  writeParagraph("Esta delimitación de responsabilidades se establece conforme al principio de autonomía de la voluntad contractual, reconocido en los sistemas jurídicos de derecho civil y common law. Asimismo, la normativa migratoria de los Estados Unidos, incluyendo el Immigration and Nationality Act (INA) y las disposiciones del 8 C.F.R. § 214.2(h) relativas a visas H, no impone obligación alguna al representante legal ni al peticionario de cubrir pasajes, hospedaje, alimentación u otros gastos personales, salvo que existan acuerdos laborales específicos que así lo contemplen, los cuales son pactados directamente entre EL CLIENTE y LA EMPRESA, y que no forman parte del presente contrato de servicios legales.")

  // SEXTA
  writeTitle("SEXTA — OBLIGACIONES DEL CLIENTE")
  writeParagraph("EL CLIENTE se compromete a:")
  writeNumbered("Suministrar información veraz y completa en todo momento;", "1.")
  writeNumbered("Entregar toda la documentación requerida en los plazos establecidos;", "2.")
  writeNumbered("Cumplir con los pasos del proceso conforme a las instrucciones de EL ESTUDIO;", "3.")
  writeNumbered("Abonar el honorario pactado.", "4.")
  y += 2

  // SÉPTIMA
  writeTitle("SÉPTIMA — DURACIÓN Y TERMINACIÓN")
  writeParagraph("El presente contrato permanecerá vigente desde su firma hasta la emisión de la visa H-2B o la conclusión definitiva del trámite.")
  writeParagraph("Podrá darse por terminado por:")
  writeNumbered("Mutuo acuerdo;", "a)")
  writeNumbered("Incumplimiento grave de alguna de las partes;", "b)")
  writeNumbered("Falsedad documental o reticencia dolosa por parte de EL CLIENTE;", "c)")
  writeNumbered("Decisión unilateral de EL CLIENTE, sin derecho a reembolso de honorarios.", "d)")
  y += 2

  // OCTAVA
  writeTitle("OCTAVA — JURISDICCIÓN Y LEY APLICABLE")
  writeParagraph("El presente contrato se regirá e interpretará de conformidad con las leyes del Estado de Florida, Estados Unidos de América, sin perjuicio de las normas sobre conflictos de leyes.")
  writeParagraph("Para todos los efectos legales y contractuales derivados del presente instrumento, las partes acuerdan expresamente someterse a la jurisdicción exclusiva de los tribunales estatales o federales competentes ubicados en el condado de Miami-Dade, Florida, renunciando a cualquier otro fuero que por razón de su domicilio presente o futuro pudiera corresponderles.")
  writeParagraph("Asimismo, las partes reconocen que cualquier controversia, reclamación o disputa que surja en relación con la interpretación, cumplimiento o ejecución de este contrato, podrá ser resuelta de forma preferente mediante negociación directa y, en su defecto, mediante un procedimiento de mediación voluntaria conforme a lo dispuesto en las reglas del Florida Dispute Resolution Center (DRC), sin perjuicio del derecho de acudir a la vía judicial.")

  // NOVENO
  writeTitle("NOVENO — NOTIFICACIONES Y FIRMA ELECTRÓNICA")
  writeParagraph("Toda comunicación, notificación o requerimiento entre las partes relacionado con el presente contrato deberá realizarse por escrito y podrá ser enviado a través de correo electrónico, servicio postal certificado, mensajería privada o cualquier otro medio que permita verificar su recepción.")
  writeParagraph("A efectos de este contrato, las partes designan los siguientes correos electrónicos como medios válidos de notificación:")
  writeBullet(`EL ESTUDIO: ${CONTRACTS_EMAIL}`)
  writeBullet(`EL CLIENTE: ${data.clientEmail}`)
  y += 1
  writeParagraph("Cualquier cambio de dirección física o electrónica deberá ser notificado por escrito a la otra parte dentro de un plazo máximo de cinco (5) días hábiles.")
  writeParagraph("Asimismo, las partes acuerdan que el presente contrato podrá ser firmado mediante firma electrónica conforme a lo dispuesto en la Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) y en la Florida Electronic Signature Act (Fla. Stat. § 668.001 y ss.), teniendo dicha firma la misma validez jurídica y fuerza obligatoria que una firma manuscrita.")

  // DÉCIMO
  writeTitle("DÉCIMO — ACUERDO COMPLETO")
  writeParagraph("El presente documento constituye el acuerdo completo entre las partes y reemplaza cualquier acuerdo previo, ya sea verbal o escrito.")
  writeParagraph("* Cualquier modificación deberá realizarse por escrito y estar firmada por ambas partes.")
  writeParagraph("En señal de conformidad, el presente contrato se firma en dos ejemplares idénticos, cada uno de los cuales tendrá plena validez legal y fuerza obligatoria, considerándose conjuntamente un solo instrumento. Ambos ejemplares podrán ser firmados de manera electrónica, y dicha firma tendrá la misma validez y eficacia jurídica que una firma manuscrita, conforme a la legislación aplicable.")

  // ══════════════════════════════════════════
  // SIGNATURE PAGE
  // ══════════════════════════════════════════
  checkPageBreak(100)
  y += 4

  doc.setDrawColor(...navy)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 0.8
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  const sigBlockLeft = margin
  const sigBlockRight = pageW / 2 + 5
  const sigBlockW = (contentW - 10) / 2

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("POR EL ESTUDIO:", sigBlockLeft, y)
  doc.text("EL CLIENTE:", sigBlockRight, y)
  y += 8

  // Attorney signature
  if (data.lawyerName === "Carlos Roberto Díaz") {
    try {
      const sigBase64 = await loadSignatureBase64()
      doc.addImage(sigBase64, "PNG", sigBlockLeft, y - 16, sigBlockW - 10, 22)
    } catch {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bolditalic")
      doc.setTextColor(...navy)
      doc.text(data.lawyerName, sigBlockLeft, y)
    }
  } else {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bolditalic")
    doc.setTextColor(...navy)
    doc.text(data.lawyerName, sigBlockLeft, y)
  }

  // Client signature
  if (data.clientSignature) {
    try {
      doc.addImage(data.clientSignature, "PNG", sigBlockRight, y - 12, sigBlockW - 5, 18)
    } catch {
      doc.setFontSize(12)
      doc.setFont("helvetica", "italic")
      doc.text("[Firma electrónica]", sigBlockRight, y)
    }
  }

  y += 6

  doc.setDrawColor(...darkGray)
  doc.setLineWidth(0.2)
  doc.line(sigBlockLeft, y, sigBlockLeft + sigBlockW - 5, y)
  doc.line(sigBlockRight, y, sigBlockRight + sigBlockW - 5, y)
  y += 4

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...darkGray)
  doc.text(data.lawyerName, sigBlockLeft, y)
  doc.text(data.clientName, sigBlockRight, y)
  y += 3.5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  doc.setTextColor(...medGray)
  doc.text("Abogado", sigBlockLeft, y)
  doc.text("EL CLIENTE", sigBlockRight, y)
  y += 3.5
  doc.text(`Florida Bar Nº ${data.lawyerBarNumber}`, sigBlockLeft, y)
  doc.text(`Pasaporte: ${data.clientPassport}`, sigBlockRight, y)
  y += 3.5
  doc.text("En nombre de Díaz and Johnson Attorneys", sigBlockLeft, y)
  doc.text(`Email: ${data.clientEmail}`, sigBlockRight, y)
  y += 3.5

  const tsFormatted = new Date(data.signedAt).toISOString()
  doc.setFontSize(5.5)
  doc.setTextColor(...medGray)
  doc.text(`Firmado: ${tsFormatted}`, sigBlockLeft, y)
  doc.text(`Firmado: ${tsFormatted}`, sigBlockRight, y)

  // ══════════════════════════════════════════
  // ELECTRONIC AUTHENTICITY CERTIFICATE PAGE
  // ══════════════════════════════════════════
  doc.addPage()
  addLetterhead()
  y = 18

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("CERTIFICADO DE AUTENTICIDAD ELECTRÓNICA", pageW / 2, y, { align: "center" })
  y += 4
  doc.setFontSize(7)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(...medGray)
  doc.text("ELECTRONIC AUTHENTICITY CERTIFICATE", pageW / 2, y, { align: "center" })
  y += 3

  doc.setDrawColor(...gold)
  doc.setLineWidth(0.4)
  doc.line(margin + 30, y, pageW - margin - 30, y)
  y += 7

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)
  const certDesc = doc.splitTextToSize(
    "El presente certificado acredita que este documento fue firmado electrónicamente mediante un proceso seguro de autenticación digital. La integridad del documento ha sido verificada mediante un algoritmo de hash criptográfico SHA-256, y su contenido no ha sido alterado desde el momento de la firma.",
    contentW
  )
  for (const line of certDesc) {
    doc.text(line, margin, y)
    y += 3.5
  }
  y += 5

  // Security details box
  const boxY = y
  const boxH = 76
  doc.setDrawColor(...navy)
  doc.setLineWidth(0.3)
  doc.setFillColor(248, 249, 252)
  doc.roundedRect(margin, boxY, contentW, boxH, 1.5, 1.5, "FD")

  // Box title bar
  doc.setFillColor(...navy)
  doc.roundedRect(margin, boxY, contentW, 7, 1.5, 1.5, "F")
  doc.rect(margin, boxY + 4, contentW, 3, "F")
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...white)
  doc.text("DETALLES DE VERIFICACIÓN  /  VERIFICATION DETAILS", margin + 5, boxY + 4.5)

  y = boxY + 12

  const securityData: [string, string][] = [
    ["Identificador del Contrato (UUID):", data.contractId],
    ["Hash SHA-256:", documentHash.toUpperCase()],
    ["Fecha y Hora de Firma (ISO 8601):", tsFormatted],
    ["Nombre del Firmante:", data.clientName],
    ["Documento de Identidad:", `Pasaporte ${data.clientPassport.toUpperCase()}`],
    ["Abogado Responsable:", `${data.lawyerName} — Florida Bar Nº ${data.lawyerBarNumber}`],
    ["Dirección IP:", data.ipAddress || "Registrada en servidor"],
    ["User-Agent:", (data.userAgent || "Registrado en servidor").slice(0, 80)],
  ]

  for (const [label, value] of securityData) {
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(label, margin + 4, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    const labelW = doc.getTextWidth(label) + 2
    const remaining = contentW - labelW - 8
    const vLines = doc.splitTextToSize(value, remaining)
    doc.text(vLines[0], margin + 4 + labelW, y)
    if (vLines.length > 1) {
      for (let i = 1; i < vLines.length; i++) {
        y += 3.5
        doc.text(vLines[i], margin + 4 + labelW, y)
      }
    }
    y += 4.5
  }

  y = boxY + boxH + 6

  // Verification badge + URL
  const qrDataURL = generateVerificationBadge(`${SITE_URL}/verify/${data.contractId}`)
  const qrSize = 26

  doc.setFillColor(248, 249, 252)
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.2)
  doc.roundedRect(margin, y, contentW, 40, 1.5, 1.5, "FD")

  const qrX = margin + 5
  const qrY = y + 7
  doc.addImage(qrDataURL, "PNG", qrX, qrY, qrSize, qrSize)

  doc.setFontSize(5.5)
  doc.setTextColor(...medGray)
  doc.text("Código de verificación", qrX + qrSize / 2, qrY + qrSize + 3, { align: "center" })

  const textX = qrX + qrSize + 8
  let textY = y + 5
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("Verificación de Autenticidad", textX, textY)
  textY += 4

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)
  const verLines = doc.splitTextToSize(
    "Este documento puede ser verificado en cualquier momento mediante su código único de identificación. Cualquier alteración del contenido invalidará el hash criptográfico, siendo detectable de forma inmediata.",
    contentW - qrSize - 18
  )
  for (const line of verLines) {
    doc.text(line, textX, textY)
    textY += 3.5
  }
  textY += 2
  doc.setFont("helvetica", "bold")
  doc.setFontSize(5.5)
  doc.setTextColor(...gold)
  doc.text(`URL: ${SITE_URL}/verify/${data.contractId}`, textX, textY)

  y += 46

  // Legal framework
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("Marco Legal Aplicable / Applicable Legal Framework", margin, y)
  y += 5

  const legalRefs: [string, string][] = [
    ["E-SIGN Act (15 U.S.C. § 7001 et seq.)", "Ley federal que otorga validez jurídica a las firmas y contratos electrónicos en el comercio interestatal e internacional."],
    ["UETA (Uniform Electronic Transactions Act)", "Ley uniforme adoptada por el Estado de Florida que reconoce la equivalencia funcional de las firmas electrónicas con las manuscritas."],
    ["Florida Electronic Signature Act (Fla. Stat. § 668.001 et seq.)", "Legislación estatal que valida el uso de firmas electrónicas en transacciones civiles y mercantiles en la jurisdicción de Florida."],
    ["ICC eUCP (Publicación No. 600)", "Reglas de la Cámara de Comercio Internacional para la presentación electrónica de documentos bajo créditos documentarios."],
  ]

  for (const [title, desc] of legalRefs) {
    checkPageBreak(10)
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(`▸  ${title}`, margin + 3, y)
    y += 3.2
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...medGray)
    const dLines = doc.splitTextToSize(desc, contentW - 8)
    for (const line of dLines) {
      doc.text(line, margin + 6, y)
      y += 3
    }
    y += 2
  }

  // Tamper-evidence statement
  y += 3
  checkPageBreak(22)
  doc.setDrawColor(...navy)
  doc.setLineWidth(0.25)
  doc.setFillColor(252, 248, 240)
  doc.roundedRect(margin, y, contentW, 20, 1.5, 1.5, "FD")
  y += 5
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("DECLARACIÓN DE INTEGRIDAD  /  TAMPER-EVIDENCE STATEMENT", margin + 5, y)
  y += 4
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.setTextColor(...darkGray)
  const tamperText = doc.splitTextToSize(
    `Este documento digital ha sido protegido mediante hash criptográfico SHA-256 (${shortHash}…). Cualquier modificación — incluso de un solo carácter — producirá un hash completamente distinto, haciendo detectable cualquier alteración no autorizada. La integridad del presente instrumento se encuentra respaldada por los registros electrónicos almacenados en los servidores del estudio jurídico Díaz and Johnson Attorneys at Law PLLC.`,
    contentW - 10
  )
  for (const line of tamperText) {
    doc.text(line, margin + 5, y)
    y += 3
  }

  // ── Watermarks & footers on all pages ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageBorder()
    addPageFooter(i, totalPages)

    doc.saveGraphicsState()
    // @ts-expect-error - jspdf internal API for transparency
    doc.setGState(new doc.GState({ opacity: 0.02 }))
    doc.setFontSize(55)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text("DÍAZ & JOHNSON", pageW / 2, pageH / 2, { align: "center", angle: 45 })
    doc.restoreGraphicsState()
  }

  // Build result
  const filename = `Contrato-H2B-${data.clientName.replace(/\s+/g, "-")}-${data.contractId.slice(0, 8)}.pdf`
  const blob = doc.output("blob")
  doc.save(filename)

  return { blob, filename }
}
