-- Audit log for all guest interactions
CREATE TABLE rsvp_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  previous_status TEXT,
  new_status TEXT,
  previous_count INTEGER,
  new_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_guest ON rsvp_audit_log(guest_id);
CREATE INDEX idx_audit_created ON rsvp_audit_log(created_at DESC);

ALTER TABLE rsvp_audit_log ENABLE ROW LEVEL SECURITY;
