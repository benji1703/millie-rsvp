-- Add short_code column for obfuscated short URLs (12 hex chars = 16^12 combinations)
ALTER TABLE guests ADD COLUMN short_code TEXT;

UPDATE guests
SET short_code = encode(gen_random_bytes(6), 'hex')
WHERE short_code IS NULL;

ALTER TABLE guests ALTER COLUMN short_code SET NOT NULL;
ALTER TABLE guests ALTER COLUMN short_code SET DEFAULT encode(gen_random_bytes(6), 'hex');

CREATE UNIQUE INDEX guests_short_code_idx ON guests (short_code);
