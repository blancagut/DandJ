"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Globe,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  Mail,
  Video,
  MapPin,
  Clock,
  AlertTriangle,
  Zap,
  Calendar,
  Scale,
  Shield,
  Briefcase,
  Heart,
  GraduationCap,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import Link from "next/link"

// ==========================================
// TRANSLATIONS
// ==========================================

const translations = {
  en: {
    title: "General Consultation",
    subtitle: "Tell us about your case — we'll review and reach out within 24 hours.",
    steps: {
      personal: { title: "Personal", desc: "Your Info" },
      caseInfo: { title: "Case", desc: "Details" },
      description: { title: "Details", desc: "Your Story" },
      review: { title: "Review", desc: "Confirm" },
    },
    step1: {
      heading: "Personal Information",
      firstName: "First Name",
      firstNamePh: "e.g. María",
      lastName: "Last Name",
      lastNamePh: "e.g. García",
      email: "Email",
      emailPh: "email@example.com",
      phone: "Phone",
      phonePh: "+1 (555) 000-0000",
      nationality: "Nationality",
      nationalityOther: "Other nationality",
      nationalityOtherPh: "Type your nationality",
      location: "Current Location",
      locationPh: "City, State or Country",
    },
    step2: {
      heading: "Case Details",
      caseType: "What type of case do you need help with?",
      urgency: "How urgent is your situation?",
      urgencyImmediate: "Immediate",
      urgencyImmediateDesc: "Court date or deadline within days",
      urgencyUrgent: "Urgent",
      urgencyUrgentDesc: "Need help within 1-2 weeks",
      urgencyNormal: "Normal",
      urgencyNormalDesc: "Planning ahead, no rush",
      urgencyPlanning: "Planning",
      urgencyPlanningDesc: "Future immigration plans",
    },
    step3: {
      heading: "Tell Us Your Story",
      description: "Describe your situation",
      descriptionPh: "Please describe your immigration situation, any deadlines, previous filings, or concerns you have...",
      descriptionHelp: "The more detail you provide, the better we can prepare for your consultation.",
      previousAttorney: "Previous Attorney (optional)",
      previousAttorneyPh: "Name of previous attorney, if any",
      courtDate: "Upcoming Court Date (optional)",
      courtDatePh: "DD/MM/YYYY",
      contactMethod: "Preferred Contact Method",
      contactTime: "Preferred Time (optional)",
      timeMorning: "Morning",
      timeAfternoon: "Afternoon",
      timeEvening: "Evening",
      timeFlexible: "Flexible",
    },
    step4: {
      heading: "Review & Submit",
      personalInfo: "Personal Information",
      caseDetails: "Case Details",
      yourStory: "Your Story",
      preferences: "Preferences",
      contact: "Contact",
      time: "Time",
      terms: "I agree that my information will be used to evaluate my case and contact me regarding legal services. This does not create an attorney-client relationship.",
      submit: "Submit Consultation Request",
      submitting: "Submitting...",
    },
    caseTypes: {
      "h2b-work-visa": "H-2B Work Visa",
      "family-petition": "Family Petition",
      "immigration-greencard": "Green Card",
      "immigration-citizenship": "Citizenship",
      "immigration-deportation": "Deportation Defense",
      "immigration-asylum": "Asylum",
      "criminal-defense": "Criminal Defense",
      "business-immigration": "Business Immigration",
    },
    contactMethods: { phone: "Phone", email: "Email", video: "Video Call", "in-person": "In Person" },
    nationalities: ["Mexican", "Honduran", "Guatemalan", "Salvadoran", "Colombian", "Venezuelan", "Cuban", "Haitian", "Brazilian"],
    validation: {
      firstNameReq: "First name is required (min 2 characters)",
      lastNameReq: "Last name is required (min 2 characters)",
      emailReq: "Valid email is required",
      phoneReq: "Phone number is required (min 10 digits)",
      nationalityReq: "Nationality is required",
      locationReq: "Current location is required",
      caseTypeReq: "Please select a case type",
      urgencyReq: "Please select urgency level",
      descriptionReq: "Please describe your situation (min 20 characters)",
      contactMethodReq: "Please select a contact method",
      termsReq: "You must agree to the terms",
    },
    confirmation: {
      title: "Consultation Request Submitted!",
      message: "Thank you for reaching out. Our team will review your case and contact you within 24 hours.",
      followUp: "Check your email for a confirmation.",
      backToForms: "Back to Forms",
      backToHome: "Back to Home",
    },
    nav: { back: "Back", next: "Continue", analyze: "Review" },
  },
  es: {
    title: "Consulta General",
    subtitle: "Cuéntenos sobre su caso — lo revisaremos y nos comunicaremos dentro de 24 horas.",
    steps: {
      personal: { title: "Personal", desc: "Sus Datos" },
      caseInfo: { title: "Caso", desc: "Detalles" },
      description: { title: "Detalles", desc: "Su Historia" },
      review: { title: "Revisar", desc: "Confirmar" },
    },
    step1: {
      heading: "Información Personal",
      firstName: "Nombre",
      firstNamePh: "ej. María",
      lastName: "Apellido",
      lastNamePh: "ej. García",
      email: "Correo Electrónico",
      emailPh: "correo@ejemplo.com",
      phone: "Teléfono",
      phonePh: "+1 (555) 000-0000",
      nationality: "Nacionalidad",
      nationalityOther: "Otra nacionalidad",
      nationalityOtherPh: "Escriba su nacionalidad",
      location: "Ubicación Actual",
      locationPh: "Ciudad, Estado o País",
    },
    step2: {
      heading: "Detalles del Caso",
      caseType: "¿Qué tipo de caso necesita?",
      urgency: "¿Qué tan urgente es su situación?",
      urgencyImmediate: "Inmediata",
      urgencyImmediateDesc: "Fecha de corte o plazo en días",
      urgencyUrgent: "Urgente",
      urgencyUrgentDesc: "Necesita ayuda en 1-2 semanas",
      urgencyNormal: "Normal",
      urgencyNormalDesc: "Planificando, sin prisa",
      urgencyPlanning: "Planificación",
      urgencyPlanningDesc: "Planes de inmigración futuros",
    },
    step3: {
      heading: "Cuéntenos Su Historia",
      description: "Describa su situación",
      descriptionPh: "Por favor describa su situación migratoria, fechas límite, solicitudes previas o preocupaciones...",
      descriptionHelp: "Mientras más detalle nos brinde, mejor podremos preparar su consulta.",
      previousAttorney: "Abogado Anterior (opcional)",
      previousAttorneyPh: "Nombre del abogado anterior, si aplica",
      courtDate: "Próxima Fecha de Corte (opcional)",
      courtDatePh: "DD/MM/AAAA",
      contactMethod: "Método de Contacto Preferido",
      contactTime: "Horario Preferido (opcional)",
      timeMorning: "Mañana",
      timeAfternoon: "Tarde",
      timeEvening: "Noche",
      timeFlexible: "Flexible",
    },
    step4: {
      heading: "Revisar y Enviar",
      personalInfo: "Información Personal",
      caseDetails: "Detalles del Caso",
      yourStory: "Su Historia",
      preferences: "Preferencias",
      contact: "Contacto",
      time: "Horario",
      terms: "Acepto que mi información sea utilizada para evaluar mi caso y contactarme sobre servicios legales. Esto no crea una relación abogado-cliente.",
      submit: "Enviar Solicitud de Consulta",
      submitting: "Enviando...",
    },
    caseTypes: {
      "h2b-work-visa": "Visa H-2B de Trabajo",
      "family-petition": "Petición Familiar",
      "immigration-greencard": "Tarjeta Verde",
      "immigration-citizenship": "Ciudadanía",
      "immigration-deportation": "Defensa de Deportación",
      "immigration-asylum": "Asilo",
      "criminal-defense": "Defensa Criminal",
      "business-immigration": "Inmigración de Negocios",
    },
    contactMethods: { phone: "Teléfono", email: "Correo", video: "Videollamada", "in-person": "En Persona" },
    nationalities: ["Mexicana", "Hondureña", "Guatemalteca", "Salvadoreña", "Colombiana", "Venezolana", "Cubana", "Haitiana", "Brasileña"],
    validation: {
      firstNameReq: "El nombre es requerido (mín. 2 caracteres)",
      lastNameReq: "El apellido es requerido (mín. 2 caracteres)",
      emailReq: "Se requiere un correo válido",
      phoneReq: "Se requiere teléfono (mín. 10 dígitos)",
      nationalityReq: "La nacionalidad es requerida",
      locationReq: "La ubicación actual es requerida",
      caseTypeReq: "Seleccione un tipo de caso",
      urgencyReq: "Seleccione el nivel de urgencia",
      descriptionReq: "Describa su situación (mín. 20 caracteres)",
      contactMethodReq: "Seleccione un método de contacto",
      termsReq: "Debe aceptar los términos",
    },
    confirmation: {
      title: "¡Solicitud de Consulta Enviada!",
      message: "Gracias por comunicarse. Nuestro equipo revisará su caso y lo contactará dentro de 24 horas.",
      followUp: "Revise su correo electrónico para una confirmación.",
      backToForms: "Volver a Formularios",
      backToHome: "Volver al Inicio",
    },
    nav: { back: "Atrás", next: "Continuar", analyze: "Revisar" },
  },
}

