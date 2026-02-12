"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Search, Trash2, X, MessageSquare } from "lucide-react"

// ── Types ──────────────────────────────────────────
type Conversation = {
  id: string
  visitor_id: string
  visitor_name: string | null
  visitor_email: string | null
  status: "active" | "closed"
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

type Message = {
  id: string
  conversation_id: string
  content: string
  sender: "visitor" | "admin"
  admin_email: string | null
  created_at: string
}

interface ChatTabProps {
  adminEmail: string
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

// ── Main Panel ─────────────────────────────────────
export function ChatTab({ adminEmail }: ChatTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Load conversations ────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()
      const { data, error: e } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
      if (e) throw new Error(e.message)
      setConversations((data || []) as Conversation[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Load messages ─────────────────────────────
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error: e } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
      if (e) return
      setMessages((data || []) as Message[])
      // Mark as read
      // @ts-expect-error - No generated types
      await supabase.from("chat_conversations").update({ unread_count: 0 }).eq("id", convId)
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c)))
    } catch {}
  }, [])

  const selectConversation = (convId: string) => {
    setSelectedConvId(convId)
    loadMessages(convId)
  }

  // ── Send reply ────────────────────────────────
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedConvId || isSending) return
    const content = inputText.trim()
    setInputText("")
    setIsSending(true)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { error: insertError } = await supabase.from("chat_messages").insert({
        conversation_id: selectedConvId,
        content,
        sender: "admin",
        admin_email: adminEmail,
      })
      if (insertError) { setInputText(content); return }
      // @ts-expect-error - No generated types
      await supabase.from("chat_conversations").update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", selectedConvId)
    } catch {
      setInputText(content)
    } finally {
      setIsSending(false)
    }
  }

  // ── Close conversation ────────────────────────
  const closeConversation = async (convId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      await supabase.from("chat_conversations").update({
        status: "closed",
        updated_at: new Date().toISOString(),
      }).eq("id", convId)
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, status: "closed" } : c)))
      if (selectedConvId === convId) { setSelectedConvId(null); setMessages([]) }
    } catch {}
  }

  // ── Delete conversation ───────────────────────
  const deleteConversation = async (convId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      // Delete messages first, then conversation
      const { error: msgErr } = await supabase.from("chat_messages").delete().eq("conversation_id", convId)
      if (msgErr) { alert("Error deleting messages: " + msgErr.message); setDeleteConfirm(null); return }
      const { error: convErr } = await supabase.from("chat_conversations").delete().eq("id", convId)
      if (convErr) { alert("Error deleting conversation: " + convErr.message); setDeleteConfirm(null); return }
      // Verify deletion actually happened (RLS may silently block)
      const { data: check } = await supabase.from("chat_conversations").select("id").eq("id", convId).maybeSingle()
      if (check) { alert("Delete failed — check database permissions (RLS policies). Run the add-delete-policies.sql migration in Supabase SQL Editor."); setDeleteConfirm(null); return }
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (selectedConvId === convId) { setSelectedConvId(null); setMessages([]) }
    } catch {}
    setDeleteConfirm(null)
  }

  // ── Realtime ──────────────────────────────────
  useEffect(() => {
    loadConversations()
    const supabase = getSupabaseBrowserClient()
    const convChannel = supabase
      .channel("admin_chat_convs")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => loadConversations())
      .subscribe()
    const msgChannel = supabase
      .channel("admin_chat_msgs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMsg = payload.new as Message
        if (newMsg.conversation_id === selectedConvId) {
          setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg])
        }
        loadConversations()
      })
      .subscribe()
    return () => { supabase.removeChannel(convChannel); supabase.removeChannel(msgChannel) }
  }, [loadConversations, selectedConvId])

  // ── Filtering ─────────────────────────────────
  const filteredConversations = conversations.filter((c) => {
    if (filter === "active" && c.status !== "active") return false
    if (filter === "closed" && c.status !== "closed") return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        (c.visitor_name || "").toLowerCase().includes(q) ||
        (c.visitor_email || "").toLowerCase().includes(q) ||
        (c.last_message || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const activeCount = conversations.filter((c) => c.status === "active").length
  const unreadTotal = conversations.filter((c) => c.status === "active").reduce((sum, c) => sum + c.unread_count, 0)
  const selectedConv = conversations.find((c) => c.id === selectedConvId)

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading chats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {activeCount} active{unreadTotal > 0 && <span className="text-primary font-medium"> &middot; {unreadTotal} unread</span>}
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "closed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-9 text-xs capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 2-column layout */}
      <div className="flex rounded-lg border overflow-hidden h-[550px]">
        {/* Conversation list */}
        <div className="w-1/3 border-r flex flex-col">
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No conversations</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConvId === conv.id ? "bg-muted" : ""
                  } ${conv.status === "closed" ? "opacity-60" : ""}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {conv.visitor_name || "Visitor"}
                    </span>
                    <div className="flex items-center gap-1">
                      {conv.unread_count > 0 && (
                        <Badge className="h-5 px-1.5 text-xs">{conv.unread_count}</Badge>
                      )}
                      {conv.status === "closed" && (
                        <Badge variant="secondary" className="text-[10px] px-1">closed</Badge>
                      )}
                    </div>
                  </div>
                  {conv.visitor_email && (
                    <p className="text-xs text-muted-foreground truncate">{conv.visitor_email}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.last_message || "No messages"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(conv.last_message_at || conv.created_at)}</p>

                  {/* Delete button (on hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(conv.id) }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                <div>
                  <p className="font-medium text-sm">{selectedConv?.visitor_name || "Visitor"}</p>
                  {selectedConv?.visitor_email && (
                    <p className="text-xs text-muted-foreground">{selectedConv.visitor_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedConv?.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => closeConversation(selectedConvId)} className="h-7 text-xs">
                      <X className="h-3 w-3 mr-1" /> Close
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(selectedConvId)}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "admin" ? "opacity-70" : "text-muted-foreground"}`}>
                          {formatTime(msg.created_at)}
                          {msg.sender === "admin" && msg.admin_email && (
                            <span className="ml-1">&middot; {msg.admin_email.split("@")[0]}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              {selectedConv?.status === "active" ? (
                <form onSubmit={sendReply} className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your reply..."
                      disabled={isSending}
                      className="flex-1 h-10"
                    />
                    <Button type="submit" disabled={isSending || !inputText.trim()} className="h-10">
                      {isSending ? "..." : "Send"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-3 border-t bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground">Conversation closed</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all its messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteConversation(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
