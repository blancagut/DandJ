"use client"

import Link from "next/link"
import { Mail, Phone, Award, Briefcase, GraduationCap, MapPin } from "lucide-react"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/language-context"

export default function TeamPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      hero: {
        title: "Meet Our Legal Team",
        subtitle: "Expert Attorneys Dedicated to Your Success",
        description:
          "Our founding partners and nationwide network of 40+ affiliated attorneys bring decades of experience in immigration law, criminal defense, and civil rights litigation.",
      },
      foundingPartners: {
        title: "Founding Partners",
        members: [
          {
            name: "Carlos Diaz Sr.",
            title: "Managing Partner",
            initials: "CD",
            bio: "Carlos Diaz Sr. is a seasoned immigration and criminal defense attorney with over 15 years of experience protecting the rights of immigrants and their families. Born and raised in Florida, Carlos has dedicated his career to fighting for justice and reuniting families torn apart by deportation. He has successfully represented clients in thousands of immigration cases, including complex removal proceedings, asylum claims, and federal appeals. Carlos is known for his aggressive courtroom advocacy and compassionate client care.",
            specialties: ["Immigration Law", "Deportation Defense", "Criminal Defense", "Federal Appeals"],
            education: "J.D., University of Miami School of Law; B.A., Florida International University",
            admissions: ["Florida Bar", "U.S. District Court, Southern District of Florida", "Board of Immigration Appeals"],
            languages: ["English", "Spanish"],
            contact: {
              email: "cdiaz@diazjohnsonlaw.com",
              phone: "(305) 555-1234",
            },
          },
          {
            name: "Steven Johnson",
            title: "Senior Partner",
            initials: "SJ",
            bio: "Steven Johnson brings over 16 years of experience in immigration law, civil rights litigation, and business immigration. A graduate of Harvard Law School, Steven has successfully litigated landmark civil rights cases and secured green cards and visas for thousands of professionals, entrepreneurs, and families. His strategic approach combines aggressive advocacy with meticulous attention to detail. Steven is particularly known for his expertise in complex employment-based immigration cases and constitutional challenges to immigration enforcement.",
            specialties: ["Business Immigration", "Civil Rights", "Employment Visas", "Constitutional Law"],
            education: "J.D., Harvard Law School; B.A., Yale University",
            admissions: ["Florida Bar", "New York Bar", "U.S. Supreme Court", "Multiple Federal Circuit Courts"],
            languages: ["English", "Spanish"],
            contact: {
              email: "sjohnson@diazjohnsonlaw.com",
              phone: "(305) 555-1235",
            },
          },
        ],
      },
      network: {
        title: "Our Nationwide Network",
        description:
          "In addition to our founding partners, Diaz & Johnson collaborates with 40+ affiliated attorneys across the United States. This network ensures that no matter where you are located, you receive expert legal representation backed by our firm's decades of experience and proven track record.",
        locations: [
          "Florida (Miami, Tampa, Orlando)",
          "California (Los Angeles, San Francisco)",
          "Texas (Houston, Dallas, San Antonio)",
          "New York (NYC, Buffalo)",
          "Arizona (Phoenix, Tucson)",
          "Illinois (Chicago)",
          "Georgia (Atlanta)",
          "North Carolina (Charlotte)",
        ],
      },
      cta: {
        title: "Schedule a Consultation with Our Team",
        description:
          "Whether you need help with immigration, criminal defense, or civil rights, our experienced attorneys are ready to fight for you.",
      },
    },
    es: {
      hero: {
        title: "Conozca a Nuestro Equipo Legal",
        subtitle: "Abogados Expertos Dedicados a Su Éxito",
        description:
          "Nuestros socios fundadores y red nacional de más de 40 abogados afiliados aportan décadas de experiencia en derecho de inmigración, defensa criminal y litigio de derechos civiles.",
      },
      foundingPartners: {
        title: "Socios Fundadores",
        members: [
          {
            name: "Carlos Diaz Sr.",
            title: "Socio Director",
            initials: "CD",
            bio: "Carlos Diaz Sr. es un experimentado abogado de inmigración y defensa criminal con más de 15 años de experiencia protegiendo los derechos de inmigrantes y sus familias. Nacido y criado en Florida, Carlos ha dedicado su carrera a luchar por la justicia y reunir familias separadas por deportación. Ha representado exitosamente a clientes en miles de casos de inmigración, incluyendo procedimientos de remoción complejos, solicitudes de asilo y apelaciones federales. Carlos es conocido por su defensa agresiva en la corte y cuidado compasivo del cliente.",
            specialties: ["Derecho de Inmigración", "Defensa de Deportación", "Defensa Criminal", "Apelaciones Federales"],
            education: "J.D., Facultad de Derecho de la Universidad de Miami; B.A., Universidad Internacional de Florida",
            admissions: ["Colegio de Abogados de Florida", "Corte de Distrito de EE.UU., Distrito Sur de Florida", "Junta de Apelaciones de Inmigración"],
            languages: ["Inglés", "Español"],
            contact: {
              email: "cdiaz@diazjohnsonlaw.com",
              phone: "(305) 555-1234",
            },
          },
          {
            name: "Steven Johnson",
            title: "Socio Principal",
            initials: "SJ",
            bio: "Steven Johnson aporta más de 16 años de experiencia en derecho de inmigración, litigio de derechos civiles e inmigración empresarial. Graduado de la Facultad de Derecho de Harvard, Steven ha litigado exitosamente casos históricos de derechos civiles y asegurado tarjetas verdes y visas para miles de profesionales, empresarios y familias. Su enfoque estratégico combina defensa agresiva con atención meticulosa al detalle. Steven es particularmente conocido por su experiencia en casos complejos de inmigración basada en empleo y desafíos constitucionales a la aplicación de inmigración.",
            specialties: ["Inmigración Empresarial", "Derechos Civiles", "Visas de Empleo", "Derecho Constitucional"],
            education: "J.D., Facultad de Derecho de Harvard; B.A., Universidad de Yale",
            admissions: ["Colegio de Abogados de Florida", "Colegio de Abogados de Nueva York", "Corte Suprema de EE.UU.", "Múltiples Cortes de Circuito Federales"],
            languages: ["Inglés", "Español"],
            contact: {
              email: "sjohnson@diazjohnsonlaw.com",
              phone: "(305) 555-1235",
            },
          },
        ],
      },
      network: {
        title: "Nuestra Red Nacional",
        description:
          "Además de nuestros socios fundadores, Diaz & Johnson colabora con más de 40 abogados afiliados en todo Estados Unidos. Esta red garantiza que sin importar dónde se encuentre, reciba representación legal experta respaldada por las décadas de experiencia y historial comprobado de nuestro bufete.",
        locations: [
          "Florida (Miami, Tampa, Orlando)",
          "California (Los Ángeles, San Francisco)",
          "Texas (Houston, Dallas, San Antonio)",
          "Nueva York (NYC, Buffalo)",
          "Arizona (Phoenix, Tucson)",
          "Illinois (Chicago)",
          "Georgia (Atlanta)",
          "Carolina del Norte (Charlotte)",
        ],
      },
      cta: {
        title: "Programe una Consulta con Nuestro Equipo",
        description:
          "Ya sea que necesite ayuda con inmigración, defensa criminal o derechos civiles, nuestros abogados experimentados están listos para luchar por usted.",
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
            {language === "es" ? "Nuestro Equipo" : "Our Team"}
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">{data.hero.title}</h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-4">{data.hero.subtitle}</p>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl">{data.hero.description}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* Founding Partners */}
        <div className="mb-16">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8">{data.foundingPartners.title}</h2>
          <div className="space-y-8">
            {data.foundingPartners.members.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Profile Image/Avatar */}
                    <div className="md:col-span-3 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center p-8">
                      <Avatar className="h-40 w-40">
                        <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Profile Details */}
                    <div className="md:col-span-9 p-6 md:p-8">
                      <div className="mb-4">
                        <h3 className="font-serif text-2xl font-bold text-foreground">{member.name}</h3>
                        <p className="text-primary font-medium">{member.title}</p>
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-6">{member.bio}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Specialties */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">
                              {language === "es" ? "Especialidades" : "Specialties"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {member.specialties.map((specialty, i) => (
                              <Badge key={i} variant="secondary">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Languages */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">
                              {language === "es" ? "Idiomas" : "Languages"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {member.languages.map((lang, i) => (
                              <Badge key={i} variant="outline">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Education & Admissions */}
                      <div className="space-y-3 mb-6 text-sm">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {language === "es" ? "Educación" : "Education"}
                            </span>
                          </div>
                          <p className="text-muted-foreground pl-6">{member.education}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {language === "es" ? "Admisiones" : "Bar Admissions"}
                            </span>
                          </div>
                          <p className="text-muted-foreground pl-6">{member.admissions.join(", ")}</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <a
                          href={`mailto:${member.contact.email}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {member.contact.email}
                        </a>
                        <a
                          href={`tel:${member.contact.phone}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {member.contact.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nationwide Network */}
        <Card className="mb-12">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <h2 className="font-serif text-3xl font-bold text-foreground">{data.network.title}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{data.network.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.network.locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{location}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">{data.cta.title}</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">{data.cta.description}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
                <Link href="/consult">
                  {language === "es" ? "Consulta Gratuita" : "Free Consultation"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground">
                <Link href="/areas">
                  {language === "es" ? "Ver Áreas de Práctica" : "View Practice Areas"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteFrame>
  )
}
