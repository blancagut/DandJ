"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { postJson, type ApiError } from "@/lib/api/client"

export function ContactSection() {
  const { t, language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    caseType: "",
    message: "",
    website: "", // honeypot
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const json = await postJson<typeof formValues & { language: string }, { received: true }>("/api/contact", {
        ...formValues,
        language,
      })

      if (json.ok !== true) {
        const err = json as ApiError
        setSubmitError(err.error.message)
        if (err.error.fieldErrors) setFieldErrors(err.error.fieldErrors)
        return
      }

      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 6000)
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        caseType: "",
        message: "",
        website: "",
      })
    } catch (err) {
      console.error("[Contact] Submit error:", err)
      setSubmitError(
        language === "es"
          ? "Error de conexión. Por favor intente de nuevo."
          : "Connection error. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const caseTypes =
    language === "es"
      ? [
          { value: "immigration", label: "Ley de Inmigracion" },
          { value: "greencard", label: "Tarjeta Verde / Visa" },
          { value: "criminal", label: "Defensa Criminal" },
          { value: "civil-rights", label: "Derechos Civiles" },
          { value: "family", label: "Derecho Familiar" },
          { value: "business", label: "Inmigracion de Negocios" },
          { value: "other", label: "Otro" },
        ]
      : [
          { value: "immigration", label: "Immigration Law" },
          { value: "greencard", label: "Green Card / Visa" },
          { value: "criminal", label: "Criminal Defense" },
          { value: "civil-rights", label: "Civil Rights" },
          { value: "family", label: "Family Law" },
          { value: "business", label: "Business Immigration" },
          { value: "other", label: "Other" },
        ]

  return (
    <section id="contact" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">{t("contact.tagline")}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">{t("contact.title")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("contact.subtitle")}</p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t("contact.location.title")}</h4>
                  <p className="text-muted-foreground mt-1 whitespace-pre-line">{t("contact.location.address")}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t("contact.phone.title")}</h4>
                  <p className="text-muted-foreground mt-1">
                    <a href="tel:+13057280029" className="hover:text-accent transition-colors">
                      305-728-0029
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t("contact.email.title")}</h4>
                  <p className="text-muted-foreground mt-1">
                    <a href="mailto:info@diazjohnsonlaw.com" className="hover:text-accent transition-colors">
                      info@diazjohnsonlaw.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-primary/10 rounded-lg h-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t("contact.hours.title")}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t("contact.hours.weekday")}
                    <br />
                    {t("contact.hours.weekend")}
                    <br />
                    <span className="text-accent font-medium">{t("contact.hours.emergency")}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3592.4!2d-80.13!3d25.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b3e!2s1680%20Michigan%20Ave%20%23700%2C%20Miami%20Beach%2C%20FL%2033139!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office location map"
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-muted rounded-xl p-6 md:p-8 lg:p-10">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-6">{t("contact.form.title")}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="website"
                value={formValues.website}
                onChange={(e) => setFormValues((p) => ({ ...p, website: e.target.value }))}
                autoComplete="off"
                tabIndex={-1}
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("contact.form.firstName")}</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="h-12 bg-card"
                    value={formValues.firstName}
                    onChange={(e) => setFormValues((p) => ({ ...p, firstName: e.target.value }))}
                  />
                  {fieldErrors.firstName?.length ? (
                    <p className="text-sm text-destructive">{fieldErrors.firstName[0]}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("contact.form.lastName")}</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="h-12 bg-card"
                    value={formValues.lastName}
                    onChange={(e) => setFormValues((p) => ({ ...p, lastName: e.target.value }))}
                  />
                  {fieldErrors.lastName?.length ? (
                    <p className="text-sm text-destructive">{fieldErrors.lastName[0]}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.form.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-12 bg-card"
                  value={formValues.email}
                  onChange={(e) => setFormValues((p) => ({ ...p, email: e.target.value }))}
                />
                {fieldErrors.email?.length ? <p className="text-sm text-destructive">{fieldErrors.email[0]}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="305-728-0029"
                  required
                  className="h-12 bg-card"
                  value={formValues.phone}
                  onChange={(e) => setFormValues((p) => ({ ...p, phone: e.target.value }))}
                />
                {fieldErrors.phone?.length ? <p className="text-sm text-destructive">{fieldErrors.phone[0]}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseType">{t("contact.form.caseType")}</Label>
                <Select
                  required
                  value={formValues.caseType}
                  onValueChange={(value) => setFormValues((p) => ({ ...p, caseType: value }))}
                >
                  <SelectTrigger className="h-12 bg-card">
                    <SelectValue placeholder={t("contact.form.caseType.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.caseType?.length ? (
                  <p className="text-sm text-destructive">{fieldErrors.caseType[0]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.form.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("contact.form.message.placeholder")}
                  rows={4}
                  required
                  className="bg-card resize-none"
                  value={formValues.message}
                  onChange={(e) => setFormValues((p) => ({ ...p, message: e.target.value }))}
                />
                {fieldErrors.message?.length ? (
                  <p className="text-sm text-destructive">{fieldErrors.message[0]}</p>
                ) : null}
              </div>

              {submitSuccess ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-green-800 font-medium">{t("contact.form.success")}</p>
                </div>
              ) : null}

              {submitError ? <p className="text-sm text-destructive text-center">{submitError}</p> : null}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
              </Button>

              <p className="text-muted-foreground text-sm text-center">{t("contact.form.privacy")}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
