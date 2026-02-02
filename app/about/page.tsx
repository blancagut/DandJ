"use client"

import Link from "next/link"
import { Scale, Users, Award, MapPin, Briefcase, Heart } from "lucide-react"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

export default function AboutPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      hero: {
        title: "About Diaz & Johnson",
        subtitle: "30+ Years of Excellence in Immigration and Criminal Defense Law",
        description:
          "Founded by Carlos Diaz Sr. and Steven Johnson in Florida, our firm has grown into a nationwide network of 40+ affiliated attorneys dedicated to protecting the rights and futures of immigrants, families, and individuals facing legal challenges.",
      },
      story: {
        title: "Our Story",
        body: "Diaz & Johnson was born from a shared vision: to create a law firm that combines legal excellence with genuine compassion for clients navigating the complexities of U.S. immigration and criminal law. What started as a partnership between two passionate attorneys in Florida has evolved into a comprehensive legal practice serving clients across the United States.\n\nWith over 30 years of combined experience, founding partners Carlos Diaz Sr. and Steven Johnson have built a reputation for winning difficult cases, reuniting families, protecting the vulnerable, and holding government agencies accountable. Our network of 40+ affiliated attorneys ensures that no matter where you are in the U.S., you receive expert legal representation backed by decades of experience.",
      },
      mission: {
        title: "Our Mission",
        body: "To provide aggressive, compassionate, and effective legal representation to immigrants, families, and individuals facing criminal charges. We believe everyone deserves a fair chance at justice, regardless of their immigration status or background.",
      },
      values: {
        title: "Our Values",
        items: [
          {
            icon: "Scale",
            title: "Justice for All",
            description: "We fight tirelessly for fairness and equal treatment under the law, regardless of immigration status or background.",
          },
          {
            icon: "Heart",
            title: "Compassionate Advocacy",
            description: "We understand the fear and uncertainty our clients face. We treat every case with empathy and respect.",
          },
          {
            icon: "Award",
            title: "Proven Excellence",
            description: "With thousands of successful cases and decades of experience, we deliver results that change lives.",
          },
          {
            icon: "Users",
            title: "Client-First Approach",
            description: "Your goals are our goals. We listen, strategize, and fight for the outcome you deserve.",
          },
        ],
      },
      stats: [
        { number: "30+", label: "Years Combined Experience" },
        { number: "40+", label: "Affiliated Attorneys Nationwide" },
        { number: "5,000+", label: "Cases Successfully Resolved" },
        { number: "92%", label: "Average Success Rate" },
      ],
      whyChoose: {
        title: "Why Choose Diaz & Johnson?",
        reasons: [
          {
            title: "Nationwide Network",
            description: "40+ attorneys across the U.S. means local expertise with national resources.",
          },
          {
            title: "Bilingual Services",
            description: "Fluent in English and Spanish, we communicate clearly in the language you prefer.",
          },
          {
            title: "Dual Expertise",
            description: "Immigration and criminal defense under one roof protects you comprehensively.",
          },
          {
            title: "Proven Track Record",
            description: "5,000+ successful cases and a 92% success rate speak for themselves.",
          },
          {
            title: "Personalized Strategy",
            description: "No cookie-cutter solutions. Every case receives a custom legal strategy.",
          },
          {
            title: "Accessible Communication",
            description: "We return calls promptly and keep you informed every step of the way.",
          },
        ],
      },
    },
    es: {
      hero: {
        title: "Acerca de Diaz & Johnson",
        subtitle: "Más de 30 Años de Excelencia en Inmigración y Defensa Criminal",
        description:
          "Fundado por Carlos Diaz Sr. y Steven Johnson en Florida, nuestro bufete ha crecido hasta convertirse en una red nacional de más de 40 abogados afiliados dedicados a proteger los derechos y futuros de inmigrantes, familias e individuos que enfrentan desafíos legales.",
      },
      story: {
        title: "Nuestra Historia",
        body: "Diaz & Johnson nació de una visión compartida: crear un bufete de abogados que combine excelencia legal con compasión genuina por los clientes que navegan las complejidades del derecho de inmigración y criminal de EE.UU. Lo que comenzó como una asociación entre dos abogados apasionados en Florida ha evolucionado hasta convertirse en una práctica legal integral que sirve a clientes en todo Estados Unidos.\n\nCon más de 30 años de experiencia combinada, los socios fundadores Carlos Diaz Sr. y Steven Johnson han construido una reputación por ganar casos difíciles, reunir familias, proteger a los vulnerables y hacer que las agencias gubernamentales rindan cuentas. Nuestra red de más de 40 abogados afiliados garantiza que sin importar dónde se encuentre en EE.UU., reciba representación legal experta respaldada por décadas de experiencia.",
      },
      mission: {
        title: "Nuestra Misión",
        body: "Proporcionar representación legal agresiva, compasiva y efectiva a inmigrantes, familias e individuos que enfrentan cargos criminales. Creemos que todos merecen una oportunidad justa de justicia, independientemente de su estatus migratorio o antecedentes.",
      },
      values: {
        title: "Nuestros Valores",
        items: [
          {
            icon: "Scale",
            title: "Justicia Para Todos",
            description: "Luchamos incansablemente por la equidad e igualdad de trato bajo la ley, sin importar el estatus migratorio.",
          },
          {
            icon: "Heart",
            title: "Defensa Compasiva",
            description: "Entendemos el miedo y la incertidumbre que enfrentan nuestros clientes. Tratamos cada caso con empatía y respeto.",
          },
          {
            icon: "Award",
            title: "Excelencia Comprobada",
            description: "Con miles de casos exitosos y décadas de experiencia, entregamos resultados que cambian vidas.",
          },
          {
            icon: "Users",
            title: "Enfoque en el Cliente",
            description: "Sus objetivos son nuestros objetivos. Escuchamos, estrategizamos y luchamos por el resultado que merece.",
          },
        ],
      },
      stats: [
        { number: "30+", label: "Años de Experiencia Combinada" },
        { number: "40+", label: "Abogados Afiliados en Todo el País" },
        { number: "5,000+", label: "Casos Resueltos Exitosamente" },
        { number: "92%", label: "Tasa de Éxito Promedio" },
      ],
      whyChoose: {
        title: "¿Por Qué Elegir Diaz & Johnson?",
        reasons: [
          {
            title: "Red Nacional",
            description: "Más de 40 abogados en EE.UU. significa experiencia local con recursos nacionales.",
          },
          {
            title: "Servicios Bilingües",
            description: "Fluidos en inglés y español, comunicamos claramente en el idioma que prefiera.",
          },
          {
            title: "Doble Experiencia",
            description: "Inmigración y defensa criminal bajo un mismo techo lo protegen integralmente.",
          },
          {
            title: "Historial Comprobado",
            description: "Más de 5,000 casos exitosos y una tasa de éxito del 92% hablan por sí mismos.",
          },
          {
            title: "Estrategia Personalizada",
            description: "Sin soluciones genéricas. Cada caso recibe una estrategia legal personalizada.",
          },
          {
            title: "Comunicación Accesible",
            description: "Devolvemos llamadas rápidamente y lo mantenemos informado en cada paso.",
          },
        ],
      },
    },
  }

  const data = language === "es" ? content.es : content.en

  const iconMap = {
    Scale: Scale,
    Heart: Heart,
    Award: Award,
    Users: Users,
  }

  return (
    <SiteFrame>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">
            {language === "es" ? "Acerca de Nosotros" : "About Us"}
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">{data.hero.title}</h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-4">{data.hero.subtitle}</p>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl">{data.hero.description}</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* Our Story */}
        <Card className="mb-12">
          <CardContent className="p-8 md:p-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">{data.story.title}</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              {data.story.body.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">{data.mission.title}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{data.mission.body}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  {language === "es" ? "Nuestra Ubicación" : "Our Location"}
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {language === "es"
                  ? "Con sede en Florida y una red de más de 40 abogados afiliados en todo Estados Unidos, brindamos servicios legales de clase mundial sin importar dónde se encuentre."
                  : "Headquartered in Florida with a network of 40+ affiliated attorneys across the United States, we deliver world-class legal services no matter where you are located."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">{data.values.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.values.items.map((value, index) => {
              const Icon = iconMap[value.icon as keyof typeof iconMap]
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <Card className="mb-12">
          <CardContent className="p-8 md:p-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8">{data.whyChoose.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.whyChoose.reasons.map((reason, index) => (
                <div key={index} className="flex gap-3">
                  <div className="text-primary font-bold text-lg">{index + 1}.</div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              {language === "es" ? "¿Listo para Trabajar con Nosotros?" : "Ready to Work with Us?"}
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              {language === "es"
                ? "Únase a las miles de familias que hemos ayudado a alcanzar sus sueños en Estados Unidos. Programe su consulta gratuita hoy."
                : "Join the thousands of families we've helped achieve their American dreams. Schedule your free consultation today."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
                <Link href="/consultation">
                  {language === "es" ? "Consulta Gratuita" : "Free Consultation"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground">
                <Link href="/team">{language === "es" ? "Conoce a Nuestro Equipo" : "Meet Our Team"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteFrame>
  )
}
