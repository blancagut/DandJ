"use client"

import { useState, useCallback, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  LinkIcon,
  Minus,
  Undo,
  Redo,
  Eye,
  Send,
  Loader2,
  Users,
  Search,
  Plus,
  Mail,
  CheckSquare,
  Square,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────
interface Recipient {
  email: string
  name: string
  source: string
}

const SOURCES = [
  { value: "all", label: "All Users" },
  { value: "consultations", label: "Consultations" },
  { value: "leads", label: "Contacts / Leads" },
  { value: "petitions", label: "Petitions" },
  { value: "waivers", label: "Waivers" },
  { value: "work", label: "Work Visas" },
  { value: "contracts", label: "Contracts" },
  { value: "chat", label: "Chat Visitors" },
]

const SOURCE_COLORS: Record<string, string> = {
  Consultation: "bg-blue-100 text-blue-700",
  Contact: "bg-green-100 text-green-700",
  Petition: "bg-purple-100 text-purple-700",
  Waiver: "bg-orange-100 text-orange-700",
  "Work Visa": "bg-teal-100 text-teal-700",
  Contract: "bg-pink-100 text-pink-700",
  Chat: "bg-yellow-100 text-yellow-700",
  Manual: "bg-gray-100 text-gray-700",
}

// ─── Component ───────────────────────────────────────────────
export function EmailComposer({ onSent }: { onSent?: () => void }) {
  // Recipients
  const [source, setSource] = useState("all")
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState("")
  const [manualEmail, setManualEmail] = useState("")

  // Email content
  const [subject, setSubject] = useState("")
  const [sending, setSending] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  // Tiptap editor — immediatelyRender: false is REQUIRED for Next.js SSR
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "email-link" },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Write your email content here...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  })

  // ── Fetch recipients ───────────────────────────────────────
  const loadRecipients = useCallback(async (src: string) => {
    setLoadingRecipients(true)
    try {
      const res = await fetch(`/api/admin/recipients?source=${src}`)
      const data = await res.json()
      if (data.recipients) {
        setAllRecipients(data.recipients)
        // Auto-select all by default
        setSelectedEmails(new Set(data.recipients.map((r: Recipient) => r.email)))
      }
    } catch {
      toast.error("Failed to load recipients")
    } finally {
      setLoadingRecipients(false)
    }
  }, [])

  useEffect(() => {
    loadRecipients(source)
  }, [source, loadRecipients])

  // ── Filtered list for search ───────────────────────────────
  const filteredRecipients = allRecipients.filter((r) => {
    if (!recipientSearch) return true
    const q = recipientSearch.toLowerCase()
    return (
      r.email.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q)
    )
  })

  // ── Select/deselect helpers ────────────────────────────────
  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  const selectAll = () => {
    setSelectedEmails(new Set(allRecipients.map((r) => r.email)))
  }

  const deselectAll = () => {
    setSelectedEmails(new Set())
  }

  const selectFiltered = () => {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      filteredRecipients.forEach((r) => next.add(r.email))
      return next
    })
  }

  // ── Add manual email ───────────────────────────────────────
  const addManualEmail = () => {
    const email = manualEmail.trim().toLowerCase()
    if (!email || !email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address")
      return
    }
    if (allRecipients.some((r) => r.email === email)) {
      setSelectedEmails((prev) => new Set(prev).add(email))
      setManualEmail("")
      toast.success("Email already in list — selected it")
      return
    }
    setAllRecipients((prev) => [...prev, { email, name: "", source: "Manual" }])
    setSelectedEmails((prev) => new Set(prev).add(email))
    setManualEmail("")
    toast.success("Email added")
  }

  const selectedCount = selectedEmails.size

  // ── Preview ────────────────────────────────────────────────
  const handlePreview = async () => {
    if (!editor) return
    const bodyHtml = editor.getHTML()
    if (!subject.trim()) {
      toast.error("Please enter a subject line")
      return
    }
    if (!bodyHtml || bodyHtml === "<p></p>") {
      toast.error("Please write some email content")
      return
    }
    setLoadingPreview(true)
    try {
      const res = await fetch("/api/admin/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml }),
      })
      const html = await res.text()
      setPreviewHtml(html)
      setPreviewOpen(true)
    } catch {
      toast.error("Failed to generate preview")
    } finally {
      setLoadingPreview(false)
    }
  }

  // ── Send ───────────────────────────────────────────────────
  const handleSend = async () => {
    if (!editor) return
    setConfirmOpen(false)
    setSending(true)

    const bodyHtml = editor.getHTML()
    const emails = Array.from(selectedEmails)

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyHtml,
          recipientEmails: emails,
          recipientSource: source,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(
          `Email sent to ${data.sentCount} recipient${data.sentCount !== 1 ? "s" : ""}!`,
        )
        setSubject("")
        editor.commands.clearContent()
        onSent?.()
      } else {
        toast.error(data.errorMessage || "Failed to send emails")
      }
    } catch {
      toast.error("An error occurred while sending")
    } finally {
      setSending(false)
    }
  }

  // ── Link dialog ────────────────────────────────────────────
  const handleSetLink = () => {
    if (!editor) return
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    }
    setLinkDialogOpen(false)
    setLinkUrl("")
  }

  const openLinkDialog = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href ?? ""
    setLinkUrl(previousUrl)
    setLinkDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          STEP 1: RECIPIENTS
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-5 w-5 text-[#0B1E3A]" />
          <h3 className="font-semibold text-base">Step 1: Select Recipients</h3>
        </div>

        {/* Source picker + select/deselect buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Source:</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} className="h-8 text-xs">
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll} className="h-8 text-xs">
              <Square className="h-3.5 w-3.5 mr-1" />
              Deselect All
            </Button>
          </div>

          <Badge variant="secondary" className="h-7 px-3 text-sm font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            {selectedCount} selected
          </Badge>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={recipientSearch}
            onChange={(e) => setRecipientSearch(e.target.value)}
            placeholder="Search emails by name, email, or source..."
            className="pl-9 h-9"
          />
        </div>

        {/* Recipient list with checkboxes */}
        {loadingRecipients ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading recipients...</span>
          </div>
        ) : (
          <>
            {recipientSearch && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Showing {filteredRecipients.length} of {allRecipients.length}
                </span>
                <Button variant="ghost" size="sm" onClick={selectFiltered} className="h-7 text-xs">
                  Select all filtered
                </Button>
              </div>
            )}
            <ScrollArea className="h-[220px] rounded-lg border bg-background">
              <div className="divide-y">
                {filteredRecipients.map((r) => {
                  const isSelected = selectedEmails.has(r.email)
                  return (
                    <label
                      key={r.email}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleEmail(r.email)}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                          {r.email}
                        </span>
                        {r.name && (
                          <span className="text-xs text-muted-foreground">
                            — {r.name}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${SOURCE_COLORS[r.source] ?? ""}`}
                      >
                        {r.source}
                      </Badge>
                    </label>
                  )
                })}
                {filteredRecipients.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">
                      {recipientSearch ? "No emails match your search" : "No recipients found for this source"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Add manual email */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            placeholder="Or type an email address to add manually..."
            className="h-9 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addManualEmail()
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addManualEmail}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STEP 2: SUBJECT LINE
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">Step 2: Subject Line</h3>
        </div>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter the email subject..."
          className="h-11 text-base"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STEP 3: EMAIL BODY (Rich Text Editor)
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">Step 3: Write Your Message</h3>
        </div>
        <div className="border rounded-lg overflow-hidden bg-background">
          {/* Toolbar */}
          {editor && (
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
              <ToolbarButton
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarSep />

              <ToolbarButton
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarSep />

              <ToolbarButton
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet list"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered list"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarSep />

              <ToolbarButton
                active={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                title="Align left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                title="Align center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                active={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                title="Align right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarSep />

              <ToolbarButton
                active={editor.isActive("link")}
                onClick={openLinkDialog}
                title="Insert link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal rule"
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>

              <div className="flex-1" />

              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>
          )}

          {/* Editor content area */}
          <div className="min-h-[280px]">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading editor...
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Click inside the white area above to start typing. Use the toolbar buttons for formatting.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACTIONS
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={loadingPreview || sending}
          className="h-10"
        >
          {loadingPreview ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview Email
        </Button>

        <Button
          onClick={() => {
            if (selectedCount === 0) {
              toast.error("Please select at least one recipient")
              return
            }
            if (!subject.trim()) {
              toast.error("Please enter a subject line")
              return
            }
            if (!editor?.getHTML() || editor.getHTML() === "<p></p>") {
              toast.error("Please write some email content")
              return
            }
            setConfirmOpen(true)
          }}
          disabled={sending || selectedCount === 0}
          className="h-10 bg-[#0B1E3A] hover:bg-[#0B1E3A]/90 px-6"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {sending ? "Sending..." : `Send to ${selectedCount} Recipient${selectedCount !== 1 ? "s" : ""}`}
        </Button>
      </div>

      {/* ─── Preview Dialog ───────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how your email will appear in recipients&apos; inboxes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-gray-100">
            <iframe
              srcDoc={previewHtml}
              className="w-full min-h-[500px] border-0"
              title="Email preview"
              sandbox="allow-same-origin"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Link Dialog ──────────────────────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the link. Leave empty to remove.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSetLink()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetLink}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Send Confirmation ────────────────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Send</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to send <strong>&ldquo;{subject}&rdquo;</strong> to{" "}
                  <strong>{selectedCount}</strong> recipient
                  {selectedCount !== 1 ? "s" : ""}.
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. All recipients will receive the email with
                  your firm&apos;s branded template.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSend}
              className="bg-[#0B1E3A] hover:bg-[#0B1E3A]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Yes, Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Toolbar Helpers ─────────────────────────────────────────
function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors
        ${active ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-border mx-1" />
}
