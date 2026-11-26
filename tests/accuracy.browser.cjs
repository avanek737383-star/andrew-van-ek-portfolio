const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.PORTFOLIO_TEST_URL||'http://127.0.0.1:8768/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:960},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 async function go(name){await page.goto(base+name,{waitUntil:'domcontentloaded'});}
 await go('ai-predictor.html');
 await page.locator('#current-eval-value').filter({hasText:'56.19%'}).waitFor();
 assert.match(await page.locator('#coin-evaluation').innerText(),/55.89%/);
 await page.selectOption('#coin-test-rule','fair');
 assert.match(await page.locator('#current-eval-value').innerText(),/49.82%/);
 await page.selectOption('#coin-model','original');
 assert.match(await page.locator('#current-eval-value').innerText(),/51.33%/);
 await page.selectOption('#coin-process','persistent');
 assert.match(await page.locator('#coin-process-explanation').innerText(),/51.5%/);
 await page.locator('#btn-sim-100').click();
 assert.ok((await page.locator('body').innerText()).includes('100'));
 await page.selectOption('#coin-model','candidate');
 await page.selectOption('#coin-test-rule','all');
 fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/coin-desktop.png',fullPage:true});
 await go('sudoku.html');
 assert.ok(await page.locator('.initial-clue').count()>0);
 await page.locator('#sudoku-file-input').setInputFiles({name:'test-reference.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGtkAAAAASUVORK5CYII=','base64')});
 await page.locator('#terminal-log-feed').filter({hasText:'Photo loaded as a reference only'}).waitFor();
 assert.equal(await page.locator('.initial-clue').count(),0);
 assert.equal((await page.locator('.cell-val').allTextContents()).join(''),'');
 await page.locator('#btn-solve-step').click();
 assert.match(await page.locator('#terminal-log-feed').innerText(),/Enter given digits/);
 await page.locator('[data-preset="newspaper"]').click();
 const before=await page.locator('.ai-placed').count();await page.locator('#btn-solve-step').click();
 assert.ok(await page.locator('.ai-placed').count()>before);
 await go('stats.html');
 await page.locator('#os-tracker-timestamp').filter({hasText:'6/6'}).waitFor();
 for(const id of ['windows','linux','macos','ios','android','freebsd'])assert.notEqual(await page.locator('#os-ver-'+id).innerText(),'Checking…');
 const historyResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/data/changelog.json');
 await go('changelog.html');
 await page.locator('#changelog-count').filter({hasText:'recorded commits'}).waitFor();
 const data=await (await historyResponse).json();
 assert.equal(await page.locator('#changelog-tbody tr').count(),data.count);
 await page.fill('#changelog-search',data.commits[0].sha);
 assert.equal(await page.locator('#changelog-tbody tr').count(),1);
 await page.fill('#changelog-search','no_such_commit_fixture_42');
 assert.equal(await page.locator('#changelog-tbody tr').count(),0);
 assert.equal(await page.locator('#changelog-no-results').isVisible(),true);
 const overflow=[];
 for(const name of ['ai-predictor.html','sudoku.html','stats.html','changelog.html','privacy.html','ai-bias.html']){
  await go(name);
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:900});
   const sizes=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
   if(sizes.scroll>width+1)overflow.push({name,width,...sizes});
  }
  if(name==='ai-predictor.html'||name==='privacy.html'){
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa/'+name.replace('.html','')+'-mobile.png',fullPage:true});
  }
 }
 // Unavailable data must not keep a current-looking display or fabricated count.
 await page.route('**/data/releases.json',route=>route.fulfill({status:503,body:'unavailable'}));
 await go('stats.html');await page.locator('#os-tracker-timestamp').filter({hasText:'unavailable'}).waitFor();
 assert.equal(await page.locator('#os-ver-windows').innerText(),'Source check unavailable');
 await page.route('**/data/changelog.json',route=>route.fulfill({status:503,body:'unavailable'}));
 await go('changelog.html');await page.locator('#changelog-snapshot').filter({hasText:'unavailable'}).waitFor();
 assert.equal(await page.locator('#changelog-tbody tr').count(),0);
 console.log(JSON.stringify({pageErrors:errors,overflow},null,2));
 await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(overflow,[]);
})().catch(e=>{console.error(e);process.exitCode=1});
