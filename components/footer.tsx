"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { PRACTICE_AREAS } from "@/lib/practice-areas-data"

const social = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
]

export function Footer() {
  const { t } = useLanguage()

  const navigation = {
    practice: PRACTICE_AREAS.map((area) => ({
      name: t(area.titleKey),
      href: `/practice-areas/${area.slug}`,
    })),
    company: [
      { name: t("footer.aboutUs"), href: "/about" },
      { name: t("footer.ourTeam"), href: "/team" },
      { name: t("footer.successStories"), href: "/#success-stories" },
      { name: t("footer.contact"), href: "/#contact" },
    ],
    resources: [
      { name: t("footer.blog"), href: "/resources#blog" },
      { name: t("footer.faqs"), href: "/resources#faqs" },
      { name: t("footer.caseStudies"), href: "/resources#case-studies" },
      { name: t("footer.news"), href: "/resources#news" },
    ],
    legal: [
      { name: t("footer.privacyPolicy"), href: "/legal#privacy" },
      { name: t("footer.termsOfService"), href: "/legal#terms" },
      { name: t("footer.disclaimer"), href: "/legal#disclaimer" },
    ],
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="Diaz & Johnson - Migration Advocates"
                width={200}
                height={70}
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-6 text-primary-foreground/70 leading-relaxed max-w-sm">{t("footer.tagline")}</p>
            <div className="flex gap-4 mt-6">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.practiceAreas")}</h4>
            <ul className="space-y-3">
              {navigation.practice.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <div className="flex gap-6">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-primary-foreground/60 hover:text-accent transition-colors text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-primary-foreground/40 text-xs text-center mt-6">{t("footer.legalDisclaimer")}</p>
        </div>
      </div>
    </footer>
  )
}
