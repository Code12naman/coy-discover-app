import type { AppDatabase } from "@/lib/db";
import { getFeed } from "@/lib/services/feed";
import { z } from "zod";

const FeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).optional(),
});

export function handleFeedGet(request: Request, db: AppDatabase): Response {
  const parsed = FeedQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  return Response.json({ profiles: getFeed(db, parsed.data.limit) });
}
