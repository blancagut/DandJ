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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  ChevronDown,
  X,
  Mail,
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

// ─── Source colors ───────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  Consultation: "bg-blue-100 text-blue-800",
  Contact: "bg-green-100 text-green-800",
  Petition: "bg-purple-100 text-purple-800",
  Waiver: "bg-orange-100 text-orange-800",
  "Work Visa": "bg-teal-100 text-teal-800",
  Contract: "bg-pink-100 text-pink-800",
  Chat: "bg-yellow-100 text-yellow-800",
}

// ─── Component ───────────────────────────────────────────────
export function EmailComposer({ onSent }: { onSent?: () => void }) {
  const [source, setSource] = useState("all")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [recipientsOpen, setRecipientsOpen] = useState(false)
  const [removedEmails, setRemovedEmails] = useState<Set<string>>(new Set())

  const [subject, setSubject] = useState("")
  const [sending, setSending] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  // Tiptap editor
  const editor = useEditor({
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
        class:
          "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[280px] px-4 py-3",
      },
    },
  })

  // Fetch recipients when source changes
  const loadRecipients = useCallback(async (src: string) => {
    setLoadingRecipients(true)
    setRemovedEmails(new Set())
    try {
      const res = await fetch(`/api/admin/recipients?source=${src}`)
      const data = await res.json()
      if (data.recipients) {
        setRecipients(data.recipients)
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

  const activeRecipients = recipients.filter((r) => !removedEmails.has(r.email))

  // Remove a individual recipient
  const removeRecipient = (email: string) => {
    setRemovedEmails((prev) => new Set(prev).add(email))
  }

  // Restore a removed recipient
  const restoreRecipient = (email: string) => {
    setRemovedEmails((prev) => {
      const next = new Set(prev)
      next.delete(email)
      return next
    })
  }

  // Preview
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

  // Send
  const handleSend = async () => {
    if (!editor) return
    setConfirmOpen(false)
    setSending(true)

    const bodyHtml = editor.getHTML()
    const emails = activeRecipients.map((r) => r.email)

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
          `Email sent successfully to ${data.sentCount} recipient${data.sentCount !== 1 ? "s" : ""}`,
        )
        // Reset form
        setSubject("")
        editor.commands.clearContent()
        setRemovedEmails(new Set())
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

  // Link dialog
  const handleSetLink = () => {
    if (!editor) return
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run()
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

  if (!editor) return null

  return (
    <div className="space-y-6">
      {/* ─── Recipients Section ────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Recipients</Label>
          <div className="flex items-center gap-3">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-[200px] h-9">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            {loadingRecipients ? (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="text-sm font-medium">
                {activeRecipients.length} recipient{activeRecipients.length !== 1 ? "s" : ""}
                {removedEmails.size > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({removedEmails.size} removed)
                  </span>
                )}
              </span>
            )}
          </div>

          {removedEmails.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRemovedEmails(new Set())}
              className="text-xs"
            >
              Restore all
            </Button>
          )}
        </div>

        {/* Collapsible recipient list */}
        <Collapsible open={recipientsOpen} onOpenChange={setRecipientsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
              <ChevronDown className={`h-3 w-3 transition-transform ${recipientsOpen ? "rotate-180" : ""}`} />
              {recipientsOpen ? "Hide" : "View"} recipient list
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-[200px] mt-2 rounded-lg border">
              <div className="p-3 space-y-1">
                {activeRecipients.map((r) => (
                  <div
                    key={r.email}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{r.email}</span>
                      {r.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          ({r.name})
                        </span>
                      )}
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[r.source] ?? ""}`}>
                        {r.source}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRecipient(r.email)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {activeRecipients.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recipients available
                  </p>
                )}
              </div>
            </ScrollArea>
            {/* Show removed recipients */}
            {removedEmails.size > 0 && (
              <div className="mt-2 p-2 border rounded-lg bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Removed ({removedEmails.size}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(removedEmails).map((email) => (
                    <Badge
                      key={email}
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted"
                      onClick={() => restoreRecipient(email)}
                    >
                      {email} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* ─── Subject ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="email-subject" className="text-sm font-semibold">
          Subject
        </Label>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject..."
          className="h-10"
        />
      </div>

      {/* ─── Rich Text Editor ─────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Message</Label>
        <div className="border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
            {/* Text formatting */}
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

            <ToolbarSeparator />

            {/* Headings */}
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

            <ToolbarSeparator />

            {/* Lists */}
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

            <ToolbarSeparator />

            {/* Alignment */}
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

            <ToolbarSeparator />

            {/* Link */}
            <ToolbarButton
              active={editor.isActive("link")}
              onClick={openLinkDialog}
              title="Insert link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>

            {/* Horizontal rule */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal rule"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            <div className="flex-1" />

            {/* Undo / Redo */}
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

          {/* Editor content */}
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ─── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={loadingPreview || sending}
        >
          {loadingPreview ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview
        </Button>

        <Button
          onClick={() => {
            if (!subject.trim()) {
              toast.error("Please enter a subject line")
              return
            }
            if (!editor?.getHTML() || editor.getHTML() === "<p></p>") {
              toast.error("Please write some email content")
              return
            }
            if (activeRecipients.length === 0) {
              toast.error("No recipients selected")
              return
            }
            setConfirmOpen(true)
          }}
          disabled={sending || activeRecipients.length === 0}
          className="bg-[#0B1E3A] hover:bg-[#0B1E3A]/90"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {sending ? "Sending..." : "Send Email"}
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
            <AlertDialogTitle>Send Email?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send &ldquo;{subject}&rdquo; to{" "}
              <strong>{activeRecipients.length}</strong> recipient
              {activeRecipients.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSend}
              className="bg-[#0B1E3A] hover:bg-[#0B1E3A]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to {activeRecipients.length} recipient
              {activeRecipients.length !== 1 ? "s" : ""}
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

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-border mx-1" />
}
