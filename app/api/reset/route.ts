import { getAppDatabase } from "@/lib/runtime-db";
import { resetDatabase } from "@/lib/seed";

export const runtime = "nodejs";

export function POST(): Response {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  resetDatabase(getAppDatabase());
  return Response.json({ ok: true });
}
