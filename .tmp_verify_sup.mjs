import { chromium } from 'playwright';

const url = "http://localhost:4173/CSP/Unit%201%20-%20Digital%20Information/1.5%20-%20Overflow%20and%20Rounding/1.5-overflow-and-rounding.html";
const shotDir = "/tmp/claude-1002/-workspaces-Presentations/66614ef3-b47a-41d3-9159-622c6f2091d6/scratchpad/shots";

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(500);

const slideIndex = await page.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('.reveal .slides > section'));
  return sections.findIndex(s => s.textContent.includes('Decoding 0.101'));
});
console.log('slideIndex', slideIndex);
await page.evaluate((idx) => window.Reveal.slide(idx), slideIndex);
await page.waitForTimeout(300);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(400);
await page.screenshot({ path: `${shotDir}/sup-fix.png` });

await browser.close();
