import { getAppDatabase } from "@/lib/runtime-db";
import { handleSwipePost } from "@/lib/routes/swipe";

export const runtime = "nodejs";

export function POST(request: Request): Promise<Response> {
  return handleSwipePost(request, getAppDatabase());
}
