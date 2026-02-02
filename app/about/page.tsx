"use client"

import Link from "next/link"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    t("pages.about.values.item1"),
    t("pages.about.values.item2"),
    t("pages.about.values.item3"),
    t("pages.about.values.item4"),
  ]

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.about.title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t("pages.about.subtitle")}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground">{t("pages.about.mission.title")}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{t("pages.about.mission.body")}</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground">{t("pages.about.values.title")}</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  {values.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/consultation">{t("pages.about.cta")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/practice-areas">{t("nav.practiceAreas")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
