import type { AppDatabase } from "@/lib/db";
import type { PublicProfile } from "@/lib/types";
import { toPublicProfile, type ProfileRow } from "@/lib/services/profiles";

export async function getFeed(
  db: AppDatabase,
  limit = 10,
): Promise<PublicProfile[]> {
  const { rows } = await db.query<ProfileRow>(
    `SELECT id, name, age, photo_url, bio, city_or_college, interests
     FROM profiles
     WHERE id NOT IN (
       SELECT target_id FROM swipes WHERE swiper_id = 'me'
     )
     ORDER BY id ASC
     LIMIT $1`,
    [limit],
  );

  return rows.map(toPublicProfile);
}
