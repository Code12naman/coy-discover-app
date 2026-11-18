import { getAppDatabase } from "@/lib/runtime-db";
import { handleMatchesGet } from "@/lib/routes/matches";
import { serviceUnavailableResponse } from "@/lib/routes/service-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    return await handleMatchesGet(await getAppDatabase());
  } catch (error) {
    return serviceUnavailableResponse("Matches", error);
  }
}
