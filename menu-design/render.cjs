// Renders menu.html to a 300dpi A4 PNG and a print PDF.
// Usage: node render.cjs
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // A4 = 210x297mm = 793.7x1122.5 CSS px at 96dpi; scale 3.125 ≈ 300dpi
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3.125 });
  await page.goto('file://' + path.join(__dirname, 'menu.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(__dirname, 'hisbeans_menu.png'), fullPage: false });
  await page.pdf({ path: path.join(__dirname, 'hisbeans_menu.pdf'), width: '210mm', height: '297mm', printBackground: true });
  await browser.close();
})();
