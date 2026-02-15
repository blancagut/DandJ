-- Table for storing signed H-2B digital contracts
CREATE TABLE IF NOT EXISTS h2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Client info
  client_name TEXT NOT NULL,
  client_dob DATE NOT NULL,
  client_passport TEXT NOT NULL,
  client_country TEXT NOT NULL,
  client_city TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  -- Lawyer selection
  lawyer_name TEXT NOT NULL DEFAULT 'Carlos Roberto Díaz',
  -- Contract date
  contract_day INTEGER NOT NULL,
  contract_month TEXT NOT NULL DEFAULT 'Febrero',
  contract_year INTEGER NOT NULL DEFAULT 2026,
  -- Signatures (base64 encoded PNG)
  client_signature TEXT NOT NULL,
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'signed' CHECK (status IN ('signed', 'voided', 'expired'))
);

-- Enable RLS
ALTER TABLE h2b_contracts ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (public contract signing)
CREATE POLICY "Allow public insert" ON h2b_contracts
  FOR INSERT TO anon WITH CHECK (true);

-- Allow admin read
CREATE POLICY "Allow admin read" ON h2b_contracts
  FOR SELECT TO authenticated USING (true);
