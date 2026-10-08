-- Signing up again with a booked email resends its confirmation. This records
-- the last resend (the first email counts from created_at), to space them out.
ALTER TABLE experience_signups ADD COLUMN confirmation_sent_at TEXT;
