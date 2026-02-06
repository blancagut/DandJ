"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { FadeIn } from "@/components/animations/fade-in"

export function SuccessStoriesCarousel() {
  const { t, language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const successStories =
    language === "es"
      ? [
          {
            id: 1,
            image: "/clients/client-1.jpeg",
            title: "Tarjeta Verde Aprobada",
            description: "Despues de anos de espera, este joven profesional recibio su residencia permanente.",
            caseType: "Tarjeta Verde por Empleo",
          },
          {
            id: 2,
            image: "/clients/client-2.jpeg",
            title: "Familia Unida",
            description: "Una familia de cuatro obtuvo exitosamente sus tarjetas verdes juntos.",
            caseType: "Inmigracion Familiar",
          },
          {
            id: 3,
            image: "/clients/client-3.jpeg",
            title: "Hermanos Reunidos",
            description: "Dos hermanos lograron su sueno americano con aprobaciones de visa exitosas.",
            caseType: "Patrocinio Familiar",
          },
          {
            id: 4,
            image: "/clients/client-4.jpeg",
            title: "Exito de Pareja",
            description:
              "Una pareja trabajadora recibio sus documentos de inmigracion despues de nuestra dedicada representacion.",
            caseType: "Visa de Conyuge",
          },
          {
            id: 5,
            image: "/clients/client-5.jpeg",
            title: "Logro Profesional",
            description: "Un profesional distinguido aseguro su autorizacion de trabajo y camino a la residencia.",
            caseType: "Visa H-2B",
          },
          {
            id: 6,
            image: "/clients/client-6.jpeg",
            title: "Sueno Realizado",
            description:
              "Despues de navegar documentacion compleja, este cliente logro el estatus de residente permanente.",
            caseType: "Ajuste de Estatus",
          },
          {
            id: 7,
            image: "/clients/client-7.jpeg",
            title: "Exito del Equipo",
            description:
              "Un grupo de trabajadores dedicados obtuvieron sus visas de trabajo a traves de nuestros servicios de inmigracion corporativa.",
            caseType: "Inmigracion Corporativa",
          },
        ]
      : [
          {
            id: 1,
            image: "/clients/client-1.jpeg",
            title: "Green Card Approved",
            description: "After years of waiting, this young professional received his permanent residency.",
            caseType: "Employment-Based Green Card",
          },
          {
            id: 2,
            image: "/clients/client-2.jpeg",
            title: "Family United",
            description: "A family of four successfully obtained their green cards together.",
            caseType: "Family-Based Immigration",
          },
          {
            id: 3,
            image: "/clients/client-3.jpeg",
            title: "Brothers Reunited",
            description: "Two brothers achieved their American dream with successful visa approvals.",
            caseType: "Family Sponsorship",
          },
          {
            id: 4,
            image: "/clients/client-4.jpeg",
            title: "Couple's Success",
            description:
              "A hardworking couple received their immigration documents after our dedicated representation.",
            caseType: "Spouse Visa",
          },
          {
            id: 5,
            image: "/clients/client-5.jpeg",
            title: "Professional Achievement",
            description: "A distinguished professional secured his work authorization and path to residency.",
            caseType: "H-2B Visa",
          },
          {
            id: 6,
            image: "/clients/client-6.jpeg",
            title: "Dream Realized",
            description: "After navigating complex paperwork, this client achieved permanent resident status.",
            caseType: "Adjustment of Status",
          },
          {
            id: 7,
            image: "/clients/client-7.jpeg",
            title: "Team Success",
            description:
              "A group of dedicated workers obtained their work visas through our corporate immigration services.",
            caseType: "Corporate Immigration",
          },
        ]

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % successStories.length)
  }, [successStories.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length)
  }, [successStories.length])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const getVisibleSlides = () => {
    const slides = []
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + successStories.length) % successStories.length
      slides.push({ ...successStories[index], position: i })
    }
    return slides
  }

  return (
    <section id="success-stories" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <FadeIn>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("success.tagline")}</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              {t("success.title")}
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">{t("success.subtitle")}</p>
          </FadeIn>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-full border-border bg-card hover:bg-accent hover:text-accent-foreground shrink-0"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center justify-center gap-6 max-w-5xl mx-auto">
              {getVisibleSlides().map((story, idx) => (
                <Card
                  key={`${story.id}-${idx}`}
                  className={`transition-all duration-500 ease-out border-border overflow-hidden ${
                    story.position === 0 ? "w-80 lg:w-96 scale-105 opacity-100 shadow-2xl" : "w-72 scale-95 opacity-40"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-200">
                    <Image
                      src={story.image || "/placeholder.svg"}
                      alt={story.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {story.position === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 text-sm font-semibold">{t("success.approved")}</span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-white mb-2 text-balance">{story.title}</h3>
                        <p className="text-white/90 text-sm leading-relaxed mb-3">{story.description}</p>
                        <span className="inline-block bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                          {story.caseType}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-full border-border bg-card hover:bg-accent hover:text-accent-foreground shrink-0"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="relative max-w-sm mx-auto px-12">
              <div className="overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border overflow-hidden shadow-xl">
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-200">
                        <Image
                          src={successStories[currentIndex].image || "/placeholder.svg"}
                          alt={successStories[currentIndex].title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <span className="text-green-400 text-sm font-semibold">{t("success.approved")}</span>
                          </div>
                          <h3 className="font-serif text-xl font-bold text-white mb-2 text-balance">
                            {successStories[currentIndex].title}
                          </h3>
                          <p className="text-white/90 text-sm leading-relaxed mb-3">
                            {successStories[currentIndex].description}
                          </p>
                          <span className="inline-block bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                            {successStories[currentIndex].caseType}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-lg"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-lg"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-accent" : "w-2 bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <FadeIn delay={0.2} direction="up">
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-bold text-primary">{t("success.stat1.number")}</p>
              <p className="text-muted-foreground text-sm md:text-base mt-2">{t("success.stat1.label")}</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-bold text-primary">{t("success.stat2.number")}</p>
              <p className="text-muted-foreground text-sm md:text-base mt-2">{t("success.stat2.label")}</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-bold text-primary">{t("success.stat3.number")}</p>
              <p className="text-muted-foreground text-sm md:text-base mt-2">{t("success.stat3.label")}</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-bold text-primary">{t("success.stat4.number")}</p>
              <p className="text-muted-foreground text-sm md:text-base mt-2">{t("success.stat4.label")}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
