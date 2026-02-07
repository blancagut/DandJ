"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  Globe,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Save,
  Brain,
  Tractor,
  HardHat,
  FileCheck,
  XCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWorkScreeningTranslation } from "@/lib/work-screening-i18n"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ==========================================
// TYPES
// ==========================================

type GoalType = "temporary" | "permanent" | "unsure"
type JobOfferStatus = "yes" | "no" | "in_process"
type WorkCategory = "skilled" | "seasonal" | "construction" | "agriculture" | "unsure"
type OverstayStatus = "yes" | "no" | "unsure"
type OffenseType = "minor" | "theft" | "drug" | "violence" | "unsure"
type EducationLevel = "high_school" | "technical" | "college" | "advanced"
type YearsExperience = "less_1" | "1_to_3" | "3_to_5" | "more_5"

type EligibilityLevel = "likely_eligible" | "possibly_eligible" | "higher_risk"

interface WorkScreeningData {
  goalType: GoalType | ""
  jobOfferStatus: JobOfferStatus | ""
  workCategory: WorkCategory | ""
  usTravel: boolean | null
  overstayHistory: OverstayStatus | ""
  deportationHistory: boolean | null
  visaDenialHistory: boolean | null
  criminalHistory: boolean | null
  offenseType: OffenseType | ""
  educationLevel: EducationLevel | ""
  specializedExperience: boolean | null
  yearsExperience: YearsExperience | ""
}

const initialFormData: WorkScreeningData = {
  goalType: "",
  jobOfferStatus: "",
  workCategory: "",
  usTravel: null,
  overstayHistory: "",
  deportationHistory: null,
  visaDenialHistory: null,
  criminalHistory: null,
  offenseType: "",
  educationLevel: "",
  specializedExperience: null,
  yearsExperience: "",
}

interface ScreeningResult {
  eligibility: EligibilityLevel
  visaPaths: string[] // i18n keys under results.paths.*
  riskFlags: string[] // raw flag keys
  nextStep: string // i18n key under results.*
}

// ==========================================
// CLASSIFICATION ENGINE (lightweight)
// ==========================================

function analyzeWorkScreening(data: WorkScreeningData): ScreeningResult {
  const riskFlags: string[] = []
  const visaPaths: string[] = []

  // Risk detection
  if (data.overstayHistory === "yes") riskFlags.push("possible_unlawful_presence")
  if (data.deportationHistory) riskFlags.push("possible_deportation_history")
  if (data.criminalHistory && data.offenseType && data.offenseType !== "minor") {
    riskFlags.push("possible_criminal_risk")
  }
  if (data.visaDenialHistory) riskFlags.push("prior_visa_denial")

  // Visa path determination
  if (data.workCategory === "agriculture") {
    visaPaths.push("h2a")
  } else if (data.workCategory === "seasonal" || data.workCategory === "construction") {
    visaPaths.push("h2b")
    if (data.goalType === "permanent") visaPaths.push("eb3")
  } else if (data.workCategory === "skilled") {
    if (data.educationLevel === "advanced") {
      visaPaths.push("eb2")
      visaPaths.push("h1bSpecialized")
    } else if (data.educationLevel === "college") {
      visaPaths.push("h1b")
      if (data.goalType === "permanent") visaPaths.push("eb3")
    } else {
      visaPaths.push("h2b")
      if (data.specializedExperience && data.yearsExperience === "more_5") {
        visaPaths.push("eb3")
      }
    }
  } else if (data.workCategory === "unsure") {
    // Generic suggestions
    if (data.educationLevel === "advanced" || data.educationLevel === "college") {
      visaPaths.push("h1b")
    }
    visaPaths.push("h2b")
  }

  // Add sponsor note if no job offer
  if (data.jobOfferStatus === "no") {
    visaPaths.push("needsSponsor")
  }

  // Ensure at least one path
  if (visaPaths.length === 0) visaPaths.push("h2b")

  // Eligibility determination
  let eligibility: EligibilityLevel = "likely_eligible"

  if (riskFlags.includes("possible_deportation_history") || riskFlags.includes("possible_criminal_risk")) {
    eligibility = "higher_risk"
  } else if (riskFlags.length > 0) {
    eligibility = "possibly_eligible"
  }

  // Next step
  let nextStep: string
  if (eligibility === "higher_risk") {
    nextStep = "scheduleConsult"
  } else if (data.jobOfferStatus === "no") {
    nextStep = "seekSponsor"
  } else if (riskFlags.length > 0) {
    nextStep = "reviewWaiver"
  } else {
    nextStep = "proceedApplication"
  }

  return {
    eligibility,
    visaPaths: [...new Set(visaPaths)],
    riskFlags,
    nextStep,
  }
}

