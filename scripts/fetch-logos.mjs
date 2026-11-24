// Downloads each provider's icon from its official website into
// public/providers/<id>.png and records it in src/lib/provider-logos.json.
//
// Run from the project folder (needs internet + Node 18 or newer):
//   node scripts/fetch-logos.mjs            # only providers without a logo yet
//   node scripts/fetch-logos.mjs --force    # re-download everything
//
// Order tried for each site: apple-touch-icon / largest <link rel=icon> in the
// homepage, then /apple-touch-icon.png, then Google's favicon service.
// Only PNG, JPEG and WebP are kept (SVG is skipped on purpose: an SVG served
// from our own domain could run scripts). Check the results afterwards and
// replace any blurry or wrong logo by hand with a file from the provider's
// official media kit.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const domains = JSON.parse(await readFile(new URL("scripts/provider-domains.json", root), "utf8"));
const mapFile = new URL("src/lib/provider-logos.json", root);
const logos = JSON.parse(await readFile(mapFile, "utf8").catch(() => "{}"));
const force = process.argv.includes("--force");
const UA = "Mozilla/5.0 (compatible; FinancialTrackerLogoFetcher/1.0)";
const OK_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MIN_BYTES = 600; // smaller than this is usually a 16px favicon

await mkdir(new URL("public/providers/", root), { recursive: true });

async function get(url, accept) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: accept },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function candidates(domain) {
  const list = [];
  try {
    const res = await get(`https://${domain}/`, "text/html");
    const base = res.url;
    const html = (await res.text()).slice(0, 400_000);
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const scored = [];
    for (const tag of links) {
      const rel = /rel=["']?([^"'>]+)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
      const href = /href=["']?([^"' >]+)/i.exec(tag)?.[1];
      if (!href || !/icon/.test(rel)) continue;
      const size = Number(/sizes=["']?(\d+)/i.exec(tag)?.[1] ?? (rel.includes("apple") ? 180 : 32));
      scored.push({ url: new URL(href, base).href, size: rel.includes("apple") ? size + 1 : size });
    }
    scored.sort((a, b) => b.size - a.size);
    list.push(...scored.map((s) => s.url));
  } catch {
    // homepage unreachable; fall through to the generic locations
  }
  list.push(`https://${domain}/apple-touch-icon.png`);
  list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
  return [...new Set(list)];
}

async function download(id, domain) {
  for (const url of await candidates(domain)) {
    try {
      const res = await get(url, "image/png,image/webp,image/jpeg,image/*;q=0.5");
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      const ext = OK_TYPES[type];
      if (!ext) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) continue;
      const file = `${id}.${ext}`;
      await writeFile(new URL(`public/providers/${file}`, root), buf);
      return { file, url, bytes: buf.length };
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const ids = Object.keys(domains);
const results = { ok: [], failed: [] };
for (const id of ids) {
  if (!force && logos[id]) {
    console.log(`skip   ${id} (already has ${logos[id]})`);
    continue;
  }
  const got = await download(id, domains[id]);
  if (got) {
    logos[id] = `/providers/${got.file}`;
    results.ok.push(id);
    console.log(`ok     ${id.padEnd(20)} ${String(got.bytes).padStart(7)} bytes  ${got.url}`);
  } else {
    results.failed.push(id);
    console.log(`FAILED ${id.padEnd(20)} (${domains[id]})`);
  }
}

const sorted = Object.fromEntries(Object.entries(logos).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(mapFile, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nDone: ${results.ok.length} downloaded, ${results.failed.length} failed.`);
if (results.failed.length) console.log("Failed (will keep the coloured badge):", results.failed.join(", "));
console.log("Next: open the files in public/providers/ to check them, then commit and push.");
