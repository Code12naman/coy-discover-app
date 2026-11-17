import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type AppDatabase = Database.Database;

const schema = `
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 30),
    photo_url TEXT NOT NULL,
    bio TEXT NOT NULL,
    city_or_college TEXT NOT NULL,
    interests TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY,
    swiper_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (swiper_id, target_id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,
    profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS swipes_target_idx ON swipes(target_id);
  CREATE INDEX IF NOT EXISTS matches_created_at_idx ON matches(created_at);
`;

export function createDatabase(filename: string): AppDatabase {
  if (filename !== ":memory:" && !filename.startsWith("file:")) {
    mkdirSync(path.dirname(filename), { recursive: true });
  }

  const db = new Database(filename);
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(schema);
  return db;
}
