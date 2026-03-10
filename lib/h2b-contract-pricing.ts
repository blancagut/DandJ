export type H2BContractVariant =
  | "split_300_200"
  | "single_500"
  | "split_480_480"
  | "split_320_320_320"
  | "split_400_400_400"

export type H2BContractInstallment = {
  amount: string
  label: string
}

export type H2BContractPricing = {
  variant: H2BContractVariant
  totalText: string
  totalClause: string
  paymentScheduleText: string
  firstInstallmentClause: string
  secondInstallmentClause?: string
  thirdInstallmentClause?: string
  installments: H2BContractInstallment[]
}

const PRICING_BY_VARIANT: Record<H2BContractVariant, H2BContractPricing> = {
  split_320_320_320: {
    variant: "split_320_320_320",
    totalText: "Novecientos sesenta dólares estadounidenses (USD $960.00)",
    totalClause:
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Novecientos sesenta dólares estadounidenses (USD $960.00), por concepto de comisión profesional. La cual se pagará en 3 partes iguales:",
    paymentScheduleText: "3 partes iguales",
    firstInstallmentClause: "La primera de $320.00 (trescientos veinte dólares) a la firma del contrato;",
    secondInstallmentClause:
      "La segunda de $320.00 (trescientos veinte dólares) cuando EL CLIENTE esté en Miami, Florida;",
    thirdInstallmentClause:
      "La tercera de $320.00 (trescientos veinte dólares) en su primera quincena de sueldo.",
    installments: [
      { amount: "$320", label: "A la firma del contrato" },
      { amount: "$320", label: "Cuando esté en Miami, FL" },
      { amount: "$320", label: "En su primera quincena de sueldo" },
    ],
  },
  split_480_480: {
    variant: "split_480_480",
    totalText: "Novecientos sesenta dólares estadounidenses (USD $960.00)",
    totalClause:
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Novecientos sesenta dólares estadounidenses (USD $960.00), por concepto de comisión profesional. La cual se pagará en 2 partes iguales:",
    paymentScheduleText: "2 partes iguales",
    firstInstallmentClause: "La primera de $480.00 (cuatrocientos ochenta dólares) a la firma del contrato;",
    secondInstallmentClause:
      "$480.00 (cuatrocientos ochenta dólares) al momento de instalarse en el trabajo dentro de Miami, Florida.",
    installments: [
      { amount: "$480", label: "A la firma del contrato" },
      { amount: "$480", label: "Al instalarse en el trabajo en Miami, FL" },
    ],
  },
  split_400_400_400: {
    variant: "split_400_400_400",
    totalText: "Mil doscientos dólares estadounidenses (USD $1200.00)",
    totalClause:
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Mil doscientos dólares estadounidenses (USD $1200.00), por concepto de comisión profesional. La cual se pagará en 3 partes iguales:",
    paymentScheduleText: "3 partes iguales",
    firstInstallmentClause: "La primera de $400.00 (cuatrocientos dólares);",
    secondInstallmentClause: "La segunda de $400.00 (cuatrocientos dólares);",
    thirdInstallmentClause: "La tercera de $400.00 (cuatrocientos dólares).",
    installments: [
      { amount: "$400", label: "Primer pago" },
      { amount: "$400", label: "Segundo pago" },
      { amount: "$400", label: "Tercer pago" },
    ],
  },
  single_500: {
    variant: "single_500",
    totalText: "Quinientos dólares estadounidenses (USD $500.00)",
    totalClause:
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Quinientos dólares estadounidenses (USD $500.00), por concepto de comisión profesional. La cual se pagará en un solo pago:",
    paymentScheduleText: "un solo pago",
    firstInstallmentClause: "La suma de $500.00 (quinientos dólares) a la firma del contrato.",
    installments: [{ amount: "$500", label: "Pago único a la firma del contrato" }],
  },
  split_300_200: {
    variant: "split_300_200",
    totalText: "Quinientos dólares estadounidenses (USD $500.00)",
    totalClause:
      "EL CLIENTE se obliga a pagar a EL ESTUDIO la suma única y total de Quinientos dólares estadounidenses (USD $500.00), por concepto de comisión profesional. La cual se pagará en 2 partes:",
    paymentScheduleText: "2 partes",
    firstInstallmentClause: "La primera de $300.00 (trescientos dólares) a la firma del contrato;",
    secondInstallmentClause:
      "$200.00 (doscientos dólares) al momento de instalarse en el trabajo dentro de Miami, Florida.",
    installments: [
      { amount: "$300", label: "A la firma del contrato" },
      { amount: "$200", label: "Al instalarse en el trabajo en Miami, FL" },
    ],
  },
}

export function isH2BContractVariant(value: unknown): value is H2BContractVariant {
  return typeof value === "string" && value in PRICING_BY_VARIANT
}

export function getH2BContractVariantFromPath(pathname?: string | null): H2BContractVariant {
  switch (pathname) {
    case "/contract2h2b28":
      return "split_320_320_320"
    case "/contract2h2b":
      return "split_480_480"
    case "/contract3h2b":
      return "split_400_400_400"
    case "/contratodigitalh2b9":
      return "single_500"
    default:
      return "split_300_200"
  }
}

export function getH2BContractPricing(variant: H2BContractVariant): H2BContractPricing {
  return PRICING_BY_VARIANT[variant]
}