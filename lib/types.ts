import { z } from "zod";

export const PublicProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().min(18).max(30),
  photo_url: z.string().url(),
  bio: z.string(),
  city_or_college: z.string(),
  interests: z.array(z.string()),
});

export const SwipeRequestSchema = z.object({
  targetId: z.string().min(1),
  direction: z.enum(["like", "pass"]),
});

export const FeedResponseSchema = z.object({
  profiles: z.array(PublicProfileSchema),
});

export const MatchedProfileSchema = PublicProfileSchema.extend({
  matchedAt: z.string(),
});

export const MatchesResponseSchema = z.object({
  matches: z.array(MatchedProfileSchema),
});

export const SwipeResponseSchema = z.discriminatedUnion("matched", [
  z.object({ matched: z.literal(false) }),
  z.object({ matched: z.literal(true), profile: PublicProfileSchema }),
]);

export type PublicProfile = z.infer<typeof PublicProfileSchema>;
export type SwipeDirection = z.infer<typeof SwipeRequestSchema>["direction"];
export type MatchedProfile = z.infer<typeof MatchedProfileSchema>;
export type FeedResponse = z.infer<typeof FeedResponseSchema>;
export type MatchesResponse = z.infer<typeof MatchesResponseSchema>;
export type SwipeResult =
  | { matched: false }
  | { matched: true; profile: PublicProfile };
