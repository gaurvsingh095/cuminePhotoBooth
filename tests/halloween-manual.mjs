import {chromium} from 'playwright';
import assert from 'node:assert/strict';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const response=await page.goto('http://127.0.0.1:8765/classic-halloween.html',{waitUntil:'domcontentloaded'});
 assert.equal(response.status(),200);
 assert.equal(await page.locator('#download-duplicate').isDisabled(),true);
 await page.locator('[data-scene="pumpkin"]').click();
 assert.equal(await page.locator('[data-scene="pumpkin"]').getAttribute('aria-pressed'),'true');
 const data=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=700;c.height=900;
   const x=c.getContext('2d');x.fillStyle='#204b67';x.fillRect(0,0,700,900);x.fillStyle='#ffd3a2';
   x.beginPath();x.ellipse(200,280,95,118,0,0,7);x.ellipse(500,280,95,118,0,0,7);x.fill();
   return c.toDataURL('image/png').split(',')[1];
 });
 await page.locator('#upload').setInputFiles({name:'two-people.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 await page.locator('#manual').waitFor({state:'visible'});
 await page.waitForFunction(()=>!document.querySelector('#manual').disabled);
 await page.locator('#manual').click();
 assert.equal(await page.locator('#manual-person option').count(),1);
 await page.locator('#manual-x').evaluate(el=>{el.value='29';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#manual-apply').click();
 assert.equal(await page.locator('#download-duplicate').isDisabled(),false);
 await page.locator('#manual').click();
 assert.equal(await page.locator('#manual-person option').count(),2);
 await page.locator('#manual-person').selectOption('new');
 await page.locator('#manual-x').evaluate(el=>{el.value='71';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#manual-apply').click();
 assert.match(await page.locator('#status').textContent(),/2 faces/);
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:12000}),page.locator('#download-duplicate').click()]);
 assert.match(download.suggestedFilename(),/SMEMR-Halloween-Skeleton/);
 await page.locator('#retake').click();
 assert.equal(await page.locator('#download').isDisabled(),true);
 assert.equal(await page.locator('#capture').isVisible(),false);
 console.log('Halloween scene, two manual faces, PNG export and start-over passed.');
}finally{await browser?.close()}
