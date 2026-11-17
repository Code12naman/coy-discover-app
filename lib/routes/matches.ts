import type { AppDatabase } from "@/lib/db";
import { getMatches } from "@/lib/services/matches";

export function handleMatchesGet(db: AppDatabase): Response {
  return Response.json({ matches: getMatches(db) });
}
