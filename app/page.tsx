import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PracticeAreas } from "@/components/practice-areas"
import { WhyChooseUs } from "@/components/why-choose-us"
import { AttorneysSection } from "@/components/attorneys-section"
import { ResultsSection } from "@/components/results-section"
import { SuccessStoriesCarousel } from "@/components/success-stories-carousel"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ValeriaChat } from "@/components/valeria-chat"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PracticeAreas />
      <WhyChooseUs />
      <AttorneysSection />
      <ResultsSection />
      <SuccessStoriesCarousel />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <ValeriaChat />
    </main>
  )
}
