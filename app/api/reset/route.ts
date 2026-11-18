import { getAppDatabase } from "@/lib/runtime-db";
import { resetDatabase } from "@/lib/seed";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await resetDatabase(await getAppDatabase());
  return Response.json({ ok: true });
}
