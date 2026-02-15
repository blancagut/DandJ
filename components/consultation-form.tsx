"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  Upload, X, FileText, CheckCircle2, Phone, Mail, MapPin, Clock,
  Globe, FileCheck, Scale, Shield, Users, Briefcase, Heart,
  AlertCircle, Calendar, TrendingUp, Check, Building2,
  GraduationCap, DollarSign, Home, Baby, UserPlus, Gavel,
  HandHelping, TreePine, Utensils, HardHat, Warehouse, Factory,
  Wrench, Hotel, Fish, Leaf, ArrowLeft
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    // Header
    caseEvaluation: "Case Evaluation",
    freeConsultation: "Free Consultation Request",
    headerSubtitle: "Tell us about your case and we will help you find the best solution. All information is confidential.",
    
    // Case Types Section
    whatHelpNeeded: "What do you need help with?",
    selectCaseType: "Select the type of case that best describes your situation",
    
    // Case Types
    h2bWorkVisa: "Work Visa",
    h2bWorkVisaDesc: "Employment-based work visa screening",
    familyPetitions: "Family Petitions",
    familyPetitionsDesc: "Reunite with your loved ones",
    greenCard: "Green Card",
    greenCardDesc: "Permanent residence applications",
    citizenship: "Citizenship",
    citizenshipDesc: "Naturalization process",
    deportationDefense: "Deportation Defense",
    deportationDefenseDesc: "Protection from removal",
    asylum: "Asylum",
    asylumDesc: "Protection for those fleeing persecution",
    criminalDefense: "Criminal Defense",
    criminalDefenseDesc: "Defense against criminal charges",
    businessImmigration: "Business Immigration",
    businessImmigrationDesc: "Investor & business visas",
    
    // Sub-options titles
    selectIndustry: "Select Industry",
    petitionType: "Petition Type",
    greenCardCategory: "Green Card Category",
    visaType: "Visa Type",
    
    // H2B Industries
    agriculture: "Agriculture",
    landscaping: "Landscaping",
    construction: "Construction",
    hospitality: "Hospitality",
    foodProcessing: "Food Processing",
    seafood: "Seafood Processing",
    warehouse: "Warehouse",
    manufacturing: "Manufacturing",
    maintenance: "Maintenance",
    housekeeping: "Housekeeping",
    
    // Family Petition Types
    spouse: "Spouse",
    parent: "Parent",
    child: "Child",
    sibling: "Sibling",
    fiance: "Fiance(e)",
    
    // Green Card Categories
    familyBased: "Family-Based",
    employmentBased: "Employment-Based",
    diversityLottery: "Diversity Lottery",
    vawa: "VAWA",
    specialImmigrant: "Special Immigrant",
    
    // Visa Types
    studentF1: "Student (F-1)",
    workH1b: "Work (H-1B)",
    investorE2: "Investor (E-2)",
    intracompanyL1: "Intracompany (L-1)",
    religiousR1: "Religious (R-1)",
    extraordinaryO1: "Extraordinary (O-1)",
    
    // Urgency Section
    howUrgent: "How urgent is your case?",
    immediate: "Immediate",
    immediateDesc: "Within 24 hours",
    urgent: "Urgent",
    urgentDesc: "Within 1 week",
    normal: "Normal",
    normalDesc: "Within 2 weeks",
    planning: "Planning",
    planningDesc: "No rush",
    
    // Personal Information Section
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    dateOfBirth: "Date of Birth",
    nationality: "Nationality",
    currentLocation: "Current Location",
    locationPlaceholder: "City, State, Country",
    enterNationality: "Enter your nationality",
    other: "Other",
    
    // Case Details Section
    caseDetails: "Case Details",
    describeYourSituation: "Describe Your Situation",
    situationPlaceholder: "Please provide details about your case, including relevant dates, circumstances, and what outcome you are hoping for...",
    beDetailed: "Be as detailed as possible to help us understand your situation.",
    previousAttorney: "Previous Attorney (if any)",
    attorneyPlaceholder: "Attorney name or firm",
    upcomingCourtDate: "Upcoming Court Date",
    
    // Documents Section
    documents: "Documents",
    documentsSubtitle: "Select which documents you have available and upload them if possible",
    availableDocuments: "Available Documents",
    passport: "Passport",
    currentVisa: "Current Visa",
    i94: "I-94",
    birthCertificate: "Birth Certificate",
    marriageCertificate: "Marriage Certificate",
    policeRecord: "Police Record",
    employmentLetter: "Employment Letter",
    taxReturns: "Tax Returns",
    courtDocuments: "Court Documents",
    medicalRecords: "Medical Records",
    clickToUpload: "Click to upload files",
    fileTypes: "PDF, JPG, PNG, DOC (Max 10MB)",
    uploadedFiles: "Uploaded Files",
    
    // Contact Preferences Section
    contactPreferences: "Contact Preferences",
    preferredContactMethod: "Preferred Contact Method",
    phoneCall: "Phone Call",
    emailMethod: "Email",
    videoCall: "Video Call",
    inPerson: "In-Person",
    preferredTime: "Preferred Time",
    morning: "Morning",
    morningTime: "8 AM - 12 PM",
    afternoon: "Afternoon",
    afternoonTime: "12 PM - 5 PM",
    evening: "Evening",
    eveningTime: "5 PM - 7 PM",
    weekend: "Weekend",
    weekendTime: "Sat/Sun",
    
    // Terms & Submit
    agreeToTerms: "I agree to the terms and conditions",
    termsDescription: "Your information is protected by attorney-client privilege. We will only use it to evaluate and respond to your consultation request.",
    submitting: "Submitting...",
    submitButton: "Submit Consultation Request",
    
    // Success Screen
    successTitle: "Consultation Request Submitted!",
    successMessage: "Thank you for choosing Diaz & Johnson. Our attorneys will review your case and contact you within 24 hours.",
    returnHome: "Return to Home",
    
    // Navigation
    backToHome: "Back to Home",
    
    // Sidebar
    whatHappensNext: "What Happens Next?",
    step1Title: "Case Review",
    step1Desc: "Our attorneys review your information within 24 hours.",
    step2Title: "Initial Contact",
    step2Desc: "We will reach out to schedule your consultation.",
    step3Title: "Consultation",
    step3Desc: "Meet with an attorney to discuss your case in detail.",
    step4Title: "Action Plan",
    step4Desc: "Receive a clear strategy and next steps.",
    
    needImmediateHelp: "Need Immediate Help?",
    callUsNow: "Call us now",
    emailUs: "Email us",
    officeHours: "Office Hours",
    officeHoursValue: "Mon-Fri: 8 AM - 6 PM",
    location: "Location",
    emergencyLine: "24/7 Emergency Line for Urgent Cases",
    
    confidential: "100% Confidential",
    confidentialDesc: "Your information is protected by attorney-client privilege and encrypted using industry-standard security.",
    
    // Errors
    errorSubmit: "Error submitting. Please try again.",
    errorConnection: "Connection error. Please try again.",
  },
  es: {
    // Header
    caseEvaluation: "Evaluación de Caso",
    freeConsultation: "Solicitud de Consulta Gratuita",
    headerSubtitle: "Cuéntenos sobre su caso y le ayudaremos a encontrar la mejor solución. Toda la información es confidencial.",
    
    // Case Types Section
    whatHelpNeeded: "¿En qué necesita ayuda?",
    selectCaseType: "Seleccione el tipo de caso que mejor describe su situación",
    
    // Case Types
    h2bWorkVisa: "Visa de Trabajo",
    h2bWorkVisaDesc: "Evaluación de visa de trabajo basada en empleo",
    familyPetitions: "Peticiones Familiares",
    familyPetitionsDesc: "Reúnase con sus seres queridos",
    greenCard: "Residencia Permanente",
    greenCardDesc: "Solicitudes de Green Card",
    citizenship: "Ciudadanía",
    citizenshipDesc: "Proceso de naturalización",
    deportationDefense: "Defensa de Deportación",
    deportationDefenseDesc: "Protección contra la remoción",
    asylum: "Asilo",
    asylumDesc: "Protección para quienes huyen de persecución",
    criminalDefense: "Defensa Criminal",
    criminalDefenseDesc: "Defensa contra cargos criminales",
    businessImmigration: "Inmigración de Negocios",
    businessImmigrationDesc: "Visas de inversionista y negocios",
    
    // Sub-options titles
    selectIndustry: "Seleccione Industria",
    petitionType: "Tipo de Petición",
    greenCardCategory: "Categoría de Green Card",
    visaType: "Tipo de Visa",
    
    // H2B Industries
    agriculture: "Agricultura",
    landscaping: "Jardinería",
    construction: "Construcción",
    hospitality: "Hospitalidad",
    foodProcessing: "Procesamiento de Alimentos",
    seafood: "Procesamiento de Mariscos",
    warehouse: "Almacén",
    manufacturing: "Manufactura",
    maintenance: "Mantenimiento",
    housekeeping: "Limpieza",
    
    // Family Petition Types
    spouse: "Cónyuge",
    parent: "Padre/Madre",
    child: "Hijo(a)",
    sibling: "Hermano(a)",
    fiance: "Prometido(a)",
    
    // Green Card Categories
    familyBased: "Basada en Familia",
    employmentBased: "Basada en Empleo",
    diversityLottery: "Lotería de Diversidad",
    vawa: "VAWA",
    specialImmigrant: "Inmigrante Especial",
    
    // Visa Types
    studentF1: "Estudiante (F-1)",
    workH1b: "Trabajo (H-1B)",
    investorE2: "Inversionista (E-2)",
    intracompanyL1: "Intracompañía (L-1)",
    religiousR1: "Religioso (R-1)",
    extraordinaryO1: "Habilidad Extraordinaria (O-1)",
    
    // Urgency Section
    howUrgent: "¿Qué tan urgente es su caso?",
    immediate: "Inmediato",
    immediateDesc: "Dentro de 24 horas",
    urgent: "Urgente",
    urgentDesc: "Dentro de 1 semana",
    normal: "Normal",
    normalDesc: "Dentro de 2 semanas",
    planning: "Planificación",
    planningDesc: "Sin prisa",
    
    // Personal Information Section
    personalInfo: "Información Personal",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    phone: "Número de Teléfono",
    dateOfBirth: "Fecha de Nacimiento",
    nationality: "Nacionalidad",
    currentLocation: "Ubicación Actual",
    locationPlaceholder: "Ciudad, Estado, País",
    enterNationality: "Ingrese su nacionalidad",
    other: "Otro",
    
    // Case Details Section
    caseDetails: "Detalles del Caso",
    describeYourSituation: "Describa Su Situación",
    situationPlaceholder: "Por favor proporcione detalles sobre su caso, incluyendo fechas relevantes, circunstancias y qué resultado espera obtener...",
    beDetailed: "Sea lo más detallado posible para ayudarnos a entender su situación.",
    previousAttorney: "Abogado Anterior (si tiene)",
    attorneyPlaceholder: "Nombre del abogado o firma",
    upcomingCourtDate: "Fecha de Corte Próxima",
    
    // Documents Section
    documents: "Documentos",
    documentsSubtitle: "Seleccione qué documentos tiene disponibles y súbalos si es posible",
    availableDocuments: "Documentos Disponibles",
    passport: "Pasaporte",
    currentVisa: "Visa Actual",
    i94: "I-94",
    birthCertificate: "Acta de Nacimiento",
    marriageCertificate: "Acta de Matrimonio",
    policeRecord: "Antecedentes Policiales",
    employmentLetter: "Carta de Empleo",
    taxReturns: "Declaraciones de Impuestos",
    courtDocuments: "Documentos de Corte",
    medicalRecords: "Registros Médicos",
    clickToUpload: "Clic para subir archivos",
    fileTypes: "PDF, JPG, PNG, DOC (Máx 10MB)",
    uploadedFiles: "Archivos Subidos",
    
    // Contact Preferences Section
    contactPreferences: "Preferencias de Contacto",
    preferredContactMethod: "Método de Contacto Preferido",
    phoneCall: "Llamada Telefónica",
    emailMethod: "Correo Electrónico",
    videoCall: "Videollamada",
    inPerson: "En Persona",
    preferredTime: "Horario Preferido",
    morning: "Mañana",
    morningTime: "8 AM - 12 PM",
    afternoon: "Tarde",
    afternoonTime: "12 PM - 5 PM",
    evening: "Noche",
    eveningTime: "5 PM - 7 PM",
    weekend: "Fin de Semana",
    weekendTime: "Sáb/Dom",
    
    // Terms & Submit
    agreeToTerms: "Acepto los términos y condiciones",
    termsDescription: "Su información está protegida por el privilegio abogado-cliente. Solo la usaremos para evaluar y responder a su solicitud de consulta.",
    submitting: "Enviando...",
    submitButton: "Enviar Solicitud de Consulta",
    
    // Success Screen
    successTitle: "¡Solicitud de Consulta Enviada!",
    successMessage: "Gracias por elegir Diaz & Johnson. Nuestros abogados revisarán su caso y lo contactarán dentro de 24 horas.",
    returnHome: "Volver al Inicio",
    
    // Navigation
    backToHome: "Volver al Inicio",
    
    // Sidebar
    whatHappensNext: "¿Qué Sigue?",
    step1Title: "Revisión del Caso",
    step1Desc: "Nuestros abogados revisan su información dentro de 24 horas.",
    step2Title: "Contacto Inicial",
    step2Desc: "Nos comunicaremos para programar su consulta.",
    step3Title: "Consulta",
    step3Desc: "Reúnase con un abogado para discutir su caso en detalle.",
    step4Title: "Plan de Acción",
    step4Desc: "Reciba una estrategia clara y próximos pasos.",
    
    needImmediateHelp: "¿Necesita Ayuda Inmediata?",
    callUsNow: "Llámenos ahora",
    emailUs: "Envíenos un correo",
    officeHours: "Horario de Oficina",
    officeHoursValue: "Lun-Vie: 8 AM - 6 PM",
    location: "Ubicación",
    emergencyLine: "Línea de Emergencia 24/7 para Casos Urgentes",
    
    confidential: "100% Confidencial",
    confidentialDesc: "Su información está protegida por el privilegio abogado-cliente y encriptada usando seguridad de nivel industrial.",
    
    // Errors
    errorSubmit: "Error al enviar. Por favor intente de nuevo.",
    errorConnection: "Error de conexión. Por favor intente de nuevo.",
  },
}

