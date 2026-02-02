"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Globe, FileCheck, Scale, Shield, Users, Briefcase, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function PracticeAreas() {
  const { t } = useLanguage()

  const practiceAreas = [
    {
      icon: Globe,
      titleKey: "practice.immigration.title",
      descKey: "practice.immigration.desc",
    },
    {
      icon: FileCheck,
      titleKey: "practice.greencard.title",
      descKey: "practice.greencard.desc",
    },
    {
      icon: Scale,
      titleKey: "practice.criminal.title",
      descKey: "practice.criminal.desc",
    },
    {
      icon: Shield,
      titleKey: "practice.civilrights.title",
      descKey: "practice.civilrights.desc",
    },
    {
      icon: Users,
      titleKey: "practice.family.title",
      descKey: "practice.family.desc",
    },
    {
      icon: Briefcase,
      titleKey: "practice.business.title",
      descKey: "practice.business.desc",
    },
  ]

  return (
    <section id="practice-areas" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("practice.tagline")}</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t("practice.title")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{t("practice.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceAreas.map((area) => (
            <Card
              key={area.titleKey}
              className="group border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 md:p-8">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-5">
                  <area.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{t(area.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{t(area.descKey)}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center text-primary font-medium text-sm group-hover:text-accent transition-colors"
                >
                  {t("practice.learnMore")}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
