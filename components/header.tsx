"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/ui/logo"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.practiceAreas"), href: "/areas" },
    { name: t("nav.team"), href: "/team" },
    { name: t("nav.successStories"), href: "/#success-stories" },
    { name: t("nav.consultation"), href: "/consult" },
    { name: t("nav.contact"), href: "/#contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1E3A]/95 text-white backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28 md:h-32">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-24 md:h-28 w-auto" priority />
            <span className="sr-only">Diaz & Johnson - Migration Advocates</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white/85 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:text-white hover:bg-white/10"
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer">
                  <span className="mr-2">🇺🇸</span>
                  English {language === "en" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} className="cursor-pointer">
                  <span className="mr-2">🇪🇸</span>
                  Español {language === "es" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="tel:+13057280029" className="flex items-center gap-2 text-sm font-medium text-white">
              <Phone className="h-4 w-4" />
              305-728-0029
            </a>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/consult">{t("nav.freeConsultation")}</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-white hover:text-white hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-[#0B1E3A] text-white">
              <div className="flex flex-col gap-6 mt-8">
                <Logo className="h-24 w-auto" />
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-white/90 hover:text-white transition-colors py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-white/15 pt-6 flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={language === "en" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguage("en")}
                      className="flex-1"
                    >
                      🇺🇸 English
                    </Button>
                    <Button
                      variant={language === "es" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguage("es")}
                      className="flex-1"
                    >
                      🇪🇸 Español
                    </Button>
                  </div>
                  <a href="tel:+13057280029" className="flex items-center gap-2 text-white font-medium">
                    <Phone className="h-5 w-5" />
                    305-728-0029
                  </a>
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/consult" onClick={() => setIsOpen(false)}>
                      {t("nav.freeConsultation")}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
