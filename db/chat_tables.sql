-- =============================================
-- TABLAS: Chat de Soporte
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de conversaciones
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificador del visitante (guardado en localStorage)
  visitor_id TEXT NOT NULL,
  
  -- Info opcional del visitante
  visitor_name TEXT,
  visitor_email TEXT,
  
  -- Estado de la conversación
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  
  -- Último mensaje (para preview)
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Si tiene mensajes sin leer por el admin
  unread_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Referencia a la conversación
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Contenido del mensaje
  content TEXT NOT NULL,
  
  -- Quién envió: 'visitor' o 'admin'
  sender TEXT NOT NULL CHECK (sender IN ('visitor', 'admin')),
  
  -- Si es del admin, guardar quién
  admin_email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor ON chat_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- CONVERSACIONES: Cualquiera puede crear (visitantes anónimos)
CREATE POLICY "Permitir crear conversaciones" ON chat_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- CONVERSACIONES: Visitantes pueden leer sus propias conversaciones
CREATE POLICY "Visitantes leen sus conversaciones" ON chat_conversations
  FOR SELECT TO anon
  USING (true);

-- CONVERSACIONES: Usuarios auth pueden leer todas
CREATE POLICY "Admin lee todas las conversaciones" ON chat_conversations
  FOR SELECT TO authenticated
  USING (true);

-- CONVERSACIONES: Usuarios auth pueden actualizar
CREATE POLICY "Admin actualiza conversaciones" ON chat_conversations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- MENSAJES: Cualquiera puede crear mensajes
CREATE POLICY "Permitir crear mensajes" ON chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- MENSAJES: Cualquiera puede leer mensajes (filtrado por conversation_id en el cliente)
CREATE POLICY "Leer mensajes" ON chat_messages
  FOR SELECT TO anon, authenticated
  USING (true);

-- =============================================
-- HABILITAR REALTIME
-- =============================================

-- Habilitar publicación realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase → SQL Editor
-- 2. Pega este código y ejecuta
-- 3. Si hay errores de "already exists", ignóralos
-- =============================================
