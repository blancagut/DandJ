-- =====================================================
-- TABLA PARA EL FORMULARIO DE CONSULTA COMPLETO
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Crear tabla consultation_requests
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
  urgency TEXT NOT NULL,
  case_description TEXT NOT NULL,
  previous_attorney TEXT,
  court_date DATE,
  
  -- Contact Preferences
  preferred_contact_method TEXT NOT NULL,
  preferred_consultation_time TEXT,
  referral_source TEXT,
  
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

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(email);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created ON consultation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_urgency ON consultation_requests(urgency);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_consultation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_consultation_updated_at ON consultation_requests;
CREATE TRIGGER trigger_consultation_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar (para el formulario público)
DROP POLICY IF EXISTS "Allow public insert" ON consultation_requests;
CREATE POLICY "Allow public insert" ON consultation_requests
  FOR INSERT
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden leer
DROP POLICY IF EXISTS "Allow authenticated read" ON consultation_requests;
CREATE POLICY "Allow authenticated read" ON consultation_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Solo usuarios autenticados pueden actualizar
DROP POLICY IF EXISTS "Allow authenticated update" ON consultation_requests;
CREATE POLICY "Allow authenticated update" ON consultation_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta esto para verificar que la tabla existe:
-- SELECT * FROM consultation_requests LIMIT 1;
