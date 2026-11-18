export function serviceUnavailableResponse(
  service: string,
  error: unknown,
): Response {
  console.error(`[api:${service}] request failed`, error);
  return Response.json(
    {
      error: `${service} is temporarily unavailable. Please try again shortly.`,
    },
    { status: 503 },
  );
}
