// ==========================================
// Shared Petition Types & Classification Engine
// All output strings are i18n KEYS — translation happens at UI layer only.
// ==========================================

export type PetitionerStatus = "citizen" | "lpr"
export type RelationshipType = "spouse" | "child" | "parent" | "sibling"
export type BeneficiaryMaritalStatus = "single" | "married" | "divorced" | "widowed"
export type CitizenshipMethod = "birth" | "naturalization" | "derivation" | "lpr_through"
export type EntryType = "visa" | "parole" | "no_inspection" | "other"
export type UnlawfulDuration = "under_180" | "180_to_1y" | "over_1y"
export type OffenseType = "drug" | "theft_moral" | "violence" | "dui" | "fraud" | "other"
export type EvidenceType = "shared_lease" | "joint_accounts" | "photos" | "travel" | "communications" | "affidavits"

export type FamilyCategory = "IR-1" | "CR-1" | "IR-2" | "IR-5" | "F1" | "F2A" | "F2B" | "F3" | "F4"
export type ProcessingPath = "adjustment" | "consular"
export type CasePriority = "high" | "moderate" | "low"

export interface PetitionFormData {
  // Step 1
  petitionerStatus: PetitionerStatus | ""
  relationship: RelationshipType | ""
  beneficiaryAge: number | null
  beneficiaryMaritalStatus: BeneficiaryMaritalStatus | ""

  // Step 2
  citizenshipMethod: CitizenshipMethod | ""
  yearsWithStatus: number | null
  priorPetitions: boolean | null
  priorPetitionsApproved: boolean | null

  // Step 3
  beneficiaryCountryOfBirth: string
  beneficiaryCountryOfResidence: string
  beneficiaryLocation: "inside" | "outside" | ""
  priorUSEntries: boolean | null
  lastEntryType: EntryType | ""

  // Step 4
  enteredLegally: boolean | null
  hasValidStatus: boolean | null
  has245iProtection: boolean | null

  // Step 5
  unlawfulPresence: boolean | null
  unlawfulDuration: UnlawfulDuration | ""
  priorDeportation: boolean | null
  falseDocuments: boolean | null
  immigrationViolations: boolean | null
  priorVisaDenials: boolean | null

  // Step 6
  arrests: boolean | null
  convictions: boolean | null
  offenseTypes: OffenseType[]

  // Step 7
  annualIncome: number | null
  dependents: number | null
  employed: boolean | null
  coSponsorAvailable: boolean | null

  // Step 8
  marriageDate: string
  marriageLocation: string
  priorMarriages: boolean | null
  childrenTogether: boolean | null
  evidenceOfRelationship: EvidenceType[]
}

export const initialPetitionFormData: PetitionFormData = {
  petitionerStatus: "",
  relationship: "",
  beneficiaryAge: null,
  beneficiaryMaritalStatus: "",
  citizenshipMethod: "",
  yearsWithStatus: null,
  priorPetitions: null,
  priorPetitionsApproved: null,
  beneficiaryCountryOfBirth: "",
  beneficiaryCountryOfResidence: "",
  beneficiaryLocation: "",
  priorUSEntries: null,
  lastEntryType: "",
  enteredLegally: null,
  hasValidStatus: null,
  has245iProtection: null,
  unlawfulPresence: null,
  unlawfulDuration: "",
  priorDeportation: null,
  falseDocuments: null,
  immigrationViolations: null,
  priorVisaDenials: null,
  arrests: null,
  convictions: null,
  offenseTypes: [],
  annualIncome: null,
  dependents: null,
  employed: null,
  coSponsorAvailable: null,
  marriageDate: "",
  marriageLocation: "",
  priorMarriages: null,
  childrenTogether: null,
  evidenceOfRelationship: [],
}

// ==========================================
// ANALYSIS RESULT — all string arrays store i18n KEYS
// ==========================================