// ==========================================
// DEMO DATA for admin panel
// ==========================================

export interface WorkScreeningSavedData {
  workScreening: {
    goalType: string
    jobOfferStatus: string
    workCategory: string
    usTravelHistory: boolean | null
    overstayHistory: string
    deportationHistory: boolean | null
    visaDenialHistory: boolean | null
    criminalHistory: boolean | null
    offenseType: string
    educationLevel: string
    specializedExperience: boolean | null
    yearsExperience: string
    recommendedVisaPaths: string[]
    riskFlags: string[]
    eligibilityLevel: string
    nextStep: string
    timestamp: string
  }
}

export const demoWorkScreeningCases: WorkScreeningSavedData[] = [
  {
    workScreening: {
      goalType: "temporary",
      jobOfferStatus: "yes",
      workCategory: "seasonal",
      usTravelHistory: false,
      overstayHistory: "no",
      deportationHistory: false,
      visaDenialHistory: false,
      criminalHistory: false,
      offenseType: "",
      educationLevel: "high_school",
      specializedExperience: false,
      yearsExperience: "1_to_3",
      recommendedVisaPaths: ["h2b"],
      riskFlags: [],
      eligibilityLevel: "likely_eligible",
      nextStep: "proceedApplication",
      timestamp: "2026-01-20T09:00:00.000Z",
    },
  },
  {
    workScreening: {
      goalType: "permanent",
      jobOfferStatus: "yes",
      workCategory: "skilled",
      usTravelHistory: true,
      overstayHistory: "yes",
      deportationHistory: false,
      visaDenialHistory: true,
      criminalHistory: false,
      offenseType: "",
      educationLevel: "college",
      specializedExperience: true,
      yearsExperience: "more_5",
      recommendedVisaPaths: ["h1b", "eb3"],
      riskFlags: ["possible_unlawful_presence", "prior_visa_denial"],
      eligibilityLevel: "possibly_eligible",
      nextStep: "reviewWaiver",
      timestamp: "2026-02-03T14:30:00.000Z",
    },
  },
  {
    workScreening: {
      goalType: "temporary",
      jobOfferStatus: "in_process",
      workCategory: "construction",
      usTravelHistory: true,
      overstayHistory: "yes",
      deportationHistory: true,
      visaDenialHistory: true,
      criminalHistory: true,
      offenseType: "drug",
      educationLevel: "technical",
      specializedExperience: true,
      yearsExperience: "3_to_5",
      recommendedVisaPaths: ["h2b"],
      riskFlags: ["possible_unlawful_presence", "possible_deportation_history", "possible_criminal_risk", "prior_visa_denial"],
      eligibilityLevel: "higher_risk",
      nextStep: "scheduleConsult",
      timestamp: "2026-02-06T11:15:00.000Z",
    },
  },
]

// ==========================================
// STEP CONFIG
// ==========================================

const steps = [
  { id: 1, title: "Profile", icon: Briefcase, description: "Basic Info" },
  { id: 2, title: "Immigration", icon: Globe, description: "History" },
  { id: 3, title: "Criminal", icon: Shield, description: "Record" },
  { id: 4, title: "Qualifications", icon: GraduationCap, description: "Work Skills" },
]

const stepKeys = ["profile", "immigration", "criminal", "qualifications"]

// ==========================================
// COMPONENT
// ==========================================

