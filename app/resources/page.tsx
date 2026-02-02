"use client"

import Link from "next/link"
import { BookOpen, HelpCircle, FileText, Newspaper, Calendar, ArrowRight } from "lucide-react"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/lib/language-context"

export default function ResourcesPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      hero: {
        title: "Immigration Resources & Guides",
        subtitle: "Expert Information to Help You Navigate Your Immigration Journey",
        description: "Access free resources, FAQs, and guides from our experienced attorneys at Diaz & Johnson.",
      },
      blog: {
        title: "Latest Blog Posts",
        subtitle: "Immigration news, tips, and insights from our legal team",
        posts: [
          {
            title: "5 Common Mistakes to Avoid When Applying for a Green Card",
            date: "January 2026",
            category: "Green Card",
            excerpt:
              "Learn about the most frequent errors applicants make and how to avoid delays or denials in your green card application.",
          },
          {
            title: "What to Do If You Receive a Notice to Appear (NTA)",
            date: "December 2025",
            category: "Deportation Defense",
            excerpt:
              "A Notice to Appear is the first step in removal proceedings. Here's what you need to know and do immediately.",
          },
          {
            title: "New H-1B Visa Rules for 2026: What Changed?",
            date: "November 2025",
            category: "Work Visas",
            excerpt:
              "USCIS announced important changes to H-1B regulations. Find out how these updates may affect your application.",
          },
        ],
      },
      faqs: {
        title: "Frequently Asked Questions",
        subtitle: "Quick answers to common immigration questions",
        questions: [
          {
            q: "How long does it take to get a green card through marriage?",
            a: "For immediate relatives of U.S. citizens, the process typically takes 10-13 months from filing to approval if you're already in the U.S. If you're outside the U.S., consular processing can take 12-18 months. However, timelines vary based on USCIS workload and case complexity.",
          },
          {
            q: "Can I work while my green card application is pending?",
            a: "Yes, if you filed for adjustment of status (Form I-485), you can apply for an Employment Authorization Document (EAD) which typically arrives 3-5 months after filing. Once approved, you can legally work for any employer in the U.S.",
          },
          {
            q: "What happens if I overstayed my visa?",
            a: "Overstaying your visa can have serious consequences including bars to re-entry (3 or 10 years) and difficulties obtaining future visas. However, there are waivers and exceptions available. If you're married to a U.S. citizen, you may be eligible for adjustment of status despite the overstay.",
          },
          {
            q: "Do I need a lawyer for my immigration case?",
            a: "While not legally required, having an experienced immigration attorney significantly increases your chances of success. Immigration law is complex with constantly changing rules. A lawyer can identify options you may not know about, avoid costly mistakes, and represent you if issues arise.",
          },
          {
            q: "How much does immigration legal help cost?",
            a: "Costs vary depending on case complexity. Simple cases like family-based green cards may range from $3,000-$5,000 in attorney fees (plus government filing fees). Complex cases like deportation defense or federal appeals can range higher. We offer free consultations to discuss your specific case and provide transparent pricing.",
          },
          {
            q: "What is the difference between a visa and a green card?",
            a: "A visa is temporary permission to enter and stay in the U.S. for a specific purpose (tourism, work, study). A green card (permanent resident card) allows you to live and work permanently in the U.S., travel freely, and eventually apply for citizenship after 3-5 years.",
          },
        ],
      },
      caseStudies: {
        title: "Case Studies",
        subtitle: "Real examples of how we've helped clients succeed",
        studies: [
          {
            title: "Family Reunited After 8-Year Separation",
            category: "Family Immigration",
            challenge:
              "Client was deported 8 years ago and separated from his U.S. citizen wife and children. He had a prior deportation order making re-entry extremely difficult.",
            solution:
              "We filed an I-601A provisional waiver demonstrating extreme hardship to his U.S. citizen family. We prepared a comprehensive package with medical, financial, and psychological evidence.",
            outcome: "Waiver approved. Client successfully processed at Ciudad Juárez consulate and reunited with family.",
          },
          {
            title: "Deportation Cancelled Through Post-Conviction Relief",
            category: "Criminal Defense",
            challenge:
              "Green card holder faced deportation due to aggravated felony conviction. ICE detained him with no bond.",
            solution:
              "We filed post-conviction relief to vacate the conviction based on ineffective assistance of counsel. Simultaneously fought for bond in immigration court.",
            outcome: "Conviction vacated. Deportation proceedings terminated. Client released from detention.",
          },
          {
            title: "EB-1A Green Card for Software Engineer Without Job Offer",
            category: "Employment-Based Immigration",
            challenge:
              "Client wanted green card but didn't want to depend on employer sponsorship. Had strong technical background but no formal publications.",
            solution:
              "We built a comprehensive EB-1A petition highlighting conference presentations, GitHub contributions, industry awards, and recommendation letters from experts.",
            outcome: "EB-1A approved in 8 months without requiring job offer or labor certification.",
          },
        ],
      },
      news: {
        title: "Immigration News",
        subtitle: "Stay updated on policy changes and important announcements",
        items: [
          {
            title: "USCIS Extends Automatic Work Permit Renewals to 540 Days",
            date: "January 2026",
            summary:
              "To address processing delays, USCIS extended automatic EAD renewals from 180 to 540 days for certain categories. This helps workers maintain employment authorization while applications are pending.",
          },
          {
            title: "New Parole in Place Program for Undocumented Spouses",
            date: "December 2025",
            summary:
              "USCIS announced a new process allowing undocumented spouses of U.S. citizens to apply for parole without leaving the country, potentially avoiding the 10-year bar.",
          },
          {
            title: "H-1B Cap Season Opens April 1st - Key Changes This Year",
            date: "March 2026",
            summary:
              "The H-1B lottery registration period opens soon with new selection methods favoring higher-wage positions. Employers should prepare early.",
          },
        ],
      },
    },
    es: {
      hero: {
        title: "Recursos y Guías de Inmigración",
        subtitle: "Información Experta para Ayudarle a Navegar su Proceso Migratorio",
        description: "Acceda a recursos gratuitos, preguntas frecuentes y guías de nuestros abogados experimentados en Diaz & Johnson.",
      },
      blog: {
        title: "Últimas Publicaciones del Blog",
        subtitle: "Noticias, consejos y perspectivas de inmigración de nuestro equipo legal",
        posts: [
          {
            title: "5 Errores Comunes a Evitar al Solicitar una Tarjeta Verde",
            date: "Enero 2026",
            category: "Tarjeta Verde",
            excerpt:
              "Conozca los errores más frecuentes que cometen los solicitantes y cómo evitar retrasos o negaciones en su solicitud de tarjeta verde.",
          },
          {
            title: "Qué Hacer Si Recibe una Notificación de Comparecencia (NTA)",
            date: "Diciembre 2025",
            category: "Defensa de Deportación",
            excerpt:
              "Una Notificación de Comparecencia es el primer paso en procedimientos de remoción. Esto es lo que necesita saber y hacer inmediatamente.",
          },
          {
            title: "Nuevas Reglas de Visa H-1B para 2026: ¿Qué Cambió?",
            date: "Noviembre 2025",
            category: "Visas de Trabajo",
            excerpt:
              "USCIS anunció cambios importantes a las regulaciones H-1B. Descubra cómo estas actualizaciones pueden afectar su solicitud.",
          },
        ],
      },
      faqs: {
        title: "Preguntas Frecuentes",
        subtitle: "Respuestas rápidas a preguntas comunes de inmigración",
        questions: [
          {
            q: "¿Cuánto tiempo toma obtener una tarjeta verde por matrimonio?",
            a: "Para familiares inmediatos de ciudadanos estadounidenses, el proceso típicamente toma 10-13 meses desde la presentación hasta la aprobación si ya está en EE.UU. Si está fuera de EE.UU., el procesamiento consular puede tomar 12-18 meses. Sin embargo, los plazos varían según la carga de trabajo de USCIS y la complejidad del caso.",
          },
          {
            q: "¿Puedo trabajar mientras mi solicitud de tarjeta verde está pendiente?",
            a: "Sí, si presentó ajuste de estatus (Formulario I-485), puede solicitar un Documento de Autorización de Empleo (EAD) que típicamente llega 3-5 meses después de presentar. Una vez aprobado, puede trabajar legalmente para cualquier empleador en EE.UU.",
          },
          {
            q: "¿Qué sucede si excedí mi visa?",
            a: "Exceder su visa puede tener consecuencias serias incluyendo prohibiciones de reingreso (3 o 10 años) y dificultades para obtener visas futuras. Sin embargo, hay exenciones y excepciones disponibles. Si está casado con un ciudadano estadounidense, puede ser elegible para ajuste de estatus a pesar del exceso.",
          },
          {
            q: "¿Necesito un abogado para mi caso de inmigración?",
            a: "Aunque no es legalmente requerido, tener un abogado de inmigración experimentado aumenta significativamente sus posibilidades de éxito. La ley de inmigración es compleja con reglas que cambian constantemente. Un abogado puede identificar opciones que quizás no conozca, evitar errores costosos y representarlo si surgen problemas.",
          },
          {
            q: "¿Cuánto cuesta la ayuda legal de inmigración?",
            a: "Los costos varían según la complejidad del caso. Casos simples como tarjetas verdes basadas en familia pueden oscilar entre $3,000-$5,000 en honorarios de abogado (más tarifas de presentación gubernamentales). Casos complejos como defensa de deportación o apelaciones federales pueden ser más altos. Ofrecemos consultas gratuitas para discutir su caso específico y proporcionar precios transparentes.",
          },
          {
            q: "¿Cuál es la diferencia entre una visa y una tarjeta verde?",
            a: "Una visa es permiso temporal para ingresar y permanecer en EE.UU. para un propósito específico (turismo, trabajo, estudio). Una tarjeta verde (tarjeta de residente permanente) le permite vivir y trabajar permanentemente en EE.UU., viajar libremente y eventualmente solicitar ciudadanía después de 3-5 años.",
          },
        ],
      },
      caseStudies: {
        title: "Estudios de Caso",
        subtitle: "Ejemplos reales de cómo hemos ayudado a clientes a tener éxito",
        studies: [
          {
            title: "Familia Reunida Después de 8 Años de Separación",
            category: "Inmigración Familiar",
            challenge:
              "Cliente fue deportado hace 8 años y separado de su esposa e hijos ciudadanos estadounidenses. Tenía una orden de deportación previa que hacía el reingreso extremadamente difícil.",
            solution:
              "Presentamos una exención provisional I-601A demostrando dificultad extrema a su familia ciudadana estadounidense. Preparamos un paquete integral con evidencia médica, financiera y psicológica.",
            outcome: "Exención aprobada. Cliente procesó exitosamente en consulado de Ciudad Juárez y se reunió con familia.",
          },
          {
            title: "Deportación Cancelada Mediante Alivio Post-Condena",
            category: "Defensa Criminal",
            challenge:
              "Titular de tarjeta verde enfrentaba deportación debido a condena por delito grave agravado. ICE lo detuvo sin fianza.",
            solution:
              "Presentamos alivio post-condena para anular la condena basándonos en asistencia ineficaz de abogado. Simultáneamente luchamos por fianza en corte de inmigración.",
            outcome: "Condena anulada. Procedimientos de deportación terminados. Cliente liberado de detención.",
          },
          {
            title: "Tarjeta Verde EB-1A para Ingeniero de Software Sin Oferta de Trabajo",
            category: "Inmigración Basada en Empleo",
            challenge:
              "Cliente quería tarjeta verde pero no quería depender del patrocinio del empleador. Tenía sólidos antecedentes técnicos pero sin publicaciones formales.",
            solution:
              "Construimos una petición integral EB-1A destacando presentaciones en conferencias, contribuciones en GitHub, premios de la industria y cartas de recomendación de expertos.",
            outcome: "EB-1A aprobada en 8 meses sin requerir oferta de trabajo o certificación laboral.",
          },
        ],
      },
      news: {
        title: "Noticias de Inmigración",
        subtitle: "Manténgase actualizado sobre cambios de políticas y anuncios importantes",
        items: [
          {
            title: "USCIS Extiende Renovaciones Automáticas de Permiso de Trabajo a 540 Días",
            date: "Enero 2026",
            summary:
              "Para abordar retrasos en el procesamiento, USCIS extendió las renovaciones automáticas de EAD de 180 a 540 días para ciertas categorías. Esto ayuda a trabajadores a mantener autorización de empleo mientras las solicitudes están pendientes.",
          },
          {
            title: "Nuevo Programa de Parole in Place para Cónyuges Indocumentados",
            date: "Diciembre 2025",
            summary:
              "USCIS anunció un nuevo proceso que permite a cónyuges indocumentados de ciudadanos estadounidenses solicitar parole sin salir del país, potencialmente evitando la prohibición de 10 años.",
          },
          {
            title: "Temporada de Cupo H-1B Abre el 1 de Abril - Cambios Clave Este Año",
            date: "Marzo 2026",
            summary:
              "El período de registro de lotería H-1B abre pronto con nuevos métodos de selección favoreciendo posiciones de salarios más altos. Los empleadores deben prepararse temprano.",
          },
        ],
      },
    },
  }

  const data = language === "es" ? content.es : content.en

  return (
    <SiteFrame>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">
            {language === "es" ? "Recursos" : "Resources"}
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">{data.hero.title}</h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-4">{data.hero.subtitle}</p>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl">{data.hero.description}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* Blog Section */}
        <div id="blog" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">{data.blog.title}</h2>
          </div>
          <p className="text-muted-foreground mb-8">{data.blog.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.blog.posts.map((post, index) => (
              <Card key={index} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </span>
                    <Button variant="ghost" size="sm" className="text-primary">
                      {language === "es" ? "Leer Más" : "Read More"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs Section */}
        <div id="faqs" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">{data.faqs.title}</h2>
          </div>
          <p className="text-muted-foreground mb-8">{data.faqs.subtitle}</p>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {data.faqs.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Case Studies Section */}
        <div id="case-studies" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">{data.caseStudies.title}</h2>
          </div>
          <p className="text-muted-foreground mb-8">{data.caseStudies.subtitle}</p>
          <div className="space-y-6">
            {data.caseStudies.studies.map((study, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <Badge variant="secondary" className="mb-3">
                    {study.category}
                  </Badge>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">{study.title}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {language === "es" ? "Desafío:" : "Challenge:"}
                      </h4>
                      <p className="text-muted-foreground">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {language === "es" ? "Solución:" : "Solution:"}
                      </h4>
                      <p className="text-muted-foreground">{study.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {language === "es" ? "Resultado:" : "Outcome:"}
                      </h4>
                      <p className="text-primary font-medium">{study.outcome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div id="news" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold text-foreground">{data.news.title}</h2>
          </div>
          <p className="text-muted-foreground mb-8">{data.news.subtitle}</p>
          <div className="space-y-4">
            {data.news.items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <Badge variant="outline">{item.date}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              {language === "es" ? "¿Necesita Ayuda Legal Personalizada?" : "Need Personalized Legal Help?"}
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              {language === "es"
                ? "Estos recursos son solo el comienzo. Para asesoramiento legal específico sobre su caso, programe una consulta gratuita con nuestro equipo."
                : "These resources are just the beginning. For specific legal advice about your case, schedule a free consultation with our team."}
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
              <Link href="/consult">
                {language === "es" ? "Consulta Gratuita" : "Free Consultation"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </SiteFrame>
  )
}