// ============================================
// CASE TYPES CONFIG
// ============================================
const caseTypes = [
  {
    id: "h2b-work-visa",
    icon: Briefcase,
    titleKey: "h2bWorkVisa",
    descKey: "h2bWorkVisaDesc",
    color: "bg-blue-500",
  },
  {
    id: "family-petition",
    icon: Heart,
    titleKey: "familyPetitions",
    descKey: "familyPetitionsDesc",
    color: "bg-pink-500",
  },
  {
    id: "immigration-greencard",
    icon: FileCheck,
    titleKey: "greenCard",
    descKey: "greenCardDesc",
    color: "bg-green-500",
  },
  {
    id: "immigration-citizenship",
    icon: Globe,
    titleKey: "citizenship",
    descKey: "citizenshipDesc",
    color: "bg-purple-500",
  },
  {
    id: "immigration-deportation",
    icon: Shield,
    titleKey: "deportationDefense",
    descKey: "deportationDefenseDesc",
    color: "bg-red-500",
  },
  {
    id: "immigration-asylum",
    icon: Home,
    titleKey: "asylum",
    descKey: "asylumDesc",
    color: "bg-amber-500",
  },
  {
    id: "criminal-defense",
    icon: Gavel,
    titleKey: "criminalDefense",
    descKey: "criminalDefenseDesc",
    color: "bg-slate-600",
  },
  {
    id: "business-immigration",
    icon: Building2,
    titleKey: "businessImmigration",
    descKey: "businessImmigrationDesc",
    color: "bg-indigo-500",
  },
]

