import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { CASES } from '../scripts/repair-shop-engine.js';

await mkdir(new URL('../qa/', import.meta.url), { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:8766/repair-shop.html');
await page.locator('[data-inspect="file"]').waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../qa/desktop.png', import.meta.url).pathname.slice(1), fullPage: true });
await page.locator('#tab-files').focus();
await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('#tab-tasks').getAttribute('aria-selected'), 'true');
assert.equal(await page.locator('#tab-tasks').evaluate(el => document.activeElement === el), true);
await page.locator('#tab-settings').click();
await page.locator('[data-repair="register"]').click();
assert.match(await page.locator('.live-output').innerText(), /Evidence before optimism/);
assert.equal(await page.locator('#ticket-state').innerText(), 'OPEN');

for (let index = 0; index < CASES.length; index++) {
  const item = CASES[index];
  await page.locator(`[data-case="${index}"]`).click();
  for (const tool of item.tools) {
    await page.locator(`[data-tab="${tool.tab}"]`).click();
    await page.locator(`[data-inspect="${tool.id}"]`).click();
    assert.match(await page.locator('.live-output').innerText(), new RegExp(tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  const action = item.actions.find(action => action.correct);
  await page.locator(`[data-tab="${action.tab}"]`).click();
  await page.locator(`[data-repair="${action.id}"]`).click();
  assert.equal(await page.locator('#ticket-state').innerText(), 'RETEST NEEDED');
  assert.equal(await page.locator('#verify').evaluate(el => document.activeElement === el), true);
  await page.locator('#verify').click();
  assert.equal(await page.locator('#ticket-state').innerText(), 'CLOSED ✓');
  assert.equal(await page.locator('#result-card').isVisible(), true);
}
assert.equal(await page.locator('#total-score').innerText(), '600');
assert.equal(await page.locator('#closed-count').innerText(), '6/6');
assert.match(await page.locator('#result-card').innerText(), /Evidence-based legend/);
await page.reload();
assert.equal(await page.locator('#closed-count').innerText(), '6/6');
await page.locator('#reset-shift').click();
assert.equal(await page.locator('#reset-dialog').isVisible(), true);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#closed-count').innerText(), '6/6');
await page.locator('#reset-shift').click();
await page.locator('#confirm-reset').click();
assert.equal(await page.locator('#closed-count').innerText(), '0/6');
assert.equal(await page.locator('#total-score').innerText(), '0');

for (const width of [360, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 950 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, `Horizontal overflow at ${width}px`);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: new URL('../qa/mobile.png', import.meta.url).pathname.slice(1), fullPage: true });
await page.locator('[data-case="5"]').click();
await page.locator('#tab-network').click();
await page.locator('[data-inspect="sync"]').click();
assert.equal(await page.locator('#evidence-count').innerText(), '1/3 found');
assert.equal(await page.locator('[data-inspect="sync"]').evaluate(el => document.activeElement === el), true);

const privateContext = await browser.newContext();
await privateContext.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Unavailable'); } }); });
const privatePage = await privateContext.newPage();
privatePage.on('pageerror', error => errors.push(error.message));
await privatePage.goto('http://127.0.0.1:8766/repair-shop.html');
await privatePage.locator('[data-inspect="file"]').click();
assert.equal(await privatePage.locator('#evidence-count').innerText(), '1/3 found');
assert.deepEqual(errors, []);
await browser.close();
console.log('PASS: six playable tickets, diagnosis gating, fix/retest flow, keyboard tabs, focus, 600-point campaign, persistence, reset dialog, mobile interaction, five viewport widths, and unavailable-storage fallback.');
