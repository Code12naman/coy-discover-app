export async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof payload?.error === "string" ? payload.error : fallback;
}

export function getClientErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && !(error instanceof TypeError)) {
    return error.message;
  }
  return fallback;
}