// ============================================
// SUB-OPTIONS CONFIG
// ============================================

// H2B Industries
const h2bIndustries = [
  { id: "agriculture", labelKey: "agriculture", icon: Leaf },
  { id: "landscaping", labelKey: "landscaping", icon: TreePine },
  { id: "construction", labelKey: "construction", icon: HardHat },
  { id: "hospitality", labelKey: "hospitality", icon: Hotel },
  { id: "food-processing", labelKey: "foodProcessing", icon: Utensils },
  { id: "seafood", labelKey: "seafood", icon: Fish },
  { id: "warehouse", labelKey: "warehouse", icon: Warehouse },
  { id: "manufacturing", labelKey: "manufacturing", icon: Factory },
  { id: "maintenance", labelKey: "maintenance", icon: Wrench },
  { id: "housekeeping", labelKey: "housekeeping", icon: Home },
]

// Family Petition Types
const familyPetitionTypes = [
  { id: "spouse", labelKey: "spouse", icon: Heart },
  { id: "parent", labelKey: "parent", icon: Users },
  { id: "child", labelKey: "child", icon: Baby },
  { id: "sibling", labelKey: "sibling", icon: UserPlus },
  { id: "fiance", labelKey: "fiance", icon: Heart },
]

// Green Card Categories
const greenCardCategories = [
  { id: "family-based", labelKey: "familyBased", icon: Heart },
  { id: "employment-based", labelKey: "employmentBased", icon: Briefcase },
  { id: "diversity-lottery", labelKey: "diversityLottery", icon: Globe },
  { id: "vawa", labelKey: "vawa", icon: Shield },
  { id: "special-immigrant", labelKey: "specialImmigrant", icon: FileCheck },
]

