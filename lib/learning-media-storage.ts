import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, open, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export const IMAGE_MAX_BYTES = 12 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 64 * 1024 * 1024;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

function mediaRoot() {
  const configured = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.MEDIA_STORAGE_DIR;
  if (!configured) throw new Error("Media storage is not configured. Attach a Railway volume and restart the web service.");
  return path.resolve(configured);
}

export function isSupportedMediaType(type: string) {
  return ACCEPTED_TYPES.has(type);
}

function hasValidSignature(type: string, header: Buffer) {
  if (type === "image/jpeg") return header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  if (type === "image/png") return header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/webp") return header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8, 12) === "WEBP";
  if (type === "video/mp4") return header.length >= 12 && header.toString("ascii", 4, 8) === "ftyp";
  if (type === "video/webm") return header.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
}

export async function storeUploadedMedia(file: File, mimeType: string) {
  if (!isSupportedMediaType(mimeType)) throw new Error("Choose a JPEG, PNG, or WebP image, or an MP4 or WebM video.");
  const maxBytes = mimeType.startsWith("image/") ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
  if (file.size < 1 || file.size > maxBytes) throw new Error(mimeType.startsWith("image/") ? "Images must be 12 MiB or smaller." : "Videos must be 64 MiB or smaller.");

  const root = mediaRoot();
  await mkdir(root, { recursive: true, mode: 0o750 });
  const storageKey = randomUUID();
  const target = path.join(root, storageKey);
  let header = Buffer.alloc(0);
  let bytes = 0;
  const validateAndCount = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      bytes += chunk.length;
      if (bytes > maxBytes) return callback(new Error("The uploaded file is too large."));
      if (header.length < 12) header = Buffer.concat([header, chunk.subarray(0, 12 - header.length)]);
      callback(null, chunk);
    },
    flush(callback) {
      if (!hasValidSignature(mimeType, header)) return callback(new Error("The file content does not match its selected type."));
      callback();
    },
  });

  try {
    await pipeline(Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream), validateAndCount, createWriteStream(target, { flags: "wx", mode: 0o640 }));
  } catch (error) {
    await rm(target, { force: true }).catch(() => undefined);
    throw error;
  }
  return { storageKey, byteSize: bytes };
}

export async function removeStoredMedia(storageKey: string) {
  if (!/^[0-9a-f-]{36}$/i.test(storageKey)) throw new Error("Invalid media storage key.");
  await rm(path.join(mediaRoot(), storageKey), { force: true });
}

export async function storedMediaSize(storageKey: string) {
  if (!/^[0-9a-f-]{36}$/i.test(storageKey)) return null;
  const target = path.join(mediaRoot(), storageKey);
  try {
    const file = await open(target, "r");
    const info = await file.stat();
    await file.close();
    if (!info.isFile()) return null;
    return info.size;
  } catch {
    return null;
  }
}

export async function readStoredMedia(storageKey: string, start = 0, end?: number) {
  if (!/^[0-9a-f-]{36}$/i.test(storageKey)) return null;
  const target = path.join(mediaRoot(), storageKey);
  let file;
  try {
    file = await open(target, "r");
    const info = await file.stat();
    if (!info.isFile() || start < 0 || start >= info.size) return null;
    const last = Math.min(end ?? info.size - 1, info.size - 1);
    if (last < start) return null;
    const body = Buffer.alloc(last - start + 1);
    const { bytesRead } = await file.read(body, 0, body.length, start);
    if (bytesRead !== body.length) return null;
    return { body, byteSize: info.size, start, end: last };
  } catch {
    return null;
  } finally {
    await file?.close().catch((error) => console.error(JSON.stringify({ event: "learning_media_close_failed", reason: error instanceof Error ? error.message : "unknown" })));
  }
}
