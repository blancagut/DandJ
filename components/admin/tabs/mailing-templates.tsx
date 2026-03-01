"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Copy,
  Search,
  Sparkles,
  LayoutTemplate,
  PanelTop,
  PanelBottom,
  Loader2,
  Plus,
  Save,
  RefreshCcw,
  Pencil,
  Trash2,
  Database,
} from "lucide-react"

export type MailingTemplateType = "campaign" | "header" | "footer"
export type MailingTemplateLanguage = "ES" | "EN"

export type MailingTemplate = {
  id: string
  name: string
  type: MailingTemplateType
  audience: string
  language: MailingTemplateLanguage
  subject: string
  bodyHtml: string
}

type ApiTemplate = {
  id: string
  name: string
  template_type: MailingTemplateType
  audience: string
  language: MailingTemplateLanguage
  subject: string
  body_html: string
}

type TemplateFormState = {
  id?: string
  name: string
  type: MailingTemplateType
  audience: string
  language: MailingTemplateLanguage
  subject: string
  bodyHtml: string
}

const EMPTY_FORM: TemplateFormState = {
  name: "",
  type: "campaign",
  audience: "All",
  language: "ES",
  subject: "",
  bodyHtml: "",
}

const DEFAULT_TEMPLATES: MailingTemplate[] = [
  {
    id: "es-intake-followup",
    name: "Seguimiento inicial (H-2B)",
    type: "campaign",
    audience: "H-2B Intake",
    language: "ES",
    subject: "{Nombre}, revisemos tu caso hoy",
    bodyHtml:
      "<p>Hola {Nombre},</p><p>Gracias por completar tu proceso inicial. Nuestro equipo puede revisar tu caso y darte una ruta clara para avanzar.</p><p><strong>Agenda aquí:</strong> {LinkAgenda}</p><p>Si no deseas recibir más correos, responde <strong>BAJA</strong>.</p><p><em>Resultados dependen de los hechos y circunstancias de cada caso.</em></p>",
  },
  {
    id: "es-no-show-reminder",
    name: "Recordatorio de cita",
    type: "campaign",
    audience: "Consultations",
    language: "ES",
    subject: "Recordatorio de consulta {Fecha}",
    bodyHtml:
      "<p>Hola {Nombre},</p><p>Te recordamos tu consulta el <strong>{Fecha}</strong> a las <strong>{Hora}</strong>.</p><p>Si necesitas reprogramar, usa este enlace: {LinkAgenda}</p><p>Si no deseas recibir más correos, responde <strong>BAJA</strong>.</p>",
  },
  {
    id: "en-intake-followup",
    name: "Initial follow-up",
    type: "campaign",
    audience: "Leads",
    language: "EN",
    subject: "{Name}, let’s review your case today",
    bodyHtml:
      "<p>Hello {Name},</p><p>Thank you for contacting us. Our team can review your case and provide clear next steps.</p><p><strong>Book your call:</strong> {BookingLink}</p><p>If you no longer want these emails, reply <strong>UNSUBSCRIBE</strong>.</p><p><em>Results depend on the specific facts and circumstances of each case.</em></p>",
  },
  {
    id: "en-reengagement",
    name: "Re-engagement 48h",
    type: "campaign",
    audience: "All",
    language: "EN",
    subject: "Do you want us to continue with your case, {Name}?",
    bodyHtml:
      "<p>Hi {Name},</p><p>We reserved time to review your case details. If you want to move forward, book in one minute.</p><p><strong>Schedule now:</strong> {BookingLink}</p><p>If you prefer, reply and we can call you directly.</p><p>If you no longer want these emails, reply <strong>UNSUBSCRIBE</strong>.</p>",
  },
  {
    id: "es-header-legal-update",
    name: "Header bloque (ES)",
    type: "header",
    audience: "All",
    language: "ES",
    subject: "",
    bodyHtml:
      "<h2>Actualización importante de tu caso</h2><p>En Diaz &amp; Johnson estamos revisando los próximos pasos para tu proceso y te compartimos información clave para avanzar con claridad.</p>",
  },
  {
    id: "en-header-legal-update",
    name: "Header block (EN)",
    type: "header",
    audience: "All",
    language: "EN",
    subject: "",
    bodyHtml:
      "<h2>Important case update</h2><p>At Diaz &amp; Johnson, we are reviewing your next steps and sharing key information so you can move forward with confidence.</p>",
  },
  {
    id: "es-footer-compliance",
    name: "Footer bloque cumplimiento (ES)",
    type: "footer",
    audience: "All",
    language: "ES",
    subject: "",
    bodyHtml:
      "<hr /><p><strong>¿Dudas?</strong> Responde este correo y nuestro equipo te ayuda.</p><p>Si no deseas recibir más comunicaciones de marketing, responde <strong>BAJA</strong>.</p><p><em>Resultados dependen de los hechos y circunstancias particulares de cada caso.</em></p>",
  },
  {
    id: "en-footer-compliance",
    name: "Compliance footer block (EN)",
    type: "footer",
    audience: "All",
    language: "EN",
    subject: "",
    bodyHtml:
      "<hr /><p><strong>Questions?</strong> Reply to this email and our team will assist you.</p><p>If you no longer want marketing emails, reply <strong>UNSUBSCRIBE</strong>.</p><p><em>Results depend on the specific facts and circumstances of each case.</em></p>",
  },
]

