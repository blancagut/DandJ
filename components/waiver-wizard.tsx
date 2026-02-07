"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Plane,
  Stethoscope,
  DollarSign,
  Gavel,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  AlertCircle,
  FileCheck,
  FileText,
  ShieldAlert,
  Brain,
  GraduationCap,
  Globe,
  Siren,
  Ban,
  Fingerprint,
  Clock,
  AlertTriangle,
  FileWarning,
  Save,
  Flag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useWaiverTranslation } from "@/lib/waiver-i18n"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

// ==========================================
// TYPES
// ==========================================

type LocationType = "inside" | "outside"
type ApplicationContext = "green_data" | "temporary_visa" | "reentry" | "consular" | "adjustment"
type UnlawfulDuration = "under_180" | "180_to_1y" | "over_1y"
type OffenseType = "drug" | "theft_moral" | "violence" | "dui" | "other"
type RelativeType = "spouse" | "parent" | "child"
type HardshipType = "medical" | "financial" | "psychological" | "educational" | "country_conditions"

interface WaiverFormData {
  // Step 1: Location & Context
  location: LocationType | ""
  applicationContext: ApplicationContext | ""

  // Step 2: Unlawful Presence
  hasOverstayed: boolean | null
  unlawfulDuration: UnlawfulDuration | ""
  departedAfterUnlawful: boolean | null

  // Step 3: Removal History
  removalHistory: boolean | null // Ever deported/removed
  voluntaryDeparture: boolean | null
  activeRemovalOrder: boolean | null
  expeditedRemoval: boolean | null
  lastRemovalDate: string

  // Step 4: Fraud
  falseStatements: boolean | null
  falseDocuments: boolean | null
  falseIdentity: boolean | null
  priorVisaDenialFraud: boolean | null

  // Step 5: Criminal
  arrestHistory: boolean | null
  convictions: boolean | null
  offenseCategories: OffenseType[]

  // Step 6: Relatives & Hardship
  relatives: RelativeType[]
  hardships: HardshipType[]
}

const initialFormData: WaiverFormData = {
  location: "",
  applicationContext: "",
  hasOverstayed: null,
  unlawfulDuration: "",
  departedAfterUnlawful: null,
  removalHistory: null,
  voluntaryDeparture: null,
  activeRemovalOrder: null,
  expeditedRemoval: null,
  lastRemovalDate: "",
  falseStatements: null,
  falseDocuments: null,
  falseIdentity: null,
  priorVisaDenialFraud: null,
  arrestHistory: null,
  convictions: null,
  offenseCategories: [],
  relatives: [],
  hardships: [],
}

const steps = [
  { id: 1, title: "Location", icon: MapPin, description: "Current Status" },
  { id: 2, title: "Presence", icon: Clock, description: "Stay History" },
  { id: 3, title: "Removals", icon: Ban, description: "Deportations" },
  { id: 4, title: "Verify", icon: FileWarning, description: "Documents" },
  { id: 5, title: "History", icon: Gavel, description: "Legal Record" },
  { id: 6, title: "Hardship", icon: Heart, description: "Family/Impact" },
  { id: 7, title: "Analysis", icon: Brain, description: "Results" },
]

// ==========================================
// LOGIC ENGINE
// ==========================================

interface WaiverAnalysis {
  recommendations: string[]
  probability: "High" | "Moderate" | "Attorney Review Required"
  risk: "Low" | "Moderate" | "High"
  guidance: string[]
  triggers: string[]
  isPriority: boolean
}

