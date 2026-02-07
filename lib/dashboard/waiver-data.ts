import type {
  WaiverScreeningRecord,
  DashboardFilters,
  DashboardKPIs,
  LeadOpportunityScore,
  FunnelStage,
  DashboardAlert,
} from "./waiver-types"

// ==========================================
// MOCK DATA GENERATOR — 120 realistic records
// ==========================================

const COUNTRIES = [
  "Mexico", "Guatemala", "Honduras", "El Salvador", "Colombia",
  "Venezuela", "Cuba", "Haiti", "Dominican Republic", "Nicaragua",
  "Peru", "Brazil", "Ecuador", "Jamaica", "India",
  "Philippines", "China", "Nigeria", "Ghana", "Pakistan",
]

const FIRST_NAMES = [
  "Maria", "Carlos", "Ana", "Jorge", "Sofia", "Luis", "Carmen", "Jesus", "Rosa",
  "Pedro", "Elena", "Miguel", "Lucia", "Fernando", "Isabella", "Diego", "Camila",
  "Oscar", "Valentina", "Ricardo", "Gabriela", "Andres", "Daniela", "Manuel",
  "Laura", "Alejandro", "Patricia", "Roberto", "Sandra", "Eduardo",
]
const LAST_NAMES = [
  "Garcia", "Rodriguez", "Martinez", "Lopez", "Hernandez", "Gonzalez", "Perez",
  "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz",
  "Morales", "Reyes", "Gutierrez", "Ortiz", "Ramos", "Vega", "Castillo",
  "Jimenez", "Mendoza", "Ruiz", "Romero", "Herrera", "Medina", "Aguilar", "Vargas",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(startMonth: number, endMonth: number): string {
  // Generates dates between startMonth and endMonth (0 = Jan 2025, 12 = Jan 2026)
  const baseYear = 2025
  const month = startMonth + Math.floor(Math.random() * (endMonth - startMonth))
  const year = baseYear + Math.floor(month / 12)
  const m = month % 12
  const day = 1 + Math.floor(Math.random() * 28)
  const hour = Math.floor(Math.random() * 14) + 8
  const min = Math.floor(Math.random() * 60)
  return new Date(year, m, day, hour, min).toISOString()
}

function generateRecord(index: number): WaiverScreeningRecord {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const country = pick(COUNTRIES)
  const timestamp = randomDate(0, 13) // Jan 2025 to Jan 2026

  // Randomly generate case profile
  const hasOverstay = Math.random() > 0.35
  const hasRemoval = Math.random() > 0.7
  const hasFraud = Math.random() > 0.75
  const hasCriminal = Math.random() > 0.8
  const isInside = Math.random() > 0.4

  const waivers: string[] = []
  const flags: string[] = []
  let riskLevel: "Low" | "Moderate" | "High" = "Low"
  let probability: "High" | "Moderate" | "Attorney Review Required" = "High"

  if (hasOverstay) {
    const duration = Math.random() > 0.5 ? "over_1y" : "180_to_1y"
    if (duration === "over_1y") flags.push("10-Year Bar Potential")
    else flags.push("3-Year Bar Potential")

    if (isInside && !hasRemoval && Math.random() > 0.4) {
      waivers.push("I-601A")
    } else {
      waivers.push("I-601")
    }
  }

  if (hasRemoval) {
    flags.push("Prior Removal/Deportation")
    if (Math.random() > 0.6) flags.push("Active Removal Order")
    if (Math.random() > 0.7) flags.push("Expedited Removal")
    waivers.push("I-212")
    riskLevel = "High"
    probability = "Attorney Review Required"
  }

  if (hasFraud) {
    flags.push("Fraud/Misrepresentation")
    waivers.push("I-601")
    if (riskLevel !== "High") riskLevel = "Moderate"
  }

  if (hasCriminal) {
    flags.push("Criminal Inadmissibility")
    if (Math.random() > 0.5) {
      flags.push("Controlled Substance")
      riskLevel = "High"
      probability = "Attorney Review Required"
    }
    waivers.push("I-601")
    if (Math.random() > 0.6) waivers.push("I-192")
  }

  if (flags.length >= 2) {
    flags.push("multi_ground_inadmissibility")
    probability = "Attorney Review Required"
  }

  // Deduplicate waivers
  const uniqueWaivers = [...new Set(waivers)]
  if (uniqueWaivers.length > 2) {
    // Replace with Multi-Waiver marker in addition
    uniqueWaivers.push("Multi-Waiver")
  }

  const isPriority = (hasCriminal && hasFraud) || (hasRemoval && hasFraud) || (riskLevel === "High" && flags.length >= 3)

  if (isPriority) {
    probability = "Attorney Review Required"
    riskLevel = "High"
  }

  // Waiver type string for probabilities when clean
  if (waivers.length === 0) {
    probability = "High"
    riskLevel = "Low"
  }

  const intakeCompleted = Math.random() > 0.15
  const intakeStarted = randomDate(0, 13)
  const completionMinutes = 3 + Math.floor(Math.random() * 12)
  const intakeFinished = intakeCompleted
    ? new Date(new Date(intakeStarted).getTime() + completionMinutes * 60 * 1000).toISOString()
    : undefined

  const contextType = pick(["green_data", "temporary_visa", "reentry", "consular", "adjustment"])

  return {
    id: `WVR-${String(1000 + index).padStart(5, "0")}`,
    clientName: `${firstName} ${lastName}`,
    clientEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    clientCountry: country,
    consultationTimestamp: timestamp,
    consultationType: pick(["waiver_screening", "initial_consult", "follow_up"]),
    waiverScreening: {
      locationContext: isInside ? "inside" : "outside",
      contextType,
      decisionEngineOutput: {
        recommendedWaivers: uniqueWaivers.length > 0 ? uniqueWaivers : ["No Waiver Needed"],
        probabilityLevel: probability,
        riskLevel,
        flags: [...new Set(flags)],
        nextStepGuidance: isPriority
          ? ["Priority Attorney Review Recommended due to complex factors combination."]
          : flags.length >= 2
            ? ["Multiple inadmissibility grounds detected. Multi-waiver strategy required."]
            : ["Proceed with standard consultation pathway."],
      },
      unlawfulPresence: {
        overstayed: hasOverstay,
        duration: hasOverstay ? (Math.random() > 0.5 ? "over_1y" : "180_to_1y") : "",
        departed: hasOverstay ? Math.random() > 0.5 : null,
      },
      removalHistory: {
        removed: hasRemoval,
        voluntary: hasRemoval ? Math.random() > 0.6 : null,
        activeOrder: hasRemoval ? Math.random() > 0.5 : null,
        expedited: hasRemoval ? Math.random() > 0.7 : null,
      },
      fraudIndicators: {
        statements: hasFraud ? Math.random() > 0.3 : null,
        documents: hasFraud ? Math.random() > 0.5 : null,
        identity: hasFraud ? Math.random() > 0.7 : null,
        priorDenial: hasFraud ? Math.random() > 0.6 : null,
      },
      criminalIndicators: {
        arrests: hasCriminal,
        convictions: hasCriminal ? Math.random() > 0.4 : null,
        offenses: hasCriminal ? [pick(["drug", "theft_moral", "violence", "dui", "other"])] : [],
      },
      hardshipFactors: {
        relatives: Math.random() > 0.3 ? [pick(["spouse", "parent", "child"])] : [],
        types: Math.random() > 0.3
          ? [pick(["medical", "financial", "psychological", "educational", "country_conditions"])]
          : [],
      },
    },
    priorityReview: isPriority,
    intakeStartedAt: intakeStarted,
    intakeCompletedAt: intakeFinished,
    lastCompletedStep: intakeCompleted ? 7 : 1 + Math.floor(Math.random() * 5),
    intakeCompleted,
  }
}

// Generate 120 records (seeded-random via index)
let _cachedRecords: WaiverScreeningRecord[] | null = null

export function getMockWaiverRecords(): WaiverScreeningRecord[] {
  if (_cachedRecords) return _cachedRecords
  _cachedRecords = Array.from({ length: 120 }, (_, i) => generateRecord(i))
  return _cachedRecords
}

// ==========================================
// ANALYTICS FUNCTIONS
// ==========================================

export function applyFilters(
  records: WaiverScreeningRecord[],
  filters: DashboardFilters
): WaiverScreeningRecord[] {
  return records.filter((r) => {
    const out = r.waiverScreening.decisionEngineOutput
    if (filters.waiverType !== "all") {
      if (!out.recommendedWaivers.some((w) => w.includes(filters.waiverType))) return false
    }
    if (filters.riskLevel !== "all" && out.riskLevel !== filters.riskLevel) return false
    if (filters.probabilityLevel !== "all" && out.probabilityLevel !== filters.probabilityLevel) return false
    if (filters.country !== "all" && r.clientCountry !== filters.country) return false
    if (filters.priorityOnly && !r.priorityReview) return false
    if (filters.multiGroundOnly && !out.flags.includes("multi_ground_inadmissibility")) return false
    if (filters.dateFrom) {
      if (new Date(r.consultationTimestamp) < new Date(filters.dateFrom)) return false
    }
    if (filters.dateTo) {
      if (new Date(r.consultationTimestamp) > new Date(filters.dateTo)) return false
    }
    return true
  })
}

export function computeKPIs(records: WaiverScreeningRecord[]): DashboardKPIs {
  const total = records.length
  const highRisk = records.filter((r) => r.waiverScreening.decisionEngineOutput.riskLevel === "High").length
  const priority = records.filter((r) => r.priorityReview).length

  // Avg LOS
  const scores = records.map((r) => calculateLOS(r))
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // Monthly growth: compare last 2 months based on data
  const now = new Date()
  const thisMonth = records.filter((r) => {
    const d = new Date(r.consultationTimestamp)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const lastMonth = records.filter((r) => {
    const d = new Date(r.consultationTimestamp)
    const prev = new Date(now)
    prev.setMonth(prev.getMonth() - 1)
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
  }).length
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

  return {
    totalLeads: total,
    highRiskCases: highRisk,
    priorityReviewsPending: priority,
    avgOpportunityScore: avgScore,
    monthlyGrowthPct: growth,
  }
}

export function calculateLOS(record: WaiverScreeningRecord): number {
  const out = record.waiverScreening.decisionEngineOutput
  let score = 0

  // Probability weight
  if (out.probabilityLevel === "High") score += 30
  else if (out.probabilityLevel === "Moderate") score += 20
  else score += 15 // Attorney Review

  // Risk weight
  if (out.riskLevel === "High") score += 25
  else if (out.riskLevel === "Moderate") score += 15
  else score += 5

  // Multi-waiver bonus
  if (out.recommendedWaivers.length > 1) score += 20

  // Priority bonus
  if (record.priorityReview) score += 10

  // Hardship indicators bonus
  if (record.waiverScreening.hardshipFactors.relatives.length > 0) score += 5
  if (record.waiverScreening.hardshipFactors.types.length > 0) score += 5

  return Math.min(score, 100)
}

export function getWaiverDistribution(records: WaiverScreeningRecord[]) {
  const counts: Record<string, number> = {
    "I-601": 0,
    "I-601A": 0,
    "I-212": 0,
    "I-192": 0,
    "Multi-Waiver": 0,
  }

  for (const r of records) {
    const waivers = r.waiverScreening.decisionEngineOutput.recommendedWaivers
    for (const w of waivers) {
      if (w.includes("I-601A")) counts["I-601A"]++
      else if (w.includes("I-601")) counts["I-601"]++
      else if (w.includes("I-212")) counts["I-212"]++
      else if (w.includes("I-192")) counts["I-192"]++
    }
    if (waivers.includes("Multi-Waiver") || waivers.length > 2) counts["Multi-Waiver"]++
  }

  return Object.entries(counts).map(([name, count]) => ({ name, count }))
}

export function getMonthlyTrend(records: WaiverScreeningRecord[]) {
  const months: Record<string, number> = {}
  for (const r of records) {
    const d = new Date(r.consultationTimestamp)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    months[key] = (months[key] || 0) + 1
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [y, m] = month.split("-")
      const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      return { month: label, count }
    })
}

export function getFunnelData(records: WaiverScreeningRecord[]): FunnelStage[] {
  const completed = records.filter((r) => r.intakeCompleted).length
  const attorneyReview = records.filter((r) =>
    r.waiverScreening.decisionEngineOutput.probabilityLevel === "Attorney Review Required"
    || r.priorityReview
  ).length
  const scheduled = Math.round(attorneyReview * 0.7) // Simulated
  const retained = Math.round(scheduled * 0.45) // Simulated

  return [
    { stage: "Screening Completed", value: completed, fill: "hsl(210, 80%, 55%)" },
    { stage: "Attorney Review Triggered", value: attorneyReview, fill: "hsl(35, 90%, 55%)" },
    { stage: "Consultation Scheduled", value: scheduled, fill: "hsl(150, 60%, 45%)" },
    { stage: "Case Retained", value: retained, fill: "hsl(260, 60%, 55%)" },
  ]
}

export function getRiskDistribution(records: WaiverScreeningRecord[]) {
  const counts = { Low: 0, Moderate: 0, High: 0 }
  for (const r of records) {
    const risk = r.waiverScreening.decisionEngineOutput.riskLevel
    if (risk in counts) counts[risk as keyof typeof counts]++
  }
  return [
    { name: "Low", value: counts.Low, fill: "hsl(150, 60%, 50%)" },
    { name: "Moderate", value: counts.Moderate, fill: "hsl(35, 90%, 55%)" },
    { name: "High", value: counts.High, fill: "hsl(0, 70%, 55%)" },
  ]
}

export function getCountryDistribution(records: WaiverScreeningRecord[]) {
  const counts: Record<string, number> = {}
  for (const r of records) {
    counts[r.clientCountry] = (counts[r.clientCountry] || 0) + 1
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([country, count]) => ({ country, count }))
}

export function getCountryWaiverBreakdown(records: WaiverScreeningRecord[]) {
  const data: Record<string, Record<string, number>> = {}
  for (const r of records) {
    const country = r.clientCountry
    if (!data[country]) data[country] = { "I-601": 0, "I-601A": 0, "I-212": 0, "I-192": 0 }
    for (const w of r.waiverScreening.decisionEngineOutput.recommendedWaivers) {
      if (w.includes("I-601A")) data[country]["I-601A"]++
      else if (w.includes("I-601")) data[country]["I-601"]++
      else if (w.includes("I-212")) data[country]["I-212"]++
      else if (w.includes("I-192")) data[country]["I-192"]++
    }
  }
  return Object.entries(data)
    .map(([country, waivers]) => ({ country, ...waivers }) as Record<string, string | number>)
    .sort((a, b) => {
      const sumA = ((a["I-601"] as number) || 0) + ((a["I-601A"] as number) || 0) + ((a["I-212"] as number) || 0) + ((a["I-192"] as number) || 0)
      const sumB = ((b["I-601"] as number) || 0) + ((b["I-601A"] as number) || 0) + ((b["I-212"] as number) || 0) + ((b["I-192"] as number) || 0)
      return sumB - sumA
    })
    .slice(0, 10)
}

export function getTopLeads(records: WaiverScreeningRecord[], count = 15): LeadOpportunityScore[] {
  return records
    .map((r) => ({
      clientId: r.id,
      clientName: r.clientName,
      score: calculateLOS(r),
      waivers: r.waiverScreening.decisionEngineOutput.recommendedWaivers,
      riskLevel: r.waiverScreening.decisionEngineOutput.riskLevel,
      probabilityLevel: r.waiverScreening.decisionEngineOutput.probabilityLevel,
      lastActivity: r.consultationTimestamp,
      priorityReview: r.priorityReview,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

export function getDropOffSteps(records: WaiverScreeningRecord[]) {
  const stepLabels = ["Location", "Presence", "Removals", "Verify", "History", "Hardship", "Analysis"]
  const incomplete = records.filter((r) => !r.intakeCompleted)
  const counts: Record<number, number> = {}
  for (const r of incomplete) {
    const step = r.lastCompletedStep || 1
    counts[step] = (counts[step] || 0) + 1
  }
  return stepLabels.map((label, i) => ({
    step: label,
    dropoffs: counts[i + 1] || 0,
  }))
}

export function getCompletionRate(records: WaiverScreeningRecord[]) {
  const completed = records.filter((r) => r.intakeCompleted).length
  return records.length > 0 ? Math.round((completed / records.length) * 100) : 0
}

export function getAvgCompletionTime(records: WaiverScreeningRecord[]) {
  const completed = records.filter((r) => r.intakeCompleted && r.intakeStartedAt && r.intakeCompletedAt)
  if (completed.length === 0) return 0
  const totalMinutes = completed.reduce((sum, r) => {
    const start = new Date(r.intakeStartedAt!).getTime()
    const end = new Date(r.intakeCompletedAt!).getTime()
    return sum + (end - start) / (1000 * 60)
  }, 0)
  return Math.round(totalMinutes / completed.length)
}

export function generateAlerts(records: WaiverScreeningRecord[]): DashboardAlert[] {
  const alerts: DashboardAlert[] = []
  for (const r of records) {
    const out = r.waiverScreening.decisionEngineOutput
    if (r.priorityReview) {
      alerts.push({
        id: `alert-pri-${r.id}`,
        type: "priority",
        clientName: r.clientName,
        message: `Priority review required — ${out.flags.join(", ")}`,
        timestamp: r.consultationTimestamp,
        read: false,
      })
    }
    if (out.riskLevel === "High" && !r.priorityReview) {
      alerts.push({
        id: `alert-risk-${r.id}`,
        type: "high_risk",
        clientName: r.clientName,
        message: `High risk case detected — ${out.recommendedWaivers.join(", ")}`,
        timestamp: r.consultationTimestamp,
        read: false,
      })
    }
    if (out.flags.includes("Criminal Inadmissibility") && out.flags.includes("Fraud/Misrepresentation")) {
      alerts.push({
        id: `alert-cf-${r.id}`,
        type: "criminal_fraud",
        clientName: r.clientName,
        message: "Criminal + Fraud combination detected — immediate attorney consult required",
        timestamp: r.consultationTimestamp,
        read: false,
      })
    }
  }
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30)
}

export function getUniqueCountries(records: WaiverScreeningRecord[]): string[] {
  return [...new Set(records.map((r) => r.clientCountry))].sort()
}