// Visa Types (excluding tourist)
const visaTypes = [
  { id: "student-f1", labelKey: "studentF1", icon: GraduationCap },
  { id: "work-h1b", labelKey: "workH1b", icon: Briefcase },
  { id: "investor-e2", labelKey: "investorE2", icon: DollarSign },
  { id: "intracompany-l1", labelKey: "intracompanyL1", icon: Building2 },
  { id: "religious-r1", labelKey: "religiousR1", icon: HandHelping },
  { id: "extraordinary-o1", labelKey: "extraordinaryO1", icon: TrendingUp },
]

// Urgency Levels
const urgencyLevels = [
  { id: "immediate", labelKey: "immediate", sublabelKey: "immediateDesc", icon: AlertCircle, color: "bg-red-500 border-red-500" },
  { id: "urgent", labelKey: "urgent", sublabelKey: "urgentDesc", icon: Clock, color: "bg-orange-500 border-orange-500" },
  { id: "normal", labelKey: "normal", sublabelKey: "normalDesc", icon: Calendar, color: "bg-blue-500 border-blue-500" },
  { id: "planning", labelKey: "planning", sublabelKey: "planningDesc", icon: TrendingUp, color: "bg-gray-500 border-gray-500" },
]

// Nationalities (common for immigration)
const nationalities = [
  { id: "mexican", label: "Mexico" },
  { id: "ecuadorian", label: "Ecuador" },
  { id: "brazilian", label: "Brazil" },
  { id: "chilean", label: "Chile" },
  { id: "argentinian", label: "Argentina" },
  { id: "bolivian", label: "Bolivia" },
  { id: "peruvian", label: "Peru" },
  { id: "paraguayan", label: "Paraguay" },
  { id: "spanish", label: "Spain" },
  { id: "other", labelKey: "other" },
]

