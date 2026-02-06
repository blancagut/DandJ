"use client"

import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Image from "next/image"
import { FadeIn } from "@/components/animations/fade-in"
import { CountUp } from "@/components/ui/count-up"

export function WhyChooseUs() {
  const { t } = useLanguage()

  const reasons = [
    { titleKey: "why.bilingual.title", descKey: "why.bilingual.desc" },
    { titleKey: "why.track.title", descKey: "why.track.desc" },
    { titleKey: "why.personalized.title", descKey: "why.personalized.desc" },
    { titleKey: "why.pricing.title", descKey: "why.pricing.desc" },
    { titleKey: "why.available.title", descKey: "why.available.desc" },
    { titleKey: "why.community.title", descKey: "why.community.desc" },
  ]

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-4/3 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="/professional-law-office-meeting-room-modern.jpg"
                  alt="Diaz & Johnson law office"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-primary text-primary-foreground p-6 rounded-lg shadow-xl">
              <p className="text-4xl font-serif font-bold">
                <CountUp to={98} suffix="%" />
              </p>
              <p className="text-primary-foreground/80 text-sm mt-1">{t("why.successRate")}</p>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <FadeIn delay={0.2} direction="right">
              <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("why.tagline")}</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">{t("why.title")}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("why.subtitle")}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {reasons.map((reason, index) => (
                  <FadeIn key={reason.titleKey} delay={0.3 + index * 0.1}>
                    <div className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">{t(reason.titleKey)}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{t(reason.descKey)}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