// ==========================================
// TYPES
// ==========================================

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  customNationality: string
  currentLocation: string
  caseType: string
  urgency: string
  caseDescription: string
  previousAttorney: string
  courtDate: string
  courtDateDisplay: string
  preferredContactMethod: string
  preferredConsultationTime: string
  agreeToTerms: boolean
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationality: "",
  customNationality: "",
  currentLocation: "",
  caseType: "",
  urgency: "",
  caseDescription: "",
  previousAttorney: "",
  courtDate: "",
  courtDateDisplay: "",
  preferredContactMethod: "",
  preferredConsultationTime: "",
  agreeToTerms: false,
}

// ==========================================
// CASE TYPE OPTIONS
// ==========================================

const caseTypeOptions = [
  { id: "h2b-work-visa", icon: Briefcase },
  { id: "family-petition", icon: Heart },
  { id: "immigration-greencard", icon: Shield },
  { id: "immigration-citizenship", icon: Globe },
  { id: "immigration-deportation", icon: Scale },
  { id: "immigration-asylum", icon: Home },
  { id: "criminal-defense", icon: AlertTriangle },
  { id: "business-immigration", icon: GraduationCap },
]

const urgencyOptions = [
  { id: "immediate", icon: Zap, color: "red" },
  { id: "urgent", icon: AlertTriangle, color: "amber" },
  { id: "normal", icon: Clock, color: "blue" },
  { id: "planning", icon: Calendar, color: "green" },
]

