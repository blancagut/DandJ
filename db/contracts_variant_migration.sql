-- Add contract variant support so H-2B PDFs can preserve the correct pricing schedule
ALTER TABLE h2b_contracts
  ADD COLUMN IF NOT EXISTS contract_variant TEXT NOT NULL DEFAULT 'split_300_200';
