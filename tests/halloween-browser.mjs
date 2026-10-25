import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:440,height:960},acceptDownloads:true});
 const consoleErrors=[];
 page.on('pageerror',err=>consoleErrors.push(err.message));
 page.on('console',msg=>{if(msg.type()==='error')console.log('PAGE ERROR:',msg.text())});
 const url='http://127.0.0.1:8765/halloween.html';
 const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
 assert.equal(response?.status(),200);
 await page.getByRole('heading',{name:/Skeleton Crew/i}).waitFor();
 console.log('1/5 UI page renders');
 assert.equal(await page.locator('#download').isDisabled(),true);
 await page.locator('button[data-scene="crypt"]').click();
 assert.equal(await page.locator('button[data-scene="crypt"]').getAttribute('aria-pressed'),'true');
 console.log('2/5 Scene selection works');
 const photo=await fetch('https://raw.githubusercontent.com/ageitgey/face_recognition/master/examples/obama.jpg');
 assert(photo.ok,'Test fixture downloadable');
 const buffer=Buffer.from(await photo.arrayBuffer());
 assert(buffer.byteLength>20000,'Photo not empty');
 await page.locator('#upload').setInputFiles({name:'portrait.jpg',mimeType:'image/jpeg',buffer});
 console.log('3/5 Uploaded photo, waiting for local vision inference…');
 try{
  await page.waitForFunction(()=>{const text=document.querySelector('#status')?.textContent||'';return text.startsWith('Ready:')||text.includes('No clear face')||text.includes('vision models could not')},{timeout:1000}, {timeout:90000});
 }catch(e){console.log('TIMED OUT / status:',await page.locator('#status').textContent());throw e}
 const status=await page.locator('#status').textContent();
 console.log('Result:',status);
 await page.screenshot({path:'halloween-e2e.png',fullPage:true});
 assert(status.startsWith('Ready:'),'Automatic detection failed: '+status);
 assert.equal(await page.locator('#download').isDisabled(),false);
 console.log('4/5 Face inference succeeded; export unlocked');
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),page.locator('#download').click()]);
 const out='halloween-e2e-export.png';await download.saveAs(out);
 const png=await readFile(out);
 assert(png.length>25000,'PNG unexpectedly small');
 assert.equal(png.subarray(1,4).toString(),'PNG');
 console.log('5/5 PNG download passed,',png.length,'bytes');
 assert.equal(consoleErrors.length,0,'Browser exceptions: '+consoleErrors.join('; '));
}finally{await browser?.close()}
