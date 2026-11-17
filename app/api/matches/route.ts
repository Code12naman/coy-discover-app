import { getAppDatabase } from "@/lib/runtime-db";
import { handleMatchesGet } from "@/lib/routes/matches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  return handleMatchesGet(getAppDatabase());
}
