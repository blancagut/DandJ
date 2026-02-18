"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  UserCheck,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  AlertCircle,
  AlertTriangle,
  FileText,
  Brain,
  Shield,
  Heart,
  DollarSign,
  Briefcase,
  Gavel,
  Ban,
  Clock,
  Save,
  Siren,
  ShieldAlert,
  FileWarning,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { usePetitionTranslation } from "@/lib/petition-i18n"
import { useLanguage } from "@/lib/language-context"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import {
  type PetitionFormData,
  type PetitionAnalysis,
  type OffenseType,
  type EvidenceType,
  initialPetitionFormData,
  classifyCategory,
  determineProcessingPath,
  checkFinancialEligibility,
  analyzePetitionCase,
} from "@/lib/petition-types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

// Step definition with icons
const allStepDefs = [
  { key: "relationship", icon: Users },
  { key: "petitioner", icon: UserCheck },
  { key: "beneficiary", icon: Globe },
  { key: "processing", icon: FileText },
  { key: "immigration", icon: Clock },
  { key: "criminal", icon: Gavel },
  { key: "financial", icon: DollarSign },
  { key: "marriage", icon: Heart },
  { key: "results", icon: Brain },
]

// Helper: capitalize first letter for translation key lookup (e.g. "high" → "High")
const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function TypedDateInput({
  isoValue,
  onIsoChange,
  placeholder,
}: {
  isoValue: string
  onIsoChange: (value: string) => void
  placeholder: string
}) {
  const [displayValue, setDisplayValue] = useState("")

  useEffect(() => {
    if (!isoValue) {
      setDisplayValue("")
      return
    }
    const parts = isoValue.split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      setDisplayValue(`${day}/${month}/${year}`)
    }
  }, [isoValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "")
    if (raw.length > 8) raw = raw.slice(0, 8)

    let formatted = ""
    if (raw.length > 0) formatted = raw.slice(0, 2)
    if (raw.length > 2) formatted += "/" + raw.slice(2, 4)
    if (raw.length > 4) formatted += "/" + raw.slice(4, 8)
    setDisplayValue(formatted)

    if (raw.length === 8) {
      const dd = raw.slice(0, 2)
      const mm = raw.slice(2, 4)
      const yyyy = raw.slice(4, 8)
      const day = parseInt(dd, 10)
      const month = parseInt(mm, 10)
      const year = parseInt(yyyy, 10)
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2030) {
        onIsoChange(`${yyyy}-${mm}-${dd}`)
      } else {
        onIsoChange("")
      }
    } else {
      onIsoChange("")
    }
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="text-base"
      maxLength={10}
    />
  )
}

// ==========================================
// COMPONENT
// ==========================================

