import jsPDF from "jspdf"

interface ContractData {
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
}

function generateVerificationHash(data: ContractData): string {
  const raw = `${data.contractId}-${data.clientPassport}-${data.signedAt}-${data.lawyerBarNumber}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")
}

/* ── Draw Carlos Díaz's real signature as PDF vector curves ── */
function drawCarlosDiazSignature(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Matches SVG viewBox: 800 x 780
  const sx = w / 800
  const sy = h / 780
  const tx = (px: number) => x + px * sx
  const ty = (py: number) => y + py * sy

  doc.setDrawColor(26, 26, 46) // #1a1a2e
  doc.setLineCap(1) // round
  doc.setLineJoin(1) // round

  // Outer C sweep — bold oval loop
  doc.setLineWidth(1.0)
  doc.moveTo(tx(590), ty(110))
  doc.curveTo(tx(460), ty(25), tx(200), ty(5), tx(70), ty(170))
  doc.curveTo(tx(15), ty(270), tx(10), ty(430), tx(120), ty(530))
  doc.curveTo(tx(210), ty(610), tx(400), ty(520), tx(470), ty(385))
  doc.stroke()

  // Inner C crossover
  doc.setLineWidth(0.45)
  doc.moveTo(tx(555), ty(145))
  doc.curveTo(tx(445), ty(70), tx(245), ty(50), tx(140), ty(190))
  doc.curveTo(tx(65), ty(285), tx(60), ty(410), tx(145), ty(490))
  doc.curveTo(tx(220), ty(555), tx(375), ty(495), tx(440), ty(400))
  doc.stroke()

  // Zigzag cursive strokes
  doc.setLineWidth(0.75)
  doc.moveTo(tx(470), ty(385))
  doc.curveTo(tx(460), ty(435), tx(445), ty(500), tx(452), ty(530))
  doc.curveTo(tx(460), ty(490), tx(478), ty(430), tx(486), ty(418))
  doc.curveTo(tx(492), ty(460), tx(498), ty(520), tx(508), ty(548))
  doc.curveTo(tx(516), ty(510), tx(528), ty(455), tx(536), ty(435))
  doc.curveTo(tx(542), ty(472), tx(552), ty(530), tx(562), ty(560))
  doc.stroke()

  // Long diagonal underline
  doc.setLineWidth(0.6)
  doc.moveTo(tx(450), ty(415))
  doc.curveTo(tx(510), ty(475), tx(600), ty(580), tx(720), ty(715))
  doc.stroke()

  // End flourish
  doc.setLineWidth(0.35)
  doc.moveTo(tx(720), ty(715))
  doc.curveTo(tx(730), ty(708), tx(738), ty(714), tx(746), ty(708))
  doc.curveTo(tx(753), ty(704), tx(760), ty(708), tx(768), ty(706))
  doc.stroke()
}

export function generateContractPDF(data: ContractData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 22
  const contentW = pageW - margin * 2
  let y = 0

  const verificationCode = generateVerificationHash(data)

  // ── Colors ──
  const navy = [11, 30, 58] as [number, number, number]
  const gold = [178, 143, 72] as [number, number, number]
  const darkGray = [50, 50, 50] as [number, number, number]
  const medGray = [100, 100, 100] as [number, number, number]
  const lightGray = [200, 200, 200] as [number, number, number]

  // ── Helpers ──
  function addPageFooter(pageNum: number, totalPages: number) {
    // Gold line
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)

    // Footer text
    doc.setFontSize(6.5)
    doc.setTextColor(...medGray)
    doc.text("Díaz and Johnson Attorneys at Law PLLC · 1680 Michigan Ave Suite 700, Miami Beach, FL 33139", pageW / 2, pageH - 14, { align: "center" })
    doc.text("Consulting@diazandjohnson.com · +1 (305) 307-1677", pageW / 2, pageH - 10.5, { align: "center" })

    // Page number
    doc.setFontSize(7)
    doc.setTextColor(...navy)
    doc.text(`Página ${pageNum} de ${totalPages}`, pageW - margin, pageH - 10.5, { align: "right" })

    // Verification code
    doc.setFontSize(5.5)
    doc.setTextColor(...medGray)
    doc.text(`Código de verificación: ${verificationCode} · ID: ${data.contractId}`, margin, pageH - 10.5)
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - 25) {
      doc.addPage()
      y = 20
      addLetterhead()
    }
  }

  function addLetterhead() {
    // Navy top bar
    doc.setFillColor(...navy)
    doc.rect(0, 0, pageW, 3, "F")
    // Gold accent line
    doc.setFillColor(...gold)
    doc.rect(0, 3, pageW, 0.8, "F")
  }

  function writeTitle(text: string) {
    checkPageBreak(12)
    doc.setFontSize(10.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text(text, margin, y)
    y += 2
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.4)
    doc.line(margin, y, margin + doc.getTextWidth(text), y)
    y += 5
  }

  function writeParagraph(text: string, opts?: { bold?: boolean; indent?: number; fontSize?: number }) {
    const fontSize = opts?.fontSize || 9
    const indent = opts?.indent || 0
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal")
    doc.setTextColor(...darkGray)
    const lines = doc.splitTextToSize(text, contentW - indent)
    for (const line of lines) {
      checkPageBreak(5)
      doc.text(line, margin + indent, y)
      y += 4.2
    }
    y += 1.5
  }

  function writeBullet(text: string, bullet = "•") {
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    const lines = doc.splitTextToSize(text, contentW - 10)
    checkPageBreak(lines.length * 4.2 + 1)
    doc.text(bullet, margin + 4, y)
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], margin + 10, y)
      y += 4.2
    }
  }

  function writeNumbered(text: string, num: string) {
    writeBullet(text, num)
  }

  // ══════════════════════════════════════════
  // PAGE 1 — HEADER
  // ══════════════════════════════════════════
  addLetterhead()

  // Firm name
  y = 16
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("DÍAZ & JOHNSON", pageW / 2, y, { align: "center" })
  y += 6
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...gold)
  doc.text("ATTORNEYS AT LAW PLLC", pageW / 2, y, { align: "center" })
  y += 5

  // Contact line
  doc.setFontSize(7)
  doc.setTextColor(...medGray)
  doc.text("1680 Michigan Ave Suite 700, Miami Beach, FL 33139 · +1 (305) 307-1677 · Consulting@diazandjohnson.com", pageW / 2, y, { align: "center" })
  y += 4

  // Separator
  doc.setDrawColor(...navy)
  doc.setLineWidth(0.6)
  doc.line(margin, y, pageW - margin, y)
  y += 2
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // Contract title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("CONTRATO DE PRESTACIÓN DE", pageW / 2, y, { align: "center" })
  y += 6
  doc.text("SERVICIOS LEGALES", pageW / 2, y, { align: "center" })
  y += 6
  doc.setFontSize(11)
  doc.setTextColor(...gold)
  doc.text("PARA TRÁMITE DE VISA H-2B", pageW / 2, y, { align: "center" })
  y += 5

  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(...medGray)
  doc.text("Entre el Estudio Jurídico Díaz and Johnson Attorneys y el Cliente", pageW / 2, y, { align: "center" })
  y += 10

  // ── Comparecencia ──
  writeParagraph(`En la ciudad de Miami, a los ${data.contractDay} días del mes de ${data.contractMonth} del año ${data.contractYear}, comparecen:`)

  writeParagraph(`De una parte, el estudio jurídico Díaz and Johnson Attorneys at Law PLLC, ubicado en 1680 Michigan Avenue, Suite 700, Miami Beach, Florida 33139, representado por el abogado ${data.lawyerName}, titular de la licencia profesional del Colegio de Abogados de Florida (Florida Bar) número ${data.lawyerBarNumber}, en adelante denominado "EL ESTUDIO",`)

  writeParagraph(`Y ${data.clientName.toUpperCase()}, ${data.clientDob}, PORTADOR(A) DEL PASAPORTE ${data.clientPassport.toUpperCase()}, NATURAL DE ${data.clientCity.toUpperCase()} (${data.clientCountry.toUpperCase()}) EN ADELANTE DENOMINADO "EL CLIENTE" (INDEPENDIENTEMENTE DEL GÉNERO).`)

  writeParagraph("Ambas partes, reconociéndose mutuamente capacidad legal suficiente para contratar, acuerdan celebrar el presente Contrato de Prestación de Servicios Legales, conforme a las siguientes cláusulas:")

  // ── PRIMERA ──
  writeTitle("PRIMERA – OBJETO")
  writeParagraph("El presente contrato tiene por objeto la prestación de servicios legales por parte de EL ESTUDIO para representar a EL CLIENTE en la gestión integral del trámite de visa H-2B, conforme a lo establecido en:")
  writeBullet("Sección 101(a)(15)(H)(ii)(b) del Immigration and Nationality Act (INA) [8 U.S.C. § 1101(a)(15)(H)(ii)(b)];")
  writeBullet("8 U.S.C. § 1184(c);")
  writeBullet("8 C.F.R. § 214.2(h);")
  writeBullet("20 C.F.R. Part 655, Subpart A.")
  y += 2

  // ── SEGUNDA ──
  writeTitle("SEGUNDA – ALCANCE DE LOS SERVICIOS")
  writeParagraph("EL ESTUDIO se compromete a realizar todas las acciones legales y administrativas necesarias para gestionar el trámite de visa H-2B, incluyendo:")
  writeNumbered("Evaluación preliminar de elegibilidad legal de EL CLIENTE;", "1.")
  writeNumbered("Preparación y presentación de la solicitud de Certificación Laboral Temporal (ETA-9142B) ante el Departamento de Trabajo;", "2.")
  writeNumbered("Preparación y presentación de la petición ante USCIS (Formulario I-129);", "3.")
  writeNumbered("Asistencia para la preparación de la entrevista consular;", "4.")
  writeNumbered("Coordinación con el empleador patrocinador;", "5.")
  writeNumbered("Acompañamiento jurídico durante todas las etapas del proceso.", "6.")
  y += 2

  // ── TERCERA ──
  writeTitle("TERCERA – GARANTÍA DE RESULTADO")
  writeParagraph("EL ESTUDIO garantiza la aprobación de la visa H-2B, siempre que se cumplan de forma íntegra y veraz las siguientes condiciones:")
  writeNumbered("Que EL CLIENTE no registra antecedentes penales o migratorios que constituyan causal de inadmisibilidad conforme a la sección 212(a) del INA [8 U.S.C. § 1182(a)];", "a)")
  writeNumbered("Que EL CLIENTE proporcione información y documentación veraz, sin omisiones ni falsedades, incluyendo nombre completo, número de pasaporte, historial laboral y demás datos personales requeridos;", "b)")
  writeNumbered("Que EL CLIENTE cumpla en tiempo y forma con todos los requerimientos solicitados por EL ESTUDIO.", "c)")
  y += 1
  writeParagraph("La garantía se refiere a la obtención efectiva de la visa H-2B, no implicando en ningún caso la repetición del trámite, reembolso de honorarios, ni gestiones posteriores adicionales si la denegación se debiera a factores no imputables a EL ESTUDIO.")

  // ── CUARTA ──
  writeTitle("CUARTA – HONORARIOS")
  writeParagraph("EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Quinientos dólares estadounidenses (USD $500.00), por concepto de comisión profesional. La cual se pagará en 2 partes:", { bold: false })
  writeBullet("La primera de $300.00 (trescientos dólares) a la firma del contrato;")
  writeBullet("$200.00 (doscientos dólares) al momento de instalarse en el trabajo dentro de Miami, Florida.")
  y += 1
  writeParagraph("Dicho monto corresponde exclusivamente a los honorarios de intermediación, asesoría y coordinación del proceso migratorio bajo el programa de visas H-2B.")
  writeParagraph("Todos los gastos gubernamentales, tasas consulares, tarifas administrativas, formularios y costos relacionados con la tramitación de la visa H-2B serán cubiertos en su totalidad por el empleador. Esto incluye —de manera enunciativa pero no limitativa— los siguientes conceptos:")
  writeBullet("Formulario ETA 9142B: Solicitud de Certificación de Trabajo Temporal para No Inmigrantes H-2B, presentada ante el Departamento de Trabajo de EE.UU.")
  writeBullet("Formulario 9141: Solicitud de Determinación de Salario Prevaleciente.")
  writeBullet("Formulario I-129, I-797: Petición para un trabajador no inmigrante, presentada ante USCIS.")
  writeBullet("Formulario DS-160: Solicitud de visa de no inmigrante, presentada ante el Departamento de Estado para la entrevista consular.")
  writeBullet("Tarifa MRV: Pago de la tarifa de solicitud de visa.")
  writeBullet("Cualquier otra tasa o contribución requerida por las autoridades migratorias y consulares competentes.")
  y += 1
  writeParagraph("Asimismo, el boleto aéreo para el traslado del solicitante desde su país de origen hasta el lugar de trabajo en Estados Unidos será cubierto por el empleador. Sin embargo, EL CLIENTE se compromete a coordinar con EL ESTUDIO y/o con el abogado responsable la fecha y el itinerario de viaje con al menos una (1) semana de anticipación a la fecha programada para su traslado, a fin de asegurar la correcta gestión de la logística de viaje.")

  // ── QUINTA ──
  writeTitle("QUINTA – GASTOS PERSONALES INCLUIDOS")
  writeParagraph("EL CLIENTE reconoce y acepta expresamente que el presente contrato de prestación de servicios legales tiene por único objeto la asistencia profesional en los trámites migratorios vinculados a la obtención de la visa H-2B, limitándose la responsabilidad de EL ESTUDIO exclusivamente a la preparación, presentación, seguimiento y gestión legal de la solicitud de visa ante las autoridades correspondientes.")
  writeParagraph("En consecuencia, EL ESTUDIO no asume responsabilidad alguna respecto de gastos personales, logísticos o de manutención que puedan derivarse del proceso migratorio o del desplazamiento del CLIENTE a los Estados Unidos, siendo LA EMPRESA EMPLEADORA la única responsable de cubrir los siguientes conceptos:")
  writeBullet("Pasajes o boletos aéreos, tanto internacionales como domésticos, desde el país de origen hasta el lugar de trabajo en los Estados Unidos, así como cualquier traslado interno que sea requerido por motivos laborales.")
  writeBullet("Hospedaje, durante todo el periodo de empleo, conforme a las condiciones establecidas en la oferta de trabajo.")
  writeBullet("Alimentación, total o parcial, en los términos acordados con la empresa, salvo los gastos personales adicionales que excedan lo proporcionado por el empleador.")
  y += 1
  writeParagraph("Por lo tanto, cualquier gasto personal, familiar o adicional que no se encuentre expresamente contemplado y cubierto por la empresa será de entera responsabilidad de EL CLIENTE.")
  writeParagraph("Esta delimitación de responsabilidades se establece conforme al principio de autonomía de la voluntad contractual, reconocido en los sistemas jurídicos de derecho civil y common law. Asimismo, la normativa migratoria de los Estados Unidos, incluyendo el Immigration and Nationality Act (INA) y las disposiciones del 8 C.F.R. § 214.2(h) relativas a visas H, no impone obligación alguna al representante legal ni al peticionario de cubrir pasajes, hospedaje, alimentación u otros gastos personales, salvo que existan acuerdos laborales específicos que así lo contemplen, los cuales son pactados directamente entre EL CLIENTE y LA EMPRESA, y que no forman parte del presente contrato de servicios legales.")

  // ── SEXTA ──
  writeTitle("SEXTA – OBLIGACIONES DEL CLIENTE")
  writeParagraph("EL CLIENTE se compromete a:")
  writeNumbered("Suministrar información veraz y completa en todo momento;", "1.")
  writeNumbered("Entregar toda la documentación requerida en los plazos establecidos;", "2.")
  writeNumbered("Cumplir con los pasos del proceso conforme a las instrucciones de EL ESTUDIO;", "3.")
  writeNumbered("Abonar el honorario pactado.", "4.")
  y += 2

  // ── SÉPTIMA ──
  writeTitle("SÉPTIMA – DURACIÓN Y TERMINACIÓN")
  writeParagraph("El presente contrato permanecerá vigente desde su firma hasta la emisión de la visa H-2B o la conclusión definitiva del trámite.")
  writeParagraph("Podrá darse por terminado por:")
  writeNumbered("Mutuo acuerdo;", "a)")
  writeNumbered("Incumplimiento grave de alguna de las partes;", "b)")
  writeNumbered("Falsedad documental o reticencia dolosa por parte de EL CLIENTE;", "c)")
  writeNumbered("Decisión unilateral de EL CLIENTE, sin derecho a reembolso de honorarios.", "d)")
  y += 2

  // ── OCTAVA ──
  writeTitle("OCTAVA – JURISDICCIÓN Y LEY APLICABLE")
  writeParagraph("El presente contrato se regirá e interpretará de conformidad con las leyes del Estado de Florida, Estados Unidos de América, sin perjuicio de las normas sobre conflictos de leyes.")
  writeParagraph("Para todos los efectos legales y contractuales derivados del presente instrumento, las partes acuerdan expresamente someterse a la jurisdicción exclusiva de los tribunales estatales o federales competentes ubicados en el condado de Miami-Dade, Florida, renunciando a cualquier otro fuero que por razón de su domicilio presente o futuro pudiera corresponderles.")
  writeParagraph("Asimismo, las partes reconocen que cualquier controversia, reclamación o disputa que surja en relación con la interpretación, cumplimiento o ejecución de este contrato, podrá ser resuelta de forma preferente mediante negociación directa y, en su defecto, mediante un procedimiento de mediación voluntaria conforme a lo dispuesto en las reglas del Florida Dispute Resolution Center (DRC), sin perjuicio del derecho de acudir a la vía judicial.")

  // ── NOVENO ──
  writeTitle("NOVENO — NOTIFICACIONES Y FIRMA ELECTRÓNICA")
  writeParagraph("Toda comunicación, notificación o requerimiento entre las partes relacionado con el presente contrato deberá realizarse por escrito y podrá ser enviado a través de correo electrónico, servicio postal certificado, mensajería privada o cualquier otro medio que permita verificar su recepción.")
  writeParagraph("A efectos de este contrato, las partes designan los siguientes correos electrónicos como medios válidos de notificación:")
  writeBullet("EL ESTUDIO: contratos@diazandjohnson.online")
  writeBullet(`EL CLIENTE: ${data.clientEmail}`)
  y += 1
  writeParagraph("Cualquier cambio de dirección física o electrónica deberá ser notificado por escrito a la otra parte dentro de un plazo máximo de cinco (5) días hábiles.")
  writeParagraph("Asimismo, las partes acuerdan que el presente contrato podrá ser firmado mediante firma electrónica conforme a lo dispuesto en la Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) y en la Florida Electronic Signature Act (Fla. Stat. § 668.001 y ss.), teniendo dicha firma la misma validez jurídica y fuerza obligatoria que una firma manuscrita.")

  // ── DÉCIMO ──
  writeTitle("DÉCIMO — ACUERDO COMPLETO")
  writeParagraph("El presente documento constituye el acuerdo completo entre las partes y reemplaza cualquier acuerdo previo, ya sea verbal o escrito.")
  writeParagraph("* Cualquier modificación deberá realizarse por escrito y estar firmada por ambas partes.")
  writeParagraph("En señal de conformidad, el presente contrato se firma en dos ejemplares idénticos, cada uno de los cuales tendrá plena validez legal y fuerza obligatoria, considerándose conjuntamente un solo instrumento. Ambos ejemplares podrán ser firmados de manera electrónica, y dicha firma tendrá la misma validez y eficacia jurídica que una firma manuscrita, conforme a la legislación aplicable.")

  // ══════════════════════════════════════════
  // SIGNATURE PAGE
  // ══════════════════════════════════════════
  checkPageBreak(100)
  y += 5

  // Separator
  doc.setDrawColor(...navy)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 1
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // Attorney signature block
  const sigBlockLeft = margin
  const sigBlockRight = pageW / 2 + 5
  const sigBlockW = (contentW - 10) / 2

  // Attorney side
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("POR EL ESTUDIO:", sigBlockLeft, y)

  // Client side
  doc.text("EL CLIENTE:", sigBlockRight, y)
  y += 8

  // Attorney signature
  if (data.lawyerName === "Carlos Roberto Díaz") {
    // Draw Carlos Díaz's real signature as vector curves
    drawCarlosDiazSignature(doc, sigBlockLeft, y - 14, sigBlockW - 5, 22)
  } else {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bolditalic")
    doc.setTextColor(...navy)
    doc.text(data.lawyerName, sigBlockLeft, y)
  }

  // Client signature (image)
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

  // Signature lines
  doc.setDrawColor(...darkGray)
  doc.setLineWidth(0.3)
  doc.line(sigBlockLeft, y, sigBlockLeft + sigBlockW - 5, y)
  doc.line(sigBlockRight, y, sigBlockRight + sigBlockW - 5, y)
  y += 5

  // Names under lines
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...darkGray)
  doc.text(data.lawyerName, sigBlockLeft, y)
  doc.text(data.clientName, sigBlockRight, y)
  y += 4

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...medGray)
  doc.text("Abogado", sigBlockLeft, y)
  doc.text("EL CLIENTE", sigBlockRight, y)
  y += 4
  doc.text(`Colegiado Florida Bar Nº ${data.lawyerBarNumber}`, sigBlockLeft, y)
  doc.text(`Pasaporte: ${data.clientPassport}`, sigBlockRight, y)
  y += 4
  doc.text("En nombre de Díaz and Johnson Attorneys", sigBlockLeft, y)
  doc.text(`Email: ${data.clientEmail}`, sigBlockRight, y)

  // ══════════════════════════════════════════
  // SECURITY / VERIFICATION SECTION
  // ══════════════════════════════════════════
  y += 15

  // Security box
  doc.setDrawColor(...navy)
  doc.setLineWidth(0.4)
  doc.setFillColor(245, 247, 252)
  doc.roundedRect(margin, y, contentW, 38, 2, 2, "FD")
  y += 6

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...navy)
  doc.text("CERTIFICADO DE AUTENTICIDAD ELECTRÓNICA", pageW / 2, y, { align: "center" })
  y += 5

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)

  const securityInfo = [
    [`ID del Contrato:`, data.contractId],
    [`Código de Verificación:`, verificationCode],
    [`Fecha y Hora de Firma:`, data.signedAt],
    [`Firmado conforme a:`, "E-SIGN Act (15 U.S.C. § 7001) · Florida Electronic Signature Act (Fla. Stat. § 668.001)"],
  ]

  for (const [label, value] of securityInfo) {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin + 5, y)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 50, y)
    y += 4.5
  }

  // ── Watermark on all pages ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(i, totalPages)

    // Diagonal watermark
    doc.saveGraphicsState()
    // @ts-expect-error - jspdf internal API for transparency
    doc.setGState(new doc.GState({ opacity: 0.04 }))
    doc.setFontSize(60)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...navy)
    doc.text("DÍAZ & JOHNSON", pageW / 2, pageH / 2, {
      align: "center",
      angle: 45,
    })
    doc.restoreGraphicsState()
  }

  return doc
}
