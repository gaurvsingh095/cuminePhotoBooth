import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
let browser;
try {
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-gl=angle','--use-angle=swiftshader']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,acceptDownloads:true,permissions:['camera']});
 const page=await context.newPage();
 const response=await page.goto('http://127.0.0.1:8765/halloween.html',{waitUntil:'domcontentloaded'});
 assert.equal(response.status(),200);
 assert.equal(await page.locator('#capture').isVisible(),false,'Capture must be hidden until camera is ready');
 console.log('Mobile 1/4 Initial controls correct');
 await page.locator('#camera-start').click();
 await page.waitForFunction(()=>document.getElementById('video').videoWidth>0,{},{timeout:15000});
 assert.equal(await page.locator('#capture').isVisible(),true);
 console.log('Mobile 2/4 Browser camera initialized and preview rendered');
 await page.locator('#capture').click();
 await page.waitForFunction(()=>!!document.getElementById('manual').disabled===false,{},{timeout:10000});
 await page.locator('#manual').click();
 for(const [id,value] of [['manual-x','50'],['manual-y','36'],['manual-size','28']]){
  await page.locator('#'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))},value);
 }
 await page.locator('#manual-apply').click();
 assert.equal(await page.locator('#download').isDisabled(),false,'Manual fallback must enable exporting');
 console.log('Mobile 3/4 Camera capture and manual selection produced portrait');
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:10000}),page.locator('#download').click()]);
 await download.saveAs('halloween-mobile-export.png');
 const png=await readFile('halloween-mobile-export.png');assert(png.byteLength>30000);
 console.log('Mobile 4/4 Portrait exported from 390px mobile viewport:',png.byteLength,'bytes');
 await context.close();
} finally {await browser?.close()}
