import type { AppDatabase } from "@/lib/db";
import type { MatchedProfile } from "@/lib/types";
import { toPublicProfile, type ProfileRow } from "@/lib/services/profiles";

type MatchRow = ProfileRow & { matchedAt: string };

export function getMatches(db: AppDatabase): MatchedProfile[] {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.age, p.photo_url, p.bio, p.city_or_college,
              p.interests, m.created_at AS matchedAt
       FROM matches AS m
       INNER JOIN profiles AS p ON p.id = m.profile_id
       INNER JOIN swipes AS mine
         ON mine.target_id = p.id AND mine.swiper_id = 'me' AND mine.direction = 'like'
       INNER JOIN swipes AS theirs
         ON theirs.swiper_id = p.id AND theirs.target_id = 'me' AND theirs.direction = 'like'
       ORDER BY m.created_at DESC, m.id DESC`,
    )
    .all() as MatchRow[];

  return rows.map(({ matchedAt, ...profile }) => ({
    ...toPublicProfile(profile),
    matchedAt,
  }));
}
