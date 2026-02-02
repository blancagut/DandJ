"use client"

import { SiteFrame } from "@/components/site-frame"
import { AttorneysSection } from "@/components/attorneys-section"
import { ContactSection } from "@/components/contact-section"
import { useLanguage } from "@/lib/language-context"

export default function TeamPage() {
  const { t } = useLanguage()

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.team.title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-3xl">{t("pages.team.subtitle")}</p>
        </div>
      </section>

      <AttorneysSection />
      <ContactSection />
    </SiteFrame>
  )
}