const contactMethodOptions = [
  { id: "phone", icon: Phone },
  { id: "email", icon: Mail },
  { id: "video", icon: Video },
  { id: "in-person", icon: MapPin },
]

// ==========================================
// STEP CONFIG
// ==========================================

const stepsConfig = [
  { id: 1, key: "personal", icon: User },
  { id: 2, key: "caseInfo", icon: FileText },
  { id: 3, key: "description", icon: MessageSquare },
  { id: 4, key: "review", icon: CheckCircle2 },
]

// ==========================================
// DATE INPUT HELPER
// ==========================================

function DateInputField({
  value,
  onChange,
  onValueChange,
  placeholder,
  label,
  id,
}: {
  value: string
  onChange: (isoDate: string) => void
  onValueChange: (display: string) => void
  placeholder: string
  label: string
  id: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "")
    if (raw.length > 8) raw = raw.slice(0, 8)
    let formatted = ""
    if (raw.length > 0) formatted = raw.slice(0, 2)
    if (raw.length > 2) formatted += "/" + raw.slice(2, 4)
    if (raw.length > 4) formatted += "/" + raw.slice(4, 8)
    onValueChange(formatted)
    if (raw.length === 8) {
      const dd = raw.slice(0, 2)
      const mm = raw.slice(2, 4)
      const yyyy = raw.slice(4, 8)
      const day = parseInt(dd, 10)
      const month = parseInt(mm, 10)
      const year = parseInt(yyyy, 10)
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2030) {
        onChange(`${yyyy}-${mm}-${dd}`)
      } else {
        onChange("")
      }
    } else {
      onChange("")
    }
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={10}
        className="mt-1"
      />
    </div>
  )
}

// ==========================================
// COMPONENT
// ==========================================

