-- Staff tools at tools.alps.foundation/experiences: door check-in, and who
-- added a booking at the desk (null for bookings made on /links).
ALTER TABLE experience_signups ADD COLUMN checked_in_at TEXT;
ALTER TABLE experience_signups ADD COLUMN added_by TEXT;
