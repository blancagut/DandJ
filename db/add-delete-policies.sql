-- =====================================================
-- ADMIN FIX MIGRATION — Run in Supabase SQL Editor
-- Fixes: deletes not persisting, missing columns, schema issues
-- =====================================================

-- =====================================================
-- A. ADD MISSING COLUMNS TO `leads` TABLE
-- The Contacts tab needs status + updated_at but
-- the leads table was created without them
-- =====================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Also ensure consultation_requests has these optional columns
ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS case_sub_type TEXT;
ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS document_types JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- B. ADD DELETE POLICIES FOR ALL TABLES
-- RLS is enabled on all tables but DELETE policies were
-- missing, causing delete operations to silently fail
-- =====================================================

-- 1. consultation_requests
DROP POLICY IF EXISTS "consultation_auth_delete" ON consultation_requests;
CREATE POLICY "consultation_auth_delete" ON consultation_requests
  FOR DELETE TO authenticated USING (true);

-- 2. leads
DROP POLICY IF EXISTS "leads_auth_delete" ON leads;
CREATE POLICY "leads_auth_delete" ON leads
  FOR DELETE TO authenticated USING (true);

-- Also add UPDATE policy for leads (status changes)
DROP POLICY IF EXISTS "leads_auth_update" ON leads;
CREATE POLICY "leads_auth_update" ON leads
  FOR UPDATE TO authenticated USING (true);

-- 3. lead_files
DROP POLICY IF EXISTS "lead_files_auth_delete" ON lead_files;
CREATE POLICY "lead_files_auth_delete" ON lead_files
  FOR DELETE TO authenticated USING (true);

-- 4. work_screenings
DROP POLICY IF EXISTS "work_screenings_auth_delete" ON work_screenings;
CREATE POLICY "work_screenings_auth_delete" ON work_screenings
  FOR DELETE TO authenticated USING (true);

-- 5. waiver_screenings
DROP POLICY IF EXISTS "waiver_screenings_auth_delete" ON waiver_screenings;
CREATE POLICY "waiver_screenings_auth_delete" ON waiver_screenings
  FOR DELETE TO authenticated USING (true);

-- 6. petition_screenings
DROP POLICY IF EXISTS "petition_screenings_auth_delete" ON petition_screenings;
CREATE POLICY "petition_screenings_auth_delete" ON petition_screenings
  FOR DELETE TO authenticated USING (true);

-- 7. work_items
DROP POLICY IF EXISTS "work_items_auth_delete" ON work_items;
CREATE POLICY "work_items_auth_delete" ON work_items
  FOR DELETE TO authenticated USING (true);

-- 8. chat_conversations
DROP POLICY IF EXISTS "chat_conv_delete" ON chat_conversations;
CREATE POLICY "chat_conv_delete" ON chat_conversations
  FOR DELETE TO authenticated USING (true);

-- 9. chat_messages
DROP POLICY IF EXISTS "chat_msg_delete" ON chat_messages;
CREATE POLICY "chat_msg_delete" ON chat_messages
  FOR DELETE TO authenticated USING (true);

-- =====================================================
-- C. RELOAD SCHEMA CACHE
-- After running this, go to Supabase Dashboard →
-- Settings → API → click "Reload schema cache"
-- =====================================================

-- =====================================================
-- VERIFICATION — Run these after to confirm:
-- =====================================================
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND cmd = 'DELETE';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'leads' AND column_name IN ('status', 'updated_at');
