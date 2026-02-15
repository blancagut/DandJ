-- ============================================================
-- email_logs: stores every email sent from the admin panel
-- ============================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  sender_email    TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_source TEXT,                              -- 'all', 'consultations', 'leads', etc.
  status          TEXT NOT NULL DEFAULT 'sent',       -- sent | failed | partial
  resend_ids      JSONB DEFAULT '[]'::jsonb,          -- array of Resend message IDs
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying by date (most recent first)
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs (status);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow service-role full access (admin API routes use service-role key)
CREATE POLICY "Service role full access on email_logs"
  ON email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
