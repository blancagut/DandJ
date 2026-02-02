"use client"

import { useState, useRef, useEffect, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

interface Message {
  id: string
  text: string
  sender: "user" | "valeria"
  timestamp: Date
  buttons?: { text: string; value: string }[]
}

export function ValeriaChat() {
  const { t, language } = useLanguage()
  const instanceId = useId()
  const messageSeqRef = useRef(0)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  const nextMessageId = () => `${instanceId}-${messageSeqRef.current++}`

  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date()
      const hours = now.getHours()
      setIsAvailable(hours >= 9 && hours < 18)
    }
    checkAvailability()
    const interval = setInterval(checkAvailability, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Intentionally no setState here: greeting is initialized when opening the chat.
  }, [isOpen, isAvailable, language, t])

  const buildGreeting = (): Message => {
    return {
      id: nextMessageId(),
      text: isAvailable ? t("chat.greeting.available") : t("chat.greeting.unavailable"),
      sender: "valeria",
      timestamp: new Date(),
      buttons: isAvailable
        ? [
            { text: t("chat.immigration"), value: "immigration" },
            { text: t("chat.criminal"), value: "criminal" },
            { text: t("chat.civil"), value: "civil" },
            { text: t("chat.greencard"), value: "greencard" },
            { text: t("chat.consultation"), value: "consultation" },
            { text: t("chat.caseStatus"), value: "status" },
          ]
        : undefined,
    }
  }

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        setIsTyping(false)
        setMessages([buildGreeting()])
      }
      return next
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleButtonClick = (value: string) => {
    const userMessage: Message = {
      id: nextMessageId(),
      text: value.charAt(0).toUpperCase() + value.slice(1),
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(
      () => {
        const responses =
          language === "es"
            ? {
                immigration: {
                  text: "Nos especializamos en todos los asuntos de inmigracion incluyendo visas, permisos de trabajo e inmigracion familiar. ¿Le gustaria agendar una consulta o conocer sobre un tipo de visa especifico?",
                  buttons: [
                    { text: "Agendar Consulta", value: "schedule" },
                    { text: "Visa H-2B", value: "h2b" },
                    { text: "Visa Familiar", value: "family" },
                    { text: "Permiso de Trabajo", value: "workpermit" },
                  ],
                },
                criminal: {
                  text: "Nuestro equipo de defensa criminal maneja una amplia gama de casos. Proporcionamos representacion fuerte y protegemos sus derechos durante todo el proceso legal. ¿Como podemos ayudarle?",
                  buttons: [
                    { text: "Agendar Consulta", value: "schedule" },
                    { text: "Evaluacion de Caso", value: "evaluation" },
                    { text: "Hablar con Abogado", value: "attorney" },
                  ],
                },
                civil: {
                  text: "Luchamos por violaciones de derechos civiles y aseguramos justicia. Nuestros abogados experimentados manejan casos de discriminacion, mala conducta policial y derechos constitucionales. ¿Cual es su situacion?",
                  buttons: [
                    { text: "Agendar Consulta", value: "schedule" },
                    { text: "Revision de Caso", value: "review" },
                    { text: "Ayuda de Emergencia", value: "emergency" },
                  ],
                },
                greencard: {
                  text: "Ayudamos a clientes a obtener tarjetas verdes a traves de varias vias incluyendo empleo, patrocinio familiar e inversion. ¿Cual categoria aplica a usted?",
                  buttons: [
                    { text: "Basada en Empleo", value: "employment" },
                    { text: "Basada en Familia", value: "familygc" },
                    { text: "Agendar Consulta", value: "schedule" },
                  ],
                },
                consultation: {
                  text: "¡Excelente! Puede agendar una consulta directamente a traves de nuestro formulario en linea. Nuestro equipo revisara su informacion y lo contactara dentro de 24 horas. ¿Le gustaria proceder?",
                  buttons: [
                    { text: "Iniciar Formulario", value: "startform" },
                    { text: "Llamar en Su Lugar", value: "call" },
                    { text: "Enviarnos Email", value: "email" },
                  ],
                },
                schedule: {
                  text: "¡Excelente! Puede agendar una consulta directamente a traves de nuestro formulario en linea. Nuestro equipo revisara su informacion y lo contactara dentro de 24 horas. ¿Le gustaria proceder?",
                  buttons: [
                    { text: "Iniciar Formulario", value: "startform" },
                    { text: "Llamar en Su Lugar", value: "call" },
                    { text: "Enviarnos Email", value: "email" },
                  ],
                },
                status: {
                  text: "Para verificar el estado de su caso, por favor proporcione su numero de referencia o contactenos a consulting@diazandjohnson.com con sus detalles.",
                  buttons: [
                    { text: "Enviarnos Email", value: "email" },
                    { text: "Menu Principal", value: "mainmenu" },
                  ],
                },
                startform: {
                  text: "¡Perfecto! Lo redirigire a nuestro formulario de consulta ahora.",
                  buttons: undefined,
                },
                call: {
                  text: "Puede comunicarse con nosotros al (305) 555-0100 durante horario de oficina (9 AM - 6 PM). ¡Esperamos hablar con usted!",
                  buttons: [{ text: "Menu Principal", value: "mainmenu" }],
                },
                email: {
                  text: "Por favor escribanos a consulting@diazandjohnson.com. Normalmente respondemos dentro de 24 horas en dias habiles.",
                  buttons: [{ text: "Menu Principal", value: "mainmenu" }],
                },
                mainmenu: {
                  text: "¿En que mas puedo ayudarle hoy?",
                  buttons: [
                    { text: t("chat.immigration"), value: "immigration" },
                    { text: t("chat.criminal"), value: "criminal" },
                    { text: t("chat.civil"), value: "civil" },
                    { text: t("chat.greencard"), value: "greencard" },
                    { text: t("chat.consultation"), value: "consultation" },
                  ],
                },
                default: {
                  text: "Puedo proporcionar mas informacion sobre eso. ¿Le gustaria agendar una consulta con uno de nuestros abogados?",
                  buttons: [
                    { text: "Si, Agendar", value: "schedule" },
                    { text: "Mas Informacion", value: "mainmenu" },
                  ],
                },
              }
            : {
                immigration: {
                  text: "We specialize in all immigration matters including visas, work permits, and family-based immigration. Would you like to schedule a consultation or learn about a specific visa type?",
                  buttons: [
                    { text: "Schedule Consultation", value: "schedule" },
                    { text: "H-2B Visa", value: "h2b" },
                    { text: "Family Visa", value: "family" },
                    { text: "Work Permit", value: "workpermit" },
                  ],
                },
                criminal: {
                  text: "Our criminal defense team handles a wide range of cases. We provide strong representation and protect your rights throughout the legal process. How can we help?",
                  buttons: [
                    { text: "Schedule Consultation", value: "schedule" },
                    { text: "Case Evaluation", value: "evaluation" },
                    { text: "Speak to Attorney", value: "attorney" },
                  ],
                },
                civil: {
                  text: "We fight for civil rights violations and ensure justice. Our experienced attorneys handle discrimination, police misconduct, and constitutional rights cases. What's your situation?",
                  buttons: [
                    { text: "Schedule Consultation", value: "schedule" },
                    { text: "Case Review", value: "review" },
                    { text: "Emergency Help", value: "emergency" },
                  ],
                },
                greencard: {
                  text: "We help clients obtain green cards through various pathways including employment, family sponsorship, and investment. Which category applies to you?",
                  buttons: [
                    { text: "Employment-Based", value: "employment" },
                    { text: "Family-Based", value: "familygc" },
                    { text: "Schedule Consultation", value: "schedule" },
                  ],
                },
                consultation: {
                  text: "Great! You can schedule a consultation directly through our online form. Our team will review your information and contact you within 24 hours. Would you like to proceed?",
                  buttons: [
                    { text: "Start Consultation Form", value: "startform" },
                    { text: "Call Instead", value: "call" },
                    { text: "Email Us", value: "email" },
                  ],
                },
                schedule: {
                  text: "Great! You can schedule a consultation directly through our online form. Our team will review your information and contact you within 24 hours. Would you like to proceed?",
                  buttons: [
                    { text: "Start Consultation Form", value: "startform" },
                    { text: "Call Instead", value: "call" },
                    { text: "Email Us", value: "email" },
                  ],
                },
                status: {
                  text: "To check your case status, please provide your case reference number or contact us at consulting@diazandjohnson.com with your details.",
                  buttons: [
                    { text: "Email Us", value: "email" },
                    { text: "Back to Main Menu", value: "mainmenu" },
                  ],
                },
                startform: { text: "Perfect! I'll redirect you to our consultation form now.", buttons: undefined },
                call: {
                  text: "You can reach us at (305) 555-0100 during business hours (9 AM - 6 PM). We look forward to speaking with you!",
                  buttons: [{ text: "Back to Main Menu", value: "mainmenu" }],
                },
                email: {
                  text: "Please email us at consulting@diazandjohnson.com. We typically respond within 24 hours during business days.",
                  buttons: [{ text: "Back to Main Menu", value: "mainmenu" }],
                },
                mainmenu: {
                  text: "How else can I assist you today?",
                  buttons: [
                    { text: t("chat.immigration"), value: "immigration" },
                    { text: t("chat.criminal"), value: "criminal" },
                    { text: t("chat.civil"), value: "civil" },
                    { text: t("chat.greencard"), value: "greencard" },
                    { text: t("chat.consultation"), value: "consultation" },
                  ],
                },
                default: {
                  text: "I can provide more information about that. Would you like to schedule a consultation with one of our attorneys?",
                  buttons: [
                    { text: "Yes, Schedule", value: "schedule" },
                    { text: "More Information", value: "mainmenu" },
                  ],
                },
              }

        const response = responses[value as keyof typeof responses] || responses.default
        const responseText = response.text
        const responseButtons = response.buttons

        if (value === "startform") {
          setTimeout(() => {
            window.location.href = "/consultation"
          }, 1500)
        }

        const valeriaMessage: Message = {
          id: nextMessageId(),
          text: responseText,
          sender: "valeria",
          timestamp: new Date(),
          buttons: responseButtons,
        }
        setMessages((prev) => [...prev, valeriaMessage])
        setIsTyping(false)
      },
      1100,
    )
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-lg">
                    V
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 ${isAvailable ? "bg-green-500" : "bg-red-500"} rounded-full border-2 border-primary`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">Valeria</h3>
                  <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                    {isAvailable ? (
                      <>
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        {t("chat.available")}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        {t("chat.hours")}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-secondary/30">
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border border-border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>

                  {message.buttons && message.sender === "valeria" && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-2">
                      {message.buttons.map((button, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleButtonClick(button.value)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {button.text}
                        </Button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6 }}
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card">
              <p className="text-xs text-center text-muted-foreground">
                {isAvailable ? (
                  t("chat.helpText")
                ) : (
                  <>
                    {t("chat.officeHours")}
                    <br />
                    <a href="mailto:consulting@diazandjohnson.com" className="text-accent hover:underline">
                      consulting@diazandjohnson.com
                    </a>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 md:right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-accent/50 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && isAvailable && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          />
        )}
      </motion.button>
    </>
  )
}
