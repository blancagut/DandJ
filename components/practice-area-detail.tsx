"use client"

import Link from "next/link"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import type { PracticeArea } from "@/lib/practice-areas-data"

export function PracticeAreaDetail({ area }: { area: PracticeArea }) {
  const { t } = useLanguage()

  const bullets = useMemo(
    () => [
      t("pages.practiceAreaDetail.bullet1"),
      t("pages.practiceAreaDetail.bullet2"),
      t("pages.practiceAreaDetail.bullet3"),
      t("pages.practiceAreaDetail.bullet4"),
    ],
    [t],
  )

  return (
    <section className="bg-card py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("pages.practiceAreaDetail.overview")}</p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t(area.titleKey)}</h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t(area.descKey)}</p>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">{t("pages.practiceAreaDetail.howWeHelp")}</h2>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {bullets.map((item: string) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/consultation">{t("pages.practiceAreaDetail.cta")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/practice-areas">{t("pages.practiceAreasHub.title")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
