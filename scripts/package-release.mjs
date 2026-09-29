import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const output = path.resolve(root, ".railway-secrets", `release-${Date.now()}`);
await fs.mkdir(output, { recursive: true });
const sources = ["app", "components", "lib", "public", "railway", "scripts", "docs", "package.json", "package-lock.json", ".npmrc", "tsconfig.json", "next.config.ts", "postcss.config.mjs", "eslint.config.mjs", "vitest.config.ts", "instrumentation.ts", "proxy.ts", "railway.toml"];
const manifest = [];
async function copy(relative) {
  const full = path.join(root, relative); const stat = await fs.stat(full);
  if (stat.isDirectory()) { for (const name of (await fs.readdir(full)).sort()) await copy(path.join(relative, name)); return; }
  if (/\.env|\.local\.|\.pem$|\.key$/.test(relative)) throw Error(`Unexpected sensitive file in release: ${relative}`);
  const bytes = await fs.readFile(full);
  const target = path.join(output, relative); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, bytes);
  manifest.push({ path: relative.replaceAll("\\", "/"), sha256: createHash("sha256").update(bytes).digest("hex") });
}
for (const source of sources) await copy(source);
const sourceHash = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
await fs.writeFile(path.join(output, "release-manifest.json"), JSON.stringify({ sourceHash, createdAt: new Date().toISOString(), files: manifest }, null, 2));
await fs.writeFile(".railway-secrets/current-release.json", JSON.stringify({ output, sourceHash }));
console.log(JSON.stringify({ output, sourceHash, files: manifest.length }));
