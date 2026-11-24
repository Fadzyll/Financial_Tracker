// Renders public/icons/icon.svg (+ icon-maskable.svg) to the PNG sizes needed for the PWA.
// Usage: npm run icons   (uses the Playwright Chromium available locally)
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

// Loaded via require so a globally installed Playwright (NODE_PATH) also works.
const { chromium } = createRequire(import.meta.url)("playwright");

const toDataUrl = async (name) =>
  `data:image/svg+xml;base64,${Buffer.from(await readFile(new URL(`../public/icons/${name}`, import.meta.url), "utf8")).toString("base64")}`;
const rounded = await toDataUrl("icon.svg"); // rounded tile, for browsers/tabs
const fullBleed = await toDataUrl("icon-maskable.svg"); // edge to edge, for phone home screens

const targets = [
  { file: "icon-192.png", size: 192, src: rounded, bg: "transparent" },
  { file: "icon-512.png", size: 512, src: rounded, bg: "transparent" },
  { file: "icon-maskable-512.png", size: 512, src: fullBleed, bg: "#047857" },
  { file: "apple-touch-icon.png", size: 180, src: fullBleed, bg: "#047857" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, src, bg } of targets) {
  const inner = size;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">
       <img src="${src}" width="${inner}" height="${inner}">
     </body></html>`,
  );
  await page.screenshot({
    path: new URL(`../public/icons/${file}`, import.meta.url).pathname,
    omitBackground: bg === "transparent",
  });
  console.log("wrote", file);
}
await browser.close();
