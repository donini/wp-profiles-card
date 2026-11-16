CREATE TABLE profiles (
  username TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  avatar_data TEXT NOT NULL DEFAULT '',
  fetched_at INTEGER NOT NULL,
  first_seen INTEGER NOT NULL
);
CREATE INDEX profiles_first_seen ON profiles(first_seen DESC, username);
