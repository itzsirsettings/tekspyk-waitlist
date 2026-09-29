import { randomUUID } from "node:crypto";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readRequestText(request: Request, limit = 32_768): Promise<string> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > limit) throw new HttpError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError(413, "Request is too large.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}

export async function readJson(request: Request, limit = 32_768): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new HttpError(415, "Expected JSON.");
  }
  const text = await readRequestText(request, limit);
  try { return JSON.parse(text); }
  catch { throw new HttpError(400, "Invalid JSON."); }
}

export function apiError(error: unknown, operation: string) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
  const requestId = randomUUID();
  const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^[A-Z0-9_]{1,40}$/.test(error.code) ? error.code : undefined;
  console.error(JSON.stringify({ event: "operation_failed", operation, requestId, code }));
  return Response.json({ error: "This service is temporarily unavailable. Please try again." }, {
    status: 503, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
  });
}
