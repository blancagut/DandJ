export type SuccessStory = {
  id: string
  clientInitials: string
  titleEn: string
  titleEs: string
  summaryEn: string
  summaryEs: string
  outcome: string
  year: number
}

export type PracticeAreaContent = {
  slug: string
  overviewEn: string
  overviewEs: string
  howWeHelpEn: string[]
  howWeHelpEs: string[]
  successStories: SuccessStory[]
  stats?: {
    casesWon: number
    yearsExperience: number
    successRate: number
  }
}

export const PRACTICE_AREAS_CONTENT: PracticeAreaContent[] = [
  {
    slug: "immigration",
    overviewEn:
      "With over 30+ years of combined experience, Diaz & Johnson has helped thousands of families navigate the complex U.S. immigration system. Our Florida-based team, led by founding partners Carlos Diaz Sr. and Steven Johnson, works with 40+ affiliated attorneys nationwide to deliver comprehensive immigration solutions tailored to your unique situation.",
    overviewEs:
      "Con más de 30 años de experiencia combinada, Diaz & Johnson ha ayudado a miles de familias a navegar el complejo sistema de inmigración de EE.UU. Nuestro equipo con sede en Florida, dirigido por los socios fundadores Carlos Diaz Sr. y Steven Johnson, trabaja con más de 40 abogados afiliados en todo el país para ofrecer soluciones de inmigración integrales adaptadas a su situación única.",
    howWeHelpEn: [
      "Family-based immigration petitions (I-130, I-485)",
      "Adjustment of status and consular processing",
      "Visa extensions and status maintenance",
      "Removal of conditions on residence (I-751)",
      "Travel documents and advance parole",
      "VAWA self-petitions for abuse victims",
    ],
    howWeHelpEs: [
      "Peticiones de inmigración basadas en familia (I-130, I-485)",
      "Ajuste de estatus y procesamiento consular",
      "Extensiones de visa y mantenimiento de estatus",
      "Remoción de condiciones de residencia (I-751)",
      "Documentos de viaje y permiso anticipado",
      "Autopeticiones VAWA para víctimas de abuso",
    ],
    successStories: [
      {
        id: "imm-001",
        clientInitials: "M.R.",
        titleEn: "Family Reunited After 8-Year Separation",
        titleEs: "Familia Reunida Después de 8 Años de Separación",
        summaryEn:
          "Our client was separated from his wife and children for 8 years due to a prior deportation order. We successfully filed an I-601A waiver and reunited the family through consular processing in Ciudad Juárez.",
        summaryEs:
          "Nuestro cliente estuvo separado de su esposa e hijos durante 8 años debido a una orden de deportación previa. Presentamos exitosamente una exención I-601A y reunimos a la familia a través del procesamiento consular en Ciudad Juárez.",
        outcome: "Green Card Approved",
        year: 2024,
      },
      {
        id: "imm-002",
        clientInitials: "L.G.",
        titleEn: "VAWA Petition Approved for Domestic Violence Survivor",
        titleEs: "Petición VAWA Aprobada para Sobreviviente de Violencia Doméstica",
        summaryEn:
          "A courageous client escaped an abusive marriage. We filed a VAWA self-petition that was approved within 6 months, allowing her to obtain legal status independently without her abuser's knowledge.",
        summaryEs:
          "Una valiente cliente escapó de un matrimonio abusivo. Presentamos una autopetición VAWA que fue aprobada en 6 meses, permitiéndole obtener estatus legal de forma independiente sin el conocimiento de su abusador.",
        outcome: "VAWA Approved, Green Card Granted",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 1250,
      yearsExperience: 30,
      successRate: 94,
    },
  },
  {
    slug: "greencard",
    overviewEn:
      "Obtaining a green card is one of the most important steps toward building a permanent life in the United States. Diaz & Johnson has secured green cards for thousands of clients through employment, family sponsorship, and special programs. Our 40+ attorney network ensures your case receives expert attention from filing to approval.",
    overviewEs:
      "Obtener una tarjeta verde es uno de los pasos más importantes para construir una vida permanente en los Estados Unidos. Diaz & Johnson ha asegurado tarjetas verdes para miles de clientes a través de empleo, patrocinio familiar y programas especiales. Nuestra red de más de 40 abogados garantiza que su caso reciba atención experta desde la presentación hasta la aprobación.",
    howWeHelpEn: [
      "Employment-based green cards (EB-1, EB-2, EB-3)",
      "National Interest Waiver (NIW) petitions",
      "PERM labor certification",
      "Marriage-based green cards",
      "Diversity Visa Lottery processing",
      "Green card renewal and replacement",
    ],
    howWeHelpEs: [
      "Tarjetas verdes basadas en empleo (EB-1, EB-2, EB-3)",
      "Peticiones de Exención por Interés Nacional (NIW)",
      "Certificación laboral PERM",
      "Tarjetas verdes basadas en matrimonio",
      "Procesamiento de Lotería de Visas de Diversidad",
      "Renovación y reemplazo de tarjeta verde",
    ],
    successStories: [
      {
        id: "gc-001",
        clientInitials: "J.K.",
        titleEn: "EB-1A Approved for Software Engineer Without Job Offer",
        titleEs: "EB-1A Aprobada para Ingeniero de Software Sin Oferta de Trabajo",
        summaryEn:
          "We successfully demonstrated our client's extraordinary ability in software development through publications, conference presentations, and industry recognition. Green card approved in 8 months without needing employer sponsorship.",
        summaryEs:
          "Demostramos exitosamente la habilidad extraordinaria de nuestro cliente en desarrollo de software a través de publicaciones, presentaciones en conferencias y reconocimiento de la industria. Tarjeta verde aprobada en 8 meses sin necesidad de patrocinio del empleador.",
        outcome: "EB-1A Approved",
        year: 2024,
      },
      {
        id: "gc-002",
        clientInitials: "A.M.",
        titleEn: "Marriage-Based Green Card Despite Prior Visa Overstay",
        titleEs: "Tarjeta Verde por Matrimonio A Pesar de Estadía Excedida Previa",
        summaryEn:
          "Client overstayed tourist visa by 3 years before marrying U.S. citizen. We navigated the complex waiver process and secured green card approval without requiring departure from the U.S.",
        summaryEs:
          "Cliente excedió visa de turista por 3 años antes de casarse con ciudadano estadounidense. Navegamos el complejo proceso de exención y aseguramos la aprobación de la tarjeta verde sin requerir salida de EE.UU.",
        outcome: "I-601A Waiver & Green Card Approved",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 980,
      yearsExperience: 30,
      successRate: 92,
    },
  },
  {
    slug: "criminal-defense",
    overviewEn:
      "Criminal charges can have devastating consequences on your immigration status. With decades of experience in both criminal defense and immigration law, Carlos Diaz Sr., Steven Johnson, and our network of 40+ attorneys across the U.S. provide strategic defense that protects both your freedom and your right to remain in the United States.",
    overviewEs:
      "Los cargos criminales pueden tener consecuencias devastadoras en su estatus migratorio. Con décadas de experiencia en defensa criminal y ley de inmigración, Carlos Diaz Sr., Steven Johnson y nuestra red de más de 40 abogados en EE.UU. brindan defensa estratégica que protege tanto su libertad como su derecho a permanecer en Estados Unidos.",
    howWeHelpEn: [
      "Immigration-safe plea bargaining",
      "Post-conviction relief (vacating convictions)",
      "Removal defense for criminal convictions",
      "Expungement and record sealing",
      "Bond hearings and detention release",
      "Appeals and writs of habeas corpus",
    ],
    howWeHelpEs: [
      "Negociación de culpabilidad segura para inmigración",
      "Alivio post-condena (anulación de condenas)",
      "Defensa de remoción por condenas criminales",
      "Eliminación y sellado de antecedentes",
      "Audiencias de fianza y liberación de detención",
      "Apelaciones y recursos de hábeas corpus",
    ],
    successStories: [
      {
        id: "crim-001",
        clientInitials: "R.T.",
        titleEn: "Deportation Cancelled After Conviction Vacated",
        titleEs: "Deportación Cancelada Después de Anular Condena",
        summaryEn:
          "Green card holder faced deportation due to aggravated felony conviction. We successfully vacated the conviction through post-conviction relief, resulting in immediate termination of removal proceedings.",
        summaryEs:
          "Titular de tarjeta verde enfrentaba deportación debido a condena por delito grave agravado. Anulamos exitosamente la condena a través de alivio post-condena, resultando en terminación inmediata de procedimientos de remoción.",
        outcome: "Conviction Vacated, Deportation Terminated",
        year: 2024,
      },
      {
        id: "crim-002",
        clientInitials: "D.H.",
        titleEn: "Bond Granted for Father Detained by ICE",
        titleEs: "Fianza Otorgada para Padre Detenido por ICE",
        summaryEn:
          "Client was detained by ICE with no bond. We presented compelling evidence of family ties and community support, securing a $5,000 bond that reunited him with his U.S. citizen children while his case proceeds.",
        summaryEs:
          "Cliente fue detenido por ICE sin fianza. Presentamos evidencia convincente de lazos familiares y apoyo comunitario, asegurando una fianza de $5,000 que lo reunió con sus hijos ciudadanos estadounidenses mientras su caso procede.",
        outcome: "Bond Granted, Released from Detention",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 850,
      yearsExperience: 30,
      successRate: 88,
    },
  },
  {
    slug: "civil-rights",
    overviewEn:
      "When your constitutional rights are violated, Diaz & Johnson stands ready to fight. Our Florida-based firm, with Carlos Diaz Sr. and Steven Johnson at the helm, has successfully litigated civil rights cases ranging from police misconduct to discrimination in immigration proceedings. We hold government agencies accountable.",
    overviewEs:
      "Cuando sus derechos constitucionales son violados, Diaz & Johnson está listo para luchar. Nuestro bufete con sede en Florida, con Carlos Diaz Sr. y Steven Johnson al mando, ha litigado exitosamente casos de derechos civiles que van desde mala conducta policial hasta discriminación en procedimientos de inmigración. Hacemos que las agencias gubernamentales rindan cuentas.",
    howWeHelpEn: [
      "Police misconduct and excessive force",
      "Wrongful arrest and false imprisonment",
      "Discrimination based on national origin",
      "Constitutional violations in immigration enforcement",
      "Unlawful detention by ICE",
      "Federal civil rights lawsuits (Section 1983)",
    ],
    howWeHelpEs: [
      "Mala conducta policial y uso excesivo de fuerza",
      "Arresto ilegal y encarcelamiento falso",
      "Discriminación basada en origen nacional",
      "Violaciones constitucionales en aplicación de inmigración",
      "Detención ilegal por ICE",
      "Demandas federales de derechos civiles (Sección 1983)",
    ],
    successStories: [
      {
        id: "civil-001",
        clientInitials: "V.S.",
        titleEn: "$150,000 Settlement for Unlawful ICE Detention",
        titleEs: "Acuerdo de $150,000 por Detención Ilegal de ICE",
        summaryEn:
          "U.S. citizen was wrongfully detained by ICE for 9 days despite presenting valid documentation. We filed a federal lawsuit and secured a $150,000 settlement plus policy changes to prevent future violations.",
        summaryEs:
          "Ciudadano estadounidense fue detenido erróneamente por ICE durante 9 días a pesar de presentar documentación válida. Presentamos una demanda federal y aseguramos un acuerdo de $150,000 más cambios de política para prevenir futuras violaciones.",
        outcome: "$150,000 Settlement",
        year: 2024,
      },
      {
        id: "civil-002",
        clientInitials: "C.P.",
        titleEn: "Discrimination Case Won Against Immigration Officer",
        titleEs: "Caso de Discriminación Ganado Contra Oficial de Inmigración",
        summaryEn:
          "Our client's naturalization interview was conducted with hostility and racial bias. We filed an administrative complaint and federal lawsuit, resulting in case approval and disciplinary action against the officer.",
        summaryEs:
          "La entrevista de naturalización de nuestro cliente se realizó con hostilidad y sesgo racial. Presentamos una queja administrativa y demanda federal, resultando en aprobación del caso y acción disciplinaria contra el oficial.",
        outcome: "Naturalization Approved, Officer Disciplined",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 320,
      yearsExperience: 30,
      successRate: 91,
    },
  },
  {
    slug: "family-law",
    overviewEn:
      "Family matters involving immigration status require lawyers who understand both fields. Diaz & Johnson's founding partners, Carlos Diaz Sr. and Steven Johnson, bring 30+ years of combined experience navigating divorce, custody, and domestic violence cases that intersect with immigration law throughout Florida and beyond.",
    overviewEs:
      "Los asuntos familiares que involucran estatus migratorio requieren abogados que entiendan ambos campos. Los socios fundadores de Diaz & Johnson, Carlos Diaz Sr. y Steven Johnson, aportan más de 30 años de experiencia combinada navegando casos de divorcio, custodia y violencia doméstica que se intersectan con la ley de inmigración en toda Florida y más allá.",
    howWeHelpEn: [
      "Divorce for visa holders and green card holders",
      "Child custody for non-citizen parents",
      "Immigration consequences of family court orders",
      "VAWA petitions for abuse victims",
      "K-1 fiancé visa and marriage fraud defense",
      "Prenuptial agreements for mixed-status couples",
    ],
    howWeHelpEs: [
      "Divorcio para titulares de visa y tarjeta verde",
      "Custodia de menores para padres no ciudadanos",
      "Consecuencias migratorias de órdenes de corte familiar",
      "Peticiones VAWA para víctimas de abuso",
      "Visa K-1 de prometido y defensa de fraude matrimonial",
      "Acuerdos prenupciales para parejas de estatus mixto",
    ],
    successStories: [
      {
        id: "fam-001",
        clientInitials: "N.W.",
        titleEn: "Green Card Retained After Abusive Marriage Divorce",
        titleEs: "Tarjeta Verde Retenida Después de Divorcio de Matrimonio Abusivo",
        summaryEn:
          "Client received conditional green card through marriage but faced abuse. We filed VAWA self-petition and divorce simultaneously, preserving her immigration status while ending the dangerous relationship.",
        summaryEs:
          "Cliente recibió tarjeta verde condicional por matrimonio pero enfrentó abuso. Presentamos autopetición VAWA y divorcio simultáneamente, preservando su estatus migratorio mientras terminaba la relación peligrosa.",
        outcome: "VAWA Approved, 10-Year Green Card Granted",
        year: 2024,
      },
      {
        id: "fam-002",
        clientInitials: "P.M.",
        titleEn: "Custody Secured for Undocumented Mother",
        titleEs: "Custodia Asegurada para Madre Indocumentada",
        summaryEn:
          "Opposing counsel attempted to use mother's immigration status against her in custody battle. We successfully argued that status is irrelevant to parenting ability, securing primary custody for our client.",
        summaryEs:
          "El abogado contrario intentó usar el estatus migratorio de la madre en su contra en la batalla por custodia. Argumentamos exitosamente que el estatus es irrelevante para la capacidad de crianza, asegurando custodia primaria para nuestra cliente.",
        outcome: "Primary Custody Awarded",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 560,
      yearsExperience: 30,
      successRate: 89,
    },
  },
  {
    slug: "business-immigration",
    overviewEn:
      "From startups to Fortune 500 companies, Diaz & Johnson helps businesses navigate employment-based immigration. Our network of 40+ attorneys nationwide, led by Carlos Diaz Sr. and Steven Johnson from our Florida headquarters, provides strategic guidance on work visas, PERM labor certification, and corporate compliance.",
    overviewEs:
      "Desde startups hasta empresas Fortune 500, Diaz & Johnson ayuda a las empresas a navegar la inmigración basada en empleo. Nuestra red de más de 40 abogados en todo el país, liderada por Carlos Diaz Sr. y Steven Johnson desde nuestra sede en Florida, brinda orientación estratégica sobre visas de trabajo, certificación laboral PERM y cumplimiento corporativo.",
    howWeHelpEn: [
      "H-1B specialty occupation visas",
      "L-1A/L-1B intracompany transfers",
      "O-1 visas for individuals with extraordinary ability",
      "E-2 investor visas and business plans",
      "PERM labor certification process",
      "I-9 compliance and ICE audits",
    ],
    howWeHelpEs: [
      "Visas H-1B para ocupaciones especializadas",
      "Transferencias intracompañía L-1A/L-1B",
      "Visas O-1 para individuos con habilidad extraordinaria",
      "Visas E-2 de inversionista y planes de negocios",
      "Proceso de certificación laboral PERM",
      "Cumplimiento I-9 y auditorías de ICE",
    ],
    successStories: [
      {
        id: "biz-001",
        clientInitials: "Tech Corp",
        titleEn: "50+ H-1B Petitions Approved for Growing Tech Company",
        titleEs: "Más de 50 Peticiones H-1B Aprobadas para Empresa de Tecnología en Crecimiento",
        summaryEn:
          "We developed a comprehensive immigration strategy for a fast-growing software company, successfully filing 50+ H-1B petitions over 3 years with a 98% approval rate, enabling them to scale their engineering team.",
        summaryEs:
          "Desarrollamos una estrategia de inmigración integral para una empresa de software de rápido crecimiento, presentando exitosamente más de 50 peticiones H-1B durante 3 años con una tasa de aprobación del 98%, permitiéndoles escalar su equipo de ingeniería.",
        outcome: "50+ H-1B Visas Approved",
        year: 2024,
      },
      {
        id: "biz-002",
        clientInitials: "E.R.",
        titleEn: "E-2 Investor Visa for Restaurant Entrepreneur",
        titleEs: "Visa E-2 de Inversionista para Empresario de Restaurante",
        summaryEn:
          "Client invested $200,000 to open a restaurant in Miami. We prepared a detailed business plan and financial projections, securing E-2 approval that allowed him to manage his business and create 15 jobs.",
        summaryEs:
          "Cliente invirtió $200,000 para abrir un restaurante en Miami. Preparamos un plan de negocios detallado y proyecciones financieras, asegurando aprobación E-2 que le permitió administrar su negocio y crear 15 empleos.",
        outcome: "E-2 Visa Approved",
        year: 2023,
      },
    ],
    stats: {
      casesWon: 1450,
      yearsExperience: 30,
      successRate: 96,
    },
  },
]

export function getPracticeAreaContent(slug: string): PracticeAreaContent | undefined {
  return PRACTICE_AREAS_CONTENT.find((area) => area.slug === slug)
}
