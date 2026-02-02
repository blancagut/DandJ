"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Tipos
type Message = {
  id: string
  content: string
  sender: "visitor" | "admin"
  created_at: string
}

type ChatStatus = "idle" | "loading" | "ready" | "error"

// Generar o recuperar visitor_id del localStorage
function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  
  let id = localStorage.getItem("chat_visitor_id")
  if (!id) {
    id = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem("chat_visitor_id", id)
  }
  return id
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const visitorIdRef = useRef<string>("")

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Inicializar o recuperar conversación
  const initConversation = useCallback(async () => {
    if (status !== "idle") return
    
    setStatus("loading")
    setError(null)

    try {
      const visitorId = getVisitorId()
      visitorIdRef.current = visitorId
      
      const supabase = getSupabaseBrowserClient()

      // Buscar conversación existente activa
      const { data: existing, error: searchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("visitor_id", visitorId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (searchError && searchError.code !== "PGRST116") {
        // PGRST116 = no rows found (ok, crearemos una nueva)
        console.error("Search error:", searchError)
      }

      let convId: string

      if (existing?.id) {
        // Usar conversación existente
        convId = existing.id
        
        // Cargar mensajes existentes
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("id, content, sender, created_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })

        setMessages((msgs || []) as Message[])
      } else {
        // Crear nueva conversación
        // @ts-expect-error - Sin tipos generados de Supabase
        const { data: newConv, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            visitor_id: visitorId,
            status: "active",
          })
          .select("id")
          .single()

        if (createError) {
          throw new Error("No se pudo iniciar el chat: " + createError.message)
        }

        convId = newConv.id
        setMessages([])
      }

      setConversationId(convId)
      setStatus("ready")

      // Suscribirse a nuevos mensajes
      const channel = supabase
        .channel(`chat_${convId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `conversation_id=eq.${convId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message
            setMessages((prev) => {
              // Evitar duplicados
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
        )
        .subscribe()

      // Cleanup en unmount
      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error("Init error:", err)
      setError(err instanceof Error ? err.message : "Error al conectar")
      setStatus("error")
    }
  }, [status])

  // Abrir chat
  const handleOpen = () => {
    setIsOpen(true)
    if (status === "idle") {
      initConversation()
    }
  }

  // Enviar mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputText.trim() || !conversationId || isSending) return

    const content = inputText.trim()
    setInputText("")
    setIsSending(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - Sin tipos generados
      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          content,
          sender: "visitor",
        })

      if (insertError) {
        setError("Error al enviar mensaje")
        setInputText(content) // Restaurar texto
        return
      }

      // Actualizar conversación
      // @ts-expect-error - Sin tipos generados
      await supabase
        .from("chat_conversations")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_count: 1, // Marcar como no leído para admin
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)

    } catch (err) {
      console.error("Send error:", err)
      setError("Error de conexión")
      setInputText(content)
    } finally {
      setIsSending(false)
    }
  }

  // Formatear hora
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
          aria-label="Abrir chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Chat de Soporte</h3>
              <p className="text-xs opacity-80">
                {status === "ready" ? "En línea" : status === "loading" ? "Conectando..." : ""}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {status === "loading" && (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Conectando...
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <p className="text-destructive text-sm mb-2">{error}</p>
                <button
                  onClick={() => {
                    setStatus("idle")
                    initConversation()
                  }}
                  className="text-sm underline text-primary"
                >
                  Reintentar
                </button>
              </div>
            )}

            {status === "ready" && messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>¡Hola! ¿En qué podemos ayudarte?</p>
                <p className="text-xs mt-1">Escribe tu mensaje abajo.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender === "visitor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "visitor" ? "opacity-70" : "text-muted-foreground"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {status === "ready" && (
            <form onSubmit={sendMessage} className="p-3 border-t bg-background">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={isSending}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSending ? "..." : "→"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
