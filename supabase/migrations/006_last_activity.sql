ALTER TABLE guests ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

UPDATE guests g
SET last_activity_at = (
  SELECT MAX(created_at) FROM rsvp_audit_log WHERE guest_id = g.id
);

CREATE OR REPLACE FUNCTION update_guest_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guests SET last_activity_at = NEW.created_at WHERE id = NEW.guest_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_guest_last_activity
AFTER INSERT ON rsvp_audit_log
FOR EACH ROW EXECUTE FUNCTION update_guest_last_activity();

CREATE INDEX IF NOT EXISTS idx_guests_last_activity ON guests(last_activity_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_guest_count ON guests(guest_count);
