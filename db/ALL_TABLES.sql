-- =====================================================
-- TODAS LAS TABLAS PARA DIAZ & JOHNSON
-- Ejecutar COMPLETO en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLA: consultation_requests (Formulario completo)
-- =====================================================
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT NOT NULL,
  current_location TEXT NOT NULL,
  
  -- Case Information  
  case_type TEXT NOT NULL,
  case_sub_type TEXT,
  urgency TEXT NOT NULL,
  case_description TEXT NOT NULL,
  previous_attorney TEXT,
  court_date DATE,
  
  -- Contact Preferences
  preferred_contact_method TEXT NOT NULL,
  preferred_consultation_time TEXT,
  referral_source TEXT,
  document_types JSONB DEFAULT '[]'::jsonb,
  
  -- Files (stored as JSON array)
  files JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'scheduled', 'completed', 'archived')),
  notes TEXT,
  assigned_to TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(email);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created ON consultation_requests(created_at DESC);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultation_public_insert" ON consultation_requests;
CREATE POLICY "consultation_public_insert" ON consultation_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "consultation_auth_read" ON consultation_requests;
CREATE POLICY "consultation_auth_read" ON consultation_requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "consultation_auth_update" ON consultation_requests;
CREATE POLICY "consultation_auth_update" ON consultation_requests
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 2. TABLA: consult_requests (Formulario simple - backup)
-- =====================================================
CREATE TABLE IF NOT EXISTS consult_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_revision', 'contactado', 'cerrado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_requests_created_at ON consult_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consult_requests_status ON consult_requests(status);

ALTER TABLE consult_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consult_public_insert" ON consult_requests;
CREATE POLICY "consult_public_insert" ON consult_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "consult_auth_read" ON consult_requests;
CREATE POLICY "consult_auth_read" ON consult_requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "consult_auth_update" ON consult_requests;
CREATE POLICY "consult_auth_update" ON consult_requests
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 3. TABLA: work_items (Admin dashboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS work_items_updated_at_idx ON work_items (updated_at DESC);
CREATE INDEX IF NOT EXISTS work_items_status_updated_at_idx ON work_items (status, updated_at DESC);

ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "work_items_auth_all" ON work_items;
CREATE POLICY "work_items_auth_all" ON work_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 4. TABLA: chat_conversations (Chat soporte)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor ON chat_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_conv_insert" ON chat_conversations;
CREATE POLICY "chat_conv_insert" ON chat_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_conv_select" ON chat_conversations;
CREATE POLICY "chat_conv_select" ON chat_conversations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "chat_conv_update" ON chat_conversations;
CREATE POLICY "chat_conv_update" ON chat_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 5. TABLA: chat_messages (Mensajes del chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('visitor', 'admin')),
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_msg_insert" ON chat_messages;
CREATE POLICY "chat_msg_insert" ON chat_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_msg_select" ON chat_messages;
CREATE POLICY "chat_msg_select" ON chat_messages
  FOR SELECT TO anon, authenticated USING (true);

-- =====================================================
-- 6. TABLA: leads (Sistema de leads general)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'consultation', 'h2b')),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  language TEXT,
  case_type TEXT,
  message TEXT,
  raw JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_type_created_at_idx ON leads (lead_type, created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_public_insert" ON leads;
CREATE POLICY "leads_public_insert" ON leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "leads_auth_read" ON leads;
CREATE POLICY "leads_auth_read" ON leads
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 7. TABLA: lead_files (Archivos de leads)
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_files (
  id BIGSERIAL PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  blob_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_files_lead_id_idx ON lead_files (lead_id);

ALTER TABLE lead_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_files_public_insert" ON lead_files;
CREATE POLICY "lead_files_public_insert" ON lead_files
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "lead_files_auth_read" ON lead_files;
CREATE POLICY "lead_files_auth_read" ON lead_files
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 8. TABLAS: screening forms (petition/waiver/work)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_screenings_created ON work_screenings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_screenings_status ON work_screenings(status);

ALTER TABLE work_screenings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "work_screenings_public_insert" ON work_screenings;
CREATE POLICY "work_screenings_public_insert" ON work_screenings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "work_screenings_auth_read" ON work_screenings;
CREATE POLICY "work_screenings_auth_read" ON work_screenings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "work_screenings_auth_update" ON work_screenings;
CREATE POLICY "work_screenings_auth_update" ON work_screenings
  FOR UPDATE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS waiver_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waiver_screenings_created ON waiver_screenings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waiver_screenings_status ON waiver_screenings(status);

ALTER TABLE waiver_screenings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waiver_screenings_public_insert" ON waiver_screenings;
CREATE POLICY "waiver_screenings_public_insert" ON waiver_screenings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "waiver_screenings_auth_read" ON waiver_screenings;
CREATE POLICY "waiver_screenings_auth_read" ON waiver_screenings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "waiver_screenings_auth_update" ON waiver_screenings;
CREATE POLICY "waiver_screenings_auth_update" ON waiver_screenings
  FOR UPDATE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS petition_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_petition_screenings_created ON petition_screenings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petition_screenings_status ON petition_screenings(status);

ALTER TABLE petition_screenings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "petition_screenings_public_insert" ON petition_screenings;
CREATE POLICY "petition_screenings_public_insert" ON petition_screenings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "petition_screenings_auth_read" ON petition_screenings;
CREATE POLICY "petition_screenings_auth_read" ON petition_screenings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "petition_screenings_auth_update" ON petition_screenings;
CREATE POLICY "petition_screenings_auth_update" ON petition_screenings
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 9. TABLA: h2b_contracts (Digital contracts)
-- =====================================================
CREATE TABLE IF NOT EXISTS h2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_dob DATE NOT NULL,
  client_passport TEXT NOT NULL,
  client_country TEXT NOT NULL,
  client_city TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  lawyer_name TEXT NOT NULL DEFAULT 'Carlos Roberto Díaz',
  contract_day INTEGER NOT NULL,
  contract_month TEXT NOT NULL DEFAULT 'Febrero',
  contract_year INTEGER NOT NULL DEFAULT 2026,
  client_signature TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'signed' CHECK (status IN ('signed', 'voided', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_h2b_contracts_signed_at ON h2b_contracts(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_h2b_contracts_email ON h2b_contracts(client_email);

ALTER TABLE h2b_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "h2b_contracts_public_insert" ON h2b_contracts;
CREATE POLICY "h2b_contracts_public_insert" ON h2b_contracts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "h2b_contracts_auth_read" ON h2b_contracts;
CREATE POLICY "h2b_contracts_auth_read" ON h2b_contracts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "h2b_contracts_auth_update" ON h2b_contracts;
CREATE POLICY "h2b_contracts_auth_update" ON h2b_contracts
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- HABILITAR REALTIME PARA CHAT
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =====================================================
-- VERIFICACIÓN - Ejecutar después para confirmar
-- =====================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
