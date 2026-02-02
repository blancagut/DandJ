"use client"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export default function LegalPage() {
  const { t } = useLanguage()

  const sections = [
    { id: "privacy", title: t("footer.privacyPolicy"), body: t("pages.legal.privacy.body") },
    { id: "terms", title: t("footer.termsOfService"), body: t("pages.legal.terms.body") },
    { id: "disclaimer", title: t("footer.disclaimer"), body: t("pages.legal.disclaimer.body") },
  ]

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.legal.title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t("pages.legal.subtitle")}</p>

          <div className="mt-10 grid grid-cols-1 gap-6">
            {sections.map((s) => (
              <Card key={s.id} id={s.id} className="border-border bg-card scroll-mt-24">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">{s.title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
