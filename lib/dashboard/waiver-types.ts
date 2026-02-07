// ==========================================
// WAIVER DASHBOARD — TYPES & INTERFACES
// ==========================================

export type WaiverType = "I-601" | "I-601A" | "I-212" | "I-192" | "212(d)(3)" | "Multi-Waiver"
export type RiskLevel = "Low" | "Moderate" | "High"
export type ProbabilityLevel = "High" | "Moderate" | "Attorney Review Required"

export interface WaiverScreeningRecord {
  id: string
  clientName: string
  clientEmail?: string
  clientCountry: string
  consultationTimestamp: string
  consultationType: string
  waiverScreening: {
    locationContext: string
    contextType: string
    decisionEngineOutput: {
      recommendedWaivers: string[]
      probabilityLevel: ProbabilityLevel
      riskLevel: RiskLevel
      flags: string[]
      nextStepGuidance: string[]
    }
    unlawfulPresence: {
      overstayed: boolean | null
      duration: string
      departed: boolean | null
    }
    removalHistory: {
      removed: boolean | null
      voluntary: boolean | null
      activeOrder: boolean | null
      expedited: boolean | null
    }
    fraudIndicators: {
      statements: boolean | null
      documents: boolean | null
      identity: boolean | null
      priorDenial: boolean | null
    }
    criminalIndicators: {
      arrests: boolean | null
      convictions: boolean | null
      offenses: string[]
    }
    hardshipFactors: {
      relatives: string[]
      types: string[]
    }
  }
  priorityReview: boolean
  // Intake analytics
  intakeStartedAt?: string
  intakeCompletedAt?: string
  lastCompletedStep?: number
  intakeCompleted: boolean
}

// Lead Opportunity Score
export interface LeadOpportunityScore {
  clientId: string
  clientName: string
  score: number
  waivers: string[]
  riskLevel: RiskLevel
  probabilityLevel: ProbabilityLevel
  lastActivity: string
  priorityReview: boolean
}

// Funnel stage
export interface FunnelStage {
  stage: string
  value: number
  fill: string
}

// Filter state
export interface DashboardFilters {
  waiverType: string
  riskLevel: string
  probabilityLevel: string
  dateFrom: string
  dateTo: string
  country: string
  priorityOnly: boolean
  multiGroundOnly: boolean
}

export const initialFilters: DashboardFilters = {
  waiverType: "all",
  riskLevel: "all",
  probabilityLevel: "all",
  dateFrom: "",
  dateTo: "",
  country: "all",
  priorityOnly: false,
  multiGroundOnly: false,
}

// KPI summary
export interface DashboardKPIs {
  totalLeads: number
  highRiskCases: number
  priorityReviewsPending: number
  avgOpportunityScore: number
  monthlyGrowthPct: number
}

// Alert
export interface DashboardAlert {
  id: string
  type: "priority" | "high_risk" | "multi_waiver" | "criminal_fraud"
  clientName: string
  message: string
  timestamp: string
  read: boolean
}
