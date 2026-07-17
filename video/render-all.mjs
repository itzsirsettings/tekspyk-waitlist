import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "app", "public", "videos");
mkdirSync(outDir, { recursive: true });

const entry = path.join(__dirname, "src", "index.ts");

console.log("Bundling compositions...");
const bundleLocation = await bundle({ entryPoint: entry });

const compositions = await getCompositions(bundleLocation);

for (const composition of compositions) {
  const outputLocation = path.join(outDir, `${composition.id}.mp4`);
  console.log(`Rendering ${composition.id} -> ${outputLocation}`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    crf: 22,
    pixelFormat: "yuv420p",
    x264Preset: "medium",
  });
}

console.log("All clips rendered.");