function analyzeWaiverCase(data: WaiverFormData): WaiverAnalysis {
  const triggers: string[] = []
  const recommendations: string[] = []
  const guidance: string[] = []
  let riskLevel: "Low" | "Moderate" | "High" = "Low"
  let probability: "High" | "Moderate" | "Attorney Review Required" = "High"
  let isPriority = false

  // Step 2: Unlawful Presence
  if (data.hasOverstayed) {
    if (data.unlawfulDuration === "180_to_1y") {
        triggers.push("3-Year Bar Potential")
    } else if (data.unlawfulDuration === "over_1y") {
        triggers.push("10-Year Bar Potential")
    }

    if (data.location === "inside" && data.applicationContext === "green_data" && data.hasOverstayed) {
         if (data.departedAfterUnlawful === false) {
             recommendations.push("I-601A Provisional Waiver")
         } else {
             recommendations.push("I-601 Unlawful Presence Waiver")
         }
    } else if (data.hasOverstayed) {
        recommendations.push("I-601 Unlawful Presence Waiver")
    }
  }

  // Step 3: Removal Logic
  if (data.removalHistory || data.activeRemovalOrder || data.expeditedRemoval) {
      if (data.removalHistory) triggers.push("Prior Removal/Deportation")
      if (data.activeRemovalOrder) triggers.push("Active Removal Order")
      if (data.expeditedRemoval) triggers.push("Expedited Removal")
      
      recommendations.push("I-212 Permission to Reapply")
      riskLevel = "High"
      probability = "Attorney Review Required"
  }

  // Step 4: Fraud Logic
  if (data.falseStatements || data.falseDocuments || data.falseIdentity || data.priorVisaDenialFraud) {
      triggers.push("Fraud/Misrepresentation")
      recommendations.push("I-601 Fraud Waiver")
      riskLevel = riskLevel === "High" ? "High" : "Moderate"
      
      if (data.removalHistory || data.activeRemovalOrder) {
          isPriority = true; // Fraud + Removal
      }
  }

  // Step 5: Criminal Logic
  if (data.arrestHistory || data.convictions) {
      triggers.push("Criminal Inadmissibility")
      
      const offenses = Array.isArray(data.offenseCategories) ? data.offenseCategories : []
      if (offenses.includes("drug")) {
          triggers.push("Controlled Substance")
          isPriority = true
          riskLevel = "High"
          recommendations.push("Complex Criminal Waiver Analysis Required")
          probability = "Attorney Review Required"
      } else if (offenses.includes("violence")) {
           triggers.push("Violence/Assault")
           riskLevel = "High"
           probability = "Attorney Review Required"
           recommendations.push("I-601 Criminal Waiver")
      } else {
          recommendations.push("I-601 Criminal Waiver")
          if (data.applicationContext === "temporary_visa") {
              recommendations.push("I-192 Nonimmigrant Waiver")
          }
      }
  }

  // Multi-Ground Escalation
  if (triggers.length >= 2) {
      triggers.push("multi_ground_inadmissibility")
      probability = "Attorney Review Required"
      guidance.push("Multiple inadmissibility grounds detected. Multi-waiver strategy required.")
  }

  // Priority Escalation Layer
  if (data.arrestHistory && (data.falseStatements || data.falseDocuments)) {
      isPriority = true // Criminal + Fraud
  }

  // Decision Logic for Outcomes
  if (recommendations.length > 1) {
       // handled by multi-ground above mostly, but adding specific guidance
       if (!guidance.includes("Multi-waiver strategy required.")) guidance.push("Multi-waiver strategy likely required.")
  } else if (recommendations.length === 0) {
      guidance.push("No obvious inadmissibility triggers detected based on input.")
      probability = "High" // Eligibility for standard path
  }

  if (isPriority) {
     probability = "Attorney Review Required"
     riskLevel = "High"
     guidance.push("Priority Attorney Review Recommended due to complex factors combination.")
  }

  // Strict Rule: No I-601A if Active Removal Order
  if (data.activeRemovalOrder) {
      const idx = recommendations.indexOf("I-601A Provisional Waiver");
      if (idx > -1) {
          recommendations.splice(idx, 1);
          // If not already recommended, add I-601
          if (!recommendations.includes("I-601 Unlawful Presence Waiver")) {
             recommendations.push("I-601 Unlawful Presence Waiver (Post-Departure)");
          }
          guidance.push("I-601A is generally barred with an active removal order. Must resolve proceedings or depart.");
      }
  }

  return {
    recommendations: [...new Set(recommendations)],
    probability,
    risk: riskLevel,
    guidance: [...new Set(guidance)],
    triggers: [...new Set(triggers)],
    isPriority
  }
}


// ==========================================
// COMPONENT
// ==========================================

