-- Store email + full name for confirmation messages, and unique-key on email
-- so the same person can only hold one spot per experience.
CREATE TABLE experience_signups_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_key TEXT NOT NULL,
  cancel_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO experience_signups_v2 (id, experience_id, full_name, email, email_key, cancel_token, created_at)
SELECT
  id,
  experience_id,
  trim(first_name || ' ' || last_name),
  '',
  'legacy-' || id,
  cancel_token,
  created_at
FROM experience_signups;

DROP TABLE experience_signups;
ALTER TABLE experience_signups_v2 RENAME TO experience_signups;

CREATE UNIQUE INDEX experience_signups_unique_email
  ON experience_signups (experience_id, email_key);
