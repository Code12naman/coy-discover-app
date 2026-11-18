import { getAppDatabase } from "@/lib/runtime-db";
import { handleSwipePost } from "@/lib/routes/swipe";
import { serviceUnavailableResponse } from "@/lib/routes/service-error";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    return await handleSwipePost(request, await getAppDatabase());
  } catch (error) {
    return serviceUnavailableResponse("Swipe", error);
  }
}
