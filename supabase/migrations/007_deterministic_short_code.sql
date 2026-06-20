-- Replace random short codes with deterministic MD5-derived ones.
-- md5(id::text) is computed by Postgres; first 12 hex chars = short code.
-- No trigger needed — new guests get short_code set by the application layer.

DROP TRIGGER IF EXISTS trg_guest_short_code ON guests;
DROP FUNCTION IF EXISTS set_guest_short_code();

ALTER TABLE guests ALTER COLUMN short_code DROP DEFAULT;

UPDATE guests SET short_code = LEFT(MD5(id::text), 12);