export function WorkScreeningWizard() {
  const { t, ready } = useWorkScreeningTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WorkScreeningData>(initialFormData)
  const [direction, setDirection] = useState(0)
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Data persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("work-screening-data")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setFormData({ ...initialFormData, ...parsed })
        } catch { /* ignore */ }
      }
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("work-screening-data", JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  const validateStep = (step: number): string | null => {
    setValidationError(null)
    switch (step) {
      case 1:
        if (!formData.goalType) return t("validation.goalRequired")
        if (!formData.jobOfferStatus) return t("validation.jobOfferRequired")
        if (!formData.workCategory) return t("validation.workCategoryRequired")
        break
      case 2:
        if (formData.usTravel === null) return t("validation.usTravelRequired")
        if (!formData.overstayHistory) return t("validation.overstayRequired")
        if (formData.deportationHistory === null) return t("validation.deportationRequired")
        if (formData.visaDenialHistory === null) return t("validation.visaDenialRequired")
        break
      case 3:
        if (formData.criminalHistory === null) return t("validation.criminalRequired")
        if (formData.criminalHistory && !formData.offenseType) return t("validation.offenseRequired")
        break
      case 4:
        if (!formData.educationLevel) return t("validation.educationRequired")
        if (formData.specializedExperience === null) return t("validation.experienceRequired")
        if (!formData.yearsExperience) return t("validation.yearsRequired")
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
    } else {
      // Last step → analyze
      const analysis = analyzeWorkScreening(formData)
      setResult(analysis)
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (showResults) {
      setShowResults(false)
      return
    }
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSave = () => {
    if (!result) return
    try {
      const saveData: WorkScreeningSavedData = {
        workScreening: {
          goalType: formData.goalType,
          jobOfferStatus: formData.jobOfferStatus,
          workCategory: formData.workCategory,
          usTravelHistory: formData.usTravel,
          overstayHistory: formData.overstayHistory,
          deportationHistory: formData.deportationHistory,
          visaDenialHistory: formData.visaDenialHistory,
          criminalHistory: formData.criminalHistory,
          offenseType: formData.offenseType,
          educationLevel: formData.educationLevel,
          specializedExperience: formData.specializedExperience,
          yearsExperience: formData.yearsExperience,
          recommendedVisaPaths: result.visaPaths,
          riskFlags: result.riskFlags,
          eligibilityLevel: result.eligibility,
          nextStep: result.nextStep,
          timestamp: new Date().toISOString(),
        },
      }
      console.log("Work Screening Save:", saveData)
      // Clear localStorage after successful save
      localStorage.removeItem("work-screening-data")
      setIsSaved(true)
    } catch (e) {
      console.error("Work screening save failed:", e)
    }
  }

  const updateField = <K extends keyof WorkScreeningData>(field: K, value: WorkScreeningData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Animation variants
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 50 : -50, opacity: 0 }),
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-lg">Loading…</div>
      </div>
    )
  }

  // ==========================================
  // SAVED CONFIRMATION SCREEN
  // ==========================================
  if (isSaved) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 shadow-lg border-t-4 border-t-green-600 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t("confirmation.title")}</h2>
            <p className="text-lg text-slate-600 mb-2">{t("confirmation.message")}</p>
            <p className="text-slate-500 mb-8">{t("confirmation.followUp")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consult">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ChevronLeft className="w-4 h-4" /> {t("confirmation.backToForms")}
                </Button>
              </Link>
              <Link href="/">
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                  {t("confirmation.backToHome")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ==========================================
  // RESULTS SCREEN
  // ==========================================
  if (showResults && result) {
    const eligibilityStyles: Record<EligibilityLevel, { bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
      likely_eligible: { bg: "bg-green-50", text: "text-green-800", border: "border-l-green-500", icon: CheckCircle2 },
      possibly_eligible: { bg: "bg-amber-50", text: "text-amber-800", border: "border-l-amber-500", icon: AlertTriangle },
      higher_risk: { bg: "bg-red-50", text: "text-red-800", border: "border-l-red-500", icon: XCircle },
    }
    const eligStyle = eligibilityStyles[result.eligibility]
    const EligIcon = eligStyle.icon

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{t("header.title")}</h1>
              <WaiverLanguageSelector />
            </div>
          </div>

          <Card className="p-6 md:p-8 shadow-lg border-t-4 border-t-indigo-600 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="text-indigo-600 w-8 h-8" />
              <h2 className="text-3xl font-bold">{t("results.heading")}</h2>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p><strong>{t("results.disclaimer")}</strong></p>
            </div>

            {/* Eligibility Level */}
            <Card className={cn("p-5 border-l-4 shadow-sm", eligStyle.border, eligStyle.bg)}>
              <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">{t("results.eligibilityLevel")}</h3>
              <div className={cn("text-xl font-bold flex items-center gap-2", eligStyle.text)}>
                <EligIcon className="w-6 h-6" />
                {t(`results.${result.eligibility === "likely_eligible" ? "likelyEligible" : result.eligibility === "possibly_eligible" ? "possiblyEligible" : "higherRisk"}`)}
              </div>
            </Card>

            {/* Visa Paths */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">{t("results.visaPaths")}</h3>
              <div className="flex flex-wrap gap-2">
                {result.visaPaths.map((path) => (
                  <Badge key={path} variant="secondary" className="px-3 py-1.5 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-sm">
                    {t(`results.paths.${path}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Risk Flags */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">{t("results.riskFlags")}</h3>
              {result.riskFlags.length > 0 ? (
                <div className="space-y-2">
                  {result.riskFlags.map((flag) => (
                    <div key={flag} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-red-800">{t(`results.flags.${flag}`)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">{t("results.noRisks")}</span>
                </div>
              )}
            </div>

            {/* Next Step */}
            <Card className="p-5 bg-indigo-50 border-indigo-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">{t("results.nextSteps")}</h3>
              <p className="text-indigo-900 font-medium">{t(`results.${result.nextStep}`)}</p>
            </Card>
          </Card>

          {/* Footer Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> {t("nav.back")}
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleSave}>
              <Save className="w-4 h-4" /> {t("nav.saveResults")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // FORM STEPS
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header / Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{t("header.title")}</h1>
            <WaiverLanguageSelector />
          </div>
          <p className="text-slate-600 mb-6">{t("header.subtitle")}</p>

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

          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
            {steps.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              return (
                <div key={step.id} className="flex flex-col items-center bg-slate-50 px-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isActive ? "border-indigo-600 bg-indigo-600 text-white" :
                      isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-slate-400"
                    )}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-2 hidden sm:block",
                    isActive ? "text-indigo-600" : isCompleted ? "text-green-600" : "text-slate-400"
                  )}>{t(`steps.${stepKeys[step.id - 1]}.title`)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 md:p-8 min-h-80 relative overflow-hidden shadow-lg border-t-4 border-t-indigo-600">
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
              {/* =============== STEP 1: BASIC PROFILE =============== */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="text-indigo-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step1.heading")}</h2>
                  </div>

                  {/* Goal */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step1.goalLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step1.goalTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {([
                        { id: "temporary", label: t("step1.goalTemp"), icon: Clock },
                        { id: "permanent", label: t("step1.goalPerm"), icon: FileCheck },
                        { id: "unsure", label: t("step1.goalUnsure"), icon: Info },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("goalType", opt.id)}
                          className={cn("p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-all hover:border-indigo-400",
                            formData.goalType === opt.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200"
                          )}
                        >
                          <opt.icon className="w-5 h-5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Job Offer */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step1.jobOfferLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step1.jobOfferTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {([
                        { id: "yes", label: t("step1.jobOfferYes") },
                        { id: "no", label: t("step1.jobOfferNo") },
                        { id: "in_process", label: t("step1.jobOfferProcess") },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("jobOfferStatus", opt.id)}
                          className={cn("px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                            formData.jobOfferStatus === opt.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 hover:border-slate-400"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Work Category */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step1.workCategoryLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step1.workCategoryTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        { id: "skilled", label: t("step1.workSkilled"), icon: Briefcase },
                        { id: "seasonal", label: t("step1.workSeasonal"), icon: Clock },
                        { id: "construction", label: t("step1.workConstruction"), icon: HardHat },
                        { id: "agriculture", label: t("step1.workAgriculture"), icon: Tractor },
                        { id: "unsure", label: t("step1.workUnsure"), icon: Info },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("workCategory", opt.id)}
                          className={cn("p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-all hover:border-indigo-400",
                            formData.workCategory === opt.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200"
                          )}
                        >
                          <opt.icon className="w-5 h-5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =============== STEP 2: IMMIGRATION HISTORY =============== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step2.heading")}</h2>
                  </div>

                  {/* US Travel */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step2.usTravelLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step2.usTravelTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex gap-3">
                      <Button variant={formData.usTravel === true ? "default" : "outline"} onClick={() => updateField("usTravel", true)} className="w-28">{t("step2.yes")}</Button>
                      <Button variant={formData.usTravel === false ? "default" : "outline"} onClick={() => updateField("usTravel", false)} className="w-28">{t("step2.no")}</Button>
                    </div>
                  </div>

                  {/* Overstay */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step2.overstayLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step2.overstayTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {([
                        { id: "yes", label: t("step2.overstayYes") },
                        { id: "no", label: t("step2.overstayNo") },
                        { id: "unsure", label: t("step2.overstayUnsure") },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("overstayHistory", opt.id)}
                          className={cn("px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                            formData.overstayHistory === opt.id ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deportation */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step2.deportationLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step2.deportationTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex gap-3">
                      <Button variant={formData.deportationHistory === true ? "destructive" : "outline"} onClick={() => updateField("deportationHistory", true)} className="w-28">{t("step2.yes")}</Button>
                      <Button variant={formData.deportationHistory === false ? "default" : "outline"} onClick={() => updateField("deportationHistory", false)} className="w-28">{t("step2.no")}</Button>
                    </div>
                  </div>

                  {/* Visa Denial */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step2.visaDenialLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step2.visaDenialTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex gap-3">
                      <Button variant={formData.visaDenialHistory === true ? "default" : "outline"} onClick={() => updateField("visaDenialHistory", true)} className="w-28">{t("step2.yes")}</Button>
                      <Button variant={formData.visaDenialHistory === false ? "default" : "outline"} onClick={() => updateField("visaDenialHistory", false)} className="w-28">{t("step2.no")}</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* =============== STEP 3: CRIMINAL HISTORY =============== */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-slate-700 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step3.heading")}</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step3.criminalLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step3.criminalTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex gap-3">
                      <Button variant={formData.criminalHistory === true ? "destructive" : "outline"} onClick={() => updateField("criminalHistory", true)} className="w-28">{t("step3.yes")}</Button>
                      <Button variant={formData.criminalHistory === false ? "default" : "outline"} onClick={() => updateField("criminalHistory", false)} className="w-28">{t("step3.no")}</Button>
                    </div>
                  </div>

                  {formData.criminalHistory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <label className="text-base font-medium">{t("step3.offenseLabel")}</label>
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step3.offenseTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {([
                          { id: "minor", label: t("step3.offenseMinor") },
                          { id: "theft", label: t("step3.offenseTheft") },
                          { id: "drug", label: t("step3.offenseDrug") },
                          { id: "violence", label: t("step3.offenseViolence") },
                          { id: "unsure", label: t("step3.offenseUnsure") },
                        ] as const).map((opt) => (
                          <button key={opt.id} onClick={() => updateField("offenseType", opt.id)}
                            className={cn("p-3 border-2 rounded-xl text-left text-sm font-medium transition-all hover:border-slate-400",
                              formData.offenseType === opt.id ? "border-red-500 bg-red-50 text-red-800" : "border-slate-200"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* =============== STEP 4: QUALIFICATIONS =============== */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="text-emerald-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step4.heading")}</h2>
                  </div>

                  {/* Education */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step4.educationLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step4.educationTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        { id: "high_school", label: t("step4.eduHighSchool") },
                        { id: "technical", label: t("step4.eduTechnical") },
                        { id: "college", label: t("step4.eduCollege") },
                        { id: "advanced", label: t("step4.eduAdvanced") },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("educationLevel", opt.id)}
                          className={cn("p-3 border-2 rounded-xl text-left text-sm font-medium transition-all hover:border-emerald-400",
                            formData.educationLevel === opt.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialized Experience */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step4.experienceLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step4.experienceTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="flex gap-3">
                      <Button variant={formData.specializedExperience === true ? "default" : "outline"} onClick={() => updateField("specializedExperience", true)} className="w-28">{t("step4.yes")}</Button>
                      <Button variant={formData.specializedExperience === false ? "default" : "outline"} onClick={() => updateField("specializedExperience", false)} className="w-28">{t("step4.no")}</Button>
                    </div>
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-base font-medium">{t("step4.yearsLabel")}</label>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step4.yearsTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: "less_1", label: t("step4.yearsLess1") },
                        { id: "1_to_3", label: t("step4.years1to3") },
                        { id: "3_to_5", label: t("step4.years3to5") },
                        { id: "more_5", label: t("step4.yearsMore5") },
                      ] as const).map((opt) => (
                        <button key={opt.id} onClick={() => updateField("yearsExperience", opt.id)}
                          className={cn("p-3 border-2 rounded-xl text-center text-sm font-medium transition-all hover:border-emerald-400",
                            formData.yearsExperience === opt.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {t("nav.back")}
          </Button>
          <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {currentStep === 4 ? t("nav.viewResults") : t("nav.continue")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