export function ConsultationForm() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window === "undefined") return initialFormData
    try {
      const saved = localStorage.getItem("consultation-form-data")
      if (!saved) return initialFormData
      const parsed = JSON.parse(saved)
      return { ...initialFormData, ...parsed, agreeToTerms: false }
    } catch {
      return initialFormData
    }
  })
  const [direction, setDirection] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showOtherNationality, setShowOtherNationality] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const saved = localStorage.getItem("consultation-form-data")
      if (!saved) return false
      const parsed = JSON.parse(saved)
      return Boolean(parsed.customNationality)
    } catch {
      return false
    }
  })
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (typeof window !== "undefined") {
      try { localStorage.setItem("consultation-form-data", JSON.stringify(formData)) } catch { /* ignore */ }
    }
  }, [formData])

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const effectiveNationality = showOtherNationality ? formData.customNationality : formData.nationality

  const validateStep = (step: number): string | null => {
    setValidationError(null)
    switch (step) {
      case 1:
        if (formData.firstName.trim().length < 2) return t.validation.firstNameReq
        if (formData.lastName.trim().length < 2) return t.validation.lastNameReq
        if (!formData.email.includes("@") || !formData.email.includes(".")) return t.validation.emailReq
        if (formData.phone.replace(/\D/g, "").length < 10) return t.validation.phoneReq
        if (!effectiveNationality || effectiveNationality.trim().length < 2) return t.validation.nationalityReq
        if (formData.currentLocation.trim().length < 2) return t.validation.locationReq
        break
      case 2:
        if (!formData.caseType) return t.validation.caseTypeReq
        if (!formData.urgency) return t.validation.urgencyReq
        break
      case 3:
        if (formData.caseDescription.trim().length < 20) return t.validation.descriptionReq
        if (!formData.preferredContactMethod) return t.validation.contactMethodReq
        break
      case 4:
        if (!formData.agreeToTerms) return t.validation.termsReq
        break
    }
    return null
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) { setValidationError(error); return }
    if (currentStep < 4) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
      setValidationError(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
      setValidationError(null)
    }
  }

  const handleSubmit = async () => {
    const error = validateStep(4)
    if (error) { setValidationError(error); return }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated Supabase types
      const { error: dbError } = await supabase.from("consultation_requests").insert({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        nationality: effectiveNationality.trim(),
        current_location: formData.currentLocation.trim(),
        case_type: formData.caseType,
        urgency: formData.urgency,
        case_description: formData.caseDescription.trim(),
        previous_attorney: formData.previousAttorney.trim() || null,
        court_date: formData.courtDate || null,
        preferred_contact_method: formData.preferredContactMethod,
        preferred_consultation_time: formData.preferredConsultationTime || null,
        language,
        status: "new",
      })
      if (dbError) {
        console.error("Supabase insert error:", dbError)
        setSubmitError(language === "es" ? "Error al enviar. Por favor intente de nuevo." : "Error submitting. Please try again.")
        setIsSubmitting(false)
        return
      }
      localStorage.removeItem("consultation-form-data")
      setIsSubmitted(true)
    } catch (e) {
      console.error("Consultation submit failed:", e)
      setSubmitError(language === "es" ? "Error de conexión. Por favor intente de nuevo." : "Connection error. Please try again.")
    }
    setIsSubmitting(false)
  }

  // Animation
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 50 : -50, opacity: 0 }),
  }

  // ==========================================
  // SUBMITTED CONFIRMATION
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 shadow-lg border-t-4 border-t-green-600 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t.confirmation.title}</h2>
            <p className="text-lg text-slate-600 mb-2">{t.confirmation.message}</p>
            <p className="text-slate-500 mb-8">{t.confirmation.followUp}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consult">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ChevronLeft className="w-4 h-4" /> {t.confirmation.backToForms}
                </Button>
              </Link>
              <Link href="/">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  {t.confirmation.backToHome}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ==========================================
  // FORM WIZARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header / Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
            <WaiverLanguageSelector />
          </div>
          <p className="text-slate-600 mb-6">{t.subtitle}</p>

          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{validationError}</span>
            </motion.div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
            {stepsConfig.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              return (
                <div key={step.id} className="flex flex-col items-center bg-slate-50 px-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isActive ? "border-blue-600 bg-blue-600 text-white" :
                      isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-slate-400"
                    )}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-2 hidden sm:block",
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                  )}>
                    {t.steps[step.key as keyof typeof t.steps]?.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 md:p-8 min-h-80 relative shadow-lg border-t-4 border-t-blue-600">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* =============== STEP 1: PERSONAL INFO =============== */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t.step1.heading}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t.step1.firstName}</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder={t.step1.firstNamePh} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t.step1.lastName}</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder={t.step1.lastNamePh} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t.step1.email}</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder={t.step1.emailPh} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.step1.phone}</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder={t.step1.phonePh} className="mt-1" />
                    </div>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-3">
                    <Label>{t.step1.nationality}</Label>
                    <div className="flex flex-wrap gap-2">
                      {t.nationalities.map((nat, i) => (
                        <button
                          key={nat}
                          type="button"
                          onClick={() => {
                            updateField("nationality", translations.en.nationalities[i])
                            setShowOtherNationality(false)
                            updateField("customNationality", "")
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
                            formData.nationality === translations.en.nationalities[i] && !showOtherNationality
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 hover:border-blue-300 text-slate-600"
                          )}
                        >
                          {nat}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtherNationality(true)
                          updateField("nationality", "")
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
                          showOtherNationality
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-blue-300 text-slate-600"
                        )}
                      >
                        {t.step1.nationalityOther}
                      </button>
                    </div>
                    {showOtherNationality && (
                      <Input
                        value={formData.customNationality}
                        onChange={(e) => updateField("customNationality", e.target.value)}
                        placeholder={t.step1.nationalityOtherPh}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">{t.step1.location}</Label>
                    <Input id="location" value={formData.currentLocation} onChange={(e) => updateField("currentLocation", e.target.value)} placeholder={t.step1.locationPh} className="mt-1" />
                  </div>
                </div>
              )}

              {/* =============== STEP 2: CASE DETAILS =============== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t.step2.heading}</h2>
                  </div>

                  {/* Case Type */}
                  <div className="space-y-3">
                    <Label className="text-base">{t.step2.caseType}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {caseTypeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateField("caseType", opt.id)}
                          className={cn(
                            "p-4 border-2 rounded-xl flex items-center gap-3 text-left transition-all",
                            formData.caseType === opt.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          )}
                        >
                          <opt.icon className={cn("w-6 h-6 shrink-0", formData.caseType === opt.id ? "text-blue-600" : "text-slate-400")} />
                          <span className="font-medium text-sm">
                            {t.caseTypes[opt.id as keyof typeof t.caseTypes]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-3">
                    <Label className="text-base">{t.step2.urgency}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {urgencyOptions.map((opt) => {
                        const urgKey = `urgency${opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}` as keyof typeof t.step2
                        const descKey = `${urgKey}Desc` as keyof typeof t.step2
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField("urgency", opt.id)}
                            className={cn(
                              "p-4 border-2 rounded-xl flex items-start gap-3 text-left transition-all",
                              formData.urgency === opt.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300"
                            )}
                          >
                            <opt.icon className={cn("w-5 h-5 mt-0.5 shrink-0", formData.urgency === opt.id ? "text-blue-600" : "text-slate-400")} />
                            <div>
                              <span className="font-medium text-sm block">{t.step2[urgKey]}</span>
                              <span className="text-xs text-slate-500">{t.step2[descKey]}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* =============== STEP 3: DESCRIPTION =============== */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t.step3.heading}</h2>
                  </div>

                  <div>
                    <Label htmlFor="description">{t.step3.description}</Label>
                    <Textarea
                      id="description"
                      value={formData.caseDescription}
                      onChange={(e) => updateField("caseDescription", e.target.value)}
                      placeholder={t.step3.descriptionPh}
                      rows={5}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">{t.step3.descriptionHelp}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="previousAttorney">{t.step3.previousAttorney}</Label>
                      <Input id="previousAttorney" value={formData.previousAttorney} onChange={(e) => updateField("previousAttorney", e.target.value)} placeholder={t.step3.previousAttorneyPh} className="mt-1" />
                    </div>
                    <DateInputField
                      value={formData.courtDateDisplay}
                      onChange={(iso) => updateField("courtDate", iso)}
                      onValueChange={(display) => updateField("courtDateDisplay", display)}
                      placeholder={t.step3.courtDatePh}
                      label={t.step3.courtDate}
                      id="courtDate"
                    />
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-3">
                    <Label className="text-base">{t.step3.contactMethod}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {contactMethodOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateField("preferredContactMethod", opt.id)}
                          className={cn(
                            "p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all",
                            formData.preferredContactMethod === opt.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          )}
                        >
                          <opt.icon className={cn("w-5 h-5", formData.preferredContactMethod === opt.id ? "text-blue-600" : "text-slate-400")} />
                          <span className="text-xs font-medium">
                            {t.contactMethods[opt.id as keyof typeof t.contactMethods]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Preference */}
                  <div className="space-y-3">
                    <Label>{t.step3.contactTime}</Label>
                    <div className="flex flex-wrap gap-2">
                      {(["morning", "afternoon", "evening", "flexible"] as const).map((time) => {
                        const timeKey = `time${time.charAt(0).toUpperCase() + time.slice(1)}` as keyof typeof t.step3
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => updateField("preferredConsultationTime", time)}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                              formData.preferredConsultationTime === time
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 hover:border-blue-300 text-slate-600"
                            )}
                          >
                            {t.step3[timeKey]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* =============== STEP 4: REVIEW & SUBMIT =============== */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t.step4.heading}</h2>
                  </div>

                  {/* Personal Info Summary */}
                  <Card className="p-4 bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase">{t.step4.personalInfo}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p><span className="text-slate-500">{t.step1.firstName}:</span> <span className="font-medium">{formData.firstName}</span></p>
                      <p><span className="text-slate-500">{t.step1.lastName}:</span> <span className="font-medium">{formData.lastName}</span></p>
                      <p><span className="text-slate-500">{t.step1.email}:</span> <span className="font-medium">{formData.email}</span></p>
                      <p><span className="text-slate-500">{t.step1.phone}:</span> <span className="font-medium">{formData.phone}</span></p>
                      <p><span className="text-slate-500">{t.step1.nationality}:</span> <span className="font-medium">{effectiveNationality}</span></p>
                      <p><span className="text-slate-500">{t.step1.location}:</span> <span className="font-medium">{formData.currentLocation}</span></p>
                    </div>
                  </Card>

                  {/* Case Summary */}
                  <Card className="p-4 bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase">{t.step4.caseDetails}</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-500">{t.step2.caseType.replace("?", "")}:</span> <span className="font-medium">{t.caseTypes[formData.caseType as keyof typeof t.caseTypes] || formData.caseType}</span></p>
                      <p><span className="text-slate-500">{t.step2.urgency.replace("?", "")}:</span> <span className="font-medium capitalize">{formData.urgency}</span></p>
                    </div>
                  </Card>

                  {/* Description Summary */}
                  <Card className="p-4 bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase">{t.step4.yourStory}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{formData.caseDescription}</p>
                    {formData.previousAttorney && (
                      <p className="text-sm"><span className="text-slate-500">{t.step3.previousAttorney}:</span> <span className="font-medium">{formData.previousAttorney}</span></p>
                    )}
                    {formData.courtDateDisplay && (
                      <p className="text-sm"><span className="text-slate-500">{t.step3.courtDate}:</span> <span className="font-medium">{formData.courtDateDisplay}</span></p>
                    )}
                  </Card>

                  {/* Preferences Summary */}
                  <Card className="p-4 bg-slate-50 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-500 uppercase">{t.step4.preferences}</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-500">{t.step4.contact}:</span> <span className="font-medium">{t.contactMethods[formData.preferredContactMethod as keyof typeof t.contactMethods]}</span></p>
                      {formData.preferredConsultationTime && (
                        <p><span className="text-slate-500">{t.step4.time}:</span> <span className="font-medium capitalize">{formData.preferredConsultationTime}</span></p>
                      )}
                    </div>
                  </Card>

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => updateField("agreeToTerms", checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                      {t.step4.terms}
                    </label>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">{submitError}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {t.nav.back}
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {t.nav.next} <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" /> {isSubmitting ? t.step4.submitting : t.step4.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
