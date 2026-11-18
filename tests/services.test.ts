import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { newDb } from "pg-mem";
import {
  createDatabaseFromPool,
  initializeDatabase,
  type AppDatabase,
} from "@/lib/db";
import { getFeed } from "@/lib/services/feed";
import { getMatches } from "@/lib/services/matches";
import { swipeProfile } from "@/lib/services/swipe";
import { handleFeedGet } from "@/lib/routes/feed";
import { handleMatchesGet } from "@/lib/routes/matches";
import { handleSwipePost } from "@/lib/routes/swipe";
import { seedDatabase } from "@/lib/seed";
import type { PublicProfile } from "@/lib/types";

describe("Discover services", () => {
  let db: AppDatabase;
  let memoryDatabase: ReturnType<typeof newDb>;

  beforeEach(async () => {
    memoryDatabase = newDb();
    const { Pool } = memoryDatabase.adapters.createPg();
    db = createDatabaseFromPool(new Pool());
    await initializeDatabase(db);
  });

  afterEach(async () => {
    await db.close();
  });

  async function addProfile(id: string, name = id): Promise<void> {
    const profile: PublicProfile = {
      id,
      name,
      age: 24,
      photo_url: `https://example.com/${id}.jpg`,
      bio: "A test profile",
      city_or_college: "Brooklyn",
      interests: ["Books", "Coffee", "Music"],
    };
    await db.query(
      `INSERT INTO profiles
       (id, name, age, photo_url, bio, city_or_college, interests)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        profile.id,
        profile.name,
        profile.age,
        profile.photo_url,
        profile.bio,
        profile.city_or_college,
        JSON.stringify(profile.interests),
      ],
    );
  }

  async function addSwipe(
    swiperId: string,
    targetId: string,
    direction: "like" | "pass",
  ): Promise<void> {
    await db.query(
      "INSERT INTO swipes (swiper_id, target_id, direction) VALUES ($1, $2, $3)",
      [swiperId, targetId, direction],
    );
  }

  it("seeds 36 profiles and makes incoming likes available without revealing them", async () => {
    await seedDatabase(db);
    await seedDatabase(db);

    const profileCount = await db.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM profiles",
    );
    const incomingLikes = await db.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM swipes WHERE target_id = 'me' AND direction = 'like'",
    );

    expect(profileCount.rows[0]?.count).toBe("36");
    expect(incomingLikes.rows[0]?.count).toBe("9");
    expect(await getFeed(db, 100)).toHaveLength(36);
    expect((await getFeed(db, 10)).map(({ id }) => id)).toHaveLength(10);
  });

  it("excludes every profile already swiped on from the feed", async () => {
    await addProfile("p1");
    await addProfile("p2");
    await addProfile("p3");
    await addSwipe("me", "p2", "pass");

    expect((await getFeed(db)).map((profile) => profile.id)).toEqual([
      "p1",
      "p3",
    ]);
  });

  it("creates a match when both directions are likes", async () => {
    await addProfile("p1", "Maya");
    await addSwipe("p1", "me", "like");

    const result = await swipeProfile(db, "p1", "like");
    expect(result).toEqual({
      matched: true,
      profile: expect.objectContaining({ id: "p1", name: "Maya" }),
    });
    if (result.matched) {
      expect(Object.keys(result.profile).sort()).toEqual(
        [
          "age",
          "bio",
          "city_or_college",
          "id",
          "interests",
          "name",
          "photo_url",
        ].sort(),
      );
    }
    expect(await getMatches(db)).toHaveLength(1);
  });

  it("persists likes, passes, and matches across feed reloads", async () => {
    await seedDatabase(db);

    const firstFeedResponse = await handleFeedGet(
      new Request("http://localhost/api/feed"),
      db,
    );
    const firstFeed = (await firstFeedResponse.json()) as {
      profiles: PublicProfile[];
    };
    expect(firstFeed.profiles.map(({ id }) => id)).toContain("p01");

    const likeResponse = await handleSwipePost(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: "p01", direction: "like" }),
      }),
      db,
    );
    const passResponse = await handleSwipePost(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: "p10", direction: "pass" }),
      }),
      db,
    );

    expect(await likeResponse.json()).toMatchObject({ matched: true });
    expect(await passResponse.json()).toEqual({ matched: false });

    const reloadedDatabase = createDatabaseFromPool(
      new (memoryDatabase.adapters.createPg().Pool)(),
    );
    try {
      const refreshedFeed = await getFeed(reloadedDatabase, 36);
      expect(refreshedFeed.map(({ id }) => id)).not.toContain("p01");
      expect(refreshedFeed.map(({ id }) => id)).not.toContain("p10");
      expect((await getMatches(reloadedDatabase)).map(({ id }) => id)).toEqual([
        "p01",
      ]);
    } finally {
      await reloadedDatabase.close();
    }
  });

  it("does not match a like without a reciprocal like", async () => {
    await addProfile("p1");

    expect(await swipeProfile(db, "p1", "like")).toEqual({ matched: false });
    expect(await getMatches(db)).toEqual([]);
  });

  it("never matches a pass, even with a reciprocal like", async () => {
    await addProfile("p1");
    await addSwipe("p1", "me", "like");

    expect(await swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(await getMatches(db)).toEqual([]);
  });

  it("keeps the first swipe on repeated requests", async () => {
    await addProfile("p1");
    await addSwipe("p1", "me", "like");

    expect(await swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(await swipeProfile(db, "p1", "like")).toEqual({ matched: false });
    expect(
      (
        await db.query<{ direction: string }>(
          "SELECT direction FROM swipes WHERE swiper_id = 'me' AND target_id = 'p1'",
        )
      ).rows[0],
    ).toEqual({ direction: "pass" });
    expect(
      (
        await db.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM swipes WHERE swiper_id = 'me' AND target_id = 'p1'",
        )
      ).rows[0]?.count,
    ).toBe("1");
  });

  it("returns only public fields and keeps feed ordering independent of incoming likes", async () => {
    await addProfile("p1");
    await addProfile("p2");
    const before = await getFeed(db);
    await addSwipe("p2", "me", "like");
    const after = await getFeed(db);

    expect(after).toEqual(before);
    expect(Object.keys(after[0] ?? {}).sort()).toEqual(
      [
        "age",
        "bio",
        "city_or_college",
        "id",
        "interests",
        "name",
        "photo_url",
      ].sort(),
    );
    expect(await swipeProfile(db, "p1", "like")).toEqual({ matched: false });
  });

  it("lists only mutual matches, newest first", async () => {
    await addProfile("p1");
    await addProfile("p2");
    await addProfile("p3");
    await addSwipe("me", "p1", "like");
    await addSwipe("p1", "me", "like");
    await db.query(
      "INSERT INTO matches (profile_id, created_at) VALUES ('p1', '2025-01-01 00:00:00+00')",
    );
    await addSwipe("me", "p2", "like");
    await addSwipe("p2", "me", "pass");
    await db.query("INSERT INTO matches (profile_id) VALUES ('p2')");
    await addSwipe("me", "p3", "like");
    await addSwipe("p3", "me", "like");
    await db.query(
      "INSERT INTO matches (profile_id, created_at) VALUES ('p3', '2025-02-01 00:00:00+00')",
    );

    expect((await getMatches(db)).map(({ id }) => id)).toEqual(["p3", "p1"]);
  });

  it("returns 400 for invalid input and 404 for an unknown profile", async () => {
    const invalid = await handleSwipePost(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: "p1", direction: "maybe" }),
      }),
      db,
    );
    const unknown = await handleSwipePost(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: "missing", direction: "like" }),
      }),
      db,
    );

    expect(invalid.status).toBe(400);
    expect(unknown.status).toBe(404);
  });

  it("serves only public feed data and rejects invalid feed query values", async () => {
    await addProfile("p1");
    await addSwipe("p1", "me", "like");

    const response = await handleFeedGet(
      new Request("http://localhost/api/feed?limit=10"),
      db,
    );
    const invalid = await handleFeedGet(
      new Request("http://localhost/api/feed?limit=100"),
      db,
    );
    const payload = (await response.json()) as {
      profiles: Array<Record<string, unknown>>;
    };

    expect(response.status).toBe(200);
    expect(Object.keys(payload.profiles[0] ?? {}).sort()).toEqual(
      [
        "age",
        "bio",
        "city_or_college",
        "id",
        "interests",
        "name",
        "photo_url",
      ].sort(),
    );
    expect(invalid.status).toBe(400);
  });

  it("returns an empty public matches payload when there are no mutual matches", async () => {
    const response = await handleMatchesGet(db);
    expect(await response.json()).toEqual({ matches: [] });
  });

  it("returns the same false result shape for a pass and a non-mutual like", async () => {
    await addProfile("p1");
    await addProfile("p2");

    expect(await swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(await swipeProfile(db, "p2", "like")).toEqual({ matched: false });
  });
});
