"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
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
  Wrench, Hotel, Fish, Leaf
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ============================================
// CASE TYPES CONFIG
// ============================================
const caseTypes = [
  {
    id: "h2b-work-visa",
    icon: Briefcase,
    title: "H-2B Work Visa",
    description: "Temporary work visas for seasonal jobs",
    color: "bg-blue-500",
  },
  {
    id: "family-petition",
    icon: Heart,
    title: "Family Petitions",
    description: "Reunite with your loved ones",
    color: "bg-pink-500",
  },
  {
    id: "immigration-greencard",
    icon: FileCheck,
    title: "Green Card",
    description: "Permanent residence applications",
    color: "bg-green-500",
  },
  {
    id: "immigration-citizenship",
    icon: Globe,
    title: "Citizenship",
    description: "Naturalization process",
    color: "bg-purple-500",
  },
  {
    id: "immigration-deportation",
    icon: Shield,
    title: "Deportation Defense",
    description: "Protection from removal",
    color: "bg-red-500",
  },
  {
    id: "immigration-asylum",
    icon: Home,
    title: "Asylum",
    description: "Protection for those fleeing persecution",
    color: "bg-amber-500",
  },
  {
    id: "criminal-defense",
    icon: Gavel,
    title: "Criminal Defense",
    description: "Defense against criminal charges",
    color: "bg-slate-600",
  },
  {
    id: "business-immigration",
    icon: Building2,
    title: "Business Immigration",
    description: "Investor & business visas",
    color: "bg-indigo-500",
  },
]

// ============================================
// SUB-OPTIONS CONFIG
// ============================================

// H2B Industries
const h2bIndustries = [
  { id: "agriculture", label: "Agriculture", icon: Leaf },
  { id: "landscaping", label: "Landscaping", icon: TreePine },
  { id: "construction", label: "Construction", icon: HardHat },
  { id: "hospitality", label: "Hospitality", icon: Hotel },
  { id: "food-processing", label: "Food Processing", icon: Utensils },
  { id: "seafood", label: "Seafood Processing", icon: Fish },
  { id: "warehouse", label: "Warehouse", icon: Warehouse },
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "housekeeping", label: "Housekeeping", icon: Home },
]

// Family Petition Types
const familyPetitionTypes = [
  { id: "spouse", label: "Spouse", icon: Heart },
  { id: "parent", label: "Parent", icon: Users },
  { id: "child", label: "Child", icon: Baby },
  { id: "sibling", label: "Sibling", icon: UserPlus },
  { id: "fiance", label: "Fiance(e)", icon: Heart },
]

// Green Card Categories
const greenCardCategories = [
  { id: "family-based", label: "Family-Based", icon: Heart },
  { id: "employment-based", label: "Employment-Based", icon: Briefcase },
  { id: "diversity-lottery", label: "Diversity Lottery", icon: Globe },
  { id: "vawa", label: "VAWA", icon: Shield },
  { id: "special-immigrant", label: "Special Immigrant", icon: FileCheck },
]

// Visa Types (excluding tourist)
const visaTypes = [
  { id: "student-f1", label: "Student (F-1)", icon: GraduationCap },
  { id: "work-h1b", label: "Work (H-1B)", icon: Briefcase },
  { id: "investor-e2", label: "Investor (E-2)", icon: DollarSign },
  { id: "intracompany-l1", label: "Intracompany (L-1)", icon: Building2 },
  { id: "religious-r1", label: "Religious (R-1)", icon: HandHelping },
  { id: "extraordinary-o1", label: "Extraordinary (O-1)", icon: TrendingUp },
]

// Urgency Levels
const urgencyLevels = [
  { id: "immediate", label: "Immediate", sublabel: "Within 24 hours", icon: AlertCircle, color: "bg-red-500 border-red-500" },
  { id: "urgent", label: "Urgent", sublabel: "Within 1 week", icon: Clock, color: "bg-orange-500 border-orange-500" },
  { id: "normal", label: "Normal", sublabel: "Within 2 weeks", icon: Calendar, color: "bg-blue-500 border-blue-500" },
  { id: "planning", label: "Planning", sublabel: "No rush", icon: TrendingUp, color: "bg-gray-500 border-gray-500" },
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
  { id: "other", label: "Other" },
]

// Document Types
const documentTypes = [
  { id: "passport", label: "Passport", required: true },
  { id: "visa", label: "Current Visa", required: false },
  { id: "i94", label: "I-94", required: false },
  { id: "birth-certificate", label: "Birth Certificate", required: false },
  { id: "marriage-certificate", label: "Marriage Certificate", required: false },
  { id: "police-record", label: "Police Record", required: false },
  { id: "employment-letter", label: "Employment Letter", required: false },
  { id: "tax-returns", label: "Tax Returns", required: false },
  { id: "court-documents", label: "Court Documents", required: false },
  { id: "medical-records", label: "Medical Records", required: false },
]

// Contact Methods
const contactMethods = [
  { id: "phone", label: "Phone Call", icon: Phone },
  { id: "email", label: "Email", icon: Mail },
  { id: "video", label: "Video Call", icon: Globe },
  { id: "in-person", label: "In-Person", icon: MapPin },
]

