"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SignaturePad } from "@/components/signature-pad"
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, AlertTriangle, FileCheck2, Upload, Sparkles } from "lucide-react"

type QuestionType = "text" | "email" | "tel" | "date" | "number" | "yesno" | "select" | "textarea"

type Question = {
  id: number
  key: string
  label: string
  type: QuestionType
  required?: boolean
  options?: string[]
  showIf?: (answers: Record<string, string>) => boolean
}

type Step = {
  id: number
  title: string
  subtitle: string
  range: [number, number]
}

type Analysis = {
  score: number
  riskLevel: "low" | "moderate" | "high"
  eligibilityEstimate: "excellent" | "eligible" | "moderate_risk" | "high_risk"
  riskFlags: string[]
  profile: string[]
}

const DRAFT_KEY = "h2b-intake-draft-v1"

const steps: Step[] = [
  { id: 1, title: "Identidad", subtitle: "Datos legales y pasaporte", range: [1, 15] },
  { id: 2, title: "Contacto", subtitle: "Dirección y canales de comunicación", range: [16, 25] },
  { id: 3, title: "Historial EE.UU.", subtitle: "Entradas, visas y permanencia", range: [26, 45] },
  { id: 4, title: "Remoción", subtitle: "Deportación y entradas no autorizadas", range: [46, 65] },
  { id: 5, title: "Historial penal", subtitle: "Arrestos, condenas y casos pendientes", range: [66, 80] },
  { id: 6, title: "Drogas", subtitle: "Antecedentes y riesgos relacionados", range: [81, 90] },
  { id: 7, title: "Laboral", subtitle: "Experiencia y disponibilidad temporal", range: [91, 105] },
  { id: 8, title: "Familia", subtitle: "Vínculos familiares en Estados Unidos", range: [106, 115] },
  { id: 9, title: "Seguridad", subtitle: "Declaraciones y veracidad", range: [116, 120] },
  { id: 10, title: "Documentos", subtitle: "Archivos requeridos para revisión", range: [0, 0] },
  { id: 11, title: "Firma digital", subtitle: "Certificación y consentimiento", range: [0, 0] },
]

const q = (id: number, label: string, type: QuestionType = "text", required = false, options?: string[], showIf?: Question["showIf"]): Question => ({
  id,
  key: `q${id}`,
  label,
  type,
  required,
  options,
  showIf,
})

const yesNo = ["Sí", "No"]

