-- =====================================================
-- SCREENING TABLES - Work, Waiver, Petition
-- Stores actual user submissions from /consult wizards
-- Run in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLA: work_screenings
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

-- =====================================================
-- 2. TABLA: waiver_screenings
-- =====================================================
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

-- =====================================================
-- 3. TABLA: petition_screenings
-- =====================================================
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
-- 4. TABLA: h2b_intake_submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS h2b_intake_submissions (
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

CREATE INDEX IF NOT EXISTS idx_h2b_intake_created ON h2b_intake_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_h2b_intake_status ON h2b_intake_submissions(status);

ALTER TABLE h2b_intake_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "h2b_intake_public_insert" ON h2b_intake_submissions;
CREATE POLICY "h2b_intake_public_insert" ON h2b_intake_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "h2b_intake_auth_read" ON h2b_intake_submissions;
CREATE POLICY "h2b_intake_auth_read" ON h2b_intake_submissions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "h2b_intake_auth_update" ON h2b_intake_submissions;
CREATE POLICY "h2b_intake_auth_update" ON h2b_intake_submissions
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('work_screenings', 'waiver_screenings', 'petition_screenings', 'h2b_intake_submissions');
