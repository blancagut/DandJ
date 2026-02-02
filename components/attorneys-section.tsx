"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, Mail } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Image from "next/image"

export function AttorneysSection() {
  const { t, language } = useLanguage()

  const attorneys =
    language === "es"
      ? [
          {
            name: "Cecilia Diaz",
            title: "Socia Fundadora",
            specialty: "Ley de Inmigracion",
            image: "/team/CeciliaDiaz.jpg",
            bio: "Graduada de Harvard Law con mas de 25 anos especializandose en casos complejos de inmigracion.",
          },
          {
            name: "Carlos Diaz Jr",
            title: "Socio Fundador",
            specialty: "Defensa Criminal",
            image: "/team/CarlosDiazJr.jpg",
            bio: "Ex fiscal convertido en abogado defensor con una presencia inigualable en la corte.",
          },
          {
            name: "Vannessa Johnson",
            title: "Asociada Senior",
            specialty: "Derechos Civiles",
            image: "/team/VannessaJonhson.jpg",
            bio: "Veterana de ACLU apasionada por luchar por los derechos constitucionales.",
          },
          {
            name: "Michael Flanagan",
            title: "Asociado",
            specialty: "Inmigracion de Negocios",
            image: "/team/michael-flanagan-lawyer.jpg",
            bio: "Especialista en inmigracion corporativa y procesamiento de visas para empresas.",
          },
        ]
      : [
          {
            name: "Cecilia Diaz",
            title: "Founding Partner",
            specialty: "Immigration Law",
            image: "/team/CeciliaDiaz.jpg",
            bio: "Harvard Law graduate with 25+ years specializing in complex immigration cases.",
          },
          {
            name: "Carlos Diaz Jr",
            title: "Founding Partner",
            specialty: "Criminal Defense",
            image: "/team/CarlosDiazJr.jpg",
            bio: "Former prosecutor turned defense attorney with an unmatched courtroom presence.",
          },
          {
            name: "Vannessa Johnson",
            title: "Senior Associate",
            specialty: "Civil Rights",
            image: "/team/VannessaJonhson.jpg",
            bio: "ACLU veteran passionate about fighting for constitutional rights.",
          },
          {
            name: "Michael Flanagan",
            title: "Associate",
            specialty: "Business Immigration",
            image: "/team/michael-flanagan-lawyer.jpg",
            bio: "Specializes in corporate immigration and visa processing for businesses.",
          },
        ]

  return (
    <section id="attorneys" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("attorneys.tagline")}</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t("attorneys.title")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{t("attorneys.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {attorneys.map((attorney) => (
            <Card key={attorney.name} className="border-border bg-card overflow-hidden group">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={attorney.image || "/placeholder.svg"}
                  alt={attorney.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-5">
                <h3 className="font-serif text-lg font-bold text-foreground">{attorney.name}</h3>
                <p className="text-accent font-medium text-sm">{attorney.title}</p>
                <p className="text-muted-foreground text-sm mt-1">{attorney.specialty}</p>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{attorney.bio}</p>
                <div className="flex gap-3 mt-4">
                  <a
                    href="#"
                    className="p-2 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={`${attorney.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="p-2 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={`Email ${attorney.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
