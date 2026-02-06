"use client"

import { Mail, Phone, Award, Briefcase, GraduationCap, Scale, Users, Globe, Heart } from "lucide-react"
import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/fade-in"
import { useLanguage } from "@/lib/language-context"

export default function CarlosDiazJrPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      badge: "Immigration Law Specialist",
      name: "Carlos Roberto Díaz Jr.",
      title: "Attorney at Law | Immigration Law Expert",
      subtitle: "Over 17 years of combined legal experience in public prosecution and private immigration practice, providing strategic representation in complex U.S. immigration matters.",
      contactBtn: "Contact Attorney",
      callBtn: "(305) 728-0029",
      backgroundTitle: "Professional Background",
      quickFacts: "Quick Facts",
      experience: "Experience",
      experienceValue: "17+ Years",
      born: "Born",
      bornValue: "Miami, FL - August 28, 1983",
      languages: "Languages",
      languagesValue: "English, Spanish, Italian",
      priorService: "Prior Service",
      priorServiceValue: "Prosecutor (6 years)",
      married: "Married",
      marriedValue: "11+ Years",
      children: "Children",
      childrenValue: "Three",
      personalInterests: "Personal Interests",
      interests: [
        "Soccer enthusiast",
        "Greco-Roman wrestling",
        "Physical discipline & fitness",
        "Family time & community service",
      ],
      bio1: "Carlos Roberto Díaz was born in Miami, Florida, on August 28, 1983, and raised in one of the most diverse and legally complex regions of the United States. Growing up in South Florida exposed him early to multicultural communities, international mobility, and the profound legal challenges faced by immigrants, families, and businesses navigating the U.S. legal system.",
      bio2: "With more than 17 years of professional legal experience, Carlos Roberto Díaz is a seasoned attorney and recognized specialist in United States immigration law, combining extensive courtroom experience, advanced academic training, and leadership in private legal practice.",
      bio3: "He began his professional career in public service, serving as a prosecutor for six years. During this period, he handled a wide range of cases and developed substantial trial and courtroom experience. His work as a prosecutor required a disciplined analytical approach, strict adherence to procedural standards, and a deep understanding of evidentiary rules and government decision-making processes.",
      bio4: "Following six years of prosecutorial service, Carlos Roberto Díaz transitioned into private practice and founded his own law firm, concentrating primarily on U.S. immigration law. As founder and principal attorney, he has represented individuals, families, and employers from diverse national and cultural backgrounds in a broad range of immigration matters.",
      educationTitle: "Education & Credentials",
      educationSubtitle: "Advanced legal education with specialized focus on U.S. immigration law and policy",
      jd: "Juris Doctor (J.D.)",
      jdDesc: "Accredited American law school with comprehensive training in U.S. legal systems",
      llm: "Master of Laws (LL.M.)",
      llmDesc: "Specialized in Immigration Law and International Legal Systems",
      doctoral: "Doctoral-Level Studies",
      doctoralDesc: "Advanced research in U.S. immigration policy, discretionary relief, and federal law",
      practiceTitle: "Areas of Practice",
      practiceSubtitle: "Comprehensive immigration law services with strategic focus on complex cases",
      practiceAreas: [
        "Employment-Based Petitions",
        "Family-Based Immigration",
        "Consular Processing",
        "Adjustment of Status",
        "Humanitarian Relief",
        "Waivers of Inadmissibility (I-601, I-212)",
        "Deportation & Removal Defense",
        "Criminal Immigration Issues",
        "Prior Immigration Violations",
      ],
      approachTitle: "Professional Approach",
      approach1: "Carlos Roberto Díaz is known for his meticulous attention to detail, strategic approach to case development, and commitment to ethical and transparent legal representation. His background as a former prosecutor provides him with a unique and valuable perspective when dealing with government agencies.",
      approach2: "He understands how cases are evaluated internally and how to present legally sound, well-supported arguments. His work often involves coordination with employers, foreign legal professionals, and international entities, particularly in matters involving cross-border legal implications.",
      approach3: "Throughout his career, Carlos Roberto Díaz has remained committed to staying current with evolving immigration laws, regulatory changes, and policy developments at both the federal and administrative levels. He approaches each case with a combination of academic rigor, practical experience, and an understanding of the human consequences of legal decisions.",
      prosecutorTitle: "Former Prosecutor Experience",
      prosecutorDesc: "Six years of prosecutorial service provides unique insight into government case evaluation and decision-making processes",
      multilingualTitle: "Multilingual Capability",
      multilingualDesc: "Fluent in English and Spanish with professional proficiency in Italian for international client representation",
      complexTitle: "Complex Case Specialization",
      complexDesc: "Entrusted with high-complexity immigration cases requiring advanced legal reasoning and long-term strategic planning",
      valuesTitle: "Personal Values & Family Life",
      values1: "Beyond his professional achievements, Carlos Roberto Díaz places strong importance on his family life and personal discipline. He has been married for more than eleven years and is the father of three children. His wife is an active prosecutor, and together they share a strong commitment to public service, legal integrity, and professional excellence.",
      values2: "Their shared careers within the legal system have fostered a deep mutual understanding of ethical responsibility, accountability, and the demands of public trust. This family foundation reinforces his commitment to serving clients with the same dedication he applies to his own family.",
      values3: "Outside the legal field, Carlos Roberto Díaz maintains an active interest in sports and physical discipline, particularly soccer and Greco-Roman wrestling. He considers sports an essential part of personal balance, resilience, and mental focus. His long-standing interest in Greco-Roman wrestling reflects his appreciation for discipline, strategy, and endurance—values that closely parallel his approach to legal practice.",
      ctaTitle: "Schedule a Consultation with Attorney Díaz",
      ctaSubtitle: "Receive strategic, results-driven legal representation in your immigration matter",
      emailBtn: "Email Attorney",
    },
    es: {
      badge: "Especialista en Derecho de Inmigración",
      name: "Carlos Roberto Díaz Jr.",
      title: "Abogado | Experto en Derecho de Inmigración",
      subtitle: "Más de 17 años de experiencia legal combinada en fiscalía pública y práctica privada de inmigración, proporcionando representación estratégica en asuntos complejos de inmigración de EE.UU.",
      contactBtn: "Contactar al Abogado",
      callBtn: "(305) 728-0029",
      backgroundTitle: "Formación Profesional",
      quickFacts: "Datos Rápidos",
      experience: "Experiencia",
      experienceValue: "17+ Años",
      born: "Nacimiento",
      bornValue: "Miami, FL - 28 de agosto de 1983",
      languages: "Idiomas",
      languagesValue: "Inglés, Español, Italiano",
      priorService: "Servicio Previo",
      priorServiceValue: "Fiscal (6 años)",
      married: "Casado",
      marriedValue: "11+ Años",
      children: "Hijos",
      childrenValue: "Tres",
      personalInterests: "Intereses Personales",
      interests: [
        "Entusiasta del fútbol",
        "Lucha grecorromana",
        "Disciplina física y fitness",
        "Tiempo familiar y servicio comunitario",
      ],
      bio1: "Carlos Roberto Díaz nació en Miami, Florida, el 28 de agosto de 1983, y se crió en una de las regiones más diversas y legalmente complejas de Estados Unidos. Crecer en el sur de Florida lo expuso tempranamente a comunidades multiculturales, movilidad internacional y los profundos desafíos legales que enfrentan inmigrantes, familias y empresas al navegar el sistema legal estadounidense.",
      bio2: "Con más de 17 años de experiencia legal profesional, Carlos Roberto Díaz es un abogado experimentado y especialista reconocido en derecho de inmigración de Estados Unidos, combinando amplia experiencia en tribunales, formación académica avanzada y liderazgo en práctica legal privada.",
      bio3: "Comenzó su carrera profesional en el servicio público, sirviendo como fiscal durante seis años. Durante este período, manejó una amplia gama de casos y desarrolló experiencia sustancial en juicios y tribunales. Su trabajo como fiscal requería un enfoque analítico disciplinado, estricta adherencia a estándares procesales y un profundo entendimiento de reglas probatorias y procesos de toma de decisiones gubernamentales.",
      bio4: "Después de seis años de servicio fiscal, Carlos Roberto Díaz hizo la transición a la práctica privada y fundó su propio bufete de abogados, concentrándose principalmente en derecho de inmigración de EE.UU. Como fundador y abogado principal, ha representado a individuos, familias y empleadores de diversos orígenes nacionales y culturales en una amplia gama de asuntos de inmigración.",
      educationTitle: "Educación y Credenciales",
      educationSubtitle: "Educación legal avanzada con enfoque especializado en derecho y política de inmigración de EE.UU.",
      jd: "Juris Doctor (J.D.)",
      jdDesc: "Escuela de derecho estadounidense acreditada con formación integral en sistemas legales de EE.UU.",
      llm: "Maestría en Derecho (LL.M.)",
      llmDesc: "Especializado en Derecho de Inmigración y Sistemas Legales Internacionales",
      doctoral: "Estudios de Nivel Doctoral",
      doctoralDesc: "Investigación avanzada en política de inmigración de EE.UU., alivio discrecional y derecho federal",
      practiceTitle: "Áreas de Práctica",
      practiceSubtitle: "Servicios integrales de derecho de inmigración con enfoque estratégico en casos complejos",
      practiceAreas: [
        "Peticiones Basadas en Empleo",
        "Inmigración Basada en Familia",
        "Procesamiento Consular",
        "Ajuste de Estatus",
        "Alivio Humanitario",
        "Exenciones de Inadmisibilidad (I-601, I-212)",
        "Defensa de Deportación y Remoción",
        "Asuntos de Inmigración Criminal",
        "Violaciones Previas de Inmigración",
      ],
      approachTitle: "Enfoque Profesional",
      approach1: "Carlos Roberto Díaz es conocido por su meticulosa atención al detalle, enfoque estratégico al desarrollo de casos y compromiso con la representación legal ética y transparente. Su experiencia como ex fiscal le proporciona una perspectiva única y valiosa al tratar con agencias gubernamentales.",
      approach2: "Entiende cómo se evalúan los casos internamente y cómo presentar argumentos legalmente sólidos y bien fundamentados. Su trabajo a menudo involucra coordinación con empleadores, profesionales legales extranjeros y entidades internacionales, particularmente en asuntos que involucran implicaciones legales transfronterizas.",
      approach3: "A lo largo de su carrera, Carlos Roberto Díaz se ha mantenido comprometido con mantenerse al día con las leyes de inmigración en evolución, cambios regulatorios y desarrollos de políticas a nivel federal y administrativo. Aborda cada caso con una combinación de rigor académico, experiencia práctica y comprensión de las consecuencias humanas de las decisiones legales.",
      prosecutorTitle: "Experiencia como Ex Fiscal",
      prosecutorDesc: "Seis años de servicio fiscal proporciona una perspectiva única sobre la evaluación de casos gubernamentales y procesos de toma de decisiones",
      multilingualTitle: "Capacidad Multilingüe",
      multilingualDesc: "Fluido en inglés y español con dominio profesional de italiano para representación de clientes internacionales",
      complexTitle: "Especialización en Casos Complejos",
      complexDesc: "Se le confían casos de inmigración de alta complejidad que requieren razonamiento legal avanzado y planificación estratégica a largo plazo",
      valuesTitle: "Valores Personales y Vida Familiar",
      values1: "Más allá de sus logros profesionales, Carlos Roberto Díaz otorga gran importancia a su vida familiar y disciplina personal. Ha estado casado por más de once años y es padre de tres hijos. Su esposa es una fiscal activa, y juntos comparten un fuerte compromiso con el servicio público, la integridad legal y la excelencia profesional.",
      values2: "Sus carreras compartidas dentro del sistema legal han fomentado un profundo entendimiento mutuo de responsabilidad ética, rendición de cuentas y las demandas de la confianza pública. Esta base familiar refuerza su compromiso de servir a los clientes con la misma dedicación que aplica a su propia familia.",
      values3: "Fuera del campo legal, Carlos Roberto Díaz mantiene un interés activo en deportes y disciplina física, particularmente fútbol y lucha grecorromana. Considera que los deportes son una parte esencial del equilibrio personal, resistencia y enfoque mental. Su interés de larga data en la lucha grecorromana refleja su aprecio por la disciplina, estrategia y resistencia—valores que se relacionan estrechamente con su enfoque de práctica legal.",
      ctaTitle: "Programe una Consulta con el Abogado Díaz",
      ctaSubtitle: "Reciba representación legal estratégica y orientada a resultados en su asunto de inmigración",
      emailBtn: "Enviar Email",
    },
  }

  const data = content[language as keyof typeof content]

  return (
    <SiteFrame>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/80" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="max-w-4xl">
                <Badge className="mb-4 bg-accent text-accent-foreground">{data.badge}</Badge>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {data.name}
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4">
                  {data.title}
                </p>
                <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
                  {data.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    asChild
                  >
                    <a href="mailto:cdiaz@diazjohnsonlaw.com">
                      <Mail className="mr-2 h-5 w-5" />
                      {data.contactBtn}
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <a href="tel:+13057280029">
                      <Phone className="mr-2 h-5 w-5" />
                      {data.callBtn}
                    </a>
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Background & Overview */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Bio */}
              <div className="lg:col-span-2">
                <FadeIn>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                    {data.backgroundTitle}
                  </h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                    <p>{data.bio1}</p>
                    <p>{data.bio2}</p>
                    <p>{data.bio3}</p>
                    <p>{data.bio4}</p>
                  </div>
                </FadeIn>
              </div>

              {/* Quick Facts Sidebar */}
              <div className="space-y-6">
                <FadeIn delay={0.2}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-accent" />
                        {data.quickFacts}
                      </h3>
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="text-muted-foreground">{data.experience}</dt>
                          <dd className="font-semibold">{data.experienceValue}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{data.born}</dt>
                          <dd className="font-semibold">{data.bornValue}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{data.languages}</dt>
                          <dd className="font-semibold">{data.languagesValue}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{data.priorService}</dt>
                          <dd className="font-semibold">{data.priorServiceValue}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{data.married}</dt>
                          <dd className="font-semibold">{data.marriedValue}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{data.children}</dt>
                          <dd className="font-semibold">{data.childrenValue}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-accent" />
                        {data.personalInterests}
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {data.interests.map((interest, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            <span>{interest}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Education & Credentials */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {data.educationTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {data.educationSubtitle}
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FadeIn delay={0.1}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <GraduationCap className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-semibold text-xl mb-2">{data.jd}</h3>
                    <p className="text-muted-foreground text-sm">
                      {data.jdDesc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.2}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Award className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-semibold text-xl mb-2">{data.llm}</h3>
                    <p className="text-muted-foreground text-sm">
                      {data.llmDesc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Scale className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-semibold text-xl mb-2">{data.doctoral}</h3>
                    <p className="text-muted-foreground text-sm">
                      {data.doctoralDesc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Areas of Practice */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {data.practiceTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {data.practiceSubtitle}
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.practiceAreas.map((area, index) => (
                <FadeIn key={area} delay={index * 0.05}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-accent shrink-0" />
                        <span className="font-medium">{area}</span>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Approach */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {data.approachTitle}
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>{data.approach1}</p>
                  <p>{data.approach2}</p>
                  <p>{data.approach3}</p>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 gap-4">
                  <Card className="border-l-4 border-l-accent">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Scale className="h-5 w-5 text-accent" />
                        {data.prosecutorTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {data.prosecutorDesc}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-accent">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-accent" />
                        {data.multilingualTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {data.multilingualDesc}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-accent">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Users className="h-5 w-5 text-accent" />
                        {data.complexTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {data.complexDesc}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Family & Values */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                {data.valuesTitle}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4 text-left">
                <p>{data.values1}</p>
                <p>{data.values2}</p>
                <p>{data.values3}</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                {data.ctaTitle}
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                {data.ctaSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  asChild
                >
                  <a href="mailto:cdiaz@diazjohnsonlaw.com">
                    <Mail className="mr-2 h-5 w-5" />
                    {data.emailBtn}
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  asChild
                >
                  <a href="tel:+13057280029">
                    <Phone className="mr-2 h-5 w-5" />
                    {data.callBtn}
                  </a>
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </SiteFrame>
  )
}