// Document Types
const documentTypes = [
  { id: "passport", labelKey: "passport", required: true },
  { id: "visa", labelKey: "currentVisa", required: false },
  { id: "i94", labelKey: "i94", required: false },
  { id: "birth-certificate", labelKey: "birthCertificate", required: false },
  { id: "marriage-certificate", labelKey: "marriageCertificate", required: false },
  { id: "police-record", labelKey: "policeRecord", required: false },
  { id: "employment-letter", labelKey: "employmentLetter", required: false },
  { id: "tax-returns", labelKey: "taxReturns", required: false },
  { id: "court-documents", labelKey: "courtDocuments", required: false },
  { id: "medical-records", labelKey: "medicalRecords", required: false },
]

// Contact Methods
const contactMethods = [
  { id: "phone", labelKey: "phoneCall", icon: Phone },
  { id: "email", labelKey: "emailMethod", icon: Mail },
  { id: "video", labelKey: "videoCall", icon: Globe },
  { id: "in-person", labelKey: "inPerson", icon: MapPin },
]

// Consultation Times
const consultationTimes = [
  { id: "morning", labelKey: "morning", sublabelKey: "morningTime" },
  { id: "afternoon", labelKey: "afternoon", sublabelKey: "afternoonTime" },
  { id: "evening", labelKey: "evening", sublabelKey: "eveningTime" },
  { id: "weekend", labelKey: "weekend", sublabelKey: "weekendTime" },
]

