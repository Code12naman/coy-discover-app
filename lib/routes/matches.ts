import type { AppDatabase } from "@/lib/db";
import { getMatches } from "@/lib/services/matches";

export async function handleMatchesGet(db: AppDatabase): Promise<Response> {
  return Response.json({ matches: await getMatches(db) });
}