// Consultation Times
const consultationTimes = [
  { id: "morning", label: "Morning", sublabel: "8 AM - 12 PM" },
  { id: "afternoon", label: "Afternoon", sublabel: "12 PM - 5 PM" },
  { id: "evening", label: "Evening", sublabel: "5 PM - 7 PM" },
  { id: "weekend", label: "Weekend", sublabel: "Sat/Sun" },
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
        return { title: "Select Industry", options: h2bIndustries }
      case "family-petition":
        return { title: "Petition Type", options: familyPetitionTypes }
      case "immigration-greencard":
        return { title: "Green Card Category", options: greenCardCategories }
      case "business-immigration":
        return { title: "Visa Type", options: visaTypes }
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
        setSubmitError("Error al enviar. Por favor intente de nuevo.")
        return
      }

      setSubmitSuccess(true)
    } catch (err) {
      console.error("Submit error:", err)
      setSubmitError("Error de conexion. Por favor intente de nuevo.")
    } finally {
      setIsSubmitting(false)
    }

    setTimeout(() => {
      form.reset()
      setUploadedFiles([])
      setSelectedDocTypes([])
      setSubmitSuccess(false)
    }, 5000)
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
              Consultation Request Submitted!
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Thank you for choosing Diaz & Johnson. Our attorneys will review your case and contact you within 24 hours.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return to Home
            </Button>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Case Evaluation</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Free Consultation Request
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tell us about your case and we will help you find the best solution. All information is confidential.
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
                      What do you need help with?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Select the type of case that best describes your situation</p>
                    
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
                                      {caseType.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {caseType.description}
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
                          <Label className="text-sm font-medium mb-3 block">{subOptions.title}</Label>
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
                                        {option.label}
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
                      How urgent is your case?
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
                                      {level.label}
                                    </h4>
                                    <p className={cn("text-xs mt-1", isSelected ? "text-white/80" : "text-muted-foreground")}>
                                      {level.sublabel}
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
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
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
                            <FormLabel>Last Name *</FormLabel>
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
                            <FormLabel>Email Address *</FormLabel>
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
                            <FormLabel>Phone Number *</FormLabel>
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
                            <FormLabel>Date of Birth</FormLabel>
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
                            <FormLabel>Nationality *</FormLabel>
                            <FormControl>
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {nationalities.map((nat) => {
                                    const isSelected = field.value === nat.label
                                    const isOther = nat.id === "other"
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
                                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                                          isSelected
                                            ? "bg-accent text-accent-foreground shadow-sm"
                                            : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                                        )}
                                      >
                                        {nat.label}
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
                                        placeholder="Enter your nationality"
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
                            <FormLabel>Current Location *</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State, Country" {...field} className="h-11" />
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
                      Case Details
                    </h3>
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="caseDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Describe Your Situation *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide details about your case, including relevant dates, circumstances, and what outcome you are hoping for..."
                                rows={6}
                                {...field}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Be as detailed as possible to help us understand your situation.
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
                              <FormLabel>Previous Attorney (if any)</FormLabel>
                              <FormControl>
                                <Input placeholder="Attorney name or firm" {...field} className="h-11" />
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
                              <FormLabel>Upcoming Court Date</FormLabel>
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
                      Documents
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select which documents you have available and upload them if possible
                    </p>

                    {/* Document Type Pills */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-3 block">Available Documents</Label>
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
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1",
                                isSelected
                                  ? "bg-green-500 text-white shadow-sm"
                                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {doc.label}
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
                        <p className="text-foreground font-medium mb-1">Click to upload files</p>
                        <p className="text-sm text-muted-foreground">PDF, JPG, PNG, DOC (Max 10MB)</p>
                      </label>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label>Uploaded Files ({uploadedFiles.length})</Label>
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
                      Contact Preferences
                    </h3>

                    {/* Contact Method */}
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method *</FormLabel>
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
                                        {method.label}
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
                          <FormLabel>Preferred Time</FormLabel>
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
                                    {time.label}
                                    <span className="text-xs opacity-70 ml-1">({time.sublabel})</span>
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
                            <FormLabel>I agree to the terms and conditions *</FormLabel>
                            <FormDescription>
                              Your information is protected by attorney-client privilege. We will only use it to evaluate and respond to your consultation request.
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
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Submit Consultation Request
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
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">What Happens Next?</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Case Review", desc: "Our attorneys review your information within 24 hours." },
                  { step: 2, title: "Initial Contact", desc: "We will reach out to schedule your consultation." },
                  { step: 3, title: "Consultation", desc: "Meet with an attorney to discuss your case in detail." },
                  { step: 4, title: "Action Plan", desc: "Receive a clear strategy and next steps." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-primary text-primary-foreground">
              <h3 className="font-serif text-xl font-bold mb-4">Need Immediate Help?</h3>
              <div className="space-y-4">
                <a href="tel:+13057280029" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Call us now</p>
                    <p className="font-semibold">305-728-0029</p>
                  </div>
                </a>

                <a href="mailto:info@diazjohnsonlaw.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Email us</p>
                    <p className="font-semibold">info@diazjohnsonlaw.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Office Hours</p>
                    <p className="font-semibold">Mon-Fri: 8 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Location</p>
                    <p className="font-semibold">1680 Michigan Ave, Miami Beach</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                <p className="text-sm opacity-90 text-center">24/7 Emergency Line for Urgent Cases</p>
              </div>
            </Card>

            <Card className="p-6 bg-muted">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">100% Confidential</h3>
                  <p className="text-muted-foreground text-sm">
                    Your information is protected by attorney-client privilege and encrypted using industry-standard security.
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
