-- =====================================================
-- ADD DELETE POLICIES FOR ALL ADMIN-MANAGED TABLES
-- Run this in Supabase SQL Editor
-- =====================================================
-- RLS is enabled on all tables but DELETE policies were missing,
-- causing delete operations from the admin dashboard to silently fail.

-- 1. consultation_requests
DROP POLICY IF EXISTS "consultation_auth_delete" ON consultation_requests;
CREATE POLICY "consultation_auth_delete" ON consultation_requests
  FOR DELETE TO authenticated USING (true);

-- 2. leads
DROP POLICY IF EXISTS "leads_auth_delete" ON leads;
CREATE POLICY "leads_auth_delete" ON leads
  FOR DELETE TO authenticated USING (true);

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

-- 7. work_items (already has FOR ALL policy, but adding explicit delete for safety)
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
-- VERIFICATION - Run after to confirm policies exist
-- =====================================================
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND cmd = 'DELETE';
