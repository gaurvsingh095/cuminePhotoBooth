/*
 * SMEMR Photo Booth: one-page guided kiosk flow.
 * The original Canvas compositing and face/pose engines remain in halloween.js.
 */
import {loadWall,publishPoster} from './wall-store.js';
const $=id=>document.getElementById(id);
let current=1,captured=false,confirmed=false,armed=false,opening=false;

function updateStep(number,scroll=true){
 if(number<1||number>4||number>1&&!captured||number>2&&!confirmed)return;
 current=number;
 const workspace=document.querySelector('.wizard-workspace');
 workspace.className='workspace wizard-workspace wizard-step-'+number;
 $('photo-step').hidden=number!==1;
 $('align-step').hidden=number!==2;
 $('experience-step').hidden=number!==3;
 $('finish-card').hidden=number!==4;
 $('skeleton-scenes').style.display=number===3?'':'none';
 $('frame-scenes').style.display=number===3?'':'none';
 document.querySelectorAll('[data-go]').forEach(btn=>{
  const step=Number(btn.dataset.go);
  btn.disabled=step>1&&!captured||step>2&&!confirmed;
  btn.classList.toggle('active',step===number);
  btn.classList.toggle('completed',step<number);
  if(step===number)btn.setAttribute('aria-current','step');
  else btn.removeAttribute('aria-current');
 });
 $('progress-caption').textContent=({
  1:'01 / Take your photo',2:'02 / Center and align',3:'03 / Style your photo',4:'04 / Your final SMEMR photo'
 })[number];
 if(scroll)document.querySelector('.flow-steps').scrollIntoView({block:'start',behavior:'smooth'});
}
function reset(){
 captured=false;confirmed=false;armed=false;opening=false;
 $('manual').disabled=true;$('align-open').disabled=true;$('align-next').disabled=true;
 $('align-message').textContent='Take a photo to unlock alignment.';
 if($('wall-consent'))$('wall-consent').checked=false;
 if($('wall-adult'))$('wall-adult').checked=false;
 updateStep(1,false);
}
function photoAvailable(){
 if(!armed||captured)return;
 if($('manual').disabled)return;
 armed=false;captured=true;confirmed=false;
 $('align-open').disabled=false;$('align-next').disabled=true;
 $('align-message').textContent='Ready! Tap Center & align, drag your face crop into place, then choose your frames.';
 updateStep(2,true);
 // The alignment modal is itself step 02. Opening it here keeps the flow linear.
 if(!opening){opening=true;setTimeout(()=>{opening=false;if(current===2&&!confirmed)$('align-open').click()},220)}
}
document.addEventListener('DOMContentLoaded',()=>{
 document.title='SMEMR Photo Booth | School of Mining Engineering & Mineral Resources';
 document.body.classList.add('smemr-guided');
 const capture=$('capture'),manual=$('manual');
 capture.addEventListener('click',()=>{armed=true;captured=false;confirmed=false},{capture:true});
 const observer=new MutationObserver(photoAvailable);
 observer.observe(manual,{attributes:true,attributeFilter:['disabled']});
 // An existing photo can be reshot. No image upload is exposed in this flow.
 $('camera-start').addEventListener('click',()=>{if(current===1)armed=false});
 $('align-open').addEventListener('click',()=>{
  if(!captured)return;
  if(!manual.disabled)manual.click();
 });
 $('manual-apply').addEventListener('click',()=>{
  if(!captured)return;
  confirmed=true;$('align-next').disabled=false;
  $('align-message').textContent='Face alignment saved. You can go back to adjust it at any time.';
  setTimeout(()=>updateStep(3,true),30);
 });
 $('align-next').addEventListener('click',()=>updateStep(3));
 $('frame-next').addEventListener('click',()=>updateStep(4));
 $('retake').addEventListener('click',reset);
 document.querySelectorAll('[data-back]').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.back==='1'){
   $('retake').click();$('camera-start').click();
  }else updateStep(Number(btn.dataset.back));
 }));
 document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>updateStep(Number(btn.dataset.go))));
 $('publish-wall').addEventListener('click',async()=>{
  if(current!==4||$('download-duplicate').disabled)return;
  const theme=document.querySelector('.experience-choice.selected strong')?.textContent||'SMEMR Photo Booth';
  const frame=document.querySelector('[data-frame].selected')?.textContent||'';
  const ok=await publishPoster($('poster'),theme.includes('Frames')?frame.trim():'Skeleton Crew');
  if(ok)document.getElementById('wall').scrollIntoView({behavior:'smooth',block:'start'});
 });
 document.getElementById('wall').addEventListener('click',e=>{
  if(e.target.closest('#wall-refresh'))void loadWall();
 });
 reset();
});