export interface PetitionAnalysis {
  category: FamilyCategory | null
  isEligible: boolean
  ineligibleReason: string // i18n key (e.g. "ineligible.lpr_married_child")
  processingPath: ProcessingPath
  isImmediateRelative: boolean
  waiverFlag: boolean
  inadmissibilityFlags: string[] // i18n keys (e.g. "flags.10y_bar")
  financialMeetsGuideline: boolean
  marriageFraudRisk: boolean
  marriageFraudIndicators: string[] // i18n keys
  casePriority: CasePriority
  strategy: string[] // i18n keys
  alerts: string[] // i18n keys
}

// ==========================================
// SAVED DATA SCHEMA — language-neutral
// ==========================================

export interface PetitionSavedData {
  petitionScreening: {
    petitionerInfo: {
      status: string
      citizenshipMethod: string
      yearsWithStatus: number | null
      priorPetitions: boolean | null
    }
    beneficiaryInfo: {
      countryOfBirth: string
      countryOfResidence: string
      location: string
      age: number | null
      maritalStatus: string
    }
    relationshipCategory: FamilyCategory | null
    processingPath: ProcessingPath
    inadmissibilityFlags: string[]
    financialEligibility: {
      income: number | null
      dependents: number | null
      meetsGuideline: boolean
      coSponsor: boolean | null
    }
    marriageFraudIndicators: string[]
    recommendedStrategy: string[]
    casePriority: CasePriority
    waiverFlag: boolean
    timestamp: string
  }
}

// ==========================================
// CLASSIFICATION ENGINE — pure functions, no i18n dependency
// All outputs are internal keys.
// ==========================================

export function classifyCategory(data: PetitionFormData): { category: FamilyCategory | null; eligible: boolean; reason: string } {
  const { petitionerStatus, relationship, beneficiaryAge, beneficiaryMaritalStatus } = data
  const age = beneficiaryAge ?? 0
  const isSingle = beneficiaryMaritalStatus === "single" || beneficiaryMaritalStatus === "divorced" || beneficiaryMaritalStatus === "widowed"

  if (petitionerStatus === "citizen") {
    if (relationship === "spouse") return { category: "IR-1", eligible: true, reason: "" }
    if (relationship === "child") {
      if (age < 21 && isSingle) return { category: "IR-2", eligible: true, reason: "" }
      if (age >= 21 && isSingle) return { category: "F1", eligible: true, reason: "" }
      if (beneficiaryMaritalStatus === "married") return { category: "F3", eligible: true, reason: "" }
    }
    if (relationship === "parent") return { category: "IR-5", eligible: true, reason: "" }
    if (relationship === "sibling") return { category: "F4", eligible: true, reason: "" }
  }

  if (petitionerStatus === "lpr") {
    if (relationship === "spouse") return { category: "F2A", eligible: true, reason: "" }
    if (relationship === "child") {
      if (age < 21 && isSingle) return { category: "F2A", eligible: true, reason: "" }
      if (age >= 21 && isSingle) return { category: "F2B", eligible: true, reason: "" }
      if (beneficiaryMaritalStatus === "married") return { category: null, eligible: false, reason: "ineligible.lpr_married_child" }
    }
    if (relationship === "parent") return { category: null, eligible: false, reason: "ineligible.lpr_parent" }
    if (relationship === "sibling") return { category: null, eligible: false, reason: "ineligible.lpr_sibling" }
  }

  return { category: null, eligible: false, reason: "ineligible.insufficient_data" }
}

export function determineProcessingPath(data: PetitionFormData): ProcessingPath {
  if (data.beneficiaryLocation === "outside") return "consular"
  if (data.enteredLegally && (data.hasValidStatus || data.has245iProtection)) return "adjustment"
  return "consular"
}

export function checkFinancialEligibility(income: number | null, dependents: number | null): boolean {
  if (income === null || dependents === null) return false
  const householdSize = Math.max(dependents + 1, 2)
  const threshold = 25550 + Math.max(householdSize - 2, 0) * 6950
  return income >= threshold
}

