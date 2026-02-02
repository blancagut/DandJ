"use client"

import Link from "next/link"
import { CheckCircle2, TrendingUp, Award, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import type { PracticeArea } from "@/lib/practice-areas-data"
import { getPracticeAreaContent } from "@/lib/practice-areas-content"

export function PracticeAreaDetail({ area }: { area: PracticeArea }) {
  const { language, t } = useLanguage()
  const content = getPracticeAreaContent(area.slug)

  if (!content) {
    return (
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t(area.titleKey)}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{t(area.descKey)}</p>
        </div>
      </section>
    )
  }

  const overview = language === "es" ? content.overviewEs : content.overviewEn
  const howWeHelp = language === "es" ? content.howWeHelpEs : content.howWeHelpEn

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">
            {t("pages.practiceAreaDetail.overview")}
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">{t(area.titleKey)}</h1>
          <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-3xl">{overview}</p>
        </div>
      </section>

      {/* Stats Section */}
      {content.stats && (
        <section className="bg-card border-b border-border py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground">{content.stats.casesWon.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === "es" ? "Casos Ganados" : "Cases Won"}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground">{content.stats.yearsExperience}+</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === "es" ? "Años de Experiencia" : "Years of Experience"}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground">{content.stats.successRate}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === "es" ? "Tasa de Éxito" : "Success Rate"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* How We Help */}
        <Card className="mb-12">
          <CardContent className="p-8 md:p-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
              {language === "es" ? "¿Cómo Podemos Ayudarte?" : "How We Can Help You"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {howWeHelp.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/consult">
                  {language === "es" ? "Consulta Gratuita" : "Free Consultation"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#contact">{language === "es" ? "Contáctenos" : "Contact Us"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        {content.successStories && content.successStories.length > 0 && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
              {language === "es" ? "Historias de Éxito" : "Success Stories"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.successStories.map((story) => (
                <Card key={story.id} className="border-border hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline" className="text-primary border-primary">
                        {story.clientInitials}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{story.year}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                      {language === "es" ? story.titleEs : story.titleEn}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {language === "es" ? story.summaryEs : story.summaryEn}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      {story.outcome}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              {language === "es"
                ? "¿Listo para Empezar su Caso?"
                : "Ready to Start Your Case?"}
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              {language === "es"
                ? "Nuestro equipo de más de 40 abogados afiliados en todo EE.UU. está listo para ayudarle. Programe su consulta gratuita hoy."
                : "Our team of 40+ affiliated attorneys across the U.S. is ready to help you. Schedule your free consultation today."}
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-card text-foreground hover:bg-card/90"
            >
              <Link href="/consult">
                {language === "es" ? "Agendar Consulta Gratuita" : "Schedule Free Consultation"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
