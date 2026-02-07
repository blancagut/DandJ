"use client"

import { useState } from "react"
import { ConsultationForm } from "@/components/consultation-form"
import { ValeriaChat } from "@/components/valeria-chat"
import { WorkScreeningWizard } from "@/components/work-screening-wizard"
import { WaiverWizard } from "@/components/waiver-wizard"
import { PetitionWizard } from "@/components/petition-wizard"
import { Card } from "@/components/ui/card"
import { FileText, Briefcase, ShieldAlert, ArrowLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"

const consultTranslations = {
  en: {
    returnHome: "Return Home",
    backToSelection: "Back to Selection",
    title: "Select Consultation Type",
    subtitle: "Choose the specialized intake form that best matches your immigration needs.",
    generalTitle: "General Consultation",
    generalDesc: "Detailed case evaluation for all immigration matters not listed below. Direct attorney review.",
    generalFamily: "Family Petitions",
    generalAsylum: "Asylum & Defense",
    generalCitizenship: "Citizenship",
    generalCta: "Start General Evaluation",
    workTitle: "Work Visa Screening",
    workDesc: "Quick eligibility screening for employment-based work visas \u2014 under 2 minutes.",
    workTag1: "Visa Paths",
    workTag2: "Risk Flags",
    workCta: "Start Work Visa Screening",
    waiverTitle: "Waiver Screening",
    waiverDesc: "Advanced diagnostic tool to identify inadmissibility issues and recommend waiver strategies.",
    waiverCta: "Start Waiver Screening",
    petitionTitle: "Petition Assessment",
    petitionDesc: "Family-based green card petition screening \u2014 automatic category classification and eligibility analysis.",
    petitionCta: "Start Petition Screening",
    tagNew: "New",
  },
  es: {
    returnHome: "Regresar al Inicio",
    backToSelection: "Volver a Selección",
    title: "Seleccione Tipo de Consulta",
    subtitle: "Elija el formulario especializado que mejor se adapte a sus necesidades migratorias.",
    generalTitle: "Consulta General",
    generalDesc: "Evaluación detallada de caso para todos los asuntos migratorios no listados abajo. Revisión directa del abogado.",
    generalFamily: "Peticiones Familiares",
    generalAsylum: "Asilo y Defensa",
    generalCitizenship: "Ciudadanía",
    generalCta: "Iniciar Evaluación General",
    workTitle: "Evaluación de Visa de Trabajo",
    workDesc: "Evaluación rápida de elegibilidad para visas de trabajo \u2014 menos de 2 minutos.",
    workTag1: "Rutas de Visa",
    workTag2: "Señales de Riesgo",
    workCta: "Iniciar Evaluación de Visa",
    waiverTitle: "Evaluación de Perdón",
    waiverDesc: "Herramienta de diagnóstico avanzada para identificar problemas de inadmisibilidad y recomendar estrategias de perdón.",
    waiverCta: "Iniciar Evaluación de Perdón",
    petitionTitle: "Evaluación de Petición",
    petitionDesc: "Evaluación de petición de green card familiar \u2014 clasificación automática de categoría y análisis de elegibilidad.",
    petitionCta: "Iniciar Evaluación de Petición",
    tagNew: "Nuevo",
  },
} as const

type ConsultationView = "selection" | "general" | "work_screening" | "waiver" | "petition"

export default function ConsultationPage() {
  const { language } = useLanguage()
  const ct = consultTranslations[language]
  const [view, setView] = useState<ConsultationView>("selection")

  const handleBack = () => {
    setView("selection")
  }

  if (view === "general") {
    // ConsultationForm has its own Back button to Home, but we might want a way to return to selection
    // Since we can't easily modify ConsultationForm's internal back button without props, we'll wrap it
    return (
      <div className="relative">
        <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 left-4 z-50 md:top-8 md:left-8 bg-white/80 backdrop-blur"
            onClick={handleBack}
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> {ct.backToSelection}
        </Button>
        <ConsultationForm />
        <ValeriaChat />
      </div>
    )
  }

  if (view === "work_screening") {
    return (
      <div className="relative">
         <div className="bg-slate-50 min-h-screen pt-4">
            <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 md:ml-8 mb-4"
                onClick={handleBack}
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> {ct.backToSelection}
            </Button>
            <WorkScreeningWizard />
         </div>
         <ValeriaChat />
      </div>
    )
  }

  if (view === "waiver") {
    return (
      <div className="relative">
           <div className="bg-slate-50 min-h-screen pt-4">
             <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 md:ml-8 mb-4"
                  onClick={handleBack}
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> {ct.backToSelection}
              </Button>
              <WaiverWizard />
           </div>
           <ValeriaChat />
      </div>
    )
  }

  if (view === "petition") {
    return (
      <div className="relative">
           <div className="bg-slate-50 min-h-screen pt-4">
             <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 md:ml-8 mb-4"
                  onClick={handleBack}
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> {ct.backToSelection}
              </Button>
              <PetitionWizard />
           </div>
           <ValeriaChat />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <Link href="/">
                <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {ct.returnHome}
                </Button>
            </Link>
            <WaiverLanguageSelector />
        </div>

        <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">{ct.title}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {ct.subtitle}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Consultation */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                    className="h-full p-0 overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all border-slate-200"
                    onClick={() => setView("general")}
                >
                    <div className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                            <FileText className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{ct.generalTitle}</h3>
                        <p className="text-slate-600 mb-4">{ct.generalDesc}</p>
                        <ul className="text-sm text-slate-500 space-y-2">
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> {ct.generalFamily}</li>
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> {ct.generalAsylum}</li>
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> {ct.generalCitizenship}</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-blue-50">
                        <span className="text-sm font-semibold text-blue-700 flex items-center">{ct.generalCta} <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>

             {/* Work Visa Screening */}
             <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                    className="h-full p-0 overflow-hidden cursor-pointer group hover:ring-2 hover:ring-indigo-500 transition-all border-slate-200"
                    onClick={() => setView("work_screening")}
                >
                    <div className="p-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                            <Briefcase className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{ct.workTitle}</h3>
                        <p className="text-slate-600 mb-4">{ct.workDesc}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{ct.workTag1}</span>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{ct.workTag2}</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-indigo-50">
                        <span className="text-sm font-semibold text-indigo-700 flex items-center">{ct.workCta} <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>

            {/* Waiver Screening - NEW */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                    className="h-full p-0 overflow-hidden cursor-pointer group hover:ring-2 hover:ring-amber-500 transition-all border-slate-200"
                    onClick={() => setView("waiver")}
                >
                    <div className="p-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                            <ShieldAlert className="w-6 h-6 text-amber-600 group-hover:text-white" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xl font-bold text-slate-900">{ct.waiverTitle}</h3>
                             <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full uppercase tracking-wider">{ct.tagNew}</span>
                        </div>
                        <p className="text-slate-600 mb-4">{ct.waiverDesc}</p>
                        <div className="flex gap-2 flex-wrap text-xs text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded">I-601</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-601A</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-212</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-amber-50">
                        <span className="text-sm font-semibold text-amber-700 flex items-center">{ct.waiverCta} <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>

             {/* Petition Assessment - ACTIVE */}
             <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                    className="h-full p-0 overflow-hidden cursor-pointer group hover:ring-2 hover:ring-emerald-500 transition-all border-slate-200"
                    onClick={() => setView("petition")}
                >
                    <div className="p-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                            <Users className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                        </div>
                         <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xl font-bold text-slate-900">{ct.petitionTitle}</h3>
                             <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full uppercase tracking-wider">{ct.tagNew}</span>
                        </div>
                        <p className="text-slate-600 mb-4">{ct.petitionDesc}</p>
                        <div className="flex gap-2 flex-wrap text-xs text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded">I-130</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-485</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-864</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-emerald-50">
                        <span className="text-sm font-semibold text-emerald-700 flex items-center">{ct.petitionCta} <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>
        </div>

      </div>
      <ValeriaChat />
    </div>
  )
}
