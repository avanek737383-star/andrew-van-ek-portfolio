import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url='http://127.0.0.1:8766/tests/fixtures/visit-memory.html';
await page.goto(url);
assert.match(await page.locator('#homepage-last-visit').innerText(),/first recorded/);
const first=await page.evaluate(()=>localStorage.getItem('avanek-home-last-visit-v1'));
assert.ok(Number.isFinite(Date.parse(first)));
await page.reload();
assert.equal(await page.locator('#homepage-last-visit time').getAttribute('datetime'),first);
assert.match(await page.locator('#homepage-last-visit').innerText(),/You last visited/);
await page.evaluate(()=>{localStorage.setItem('avanek-home-last-visit-v1','2025-01-02T03:04:05.000Z');window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
assert.equal(await page.locator('#homepage-last-visit time').getAttribute('datetime'),'2025-01-02T03:04:05.000Z');
await page.evaluate(()=>localStorage.setItem('avanek-home-last-visit-v1','not-a-date'));
await page.reload();assert.match(await page.locator('#homepage-last-visit').innerText(),/first recorded/);
for(const theme of ['thanksgiving-theme','christmas-theme','valentines-theme','repair-shop-body','']){
 await page.evaluate(theme=>document.body.className=theme,theme);
 const bg=await page.locator('.footer-pill').first().evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.ok(!bg.includes('rgba')&&!bg.includes('transparent'));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,theme+' '+width);
 }
}
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'qa/footer-mobile.png'});
const separate=await browser.newContext();const independent=await separate.newPage();
await independent.goto(url);assert.match(await independent.locator('#homepage-last-visit').innerText(),/first recorded/);
const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));
const unavailable=await blocked.newPage();await unavailable.goto(url);
assert.match(await unavailable.locator('#homepage-last-visit').innerText(),/unavailable/);
assert.deepEqual(await context.cookies(),[]);assert.deepEqual(errors,[]);
await browser.close();console.log('PASS: first and return visits, independent browsers, invalid and blocked storage, restored pages, cookie-free feature, opaque footer pills in all themes, and three viewport widths.');
