import { getAppDatabase } from "@/lib/runtime-db";
import { handleFeedGet } from "@/lib/routes/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  return handleFeedGet(request, getAppDatabase());
}
