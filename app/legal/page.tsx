"use client"

import { Shield, FileText, AlertTriangle } from "lucide-react"

import { SiteFrame } from "@/components/site-frame"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

export default function LegalPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      hero: {
        title: "Legal Information",
        subtitle: "Privacy Policy, Terms of Service, and Legal Disclaimers",
        description: "Important information about how we protect your privacy and the terms of using our services.",
      },
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last Updated: January 2026",
        sections: [
          {
            title: "Information We Collect",
            content:
              "Diaz & Johnson collects information you provide directly to us, including your name, email address, phone number, case details, and any documents you upload through our consultation forms. We also collect information automatically when you visit our website, such as IP address, browser type, and usage data through cookies.",
          },
          {
            title: "How We Use Your Information",
            content:
              "We use the information we collect to: (1) Provide legal services and respond to your inquiries; (2) Communicate with you about your case; (3) Send you important updates about immigration law changes; (4) Improve our website and services; (5) Comply with legal obligations. We will never sell your personal information to third parties.",
          },
          {
            title: "Data Security",
            content:
              "We implement industry-standard security measures to protect your personal information, including encryption of data in transit and at rest, secure storage with Supabase and Vercel Blob, and restricted access to your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
          },
          {
            title: "Your Rights",
            content:
              "You have the right to: (1) Access the personal information we hold about you; (2) Request correction of inaccurate information; (3) Request deletion of your information (subject to legal retention requirements); (4) Opt-out of marketing communications. To exercise these rights, contact us at privacy@diazjohnsonlaw.com.",
          },
          {
            title: "Cookies and Tracking",
            content:
              "We use cookies and similar tracking technologies to improve your experience on our website. You can control cookies through your browser settings. Some features of our site may not function properly if cookies are disabled.",
          },
        ],
      },
      terms: {
        title: "Terms of Service",
        lastUpdated: "Last Updated: January 2026",
        sections: [
          {
            title: "Acceptance of Terms",
            content:
              "By accessing or using the Diaz & Johnson website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
          },
          {
            title: "No Attorney-Client Relationship",
            content:
              "Using this website, filling out a consultation form, or communicating with us via email or chat does NOT create an attorney-client relationship. An attorney-client relationship is only formed when you sign a written retainer agreement with Diaz & Johnson. Until then, any information you provide is not protected by attorney-client privilege.",
          },
          {
            title: "Consultation Process",
            content:
              "Free consultations are offered to evaluate your case and determine if we can help you. Consultations are typically 30 minutes and may be conducted by phone, video call, or in person. Not all cases are accepted. We reserve the right to decline representation for any reason.",
          },
          {
            title: "Payment and Fees",
            content:
              "Legal fees vary depending on the complexity of your case. All fees will be disclosed in a written retainer agreement before we begin work. You are responsible for government filing fees (such as USCIS fees) in addition to our attorney fees. Fees are non-refundable once work has commenced, except as specified in your retainer agreement.",
          },
          {
            title: "Case Outcomes",
            content:
              "While we strive for the best possible outcome in every case, we cannot guarantee results. Immigration law is complex and outcomes depend on many factors outside our control, including USCIS policies, government processing times, and the specific facts of your case.",
          },
          {
            title: "Use of Website",
            content:
              "You agree to use our website only for lawful purposes. You may not use our site to transmit malicious code, spam, or engage in any activity that could harm our systems or other users. We reserve the right to terminate access to our website at any time without notice.",
          },
          {
            title: "Intellectual Property",
            content:
              "All content on this website, including text, graphics, logos, and images, is the property of Diaz & Johnson and protected by copyright laws. You may not reproduce, distribute, or create derivative works from our content without written permission.",
          },
        ],
      },
      disclaimer: {
        title: "Legal Disclaimer",
        lastUpdated: "Last Updated: January 2026",
        sections: [
          {
            title: "General Information Only",
            content:
              "The information provided on this website is for general informational purposes only and does not constitute legal advice. Immigration laws change frequently, and the information on this site may not reflect the most current legal developments. Do not rely on this information as a substitute for legal advice from a licensed attorney.",
          },
          {
            title: "State Licensing",
            content:
              "Carlos Diaz Sr. is licensed to practice law in Florida. Steven Johnson is licensed in Florida and New York. Our affiliated attorneys are licensed in their respective states. We only provide legal advice on matters where we are properly licensed. For cases outside our licensing jurisdiction, we work with affiliated local counsel.",
          },
          {
            title: "No Guaranteed Results",
            content:
              "Past results do not guarantee future outcomes. Every immigration case is unique, and success depends on the specific facts and circumstances of your situation. The success stories and case studies on this website are real examples but should not be interpreted as a promise or guarantee of similar results in your case.",
          },
          {
            title: "Third-Party Links",
            content:
              "Our website may contain links to third-party websites for your convenience. We are not responsible for the content, privacy practices, or accuracy of information on these external sites. Use of third-party sites is at your own risk.",
          },
          {
            title: "Government Agencies",
            content:
              "Diaz & Johnson is a private law firm and is not affiliated with or endorsed by USCIS, ICE, CBP, the Department of Homeland Security, or any other government agency. We represent clients before these agencies but are not part of them.",
          },
          {
            title: "Limitation of Liability",
            content:
              "To the fullest extent permitted by law, Diaz & Johnson and its attorneys shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of this website or our services. Our liability is limited to the amount of fees paid to us for legal services.",
          },
          {
            title: "Changes to This Page",
            content:
              "We reserve the right to update this legal information at any time. Changes will be posted on this page with an updated 'Last Updated' date. Your continued use of our website after changes are posted constitutes acceptance of the updated terms.",
          },
        ],
      },
    },
    es: {
      hero: {
        title: "Información Legal",
        subtitle: "Política de Privacidad, Términos de Servicio y Descargos Legales",
        description: "Información importante sobre cómo protegemos su privacidad y los términos de uso de nuestros servicios.",
      },
      privacy: {
        title: "Política de Privacidad",
        lastUpdated: "Última Actualización: Enero 2026",
        sections: [
          {
            title: "Información que Recopilamos",
            content:
              "Diaz & Johnson recopila información que usted nos proporciona directamente, incluyendo su nombre, correo electrónico, número de teléfono, detalles del caso y cualquier documento que cargue a través de nuestros formularios de consulta. También recopilamos información automáticamente cuando visita nuestro sitio web, como dirección IP, tipo de navegador y datos de uso a través de cookies.",
          },
          {
            title: "Cómo Usamos su Información",
            content:
              "Usamos la información que recopilamos para: (1) Proporcionar servicios legales y responder a sus consultas; (2) Comunicarnos con usted sobre su caso; (3) Enviarle actualizaciones importantes sobre cambios en la ley de inmigración; (4) Mejorar nuestro sitio web y servicios; (5) Cumplir con obligaciones legales. Nunca venderemos su información personal a terceros.",
          },
          {
            title: "Seguridad de Datos",
            content:
              "Implementamos medidas de seguridad estándar de la industria para proteger su información personal, incluyendo cifrado de datos en tránsito y en reposo, almacenamiento seguro con Supabase y Vercel Blob, y acceso restringido a su información. Sin embargo, ningún método de transmisión por internet es 100% seguro y no podemos garantizar seguridad absoluta.",
          },
          {
            title: "Sus Derechos",
            content:
              "Usted tiene derecho a: (1) Acceder a la información personal que tenemos sobre usted; (2) Solicitar corrección de información inexacta; (3) Solicitar eliminación de su información (sujeto a requisitos legales de retención); (4) Optar por no recibir comunicaciones de marketing. Para ejercer estos derechos, contáctenos en privacy@diazjohnsonlaw.com.",
          },
          {
            title: "Cookies y Rastreo",
            content:
              "Usamos cookies y tecnologías de rastreo similares para mejorar su experiencia en nuestro sitio web. Puede controlar las cookies a través de la configuración de su navegador. Algunas características de nuestro sitio pueden no funcionar correctamente si las cookies están deshabilitadas.",
          },
        ],
      },
      terms: {
        title: "Términos de Servicio",
        lastUpdated: "Última Actualización: Enero 2026",
        sections: [
          {
            title: "Aceptación de Términos",
            content:
              "Al acceder o usar el sitio web y servicios de Diaz & Johnson, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con estos términos, por favor no use nuestros servicios.",
          },
          {
            title: "No Relación Abogado-Cliente",
            content:
              "Usar este sitio web, completar un formulario de consulta o comunicarse con nosotros por correo electrónico o chat NO crea una relación abogado-cliente. Una relación abogado-cliente solo se forma cuando usted firma un acuerdo de retención escrito con Diaz & Johnson. Hasta entonces, cualquier información que proporcione no está protegida por el privilegio abogado-cliente.",
          },
          {
            title: "Proceso de Consulta",
            content:
              "Se ofrecen consultas gratuitas para evaluar su caso y determinar si podemos ayudarlo. Las consultas típicamente duran 30 minutos y pueden realizarse por teléfono, videollamada o en persona. No todos los casos son aceptados. Nos reservamos el derecho de declinar representación por cualquier motivo.",
          },
          {
            title: "Pago y Honorarios",
            content:
              "Los honorarios legales varían según la complejidad de su caso. Todos los honorarios se divulgarán en un acuerdo de retención escrito antes de comenzar a trabajar. Usted es responsable de las tarifas de presentación gubernamentales (como tarifas de USCIS) además de nuestros honorarios de abogado. Los honorarios no son reembolsables una vez que el trabajo ha comenzado, excepto según se especifique en su acuerdo de retención.",
          },
          {
            title: "Resultados de Casos",
            content:
              "Aunque nos esforzamos por el mejor resultado posible en cada caso, no podemos garantizar resultados. La ley de inmigración es compleja y los resultados dependen de muchos factores fuera de nuestro control, incluyendo políticas de USCIS, tiempos de procesamiento gubernamentales y los hechos específicos de su caso.",
          },
          {
            title: "Uso del Sitio Web",
            content:
              "Usted acepta usar nuestro sitio web solo para propósitos legales. No puede usar nuestro sitio para transmitir código malicioso, spam o participar en cualquier actividad que pueda dañar nuestros sistemas u otros usuarios. Nos reservamos el derecho de terminar el acceso a nuestro sitio web en cualquier momento sin aviso.",
          },
          {
            title: "Propiedad Intelectual",
            content:
              "Todo el contenido en este sitio web, incluyendo texto, gráficos, logos e imágenes, es propiedad de Diaz & Johnson y está protegido por leyes de derechos de autor. No puede reproducir, distribuir o crear obras derivadas de nuestro contenido sin permiso escrito.",
          },
        ],
      },
      disclaimer: {
        title: "Descargo Legal",
        lastUpdated: "Última Actualización: Enero 2026",
        sections: [
          {
            title: "Solo Información General",
            content:
              "La información proporcionada en este sitio web es solo para propósitos informativos generales y no constituye asesoramiento legal. Las leyes de inmigración cambian frecuentemente y la información en este sitio puede no reflejar los desarrollos legales más actuales. No confíe en esta información como sustituto del asesoramiento legal de un abogado licenciado.",
          },
          {
            title: "Licencias Estatales",
            content:
              "Carlos Diaz Sr. está licenciado para ejercer la abogacía en Florida. Steven Johnson está licenciado en Florida y Nueva York. Nuestros abogados afiliados están licenciados en sus respectivos estados. Solo proporcionamos asesoramiento legal en asuntos donde estamos debidamente licenciados. Para casos fuera de nuestra jurisdicción de licencia, trabajamos con abogados locales afiliados.",
          },
          {
            title: "Sin Resultados Garantizados",
            content:
              "Los resultados pasados no garantizan resultados futuros. Cada caso de inmigración es único y el éxito depende de los hechos y circunstancias específicos de su situación. Las historias de éxito y estudios de caso en este sitio web son ejemplos reales pero no deben interpretarse como una promesa o garantía de resultados similares en su caso.",
          },
          {
            title: "Enlaces de Terceros",
            content:
              "Nuestro sitio web puede contener enlaces a sitios web de terceros para su conveniencia. No somos responsables del contenido, prácticas de privacidad o exactitud de la información en estos sitios externos. El uso de sitios de terceros es bajo su propio riesgo.",
          },
          {
            title: "Agencias Gubernamentales",
            content:
              "Diaz & Johnson es un bufete de abogados privado y no está afiliado o respaldado por USCIS, ICE, CBP, el Departamento de Seguridad Nacional o cualquier otra agencia gubernamental. Representamos clientes ante estas agencias pero no somos parte de ellas.",
          },
          {
            title: "Limitación de Responsabilidad",
            content:
              "En la medida máxima permitida por la ley, Diaz & Johnson y sus abogados no serán responsables de ningún daño indirecto, incidental, consecuente o punitivo que surja del uso de este sitio web o nuestros servicios. Nuestra responsabilidad está limitada a la cantidad de honorarios pagados a nosotros por servicios legales.",
          },
          {
            title: "Cambios a Esta Página",
            content:
              "Nos reservamos el derecho de actualizar esta información legal en cualquier momento. Los cambios se publicarán en esta página con una fecha actualizada de 'Última Actualización'. Su uso continuo de nuestro sitio web después de que se publiquen los cambios constituye aceptación de los términos actualizados.",
          },
        ],
      },
    },
  }

  const data = language === "es" ? content.es : content.en

  return (
    <SiteFrame>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">
            {language === "es" ? "Legal" : "Legal"}
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">{data.hero.title}</h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-4">{data.hero.subtitle}</p>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl">{data.hero.description}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* Privacy Policy */}
        <div id="privacy" className="mb-16 scroll-mt-24">
          <Card>
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">{data.privacy.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{data.privacy.lastUpdated}</p>
                </div>
              </div>
              <div className="space-y-6 mt-6">
                {data.privacy.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-foreground mb-2">{section.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms of Service */}
        <div id="terms" className="mb-16 scroll-mt-24">
          <Card>
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">{data.terms.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{data.terms.lastUpdated}</p>
                </div>
              </div>
              <div className="space-y-6 mt-6">
                {data.terms.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-foreground mb-2">{section.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Disclaimer */}
        <div id="disclaimer" className="mb-16 scroll-mt-24">
          <Card>
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">{data.disclaimer.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{data.disclaimer.lastUpdated}</p>
                </div>
              </div>
              <div className="space-y-6 mt-6">
                {data.disclaimer.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-foreground mb-2">{section.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-muted">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">
              {language === "es" ? "¿Preguntas sobre Nuestras Políticas?" : "Questions About Our Policies?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "es"
                ? "Si tiene alguna pregunta sobre nuestra privacidad, términos o políticas legales, contáctenos."
                : "If you have any questions about our privacy, terms, or legal policies, please contact us."}
            </p>
            <p className="text-sm text-muted-foreground">
              Email:{" "}
              <a href="mailto:info@diazjohnsonlaw.com" className="text-primary hover:underline">
                info@diazjohnsonlaw.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteFrame>
  )
}
