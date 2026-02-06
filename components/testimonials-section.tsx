import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"

const testimonials = [
  {
    name: "Carlos Mendez",
    location: "Hialeah, FL",
    text: "After years of struggling with my immigration case, Diaz & Johnson made the impossible possible. I'm now a proud U.S. citizen thanks to their expertise and dedication.",
    rating: 5,
  },
  {
    name: "Jennifer Williams",
    location: "Miami Beach, FL",
    text: "When I was wrongly accused, Robert Johnson fought for me like no one else would. His courtroom skills and genuine care for my case made all the difference.",
    rating: 5,
  },
  {
    name: "The Rodriguez Family",
    location: "Coral Gables, FL",
    text: "Maria helped our entire family obtain green cards. Her patience, knowledge, and compassion during a stressful process was truly remarkable.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <FadeIn>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Client Stories</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Don&apos;t just take our word for it. Hear from the people whose lives we&apos;ve helped transform through dedicated
              legal representation.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.1} className="h-full">
              <Card className="border-border bg-card h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 md:p-8">
                  <Quote className="h-10 w-10 text-accent/30 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
