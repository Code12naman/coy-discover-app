import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase, type AppDatabase } from "@/lib/db";
import { getFeed } from "@/lib/services/feed";
import { getMatches } from "@/lib/services/matches";
import { swipeProfile } from "@/lib/services/swipe";
import { handleSwipePost } from "@/lib/routes/swipe";
import type { PublicProfile } from "@/lib/types";

describe("Discover services", () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = createDatabase(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  function addProfile(id: string, name = id): void {
    const profile: PublicProfile = {
      id,
      name,
      age: 24,
      photo_url: `https://example.com/${id}.jpg`,
      bio: "A test profile",
      city_or_college: "Brooklyn",
      interests: ["Books", "Coffee", "Music"],
    };
    db.prepare(
      `INSERT INTO profiles
       (id, name, age, photo_url, bio, city_or_college, interests)
       VALUES (@id, @name, @age, @photo_url, @bio, @city_or_college, @interests)`,
    ).run({ ...profile, interests: JSON.stringify(profile.interests) });
  }

  function addSwipe(swiperId: string, targetId: string, direction: "like" | "pass"): void {
    db.prepare(
      "INSERT INTO swipes (swiper_id, target_id, direction) VALUES (?, ?, ?)",
    ).run(swiperId, targetId, direction);
  }

  it("excludes every profile already swiped on from the feed", () => {
    addProfile("p1");
    addProfile("p2");
    addProfile("p3");
    addSwipe("me", "p2", "pass");

    expect(getFeed(db).map((profile) => profile.id)).toEqual(["p1", "p3"]);
  });

  it("creates a match when both directions are likes", () => {
    addProfile("p1", "Maya");
    addSwipe("p1", "me", "like");

    expect(swipeProfile(db, "p1", "like")).toEqual({
      matched: true,
      profile: expect.objectContaining({ id: "p1", name: "Maya" }),
    });
    expect(getMatches(db)).toHaveLength(1);
  });

  it("does not match a like without a reciprocal like", () => {
    addProfile("p1");

    expect(swipeProfile(db, "p1", "like")).toEqual({ matched: false });
    expect(getMatches(db)).toEqual([]);
  });

  it("never matches a pass, even with a reciprocal like", () => {
    addProfile("p1");
    addSwipe("p1", "me", "like");

    expect(swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(getMatches(db)).toEqual([]);
  });

  it("keeps the first swipe on repeated requests", () => {
    addProfile("p1");
    addSwipe("p1", "me", "like");

    expect(swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(swipeProfile(db, "p1", "like")).toEqual({ matched: false });
    expect(
      db
        .prepare("SELECT direction FROM swipes WHERE swiper_id = 'me' AND target_id = 'p1'")
        .get(),
    ).toEqual({ direction: "pass" });
    expect(
      db.prepare("SELECT COUNT(*) AS count FROM swipes WHERE swiper_id = 'me' AND target_id = 'p1'").get(),
    ).toEqual({ count: 1 });
  });

  it("returns only public fields and keeps feed ordering independent of incoming likes", () => {
    addProfile("p1");
    addProfile("p2");
    const before = getFeed(db);
    addSwipe("p2", "me", "like");
    const after = getFeed(db);

    expect(after).toEqual(before);
    expect(Object.keys(after[0] ?? {}).sort()).toEqual(
      ["age", "bio", "city_or_college", "id", "interests", "name", "photo_url"].sort(),
    );
    expect(swipeProfile(db, "p1", "like")).toEqual({ matched: false });
  });

  it("lists only mutual matches, newest first", () => {
    addProfile("p1");
    addProfile("p2");
    addProfile("p3");
    addSwipe("me", "p1", "like");
    addSwipe("p1", "me", "like");
    db.prepare("INSERT INTO matches (profile_id) VALUES ('p1')").run();
    addSwipe("me", "p2", "like");
    addSwipe("p2", "me", "pass");
    db.prepare("INSERT INTO matches (profile_id) VALUES ('p2')").run();
    addSwipe("p3", "me", "like");

    expect(getMatches(db).map(({ id }) => id)).toEqual(["p1"]);
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

  it("returns the same false result shape for a pass and a non-mutual like", () => {
    addProfile("p1");
    addProfile("p2");

    expect(swipeProfile(db, "p1", "pass")).toEqual({ matched: false });
    expect(swipeProfile(db, "p2", "like")).toEqual({ matched: false });
  });
});
