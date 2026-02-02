"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Award, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Image from "next/image"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative pt-20 md:pt-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/miami-skyline-at-sunset-professional-law-firm.jpg"
            alt="Miami skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-4">{t("hero.tagline")}</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 md:h-14 px-8 text-base"
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 md:h-14 px-8 text-base bg-transparent"
            >
              {t("hero.callUs")}
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-primary-foreground font-semibold">{t("hero.stat1.number")}</p>
                <p className="text-primary-foreground/70 text-sm">{t("hero.stat1.label")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-primary-foreground font-semibold">{t("hero.stat2.number")}</p>
                <p className="text-primary-foreground/70 text-sm">{t("hero.stat2.label")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-primary-foreground font-semibold">{t("hero.stat3.number")}</p>
                <p className="text-primary-foreground/70 text-sm">{t("hero.stat3.label")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