export function PetitionWizard() {
  const { t, ready } = usePetitionTranslation()
  const { language } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PetitionFormData>(initialPetitionFormData)
  const [direction, setDirection] = useState(0)
  const [analysis, setAnalysis] = useState<PetitionAnalysis | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactError, setContactError] = useState<string | null>(null)

  // Marriage step is included only for spouse petitions
  const includeMarriage = formData.relationship === "spouse"

  // Build active steps list (1-indexed ids), skipping marriage when not applicable
  const activeSteps = useMemo(() => {
    const steps = allStepDefs.filter((s) => s.key !== "marriage" || includeMarriage)
    return steps.map((s, i) => ({ ...s, id: i + 1 }))
  }, [includeMarriage])

  const totalSteps = activeSteps.length
  const stepKeys = activeSteps.map((s) => s.key)

  // Map logical step number to step key
  const currentStepKey = stepKeys[currentStep - 1] || "relationship"

  // Data persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("petition-wizard-data")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Merge with defaults to prevent undefined array fields from stale localStorage
          setFormData({ ...initialPetitionFormData, ...parsed,
            offenseTypes: Array.isArray(parsed.offenseTypes) ? parsed.offenseTypes : [],
            evidenceOfRelationship: Array.isArray(parsed.evidenceOfRelationship) ? parsed.evidenceOfRelationship : [],
          })
        } catch (e) {
          console.error("Failed to load saved petition data", e)
        }
      }
    } catch { /* localStorage unavailable */ }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try { localStorage.setItem("petition-wizard-data", JSON.stringify(formData)) } catch { /* localStorage unavailable */ }
    }
  }, [formData, isLoaded])

  // Live category detection
  const liveCategory = useMemo(() => {
    if (formData.petitionerStatus && formData.relationship) {
      return classifyCategory(formData)
    }
    return null
  }, [formData.petitionerStatus, formData.relationship, formData.beneficiaryAge, formData.beneficiaryMaritalStatus])

  // Validation
  const validateStep = (stepKey: string) => {
    setValidationError(null)
    switch (stepKey) {
      case "relationship":
        if (!formData.petitionerStatus) return t("validation.petitionerStatusRequired")
        if (!formData.relationship) return t("validation.relationshipRequired")
        if (formData.beneficiaryAge === null) return t("validation.beneficiaryAgeRequired")
        if (!formData.beneficiaryMaritalStatus) return t("validation.beneficiaryMaritalRequired")
        break
      case "petitioner":
        if (!formData.citizenshipMethod) return t("validation.citizenshipMethodRequired")
        if (formData.yearsWithStatus === null) return t("validation.yearsWithStatusRequired")
        if (formData.priorPetitions === null) return t("validation.priorPetitionsRequired")
        break
      case "beneficiary":
        if (!formData.beneficiaryCountryOfBirth || !formData.beneficiaryCountryOfResidence) return t("validation.beneficiaryCountryRequired")
        if (!formData.beneficiaryLocation) return t("validation.beneficiaryLocationRequired")
        if (formData.priorUSEntries === null) return t("validation.entryHistoryRequired")
        break
      case "processing":
        if (formData.beneficiaryLocation === "inside") {
          if (formData.enteredLegally === null) return t("validation.processingPathRequired")
        }
        break
      case "immigration":
        if (formData.unlawfulPresence === null || formData.priorDeportation === null || formData.falseDocuments === null) return t("validation.immigrationHistoryRequired")
        break
      case "criminal":
        if (formData.arrests === null) return t("validation.criminalHistoryRequired")
        if (formData.arrests && formData.offenseTypes.length === 0) return t("validation.offenseRequired")
        break
      case "financial":
        if (formData.annualIncome === null) return t("validation.incomeRequired")
        if (formData.dependents === null) return t("validation.dependentsRequired")
        if (formData.employed === null) return t("validation.employmentRequired")
        break
      case "marriage":
        if (!formData.marriageDate) return t("validation.marriageDateRequired")
        if (!formData.marriageLocation) return t("validation.marriageLocationRequired")
        break
      case "results":
        break
    }
    return null
  }

  const handleSave = async () => {
    if (!analysis) return
    setContactError(null)
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setContactError(t("contact.required"))
      return
    }
    try {
      const saveData = {
        petitionScreening: {
          petitionerInfo: {
            status: formData.petitionerStatus,
            citizenshipMethod: formData.citizenshipMethod,
            yearsWithStatus: formData.yearsWithStatus,
            priorPetitions: formData.priorPetitions,
          },
          beneficiaryInfo: {
            countryOfBirth: formData.beneficiaryCountryOfBirth,
            countryOfResidence: formData.beneficiaryCountryOfResidence,
            location: formData.beneficiaryLocation,
            age: formData.beneficiaryAge,
            maritalStatus: formData.beneficiaryMaritalStatus,
          },
          relationshipCategory: analysis.category,
          processingPath: analysis.processingPath,
          inadmissibilityFlags: analysis.inadmissibilityFlags,
          financialEligibility: {
            income: formData.annualIncome,
            dependents: formData.dependents,
            meetsGuideline: analysis.financialMeetsGuideline,
            coSponsor: formData.coSponsorAvailable,
          },
          marriageFraudIndicators: analysis.marriageFraudIndicators,
          recommendedStrategy: analysis.strategy,
          casePriority: analysis.casePriority,
          waiverFlag: analysis.waiverFlag,
          timestamp: new Date().toISOString(),
        },
      }

      const res = await fetch("/api/consult/petition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: saveData,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("Petition API error:", data)
        setContactError(language === "es"
          ? "Error al guardar. Por favor intente de nuevo."
          : "Error saving your results. Please try again.")
        return
      }

      // Clear localStorage after successful save
      localStorage.removeItem("petition-wizard-data")
      setIsSaved(true)
    } catch (e) {
      console.error("Petition save failed:", e)
      setContactError(language === "es"
        ? "Error de conexión. Por favor intente de nuevo."
        : "Connection error. Please try again.")
    }
  }

  const isLastContentStep = currentStepKey === stepKeys[totalSteps - 2] // step before results
  const isResultsStep = currentStepKey === "results"

  const handleNext = () => {
    const error = validateStep(currentStepKey)
    if (error) { setValidationError(error); return }

    if (currentStep < totalSteps) {
      // Run analysis before results step
      if (stepKeys[currentStep] === "results") {
        try {
          setAnalysis(analyzePetitionCase(formData))
        } catch (e) {
          console.error("Petition analysis failed:", e)
          setValidationError(t("validation.analysisError") || "Analysis failed. Please review your answers and try again.")
          return
        }
      }
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) { setDirection(-1); setCurrentStep((prev) => prev - 1) }
  }

  const updateField = (field: keyof PetitionFormData, value: PetitionFormData[keyof PetitionFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: "offenseTypes" | "evidenceOfRelationship", value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[]
      return { ...prev, [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] }
    })
  }

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
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  {t("confirmation.backToHome")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{t("header.title")}</h1>
            <WaiverLanguageSelector />
          </div>
          <p className="text-slate-600 mb-6">{t("header.subtitle")}</p>

          {validationError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{validationError}</span>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
            {activeSteps.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              return (
                <div key={step.key} className="flex flex-col items-center bg-slate-50 px-1">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300", isActive ? "border-emerald-600 bg-emerald-600 text-white" : isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-slate-400")}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={cn("text-xs font-medium mt-1 hidden sm:block text-center", isActive ? "text-emerald-600" : isCompleted ? "text-green-600" : "text-slate-400")}>
                    {t(`steps.${step.key}.title`)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 md:p-8 min-h-100 relative overflow-hidden shadow-lg border-t-4 border-t-emerald-600">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div key={currentStep} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">

              {/* ==================== STEP 1: RELATIONSHIP ==================== */}
              {currentStepKey === "relationship" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-emerald-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step1.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step1.categoryTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  {/* Petitioner Status */}
                  <div className="space-y-3">
                    <Label className="text-base">{t("step1.petitionerStatusLabel")}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => updateField("petitionerStatus", "citizen")} className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-emerald-400 transition-all", formData.petitionerStatus === "citizen" ? "border-emerald-600 bg-emerald-50" : "border-slate-200")}>
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <div className="text-left">
                          <div className="font-semibold">{t("step1.citizen")}</div>
                          <div className="text-sm text-slate-500">{t("step1.citizenDesc")}</div>
                        </div>
                      </button>
                      <button onClick={() => updateField("petitionerStatus", "lpr")} className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-emerald-400 transition-all", formData.petitionerStatus === "lpr" ? "border-emerald-600 bg-emerald-50" : "border-slate-200")}>
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                          <div className="font-semibold">{t("step1.lpr")}</div>
                          <div className="text-sm text-slate-500">{t("step1.lprDesc")}</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="space-y-3">
                    <Label className="text-base">{t("step1.relationshipLabel")}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["spouse", "child", "parent", "sibling"] as const).map((rel) => (
                        <button key={rel} onClick={() => updateField("relationship", rel)} className={cn("px-4 py-3 rounded-lg border text-sm font-medium transition-all", formData.relationship === rel ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400")}>
                          {t(`step1.${rel}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="space-y-3">
                    <Label className="text-base">{t("step1.beneficiaryAgeLabel")}</Label>
                    <Input type="number" min={0} max={120} placeholder={t("step1.agePlaceholder")} value={formData.beneficiaryAge ?? ""} onChange={(e) => updateField("beneficiaryAge", e.target.value ? parseInt(e.target.value) : null)} className="max-w-xs text-base" />
                  </div>

                  {/* Marital Status */}
                  <div className="space-y-3">
                    <Label className="text-base">{t("step1.beneficiaryMaritalLabel")}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["single", "married", "divorced", "widowed"] as const).map((ms) => (
                        <button key={ms} onClick={() => updateField("beneficiaryMaritalStatus", ms)} className={cn("px-4 py-3 rounded-lg border text-sm font-medium transition-all", formData.beneficiaryMaritalStatus === ms ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400")}>
                          {t(`step1.${ms}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Category Detection */}
                  {liveCategory && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("p-4 rounded-lg border-2 mt-4", liveCategory.eligible ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300")}>
                      <div className="flex items-center gap-2 mb-1">
                        {liveCategory.eligible ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                        <span className="font-semibold text-sm uppercase tracking-wide">{t("step1.detectedCategory")}</span>
                      </div>
                      {liveCategory.eligible && liveCategory.category ? (
                        <div className="text-lg font-bold text-emerald-800">{t(`categories.${liveCategory.category}`)}</div>
                      ) : (
                        <div>
                          <div className="text-lg font-bold text-red-800">{t("step1.notEligible")}</div>
                          <p className="text-sm text-red-700 mt-1">{t("step1.notEligibleDesc")}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ==================== STEP 2: PETITIONER INFO ==================== */}
              {currentStepKey === "petitioner" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="text-blue-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step2.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step2.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step2.citizenshipMethodLabel")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.petitionerStatus === "citizen" ? (
                        <>
                          {(["birth", "naturalization", "derivation"] as const).map((m) => (
                            <button key={m} onClick={() => updateField("citizenshipMethod", m)} className={cn("px-4 py-3 rounded-lg border text-sm font-medium transition-all", formData.citizenshipMethod === m ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400")}>
                              {t(`step2.${m}`)}
                            </button>
                          ))}
                        </>
                      ) : (
                        <button onClick={() => updateField("citizenshipMethod", "lpr_through")} className={cn("px-4 py-3 rounded-lg border text-sm font-medium transition-all col-span-2", formData.citizenshipMethod === "lpr_through" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400")}>
                          {t("step2.lprThrough")}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step2.yearsLabel")}</Label>
                    <Input type="number" min={0} max={80} placeholder={t("step2.yearsPlaceholder")} value={formData.yearsWithStatus ?? ""} onChange={(e) => updateField("yearsWithStatus", e.target.value ? parseInt(e.target.value) : null)} className="max-w-xs text-base" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step2.priorPetitionsLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.priorPetitions === true ? "default" : "outline"} onClick={() => updateField("priorPetitions", true)} className="w-32">{t("step2.yes")}</Button>
                      <Button variant={formData.priorPetitions === false ? "default" : "outline"} onClick={() => updateField("priorPetitions", false)} className="w-32">{t("step2.no")}</Button>
                    </div>
                  </div>

                  {formData.priorPetitions && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-4 border-t">
                      <Label>{t("step2.priorApprovedLabel")}</Label>
                      <div className="flex gap-4">
                        <Button variant={formData.priorPetitionsApproved === true ? "default" : "outline"} onClick={() => updateField("priorPetitionsApproved", true)} size="sm">{t("step2.approved")}</Button>
                        <Button variant={formData.priorPetitionsApproved === false ? "default" : "outline"} onClick={() => updateField("priorPetitionsApproved", false)} size="sm">{t("step2.denied")}</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ==================== STEP 3: BENEFICIARY INFO ==================== */}
              {currentStepKey === "beneficiary" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-teal-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step3.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step3.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("step3.countryOfBirthLabel")}</Label>
                      <Input placeholder={t("step3.countryOfBirthPlaceholder")} value={formData.beneficiaryCountryOfBirth} onChange={(e) => updateField("beneficiaryCountryOfBirth", e.target.value)} className="text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("step3.countryOfResidenceLabel")}</Label>
                      <Input placeholder={t("step3.countryOfResidencePlaceholder")} value={formData.beneficiaryCountryOfResidence} onChange={(e) => updateField("beneficiaryCountryOfResidence", e.target.value)} className="text-base" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step3.locationLabel")}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => updateField("beneficiaryLocation", "inside")} className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-teal-400 transition-all", formData.beneficiaryLocation === "inside" ? "border-teal-600 bg-teal-50" : "border-slate-200")}>
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <div className="text-left">
                          <div className="font-semibold">{t("step3.insideUS")}</div>
                          <div className="text-sm text-slate-500">{t("step3.insideUSDesc")}</div>
                        </div>
                      </button>
                      <button onClick={() => updateField("beneficiaryLocation", "outside")} className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-teal-400 transition-all", formData.beneficiaryLocation === "outside" ? "border-teal-600 bg-teal-50" : "border-slate-200")}>
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                          <div className="font-semibold">{t("step3.outsideUS")}</div>
                          <div className="text-sm text-slate-500">{t("step3.outsideUSDesc")}</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step3.priorEntriesLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.priorUSEntries === true ? "default" : "outline"} onClick={() => updateField("priorUSEntries", true)} className="w-32">{t("step3.yes")}</Button>
                      <Button variant={formData.priorUSEntries === false ? "default" : "outline"} onClick={() => updateField("priorUSEntries", false)} className="w-32">{t("step3.no")}</Button>
                    </div>
                  </div>

                  {formData.priorUSEntries && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-4 border-t">
                      <Label>{t("step3.lastEntryTypeLabel")}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["visa", "parole", "noInspection", "other"] as const).map((et) => {
                          const val = et === "noInspection" ? "no_inspection" : et
                          return (
                            <button key={et} onClick={() => updateField("lastEntryType", val)} className={cn("px-4 py-3 rounded-lg border text-sm font-medium transition-all", formData.lastEntryType === val ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400")}>
                              {t(`step3.${et}`)}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ==================== STEP 4: PROCESSING PATH ==================== */}
              {currentStepKey === "processing" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-indigo-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step4.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step4.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  {formData.beneficiaryLocation === "outside" ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                      <Globe className="w-6 h-6 text-blue-600" />
                      <p className="text-blue-800 font-medium">{t("step4.outsideNote")}</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <Label className="text-base">{t("step4.enteredLegallyLabel")}</Label>
                        <div className="flex gap-4">
                          <Button variant={formData.enteredLegally === true ? "default" : "outline"} onClick={() => updateField("enteredLegally", true)} className="w-32">{t("step4.yes")}</Button>
                          <Button variant={formData.enteredLegally === false ? "default" : "outline"} onClick={() => updateField("enteredLegally", false)} className="w-32">{t("step4.no")}</Button>
                        </div>
                      </div>

                      {formData.enteredLegally && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <div className="space-y-3">
                            <Label className="text-base">{t("step4.validStatusLabel")}</Label>
                            <div className="flex gap-4">
                              <Button variant={formData.hasValidStatus === true ? "default" : "outline"} onClick={() => updateField("hasValidStatus", true)} size="sm">{t("step4.yesValid")}</Button>
                              <Button variant={formData.hasValidStatus === false ? "default" : "outline"} onClick={() => updateField("hasValidStatus", false)} size="sm">{t("step4.noExpired")}</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formData.enteredLegally === false && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-base">{t("step4.protection245iLabel")}</Label>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-sm"><p>{t("step4.protection245iTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                            <div className="flex gap-4">
                              <Button variant={formData.has245iProtection === true ? "default" : "outline"} onClick={() => updateField("has245iProtection", true)} size="sm">{t("step4.yesProtection")}</Button>
                              <Button variant={formData.has245iProtection === false ? "default" : "outline"} onClick={() => updateField("has245iProtection", false)} size="sm">{t("step4.noProtection")}</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Live path result */}
                      {(formData.enteredLegally !== null) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-slate-50 border rounded-lg mt-4">
                          <span className="text-sm font-medium text-slate-500 uppercase">{t("step4.pathResult")}</span>
                          <div className="mt-1 text-lg font-bold text-slate-900">
                            {determineProcessingPath(formData) === "adjustment" ? t("step4.adjustment") : t("step4.consular")}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ==================== STEP 5: IMMIGRATION HISTORY ==================== */}
              {currentStepKey === "immigration" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-amber-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step5.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step5.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  {/* Unlawful Presence */}
                  <div className="space-y-3">
                    <Label className="text-base">{t("step5.unlawfulPresenceLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.unlawfulPresence === true ? "default" : "outline"} onClick={() => updateField("unlawfulPresence", true)} className="w-32">{t("step5.yes")}</Button>
                      <Button variant={formData.unlawfulPresence === false ? "default" : "outline"} onClick={() => updateField("unlawfulPresence", false)} className="w-32">{t("step5.no")}</Button>
                    </div>
                  </div>

                  {formData.unlawfulPresence && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-4 border-t">
                      <Label>{t("step5.unlawfulDurationLabel")}</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {([{ id: "under_180", key: "under180" }, { id: "180_to_1y", key: "180to1y" }, { id: "over_1y", key: "over1y" }] as const).map((opt) => (
                          <div key={opt.id} onClick={() => updateField("unlawfulDuration", opt.id)} className={cn("cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors", formData.unlawfulDuration === opt.id ? "bg-amber-100 border-amber-500 text-amber-900" : "hover:bg-slate-50")}>
                            {t(`step5.${opt.key}`)}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Yes/No questions */}
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: "priorDeportation", label: t("step5.deportationLabel"), state: formData.priorDeportation },
                      { id: "falseDocuments", label: t("step5.falseDocsLabel"), state: formData.falseDocuments },
                      { id: "immigrationViolations", label: t("step5.violationsLabel"), state: formData.immigrationViolations },
                      { id: "priorVisaDenials", label: t("step5.visaDenialsLabel"), state: formData.priorVisaDenials },
                    ].map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="font-medium">{q.label}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant={q.state === true ? "destructive" : "ghost"} onClick={() => updateField(q.id as keyof PetitionFormData, true)}>{t("step5.yes")}</Button>
                          <Button size="sm" variant={q.state === false ? "secondary" : "ghost"} onClick={() => updateField(q.id as keyof PetitionFormData, false)}>{t("step5.no")}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== STEP 6: CRIMINAL HISTORY ==================== */}
              {currentStepKey === "criminal" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gavel className="text-slate-700 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step6.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step6.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step6.arrestsLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.arrests === true ? "destructive" : "outline"} onClick={() => updateField("arrests", true)} className="w-32">{t("step6.yes")}</Button>
                      <Button variant={formData.arrests === false ? "secondary" : "outline"} onClick={() => updateField("arrests", false)} className="w-32">{t("step6.no")}</Button>
                    </div>
                  </div>

                  {formData.arrests && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t">
                      <div className="space-y-3">
                        <Label>{t("step6.convictionsLabel")}</Label>
                        <div className="flex gap-4">
                          <Button variant={formData.convictions === true ? "destructive" : "outline"} onClick={() => updateField("convictions", true)} size="sm">{t("step6.yesConvicted")}</Button>
                          <Button variant={formData.convictions === false ? "secondary" : "outline"} onClick={() => updateField("convictions", false)} size="sm">{t("step6.noConviction")}</Button>
                        </div>
                      </div>

                      <Label>{t("step6.offenseTypeLabel")}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { id: "drug", label: t("step6.drug"), icon: AlertTriangle },
                          { id: "theft_moral", label: t("step6.theftMoral"), icon: Ban },
                          { id: "violence", label: t("step6.violence"), icon: ShieldAlert },
                          { id: "dui", label: t("step6.dui"), icon: FileWarning },
                          { id: "fraud", label: t("step6.fraud"), icon: Siren },
                          { id: "other", label: t("step6.otherOffense"), icon: Info },
                        ] as const).map((o) => (
                          <div key={o.id} onClick={() => toggleArrayField("offenseTypes", o.id)} className={cn("cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all", formData.offenseTypes.includes(o.id as OffenseType) ? "bg-red-50 border-red-500 text-red-700" : "bg-white hover:bg-slate-50")}>
                            <o.icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{o.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ==================== STEP 7: FINANCIAL ==================== */}
              {currentStepKey === "financial" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="text-green-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step7.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-sm"><p>{t("step7.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("step7.incomeLabel")}</Label>
                      <Input type="number" min={0} placeholder={t("step7.incomePlaceholder")} value={formData.annualIncome ?? ""} onChange={(e) => updateField("annualIncome", e.target.value ? parseInt(e.target.value) : null)} className="text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("step7.dependentsLabel")}</Label>
                      <Input type="number" min={0} max={20} placeholder={t("step7.dependentsPlaceholder")} value={formData.dependents ?? ""} onChange={(e) => updateField("dependents", e.target.value ? parseInt(e.target.value) : null)} className="text-base" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step7.employedLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.employed === true ? "default" : "outline"} onClick={() => updateField("employed", true)} className="w-32">{t("step7.yes")}</Button>
                      <Button variant={formData.employed === false ? "default" : "outline"} onClick={() => updateField("employed", false)} className="w-32">{t("step7.no")}</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step7.coSponsorLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.coSponsorAvailable === true ? "default" : "outline"} onClick={() => updateField("coSponsorAvailable", true)} size="sm">{t("step7.yesAvailable")}</Button>
                      <Button variant={formData.coSponsorAvailable === false ? "default" : "outline"} onClick={() => updateField("coSponsorAvailable", false)} size="sm">{t("step7.noUnavailable")}</Button>
                    </div>
                  </div>

                  {/* Live financial check */}
                  {formData.annualIncome !== null && formData.dependents !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <div className={cn("p-4 rounded-lg border-2 flex items-center gap-3", checkFinancialEligibility(formData.annualIncome, formData.dependents) ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                          {checkFinancialEligibility(formData.annualIncome, formData.dependents) ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
                          <div>
                            <span className="text-sm font-medium text-slate-500 uppercase">{t("step7.povertyResult")}</span>
                            <div className="font-bold">{checkFinancialEligibility(formData.annualIncome, formData.dependents) ? t("step7.meetsGuideline") : t("step7.belowGuideline")}</div>
                          </div>
                        </div>
                      </TooltipTrigger><TooltipContent className="max-w-sm"><p>{t("step7.guidelineTooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ==================== STEP 8: MARRIAGE (conditional) ==================== */}
              {currentStepKey === "marriage" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="text-rose-600 w-6 h-6" />
                    <h2 className="text-2xl font-semibold">{t("step8.heading")}</h2>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-pointer" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>{t("step8.tooltip")}</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("step8.marriageDateLabel")}</Label>
                      <TypedDateInput
                        isoValue={formData.marriageDate}
                        onIsoChange={(value) => updateField("marriageDate", value)}
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("step8.marriageLocationLabel")}</Label>
                      <Input placeholder={t("step8.marriageLocationPlaceholder")} value={formData.marriageLocation} onChange={(e) => updateField("marriageLocation", e.target.value)} className="text-base" />
                    </div>
                  </div>

                  {formData.marriageDate && (() => {
                    const mDate = new Date(formData.marriageDate)
                    const diffYears = (new Date().getTime() - mDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                    return diffYears < 2 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {t("step8.recentMarriageNote")}
                      </div>
                    ) : null
                  })()}

                  <div className="space-y-3">
                    <Label className="text-base">{t("step8.priorMarriagesLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.priorMarriages === true ? "default" : "outline"} onClick={() => updateField("priorMarriages", true)} className="w-32">{t("step8.yes")}</Button>
                      <Button variant={formData.priorMarriages === false ? "default" : "outline"} onClick={() => updateField("priorMarriages", false)} className="w-32">{t("step8.no")}</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step8.childrenLabel")}</Label>
                    <div className="flex gap-4">
                      <Button variant={formData.childrenTogether === true ? "default" : "outline"} onClick={() => updateField("childrenTogether", true)} className="w-32">{t("step8.yesChildren")}</Button>
                      <Button variant={formData.childrenTogether === false ? "default" : "outline"} onClick={() => updateField("childrenTogether", false)} className="w-32">{t("step8.noChildren")}</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">{t("step8.evidenceLabel")}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {([
                        { id: "shared_lease", key: "sharedLease" },
                        { id: "joint_accounts", key: "jointAccounts" },
                        { id: "photos", key: "photos" },
                        { id: "travel", key: "travel" },
                        { id: "communications", key: "communications" },
                        { id: "affidavits", key: "affidavits" },
                      ] as const).map((ev) => (
                        <div key={ev.id} onClick={() => toggleArrayField("evidenceOfRelationship", ev.id)} className={cn("flex items-center p-3 rounded-lg border cursor-pointer transition-all", formData.evidenceOfRelationship.includes(ev.id as EvidenceType) ? "bg-rose-50 border-rose-400 shadow-sm" : "hover:bg-slate-50")}>
                          <Checkbox checked={formData.evidenceOfRelationship.includes(ev.id as EvidenceType)} className="mr-3" />
                          <span className="text-sm font-medium">{t(`step8.${ev.key}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== STEP 9: RESULTS ==================== */}
              {currentStepKey === "results" && analysis && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="text-indigo-600 w-8 h-8" />
                    <h2 className="text-3xl font-bold">{t("step9.heading")}</h2>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2 mb-6">
                    <Info className="w-5 h-5 shrink-0" />
                    <p><strong>{t("step9.disclaimer")}</strong></p>
                  </div>

                  {/* Top cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category */}
                    <Card className="p-4 bg-white shadow-sm border-l-4 border-l-emerald-500">
                      <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step9.familyCategory")}</h3>
                      <div className="mt-2">
                        {analysis.isEligible && analysis.category ? (
                          <>
                            <div className="font-bold text-slate-900 text-lg">{t(`categories.${analysis.category}`)}</div>
                            <div className="text-xs text-slate-500 mt-1">{analysis.isImmediateRelative ? t("step9.immediateRelative") : t("step9.preferenceCategory")}</div>
                          </>
                        ) : (
                          <div className="font-bold text-red-700">{t("step1.notEligible")}</div>
                        )}
                      </div>
                    </Card>

                    {/* Processing Path */}
                    <Card className="p-4 bg-white shadow-sm border-l-4 border-l-blue-500">
                      <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step9.processingPath")}</h3>
                      <div className="mt-2 text-lg font-bold text-blue-900">
                        {analysis.processingPath === "adjustment" ? t("step4.adjustment") : t("step4.consular")}
                      </div>
                    </Card>

                    {/* Priority */}
                    <Card className={cn("p-4 bg-white shadow-sm border-l-4", analysis.casePriority === "low" ? "border-l-green-500" : analysis.casePriority === "moderate" ? "border-l-yellow-500" : "border-l-red-500")}>
                      <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step9.casePriority")}</h3>
                      <div className={cn("mt-2 text-lg font-bold flex items-center gap-2", analysis.casePriority === "low" ? "text-green-700" : analysis.casePriority === "moderate" ? "text-yellow-700" : "text-red-700")}>
                        {t(`step9.priority${capFirst(analysis.casePriority)}`)}
                        {analysis.casePriority === "high" && <Siren className="w-5 h-5 animate-pulse" />}
                      </div>
                    </Card>
                  </div>

                  {/* Timeline */}
                  {analysis.category && (
                    <div className="p-4 bg-slate-50 border rounded-lg">
                      <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step9.estimatedTimeline")}</h3>
                      <div className="mt-1 text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-500" />
                        {t(`timelines.${analysis.category}`)}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {analysis.inadmissibilityFlags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">{t("step9.risksDetected")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.inadmissibilityFlags.map((flag, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">{t(flag)}</Badge>
                        ))}
                      </div>
                      {analysis.waiverFlag && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          <span className="font-medium">{t("step9.waiverNeeded")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial */}
                  <div className="p-4 rounded-lg border flex items-center gap-3">
                    {analysis.financialMeetsGuideline ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step9.financialStatus")}</h3>
                      <div className="font-bold">{analysis.financialMeetsGuideline ? t("step7.meetsGuideline") : t("step7.belowGuideline")}</div>
                    </div>
                  </div>

                  {/* Marriage Flags */}
                  {analysis.marriageFraudIndicators.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">{t("step9.marriageFlags")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.marriageFraudIndicators.map((ind, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 bg-amber-100 text-amber-800">{t(ind)}</Badge>
                        ))}
                      </div>
                      {analysis.marriageFraudRisk && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span className="font-medium">{t("step8.marriageFraudWarning")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strategy */}
                  {analysis.strategy.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">{t("step9.strategyTitle")}</h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-4 rounded-lg">
                        {analysis.strategy.map((s, i) => <li key={i}>{t(s)}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Attorney Alerts */}
                  {analysis.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">{t("step9.alertsTitle")}</h3>
                      <div className="space-y-2">
                        {analysis.alerts.map((a, i) => (
                          <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {t(a)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority Review Banner */}
                  {analysis.casePriority === "high" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <h4 className="font-bold text-red-900">{t("step9.priorityReview")}</h4>
                        <p className="text-sm text-red-700">{t("step9.priorityReviewDesc")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Contact Information */}
        {isResultsStep && !isSaved && (
          <Card className="p-5 mt-6 border-indigo-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{t("contact.title")}</h3>
              <p className="text-sm text-slate-500">{t("contact.subtitle")}</p>
            </div>
            {contactError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{contactError}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <Label htmlFor="contact-name">{t("contact.fullName")}</Label>
                <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={t("contact.fullNamePlaceholder")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="contact-email">{t("contact.email")}</Label>
                <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={t("contact.emailPlaceholder")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="contact-phone">{t("contact.phone")}</Label>
                <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder={t("contact.phonePlaceholder")} className="mt-1" />
              </div>
            </div>
          </Card>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {t("nav.back")}
          </Button>

          {!isResultsStep ? (
            <Button onClick={handleNext} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {isLastContentStep ? t("nav.analyzeCase") : t("nav.continue")} <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleSave}>
              <Save className="w-4 h-4" /> {t("nav.saveResults")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