export function analyzePetitionCase(data: PetitionFormData): PetitionAnalysis {
  const classification = classifyCategory(data)
  let category = classification.category
  const isEligible = classification.eligible
  const ineligibleReason = classification.reason

  // CR-1 vs IR-1
  if (category === "IR-1" && data.marriageDate) {
    const mDate = new Date(data.marriageDate)
    const now = new Date()
    const diffYears = (now.getTime() - mDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (diffYears < 2) category = "CR-1"
  }

  const isIR = category !== null && ["IR-1", "CR-1", "IR-2", "IR-5"].includes(category)
  const processingPath = determineProcessingPath(data)

  // Inadmissibility flags — store i18n keys
  const inadmissibilityFlags: string[] = []
  let waiverFlag = false

  if (data.unlawfulPresence) {
    if (data.unlawfulDuration === "over_1y") { inadmissibilityFlags.push("flags.10y_bar"); waiverFlag = true }
    else if (data.unlawfulDuration === "180_to_1y") { inadmissibilityFlags.push("flags.3y_bar"); waiverFlag = true }
    else { inadmissibilityFlags.push("flags.unlawful_under_180") }
  }
  if (data.priorDeportation) { inadmissibilityFlags.push("flags.prior_deportation"); waiverFlag = true }
  if (data.falseDocuments) { inadmissibilityFlags.push("flags.false_documents"); waiverFlag = true }
  if (data.immigrationViolations) { inadmissibilityFlags.push("flags.immigration_violations") }
  if (data.priorVisaDenials) { inadmissibilityFlags.push("flags.prior_visa_denials") }
  if (data.arrests) { inadmissibilityFlags.push("flags.arrest_history"); waiverFlag = true }
  if (data.convictions) { inadmissibilityFlags.push("flags.criminal_convictions"); waiverFlag = true }
  const offenseTypes = Array.isArray(data.offenseTypes) ? data.offenseTypes : []
  if (offenseTypes.includes("drug")) { inadmissibilityFlags.push("flags.drug_offense") }
  if (offenseTypes.includes("violence")) { inadmissibilityFlags.push("flags.violent_offense") }

  // Financial
  const financialMeetsGuideline = checkFinancialEligibility(data.annualIncome, data.dependents)

  // Marriage fraud indicators — store i18n keys
  const marriageFraudIndicators: string[] = []
  let marriageFraudRisk = false
  if (data.relationship === "spouse") {
    if (data.marriageDate) {
      const mDate = new Date(data.marriageDate)
      const now = new Date()
      const diffMonths = (now.getTime() - mDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
      if (diffMonths < 6) { marriageFraudIndicators.push("indicators.marriage_under_6m"); marriageFraudRisk = true }
    }
    if (data.childrenTogether === false) marriageFraudIndicators.push("indicators.no_children")
    if (data.priorMarriages) marriageFraudIndicators.push("indicators.prior_marriages")
    const evidence = Array.isArray(data.evidenceOfRelationship) ? data.evidenceOfRelationship : []
    if (evidence.length < 2) { marriageFraudIndicators.push("indicators.limited_evidence"); marriageFraudRisk = true }
  }

  // Alerts — store i18n keys
  const alerts: string[] = []
  if (category === "CR-1") alerts.push("engineAlerts.conditional_residence")
  if (!financialMeetsGuideline && data.annualIncome !== null) alerts.push("engineAlerts.insufficient_income")
  if (marriageFraudRisk) alerts.push("engineAlerts.marriage_fraud_risk")
  if (waiverFlag) alerts.push("engineAlerts.waiver_needed")
  if (inadmissibilityFlags.length >= 3) alerts.push("engineAlerts.multiple_grounds")
  if (offenseTypes.includes("drug")) alerts.push("engineAlerts.drug_permanent_bar")
  if (!isEligible) alerts.push("engineAlerts.ineligible")

  // Case priority
  let casePriority: CasePriority = "low"
  if (waiverFlag || marriageFraudRisk || !financialMeetsGuideline) casePriority = "moderate"
  if ((waiverFlag && inadmissibilityFlags.length >= 2) || marriageFraudRisk || !isEligible) casePriority = "high"

  // Strategy — store i18n keys
  const strategy: string[] = []
  if (isEligible && category) {
    if (isIR) { strategy.push("engineStrategy.immediate_relative") }
    else { strategy.push("engineStrategy.preference_category") }
    if (processingPath === "adjustment") { strategy.push("engineStrategy.adjustment_recommended") }
    else { strategy.push("engineStrategy.consular_processing") }
    if (waiverFlag) strategy.push("engineStrategy.pre_file_waiver")
    if (!financialMeetsGuideline && data.annualIncome !== null) strategy.push("engineStrategy.secure_cosponsor")
    if (marriageFraudRisk) strategy.push("engineStrategy.gather_evidence")
  }

  return {
    category,
    isEligible,
    ineligibleReason,
    processingPath,
    isImmediateRelative: isIR,
    waiverFlag,
    inadmissibilityFlags,
    financialMeetsGuideline,
    marriageFraudRisk,
    marriageFraudIndicators,
    casePriority,
    strategy,
    alerts,
  }
}

// ==========================================
// DEMO DATA — for admin panel when no live DB
// ==========================================

export const demoPetitionCases: PetitionSavedData[] = [
  {
    petitionScreening: {
      petitionerInfo: { status: "citizen", citizenshipMethod: "naturalization", yearsWithStatus: 5, priorPetitions: false },
      beneficiaryInfo: { countryOfBirth: "Mexico", countryOfResidence: "United States", location: "inside", age: 28, maritalStatus: "single" },
      relationshipCategory: "IR-1",
      processingPath: "adjustment",
      inadmissibilityFlags: ["flags.unlawful_under_180"],
      financialEligibility: { income: 52000, dependents: 2, meetsGuideline: true, coSponsor: false },
      marriageFraudIndicators: [],
      recommendedStrategy: ["engineStrategy.immediate_relative", "engineStrategy.adjustment_recommended"],
      casePriority: "low",
      waiverFlag: false,
      timestamp: "2026-01-15T10:30:00.000Z",
    },
  },
  {
    petitionScreening: {
      petitionerInfo: { status: "citizen", citizenshipMethod: "birth", yearsWithStatus: 35, priorPetitions: true },
      beneficiaryInfo: { countryOfBirth: "Honduras", countryOfResidence: "Honduras", location: "outside", age: 32, maritalStatus: "married" },
      relationshipCategory: "CR-1",
      processingPath: "consular",
      inadmissibilityFlags: ["flags.10y_bar", "flags.false_documents", "flags.prior_visa_denials"],
      financialEligibility: { income: 22000, dependents: 4, meetsGuideline: false, coSponsor: true },
      marriageFraudIndicators: ["indicators.marriage_under_6m", "indicators.limited_evidence"],
      recommendedStrategy: ["engineStrategy.immediate_relative", "engineStrategy.consular_processing", "engineStrategy.pre_file_waiver", "engineStrategy.secure_cosponsor", "engineStrategy.gather_evidence"],
      casePriority: "high",
      waiverFlag: true,
      timestamp: "2026-02-01T14:45:00.000Z",
    },
  },
  {
    petitionScreening: {
      petitionerInfo: { status: "lpr", citizenshipMethod: "lpr_through", yearsWithStatus: 3, priorPetitions: false },
      beneficiaryInfo: { countryOfBirth: "Guatemala", countryOfResidence: "United States", location: "inside", age: 19, maritalStatus: "single" },
      relationshipCategory: "F2A",
      processingPath: "adjustment",
      inadmissibilityFlags: ["flags.arrest_history"],
      financialEligibility: { income: 38000, dependents: 3, meetsGuideline: true, coSponsor: false },
      marriageFraudIndicators: [],
      recommendedStrategy: ["engineStrategy.preference_category", "engineStrategy.adjustment_recommended", "engineStrategy.pre_file_waiver"],
      casePriority: "moderate",
      waiverFlag: true,
      timestamp: "2026-02-05T09:15:00.000Z",
    },
  },
]
