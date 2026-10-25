import {chromium} from 'playwright';
import assert from 'node:assert/strict';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,permissions:['camera'],acceptDownloads:true});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 for(const route of ['/index.html','/halloween.html']){
  const response=await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.getByRole('heading',{name:/SMEMR Photo Booth/i}).waitFor();
  assert.equal(await page.locator('#upload-btn').isVisible(),false);
  assert.equal(await page.locator('#upload').isVisible(),false);
  assert.equal(await page.locator('#align-next').isDisabled(),true);
  assert.equal(await page.locator('[data-go="3"]').isDisabled(),true);
  assert.equal(await page.locator('#wall-grid').isVisible(),true);
 }
 // Camera-only journey on the root page
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#camera-start').click();
 await page.waitForFunction(()=>document.getElementById('video').videoWidth>0,{},{timeout:15000});
 await page.locator('#capture').click();
 await page.locator('#align-step').waitFor({state:'visible',timeout:20000});
 await page.locator('#manual-modal.active').waitFor({state:'visible',timeout:16000});
 assert.equal(await page.locator('#frame-next').isVisible(),false);
 await page.locator('#manual-x').evaluate(el=>{el.value='52';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#manual-size').evaluate(el=>{el.value='29';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#manual-apply').click();
 await page.locator('#experience-step').waitFor({state:'visible',timeout:20000});
 await page.locator('[data-style="frame"]').click();
 await page.locator('[data-frame="specter"]').click();
 await page.locator('#frame-next').click();
 await page.locator('#finish-card').waitFor({state:'visible',timeout:15000});
 assert.equal(await page.locator('#download').isDisabled(),false);
 assert.equal(await page.locator('#publish-wall').isVisible(),true);
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),page.locator('#download-duplicate').click()]);
 assert.match(download.suggestedFilename(),/SMEMR-Halloween/);
 await page.locator('#wall-consent').check();
 await page.locator('#wall-adult').check();
 await page.locator('#publish-wall').click();
 await page.waitForFunction(()=>document.querySelectorAll('#wall-grid .wall-tile').length>0,{},{timeout:14000});
 assert.match(await page.locator('#wall-publish-status').textContent(),/wall/i);
 await page.locator('#wall-grid .wall-tile').first().click();
 await page.locator('#wall-dialog[open]').waitFor({state:'visible'});
 assert.equal(await page.locator('#wall-remove').isVisible(),true);
 await page.locator('#wall-remove').click();
 await page.waitForFunction(()=>document.querySelectorAll('#wall-grid .wall-tile').length===0,{},{timeout:10000});
 assert.deepEqual(errors,[],'Uncaught browser errors');
 await context.close();
 console.log('PASS: SMEMR landing, zero upload UI, camera → alignment → frame → download → opt-in wall → remove');
}finally{await browser?.close()}
