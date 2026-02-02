"use client"

import Link from "next/link"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function ResourcesPage() {
  const { t } = useLanguage()

  const resources = [
    { id: "blog", title: t("footer.blog"), body: t("pages.resources.comingSoon") },
    { id: "faqs", title: t("footer.faqs"), body: t("pages.resources.comingSoon") },
    { id: "case-studies", title: t("footer.caseStudies"), body: t("pages.resources.comingSoon") },
    { id: "news", title: t("footer.news"), body: t("pages.resources.comingSoon") },
  ]

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.resources.title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t("pages.resources.subtitle")}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((r) => (
              <Card key={r.id} id={r.id} className="border-border bg-card scroll-mt-24">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">{r.title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{r.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/consultation">{t("nav.freeConsultation")}</Link>
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
