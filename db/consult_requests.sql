-- =============================================
-- TABLA: consult_requests
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Si necesitas recrear, descomenta estas líneas:
-- DROP POLICY IF EXISTS "Permitir inserts públicos" ON consult_requests;
-- DROP POLICY IF EXISTS "Solo auth puede leer" ON consult_requests;
-- DROP POLICY IF EXISTS "Solo auth puede actualizar" ON consult_requests;
-- DROP POLICY IF EXISTS "Solo auth puede eliminar" ON consult_requests;
-- DROP TABLE IF EXISTS consult_requests;

-- Crear la tabla
CREATE TABLE IF NOT EXISTS consult_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos del solicitante
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT NOT NULL,
  
  -- Estado de la solicitud
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_revision', 'contactado', 'cerrado')),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_consult_requests_created_at ON consult_requests(created_at DESC);

-- Índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_consult_requests_status ON consult_requests(status);

-- Habilitar Row Level Security
ALTER TABLE consult_requests ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede INSERTAR (formulario público)
CREATE POLICY "Permitir inserts públicos" ON consult_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden LEER
CREATE POLICY "Solo auth puede leer" ON consult_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden ACTUALIZAR
CREATE POLICY "Solo auth puede actualizar" ON consult_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden ELIMINAR
CREATE POLICY "Solo auth puede eliminar" ON consult_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Pega este código y ejecuta
-- =============================================
