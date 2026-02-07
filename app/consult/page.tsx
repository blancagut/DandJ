"use client"

import { useState } from "react"
import { ConsultationForm } from "@/components/consultation-form"
import { ValeriaChat } from "@/components/valeria-chat"
import { H2BWizard } from "@/components/h2b-wizard"
import { WaiverWizard } from "@/components/waiver-wizard"
import { PetitionWizard } from "@/components/petition-wizard"
import { Card } from "@/components/ui/card"
import { FileText, Briefcase, ShieldAlert, FileCheck, ArrowLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

type ConsultationView = "selection" | "general" | "h2b" | "waiver" | "petition"

export default function ConsultationPage() {
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
        </Button>
        <ConsultationForm />
        <ValeriaChat />
      </div>
    )
  }

  if (view === "h2b") {
    return (
      <div className="relative">
         <div className="bg-slate-50 min-h-screen pt-4">
            <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 md:ml-8 mb-4"
                onClick={handleBack}
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
            </Button>
            <H2BWizard />
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
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
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
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
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
        <div className="mb-8">
            <Link href="/">
                <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
                </Button>
            </Link>
        </div>

        <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">Select Consultation Type</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Choose the specialized intake form that best matches your immigration needs.
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">General Consultation</h3>
                        <p className="text-slate-600 mb-4">Detailed case evaluation for all immigration matters not listed below. Direct attorney review.</p>
                        <ul className="text-sm text-slate-500 space-y-2">
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> Family Petitions</li>
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> Asylum & Defense</li>
                             <li className="flex items-center"><ChevronRight className="w-3 h-3 mr-1 text-green-500" /> Citizenship</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-blue-50">
                        <span className="text-sm font-semibold text-blue-700 flex items-center">Start General Evaluation <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>

             {/* H-2B Wizard */}
             <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                    className="h-full p-0 overflow-hidden cursor-pointer group hover:ring-2 hover:ring-indigo-500 transition-all border-slate-200"
                    onClick={() => setView("h2b")}
                >
                    <div className="p-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                            <Briefcase className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Working Visa (H-2B)</h3>
                        <p className="text-slate-600 mb-4">Specialized eligibility wizard for seasonal non-agricultural employment visas.</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Eligibility Score</span>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Job Match</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-indigo-50">
                        <span className="text-sm font-semibold text-indigo-700 flex items-center">Check H-2B Eligibility <ChevronRight className="w-4 h-4 ml-1" /></span>
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
                             <h3 className="text-xl font-bold text-slate-900">Waiver Screening</h3>
                             <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                        </div>
                        <p className="text-slate-600 mb-4">Advanced diagnostic tool to identify inadmissibility issues and recommend waiver strategies.</p>
                        <div className="flex gap-2 flex-wrap text-xs text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded">I-601</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-601A</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-212</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-amber-50">
                        <span className="text-sm font-semibold text-amber-700 flex items-center">Start Waiver Screening <ChevronRight className="w-4 h-4 ml-1" /></span>
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
                             <h3 className="text-xl font-bold text-slate-900">Petition Assessment</h3>
                             <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                        </div>
                        <p className="text-slate-600 mb-4">Family-based green card petition screening — automatic category classification and eligibility analysis.</p>
                        <div className="flex gap-2 flex-wrap text-xs text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded">I-130</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-485</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">I-864</span>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-4 border-t border-slate-100 group-hover:bg-emerald-50">
                        <span className="text-sm font-semibold text-emerald-700 flex items-center">Start Petition Screening <ChevronRight className="w-4 h-4 ml-1" /></span>
                    </div>
                </Card>
            </motion.div>
        </div>

      </div>
      <ValeriaChat />
    </div>
  )
}
