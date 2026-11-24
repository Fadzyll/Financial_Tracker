// Renders public/icons/icon.svg to the PNG sizes needed for the PWA.
// Usage: npm run icons   (uses the Playwright Chromium available locally)
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

// Loaded via require so a globally installed Playwright (NODE_PATH) also works.
const { chromium } = createRequire(import.meta.url)("playwright");

const svg = await readFile(new URL("../public/icons/icon.svg", import.meta.url), "utf8");
const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const targets = [
  { file: "icon-192.png", size: 192, padding: 0, bg: "transparent" },
  { file: "icon-512.png", size: 512, padding: 0, bg: "transparent" },
  // Maskable: full-bleed background with the artwork inside the safe zone.
  { file: "icon-maskable-512.png", size: 512, padding: 0.12, bg: "#047857" },
  { file: "apple-touch-icon.png", size: 180, padding: 0.08, bg: "#047857" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, padding, bg } of targets) {
  const inner = Math.round(size * (1 - padding * 2));
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">
       <img src="${svgUrl}" width="${inner}" height="${inner}">
     </body></html>`,
  );
  await page.screenshot({
    path: new URL(`../public/icons/${file}`, import.meta.url).pathname,
    omitBackground: bg === "transparent",
  });
  console.log("wrote", file);
}
await browser.close();
