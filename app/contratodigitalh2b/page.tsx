"use client"

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/signature-pad"
import { Logo } from "@/components/ui/logo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Download,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Briefcase,
  ShieldAlert,
  DollarSign,
  Wallet,
  ClipboardList,
  Clock,
  Gavel,
  Send,
  FileCheck,
  FileSignature,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { generateContractPDF } from "@/lib/generate-contract-pdf"

/* ── Design tokens ── */
const NAVY = "#0B1E3A"
const GOLD = "#B58B2B"

const LAWYERS = [
  { id: "carlos-diaz", name: "Carlos Roberto Díaz", barNumber: "832871" },
  { id: "other-attorney", name: "Otro Abogado", barNumber: "—" },
]

type FormStatus = "idle" | "submitting" | "success" | "error"

/* ── Inline blank for typing directly in the contract text ── */
function Blank({
  value,
  onChange,
  placeholder,
  type = "text",
  w = "min-w-[160px]",
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  w?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`inline-block border-b-2 border-[${NAVY}]/30 bg-[#f0f3fa] focus:border-[${GOLD}] focus:bg-white outline-none px-2 py-0.5 text-[${NAVY}] font-semibold ${w} max-w-full rounded-sm transition-all text-[15px] font-[family-name:var(--font-playfair)]`}
    />
  )
}

