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
): SwipeResult {
  const execute = db.transaction((): SwipeResult => {
    const profile = db
      .prepare(
        `SELECT id, name, age, photo_url, bio, city_or_college, interests
         FROM profiles WHERE id = ?`,
      )
      .get(targetId) as ProfileRow | undefined;

    if (!profile) throw new UnknownProfileError();

    const existingSwipe = db
      .prepare(
        "SELECT direction FROM swipes WHERE swiper_id = 'me' AND target_id = ?",
      )
      .get(targetId) as ExistingSwipeRow | undefined;
    const reciprocalLike = db
      .prepare(
        `SELECT 1 FROM swipes
         WHERE swiper_id = ? AND target_id = 'me' AND direction = 'like'`,
      )
      .get(targetId);

    if (existingSwipe) {
      const existingMatch = db
        .prepare("SELECT 1 FROM matches WHERE profile_id = ?")
        .get(targetId);
      return existingSwipe.direction === "like" && existingMatch
        ? { matched: true, profile: toPublicProfile(profile) }
        : { matched: false };
    }

    db.prepare(
      "INSERT INTO swipes (swiper_id, target_id, direction) VALUES ('me', ?, ?)",
    ).run(targetId, direction);

    if (direction === "like" && reciprocalLike) {
      db.prepare("INSERT OR IGNORE INTO matches (profile_id) VALUES (?)").run(
        targetId,
      );
      return { matched: true, profile: toPublicProfile(profile) };
    }

    return { matched: false };
  });

  return execute();
}
