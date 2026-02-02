"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import {
  User,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  X,
  File,
  Shield,
  Clock,
  Users,
  Sparkles,
  TrendingUp,
  Info,
  Check,
  AlertCircle,
  Save,
  MessageCircle,
  Mic,
  MicOff,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useLanguage } from "@/lib/language-context"
import { postJson } from "@/lib/api/client"
import Link from "next/link"

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

interface FormData {
  // Step 1: Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  currentCountry: string

  // Step 2: Employment Info
  employerName: string
  employerAddress: string
  jobTitle: string
  jobDescription: string
  startDate: string
  endDate: string
  workersNeeded: string

  // Step 3: Experience & Skills
  yearsExperience: string
  skills: string[]
  previousH2B: string
  englishLevel: string

  // Step 4: Documents
  documents: File[]

  // Step 5: Additional Info
  additionalInfo: string
  howDidYouHear: string
  preferredContact: string
  urgency: string
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  currentCountry: "",
  employerName: "",
  employerAddress: "",
  jobTitle: "",
  jobDescription: "",
  startDate: "",
  endDate: "",
  workersNeeded: "1",
  yearsExperience: "",
  skills: [],
  previousH2B: "",
  englishLevel: "",
  documents: [],
  additionalInfo: "",
  howDidYouHear: "",
  preferredContact: "email",
  urgency: "normal",
}

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Tell us about yourself", time: "1 min" },
  { id: 2, title: "Employment", icon: Briefcase, description: "Job details", time: "2 mins" },
  { id: 3, title: "Experience", icon: FileText, description: "Your background", time: "1 min" },
  { id: 4, title: "Documents", icon: Upload, description: "Upload files", time: "30 sec" },
  { id: 5, title: "Review", icon: CheckCircle2, description: "Submit application", time: "30 sec" },
]

const skillOptions = [
  "Agriculture",
  "Landscaping",
  "Construction",
  "Hospitality",
  "Food Processing",
  "Forestry",
  "Seafood Processing",
  "Housekeeping",
  "Maintenance",
  "Warehouse",
  "Manufacturing",
  "Other",
]

const englishLevels = [
  { value: "none", label: "No English" },
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "fluent", label: "Fluent" },
]

const jobTitleSuggestions = [
  "Landscaper",
  "Cook",
  "Housekeeper",
  "Construction Worker",
  "Food Processing Worker",
  "Agricultural Worker",
  "Hotel Staff",
  "Maintenance Worker",
  "Warehouse Worker",
]

const STEP_FIELDS: Record<number, string[]> = {
  1: ["firstName", "lastName", "email", "phone", "dateOfBirth", "nationality", "currentCountry"],
  2: ["employerName", "employerAddress", "jobTitle", "jobDescription", "startDate", "endDate", "workersNeeded"],
  3: ["yearsExperience", "skills", "previousH2B", "englishLevel"],
  4: ["documents"],
  5: [],
}

const FIELD_TO_STEP: Record<string, number> = Object.fromEntries(
  Object.entries(STEP_FIELDS).flatMap(([step, fields]) => fields.map((field) => [field, Number(step)])),
)

