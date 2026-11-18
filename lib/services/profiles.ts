import type { PublicProfile } from "@/lib/types";
import { PublicProfileSchema } from "@/lib/types";

export type ProfileRow = {
  id: string;
  name: string;
  age: number;
  photo_url: string;
  bio: string;
  city_or_college: string;
  interests: string[] | string;
};

export function toPublicProfile(row: ProfileRow): PublicProfile {
  const interests =
    typeof row.interests === "string"
      ? JSON.parse(row.interests)
      : row.interests;

  return PublicProfileSchema.parse({ ...row, interests });
}