export function WaiverWizard() {
  const { t, ready } = useWaiverTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WaiverFormData>(initialFormData)
  const [direction, setDirection] = useState(0)
  const [analysis, setAnalysis] = useState<WaiverAnalysis | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  
  const [isLoaded, setIsLoaded] = useState(false)

  // Step keys for translation lookup
  const stepKeys = ["location", "presence", "removals", "verify", "history", "hardship", "analysis"]
  
  // Data persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("waiver-wizard-data")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Merge with defaults to prevent undefined array fields from stale localStorage
                setFormData({ ...initialFormData, ...parsed,
                  offenseCategories: Array.isArray(parsed.offenseCategories) ? parsed.offenseCategories : [],
                  relatives: Array.isArray(parsed.relatives) ? parsed.relatives : [],
                  hardships: Array.isArray(parsed.hardships) ? parsed.hardships : [],
                })
            } catch (e) {
                console.error("Failed to load saved waiver data", e)
            }
        }
        setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
        localStorage.setItem("waiver-wizard-data", JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  const validateStep = (step: number) => {
    setValidationError(null)
    switch (step) {
        case 1:
            if (!formData.location || !formData.applicationContext) return t("validation.locationRequired")
            break
        case 2:
            if (formData.hasOverstayed === null) return t("validation.overstayRequired")
            if (formData.hasOverstayed && (!formData.unlawfulDuration || formData.departedAfterUnlawful === null)) return t("validation.overstayDetailsRequired")
            break
        case 3:
            if (formData.removalHistory === null || formData.voluntaryDeparture === null || formData.activeRemovalOrder === null || formData.expeditedRemoval === null) return t("validation.removalRequired")
            break
        case 4:
            // Optional checkboxes - logic assumes unchecked is false/no, which is valid.
            // But strict requirement says "Graceful handling of undefined answers".
            // null is used for "not answered yet", but checkboxes default to false in UI usually if modeled that way.
            // In our Type, they are boolean | null.
            // We should ensure they are not null?
            // Actually, for checkboxes, typically they start as null or false.
            // If we want explicit acknowledgement, we might need Yes/No buttons.
            // But based on UI in code, they are Checkboxes. 
            // If the user skips checking, it implies "No". 
            // So we can assume valid.
            break
        case 5: 
            if (formData.arrestHistory === null) return t("validation.criminalRequired")
            if (formData.arrestHistory && formData.offenseCategories.length === 0) return t("validation.offenseCategoryRequired")
            break
        case 6:
            // Optional
            break
    }
    return null
  }
  
  const handleSave = () => {
    // Basic verification of completed analysis
    if (!analysis) return

    try {
      const saveData = {
          waiverScreening: {
              locationContext: formData.location,
              contextType: formData.applicationContext,
              unlawfulPresence: {
                  overstayed: formData.hasOverstayed,
                  duration: formData.unlawfulDuration,
                  departed: formData.departedAfterUnlawful
              },
              removalHistory: {
                  removed: formData.removalHistory,
                  voluntary: formData.voluntaryDeparture,
                  activeOrder: formData.activeRemovalOrder,
                  expedited: formData.expeditedRemoval
              },
              fraudIndicators: {
                  statements: formData.falseStatements,
                  documents: formData.falseDocuments,
                  identity: formData.falseIdentity,
                  priorDenial: formData.priorVisaDenialFraud
              },
              criminalIndicators: {
                  arrests: formData.arrestHistory,
                  convictions: formData.convictions,
                  offenses: formData.offenseCategories
              },
              hardshipFactors: {
                  relatives: formData.relatives,
                  types: formData.hardships
              },
              decisionEngineOutput: {
                  recommendedWaivers: analysis.recommendations,
                  probabilityLevel: analysis.probability,
                  riskLevel: analysis.risk,
                  flags: analysis.triggers,
                  nextStepGuidance: analysis.guidance
              },
              timestamp: new Date().toISOString()
          }
      }

      console.log("Hypothetical Save to CRM:", saveData)
      // Clear localStorage after successful save
      localStorage.removeItem("waiver-wizard-data")
      setIsSaved(true)
    } catch (e) {
      console.error("Waiver save failed:", e)
    }
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
        setValidationError(error)
        return
    }

    if (currentStep < 7) {
      if (currentStep === 6) {
          // Run analysis before moving to 7
          try {
            const result = analyzeWaiverCase(formData)
            setAnalysis(result)
          } catch (e) {
            console.error("Waiver analysis failed:", e)
            setValidationError(t("validation.analysisError") || "Analysis failed. Please review your answers and try again.")
            return
          }
      }
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const updateField = (field: keyof WaiverFormData, value: WaiverFormData[keyof WaiverFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field: 'offenseCategories' | 'relatives' | 'hardships', value: string) => {
    setFormData(prev => {
        const current = prev[field] as string[]
        const exists = current.includes(value)
        if (exists) {
            return { ...prev, [field]: current.filter(item => item !== value) }
        } else {
            return { ...prev, [field]: [...current, value] }
        }
    })
  }

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
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
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
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
                        <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
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
                            )}>{t(`steps.${stepKeys[step.id - 1]}.title`)}</span>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 md:p-8 min-h-100 relative overflow-hidden shadow-lg border-t-4 border-t-blue-600">
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
                {/* STEP 1: LOCATION & CONTEXT */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="text-blue-600 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step1.heading")}</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <Label className="text-base">{t("step1.locationQuestion")}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => updateField('location', 'inside')}
                                    className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-blue-400 transition-all", formData.location === 'inside' ? "border-blue-600 bg-blue-50" : "border-slate-200")}
                                >
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <div className="text-left">
                                        <div className="font-semibold">{t("step1.insideUS")}</div>
                                        <div className="text-sm text-slate-500">{t("step1.insideUSDesc")}</div>
                                    </div>
                                </button>
                                <button
                                     onClick={() => updateField('location', 'outside')}
                                     className={cn("p-4 border-2 rounded-xl flex items-center gap-3 hover:border-blue-400 transition-all", formData.location === 'outside' ? "border-blue-600 bg-blue-50" : "border-slate-200")}
                                >
                                    <Globe className="w-5 h-5 text-green-500" />
                                    <div className="text-left">
                                        <div className="font-semibold">{t("step1.outsideUS")}</div>
                                        <div className="text-sm text-slate-500">{t("step1.outsideUSDesc")}</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-base">{t("step1.applyingFor")}</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>{t("step1.applyingForTooltip")}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { id: 'green_data', label: t("step1.greenCard"), icon: FileCheck },
                                    { id: 'temporary_visa', label: t("step1.temporaryVisa"), icon: Plane },
                                    { id: 'reentry', label: t("step1.reentry"), icon: CheckCircle2 },
                                    { id: 'consular', label: t("step1.consularProcessing"), icon: Globe },
                                    { id: 'adjustment', label: t("step1.adjustmentOfStatus"), icon: FileText },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateField('applicationContext', opt.id)}
                                        className={cn("px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all", 
                                            formData.applicationContext === opt.id ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-400"
                                        )}
                                    >
                                        <opt.icon className="w-4 h-4" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: UNLAWFUL PRESENCE */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step2.heading")}</h2>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>{t("step2.tooltip")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base">{t("step2.overstayQuestion")}</Label>
                            <div className="flex gap-4">
                                <Button 
                                    variant={formData.hasOverstayed === true ? "default" : "outline"} 
                                    onClick={() => updateField('hasOverstayed', true)}
                                    className="w-32"
                                >{t("step2.yes")}</Button>
                                <Button 
                                    variant={formData.hasOverstayed === false ? "default" : "outline"} 
                                    onClick={() => updateField('hasOverstayed', false)}
                                    className="w-32"
                                >{t("step2.no")}</Button>
                            </div>
                        </div>

                        {formData.hasOverstayed && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t">
                                <div className="space-y-3">
                                    <Label>{t("step2.durationLabel")}</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'under_180', label: t("step2.under180") },
                                            { id: '180_to_1y', label: t("step2.180to1y") },
                                            { id: 'over_1y', label: t("step2.over1y") }
                                        ].map(opt => (
                                            <div 
                                                key={opt.id}
                                                onClick={() => updateField('unlawfulDuration', opt.id)}
                                                className={cn("cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors",
                                                    formData.unlawfulDuration === opt.id ? "bg-amber-100 border-amber-500 text-amber-900" : "hover:bg-slate-50"
                                                )}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>{t("step2.departedQuestion")}</Label>
                                     <div className="flex gap-4">
                                        <Button 
                                            variant={formData.departedAfterUnlawful === true ? "default" : "outline"} 
                                            onClick={() => updateField('departedAfterUnlawful', true)}
                                            size="sm"
                                        >{t("step2.yesLeft")}</Button>
                                        <Button 
                                            variant={formData.departedAfterUnlawful === false ? "default" : "outline"} 
                                            onClick={() => updateField('departedAfterUnlawful', false)}
                                            size="sm"
                                        >{t("step2.noStayed")}</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* STEP 3: REMOVAL */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <Ban className="text-red-600 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step3.heading")}</h2>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>{t("step3.tooltip")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'removalHistory', label: t("step3.removalHistory"), state: formData.removalHistory },
                                { id: 'voluntaryDeparture', label: t("step3.voluntaryDeparture"), state: formData.voluntaryDeparture },
                                { id: 'activeRemovalOrder', label: t("step3.activeRemovalOrder"), state: formData.activeRemovalOrder },
                                { id: 'expeditedRemoval', label: t("step3.expeditedRemoval"), state: formData.expeditedRemoval },
                            ].map(q => (
                                <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <span className="font-medium">{q.label}</span>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm"
                                            variant={q.state === true ? "destructive" : "ghost"}
                                            onClick={() => updateField(q.id as keyof WaiverFormData, true)}
                                        >{t("step3.yes")}</Button>
                                         <Button 
                                            size="sm"
                                            variant={q.state === false ? "secondary" : "ghost"}
                                            onClick={() => updateField(q.id as keyof WaiverFormData, false)}
                                        >{t("step3.no")}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {formData.removalHistory && (
                             <div className="mt-4">
                                 <Label>{t("step3.lastRemovalDate")}</Label>
                                 <Input 
                                    type="date" 
                                    className="mt-2 text-base"
                                    value={formData.lastRemovalDate}
                                    onChange={(e) => updateField('lastRemovalDate', e.target.value)}
                                 />
                             </div>
                        )}
                    </div>
                )}

                {/* STEP 4: FRAUD */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <Fingerprint className="text-purple-600 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step4.heading")}</h2>
                         </div>

                         <div className="space-y-4">
                             <p className="text-slate-600">{t("step4.subtitle")}</p>
                             <div className="grid grid-cols-1 gap-3">
                                 {[
                                     { id: 'falseStatements', label: t("step4.falseStatements") },
                                     { id: 'falseDocuments', label: t("step4.falseDocuments") },
                                     { id: 'falseIdentity', label: t("step4.falseIdentity") },
                                     { id: 'priorVisaDenialFraud', label: t("step4.priorVisaDenialFraud") }
                                 ].map(item => (
                                     <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-md">
                                         <Checkbox 
                                            id={item.id}
                                            checked={formData[item.id as keyof WaiverFormData] as boolean}
                                            onCheckedChange={(checked) => updateField(item.id as keyof WaiverFormData, checked)}
                                         />
                                         <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-2">
                                             {item.label}
                                         </label>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                )}

                {/* STEP 5: CRIMINAL */}
                {currentStep === 5 && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Siren className="text-slate-700 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step5.heading")}</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <Label className="text-lg">{t("step5.arrestQuestion")}</Label>
                                <div className="flex gap-4">
                                    <Button 
                                        variant={formData.arrestHistory ? "destructive" : "secondary"}
                                        onClick={() => updateField('arrestHistory', !formData.arrestHistory)}
                                        className="w-full h-12 text-lg"
                                    >
                                        {formData.arrestHistory ? t("step5.yesHistory") : t("step5.noClean")}
                                    </Button>
                                </div>
                            </div>

                            {formData.arrestHistory && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t">
                                    <Label>{t("step5.offenseCategoryLabel")}</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'drug', label: t("step5.drug"), icon: AlertTriangle },
                                            { id: 'theft_moral', label: t("step5.theftMoral"), icon: Ban },
                                            { id: 'violence', label: t("step5.violence"), icon: ShieldAlert },
                                            { id: 'dui', label: t("step5.dui"), icon: FileWarning },
                                            { id: 'other', label: t("step5.other"), icon: Info }
                                        ].map(offense => (
                                            <div 
                                                key={offense.id}
                                                onClick={() => toggleArrayField('offenseCategories', offense.id)}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all",
                                                    formData.offenseCategories.includes(offense.id as OffenseType) 
                                                        ? "bg-red-50 border-red-500 text-red-700" 
                                                        : "bg-white hover:bg-slate-50"
                                                )}
                                            >
                                                <offense.icon className="w-6 h-6" />
                                                <span className="text-sm font-medium">{offense.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                     </div>
                )}

                {/* STEP 6: HARDSHIP */}
                {currentStep === 6 && (
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <Heart className="text-rose-600 w-6 h-6" />
                            <h2 className="text-2xl font-semibold">{t("step6.heading")}</h2>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>{t("step6.tooltip")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                         <div className="space-y-6">
                             <div className="space-y-3">
                                <Label>{t("step6.relativesQuestion")}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {(['spouse', 'parent', 'child'] as const).map(rel => (
                                        <Badge 
                                            key={rel}
                                            variant="outline"
                                            className={cn(
                                                "cursor-pointer px-4 py-2 text-sm uppercase tracking-wide transition-colors",
                                                formData.relatives.includes(rel as RelativeType)
                                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                                : "hover:bg-slate-100"
                                            )}
                                            onClick={() => toggleArrayField('relatives', rel as string)}
                                        >
                                            {t(`step6.${rel}`)}
                                        </Badge>
                                    ))}
                                </div>
                             </div>

                             <div className="space-y-3">
                                 <Label>{t("step6.hardshipLabel")}</Label>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     {[
                                         { id: 'medical', label: t("step6.medical"), icon: Stethoscope },
                                         { id: 'financial', label: t("step6.financial"), icon: DollarSign },
                                         { id: 'psychological', label: t("step6.psychological"), icon: Brain },
                                         { id: 'educational', label: t("step6.educational"), icon: GraduationCap },
                                         { id: 'country_conditions', label: t("step6.countryConditions"), icon: Flag }
                                     ].map(h => (
                                         <div 
                                            key={h.id}
                                            onClick={() => toggleArrayField('hardships', h.id)}
                                            className={cn(
                                                "flex items-center p-3 rounded-lg border cursor-pointer transition-all",
                                                formData.hardships.includes(h.id as HardshipType)
                                                ? "bg-blue-50 border-blue-400 shadow-sm"
                                                : "hover:bg-slate-50"
                                            )}
                                         >
                                             <Checkbox 
                                                checked={formData.hardships.includes(h.id as HardshipType)} 
                                                className="mr-3" 
                                             />
                                             <h.icon className="w-4 h-4 mr-2 text-slate-500" />
                                             <span className="text-sm font-medium">{h.label}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>
                )}
                
                {/* STEP 7: RESULTS (ANALYSIS) */}
                {currentStep === 7 && analysis && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="text-indigo-600 w-8 h-8" />
                            <h2 className="text-3xl font-bold">{t("step7.heading")}</h2>
                        </div>
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2 mb-6">
                            <Info className="w-5 h-5 shrink-0" />
                            <p><strong>{t("step7.disclaimer")}</strong></p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4 bg-white shadow-sm border-l-4 border-l-green-500">
                                <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step7.predictedWaivers")}</h3>
                                <div className="mt-2 space-y-1">
                                    {analysis.recommendations.length > 0 ? analysis.recommendations.map((rec, i) => (
                                        <div key={i} className="font-bold text-slate-900 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            {rec}
                                        </div>
                                    )) : (
                                        <div className="text-slate-900 font-medium">{t("step7.noneLikelyRequired")}</div>
                                    )}
                                </div>
                            </Card>
                            
                            <Card className="p-4 bg-white shadow-sm border-l-4 border-l-blue-500">
                                <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step7.probability")}</h3>
                                <div className="mt-2 text-lg font-bold text-blue-900 flex items-center gap-2">
                                    {analysis.probability}
                                    {analysis.probability === 'High' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                                </div>
                            </Card>

                            <Card className={cn("p-4 bg-white shadow-sm border-l-4", 
                                analysis.risk === 'Low' ? "border-l-green-500" : analysis.risk === 'Moderate' ? "border-l-yellow-500" : "border-l-red-500"
                            )}>
                                <h3 className="text-sm font-medium text-slate-500 uppercase">{t("step7.complexityRisk")}</h3>
                                <div className={cn("mt-2 text-lg font-bold flex items-center gap-2",
                                    analysis.risk === 'Low' ? "text-green-700" : analysis.risk === 'Moderate' ? "text-yellow-700" : "text-red-700"
                                )}>
                                    {analysis.risk}
                                    {analysis.risk === 'High' && <Siren className="w-5 h-5 animate-pulse" />}
                                </div>
                            </Card>
                        </div>

                        {analysis.triggers.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900">{t("step7.detectedFlags")}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.triggers.map((trigger, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">
                                            {trigger}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {analysis.guidance.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900">{t("step7.guidanceTitle")}</h3>
                                <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-4 rounded-lg">
                                    {analysis.guidance.map((g, i) => (
                                        <li key={i}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {analysis.isPriority && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <div>
                                    <h4 className="font-bold text-red-900">{t("step7.priorityReview")}</h4>
                                    <p className="text-sm text-red-700">{t("step7.priorityReviewDesc")}</p>
                                </div>
                            </div>
                        )}

                    </div>
                )}

             </motion.div>
           </AnimatePresence>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-between items-center">
             <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
             >
                <ChevronLeft className="w-4 h-4" /> {t("nav.back")}
             </Button>

            {currentStep < 7 ? (
                 <Button
                    onClick={handleNext}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                 >
                    {currentStep === 6 ? t("nav.analyzeCase") : t("nav.continue")} <ChevronRight className="w-4 h-4" />
                 </Button>
            ) : (
                <Button 
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleSave}
                >
                    <Save className="w-4 h-4" /> {t("nav.saveResults")}
                </Button>
            )}
        </div>

      </div>
    </div>
  )
}