export function H2BWizard() {
  const { language } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [honeypot, setHoneypot] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})
  const [validationMessages, setValidationMessages] = useState<{ [key: string]: string }>({})
  const [showAutoSave, setShowAutoSave] = useState(false)
  const [eligibilityScore, setEligibilityScore] = useState(0)
  const [showJobSuggestions, setShowJobSuggestions] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("h2b-wizard-data", JSON.stringify(formData))
      setShowAutoSave(true)
      setTimeout(() => setShowAutoSave(false), 2000)
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData])

  useEffect(() => {
    let score = 0
    if (formData.firstName && formData.lastName && formData.email) score += 20
    if (formData.employerName && formData.jobTitle) score += 20
    if (formData.yearsExperience && formData.skills.length > 0) score += 20
    if (formData.englishLevel) score += 15
    if (formData.documents.length > 0) score += 25
    setEligibilityScore(score)
  }, [formData])

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (
        window as unknown as {
          webkitSpeechRecognition?: SpeechRecognitionConstructor
          SpeechRecognition?: SpeechRecognitionConstructor
        }
      ).webkitSpeechRecognition ??
        (
          window as unknown as {
            webkitSpeechRecognition?: SpeechRecognitionConstructor
            SpeechRecognition?: SpeechRecognitionConstructor
          }
        ).SpeechRecognition

      if (!SpeechRecognition) return

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (!transcript) return
        if (activeVoiceField) {
          updateFormData(activeVoiceField as keyof FormData, transcript)
        }
        setIsListening(false)
        setActiveVoiceField(null)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        setActiveVoiceField(null)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setActiveVoiceField(null)
      }
    }
    // updateFormData is intentionally not a dependency; we want one recognizer per active field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVoiceField])

  const validateField = (field: keyof FormData, value: string) => {
    const messages: { [key: string]: string } = {}

    if (field === "email" && value) {
      if (value.includes("@")) {
        messages.email = "Great! Email looks good ✓"
      } else {
        messages.email = "Please enter a valid email address"
      }
    }

    if (field === "phone" && value) {
      if (value.length >= 10) {
        messages.phone = "Perfect! We can reach you ✓"
      }
    }

    if (field === "firstName" && value) {
      messages.firstName = `Nice to meet you, ${value}! 👋`
    }

    if (field === "yearsExperience" && value) {
      const years = Number.parseInt(value)
      if (years >= 2) {
        messages.yearsExperience = "Excellent experience! This strengthens your case 💪"
      }
    }

    setValidationMessages((prev) => ({ ...prev, ...messages }))
  }

  const updateFormData = (field: keyof FormData, value: string | string[] | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setServerFieldErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setSubmitError(null)
    if (typeof value === "string" && value) {
      validateField(field, value)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const toggleVoiceInput = (fieldName: string) => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser")
      return
    }

    if (isListening && activeVoiceField === fieldName) {
      recognitionRef.current.stop()
      setIsListening(false)
      setActiveVoiceField(null)
    } else {
      setActiveVoiceField(fieldName)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }))
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold && currentStep < 5) {
      nextStep()
    } else if (info.offset.x > threshold && currentStep > 1) {
      prevStep()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentStep < 5) nextStep()
      if (e.key === "ArrowLeft" && currentStep > 1) prevStep()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // nextStep/prevStep are intentionally not deps; we only rebind on step change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    setServerFieldErrors({})

    try {
      const { documents, ...rest } = formData
      const payload = {
        ...rest,
        language,
        website: honeypot,
        documents: documents.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      }

      const json = await postJson<typeof payload, { received: true }>("/api/h2b", payload)
      if (!json.ok) {
        setSubmitError(json.error.message || "Unable to submit. Please try again.")

        const nextErrors = Object.fromEntries(
          Object.entries(json.error.fieldErrors ?? {}).map(([key, messages]) => [key, messages?.[0] || "Invalid"]),
        )
        setServerFieldErrors(nextErrors)

        const firstErrorField = Object.keys(nextErrors)[0]
        if (firstErrorField) {
          const targetStep = FIELD_TO_STEP[firstErrorField]
          if (targetStep && targetStep !== currentStep) {
            setDirection(targetStep > currentStep ? 1 : -1)
            setCurrentStep(targetStep)
          }
        }
        return
      }

      setIsComplete(true)
      localStorage.removeItem("h2b-wizard-data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti animation */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
            animate={{ y: window.innerHeight + 100, rotate: Math.random() * 360 }}
            transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 0.5 }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: ["#D4AF37", "#1e3a8a", "#60a5fa", "#fbbf24"][Math.floor(Math.random() * 4)] }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              🎉 Application Submitted!
            </h2>
            <p className="text-muted-foreground mb-8">
              Thank you for your H-2B visa consultation request. Our immigration experts will review your case and
              contact you within 24-48 hours.
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 mb-8">
              <p className="text-sm text-muted-foreground">Reference Number</p>
              <p className="text-lg font-mono font-bold text-foreground">DJ-H2B-{Date.now().toString().slice(-8)}</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 mb-6 border border-accent/20">
              <p className="text-sm font-medium text-accent flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                500+ visas approved this month
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              Return to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const timeRemaining = steps.slice(currentStep - 1).reduce((acc, step) => {
    const mins = Number.parseInt(step.time)
    return acc + (isNaN(mins) ? 0.5 : mins)
  }, 0)

  const currentStepFieldErrors = Object.entries(serverFieldErrors).filter(([field]) =>
    (STEP_FIELDS[currentStep] ?? []).includes(field),
  )

  return (
    <div className="min-h-screen bg-primary flex flex-col">
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
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Diaz & Johnson"
            width={120}
            height={40}
            className="h-8 md:h-10 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showAutoSave && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-primary-foreground/70 text-sm bg-primary-foreground/10 px-3 py-1.5 rounded-full"
              >
                <Save className="w-3.5 h-3.5" />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
          <Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
            Exit
          </Link>
        </div>
      </div>

      <div className="px-4 mb-2 flex items-center justify-center gap-4 text-primary-foreground/70 text-sm">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          About {Math.ceil(timeRemaining)} min left
        </div>
        <div className="w-px h-4 bg-primary-foreground/30" />
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-accent" />
          Eligibility: {eligibilityScore}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 md:px-6 mb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                  currentStep >= step.id
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "bg-primary-foreground/20 text-primary-foreground/50",
                )}
                onClick={() => {
                  setDirection(step.id > currentStep ? 1 : -1)
                  setCurrentStep(step.id)
                }}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                  className={cn(
                    "w-8 md:w-12 lg:w-16 h-1 mx-1 rounded-full transition-all duration-300 origin-left",
                    currentStep > step.id ? "bg-accent" : "bg-primary-foreground/20",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Title */}
      <div className="text-center px-4 mb-4 md:mb-6">
        <motion.h1
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground mb-1 flex items-center justify-center gap-2"
        >
          {steps[currentStep - 1].title}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </motion.h1>
        <motion.p
          key={`desc-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary-foreground/70 text-sm md:text-base"
        >
          {steps[currentStep - 1].description}
        </motion.p>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-primary-foreground/10 rounded-xl p-4 text-primary-foreground/80 text-sm text-left max-w-md mx-auto"
            >
              {currentStep === 1 && "We need your personal information to verify your identity and contact you."}
              {currentStep === 2 && "Tell us about your U.S. employer and the job you'll be doing."}
              {currentStep === 3 && "Your work experience and skills help us assess your visa eligibility."}
              {currentStep === 4 && "Upload any supporting documents like job offers, contracts, or previous visas."}
              {currentStep === 5 && "Review all your information before submitting your consultation request."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-start justify-center px-4 pb-4 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md"
          >
            <div className="bg-card rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 max-h-[calc(100vh-340px)] overflow-y-auto">
                {submitError && (
                  <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {submitError}
                    </p>
                    {currentStepFieldErrors.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        {currentStepFieldErrors.map(([field, message]) => (
                          <li key={field}>
                            {message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/10 rounded-xl p-3 mb-4 border border-accent/20"
                    >
                      <p className="text-sm font-medium text-accent flex items-center justify-center gap-2">
                        <Award className="w-4 h-4" />
                        500+ H-2B visas approved this month
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground font-medium">
                          First Name
                        </Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            placeholder="John"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => toggleVoiceInput("firstName")}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                              isListening && activeVoiceField === "firstName"
                                ? "bg-red-500 text-white"
                                : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                            )}
                          >
                            {isListening && activeVoiceField === "firstName" ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {validationMessages.firstName && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-accent flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {validationMessages.firstName}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground font-medium">
                          Last Name
                        </Label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            placeholder="Doe"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => toggleVoiceInput("lastName")}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                              isListening && activeVoiceField === "lastName"
                                ? "bg-red-500 text-white"
                                : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                            )}
                          >
                            {isListening && activeVoiceField === "lastName" ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="john@example.com"
                        className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                      />
                      {validationMessages.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "text-xs flex items-center gap-1",
                            validationMessages.email.includes("✓") ? "text-green-600" : "text-amber-600",
                          )}
                        >
                          {validationMessages.email.includes("✓") ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {validationMessages.email}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput("phone")}
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                            isListening && activeVoiceField === "phone"
                              ? "bg-red-500 text-white"
                              : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                          )}
                        >
                          {isListening && activeVoiceField === "phone" ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {validationMessages.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-green-600 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {validationMessages.phone}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-foreground font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                        className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-foreground font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Nationality
                        </Label>
                        <div className="relative">
                          <Input
                            id="nationality"
                            value={formData.nationality}
                            onChange={(e) => updateFormData("nationality", e.target.value)}
                            placeholder="Mexico"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => toggleVoiceInput("nationality")}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                              isListening && activeVoiceField === "nationality"
                                ? "bg-red-500 text-white"
                                : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                            )}
                          >
                            {isListening && activeVoiceField === "nationality" ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-foreground font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Current Country
                        </Label>
                        <div className="relative">
                          <Input
                            id="country"
                            value={formData.currentCountry}
                            onChange={(e) => updateFormData("currentCountry", e.target.value)}
                            placeholder="Mexico"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => toggleVoiceInput("currentCountry")}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                              isListening && activeVoiceField === "currentCountry"
                                ? "bg-red-500 text-white"
                                : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                            )}
                          >
                            {isListening && activeVoiceField === "currentCountry" ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Employment Info */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="employer" className="text-foreground font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> U.S. Employer Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="employer"
                          value={formData.employerName}
                          onChange={(e) => updateFormData("employerName", e.target.value)}
                          placeholder="ABC Company LLC"
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput("employerName")}
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                            isListening && activeVoiceField === "employerName"
                              ? "bg-red-500 text-white"
                              : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                          )}
                        >
                          {isListening && activeVoiceField === "employerName" ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employerAddress" className="text-foreground font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Employer Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="employerAddress"
                          value={formData.employerAddress}
                          onChange={(e) => updateFormData("employerAddress", e.target.value)}
                          placeholder="123 Main St, Miami, FL 33101"
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput("employerAddress")}
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                            isListening && activeVoiceField === "employerAddress"
                              ? "bg-red-500 text-white"
                              : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                          )}
                        >
                          {isListening && activeVoiceField === "employerAddress" ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <Label htmlFor="jobTitle" className="text-foreground font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => updateFormData("jobTitle", e.target.value)}
                        onFocus={() => setShowJobSuggestions(true)}
                        placeholder="Landscaper, Cook, etc."
                        className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                      />
                      {showJobSuggestions && !formData.jobTitle && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-10 w-full bg-card border border-border rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto"
                        >
                          {jobTitleSuggestions.map((title) => (
                            <button
                              key={title}
                              onClick={() => {
                                updateFormData("jobTitle", title)
                                setShowJobSuggestions(false)
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors text-sm"
                            >
                              {title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobDesc" className="text-foreground font-medium">
                        Job Description
                      </Label>
                      <Textarea
                        id="jobDesc"
                        value={formData.jobDescription}
                        onChange={(e) => updateFormData("jobDescription", e.target.value)}
                        placeholder="Brief description of job duties..."
                        rows={3}
                        className="rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-foreground font-medium">
                          Start Date
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateFormData("startDate", e.target.value)}
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-foreground font-medium">
                          End Date
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateFormData("endDate", e.target.value)}
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workers" className="text-foreground font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" /> Number of Workers Needed
                      </Label>
                      <Input
                        id="workers"
                        type="number"
                        min="1"
                        value={formData.workersNeeded}
                        onChange={(e) => updateFormData("workersNeeded", e.target.value)}
                        className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Experience & Skills */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-foreground font-medium">
                        Years of Experience
                      </Label>
                      <div className="relative">
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          value={formData.yearsExperience}
                          onChange={(e) => updateFormData("yearsExperience", e.target.value)}
                          placeholder="5"
                          className="h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-accent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleVoiceInput("yearsExperience")}
                          className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                            isListening && activeVoiceField === "yearsExperience"
                              ? "bg-red-500 text-white"
                              : "bg-secondary hover:bg-accent/20 text-muted-foreground",
                          )}
                        >
                          {isListening && activeVoiceField === "yearsExperience" ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {validationMessages.yearsExperience && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-accent flex items-center gap-1"
                        >
                          <TrendingUp className="w-3 h-3" />
                          {validationMessages.yearsExperience}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Skills & Industries</Label>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map((skill) => (
                          <motion.button
                            key={skill}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                              "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                              formData.skills.includes(skill)
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "bg-secondary/70 text-muted-foreground hover:bg-secondary",
                            )}
                          >
                            {formData.skills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                            {skill}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">English Proficiency</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {englishLevels.map((level) => (
                          <motion.button
                            key={level.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData("englishLevel", level.value)}
                            className={cn(
                              "p-4 rounded-xl text-sm font-medium transition-all duration-200 border-2",
                              formData.englishLevel === level.value
                                ? "bg-accent/10 border-accent text-accent-foreground"
                                : "bg-secondary/50 border-transparent text-muted-foreground hover:border-accent/30",
                            )}
                          >
                            {level.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Previous H-2B Visa?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Yes", "No"].map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData("previousH2B", option.toLowerCase())}
                            className={cn(
                              "p-4 rounded-xl text-sm font-medium transition-all duration-200 border-2",
                              formData.previousH2B === option.toLowerCase()
                                ? "bg-accent/10 border-accent text-accent-foreground"
                                : "bg-secondary/50 border-transparent text-muted-foreground hover:border-accent/30",
                            )}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800"
                    >
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        All documents encrypted and secure
                      </p>
                    </motion.div>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-accent transition-colors" />
                      <p className="text-foreground font-medium mb-1">Click to upload documents</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-2">PDF, DOC, JPG up to 10MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-foreground font-medium">
                          Uploaded Documents ({formData.documents.length})
                        </Label>
                        <div className="space-y-2">
                          {formData.documents.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl group hover:bg-secondary transition-colors"
                            >
                              {file.type.startsWith("image/") ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <File className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-5">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-linear-to-r from-accent/10 to-primary/10 rounded-2xl p-6 text-center border border-accent/20"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-semibold text-foreground">Your Eligibility Score</h3>
                      </div>
                      <div className="text-5xl font-bold text-accent mb-2">{eligibilityScore}%</div>
                      <p className="text-sm text-muted-foreground">
                        {eligibilityScore >= 80 && "Excellent! Strong application"}
                        {eligibilityScore >= 60 && eligibilityScore < 80 && "Good! Solid chances"}
                        {eligibilityScore < 60 && "Consider adding more details"}
                      </p>
                    </motion.div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Application Summary</h3>

                      <div className="space-y-3">
                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Applicant</p>
                          <p className="font-medium text-foreground">
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{formData.email}</p>
                        </div>

                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Position</p>
                          <p className="font-medium text-foreground">{formData.jobTitle || "Not specified"}</p>
                          <p className="text-sm text-muted-foreground">{formData.employerName || "Not specified"}</p>
                        </div>

                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Experience</p>
                          <p className="font-medium text-foreground">
                            {formData.yearsExperience || "0"} years • {formData.englishLevel || "Not specified"} English
                          </p>
                          <p className="text-sm text-muted-foreground">{formData.skills.length} skills selected</p>
                        </div>

                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Documents</p>
                          <p className="font-medium text-foreground">{formData.documents.length} files uploaded</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" /> How urgent is your case?
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "normal", label: "Normal", color: "bg-blue-500" },
                          { value: "urgent", label: "Urgent", color: "bg-amber-500" },
                          { value: "very-urgent", label: "Very Urgent", color: "bg-red-500" },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData("urgency", option.value)}
                            className={cn(
                              "p-3 rounded-xl text-xs font-medium transition-all duration-200 border-2",
                              formData.urgency === option.value
                                ? `${option.color} border-transparent text-white`
                                : "bg-secondary/50 border-transparent text-muted-foreground hover:border-accent/30",
                            )}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                      <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Your Data is Secure</p>
                          <p className="text-xs text-muted-foreground">
                            All information is encrypted and handled according to immigration law confidentiality
                            standards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-6 bg-secondary/20 border-t border-border flex items-center justify-between gap-4">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        currentStep === step.id ? "w-6 bg-accent" : "bg-border",
                      )}
                    />
                  ))}
                </div>

                {currentStep < 5 ? (
                  <Button onClick={nextStep} className="flex items-center gap-2 bg-primary text-primary-foreground">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {currentStep < 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-4 text-primary-foreground/50 text-xs"
              >
                Next: {steps[currentStep].title} • Use arrow keys or swipe to navigate
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center z-50"
        onClick={() => alert("Need help? Call us at (305) 555-0100 or chat with our team!")}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
