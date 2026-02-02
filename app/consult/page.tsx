import { ConsultForm } from "@/components/consult-form"
import { ValeriaChat } from "@/components/valeria-chat"

export default function ConsultationPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Consulta Gratuita</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete el formulario a continuación y uno de nuestros abogados se pondrá en contacto con usted.
          </p>
        </div>
        <ConsultForm />
      </div>
      <ValeriaChat />
    </div>
  )
}
