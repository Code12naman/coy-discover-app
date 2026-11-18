import type { AppDatabase } from "@/lib/db";
import type { SwipeDirection, SwipeResult } from "@/lib/types";
import { toPublicProfile, type ProfileRow } from "@/lib/services/profiles";

export class UnknownProfileError extends Error {
  constructor() {
    super("Profile not found");
    this.name = "UnknownProfileError";
  }
}

type ExistingSwipeRow = { direction: SwipeDirection };

export function swipeProfile(
  db: AppDatabase,
  targetId: string,
  direction: SwipeDirection,
): Promise<SwipeResult> {
  return db.transaction(async (transaction) => {
    const profileResult = await transaction.query<ProfileRow>(
      `SELECT id, name, age, photo_url, bio, city_or_college, interests
       FROM profiles WHERE id = $1`,
      [targetId],
    );
    const profile = profileResult.rows[0];
    if (!profile) throw new UnknownProfileError();

    const existingSwipeResult = await transaction.query<ExistingSwipeRow>(
      "SELECT direction FROM swipes WHERE swiper_id = 'me' AND target_id = $1",
      [targetId],
    );
    const existingSwipe = existingSwipeResult.rows[0];
    if (existingSwipe) {
      const existingMatch = await transaction.query(
        "SELECT 1 FROM matches WHERE profile_id = $1",
        [targetId],
      );
      return existingSwipe.direction === "like" && existingMatch.rows.length
        ? { matched: true, profile: toPublicProfile(profile) }
        : { matched: false };
    }

    const inserted = await transaction.query<{ target_id: string }>(
      `INSERT INTO swipes (swiper_id, target_id, direction)
       VALUES ('me', $1, $2)
       ON CONFLICT (swiper_id, target_id) DO NOTHING
       RETURNING target_id`,
      [targetId, direction],
    );
    if (!inserted.rows.length) {
      const storedSwipe = await transaction.query<ExistingSwipeRow>(
        "SELECT direction FROM swipes WHERE swiper_id = 'me' AND target_id = $1",
        [targetId],
      );
      const existingMatch = await transaction.query(
        "SELECT 1 FROM matches WHERE profile_id = $1",
        [targetId],
      );
      return storedSwipe.rows[0]?.direction === "like" &&
        existingMatch.rows.length
        ? { matched: true, profile: toPublicProfile(profile) }
        : { matched: false };
    }

    const reciprocalLike = await transaction.query(
      `SELECT 1 FROM swipes
       WHERE swiper_id = $1 AND target_id = 'me' AND direction = 'like'`,
      [targetId],
    );

    if (direction === "like" && reciprocalLike.rows.length) {
      await transaction.query(
        "INSERT INTO matches (profile_id) VALUES ($1) ON CONFLICT (profile_id) DO NOTHING",
        [targetId],
      );
      return { matched: true, profile: toPublicProfile(profile) };
    }

    return { matched: false };
  });
}
