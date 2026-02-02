"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Tipos
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

interface ChatPanelProps {
  adminEmail: string
}

export function ChatPanel({ adminEmail }: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      const { data, error: queryError } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })

      if (queryError) {
        setError("Error al cargar conversaciones: " + queryError.message)
        return
      }

      setConversations((data || []) as Conversation[])
    } catch (err) {
      console.error("Load error:", err)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error: queryError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })

      if (queryError) {
        console.error("Messages error:", queryError)
        return
      }

      setMessages((data || []) as Message[])

      // Marcar como leído
      // @ts-expect-error - Sin tipos generados
      await supabase
        .from("chat_conversations")
        .update({ unread_count: 0 })
        .eq("id", convId)

      // Actualizar localmente
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      )
    } catch (err) {
      console.error("Load messages error:", err)
    }
  }, [])

  // Seleccionar conversación
  const selectConversation = (convId: string) => {
    setSelectedConvId(convId)
    loadMessages(convId)
  }

  // Enviar respuesta
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputText.trim() || !selectedConvId || isSending) return

    const content = inputText.trim()
    setInputText("")
    setIsSending(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - Sin tipos generados
      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: selectedConvId,
          content,
          sender: "admin",
          admin_email: adminEmail,
        })

      if (insertError) {
        setError("Error al enviar: " + insertError.message)
        setInputText(content)
        return
      }

      // Actualizar conversación
      // @ts-expect-error - Sin tipos generados
      await supabase
        .from("chat_conversations")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedConvId)

    } catch (err) {
      console.error("Send error:", err)
      setInputText(content)
    } finally {
      setIsSending(false)
    }
  }

  // Cerrar conversación
  const closeConversation = async (convId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - Sin tipos generados
      await supabase
        .from("chat_conversations")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", convId)

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, status: "closed" } : c))
      )

      if (selectedConvId === convId) {
        setSelectedConvId(null)
        setMessages([])
      }
    } catch (err) {
      console.error("Close error:", err)
    }
  }

  // Inicializar
  useEffect(() => {
    loadConversations()

    // Suscribirse a nuevas conversaciones y mensajes
    const supabase = getSupabaseBrowserClient()

    const conversationsChannel = supabase
      .channel("admin_conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    const messagesChannel = supabase
      .channel("admin_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMsg = payload.new as Message
          // Si es de la conversación seleccionada, agregar
          if (newMsg.conversation_id === selectedConvId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
          // Recargar lista de conversaciones para actualizar preview
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [loadConversations, selectedConvId])

  // Formatear hora
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Conversaciones activas
  const activeConversations = conversations.filter((c) => c.status === "active")
  const closedConversations = conversations.filter((c) => c.status === "closed")
  const unreadTotal = activeConversations.reduce((sum, c) => sum + c.unread_count, 0)

  const selectedConv = conversations.find((c) => c.id === selectedConvId)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Chat de Soporte</h2>
          <p className="text-sm text-muted-foreground">
            {activeConversations.length} activas
            {unreadTotal > 0 && (
              <span className="text-primary font-medium"> • {unreadTotal} sin leer</span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true)
            loadConversations()
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Layout de 2 columnas */}
      <div className="flex h-[500px]">
        {/* Lista de conversaciones */}
        <div className="w-1/3 border-r overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : activeConversations.length === 0 && closedConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No hay conversaciones
            </div>
          ) : (
            <>
              {/* Activas */}
              {activeConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-3 text-left border-b hover:bg-muted/50 transition-colors ${
                    selectedConvId === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {conv.visitor_name || `Visitante`}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message || "Sin mensajes"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(conv.last_message_at || conv.created_at)}
                  </p>
                </button>
              ))}

              {/* Cerradas (colapsadas) */}
              {closedConversations.length > 0 && (
                <div className="border-t">
                  <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/30">
                    Cerradas ({closedConversations.length})
                  </p>
                  {closedConversations.slice(0, 5).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full p-3 text-left border-b hover:bg-muted/50 opacity-60 ${
                        selectedConvId === conv.id ? "bg-muted opacity-100" : ""
                      }`}
                    >
                      <p className="text-xs truncate">{conv.last_message || "Sin mensajes"}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(conv.updated_at)}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Header de conversación */}
              <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                <div>
                  <p className="font-medium text-sm">
                    {selectedConv?.visitor_name || "Visitante"}
                  </p>
                  {selectedConv?.visitor_email && (
                    <p className="text-xs text-muted-foreground">{selectedConv.visitor_email}</p>
                  )}
                </div>
                {selectedConv?.status === "active" && (
                  <button
                    onClick={() => closeConversation(selectedConvId)}
                    className="text-xs px-2 py-1 border rounded hover:bg-secondary"
                  >
                    Cerrar
                  </button>
                )}
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "admin" ? "opacity-70" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                        {msg.sender === "admin" && msg.admin_email && (
                          <span className="ml-1">• {msg.admin_email.split("@")[0]}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de respuesta */}
              {selectedConv?.status === "active" && (
                <form onSubmit={sendReply} className="p-3 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      disabled={isSending}
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !inputText.trim()}
                      className="h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isSending ? "..." : "Enviar"}
                    </button>
                  </div>
                </form>
              )}

              {selectedConv?.status === "closed" && (
                <div className="p-3 border-t bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground">Conversación cerrada</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
