-- ============================================================
-- mailing_templates: reusable templates for admin mailing engine
-- ============================================================

CREATE TABLE IF NOT EXISTS mailing_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('campaign', 'header', 'footer')),
  audience      TEXT NOT NULL DEFAULT 'All',
  language      TEXT NOT NULL DEFAULT 'ES' CHECK (language IN ('ES', 'EN')),
  subject       TEXT NOT NULL DEFAULT '',
  body_html     TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mailing_templates_type ON mailing_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_mailing_templates_active ON mailing_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_mailing_templates_sort_order ON mailing_templates(sort_order, created_at DESC);

ALTER TABLE mailing_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on mailing_templates" ON mailing_templates;
CREATE POLICY "Service role full access on mailing_templates"
  ON mailing_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);