/* ── Clause section heading with icon badge ── */
function ClauseHeading({ num, title, icon }: { num: string; title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mt-8 sm:mt-10 mb-3">
      <div
        className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY}dd)` }}
      >
        <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-sm sm:text-base tracking-wide font-[family-name:var(--font-playfair)] text-left"
          style={{ color: NAVY }}
        >
          {num} — {title}
        </h3>
        <div className="mt-1 h-[2px] rounded-full" style={{ background: `linear-gradient(to right, ${GOLD}, ${GOLD}33, transparent)` }} />
      </div>
    </div>
  )
}

/* ── Gold ornamental divider ── */
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD}55)` }} />
      <Scale className="w-4 h-4" style={{ color: GOLD }} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD}55)` }} />
    </div>
  )
}

/* ── Carlos Díaz signature (actual image) ── */
function CarlosDiazSignature() {
  return (
    <Image
      src="/signature.png"
      alt="Firma de Carlos Roberto Díaz"
      width={240}
      height={120}
      className="h-24 w-auto mx-auto"
      draggable={false}
      priority
    />
  )
}

export default function ContratoDigitalH2B() {
  const [clientName, setClientName] = useState("")
  const [clientDob, setClientDob] = useState("")
  const [clientPassport, setClientPassport] = useState("")
  const [clientCountry, setClientCountry] = useState("")
  const [clientCity, setClientCity] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [selectedLawyer, setSelectedLawyer] = useState("")
  const today = new Date()
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const [contractDay, setContractDay] = useState(today.getDate().toString())
  const [contractMonth, setContractMonth] = useState(MONTHS[today.getMonth()])
  const [contractYear, setContractYear] = useState(today.getFullYear().toString())
  const [clientSignature, setClientSignature] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedEsign, setAcceptedEsign] = useState(false)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [contractId, setContractId] = useState("")
  const [signedAt, setSignedAt] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [userAgent, setUserAgent] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [pdfDownloaded, setPdfDownloaded] = useState(false)
  const autoDownloadTriggered = useRef(false)

  const lawyer = LAWYERS.find((l) => l.id === selectedLawyer)

  const isFormValid =
    clientName.trim().length >= 2 &&
    clientDob &&
    clientPassport.trim().length >= 4 &&
    clientCountry.trim().length >= 2 &&
    clientCity.trim().length >= 2 &&
    clientEmail.includes("@") &&
    selectedLawyer &&
    clientSignature &&
    acceptedTerms &&
    acceptedEsign

  const handleSubmit = async () => {
    if (!isFormValid) return
    setStatus("submitting")
    setErrorMsg("")
    try {
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientDob,
          clientPassport: clientPassport.trim(),
          clientCountry: clientCountry.trim(),
          clientCity: clientCity.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          lawyerName: lawyer?.name || selectedLawyer,
          contractDay: parseInt(contractDay),
          contractMonth,
          contractYear: parseInt(contractYear),
          clientSignature,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || "Error"); setStatus("error"); return }
      setContractId(data.contractId)
      setSignedAt(data.signedAt || new Date().toISOString())
      setIpAddress(data.ipAddress || "")
      setUserAgent(data.userAgent || "")
      setStatus("success")
    } catch {
      setErrorMsg("Error de conexión. Intente de nuevo.")
      setStatus("error")
    }
  }

  const buildPDFData = useCallback(() => {
    if (!clientSignature || !lawyer) return null
    return {
      clientName, clientDob, clientPassport, clientCountry, clientCity,
      clientEmail, clientPhone, lawyerName: lawyer.name,
      lawyerBarNumber: lawyer.barNumber, contractDay, contractMonth, contractYear, contractId,
      signedAt: signedAt || new Date().toISOString(),
      clientSignature,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    }
  }, [clientName, clientDob, clientPassport, clientCountry, clientCity, clientEmail, clientPhone, lawyer, contractDay, contractMonth, contractYear, contractId, signedAt, clientSignature, ipAddress, userAgent])

  const handleDownloadPDF = useCallback(async () => {
    const pdfData = buildPDFData()
    if (!pdfData) return
    await generateContractPDF(pdfData)
    setPdfDownloaded(true)
  }, [buildPDFData])

  // Auto-download PDF and send email on success
  useEffect(() => {
    if (status !== "success" || autoDownloadTriggered.current) return
    autoDownloadTriggered.current = true

    const run = async () => {
      const pdfData = buildPDFData()
      if (!pdfData) return

      try {
        const result = await generateContractPDF(pdfData)
        setPdfDownloaded(true)

        // Convert blob to base64 for email
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1]
          try {
            await fetch("/api/contract/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contractId,
                clientEmail: pdfData.clientEmail,
                clientName: pdfData.clientName,
                lawyerName: pdfData.lawyerName,
                signedAt: pdfData.signedAt,
                pdfBase64: base64,
              }),
            })
            setEmailSent(true)
          } catch {
            console.error("Failed to send contract email")
          }
        }
        reader.readAsDataURL(result.blob)
      } catch (err) {
        console.error("Auto-download failed:", err)
      }
    }
    run()
  }, [status, buildPDFData, contractId])

  /* ═════════════════════════════════════════════════ */
  /*  SUCCESS SCREEN                                  */
  /* ═════════════════════════════════════════════════ */
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="relative px-8 py-8" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY}ee)` }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative flex flex-col items-center">
              <Logo className="h-16 w-auto mb-4" />
              <div className="w-16 h-16 rounded-full bg-green-100/20 backdrop-blur-sm flex items-center justify-center border-2 border-green-400/40 mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
          <div className="px-8 py-8 text-center space-y-5">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: NAVY }}>¡Contrato Firmado Exitosamente!</h2>
            <p className="text-gray-500 text-sm">Registrado electrónicamente conforme al E-SIGN Act y la Florida Electronic Signature Act.</p>
            <div className="rounded-xl p-5 text-sm space-y-2 text-left border" style={{ background: `${NAVY}08`, borderColor: `${NAVY}15` }}>
              <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-green-600" /><span className="font-semibold text-green-700 text-xs uppercase tracking-wider">Documento verificado</span></div>
              <p className="text-gray-700"><span className="text-gray-400 text-xs uppercase tracking-wide">ID del Contrato</span><br /><strong style={{ color: NAVY }}>{contractId}</strong></p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <p className="text-gray-700"><span className="text-gray-400 text-xs uppercase tracking-wide">Cliente</span><br /><strong>{clientName}</strong></p>
                <p className="text-gray-700"><span className="text-gray-400 text-xs uppercase tracking-wide">Abogado</span><br /><strong>{lawyer?.name}</strong></p>
                <p className="text-gray-700"><span className="text-gray-400 text-xs uppercase tracking-wide">Fecha</span><br /><strong>{contractDay} de {contractMonth} de {contractYear}</strong></p>
                <p className="text-gray-700"><span className="text-gray-400 text-xs uppercase tracking-wide">Firmado</span><br /><strong>{new Date(signedAt).toLocaleString("es-ES")}</strong></p>
              </div>
            </div>
            {emailSent ? (
              <p className="text-xs text-green-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Copia enviada a <strong>{clientEmail}</strong></p>
            ) : (
              <p className="text-xs text-gray-500">Enviando copia a <strong>{clientEmail}</strong>...</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={handleDownloadPDF} className="gap-2 shadow-lg" style={{ background: GOLD }} size="lg">
                <Download className="w-4 h-4" /> {pdfDownloaded ? "Descargar de Nuevo" : "Descargando..."}
              </Button>
              <Link href="/"><Button variant="outline">Volver al Inicio</Button></Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═════════════════════════════════════════════════ */
  /*  CONTRACT PAGE                                    */
  /* ═════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f0f1f5]">
      {/* Header bar */}
      <header style={{ background: NAVY }} className="text-white border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center"><Logo className="h-14 md:h-16 w-auto" priority /></Link>
          <div className="hidden md:flex items-center gap-5 text-[11px] text-white/60 font-medium tracking-wide">
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" style={{ color: GOLD }} />1680 Michigan Ave Suite 700, Miami Beach, FL 33139</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" style={{ color: GOLD }} />+1 (305) 307-1677</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" style={{ color: GOLD }} />Consulting@diazandjohnson.com</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">

          {/* ── Letterhead ── */}
          <div className="relative text-white px-4 sm:px-8 md:px-14 py-8 sm:py-10 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, #132d52)` }}>
            {/* subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative">
              <Logo className="h-20 w-auto mx-auto mb-4 drop-shadow-lg" />
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-16 h-px" style={{ background: GOLD }} />
                <Scale className="w-4 h-4" style={{ color: GOLD }} />
                <div className="w-16 h-px" style={{ background: GOLD }} />
              </div>
              <p className="text-[11px] text-white/50 tracking-[0.15em] uppercase font-medium">Attorneys at Law &bull; Abogados</p>
              <p className="text-[10px] text-white/35 tracking-wide mt-2">1680 Michigan Ave Suite 700, Miami Beach, FL 33139 &middot; Consulting@diazandjohnson.com &middot; +1 (305) 307-1677</p>
            </div>
          </div>

          {/* Gold accent strip */}
          <div className="h-1" style={{ background: `linear-gradient(to right, ${GOLD}, ${GOLD}88, ${GOLD})` }} />

          {/* ── CONTRACT BODY ── */}
          <div className="px-4 sm:px-8 md:px-14 py-8 sm:py-12 font-[family-name:var(--font-playfair)] text-[14px] sm:text-[15px] leading-relaxed sm:leading-[2] text-gray-800 text-justify">

            {/* Title block */}
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.25em] font-medium font-sans mb-3" style={{ color: GOLD }}>Contrato Electrónico &middot; Electronic Contract</p>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-1" style={{ color: NAVY }}>CONTRATO DE PRESTACIÓN DE SERVICIOS LEGALES</h1>
              <h2 className="text-sm sm:text-lg font-semibold" style={{ color: `${NAVY}aa` }}>PARA TRÁMITE DE VISA H-2B</h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-12 h-px" style={{ background: `${GOLD}66` }} />
                <FileSignature className="w-4 h-4" style={{ color: GOLD }} />
                <div className="w-12 h-px" style={{ background: `${GOLD}66` }} />
              </div>
              <p className="text-gray-400 text-sm mt-3 font-sans">Entre el Estudio Jurídico Díaz and Johnson Attorneys y el Cliente</p>
            </div>

            {/* ── Comparecencia ── */}
            <p className="text-left">En la ciudad de Miami, a los{" "}
              <Blank value={contractDay} onChange={setContractDay} placeholder="__" w="w-14 text-center" />{" "}
              días del mes de{" "}
              <span className="inline-flex align-baseline">
                <Select value={contractMonth} onValueChange={setContractMonth}>
                  <SelectTrigger className="inline-flex w-auto min-w-[120px] sm:min-w-[140px] border-b-2 bg-[#f0f3fa] rounded-none border-x-0 border-t-0 font-semibold shadow-none focus:ring-0 text-[14px] sm:text-[15px] font-[family-name:var(--font-playfair)] h-auto py-0.5" style={{ borderColor: `${NAVY}40`, color: NAVY }}>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
              </span>{" "}
              del año <Blank value={contractYear} onChange={setContractYear} placeholder="Año" w="w-16 sm:w-20 text-center" />, comparecen:</p>

            <p className="mt-4">De una parte, el estudio jurídico <strong style={{ color: NAVY }}>Díaz and Johnson Attorneys at Law PLLC</strong>, ubicado en 1680 Michigan Avenue, Suite 700, Miami Beach, Florida 33139, representado por el abogado</p>

            <div className="my-3">
              <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                <SelectTrigger className="w-auto min-w-75 border-b-2 bg-[#f0f3fa] rounded-none border-x-0 border-t-0 font-semibold shadow-none focus:ring-0 text-[15px] font-[family-name:var(--font-playfair)]" style={{ borderColor: `${NAVY}40`, color: NAVY }}>
                  <SelectValue placeholder="← Seleccione el abogado" />
                </SelectTrigger>
                <SelectContent>
                  {LAWYERS.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name} — Bar #{l.barNumber}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <p>{lawyer ? (<>titular de la licencia profesional del Colegio de Abogados de Florida (Florida Bar) número <strong style={{ color: NAVY }}>{lawyer.barNumber}</strong></>) : <>titular de la licencia profesional del Colegio de Abogados de Florida (Florida Bar) número ______</>}, en adelante denominado &quot;EL ESTUDIO&quot;,</p>

            <div className="mt-4 space-y-2">
              <p className="text-left">Y</p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline">
                <Blank value={clientName} onChange={setClientName} placeholder="Nombre completo" w="w-full sm:min-w-[220px] sm:w-auto" />
                <Blank value={clientDob} onChange={setClientDob} placeholder="Fecha nacimiento" type="date" w="w-full sm:min-w-[155px] sm:w-auto" />
              </div>
              <p className="text-left">PORTADOR(A) DEL PASAPORTE</p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline">
                <Blank value={clientPassport} onChange={setClientPassport} placeholder="Nº pasaporte" w="w-full sm:min-w-[150px] sm:w-auto" />
              </div>
              <p className="text-left">NATURAL DE</p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline">
                <Blank value={clientCity} onChange={setClientCity} placeholder="Ciudad" w="w-full sm:min-w-[130px] sm:w-auto" />
                <Blank value={clientCountry} onChange={setClientCountry} placeholder="País" w="w-full sm:min-w-[130px] sm:w-auto" />
              </div>
              <p>EN ADELANTE DENOMINADO &quot;EL CLIENTE&quot; (INDEPENDIENTEMENTE DEL GÉNERO).</p>
            </div>

            <div className="mt-3 mb-4 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 text-sm font-sans">
              <span className="flex items-center gap-1.5 text-gray-400 w-full sm:w-auto"><Mail className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} /><Blank value={clientEmail} onChange={setClientEmail} placeholder="Correo electrónico *" type="email" w="w-full sm:min-w-[220px] sm:w-auto" /></span>
              <span className="flex items-center gap-1.5 text-gray-400 w-full sm:w-auto"><Phone className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} /><Blank value={clientPhone} onChange={setClientPhone} placeholder="Teléfono (opcional)" type="tel" w="w-full sm:min-w-[170px] sm:w-auto" /></span>
            </div>

            <p>Ambas partes, reconociéndose mutuamente capacidad legal suficiente para contratar, acuerdan celebrar el presente Contrato de Prestación de Servicios Legales, conforme a las siguientes cláusulas:</p>

            <GoldDivider />

            {/* ═══ CLAUSES ═══ */}

            <ClauseHeading num="PRIMERA" title="OBJETO" icon={<Scale className="w-5 h-5 text-white" />} />
            <p>El presente contrato tiene por objeto la prestación de servicios legales por parte de EL ESTUDIO para representar a EL CLIENTE en la gestión integral del trámite de visa H-2B, conforme a lo establecido en:</p>
            <ul className="list-none pl-4 text-sm mt-2 space-y-1">
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> Sección 101(a)(15)(H)(ii)(b) del Immigration and Nationality Act (INA) [8 U.S.C. § 1101(a)(15)(H)(ii)(b)];</li>
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> 8 U.S.C. § 1184(c);</li>
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> 8 C.F.R. § 214.2(h);</li>
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> 20 C.F.R. Part 655, Subpart A.</li>
            </ul>

            <ClauseHeading num="SEGUNDA" title="ALCANCE DE LOS SERVICIOS" icon={<Briefcase className="w-5 h-5 text-white" />} />
            <p>EL ESTUDIO se compromete a realizar todas las acciones legales y administrativas necesarias para gestionar el trámite de visa H-2B, incluyendo:</p>
            <ol className="list-none pl-4 text-sm mt-2 space-y-1 counter-reset-none">
              {["Evaluación preliminar de elegibilidad legal de EL CLIENTE;","Preparación y presentación de la solicitud de Certificación Laboral Temporal (ETA-9142B) ante el Departamento de Trabajo;","Preparación y presentación de la petición ante USCIS (Formulario I-129);","Asistencia para la preparación de la entrevista consular;","Coordinación con el empleador patrocinador;","Acompañamiento jurídico durante todas las etapas del proceso."].map((t,i)=>(
                <li key={i} className="flex items-start gap-2"><span className="font-bold text-xs mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-sans" style={{ background: `${NAVY}10`, color: NAVY }}>{i+1}</span> {t}</li>
              ))}
            </ol>

            <ClauseHeading num="TERCERA" title="GARANTÍA DE RESULTADO" icon={<ShieldAlert className="w-5 h-5 text-white" />} />
            <p>EL ESTUDIO garantiza la aprobación de la visa H-2B, siempre que se cumplan de forma íntegra y veraz las siguientes condiciones:</p>
            <ol className="list-none pl-4 text-sm mt-2 space-y-1.5">
              {[
                "Que EL CLIENTE no registra antecedentes penales o migratorios que constituyan causal de inadmisibilidad conforme a la sección 212(a) del INA [8 U.S.C. § 1182(a)];",
                "Que EL CLIENTE proporcione información y documentación veraz, sin omisiones ni falsedades, incluyendo nombre completo, número de pasaporte, historial laboral y demás datos personales requeridos;",
                "Que EL CLIENTE cumpla en tiempo y forma con todos los requerimientos solicitados por EL ESTUDIO."
              ].map((t,i)=>(
                <li key={i} className="flex items-start gap-2"><span className="font-bold shrink-0 font-sans" style={{ color: GOLD }}>({String.fromCharCode(97+i)})</span> {t}</li>
              ))}
            </ol>
            <p className="text-sm mt-3 pl-4 border-l-2" style={{ borderColor: `${GOLD}44` }}>La garantía se refiere a la obtención efectiva de la visa H-2B, no implicando en ningún caso la repetición del trámite, reembolso de honorarios, ni gestiones posteriores adicionales si la denegación se debiera a factores no imputables a EL ESTUDIO.</p>

            <ClauseHeading num="CUARTA" title="HONORARIOS" icon={<DollarSign className="w-5 h-5 text-white" />} />
            <p>EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de <strong style={{ color: NAVY }}>Quinientos dólares estadounidenses (USD $500.00)</strong>, por concepto de comisión profesional. La cual se pagará en 2 partes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-3">
              <div className="rounded-lg border p-4 text-sm text-center" style={{ borderColor: `${GOLD}40`, background: `${GOLD}08` }}>
                <p className="text-2xl font-bold font-sans" style={{ color: NAVY }}>$300<span className="text-base">.00</span></p>
                <p className="text-gray-500 text-xs mt-1">A la firma del contrato</p>
              </div>
              <div className="rounded-lg border p-4 text-sm text-center" style={{ borderColor: `${GOLD}40`, background: `${GOLD}08` }}>
                <p className="text-2xl font-bold font-sans" style={{ color: NAVY }}>$200<span className="text-base">.00</span></p>
                <p className="text-gray-500 text-xs mt-1">Al instalarse en el trabajo en Miami, FL</p>
              </div>
            </div>
            <p className="text-sm mt-2">Dicho monto corresponde exclusivamente a los honorarios de intermediación, asesoría y coordinación del proceso migratorio bajo el programa de visas H-2B.</p>
            <p className="text-sm mt-2">Todos los gastos gubernamentales, tasas consulares, tarifas administrativas, formularios y costos relacionados con la tramitación de la visa H-2B serán cubiertos en su totalidad por el empleador. Esto incluye —de manera enunciativa pero no limitativa— los siguientes conceptos:</p>
            <ul className="list-none pl-4 text-sm mt-2 space-y-1">
              {[
                ["Formulario ETA 9142B:","Solicitud de Certificación de Trabajo Temporal para No Inmigrantes H-2B."],
                ["Formulario 9141:","Solicitud de Determinación de Salario Prevaleciente."],
                ["Formulario I-129, I-797:","Petición para un trabajador no inmigrante, presentada ante USCIS."],
                ["Formulario DS-160:","Solicitud de visa de no inmigrante."],
                ["Tarifa MRV:","Pago de la tarifa de solicitud de visa."],
                ["","Cualquier otra tasa o contribución requerida por las autoridades migratorias y consulares competentes."]
              ].map(([b,t],i)=>(
                <li key={i} className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span>{b ? <><strong style={{ color: NAVY }}>{b}</strong> {t}</> : t}</li>
              ))}
            </ul>
            <p className="text-sm mt-2">Asimismo, el boleto aéreo para el traslado del solicitante desde su país de origen hasta el lugar de trabajo en Estados Unidos será cubierto por el empleador. Sin embargo, EL CLIENTE se compromete a coordinar con EL ESTUDIO y/o con el abogado responsable la fecha y el itinerario de viaje con al menos una (1) semana de anticipación.</p>

            <ClauseHeading num="QUINTA" title="GASTOS PERSONALES" icon={<Wallet className="w-5 h-5 text-white" />} />
            <p className="text-sm">EL CLIENTE reconoce y acepta expresamente que el presente contrato tiene por único objeto la asistencia profesional en los trámites migratorios vinculados a la obtención de la visa H-2B, limitándose la responsabilidad de EL ESTUDIO exclusivamente a la preparación, presentación, seguimiento y gestión legal de la solicitud de visa.</p>
            <p className="text-sm mt-2">En consecuencia, EL ESTUDIO no asume responsabilidad alguna respecto de gastos personales, logísticos o de manutención, siendo LA EMPRESA EMPLEADORA la única responsable de cubrir:</p>
            <ul className="list-none pl-4 text-sm mt-2 space-y-1">
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> Pasajes o boletos aéreos, tanto internacionales como domésticos.</li>
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> Hospedaje, durante todo el periodo de empleo.</li>
              <li className="flex items-start gap-2"><span style={{ color: GOLD }}>&#9656;</span> Alimentación, total o parcial, en los términos acordados con la empresa.</li>
            </ul>
            <p className="text-sm mt-2">Cualquier gasto personal, familiar o adicional no cubierto por la empresa será de entera responsabilidad de EL CLIENTE.</p>

            <ClauseHeading num="SEXTA" title="OBLIGACIONES DEL CLIENTE" icon={<ClipboardList className="w-5 h-5 text-white" />} />
            <p>EL CLIENTE se compromete a:</p>
            <ol className="list-none pl-4 text-sm mt-2 space-y-1">
              {["Suministrar información veraz y completa en todo momento;","Entregar toda la documentación requerida en los plazos establecidos;","Cumplir con los pasos del proceso conforme a las instrucciones de EL ESTUDIO;","Abonar el honorario pactado."].map((t,i) => (
                <li key={i} className="flex items-start gap-2"><span className="font-bold text-xs mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-sans" style={{ background: `${NAVY}10`, color: NAVY }}>{i+1}</span> {t}</li>
              ))}
            </ol>

            <ClauseHeading num="SÉPTIMA" title="DURACIÓN Y TERMINACIÓN" icon={<Clock className="w-5 h-5 text-white" />} />
            <p className="text-sm">El presente contrato permanecerá vigente desde su firma hasta la emisión de la visa H-2B o la conclusión definitiva del trámite.</p>
            <p className="mt-2">Podrá darse por terminado por:</p>
            <ol className="list-none pl-4 text-sm mt-2 space-y-1">
              {["Mutuo acuerdo;","Incumplimiento grave de alguna de las partes;","Falsedad documental o reticencia dolosa por parte de EL CLIENTE;","Decisión unilateral de EL CLIENTE, sin derecho a reembolso de honorarios."].map((t,i) => (
                <li key={i} className="flex items-start gap-2"><span className="font-bold shrink-0 font-sans" style={{ color: GOLD }}>({String.fromCharCode(97+i)})</span> {t}</li>
              ))}
            </ol>

            <ClauseHeading num="OCTAVA" title="JURISDICCIÓN Y LEY APLICABLE" icon={<Gavel className="w-5 h-5 text-white" />} />
            <p className="text-sm">El presente contrato se regirá e interpretará de conformidad con las leyes del Estado de Florida, Estados Unidos de América.</p>
            <p className="text-sm mt-2">Las partes acuerdan someterse a la jurisdicción exclusiva de los tribunales estatales o federales competentes ubicados en el condado de Miami-Dade, Florida, renunciando a cualquier otro fuero.</p>
            <p className="text-sm mt-2">Cualquier controversia podrá ser resuelta mediante negociación directa y, en su defecto, mediante mediación voluntaria conforme a las reglas del Florida Dispute Resolution Center (DRC).</p>

            <ClauseHeading num="NOVENA" title="NOTIFICACIONES Y FIRMA ELECTRÓNICA" icon={<Send className="w-5 h-5 text-white" />} />
            <p className="text-sm">Toda comunicación entre las partes deberá realizarse por escrito y podrá ser enviada por correo electrónico, servicio postal certificado o cualquier medio que permita verificar su recepción.</p>
            <p className="text-sm mt-2">Correos de notificación:</p>
            <div className="mt-2 mb-2 rounded-lg border text-sm overflow-hidden font-sans" style={{ borderColor: `${NAVY}15` }}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-2.5 border-b" style={{ borderColor: `${NAVY}10`, background: `${NAVY}04` }}>
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                <span className="text-gray-500">EL ESTUDIO:</span>
                <strong className="break-all text-xs sm:text-sm" style={{ color: NAVY }}>contratos@diazandjohnson.online</strong>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-2.5">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                <span className="text-gray-500">EL CLIENTE:</span>
                {clientEmail ? <strong className="break-all text-xs sm:text-sm" style={{ color: NAVY }}>{clientEmail}</strong> : <span className="italic text-gray-400">(completar arriba)</span>}
              </div>
            </div>
            <p className="text-sm mt-2">Las partes acuerdan que el presente contrato podrá ser firmado mediante firma electrónica conforme al <strong style={{ color: NAVY }}>E-SIGN Act (15 U.S.C. § 7001 et seq.)</strong> y la <strong style={{ color: NAVY }}>Florida Electronic Signature Act (Fla. Stat. § 668.001 y ss.)</strong>, con la misma validez jurídica que una firma manuscrita.</p>

            <ClauseHeading num="DÉCIMA" title="ACUERDO COMPLETO" icon={<FileCheck className="w-5 h-5 text-white" />} />
            <p className="text-sm">El presente documento constituye el acuerdo completo entre las partes y reemplaza cualquier acuerdo previo, verbal o escrito. Cualquier modificación deberá realizarse por escrito y estar firmada por ambas partes.</p>
            <p className="text-sm mt-2">En señal de conformidad, el presente contrato se firma electrónicamente, teniendo la misma validez y eficacia jurídica que una firma manuscrita, conforme a la legislación aplicable.</p>

            <GoldDivider />

            {/* ══════ SIGNATURES ══════ */}
            <div className="pt-6">
              <p className="text-center text-xs uppercase tracking-[0.2em] font-semibold font-sans mb-6" style={{ color: GOLD }}>Firmas de las Partes</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Attorney */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans flex items-center gap-1.5"><Scale className="w-3 h-3" style={{ color: GOLD }} /> Firma del Abogado</p>
                  <div className="border rounded-xl p-5 text-center min-h-40 flex flex-col items-center justify-center" style={{ borderColor: `${NAVY}20`, background: `${NAVY}03` }}>
                    {selectedLawyer === "carlos-diaz" ? (
                      <CarlosDiazSignature />
                    ) : (
                      <p className="text-xl italic font-[family-name:var(--font-playfair)]" style={{ color: NAVY }}>{lawyer?.name || "Seleccione un abogado arriba"}</p>
                    )}
                    <div className="w-3/4 h-px mt-3 mb-2" style={{ background: `${GOLD}55` }} />
                    <p className="text-xs text-gray-500 font-sans">{lawyer ? lawyer.name : "Pendiente"}</p>
                    <p className="text-xs text-gray-400 font-sans">{lawyer ? `Florida Bar Nº ${lawyer.barNumber}` : ""}</p>
                    <p className="text-xs text-gray-400 font-sans">En nombre de Díaz and Johnson Attorneys</p>
                  </div>
                </div>
                {/* Client */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans flex items-center gap-1.5"><FileSignature className="w-3 h-3" style={{ color: GOLD }} /> Firma del Cliente</p>
                  <div className="w-full max-w-[380px]">
                    <SignaturePad onSignatureChange={setClientSignature} label="" width={340} height={160} />
                  </div>
                  <p className="text-xs text-gray-500 font-sans">{clientName || "(Nombre del Cliente)"} — EL CLIENTE</p>
                </div>
              </div>
            </div>

            {/* ══════ E-SIGN CONSENT ══════ */}
            <div className="mt-10 pt-6 border-t space-y-4 font-sans" style={{ borderColor: `${NAVY}10` }}>
              <div className="border rounded-xl p-4" style={{ background: "#fefbf3", borderColor: `${GOLD}33` }}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5" style={{ background: `${GOLD}18` }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: GOLD }} />
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="font-semibold" style={{ color: NAVY }}>Aviso Legal sobre Firma Electrónica</p>
                    <p className="text-gray-600">Al firmar electrónicamente este contrato, usted reconoce y acepta que su firma tiene la misma validez jurídica que una firma manuscrita, conforme al <strong style={{ color: NAVY }}>E-SIGN Act (15 U.S.C. § 7001)</strong> y la <strong style={{ color: NAVY }}>Florida Electronic Signature Act (Fla. Stat. § 668.001)</strong>.</p>
                    <p className="text-gray-400 text-xs">By electronically signing this contract, you acknowledge your e-signature has the same legal validity as a handwritten signature.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pl-1">
                <div className="flex items-start gap-3">
                  <Checkbox id="acceptTerms" checked={acceptedTerms} onCheckedChange={(c) => setAcceptedTerms(c === true)} />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">He leído y acepto todas las cláusulas del presente Contrato.</label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="acceptEsign" checked={acceptedEsign} onCheckedChange={(c) => setAcceptedEsign(c === true)} />
                  <label htmlFor="acceptEsign" className="text-sm text-gray-600 cursor-pointer leading-relaxed">Acepto el uso de firma electrónica conforme al E-SIGN Act y la Florida Electronic Signature Act.</label>
                </div>
              </div>
            </div>

            {/* ══════ SUBMIT ══════ */}
            <div className="mt-8 space-y-3 font-sans">
              {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errorMsg}</div>}
              <Button onClick={handleSubmit} disabled={!isFormValid || status === "submitting"} className="w-full h-13 text-base text-white rounded-xl shadow-lg transition-all hover:shadow-xl" style={{ background: isFormValid ? NAVY : `${NAVY}88` }} size="lg">
                {status === "submitting" ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Firmando contrato...</> : <><FileSignature className="w-5 h-5 mr-2" /> Firmar Contrato Electrónicamente</>}
              </Button>
              {!isFormValid && status === "idle" && <p className="text-xs text-center text-gray-400">Complete todos los campos, seleccione un abogado, firme y acepte los términos.</p>}
            </div>
          </div>

          {/* Document footer */}
          <div className="h-1" style={{ background: `linear-gradient(to right, ${GOLD}, ${GOLD}88, ${GOLD})` }} />
          <div className="text-center text-[10px] sm:text-[11px] px-4 sm:px-8 py-5 text-white/50" style={{ background: NAVY }}>
            <p className="font-semibold text-white/70 tracking-wide">Díaz and Johnson Attorneys at Law PLLC</p>
            <p className="mt-1">1680 Michigan Ave Suite 700, Miami Beach, FL 33139</p>
            <p className="mt-2 text-white/30">Protegido conforme al E-SIGN Act (15 U.S.C. § 7001) y Florida Electronic Signature Act (Fla. Stat. § 668.001)</p>
          </div>
        </div>
      </main>
    </div>
  )
}
