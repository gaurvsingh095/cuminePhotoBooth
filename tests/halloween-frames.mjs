import {chromium} from 'playwright';
import assert from 'node:assert/strict';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto('http://127.0.0.1:8765/halloween.html')).status(),200);
 await page.locator('[data-style="frame"]').click();
 assert.equal(await page.locator('#frame-scenes').isVisible(),true);
 assert.equal(await page.locator('#skeleton-scenes').isVisible(),false);
 assert.equal(await page.locator('#download').isDisabled(),true);
 const b64=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=1000;c.height=1600;
   const x=c.getContext('2d'),g=x.createLinearGradient(0,0,1000,1600);
   g.addColorStop(0,'#46608e');g.addColorStop(1,'#e0b278');
   x.fillStyle=g;x.fillRect(0,0,1000,1600);x.fillStyle='#f2b888';
   x.beginPath();x.arc(500,530,190,0,Math.PI*2);x.fill();
   return c.toDataURL('image/png').split(',')[1];
 });
 await page.locator('#upload').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(b64,'base64')});
 await page.waitForFunction(()=>!document.getElementById('download').disabled);
 assert.equal(await page.locator('#share').isDisabled(),false);
 for(const id of ['specter','witch','pumpkin','moon','polaroid','copper']){
  await page.locator('[data-frame="'+id+'"]').click();
  assert.equal(await page.locator('[data-frame="'+id+'"]').getAttribute('aria-pressed'),'true');
 }
 await page.locator('#frame-filter').selectOption('moon');
 await page.locator('#caption').selectOption('boo');
 await page.locator('#accessory').selectOption('none');
 await page.locator('#strength').evaluate(el=>{
   el.value='80';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 assert.equal(await page.locator('#strength-value').textContent(),'80%');
 const [dl]=await Promise.all([page.waitForEvent('download',{timeout:15000}),page.locator('#download').click()]);
 assert.match(dl.suggestedFilename(),/Halloween-copper/);
 const file=await dl.createReadStream();let size=0;
 for await(const chunk of file)size+=chunk.length;
 assert(size>20000,'Augmented frame must contain the visitor photo');
 await page.locator('#surprise').click();
 assert.equal(await page.locator('#download').isDisabled(),false);
 await page.locator('#retake').click();
 assert.equal(await page.locator('#download').isDisabled(),true);
 assert.equal(await page.locator('#share').isDisabled(),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: 6 frames, filters, captions, export, surprise and reset.');
}finally{await browser?.close()}
