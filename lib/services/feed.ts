import type { AppDatabase } from "@/lib/db";
import type { PublicProfile } from "@/lib/types";
import { toPublicProfile, type ProfileRow } from "@/lib/services/profiles";

export function getFeed(db: AppDatabase, limit = 10): PublicProfile[] {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.age, p.photo_url, p.bio, p.city_or_college, p.interests
       FROM profiles AS p
       WHERE NOT EXISTS (
         SELECT 1 FROM swipes AS s
         WHERE s.swiper_id = 'me' AND s.target_id = p.id
       )
       ORDER BY p.id ASC
       LIMIT ?`,
    )
    .all(limit) as ProfileRow[];

  return rows.map(toPublicProfile);
}