type MailingDraft = {
  source: string
  subject: string
  bodyHtml: string
  templateName: string
}

export const MAILING_DRAFT_STORAGE_KEY = "adminMailingDraft"

export function MailingTemplates({ onUseTemplate }: { onUseTemplate: () => void }) {
  const [templates, setTemplates] = useState<MailingTemplate[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM)

  const persistenceEnabled = apiError === null

  const mapApiTemplate = (item: ApiTemplate): MailingTemplate => {
    return {
      id: item.id,
      name: item.name,
      type: item.template_type,
      audience: item.audience,
      language: item.language,
      subject: item.subject,
      bodyHtml: item.body_html,
    }
  }

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/mailing-templates", { cache: "no-store" })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "No se pudo cargar templates")
      }

      const parsed = Array.isArray(result.templates)
        ? (result.templates as ApiTemplate[]).map(mapApiTemplate)
        : []

      setTemplates(parsed)
      setApiError(null)
    } catch (error) {
      setTemplates(DEFAULT_TEMPLATES)
      setApiError(error instanceof Error ? error.message : "No se pudo conectar con templates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return templates
    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.audience.toLowerCase().includes(query) ||
        template.language.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query)
      )
    })
  }, [search, templates])

  const campaignTemplates = filtered.filter((template) => template.type === "campaign")
  const headerBlocks = filtered.filter((template) => template.type === "header")
  const footerBlocks = filtered.filter((template) => template.type === "footer")

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copiado`)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  const mapAudienceToSource = (audience: string) => {
    if (audience === "H-2B Intake") return "contracts"
    if (audience === "Consultations") return "consultations"
    if (audience === "Leads") return "leads"
    if (audience === "All") return "all"
    return "all"
  }

  const useTemplate = (template: MailingTemplate) => {
    const draft: MailingDraft = {
      source: mapAudienceToSource(template.audience),
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      templateName: template.name,
    }
    localStorage.setItem(MAILING_DRAFT_STORAGE_KEY, JSON.stringify(draft))
    window.dispatchEvent(new CustomEvent("admin:mailing-draft-updated"))
    toast.success(`Plantilla lista: ${template.name}`)
    onUseTemplate()
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
  }

  const editTemplate = (template: MailingTemplate) => {
    setForm({
      id: template.id,
      name: template.name,
      type: template.type,
      audience: template.audience,
      language: template.language,
      subject: template.subject,
      bodyHtml: template.bodyHtml,
    })
  }

  const saveTemplate = async () => {
    if (!form.name.trim()) {
      toast.error("Nombre requerido")
      return
    }
    if (!form.bodyHtml.trim()) {
      toast.error("Body HTML requerido")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/mailing-templates", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          templateType: form.type,
          audience: form.audience,
          language: form.language,
          subject: form.subject,
          bodyHtml: form.bodyHtml,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el template")
      }

      toast.success(form.id ? "Template actualizado" : "Template creado")
      resetForm()
      await loadTemplates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando template")
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (template: MailingTemplate) => {
    const approved = window.confirm(`¿Eliminar template \"${template.name}\"?`)
    if (!approved) return

    try {
      const response = await fetch(`/api/admin/mailing-templates?id=${encodeURIComponent(template.id)}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar")
      }

      toast.success("Template eliminado")
      if (form.id === template.id) resetForm()
      await loadTemplates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar")
    }
  }

  const seedDefaultsInDb = async () => {
    setSaving(true)
    try {
      for (const template of DEFAULT_TEMPLATES) {
        const response = await fetch("/api/admin/mailing-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: template.name,
            templateType: template.type,
            audience: template.audience,
            language: template.language,
            subject: template.subject,
            bodyHtml: template.bodyHtml,
          }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || "Error insertando templates base")
        }
      }

      toast.success("Templates base cargados")
      await loadTemplates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los templates base")
    } finally {
      setSaving(false)
    }
  }

  const typeLabel: Record<MailingTemplateType, string> = {
    campaign: "Campaign",
    header: "Header",
    footer: "Footer",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Template Library</h3>
          <p className="text-sm text-muted-foreground">Selecciona una plantilla para cargarla en Campaign Builder.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadTemplates} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, idioma o audiencia"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {apiError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">Modo fallback activado</p>
          <p>No se pudo leer la tabla mailing_templates: {apiError}</p>
          <p>Ejecuta db/mailing_templates.sql en Supabase y pulsa Refresh.</p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Template Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ej: Seguimiento Warm Lead ES"
                disabled={!persistenceEnabled || saving}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Audience</p>
              <Input
                value={form.audience}
                onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
                placeholder="All / Leads / Consultations..."
                disabled={!persistenceEnabled || saving}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as MailingTemplateType }))}
                disabled={!persistenceEnabled || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Language</p>
              <Select
                value={form.language}
                onValueChange={(value) => setForm((prev) => ({ ...prev, language: value as MailingTemplateLanguage }))}
                disabled={!persistenceEnabled || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ES">ES</SelectItem>
                  <SelectItem value="EN">EN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <Input
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Asunto del template"
              disabled={!persistenceEnabled || saving}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Body HTML</p>
            <Textarea
              value={form.bodyHtml}
              onChange={(event) => setForm((prev) => ({ ...prev, bodyHtml: event.target.value }))}
              placeholder="<p>Contenido del template...</p>"
              className="min-h-40"
              disabled={!persistenceEnabled || saving}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={saveTemplate} disabled={!persistenceEnabled || saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {form.id ? "Actualizar" : "Crear template"}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
            {persistenceEnabled && templates.length === 0 && (
              <Button variant="outline" onClick={seedDefaultsInDb} disabled={saving}>
                <Database className="h-4 w-4 mr-2" />
                Cargar templates base
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Cargando templates...
        </div>
      ) : (
        <>
          <Section title="Campaign Templates" icon={<LayoutTemplate className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {campaignTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={useTemplate}
                  onCopy={copyText}
                  onEdit={editTemplate}
                  onDelete={deleteTemplate}
                  allowCrud={persistenceEnabled}
                  typeLabel={typeLabel}
                />
              ))}
            </div>
          </Section>

          <Section title="Header Blocks" icon={<PanelTop className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {headerBlocks.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={useTemplate}
                  onCopy={copyText}
                  onEdit={editTemplate}
                  onDelete={deleteTemplate}
                  allowCrud={persistenceEnabled}
                  typeLabel={typeLabel}
                />
              ))}
            </div>
          </Section>

          <Section title="Footer Blocks" icon={<PanelBottom className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {footerBlocks.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={useTemplate}
                  onCopy={copyText}
                  onEdit={editTemplate}
                  onDelete={deleteTemplate}
                  allowCrud={persistenceEnabled}
                  typeLabel={typeLabel}
                />
              ))}
            </div>
          </Section>

          {filtered.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No se encontraron plantillas con ese criterio.
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  onUse,
  onCopy,
  onEdit,
  onDelete,
  allowCrud,
  typeLabel,
}: {
  template: MailingTemplate
  onUse: (template: MailingTemplate) => void
  onCopy: (value: string, label: string) => Promise<void>
  onEdit: (template: MailingTemplate) => void
  onDelete: (template: MailingTemplate) => Promise<void>
  allowCrud: boolean
  typeLabel: Record<MailingTemplateType, string>
}) {
  return (
    <Card>
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{typeLabel[template.type]}</Badge>
          <Badge variant="secondary">{template.audience}</Badge>
          <Badge variant="outline">{template.language}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {template.subject && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <p className="text-sm">{template.subject}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onUse(template)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Usar
          </Button>
          {template.subject && (
            <Button size="sm" variant="outline" onClick={() => onCopy(template.subject, "Asunto")}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar asunto
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onCopy(template.bodyHtml, "HTML")}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar HTML
          </Button>
          {allowCrud && (
            <>
              <Button size="sm" variant="outline" onClick={() => onEdit(template)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(template)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      {children}
    </section>
  )
}
