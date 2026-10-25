/* SMEMR event wall: opt-in, local-first, shared only when durable Vercel KV is connected. */
const DB_NAME='smemr_event_wall_v1';
const MAX_LOCAL=80;
let wallPhotos=[],wallShared=false,initialized=false,activeId=null,dbPromise;
const $=id=>document.getElementById(id);
function database(){
 if(!('indexedDB'in window))return Promise.reject(new Error('IndexedDB not supported'));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB_NAME,1);
  r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'});
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
 });
 return dbPromise;
}
async function allLocal(){
 const d=await database();return new Promise((resolve,reject)=>{
  const t=d.transaction('photos','readonly'),r=t.objectStore('photos').getAll();
  r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);
 });
}
async function saveLocal(rec){
 const d=await database();return new Promise((resolve,reject)=>{
  const t=d.transaction('photos','readwrite');t.objectStore('photos').put(rec);
  t.oncomplete=resolve;t.onerror=()=>reject(t.error);
 });
}
async function removeLocal(id){
 const d=await database();return new Promise((resolve,reject)=>{
  const t=d.transaction('photos','readwrite');t.objectStore('photos').delete(id);
  t.oncomplete=resolve;t.onerror=()=>reject(t.error);
 });
}
async function remote(path,opts={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
 try{
  const resp=await fetch(path,{cache:'no-store',signal:controller.signal,...opts});
  const data=await resp.json().catch(()=>({}));
  return {ok:resp.ok,status:resp.status,data};
 }finally{clearTimeout(timeout)}
}
function thumbnail(canvas){
 const c=document.createElement('canvas');c.width=440;c.height=550;c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);
 // Choose compact JPEG compatible with Vercel function payload and KV quota.
 return c.toDataURL('image/jpeg',.7);
}
function notify(text,bad=false){const target=$('wall-publish-status');if(target){target.textContent=text;target.className='wall-status'+(bad?' warn':'')}}
function gridFill(list){
 const grid=$('wall-grid');if(!grid)return;grid.replaceChildren();
 if(!list.length){const empty=document.createElement('p');empty.className='wall-empty';empty.textContent='The photo wall is ready. Be the first to add your Halloween portrait!';grid.appendChild(empty);return}
 for(const item of list){
  if(!item.thumbnail?.startsWith('data:image/jpeg;base64,'))continue;
  const btn=document.createElement('button');btn.type='button';btn.className='wall-tile';
  btn.setAttribute('aria-label','Open photo wall portrait');
  const img=document.createElement('img');img.src=item.thumbnail;img.loading='lazy';img.alt='SMEMR Halloween photo wall portrait';
  const tag=document.createElement('span');tag.textContent=item.kind||'SMEMR Halloween';btn.append(img,tag);
  btn.addEventListener('click',()=>show(item.id));grid.appendChild(btn);
 }
}
function merged(local=[],remote=[]){
 const m=new Map();for(const item of [...local,...remote])if(item?.id&&item.thumbnail)m.set(item.id,item);
 // Prefer local record on ID collision to preserve the owner removal token.
 for(const item of local)if(item?.id&&item.thumbnail)m.set(item.id,item);
 return [...m.values()].sort((a,b)=>b.createdAt-a.createdAt).slice(0,120)
}
export async function loadWall(){
 let local=[];try{local=await allLocal()}catch(e){console.warn('Device wall unavailable',e)}
 let remotePhotos=[],mode=false;
 try{const r=await remote('/api/wall');if(r.ok&&r.data.shared){remotePhotos=r.data.photos||[];mode=true}}catch(e){console.info('Wall backend not connected')}
 wallShared=mode;wallPhotos=merged(local,remotePhotos);
 gridFill(wallPhotos);
 if($('wall-count'))$('wall-count').textContent=wallPhotos.length+' portraits';
 if($('wall-mode'))$('wall-mode').textContent=wallShared?'Shared event wall • opt-in':'This-device photo wall • shared storage not connected';
 return wallPhotos;
}
function show(id){
 const item=wallPhotos.find(x=>x.id===id);if(!item)return;activeId=id;
 $('wall-preview-img').src=item.thumbnail;
 $('wall-remove').hidden=!item.removeToken;
 $('wall-dialog').showModal();
}
async function removeSelected(){
 const item=wallPhotos.find(x=>x.id===activeId);if(!item?.removeToken)return;
 if(item.shared){
  const r=await remote('/api/wall',{method:'DELETE',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({id:item.id,removeToken:item.removeToken})}).catch(()=>({ok:false}));
  if(!r.ok){notify('Could not remove this photo from the shared wall; please contact the organizer.',true);return}
 }
 await removeLocal(item.id).catch(()=>{});
 $('wall-dialog').close();await loadWall();notify('Your photo has been removed from the wall.');
}
export async function publishPoster(canvas,kind){
 if(!$('wall-consent')?.checked){notify('Confirm permission before displaying a photo on the event wall.',true);return false}
 if(!$('wall-adult')?.checked){notify('Confirm that everyone pictured agreed, including an adult for minors.',true);return false}
 const btn=$('publish-wall');btn.disabled=true;notify('Preparing your event-wall photo…');
 try{
  let image=thumbnail(canvas);
  if(image.length>370000){const c=document.createElement('canvas');c.width=320;c.height=400;c.getContext('2d').drawImage(canvas,0,0,320,400);image=c.toDataURL('image/jpeg',.63)}
  if(image.length>370000)throw new Error('Photo too large for the wall');
  let published=null;
  try{
   const r=await remote('/api/wall',{method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({thumbnail:image,kind,consent:true,confirmedAdults:true})});
   if(r.ok&&r.data.id)published=r.data;
  }catch(e){console.info('Shared wall unavailable; saving on this device')}
  const local={id:published?.id||'local-'+crypto.randomUUID(),thumbnail:image,kind,createdAt:Date.now(),
   shared:!!published,removeToken:published?.removeToken||'local'};
  await saveLocal(local);
  notify(published?'Added to the shared SMEMR photo wall!':'Saved to this device’s photo wall. Shared wall storage is not connected.');
  await loadWall();$('wall-consent').checked=false;$('wall-adult').checked=false;
  return true;
 }catch(e){notify('Could not add the photo to the wall: '+e.message,true);return false}
 finally{btn.disabled=false}
}
document.addEventListener('DOMContentLoaded',()=>{
 if(!initialized){initialized=true;loadWall()}
 $('wall-refresh')?.addEventListener('click',loadWall);
 $('wall-remove')?.addEventListener('click',removeSelected);
 $('wall-close')?.addEventListener('click',()=>$('wall-dialog').close());
});
export {wallPhotos};