const questions: Question[] = [
  q(1, "¿Cuál es su nombre legal completo?", "text", true),
  q(2, "¿Tiene otros nombres usados anteriormente?", "yesno", true, yesNo),
  q(3, "¿Cuál es su apellido exactamente como aparece en su pasaporte?", "text", true),
  q(4, "¿Cuál es su nombre exactamente como aparece en su pasaporte?", "text", true),
  q(5, "¿Cuál es su fecha de nacimiento?", "date", true),
  q(6, "¿Cuál es su país de nacimiento?", "text", true),
  q(7, "¿Cuál es su país de ciudadanía actual?", "text", true),
  q(8, "¿Tiene más de una ciudadanía?", "yesno", true, yesNo),
  q(9, "¿Cuál es su género?", "select", true, ["Masculino", "Femenino", "No binario", "Prefiero no responder"]),
  q(10, "¿Cuál es su estado civil actual?", "select", true, ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"]),
  q(11, "¿Tiene hijos?", "yesno", true, yesNo),
  q(12, "¿Cuántos hijos tiene?", "number", false, undefined, (a) => a.q11 === "Sí"),
  q(13, "¿Su pasaporte es válido actualmente?", "yesno", true, yesNo),
  q(14, "¿Cuál es el número de su pasaporte?", "text", true, undefined, (a) => a.q13 === "Sí"),
  q(15, "¿Cuál es la fecha de expiración de su pasaporte?", "date", true, undefined, (a) => a.q13 === "Sí"),

  q(16, "¿Cuál es su dirección actual?", "text", true),
  q(17, "¿En qué ciudad vive actualmente?", "text", true),
  q(18, "¿En qué país vive actualmente?", "text", true),
  q(19, "¿Cuál es su número de teléfono?", "tel", true),
  q(20, "¿Cuál es su correo electrónico?", "email", true),
  q(21, "¿Cuánto tiempo ha vivido en su dirección actual?", "text", true),
  q(22, "¿Ha vivido en otra dirección en los últimos 5 años?", "yesno", true, yesNo),
  q(23, "¿Ha vivido en otro país en los últimos 5 años?", "yesno", true, yesNo),
  q(24, "¿Tiene una dirección postal diferente?", "yesno", true, yesNo),
  q(25, "¿Tiene acceso regular a su correo electrónico?", "yesno", true, yesNo),

  q(26, "¿Ha estado alguna vez en Estados Unidos?", "yesno", true, yesNo),
  q(27, "¿Cuántas veces ha entrado a Estados Unidos?", "number", false, undefined, (a) => a.q26 === "Sí"),
  q(28, "¿Cuál fue la fecha de su última entrada?", "date", false, undefined, (a) => a.q26 === "Sí"),
  q(29, "¿Cuál fue el propósito de su última entrada?", "text", false, undefined, (a) => a.q26 === "Sí"),
  q(30, "¿Entró con visa?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(31, "¿Qué tipo de visa utilizó?", "text", false, undefined, (a) => a.q26 === "Sí" && a.q30 === "Sí"),
  q(32, "¿Entró sin visa?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(33, "¿Entró cruzando la frontera terrestre?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(34, "¿Entró por aeropuerto?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(35, "¿Entró con permiso temporal?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(36, "¿Se quedó más tiempo del permitido?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(37, "¿Cuánto tiempo permaneció en Estados Unidos en su última visita?", "text", false, undefined, (a) => a.q26 === "Sí"),
  q(38, "¿Alguna vez trabajó en Estados Unidos?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(39, "¿Trabajó con autorización legal?", "yesno", false, yesNo, (a) => a.q26 === "Sí" && a.q38 === "Sí"),
  q(40, "¿Trabajó sin autorización?", "yesno", false, yesNo, (a) => a.q26 === "Sí" && a.q38 === "Sí"),
  q(41, "¿Alguna vez solicitó una extensión de estadía?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(42, "¿Alguna vez solicitó asilo?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(43, "¿Alguna vez solicitó algún beneficio migratorio?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(44, "¿Alguna vez le negaron una visa?", "yesno", false, yesNo, (a) => a.q26 === "Sí"),
  q(45, "¿En qué año le negaron una visa?", "number", false, undefined, (a) => a.q26 === "Sí" && a.q44 === "Sí"),

  q(46, "¿Ha sido deportado alguna vez?", "yesno", true, yesNo),
  q(47, "¿En qué año fue deportado?", "number", false, undefined, (a) => a.q46 === "Sí"),
  q(48, "¿Cuántas veces ha sido deportado?", "number", false, undefined, (a) => a.q46 === "Sí"),
  q(49, "¿Fue deportado por un juez?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(50, "¿Fue deportado en la frontera?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(51, "¿Fue deportado desde el interior de Estados Unidos?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(52, "¿Fue detenido por ICE?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(53, "¿Fue detenido por CBP?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(54, "¿Fue detenido por policía local?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(55, "¿Firmó salida voluntaria?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(56, "¿Recibió orden de deportación formal?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(57, "¿Recibió documentos de deportación?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(58, "¿Sabe el motivo de su deportación?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(59, "¿Intentó regresar después de ser deportado?", "yesno", false, yesNo, (a) => a.q46 === "Sí"),
  q(60, "¿Ha cruzado la frontera ilegalmente?", "yesno", true, yesNo),
  q(61, "¿Cuántas veces cruzó la frontera ilegalmente?", "number", false, undefined, (a) => a.q60 === "Sí"),
  q(62, "¿Cuándo fue su último intento de entrada ilegal?", "date", false, undefined, (a) => a.q60 === "Sí"),
  q(63, "¿Fue detenido en la frontera?", "yesno", false, yesNo, (a) => a.q60 === "Sí"),
  q(64, "¿Usó un nombre falso para entrar?", "yesno", true, yesNo),
  q(65, "¿Usó documentos falsos?", "yesno", true, yesNo),

  q(66, "¿Ha sido arrestado alguna vez?", "yesno", true, yesNo),
  q(67, "¿En qué país fue arrestado?", "text", false, undefined, (a) => a.q66 === "Sí"),
  q(68, "¿En qué año fue arrestado?", "number", false, undefined, (a) => a.q66 === "Sí"),
  q(69, "¿Cuál fue el motivo del arresto?", "textarea", false, undefined, (a) => a.q66 === "Sí"),
  q(70, "¿Fue acusado formalmente?", "yesno", false, yesNo, (a) => a.q66 === "Sí"),
  q(71, "¿Fue condenado?", "yesno", false, yesNo, (a) => a.q66 === "Sí"),
  q(72, "¿Pagó una multa?", "yesno", false, yesNo, (a) => a.q66 === "Sí"),
  q(73, "¿Estuvo en prisión?", "yesno", false, yesNo, (a) => a.q66 === "Sí"),
  q(74, "¿Cuánto tiempo estuvo en prisión?", "text", false, undefined, (a) => a.q66 === "Sí" && a.q73 === "Sí"),
  q(75, "¿Tiene casos pendientes?", "yesno", true, yesNo),
  q(76, "¿Tiene órdenes de arresto pendientes?", "yesno", true, yesNo),
  q(77, "¿Ha sido acusado de fraude?", "yesno", true, yesNo),
  q(78, "¿Ha sido acusado de violencia?", "yesno", true, yesNo),
  q(79, "¿Ha sido acusado de robo?", "yesno", true, yesNo),
  q(80, "¿Ha sido acusado de algún delito migratorio?", "yesno", true, yesNo),

  q(81, "¿Ha usado drogas ilegales alguna vez?", "yesno", true, ["Sí", "No", "Prefiero no responder"]),
  q(82, "¿Qué tipo de droga?", "text", false, undefined, (a) => a.q81 === "Sí"),
  q(83, "¿Cuándo fue la última vez que usó drogas?", "date", false, undefined, (a) => a.q81 === "Sí"),
  q(84, "¿Ha sido arrestado por drogas?", "yesno", true, yesNo),
  q(85, "¿Ha sido acusado de posesión de drogas?", "yesno", true, yesNo),
  q(86, "¿Ha sido acusado de tráfico de drogas?", "yesno", true, yesNo),
  q(87, "¿Ha vendido drogas?", "yesno", true, yesNo),
  q(88, "¿Ha transportado drogas?", "yesno", true, yesNo),
  q(89, "¿Ha sido investigado por delitos relacionados con drogas?", "yesno", true, yesNo),
  q(90, "¿Ha tenido problemas legales relacionados con drogas?", "yesno", true, yesNo),

  q(91, "¿Está actualmente empleado?", "yesno", true, yesNo),
  q(92, "¿Cuál es su ocupación actual?", "text", false, undefined, (a) => a.q91 === "Sí"),
  q(93, "¿Cuál es el nombre de su empleador actual?", "text", false, undefined, (a) => a.q91 === "Sí"),
  q(94, "¿En qué país trabaja actualmente?", "text", false, undefined, (a) => a.q91 === "Sí"),
  q(95, "¿Cuánto tiempo ha trabajado allí?", "text", false, undefined, (a) => a.q91 === "Sí"),
  q(96, "¿Ha trabajado anteriormente en otro empleo?", "yesno", true, yesNo),
  q(97, "¿Tiene experiencia en construcción?", "yesno", true, yesNo),
  q(98, "¿Tiene experiencia en agricultura?", "yesno", true, yesNo),
  q(99, "¿Tiene experiencia en limpieza?", "yesno", true, yesNo),
  q(100, "¿Tiene experiencia en hotelería?", "yesno", true, yesNo),
  q(101, "¿Tiene experiencia en fábricas?", "yesno", true, yesNo),
  q(102, "¿Ha trabajado en Estados Unidos antes?", "yesno", true, yesNo),
  q(103, "¿Tiene habilidades técnicas?", "yesno", true, yesNo),
  q(104, "¿Tiene certificaciones laborales?", "yesno", true, yesNo),
  q(105, "¿Está dispuesto a trabajar en Estados Unidos temporalmente?", "yesno", true, yesNo),

  q(106, "¿Está casado?", "yesno", true, yesNo),
  q(107, "¿Su cónyuge es ciudadano estadounidense?", "yesno", false, yesNo, (a) => a.q106 === "Sí"),
  q(108, "¿Su cónyuge vive en Estados Unidos?", "yesno", false, yesNo, (a) => a.q106 === "Sí"),
  q(109, "¿Tiene familiares en Estados Unidos?", "yesno", true, yesNo),
  q(110, "¿Qué familiares tiene en Estados Unidos?", "textarea", false, undefined, (a) => a.q109 === "Sí"),
  q(111, "¿Cuál es el estatus migratorio de sus familiares?", "textarea", false, undefined, (a) => a.q109 === "Sí"),
  q(112, "¿Tiene hijos en Estados Unidos?", "yesno", true, yesNo),
  q(113, "¿Sus padres están en Estados Unidos?", "yesno", true, yesNo),
  q(114, "¿Tiene hermanos en Estados Unidos?", "yesno", true, yesNo),
  q(115, "¿Algún familiar le ha pedido migratoriamente?", "yesno", true, yesNo),

  q(116, "¿Ha mentido alguna vez a un oficial migratorio?", "yesno", true, yesNo),
  q(117, "¿Ha usado documentos falsos?", "yesno", true, yesNo),
  q(118, "¿Ha cometido fraude migratorio?", "yesno", true, yesNo),
  q(119, "¿Toda la información proporcionada es verdadera?", "yesno", true, yesNo),
  q(120, "¿Acepta que esta información será revisada por un abogado de inmigración?", "yesno", true, yesNo),
]

function getVisibleQuestionsForStep(step: Step, answers: Record<string, string>) {
  if (step.range[0] === 0) return []
  return questions.filter((question) => question.id >= step.range[0] && question.id <= step.range[1] && (!question.showIf || question.showIf(answers)))
}

function scoreCase(answers: Record<string, string>): Analysis {
  const riskFlags: string[] = []
  const profile: string[] = []
  let score = 100

  if (answers.q26 === "Sí") profile.push("Historial previo de entrada a EE.UU.")
  if (answers.q97 === "Sí" || answers.q98 === "Sí" || answers.q100 === "Sí") profile.push("Experiencia laboral relevante H-2B")
  if (answers.q105 === "Sí") profile.push("Disponibilidad para empleo temporal en EE.UU.")

  const penalties: Array<[string, string, number]> = [
    ["q36", "Sobreestadía previa", 15],
    ["q40", "Trabajo sin autorización", 15],
    ["q44", "Negación de visa previa", 10],
    ["q46", "Deportación/remoción", 30],
    ["q60", "Cruces fronterizos no autorizados", 25],
    ["q64", "Uso de nombre falso", 35],
    ["q65", "Uso de documentos falsos", 35],
    ["q71", "Condena penal", 25],
    ["q75", "Casos penales pendientes", 20],
    ["q76", "Órdenes de arresto pendientes", 25],
    ["q77", "Acusación de fraude", 20],
    ["q78", "Acusación de violencia", 20],
    ["q80", "Delito migratorio", 25],
    ["q81", "Uso de drogas ilegales", 20],
    ["q86", "Acusación de tráfico de drogas", 40],
    ["q87", "Venta de drogas", 40],
    ["q88", "Transporte de drogas", 35],
    ["q116", "Declaración de mentira ante oficial", 25],
    ["q117", "Uso de documentos falsos (declaración)", 30],
    ["q118", "Fraude migratorio", 35],
  ]

  penalties.forEach(([key, label, amount]) => {
    if (answers[key] === "Sí") {
      score -= amount
      riskFlags.push(label)
    }
  })

  if (answers.q91 === "Sí") score += 3
  if (answers.q103 === "Sí") score += 2
  if (answers.q104 === "Sí") score += 2

  score = Math.max(0, Math.min(100, score))

  let riskLevel: Analysis["riskLevel"] = "low"
  let eligibilityEstimate: Analysis["eligibilityEstimate"] = "excellent"

  if (score < 50) {
    riskLevel = "high"
    eligibilityEstimate = "high_risk"
  } else if (score < 70) {
    riskLevel = "moderate"
    eligibilityEstimate = "moderate_risk"
  } else if (score < 90) {
    riskLevel = "moderate"
    eligibilityEstimate = "eligible"
  }

  if (score >= 90) {
    riskLevel = "low"
    eligibilityEstimate = "excellent"
  }

  if (profile.length === 0) {
    profile.push("Perfil inicial capturado para revisión legal")
  }

  return { score, riskLevel, eligibilityEstimate, riskFlags, profile }
}

export function H2BIntakeWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [signature, setSignature] = useState<string | null>(null)
  const [certify, setCertify] = useState(false)
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [visaPhotoFile, setVisaPhotoFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const activeStep = steps[currentStep - 1]
  const visibleQuestions = useMemo(
    () => getVisibleQuestionsForStep(activeStep, answers),
    [activeStep, answers]
  )

  const progressValue = Math.round((currentStep / (steps.length + 1)) * 100)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        currentStep?: number
        answers?: Record<string, string>
        certify?: boolean
      }
      if (parsed.currentStep && parsed.currentStep > 0 && parsed.currentStep <= steps.length) {
        setCurrentStep(parsed.currentStep)
      }
      if (parsed.answers) setAnswers(parsed.answers)
      setCertify(Boolean(parsed.certify))
    } catch {
      // ignore draft parse errors
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        currentStep,
        answers,
        certify,
      })
    )
  }, [currentStep, answers, certify])

  const handleAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  const validateCurrentStep = useCallback(() => {
    setError(null)

    if (currentStep <= 9) {
      const missing = visibleQuestions.find((question) => question.required && !String(answers[question.key] ?? "").trim())
      if (missing) {
        setError(`Complete la pregunta ${missing.id} para continuar.`)
        return false
      }
    }

    if (currentStep === 9) {
      if (answers.q119 !== "Sí" || answers.q120 !== "Sí") {
        setError("Debe confirmar veracidad y autorización de revisión legal.")
        return false
      }
    }

    if (currentStep === 10) {
      if (!passportFile) {
        setError("Passport is required to continue your immigration eligibility assessment.")
        return false
      }
      if (!selfieFile) {
        setError("Selfie with passport is required to continue.")
        return false
      }
    }

    if (currentStep === 11) {
      if (!certify) {
        setError("Debe certificar bajo pena de perjurio antes de enviar.")
        return false
      }
      if (!signature) {
        setError("La firma digital es obligatoria.")
        return false
      }
    }

    return true
  }, [answers, certify, currentStep, passportFile, selfieFile, signature, visibleQuestions])

  const goNext = () => {
    if (!validateCurrentStep()) return
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const goBack = () => {
    setError(null)
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    setError(null)

    const computed = scoreCase(answers)

    const documentMeta = {
      passport: passportFile ? { name: passportFile.name, size: passportFile.size, type: passportFile.type } : null,
      selfieWithPassport: selfieFile ? { name: selfieFile.name, size: selfieFile.size, type: selfieFile.type } : null,
      visaPhoto: visaPhotoFile ? { name: visaPhotoFile.name, size: visaPhotoFile.size, type: visaPhotoFile.type } : null,
      cv: cvFile ? { name: cvFile.name, size: cvFile.size, type: cvFile.type } : null,
      certifications: certFile ? { name: certFile.name, size: certFile.size, type: certFile.type } : null,
    }

    try {
      const payload = {
        data: {
          h2bIntake: {
            answers,
            analysis: computed,
            documentMeta,
            declarationAccepted: certify,
            signedAt: new Date().toISOString(),
          },
        },
        contactName: answers.q1 || "Sin nombre",
        contactEmail: answers.q20 || "",
        contactPhone: answers.q19 || "",
      }

      const response = await fetch("/api/consult/h2b-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("No se pudo enviar el expediente")
      }

      setAnalysis(computed)
      localStorage.removeItem(DRAFT_KEY)
      setCurrentStep(steps.length + 1)
    } catch {
      setError("No se pudo completar el envío. Intente nuevamente en unos minutos.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStep === steps.length + 1 && analysis) {
    const riskTone =
      analysis.riskLevel === "low"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : analysis.riskLevel === "moderate"
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-red-50 border-red-200 text-red-800"

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card className="border-0 shadow-2xl bg-linear-to-br from-white to-slate-50">
          <CardContent className="p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Expediente recibido correctamente</h2>
                <p className="text-slate-600">CASE STATUS: UNDER ATTORNEY REVIEW</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Eligibility Score</p>
                  <p className="text-3xl font-bold text-slate-900">{analysis.score}%</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Nivel de riesgo</p>
                  <p className="text-xl font-semibold capitalize">{analysis.riskLevel}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Elegibilidad estimada</p>
                  <p className="text-xl font-semibold capitalize">{analysis.eligibilityEstimate.replace("_", " ")}</p>
                </CardContent>
              </Card>
            </div>

            <div className={`rounded-xl border p-4 ${riskTone}`}>
              <p className="font-semibold mb-2">Perfil migratorio</p>
              <ul className="space-y-1 text-sm">
                {analysis.profile.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            {analysis.riskFlags.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800 mb-2">Risk Flags detectados</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.riskFlags.map((flag) => (
                    <Badge key={flag} variant="outline" className="border-red-300 text-red-800 bg-white">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Díaz and Johnson Attorney</p>
              <h1 className="text-2xl md:text-3xl font-bold">H-2B Immigration Intake Intelligence</h1>
            </div>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/15">
              Paso {Math.min(currentStep, steps.length)} de {steps.length}
            </Badge>
          </div>
          <Progress value={progressValue} className="h-2 bg-white/20" />
          <p className="text-xs text-slate-300 mt-2">{progressValue}% completado</p>
        </div>

        <CardHeader className="pb-2 border-b bg-slate-50/80">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {activeStep.title}
          </CardTitle>
          <CardDescription>{activeStep.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {currentStep <= 9 &&
                visibleQuestions.map((question) => {
                  const value = answers[question.key] || ""

                  return (
                    <div key={question.key} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                      <Label className="text-sm md:text-base font-medium text-slate-900">
                        {question.id}. {question.label}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      <div className="mt-3">
                        {question.type === "yesno" && question.options ? (
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option) => {
                              const active = value === option
                              return (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={active ? "default" : "outline"}
                                  onClick={() => handleAnswer(question.key, option)}
                                  className={active ? "bg-slate-900 hover:bg-slate-800" : "hover:bg-slate-50"}
                                >
                                  {option}
                                </Button>
                              )
                            })}
                          </div>
                        ) : question.type === "select" && question.options ? (
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option) => {
                              const active = value === option
                              return (
                                <Button
                                  key={option}
                                  type="button"
                                  variant={active ? "default" : "outline"}
                                  onClick={() => handleAnswer(question.key, option)}
                                  className={active ? "bg-slate-900 hover:bg-slate-800" : "hover:bg-slate-50"}
                                >
                                  {option}
                                </Button>
                              )
                            })}
                          </div>
                        ) : question.type === "textarea" ? (
                          <Textarea
                            value={value}
                            onChange={(event) => handleAnswer(question.key, event.target.value)}
                            rows={3}
                            className="bg-white"
                          />
                        ) : (
                          <Input
                            type={question.type}
                            value={value}
                            onChange={(event) => handleAnswer(question.key, event.target.value)}
                            className="bg-white"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}

              {currentStep === 10 && (
                <div className="space-y-4">
                  <Card className="border-indigo-200 bg-indigo-50/40">
                    <CardContent className="p-4 text-sm text-indigo-900">
                      <p className="font-semibold mb-1">Documentación obligatoria</p>
                      <p>Debe subir pasaporte y selfie con pasaporte para habilitar el envío.</p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4 bg-white">
                      <Label className="font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Pasaporte (obligatorio)</Label>
                      <Input className="mt-2" type="file" accept="image/*,.pdf" onChange={(event) => setPassportFile(event.target.files?.[0] || null)} />
                    </div>
                    <div className="rounded-xl border p-4 bg-white">
                      <Label className="font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Selfie con pasaporte (obligatorio)</Label>
                      <Input className="mt-2" type="file" accept="image/*" onChange={(event) => setSelfieFile(event.target.files?.[0] || null)} />
                    </div>
                    <div className="rounded-xl border p-4 bg-white">
                      <Label className="font-medium">Foto tipo visa (opcional)</Label>
                      <Input className="mt-2" type="file" accept="image/*" onChange={(event) => setVisaPhotoFile(event.target.files?.[0] || null)} />
                    </div>
                    <div className="rounded-xl border p-4 bg-white">
                      <Label className="font-medium">CV / Resume (opcional)</Label>
                      <Input className="mt-2" type="file" accept=".pdf,.doc,.docx" onChange={(event) => setCvFile(event.target.files?.[0] || null)} />
                    </div>
                    <div className="rounded-xl border p-4 bg-white md:col-span-2">
                      <Label className="font-medium">Certificaciones laborales (opcional)</Label>
                      <Input className="mt-2" type="file" accept=".pdf,image/*" onChange={(event) => setCertFile(event.target.files?.[0] || null)} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 11 && (
                <div className="space-y-5">
                  <Card className="border-amber-200 bg-amber-50/40">
                    <CardContent className="p-4 text-sm text-amber-900 space-y-2">
                      <p className="font-semibold">Declaración legal</p>
                      <p>I certify under penalty of perjury that all information provided is true and correct.</p>
                      <button
                        type="button"
                        onClick={() => setCertify((value) => !value)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                          certify ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <span className="font-medium">{certify ? "✓ Declaración aceptada" : "Marcar declaración"}</span>
                      </button>
                    </CardContent>
                  </Card>

                  <div className="rounded-xl border p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-slate-700" />
                      <p className="text-sm font-semibold text-slate-900">Firma digital del cliente</p>
                    </div>
                    <SignaturePad onSignatureChange={setSignature} label="Firma / Signature" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 1 || isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>

            {currentStep < steps.length ? (
              <Button type="button" onClick={goNext} className="bg-slate-900 hover:bg-slate-800">
                Siguiente <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? "Enviando expediente..." : "Enviar para revisión legal"}
                {!isSubmitting && <FileCheck2 className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
