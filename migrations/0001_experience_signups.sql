-- Experience sign-ups from /links. The first `capacity` rows per experience
-- (by id) are confirmed, the rest are on the waitlist, so removing a row
-- automatically promotes the next person.
CREATE TABLE IF NOT EXISTS experience_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  cancel_token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS experience_signups_unique_name
  ON experience_signups (experience_id, name_key);