// ============================================
// FORM SCHEMA
// ============================================
const consultationFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(2, "Please select your nationality"),
  currentLocation: z.string().min(2, "Please enter your current location"),
  caseType: z.string().min(1, "Please select a case type"),
  caseSubType: z.string().optional(),
  urgency: z.string().min(1, "Please select urgency level"),
  caseDescription: z.string().min(20, "Please provide at least 20 characters describing your case"),
  previousAttorney: z.string().optional(),
  courtDate: z.string().optional(),
  preferredContactMethod: z.string().min(1, "Please select a preferred contact method"),
  preferredConsultationTime: z.string().optional(),
  referralSource: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

type ConsultationFormValues = z.infer<typeof consultationFormSchema>

// ============================================
// COMPONENT
// ============================================
export function ConsultationForm() {
  const { language } = useLanguage()
  const t = language === "en" ? translations.en : translations.es
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState("")
  const [showOtherNationality, setShowOtherNationality] = useState(false)

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      currentLocation: "",
      caseType: "",
      caseSubType: "",
      urgency: "",
      caseDescription: "",
      previousAttorney: "",
      courtDate: "",
      preferredContactMethod: "",
      preferredConsultationTime: "",
      referralSource: "",
      agreeToTerms: false,
    },
  })

  const selectedCaseType = form.watch("caseType")

  // Get sub-options based on selected case type
  const getSubOptions = () => {
    switch (selectedCaseType) {
      case "h2b-work-visa":
        return { titleKey: "selectIndustry", options: h2bIndustries }
      case "family-petition":
        return { titleKey: "petitionType", options: familyPetitionTypes }
      case "immigration-greencard":
        return { titleKey: "greenCardCategory", options: greenCardCategories }
      case "business-immigration":
        return { titleKey: "visaType", options: visaTypes }
      default:
        return null
    }
  }

  const subOptions = getSubOptions()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      const maxSize = 10 * 1024 * 1024

      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type.`)
        return false
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`)
        return false
      }

      return true
    })

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleDocType = (docId: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    )
  }

  const onSubmit = async (data: ConsultationFormValues) => {
    if (honeypot) {
      setSubmitSuccess(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase
      const { error } = await supabase
        .from("consultation_requests")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          date_of_birth: data.dateOfBirth || null,
          nationality: data.nationality,
          current_location: data.currentLocation,
          case_type: data.caseType,
          case_sub_type: data.caseSubType || null,
          urgency: data.urgency,
          case_description: data.caseDescription,
          previous_attorney: data.previousAttorney || null,
          court_date: data.courtDate || null,
          preferred_contact_method: data.preferredContactMethod,
          preferred_consultation_time: data.preferredConsultationTime || null,
          referral_source: data.referralSource || null,
          document_types: selectedDocTypes,
          files: uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          language: language,
          status: "new",
        })

      if (error) {
        console.error("Supabase insert error:", error)
        setSubmitError(t.errorSubmit)
        return
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        form.reset()
        setUploadedFiles([])
        setSelectedDocTypes([])
        setSubmitSuccess(false)
      }, 5000)
    } catch (err) {
      console.error("Submit error:", err)
      setSubmitError(t.errorConnection)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Screen
  if (submitSuccess) {
    return (
      <section className="py-20 md:py-28 bg-background min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="bg-card rounded-xl p-8 md:p-12 shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </motion.div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t.successTitle}
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {t.successMessage}
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t.returnHome}
            </Button>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t.caseEvaluation}</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t.freeConsultation}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.headerSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 bg-card">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {submitError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {submitError}
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* SECTION 1: CASE TYPE SELECTION */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2 pb-2 border-b flex items-center gap-2">
                      <Scale className="h-5 w-5 text-accent" />
                      {t.whatHelpNeeded}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.selectCaseType}</p>
                    
                    <FormField
                      control={form.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {caseTypes.map((caseType) => {
                                const Icon = caseType.icon
                                const isSelected = field.value === caseType.id
                                return (
                                  <motion.button
                                    key={caseType.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      field.onChange(caseType.id)
                                      form.setValue("caseSubType", "")
                                    }}
                                    className={cn(
                                      "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                                      isSelected
                                        ? "border-accent bg-accent/10 shadow-md"
                                        : "border-border hover:border-accent/50 bg-card"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                                      isSelected ? caseType.color : "bg-muted"
                                    )}>
                                      <Icon className={cn("h-5 w-5", isSelected ? "text-white" : "text-muted-foreground")} />
                                    </div>
                                    <h4 className={cn(
                                      "font-semibold text-sm",
                                      isSelected ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                      {t[caseType.titleKey as keyof typeof t]}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {t[caseType.descKey as keyof typeof t]}
                                    </p>
                                    {isSelected && (
                                      <div className="absolute top-2 right-2">
                                        <Check className="h-4 w-4 text-accent" />
                                      </div>
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sub-options based on case type */}
                    <AnimatePresence>
                      {subOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <Label className="text-sm font-medium mb-3 block">{t[subOptions.titleKey as keyof typeof t]}</Label>
                          <FormField
                            control={form.control}
                            name="caseSubType"
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex flex-wrap gap-2">
                                  {subOptions.options.map((option) => {
                                    const Icon = option.icon
                                    const isSelected = field.value === option.id
                                    return (
                                      <motion.button
                                        key={option.id}
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => field.onChange(isSelected ? "" : option.id)}
                                        className={cn(
                                          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                          isSelected
                                            ? "bg-accent text-accent-foreground shadow-md"
                                            : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                                        )}
                                      >
                                        <Icon className="h-4 w-4" />
                                        {t[option.labelKey as keyof typeof t]}
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </FormControl>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 2: URGENCY LEVEL */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2 pb-2 border-b flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      {t.howUrgent}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                              {urgencyLevels.map((level) => {
                                const Icon = level.icon
                                const isSelected = field.value === level.id
                                return (
                                  <motion.button
                                    key={level.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => field.onChange(level.id)}
                                    className={cn(
                                      "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                                      isSelected
                                        ? `${level.color} text-white shadow-md`
                                        : "border-border bg-card hover:border-accent/50"
                                    )}
                                  >
                                    <Icon className={cn("h-6 w-6 mx-auto mb-2", isSelected ? "text-white" : "text-muted-foreground")} />
                                    <h4 className={cn("font-semibold text-sm", isSelected ? "text-white" : "text-foreground")}>
                                      {t[level.labelKey as keyof typeof t]}
                                    </h4>
                                    <p className={cn("text-xs mt-1", isSelected ? "text-white/80" : "text-muted-foreground")}>
                                      {t[level.sublabelKey as keyof typeof t]}
                                    </p>
                                  </motion.button>
                                )
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 3: PERSONAL INFORMATION */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      {t.personalInfo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.firstName} *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.lastName} *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.email} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.phone} *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(305) 555-1234" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.dateOfBirth}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Nationality Selector */}
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.nationality} *</FormLabel>
                            <FormControl>
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {nationalities.map((nat) => {
                                    const isSelected = field.value === nat.label
                                    const isOther = nat.id === "other"
                                    const label = nat.labelKey ? t[nat.labelKey as keyof typeof t] : nat.label
                                    return (
                                      <motion.button
                                        key={nat.id}
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          if (isOther) {
                                            setShowOtherNationality(true)
                                            field.onChange("")
                                          } else {
                                            setShowOtherNationality(false)
                                            field.onChange(nat.label)
                                          }
                                        }}
                                        className={cn(
                                          "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                          isSelected
                                            ? "bg-accent text-accent-foreground shadow-sm"
                                            : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                                        )}
                                      >
                                        {label}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                                <AnimatePresence>
                                  {showOtherNationality && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                    >
                                      <Input
                                        placeholder={t.enterNationality}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="h-11"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentLocation"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t.currentLocation} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t.locationPlaceholder} {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 4: CASE DETAILS */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      {t.caseDetails}
                    </h3>
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="caseDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.describeYourSituation} *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t.situationPlaceholder}
                                rows={6}
                                {...field}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              {t.beDetailed}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="previousAttorney"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.previousAttorney}</FormLabel>
                              <FormControl>
                                <Input placeholder={t.attorneyPlaceholder} {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="courtDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.upcomingCourtDate}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 5: DOCUMENT UPLOAD */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2 pb-2 border-b flex items-center gap-2">
                      <Upload className="h-5 w-5 text-accent" />
                      {t.documents}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t.documentsSubtitle}
                    </p>

                    {/* Document Type Pills */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-3 block">{t.availableDocuments}</Label>
                      <div className="flex flex-wrap gap-2">
                        {documentTypes.map((doc) => {
                          const isSelected = selectedDocTypes.includes(doc.id)
                          return (
                            <motion.button
                              key={doc.id}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleDocType(doc.id)}
                              className={cn(
                                "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
                                isSelected
                                  ? "bg-green-500 text-white shadow-sm"
                                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {t[doc.labelKey as keyof typeof t]}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* File Upload Zone */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-foreground font-medium mb-1">{t.clickToUpload}</p>
                        <p className="text-sm text-muted-foreground">{t.fileTypes}</p>
                      </label>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label>{t.uploadedFiles} ({uploadedFiles.length})</Label>
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-muted rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-accent" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 6: CONTACT PREFERENCES */}
                  {/* ============================================ */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b flex items-center gap-2">
                      <Phone className="h-5 w-5 text-accent" />
                      {t.contactPreferences}
                    </h3>

                    {/* Contact Method */}
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.preferredContactMethod} *</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {contactMethods.map((method) => {
                                  const Icon = method.icon
                                  const isSelected = field.value === method.id
                                  return (
                                    <motion.button
                                      key={method.id}
                                      type="button"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => field.onChange(method.id)}
                                      className={cn(
                                        "p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                                        isSelected
                                          ? "border-accent bg-accent/10 shadow-sm"
                                          : "border-border hover:border-accent/50"
                                      )}
                                    >
                                      <Icon className={cn("h-5 w-5", isSelected ? "text-accent" : "text-muted-foreground")} />
                                      <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                        {t[method.labelKey as keyof typeof t]}
                                      </span>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Consultation Time */}
                    <FormField
                      control={form.control}
                      name="preferredConsultationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.preferredTime}</FormLabel>
                          <FormControl>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {consultationTimes.map((time) => {
                                const isSelected = field.value === time.id
                                return (
                                  <motion.button
                                    key={time.id}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => field.onChange(isSelected ? "" : time.id)}
                                    className={cn(
                                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                      isSelected
                                        ? "bg-accent text-accent-foreground shadow-md"
                                        : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                                    )}
                                  >
                                    {t[time.labelKey as keyof typeof t]}
                                    <span className="text-xs opacity-70 ml-1">({t[time.sublabelKey as keyof typeof t]})</span>
                                  </motion.button>
                                )
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ============================================ */}
                  {/* SECTION 7: TERMS & SUBMIT */}
                  {/* ============================================ */}
                  <div>
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t.agreeToTerms} *</FormLabel>
                            <FormDescription>
                              {t.termsDescription}
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Clock className="h-5 w-5 animate-spin" />
                        {t.submitting}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        {t.submitButton}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">{t.whatHappensNext}</h3>
              <div className="space-y-4">
                {[
                  { step: 1, titleKey: "step1Title", descKey: "step1Desc" },
                  { step: 2, titleKey: "step2Title", descKey: "step2Desc" },
                  { step: 3, titleKey: "step3Title", descKey: "step3Desc" },
                  { step: 4, titleKey: "step4Title", descKey: "step4Desc" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{t[item.titleKey as keyof typeof t]}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{t[item.descKey as keyof typeof t]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-primary text-primary-foreground">
              <h3 className="font-serif text-xl font-bold mb-4">{t.needImmediateHelp}</h3>
              <div className="space-y-4">
                <a href="tel:+13057280029" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">{t.callUsNow}</p>
                    <p className="font-semibold">305-728-0029</p>
                  </div>
                </a>

                <a href="mailto:info@diazjohnsonlaw.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">{t.emailUs}</p>
                    <p className="font-semibold">info@diazjohnsonlaw.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">{t.officeHours}</p>
                    <p className="font-semibold">{t.officeHoursValue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">{t.location}</p>
                    <p className="font-semibold">1680 Michigan Ave, Miami Beach</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                <p className="text-sm opacity-90 text-center">{t.emergencyLine}</p>
              </div>
            </Card>

            <Card className="p-6 bg-muted">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">{t.confidential}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.confidentialDesc}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
