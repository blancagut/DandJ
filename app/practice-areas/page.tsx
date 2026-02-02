"use client"

import Link from "next/link"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { PRACTICE_AREAS } from "@/lib/practice-areas-data"
import { Globe, FileCheck, Scale, Shield, Users, Briefcase, ArrowRight } from "lucide-react"

const ICONS = {
  Globe,
  FileCheck,
  Scale,
  Shield,
  Users,
  Briefcase,
} as const

export default function PracticeAreasHubPage() {
  const { t } = useLanguage()

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.practiceAreasHub.title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t("pages.practiceAreasHub.subtitle")}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRACTICE_AREAS.map((area) => {
              const Icon = ICONS[area.icon]
              return (
                <Card
                  key={area.slug}
                  className="group border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-5">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-foreground mb-3">{t(area.titleKey)}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-5">{t(area.descKey)}</p>
                    <div className="flex items-center justify-between gap-3">
                      <Button asChild variant="outline" className="w-full justify-between">
                        <Link href={`/practice-areas/${area.slug}`}>
                          {t("pages.practiceAreasHub.viewDetails")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-10">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/consultation">{t("nav.freeConsultation")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
