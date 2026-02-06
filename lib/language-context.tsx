"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = "language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with "en" to match server render, then hydrate to stored value
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // After mount, read the actual stored language
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === "es") {
      setLanguageState("es")
    }
    setMounted(true)
  }, [])

  // Listen for changes (other tabs, manual changes)
  useEffect(() => {
    if (!mounted) return

    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        setLanguageState(event.newValue === "es" ? "es" : "en")
      }
    }

    const onCustom = () => {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      setLanguageState(stored === "es" ? "es" : "en")
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("language-change", onCustom)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("language-change", onCustom)
    }
  }, [mounted])

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    setLanguageState(lang)
    window.dispatchEvent(new Event("language-change"))
  }, [])

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] || translations["en"]?.[key] || key
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => translations["en"]?.[key] || key,
    }
  }
  return context
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.practiceAreas": "Practice Areas",
    "nav.team": "Our Team",
    "nav.successStories": "Success Stories",
    "nav.consultation": "Consultation",
    "nav.contact": "Contact",
    "nav.freeConsultation": "Free Consultation",

    // Hero Section
    "hero.tagline": "Miami's Trusted Legal Advocates",
    "hero.title": "Fighting for Your Rights, Protecting Your Future",
    "hero.subtitle":
      "For over 25 years, Diaz & Johnson has been a beacon of hope for immigrants, families, and individuals facing legal challenges in South Florida.",
    "hero.cta": "Schedule Free Consultation",
    "hero.callUs": "Call (305) 728-0029",
    "hero.stat1.number": "5,000+",
    "hero.stat1.label": "Cases Won",
    "hero.stat2.number": "25+ Years",
    "hero.stat2.label": "Experience",
    "hero.stat3.number": "24/7",
    "hero.stat3.label": "Available",

    // Practice Areas
    "practice.tagline": "Our Expertise",
    "practice.title": "Practice Areas",
    "practice.subtitle":
      "We provide comprehensive legal services across multiple practice areas, ensuring you receive the specialized attention your case deserves.",
    "practice.immigration.title": "Immigration Law",
    "practice.immigration.desc":
      "Comprehensive immigration services including family-based petitions, employment visas, naturalization, and deportation defense.",
    "practice.greencard.title": "Green Cards",
    "practice.greencard.desc":
      "Expert guidance through the permanent residency process, including adjustment of status, consular processing, and renewals.",
    "practice.criminal.title": "Criminal Defense",
    "practice.criminal.desc":
      "Aggressive defense for all criminal charges, from misdemeanors to serious felonies. Protecting your rights at every step.",
    "practice.civilrights.title": "Civil Rights",
    "practice.civilrights.desc":
      "Standing up against discrimination, police misconduct, and violations of constitutional rights.",
    "practice.family.title": "Family Law",
    "practice.family.desc":
      "Compassionate representation in divorce, custody, child support, and domestic violence matters.",
    "practice.business.title": "Business Immigration",
    "practice.business.desc":
      "Helping businesses navigate work visas, labor certifications, and corporate immigration compliance.",
    "practice.learnMore": "Learn More",

    // Why Choose Us
    "why.tagline": "Why Choose Us",
    "why.title": "Dedicated to Your Success",
    "why.subtitle":
      "At Diaz & Johnson, we understand that legal matters can be overwhelming. That's why we're committed to providing not just exceptional legal representation, but also peace of mind throughout your journey.",
    "why.bilingual.title": "Bilingual Team",
    "why.bilingual.desc": "Fluent in English and Spanish, we ensure clear communication with all our clients.",
    "why.track.title": "Proven Track Record",
    "why.track.desc": "Over 5,000 successful cases and a 98% client satisfaction rate.",
    "why.personalized.title": "Personalized Attention",
    "why.personalized.desc": "Every case is unique. We tailor our strategy to your specific situation.",
    "why.pricing.title": "Transparent Pricing",
    "why.pricing.desc": "No hidden fees. We provide clear, upfront pricing for all services.",
    "why.available.title": "Available 24/7",
    "why.available.desc": "Legal emergencies don't wait. Neither do we.",
    "why.community.title": "Community Focused",
    "why.community.desc": "Deep roots in Miami's diverse communities for over two decades.",
    "why.successRate": "Success Rate",

    // Attorneys
    "attorneys.tagline": "Meet Our Team",
    "attorneys.title": "Experienced Legal Counsel",
    "attorneys.subtitle":
      "Our team of dedicated attorneys brings decades of combined experience and a genuine passion for helping our clients succeed.",

    // Success Stories
    "success.tagline": "Real Results",
    "success.title": "Our Satisfied Clients",
    "success.subtitle": "Every success story represents a family reunited, a dream achieved, and a future secured.",
    "success.approved": "Case Approved",
    "success.stat1.number": "5,000+",
    "success.stat1.label": "Cases Resolved",
    "success.stat2.number": "98%",
    "success.stat2.label": "Success Rate",
    "success.stat3.number": "25+",
    "success.stat3.label": "Years Experience",
    "success.stat4.number": "50+",
    "success.stat4.label": "Countries Served",

    // Contact
    "contact.tagline": "Get In Touch",
    "contact.title": "Schedule Your Free Consultation",
    "contact.subtitle":
      "Take the first step toward resolving your legal matter. Contact us today for a confidential consultation with one of our experienced attorneys.",
    "contact.location.title": "Office Location",
    "contact.location.address": "1680 Michigan Ave, Ste 700\nMiami Beach, FL 33139",
    "contact.phone.title": "Phone",
    "contact.email.title": "Email",
    "contact.hours.title": "Office Hours",
    "contact.hours.weekday": "Mon - Fri: 8:00 AM - 6:00 PM",
    "contact.hours.weekend": "Sat: 9:00 AM - 2:00 PM",
    "contact.hours.emergency": "24/7 Emergency Line Available",
    "contact.form.title": "Request a Consultation",
    "contact.form.firstName": "First Name",
    "contact.form.lastName": "Last Name",
    "contact.form.email": "Email",
    "contact.form.phone": "Phone",
    "contact.form.caseType": "Case Type",
    "contact.form.caseType.placeholder": "Select a practice area",
    "contact.form.message": "Tell Us About Your Case",
    "contact.form.message.placeholder": "Please describe your legal situation...",
    "contact.form.submit": "Submit Request",
    "contact.form.submitting": "Submitting...",
    "contact.form.privacy":
      "By submitting this form, you agree to our privacy policy. Your information will be kept strictly confidential.",
    "contact.form.success": "Thank you for your message. We will contact you shortly.",

    // Footer
    "footer.tagline":
      "Serving the Miami community for over 25 years with dedicated, compassionate, and results-driven legal representation in immigration, criminal defense, and civil rights.",
    "footer.practiceAreas": "Practice Areas",
    "footer.company": "Company",
    "footer.resources": "Resources",
    "footer.aboutUs": "About Us",
    "footer.ourTeam": "Our Team",
    "footer.successStories": "Success Stories",
    "footer.contact": "Contact",
    "footer.blog": "Blog",
    "footer.faqs": "FAQs",
    "footer.caseStudies": "Case Studies",
    "footer.news": "News",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.termsOfService": "Terms of Service",
    "footer.disclaimer": "Disclaimer",
    "footer.copyright": "Diaz & Johnson, P.A. All rights reserved.",
    "footer.legalDisclaimer":
      "The information on this website is for general information purposes only. Nothing on this site should be taken as legal advice for any individual case or situation.",

    // Valeria Chat
    "chat.greeting.available": "Hello! I'm Valeria from Diaz & Johnson. How can I assist you today?",
    "chat.greeting.unavailable":
      "Hello! I'm Valeria from Diaz & Johnson. Our office hours are 9 AM to 6 PM. Please email us at consulting@diazandjohnson.com and we'll respond as soon as possible!",
    "chat.available": "Available Now",
    "chat.hours": "9 AM - 6 PM",
    "chat.officeHours": "Office hours: 9 AM - 6 PM",
    "chat.helpText": "Valeria is here to help you",
    "chat.immigration": "Immigration Law",
    "chat.criminal": "Criminal Defense",
    "chat.civil": "Civil Rights",
    "chat.greencard": "Green Cards",
    "chat.consultation": "Consultation",
    "chat.caseStatus": "Case Status",

    // Pages
    "pages.about.title": "About Diaz & Johnson",
    "pages.about.subtitle":
      "A Miami-based law firm focused on clear guidance, strong advocacy, and respectful service for every client.",
    "pages.about.mission.title": "Our Mission",
    "pages.about.mission.body":
      "We help individuals and families navigate complex legal systems with practical advice, careful preparation, and unwavering support.",
    "pages.about.values.title": "Our Values",
    "pages.about.values.item1": "Client-first communication",
    "pages.about.values.item2": "Meticulous case preparation",
    "pages.about.values.item3": "Bilingual service (English/Spanish)",
    "pages.about.values.item4": "Integrity and transparency",
    "pages.about.cta": "Request a free consultation",

    "pages.team.title": "Our Team",
    "pages.team.subtitle": "Meet the attorneys and staff dedicated to your case.",

    "pages.practiceAreasHub.title": "Practice Areas",
    "pages.practiceAreasHub.subtitle": "Explore our core services and learn how we can help.",
    "pages.practiceAreasHub.viewDetails": "View details",

    "pages.practiceAreaDetail.overview": "Overview",
    "pages.practiceAreaDetail.howWeHelp": "How we help",
    "pages.practiceAreaDetail.bullet1": "Evaluate your options and next steps",
    "pages.practiceAreaDetail.bullet2": "Prepare and file documents carefully",
    "pages.practiceAreaDetail.bullet3": "Communicate clearly and promptly",
    "pages.practiceAreaDetail.bullet4": "Advocate for you at every stage",
    "pages.practiceAreaDetail.cta": "Start with a consultation",

    "pages.resources.title": "Resources",
    "pages.resources.subtitle": "Helpful information, FAQs, and updates from our team.",
    "pages.resources.comingSoon": "Content is being added. Check back soon.",

    "pages.legal.title": "Legal",
    "pages.legal.subtitle": "Important information about this website and your privacy.",
    "pages.legal.privacy.body":
      "This page provides a general overview of our privacy practices. For legal advice about your situation, contact our office.",
    "pages.legal.terms.body":
      "By using this website, you agree to the terms described here. These terms may be updated periodically.",
    "pages.legal.disclaimer.body":
      "Website content is for general information only and does not create an attorney-client relationship.",

    "pages.notFound.title": "Page not found",
    "pages.notFound.subtitle": "The page you’re looking for doesn’t exist or was moved.",
    "pages.notFound.home": "Go to homepage",
  },
  es: {
    // Navegacion
    "nav.home": "Inicio",
    "nav.practiceAreas": "Areas de Practica",
    "nav.team": "Nuestro Equipo",
    "nav.successStories": "Casos de Exito",
    "nav.consultation": "Consulta",
    "nav.contact": "Contacto",
    "nav.freeConsultation": "Consulta Gratis",

    // Seccion Hero
    "hero.tagline": "Sus Abogados de Confianza en Miami",
    "hero.title": "Luchando por Sus Derechos, Protegiendo Su Futuro",
    "hero.subtitle":
      "Por mas de 25 anos, Diaz & Johnson ha sido un faro de esperanza para inmigrantes, familias e individuos enfrentando desafios legales en el Sur de Florida.",
    "hero.cta": "Agendar Consulta Gratis",
    "hero.callUs": "Llamar (305) 728-0029",
    "hero.stat1.number": "5,000+",
    "hero.stat1.label": "Casos Ganados",
    "hero.stat2.number": "25+ Anos",
    "hero.stat2.label": "Experiencia",
    "hero.stat3.number": "24/7",
    "hero.stat3.label": "Disponible",

    // Areas de Practica
    "practice.tagline": "Nuestra Experiencia",
    "practice.title": "Areas de Practica",
    "practice.subtitle":
      "Proporcionamos servicios legales completos en multiples areas de practica, asegurando que reciba la atencion especializada que su caso merece.",
    "practice.immigration.title": "Ley de Inmigracion",
    "practice.immigration.desc":
      "Servicios completos de inmigracion incluyendo peticiones familiares, visas de empleo, naturalizacion y defensa contra deportacion.",
    "practice.greencard.title": "Tarjetas Verdes",
    "practice.greencard.desc":
      "Guia experta a traves del proceso de residencia permanente, incluyendo ajuste de estatus, procesamiento consular y renovaciones.",
    "practice.criminal.title": "Defensa Criminal",
    "practice.criminal.desc":
      "Defensa agresiva para todos los cargos criminales, desde delitos menores hasta delitos graves. Protegiendo sus derechos en cada paso.",
    "practice.civilrights.title": "Derechos Civiles",
    "practice.civilrights.desc":
      "Luchando contra la discriminacion, mala conducta policial y violaciones de derechos constitucionales.",
    "practice.family.title": "Derecho Familiar",
    "practice.family.desc":
      "Representacion compasiva en divorcio, custodia, manutencion y asuntos de violencia domestica.",
    "practice.business.title": "Inmigracion de Negocios",
    "practice.business.desc":
      "Ayudando a empresas a navegar visas de trabajo, certificaciones laborales y cumplimiento de inmigracion corporativa.",
    "practice.learnMore": "Mas Informacion",

    // Por Que Elegirnos
    "why.tagline": "Por Que Elegirnos",
    "why.title": "Dedicados a Su Exito",
    "why.subtitle":
      "En Diaz & Johnson, entendemos que los asuntos legales pueden ser abrumadores. Por eso estamos comprometidos a proporcionar no solo representacion legal excepcional, sino tambien tranquilidad durante su proceso.",
    "why.bilingual.title": "Equipo Bilingue",
    "why.bilingual.desc": "Hablamos ingles y espanol, asegurando comunicacion clara con todos nuestros clientes.",
    "why.track.title": "Historial Comprobado",
    "why.track.desc": "Mas de 5,000 casos exitosos y 98% de satisfaccion del cliente.",
    "why.personalized.title": "Atencion Personalizada",
    "why.personalized.desc": "Cada caso es unico. Adaptamos nuestra estrategia a su situacion especifica.",
    "why.pricing.title": "Precios Transparentes",
    "why.pricing.desc": "Sin cargos ocultos. Proporcionamos precios claros y directos para todos los servicios.",
    "why.available.title": "Disponible 24/7",
    "why.available.desc": "Las emergencias legales no esperan. Nosotros tampoco.",
    "why.community.title": "Enfocados en la Comunidad",
    "why.community.desc": "Raices profundas en las diversas comunidades de Miami por mas de dos decadas.",
    "why.successRate": "Tasa de Exito",

    // Abogados
    "attorneys.tagline": "Conozca Nuestro Equipo",
    "attorneys.title": "Asesoria Legal Experimentada",
    "attorneys.subtitle":
      "Nuestro equipo de abogados dedicados aporta decadas de experiencia combinada y una pasion genuina por ayudar a nuestros clientes a tener exito.",

    // Historias de Exito
    "success.tagline": "Resultados Reales",
    "success.title": "Nuestros Clientes Satisfechos",
    "success.subtitle":
      "Cada historia de exito representa una familia reunida, un sueno logrado y un futuro asegurado.",
    "success.approved": "Caso Aprobado",
    "success.stat1.number": "5,000+",
    "success.stat1.label": "Casos Resueltos",
    "success.stat2.number": "98%",
    "success.stat2.label": "Tasa de Exito",
    "success.stat3.number": "25+",
    "success.stat3.label": "Anos de Experiencia",
    "success.stat4.number": "50+",
    "success.stat4.label": "Paises Atendidos",

    // Contacto
    "contact.tagline": "Contactenos",
    "contact.title": "Agende Su Consulta Gratis",
    "contact.subtitle":
      "De el primer paso para resolver su asunto legal. Contactenos hoy para una consulta confidencial con uno de nuestros abogados experimentados.",
    "contact.location.title": "Ubicacion de la Oficina",
    "contact.location.address": "1680 Michigan Ave, Ste 700\nMiami Beach, FL 33139",
    "contact.phone.title": "Telefono",
    "contact.email.title": "Correo Electronico",
    "contact.hours.title": "Horario de Oficina",
    "contact.hours.weekday": "Lun - Vie: 8:00 AM - 6:00 PM",
    "contact.hours.weekend": "Sab: 9:00 AM - 2:00 PM",
    "contact.hours.emergency": "Linea de Emergencia 24/7 Disponible",
    "contact.form.title": "Solicitar una Consulta",
    "contact.form.firstName": "Nombre",
    "contact.form.lastName": "Apellido",
    "contact.form.email": "Correo Electronico",
    "contact.form.phone": "Telefono",
    "contact.form.caseType": "Tipo de Caso",
    "contact.form.caseType.placeholder": "Seleccione un area de practica",
    "contact.form.message": "Cuentenos Sobre Su Caso",
    "contact.form.message.placeholder": "Por favor describa su situacion legal...",
    "contact.form.submit": "Enviar Solicitud",
    "contact.form.submitting": "Enviando...",
    "contact.form.privacy":
      "Al enviar este formulario, acepta nuestra politica de privacidad. Su informacion se mantendra estrictamente confidencial.",
    "contact.form.success": "Gracias por su mensaje. Nos pondremos en contacto pronto.",

    // Pie de Pagina
    "footer.tagline":
      "Sirviendo a la comunidad de Miami por más de 25 años con representación legal dedicada, compasiva y orientada a resultados en inmigración, defensa criminal y derechos civiles.",
    "footer.practiceAreas": "Áreas de práctica",
    "footer.company": "Compañía",
    "footer.resources": "Recursos",
    "footer.aboutUs": "Sobre Nosotros",
    "footer.ourTeam": "Nuestro Equipo",
    "footer.successStories": "Casos de éxito",
    "footer.contact": "Contacto",
    "footer.blog": "Blog",
    "footer.faqs": "Preguntas Frecuentes",
    "footer.caseStudies": "Estudios de caso",
    "footer.news": "Noticias",
    "footer.privacyPolicy": "Política de privacidad",
    "footer.termsOfService": "Términos de servicio",
    "footer.disclaimer": "Aviso Legal",
    "footer.copyright": "Diaz & Johnson, P.A. Todos los derechos reservados.",
    "footer.legalDisclaimer":
      "La información en este sitio web es solo para fines de información general. Nada en este sitio debe tomarse como asesoramiento legal para ningún caso o situación individual.",

    // Chat de Valeria
    "chat.greeting.available": "Hola! Soy Valeria de Diaz & Johnson. Como puedo ayudarte hoy?",
    "chat.greeting.unavailable":
      "Hola! Soy Valeria de Diaz & Johnson. Nuestro horario de oficina es de 9 AM a 6 PM. Por favor escribanos a consulting@diazandjohnson.com y responderemos lo antes posible!",
    "chat.available": "Disponible Ahora",
    "chat.hours": "9 AM - 6 PM",
    "chat.officeHours": "Horario de oficina: 9 AM - 6 PM",
    "chat.helpText": "Valeria esta aqui para ayudarte",
    "chat.immigration": "Ley de Inmigracion",
    "chat.criminal": "Defensa Criminal",
    "chat.civil": "Derechos Civiles",
    "chat.greencard": "Tarjetas Verdes",
    "chat.consultation": "Consulta",
    "chat.caseStatus": "Estado del Caso",

    // Paginas
    "pages.about.title": "Sobre Diaz & Johnson",
    "pages.about.subtitle":
      "Una firma legal en Miami enfocada en guia clara, defensa solida y un servicio respetuoso para cada cliente.",
    "pages.about.mission.title": "Nuestra Mision",
    "pages.about.mission.body":
      "Ayudamos a individuos y familias a navegar sistemas legales complejos con consejo practico, preparacion cuidadosa y apoyo constante.",
    "pages.about.values.title": "Nuestros Valores",
    "pages.about.values.item1": "Comunicacion centrada en el cliente",
    "pages.about.values.item2": "Preparacion meticulosa del caso",
    "pages.about.values.item3": "Servicio bilingue (Ingles/Espanol)",
    "pages.about.values.item4": "Integridad y transparencia",
    "pages.about.cta": "Solicitar una consulta gratis",

    "pages.team.title": "Nuestro Equipo",
    "pages.team.subtitle": "Conozca a los abogados y el personal dedicados a su caso.",

    "pages.practiceAreasHub.title": "Areas de Practica",
    "pages.practiceAreasHub.subtitle": "Explore nuestros servicios principales y como podemos ayudarle.",
    "pages.practiceAreasHub.viewDetails": "Ver detalles",

    "pages.practiceAreaDetail.overview": "Resumen",
    "pages.practiceAreaDetail.howWeHelp": "Como ayudamos",
    "pages.practiceAreaDetail.bullet1": "Evaluamos sus opciones y proximos pasos",
    "pages.practiceAreaDetail.bullet2": "Preparamos y presentamos documentos con cuidado",
    "pages.practiceAreaDetail.bullet3": "Comunicamos de forma clara y oportuna",
    "pages.practiceAreaDetail.bullet4": "Le defendemos en cada etapa",
    "pages.practiceAreaDetail.cta": "Comenzar con una consulta",

    "pages.resources.title": "Recursos",
    "pages.resources.subtitle": "Informacion util, preguntas frecuentes y actualizaciones de nuestro equipo.",
    "pages.resources.comingSoon": "Estamos agregando contenido. Vuelva pronto.",

    "pages.legal.title": "Legal",
    "pages.legal.subtitle": "Informacion importante sobre este sitio web y su privacidad.",
    "pages.legal.privacy.body":
      "Esta pagina ofrece una descripcion general de nuestras practicas de privacidad. Para asesoramiento legal sobre su situacion, contacte nuestra oficina.",
    "pages.legal.terms.body":
      "Al usar este sitio web, usted acepta los terminos aqui descritos. Estos terminos pueden actualizarse periodicamente.",
    "pages.legal.disclaimer.body":
      "El contenido del sitio es solo para informacion general y no crea una relacion abogado-cliente.",

    "pages.notFound.title": "Pagina no encontrada",
    "pages.notFound.subtitle": "La pagina que busca no existe o fue movida.",
    "pages.notFound.home": "Ir al inicio",
  },
}
