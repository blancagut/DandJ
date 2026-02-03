"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Upload, X, FileText, CheckCircle2, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const consultationFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(2, "Please enter your nationality"),
  currentLocation: z.string().min(2, "Please enter your current location"),
  caseType: z.string().min(1, "Please select a case type"),
  urgency: z.string().min(1, "Please select urgency level"),
  caseDescription: z.string().min(20, "Please provide at least 20 characters describing your case"),
  previousAttorney: z.string().optional(),
  courtDate: z.string().optional(),
  preferredContactMethod: z.string().min(1, "Please select a preferred contact method"),
  preferredConsultationTime: z.string().optional(),
  referralSource: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

type ConsultationFormValues = z.infer<typeof consultationFormSchema>

export function ConsultationForm() {
  const { language } = useLanguage()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState("")

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      currentLocation: "",
      caseType: "",
      urgency: "",
      caseDescription: "",
      previousAttorney: "",
      courtDate: "",
      preferredContactMethod: "",
      preferredConsultationTime: "",
      referralSource: "",
      agreeToTerms: false,
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type. Please upload PDF, JPG, PNG, or DOC files.`)
        return false
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`)
        return false
      }

      return true
    })

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ConsultationFormValues) => {
    // Honeypot check - si tiene valor, es un bot
    if (honeypot) {
      setSubmitSuccess(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase
      const { error } = await supabase
        .from("consultation_requests")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          date_of_birth: data.dateOfBirth || null,
          nationality: data.nationality,
          current_location: data.currentLocation,
          case_type: data.caseType,
          urgency: data.urgency,
          case_description: data.caseDescription,
          previous_attorney: data.previousAttorney || null,
          court_date: data.courtDate || null,
          preferred_contact_method: data.preferredContactMethod,
          preferred_consultation_time: data.preferredConsultationTime || null,
          referral_source: data.referralSource || null,
          files: uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          language: language,
          status: "new",
        })

      if (error) {
        console.error("Supabase insert error:", error)
        setSubmitError("Error al enviar. Por favor intente de nuevo.")
        return
      }

      setSubmitSuccess(true)
    } catch (err) {
      console.error("Submit error:", err)
      setSubmitError("Error de conexión. Por favor intente de nuevo.")
    } finally {
      setIsSubmitting(false)
    }

    // Reset form after successful submission
    setTimeout(() => {
      form.reset()
      setUploadedFiles([])
      setSubmitSuccess(false)
    }, 5000)
  }

  if (submitSuccess) {
    return (
      <section className="py-20 md:py-28 bg-background min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-xl p-8 md:p-12 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Consultation Request Submitted Successfully!
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Thank you for choosing Diaz & Johnson. One of our attorneys will review your case and contact you within
              24 hours.
            </p>
            <p className="text-muted-foreground mb-8">Please check your email for a confirmation and next steps.</p>
            <Button
              size="lg"
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Case Evaluation</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Complete Consultation Request
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Fill out this comprehensive form to help us understand your case better. Upload any relevant documents to
            expedite the evaluation process.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 bg-card">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {submitError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {submitError}
                    </div>
                  ) : null}
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(305) 555-1234" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mexican, Colombian" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentLocation"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Current Location *</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State, Country" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Case Information */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b">
                      Case Information
                    </h3>
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="caseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Legal Matter *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select case type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immigration-visa">Immigration - Visa Application</SelectItem>
                                <SelectItem value="immigration-greencard">Immigration - Green Card</SelectItem>
                                <SelectItem value="immigration-citizenship">Immigration - Citizenship</SelectItem>
                                <SelectItem value="immigration-deportation">
                                  Immigration - Deportation Defense
                                </SelectItem>
                                <SelectItem value="immigration-asylum">Immigration - Asylum</SelectItem>
                                <SelectItem value="criminal-defense">Criminal Defense</SelectItem>
                                <SelectItem value="civil-rights">Civil Rights Violation</SelectItem>
                                <SelectItem value="family-law">Family Law</SelectItem>
                                <SelectItem value="business-immigration">Business Immigration</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgency Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate (within 24 hours)</SelectItem>
                                <SelectItem value="urgent">Urgent (within 1 week)</SelectItem>
                                <SelectItem value="normal">Normal (within 2 weeks)</SelectItem>
                                <SelectItem value="planning">Planning Ahead</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caseDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detailed Case Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide a detailed description of your case, including dates, circumstances, and any relevant information..."
                                rows={6}
                                {...field}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum 20 characters. Be as detailed as possible to help us understand your situation.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="previousAttorney"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previous Attorney (if any)</FormLabel>
                              <FormControl>
                                <Input placeholder="Attorney name or firm" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="courtDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Upcoming Court Date (if applicable)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b">
                      Upload Documents
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Supporting Documents (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload relevant documents such as passports, visas, court documents, or any other supporting
                          materials. Accepted formats: PDF, JPG, PNG, DOC (Max 10MB per file)
                        </p>

                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-foreground font-medium mb-1">Click to upload files</p>
                            <p className="text-sm text-muted-foreground">or drag and drop</p>
                          </label>
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Uploaded Files ({uploadedFiles.length})</Label>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-accent" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Preferences */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-4 pb-2 border-b">
                      Contact Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="phone">Phone Call</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="video">Video Call</SelectItem>
                                <SelectItem value="in-person">In-Person Meeting</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredConsultationTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Consultation Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                                <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                                <SelectItem value="weekend">Weekend</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="referralSource"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>How did you hear about us?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="google">Google Search</SelectItem>
                                <SelectItem value="social-media">Social Media</SelectItem>
                                <SelectItem value="referral">Friend/Family Referral</SelectItem>
                                <SelectItem value="previous-client">Previous Client</SelectItem>
                                <SelectItem value="advertisement">Advertisement</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I agree to the terms and conditions *</FormLabel>
                            <FormDescription>
                              By submitting this form, you agree to our privacy policy and terms of service. Your
                              information will be kept strictly confidential and will only be used to evaluate and
                              respond to your consultation request.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Case Review</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      Our attorneys will review your information within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Initial Contact</h4>
                    <p className="text-muted-foreground text-sm mt-1">We&apos;ll reach out to schedule your consultation.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Consultation</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      Meet with an attorney to discuss your case in detail.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Action Plan</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      Receive a clear strategy and next steps for your case.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary text-primary-foreground">
              <h3 className="font-serif text-xl font-bold mb-4">Need Immediate Assistance?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Call us now</p>
                    <a href="tel:+13057280029" className="font-semibold hover:underline">
                      305-728-0029
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Email us</p>
                    <a href="mailto:info@diazjohnsonlaw.com" className="font-semibold hover:underline">
                      info@diazjohnsonlaw.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Office Hours</p>
                    <p className="font-semibold">Mon-Fri: 8 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Location</p>
                    <p className="font-semibold">Miami, FL 33131</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                <p className="text-sm opacity-90 text-center">24/7 Emergency Line Available for Urgent Cases</p>
              </div>
            </Card>

            <Card className="p-6 bg-muted">
              <h3 className="font-serif text-lg font-bold text-foreground mb-3">Privacy & Security</h3>
              <p className="text-muted-foreground text-sm">
                Your information is protected by attorney-client privilege and encrypted using industry-standard
                security protocols. We never share your personal information without your explicit consent.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
