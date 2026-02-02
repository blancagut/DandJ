"use client"

import Link from "next/link"

import { SiteFrame } from "@/components/site-frame"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <SiteFrame>
      <section className="bg-card py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">{t("pages.notFound.title")}</h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{t("pages.notFound.subtitle")}</p>
            <div className="mt-8">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/">{t("pages.notFound.home")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
