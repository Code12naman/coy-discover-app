import { getAppDatabase } from "@/lib/runtime-db";
import { handleFeedGet } from "@/lib/routes/feed";
import { serviceUnavailableResponse } from "@/lib/routes/service-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    return await handleFeedGet(request, await getAppDatabase());
  } catch (error) {
    return serviceUnavailableResponse("Profile feed", error);
  }
}
