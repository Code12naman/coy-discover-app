import type { AppDatabase } from "@/lib/db";
import { SwipeRequestSchema } from "@/lib/types";
import { UnknownProfileError, swipeProfile } from "@/lib/services/swipe";

export async function handleSwipePost(
  request: Request,
  db: AppDatabase,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = SwipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    return Response.json(
      await swipeProfile(db, parsed.data.targetId, parsed.data.direction),
    );
  } catch (error) {
    if (error instanceof UnknownProfileError) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }
    throw error;
  }
}
