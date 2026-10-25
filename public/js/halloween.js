
/* SMEMR Halloween Skeleton Studio | isolated seasonal experience.
   Runs face detection on the visitor's device; never uploads photos. */
import {drawPoseSkeleton,matchPoses,facesFromPose,poseUsable} from './halloween-pose.js';
import {drawAugmentedFrame,FRAMES,CAPTIONS} from './halloween-frames.js';
const $=id=>document.getElementById(id);
const W=1200,H=1500, state={scene:'shaft',style:'skeleton',frameTheme:'copper',frameFilter:'cinema',caption:'crew',accessory:'none',strength:65,source:null,faces:[],poses:[],manual:false,camera:null,detector:null,landmarker:null,loading:null,poseLoading:null,faceFit:100,poseEnabled:true};
const poster=$('poster'),ctx=poster.getContext('2d'),source=document.createElement('canvas');
let lastStatus='';
let photoGeneration=0;
let cameraGeneration=0;
const finishProcessing=()=>{$('busy').classList.remove('busy');$('busy').textContent='On-device studio';};
const setStatus=(text,kind='')=>{lastStatus=text;$('status').textContent=text;$('status').className='result-status '+kind;};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const random=(seed)=>{let v=Math.sin(seed*127.1+32.09)*43758.5453;return v-Math.floor(v)};
function init(){
  poster.width=W;poster.height=H;renderPoster();
  document.querySelectorAll('.choice').forEach(el=>el.addEventListener('click',()=>{state.scene=el.dataset.scene;document.querySelectorAll('.choice').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el))});renderPoster()}));
  document.querySelectorAll('[data-style]').forEach(el=>el.addEventListener('click',()=>{
    if(state.style===el.dataset.style)return;
    state.style=el.dataset.style;photoGeneration++;finishProcessing();
    updateExperienceUI();renderPoster();
    if(state.source&&state.style==='frame'&&!state.faces.length)void detectFrameFaces(photoGeneration);
    if(state.source&&state.style==='skeleton'&&!state.faces.length){
      const copy=document.createElement('canvas');copy.width=source.width;copy.height=source.height;
      copy.getContext('2d').drawImage(source,0,0);void usePhoto(copy);
    }
  }));
  document.querySelectorAll('[data-frame]').forEach(el=>el.addEventListener('click',()=>{
    state.frameTheme=el.dataset.frame;updateExperienceUI();renderPoster()
  }));
  ['frame-filter','caption','accessory'].forEach(id=>$(id).addEventListener('change',event=>{
    const k={'frame-filter':'frameFilter',caption:'caption',accessory:'accessory'}[id];
    state[k]=event.target.value;renderPoster();
    if(id==='accessory'&&state.accessory!=='none'&&state.source&&!state.faces.length)void detectFrameFaces(photoGeneration);
  }));
  $('strength').addEventListener('input',event=>{
    state.strength=Number(event.target.value);$('strength-value').textContent=state.strength+'%';renderPoster()
  });
  $('surprise').addEventListener('click',()=>{
    if(state.style==='frame'){
      state.frameTheme=FRAMES[Math.floor(Math.random()*FRAMES.length)].id;
      const filters=['cinema','natural','copper','moon'];state.frameFilter=filters[Math.floor(Math.random()*filters.length)];
      state.caption=CAPTIONS[Math.floor(Math.random()*CAPTIONS.length)].id;
      const accessories=['none','helmet','witch','horns','glow'];
      state.accessory=accessories[Math.floor(Math.random()*accessories.length)];
      state.strength=45+Math.floor(Math.random()*12)*5;
      ['frame-filter','caption','accessory'].forEach(id=>$(id).value=state[{'frame-filter':'frameFilter',caption:'caption',accessory:'accessory'}[id]]);
      $('strength').value=state.strength;$('strength-value').textContent=state.strength+'%';
      if(state.source&&state.accessory!=='none'&&!state.faces.length)void detectFrameFaces(photoGeneration);
    }else{
      const scenes=['shaft','crypt','moon','pumpkin'];
      state.scene=scenes[Math.floor(Math.random()*scenes.length)];
    }
    updateExperienceUI();renderPoster();
    if(state.source)setStatus('Surprise! Your haunted look has changed.','success');
  });
  $('share').addEventListener('click',sharePoster);
  $('camera-start').addEventListener('click',startCamera);
  $('capture').addEventListener('click',capturePhoto);
  $('upload-btn').addEventListener('click',()=>$('upload').click());
  $('upload').addEventListener('change',async e=>{let file=e.target.files?.[0];if(!file)return;if(file.size>20*1024*1024){setStatus('Image is over 20 MB. Choose a smaller JPG, PNG or WebP.','error');e.target.value='';return}try{const img=await loadImage(file);const c=document.createElement('canvas'),max=1800,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);await usePhoto(c);}catch(err){setStatus('Unable to load this image. Try a JPG or PNG.','error')}finally{e.target.value=''}});
  $('retake').addEventListener('click',()=>{photoGeneration++;stopCamera();state.faces=[];state.poses=[];state.source=null;state.manual=false;finishProcessing();renderPoster();setStatus('Session cleared. Open your camera or upload a new photo.','success')});
  $('fit').addEventListener('input',e=>{state.faceFit=Number(e.target.value);$('fit-value').textContent=state.faceFit+'%';renderPoster()});
  $('pose-toggle').addEventListener('change',e=>{state.poseEnabled=e.target.checked;renderPoster()});
  $('download').addEventListener('click',downloadPoster);
  $('download-duplicate').addEventListener('click',downloadPoster);
  $('manual').addEventListener('click',openManual);
  $('manual-cancel').addEventListener('click',closeManual);
  $('manual-person').addEventListener('change',()=>{syncManualPerson();drawManual()});
  $('manual-modal').addEventListener('click',e=>{if(e.target===$('manual-modal'))closeManual()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('manual-modal').classList.contains('active'))closeManual()});
  $('manual-apply').addEventListener('click',()=>{
    if(!state.source)return;
    photoGeneration++;finishProcessing();
    const x=Number($('manual-x').value)/100,y=Number($('manual-y').value)/100,w=Number($('manual-size').value)/100;
    const next={x,y,w,h:w*1.25};
    const person=$('manual-person').value;
    if(person==='new') {if(state.faces.length>=3){setStatus('The studio supports up to three faces.','error');return;}state.faces.push(next)}
    else {const index=Number(person);if(!Number.isInteger(index)||index<0||index>=state.faces.length)return;state.faces[index]=next}
    state.faces.sort((a,b)=>a.x-b.x);
    state.poses=[];state.manual=true;closeManual();renderPoster();
    setStatus('Manual placement saved for '+state.faces.length+' '+(state.faces.length===1?'face':'faces')+'. Add or adjust another face, or download.','success');
  });
  ['manual-x','manual-y','manual-size'].forEach(id=>$(id).addEventListener('input',drawManual));
  $('manual-canvas').addEventListener('click',e=>{const box=e.currentTarget.getBoundingClientRect();const x=clamp((e.clientX-box.left)/box.width,0,1),y=clamp((e.clientY-box.top)/box.height,0,1);$('manual-x').value=Math.round(x*100);$('manual-y').value=Math.round(y*100);drawManual()});
  updateExperienceUI();
  window.addEventListener('pagehide',()=>{photoGeneration++;stopCamera()});
}
function loadImage(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),i=new Image();i.onload=()=>{URL.revokeObjectURL(url);res(i)};i.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Image load'))};i.src=url})}
async function startCamera(){
  stopCamera();
  const cameraJob=++cameraGeneration;
  if(!navigator.mediaDevices?.getUserMedia){setStatus('Camera is unavailable. Use Upload photo instead.','error');return}
  setStatus('Requesting camera access…');$('capture').hidden=true;
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}}});
    if(cameraJob!==cameraGeneration){stream.getTracks().forEach(track=>track.stop());return}
    state.camera=stream;
    const v=$('video');v.srcObject=stream;await v.play();
    if(cameraJob!==cameraGeneration)return;
    $('stage').classList.add('camera');$('capture').hidden=false;$('camera-start').textContent='Restart camera';
    setStatus('Camera ready. Look toward the camera, then capture.','success');
  }catch(e){setStatus('Camera unavailable or access denied. Upload a photo to continue.','error')}
}
function stopCamera(){cameraGeneration++;if(state.camera){state.camera.getTracks().forEach(t=>t.stop());state.camera=null}const v=$('video');v.pause();v.srcObject=null;$('stage').classList.remove('camera');$('capture').hidden=true}
async function capturePhoto(){
  const v=$('video');if(!v.videoWidth){setStatus('Camera is not ready yet.','error');return}
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;let z=c.getContext('2d');z.translate(c.width,0);z.scale(-1,1);z.drawImage(v,0,0);stopCamera();await usePhoto(c);
}
async function usePhoto(c){
  const job=++photoGeneration;
  stopCamera();
  if(!c.width||!c.height){setStatus('Image is empty. Please retry.','error');return}
  source.width=c.width;source.height=c.height;source.getContext('2d').drawImage(c,0,0);
  state.source=source;state.faces=[];state.poses=[];state.manual=false;
  $('download').disabled=true;$('manual').disabled=false;renderPoster();
  if(state.style==='frame'){
    renderPoster();finishProcessing();
    setStatus('Ready: cinematic Halloween frame created. Choose a style or download now.','success');
    void detectFrameFaces(job);return;
  }
  setStatus('Detecting faces locally. First use can take several seconds…');
  $('busy').classList.add('busy');$('busy').textContent='Processing';
  try{
    let boxes=[],poseResult=null,faceError=null,poseError=null;
    try{
      const d=await getDetector();
      const detected=d.detect(source);
      boxes=(detected?.detections||[]).map(det=>det.boundingBox).filter(Boolean).map(b=>({
        x:(b.originX+b.width/2)/source.width,
        y:(b.originY+b.height/2)/source.height,
        w:b.width/source.width,h:b.height/source.height
      })).filter(b=>b.w>.025&&b.h>.025).sort((a,b)=>a.x-b.x).slice(0,3);
    }catch(e){faceError=e;console.warn('Local face model:',e);}
    if(job!==photoGeneration)return;
    try{
      const p=await getPoseLandmarker();
      poseResult=p.detect(source);
    }catch(e){poseError=e;console.warn('Local pose model:',e);}
    if(job!==photoGeneration)return;
    if(!boxes.length&&poseResult?.landmarks?.length){
      boxes=facesFromPose(poseResult,3);
    }
    if(!boxes.length){
      const reason=faceError&&poseError?'The vision models could not start.':'No clear face was detected in this photo.';
      setStatus(reason+' '+(faceError?.message||poseError?.message||'').slice(0,155)+' Tap “Place face manually” below, or retry in a moment.','error');
      $('manual').focus();return;
    }
    state.faces=boxes;
    state.poses=matchPoses(boxes,poseResult);
    renderPoster();
    const rig=state.poses.filter((p,i)=>poseUsable(p,boxes[i])).length;
    setStatus('Ready: '+boxes.length+' '+(boxes.length===1?'face':'faces')+' preserved. '+(rig?'Pose-matched skeletons: '+rig+'. ':'Using standing skeleton layout. ')+'Fine-tune or download.','success');
  }catch(e){
    console.warn('Processing failure:',e);
    if(job===photoGeneration)setStatus('This photo could not be processed automatically. Please use “Place face manually.”','error');
  }finally{
    if(job===photoGeneration)finishProcessing();
  }
}
async function detectFrameFaces(job){
  if(!state.source||job!==photoGeneration||state.style!=='frame')return;
  try{
    const detector=await getDetector();
    if(job!==photoGeneration||state.style!=='frame')return;
    const detection=detector.detect(source);
    const faces=(detection?.detections||[]).map(d=>d.boundingBox).filter(Boolean).map(b=>({
      x:(b.originX+b.width/2)/source.width,y:(b.originY+b.height/2)/source.height,
      w:b.width/source.width,h:b.height/source.height
    })).filter(f=>f.w>.025&&f.h>.025).sort((a,b)=>a.x-b.x).slice(0,3);
    if(job!==photoGeneration||state.style!=='frame'||state.manual)return;
    if(faces.length){state.faces=faces;renderPoster()}
  }catch(e){console.info('Optional face accessories: manual placement is available.')}
}
function updateExperienceUI(){
  document.querySelectorAll('[data-style]').forEach(button=>{
    const active=button.dataset.style===state.style;
    button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-frame]').forEach(button=>{
    const active=button.dataset.frame===state.frameTheme;
    button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('.choice[data-scene]').forEach(button=>{
    const active=button.dataset.scene===state.scene;
    button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
  });
  $('skeleton-scenes').hidden=state.style!=='skeleton';
  $('frame-scenes').hidden=state.style!=='frame';
  $('pose-controls').hidden=state.style!=='skeleton';
  $('finish-title').textContent=state.style==='frame'?'Polish & save the look.':'Your face. Their bones.';
  $('finish-help').textContent=state.style==='frame'?
    'Fine-tune face accessory positions if needed, then download or share your original-photo souvenir.':
    'Your real face is preserved. Pose matching falls back to a standing skeleton when needed.';
}
const MEDIAPIPE_VERSION='0.10.35';
const MEDIAPIPE_CDN='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MEDIAPIPE_VERSION;
let mediaPromise,filesetPromise;
async function getMedia(){
 if(!mediaPromise)mediaPromise=(async()=>{
   const urls=['../vendor/mediapipe/vision_bundle.mjs',MEDIAPIPE_CDN+'/vision_bundle.mjs','https://unpkg.com/@mediapipe/tasks-vision@'+MEDIAPIPE_VERSION+'/vision_bundle.mjs'];
   let last;
   for(const url of urls){
     try{
       const module=await import(/* @vite-ignore */ url);
       const api=module.default?.FilesetResolver ? module.default : module;
       if(api.FilesetResolver&&api.FaceDetector&&api.PoseLandmarker)return api;
       throw new Error('Vision library exports missing');
     }catch(e){last=e;console.warn('MediaPipe library load failed:',url,e)}
   }
   throw new Error('Could not load MediaPipe: '+(last?.message||'network issue'));
 })().catch(e=>{mediaPromise=null;throw e});
 return mediaPromise;
}
async function getFileset(forceCDN=false){
 const {FilesetResolver}=await getMedia();
 if(forceCDN)return FilesetResolver.forVisionTasks(MEDIAPIPE_CDN+'/wasm');
 if(!filesetPromise)filesetPromise=Promise.resolve(FilesetResolver.forVisionTasks(new URL('../vendor/mediapipe/wasm',import.meta.url).href)).catch(e=>{filesetPromise=null;throw e});
 return filesetPromise;
}
async function initializeTaskWithFallback(Task,options){
 let last;
 for(const cdn of [false,true]){
   try{return await Task.createFromOptions(await getFileset(cdn),options)}
   catch(e){last=e;console.warn('MediaPipe '+(cdn?'CDN':'same-origin')+' runtime failed:',e)}
 }
 throw last||new Error('Vision WASM did not start');
}
async function getDetector(){
 if(state.detector)return state.detector;
 if(!state.loading)state.loading=(async()=>{
   const {FaceDetector}=await getMedia();
   const local=new URL('../vendor/models/face_detector.tflite',import.meta.url).href;
   const remote='https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
   let error;
   for(const modelAssetPath of [local,remote]){
     try{return await initializeTaskWithFallback(FaceDetector,{baseOptions:{modelAssetPath,delegate:'CPU'},runningMode:'IMAGE',minDetectionConfidence:.45,minSuppressionThreshold:.3})}
     catch(e){error=e;console.warn('Face model source failed',e)}
   }
   throw new Error('Face detector unavailable: '+(error?.message||'model loading error'));
 })().catch(e=>{state.loading=null;throw e});
 state.detector=await state.loading;return state.detector;
}
async function getPoseLandmarker(){
 if(state.landmarker)return state.landmarker;
 if(!state.poseLoading)state.poseLoading=(async()=>{
   const {PoseLandmarker}=await getMedia();
   const local=new URL('../vendor/models/pose_landmarker_lite.task',import.meta.url).href;
   const remote='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
   let error;
   for(const modelAssetPath of [local,remote]){
     try{return await initializeTaskWithFallback(PoseLandmarker,{baseOptions:{modelAssetPath,delegate:'CPU'},runningMode:'IMAGE',numPoses:3,minPoseDetectionConfidence:.45,minPosePresenceConfidence:.45,outputSegmentationMasks:false})}
     catch(e){error=e;console.warn('Pose model source failed',e)}
   }
   throw new Error('Pose landmarker unavailable: '+(error?.message||'model loading error'));
 })().catch(e=>{state.poseLoading=null;throw e});
 state.landmarker=await state.poseLoading;return state.landmarker;
}
function closeManual(){
  $('manual-modal').classList.remove('active');$('manual').focus();
}
function syncManualPerson(){
  const idx=$('manual-person').value;
  const f=idx==='new'?{x:.5,y:.38,w:.20}:state.faces[Number(idx)]||{x:.5,y:.38,w:.20};
  $('manual-x').value=Math.round(f.x*100);$('manual-y').value=Math.round(f.y*100);$('manual-size').value=Math.round(clamp(f.w,.10,.55)*100);
}
function openManual(){
  if(!state.source){setStatus('Take or upload a photo first.','error');return}
  const m=$('manual-canvas');m.width=source.width;m.height=source.height;
  const select=$('manual-person');select.replaceChildren();
  state.faces.forEach((_,i)=>select.add(new Option('Adjust face '+(i+1),String(i))));
  if(state.faces.length<3)select.add(new Option('Add '+(state.faces.length?'another':'a')+' face','new'));
  select.value=state.faces.length?String(0):'new';syncManualPerson();
  $('manual-modal').classList.add('active');drawManual();select.focus();
}
function drawManual(){
  if(!state.source)return;
  const c=$('manual-canvas'),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(source,0,0,c.width,c.height);
  const cx=Number($('manual-x').value)/100*c.width,cy=Number($('manual-y').value)/100*c.height,w=Number($('manual-size').value)/100*c.width;
  state.faces.forEach((f,i)=>{if(String(i)===$('manual-person').value)return;x.strokeStyle='#81d8ef';x.lineWidth=Math.max(3,c.width*.004);x.beginPath();x.ellipse(f.x*c.width,f.y*c.height,f.w*c.width*.68,f.h*c.height*.66,0,0,Math.PI*2);x.stroke()});
  x.strokeStyle='#f5bd7e';x.lineWidth=Math.max(3,c.width*.005);x.setLineDash([15,9]);x.beginPath();x.ellipse(cx,cy,w*.68,w*.82,0,0,Math.PI*2);x.stroke();x.setLineDash([]);
}
function posterFileName(){
  return 'SMEMR-Halloween-'+(state.style==='frame'?state.frameTheme:'Skeleton-Crew')+'-'+Date.now()+'.png';
}
function posterBlob(){
  return new Promise((resolve,reject)=>poster.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export unavailable')),'image/png'));
}
async function downloadPoster(){
  if(!state.source||(state.style==='skeleton'&&!state.faces.length))return;
  try{
    const blob=await posterBlob(),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=posterFileName();document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(e){setStatus('Image export failed. Try another browser or photo.','error')}
}
async function sharePoster(){
  if(!state.source||(state.style==='skeleton'&&!state.faces.length))return;
  try{
    const blob=await posterBlob(),file=new File([blob],posterFileName(),{type:'image/png'});
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file],title:'SMEMR Halloween photo'});
    }else{
      await downloadPoster();
      setStatus('Your poster was downloaded. Share it from your device downloads.','success');
    }
  }catch(e){if(e?.name!=='AbortError')setStatus('Sharing unavailable. Use Download instead.','error')}
}
function background(){
  const g=ctx.createLinearGradient(0,0,W,H);
  const shades={shaft:['#07111b','#1f2936','#070a13'],crypt:['#161015','#382024','#100c16'],moon:['#09152e','#202b48','#080f21'],pumpkin:['#180d16','#57301c','#110b19']}[state.scene]||['#07111b','#1f2936','#070a13'];
  g.addColorStop(0,shades[0]);g.addColorStop(.55,shades[1]);g.addColorStop(1,shades[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Atmospheric grain and occasional glints make the scene look like an illustrated print.
  for(let i=0;i<220;i++){const x=random(i+71)*W,y=random(i+1024)*H,r=random(i+3)*2+.4;ctx.fillStyle='rgba(240,213,168,'+(.025+random(i+72)*.2)+')';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
  if(state.scene==='shaft'){
    // Ribbed underground mine entrance, tunnel lights, and deep tracks.
    ctx.strokeStyle='#6a5340';ctx.lineWidth=20;
    for(let j=0;j<5;j++){let o=j*90;ctx.globalAlpha=.09+j*.022;ctx.beginPath();ctx.moveTo(-80+o,1420);ctx.lineTo(-80+o,540-o*.35);ctx.quadraticCurveTo(600,100-o*.18,1280-o,540-o*.35);ctx.lineTo(1280-o,1420);ctx.stroke()}ctx.globalAlpha=1;
    const glow=ctx.createRadialGradient(600,630,10,600,720,650);glow.addColorStop(0,'#c8953b36');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#735d44';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(160,1500);ctx.lineTo(510,730);ctx.moveTo(1040,1500);ctx.lineTo(690,730);ctx.stroke();
    ctx.lineWidth=6;for(let y=790;y<1500;y+=40+(y-750)*.075){let left=510-(y-730)*.45,right=690+(y-730)*.45;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke()}
  }else if(state.scene==='crypt'){
    for(let i=0;i<13;i++){ctx.strokeStyle=i%2?'#a65d3565':'#624c5458';ctx.lineWidth=2+random(i)*7;ctx.beginPath();let x=random(i+30)*W;ctx.moveTo(x,0);ctx.lineTo(x+80,210);ctx.lineTo(x-90,380);ctx.lineTo(x+70,600);ctx.stroke()}
    for(let i=0;i<8;i++){let x=40+i*160,h=75+random(i)*140;ctx.fillStyle='#886c6f33';ctx.beginPath();ctx.moveTo(x,H-175);ctx.lineTo(x+35,H-175-h);ctx.lineTo(x+70,H-175);ctx.fill()}
  }else if(state.scene==='moon'){
    for(let i=0;i<65;i++){let x=random(i+78)*W,y=random(i+90)*1000;ctx.fillStyle='#dce9ff'+(Math.floor(random(i+44)*150+60)).toString(16).padStart(2,'0');ctx.beginPath();ctx.arc(x,y,1+random(i+10)*2,0,7);ctx.fill()}
    const moon=ctx.createRadialGradient(880,335,40,880,335,260);moon.addColorStop(0,'#dfd6c875');moon.addColorStop(1,'#dfd6c800');ctx.fillStyle=moon;ctx.fillRect(610,80,550,520);
    ctx.fillStyle='#a9a8af';ctx.beginPath();ctx.arc(905,345,100,0,7);ctx.fill();ctx.fillStyle='#777681';for(const [x,y,r] of [[855,320,14],[939,375,22],[907,288,10]]){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
    ctx.fillStyle='#242d41';ctx.beginPath();ctx.moveTo(0,1330);ctx.quadraticCurveTo(280,1110,550,1320);ctx.quadraticCurveTo(850,1150,1200,1280);ctx.lineTo(1200,H);ctx.lineTo(0,H);ctx.fill();
  }else if(state.scene==='pumpkin'){
    const glow=ctx.createRadialGradient(600,900,20,600,900,850);glow.addColorStop(0,'#f48b3c55');glow.addColorStop(1,'#f48b3c00');ctx.fillStyle=glow;ctx.fillRect(0,200,W,1200);
    ctx.fillStyle='#20151d';for(let i=0;i<6;i++){const x=i*240-70;ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+70,740+random(i)*200);ctx.lineTo(x+155,H);ctx.fill()}
    for(const [x,y,r] of [[140,1200,80],[1040,1190,95],[290,1300,54],[970,1345,58]]){
      ctx.fillStyle='#a44c20';ctx.beginPath();ctx.ellipse(x,y,r,r*.75,0,0,7);ctx.fill();ctx.strokeStyle='#da793c';ctx.lineWidth=8;ctx.stroke();
      ctx.fillStyle='#251219';ctx.beginPath();ctx.moveTo(x-r*.55,y-r*.07);ctx.lineTo(x-r*.15,y-r*.34);ctx.lineTo(x-r*.08,y+r*.13);ctx.fill();ctx.beginPath();ctx.moveTo(x+r*.55,y-r*.07);ctx.lineTo(x+r*.15,y-r*.34);ctx.lineTo(x+r*.08,y+r*.13);ctx.fill();
      ctx.beginPath();ctx.arc(x,y+r*.19,r*.37,0,Math.PI);ctx.lineTo(x-r*.37,y+r*.19);ctx.fill();
      ctx.strokeStyle='#6e7138';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y-r*.73);ctx.lineTo(x+8,y-r);ctx.stroke();
    }
  }
  // Silhouetted bats reinforce the Halloween theme without covering faces.
  if(state.scene!=='moon')for(let i=0;i<9;i++){
    const x=75+random(i+123)*1050,y=285+random(i+77)*280,s=.45+random(i+51)*.72;
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#070c17b8';ctx.beginPath();ctx.moveTo(-43,0);ctx.quadraticCurveTo(-20,-22,0,-5);ctx.quadraticCurveTo(20,-22,43,0);ctx.quadraticCurveTo(23,-3,26,20);ctx.quadraticCurveTo(9,7,0,20);ctx.quadraticCurveTo(-9,7,-26,20);ctx.quadraticCurveTo(-23,-3,-43,0);ctx.fill();ctx.restore();
  }
  const vg=ctx.createRadialGradient(600,700,210,600,750,1100);vg.addColorStop(0,'transparent');vg.addColorStop(1,'#000b');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
function path(points,weight=17,tint='#e7e0d1'){
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#1b2229';ctx.lineWidth=weight+11;
  ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke();
  ctx.strokeStyle='#887f74';ctx.lineWidth=weight+3;ctx.stroke();
  ctx.strokeStyle=tint;ctx.lineWidth=weight;ctx.stroke();
  ctx.strokeStyle='#fff8e6';ctx.globalAlpha=.35;ctx.lineWidth=Math.max(2,weight*.23);ctx.stroke();ctx.globalAlpha=1;
}
function curve(points,weight=11){
  const [a,b,c,d]=points;ctx.beginPath();ctx.moveTo(...a);ctx.bezierCurveTo(...b,...c,...d);
  ctx.lineCap='round';ctx.strokeStyle='#202029';ctx.lineWidth=weight+7;ctx.stroke();
  ctx.strokeStyle='#d7cebd';ctx.lineWidth=weight;ctx.stroke();
  ctx.strokeStyle='#fff8e6';ctx.globalAlpha=.35;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
}
function oval(x,y,rx,ry,fill='#e9dfcb',stroke='#524d4b',width=5){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();
}
function drawSkeleton(x,y,scale,face,number){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  // A subtle silhouette ensures the real face has a clean transition into a skeleton.
  const haze=ctx.createRadialGradient(0,370,30,0,500,350);haze.addColorStop(0,'#b4d2d012');haze.addColorStop(1,'transparent');ctx.fillStyle=haze;ctx.beginPath();ctx.ellipse(0,490,255,570,0,0,7);ctx.fill();
  // Shoulder girdle and spine
  path([[0,126],[0,180],[0,450]],14);
  for(let j=0;j<13;j++)oval(0,205+j*18,14,9,'#e9e0cc','#554d4a',3);
  curve([[0,200],[-45,173],[-82,176],[-122,174]],16);curve([[0,200],[45,173],[82,176],[122,174]],16);
  // Seven anatomically suggestive pairs of curved ribs and breastbone
  for(let i=0;i<7;i++){let z=228+i*29,p=112-i*6;
    curve([[-9,z-14],[-50,z-47],[-p,z-38],[-p+8,z+22]],12-i*.5);
    curve([[9,z-14],[50,z-47],[p,z-38],[p-8,z+22]],12-i*.5)
  }
  path([[0,205],[0,379]],11);
  // Pelvic girdle
  curve([[0,452],[-40,420],[-76,427],[-105,473]],21);
  curve([[0,452],[40,420],[76,427],[105,473]],21);
  curve([[-105,473],[-87,526],[-40,520],[0,481]],14);
  curve([[105,473],[87,526],[40,520],[0,481]],14);
  oval(0,483,25,18);
  // Arms: clavicles, upper and lower, carpals and fingers
  for(const s of [-1,1]){
    oval(s*123,179,23,26);
    path([[s*123,185],[s*159,330]],24);
    oval(s*160,345,18,19);
    path([[s*158,356],[s*191,499]],14);path([[s*171,355],[s*210,496]],12);
    oval(s*205,516,24,21);
    for(let j=0;j<4;j++){let dx=j*13-19;path([[s*(196+dx),525],[s*(197+dx*1.2),578+j%2*8]],7);path([[s*(197+dx*1.2),578+j%2*8],[s*(204+dx*1.32),611]],6)}
    path([[s*92,496],[s*87,708]],27);
    oval(s*88,719,23,26);
    path([[s*81,738],[s*82,953]],18);path([[s*100,738],[s*114,953]],14);
    oval(s*101,963,20,22);
    path([[s*102,977],[s*120,1002],[s*174,1013]],17);
    for(let j=0;j<4;j++)path([[s*(138+j*10),1005],[s*(163+j*11),1021+j*2]],5);
  }
  // Face occupies exactly the skull position, rather than replacing a full-body photo.
  if(face&&state.source){
    const cut=makeFaceCutout(face);const fw=205*(state.faceFit/100),fh=238*(state.faceFit/100);
    oval(0,-3,fw*.52+13,fh*.51+13,'#d5cbb2','#4b4545',8);
    ctx.shadowColor='#15171c';ctx.shadowBlur=24;ctx.drawImage(cut,-fw/2,-fh/2-7,fw,fh);ctx.shadowBlur=0;
    // Neck brace gives a visually convincing seam at the costume collar
    curve([[-64,111],[-45,142],[40,142],[64,111]],11);
  }else{
    oval(0,-13,99,118,'#d6cbb9','#4d4847',7);
    for(const s of [-1,1])oval(s*39,2,29,37,'#11161d','#888071',3);
    oval(0,50,12,16,'#17191e','#655e57',3);
    for(let j=0;j<6;j++)path([[-40+j*16,73],[-40+j*16,98]],4);
  }
  drawHelmet();
  // Special artifact tag for the exploration / space variants.
  if(state.scene==='moon'){ctx.save();ctx.strokeStyle='#dfe7f4';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(0,0,126,151,0,0,7);ctx.stroke();ctx.restore()}
  ctx.restore();
}
function drawHelmet(){
  ctx.save();ctx.translate(0,-103);ctx.fillStyle=state.scene==='moon'?'#d6e3ef':'#dca56a';ctx.strokeStyle='#453a35';ctx.lineWidth=7;
  ctx.beginPath();ctx.moveTo(-94,23);ctx.quadraticCurveTo(-100,-61,-22,-80);ctx.quadraticCurveTo(66,-107,96,16);ctx.closePath();ctx.fill();ctx.stroke();
  const g=ctx.createLinearGradient(0,-80,0,34);g.addColorStop(0,'#fff7e8aa');g.addColorStop(1,'#70432a66');ctx.fillStyle=g;ctx.fill();
  ctx.fillStyle=state.scene==='moon'?'#aabdc8':'#cc8a4d';ctx.beginPath();ctx.ellipse(0,20,112,19,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#303b47';ctx.beginPath();ctx.roundRect(-28,-38,56,48,11);ctx.fill();ctx.strokeStyle='#eecf9b';ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#ffe2a0';ctx.shadowColor='#ffd27b';ctx.shadowBlur=22;ctx.beginPath();ctx.arc(0,-15,15,0,7);ctx.fill();ctx.shadowBlur=0;ctx.restore()
}
function makeFaceCutout(b){
  const ww=300,hh=370,c=document.createElement('canvas');c.width=ww;c.height=hh;const p=c.getContext('2d');
  // Face Detector coordinates are measured in the original image's pixels.
  const sx=(b.x-b.w*.84)*source.width,sy=(b.y-b.h*.85)*source.height,sw=b.w*1.68*source.width,sh=b.h*1.72*source.height;
  p.drawImage(source,sx,sy,sw,sh,0,0,ww,hh);
  p.globalCompositeOperation='destination-in';
  p.save();p.translate(ww/2,hh/2);p.scale(ww*.5,hh*.5);
  const g=p.createRadialGradient(0,0,.65,0,0,1.02);g.addColorStop(0,'#000');g.addColorStop(.75,'#000');g.addColorStop(.96,'#000a');g.addColorStop(1,'#0000');
  p.fillStyle=g;p.beginPath();p.arc(0,0,1,0,Math.PI*2);p.fill();p.restore();
  p.globalCompositeOperation='source-over';return c;
}
function renderPoster(){
  if(state.style==='frame'){
    ctx.clearRect(0,0,W,H);
    if(state.source)drawAugmentedFrame(ctx,source,{
      theme:state.frameTheme,filter:state.frameFilter,intensity:state.strength,
      caption:state.caption,faces:state.faces,accessoryKind:state.accessory
    });
    else{
      ctx.fillStyle='#0b1522';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#dcb686';ctx.textAlign='center';
      ctx.font='bold 64px Impact,Arial,sans-serif';ctx.fillText('YOUR HAUNTED FRAME',600,560);
      ctx.font='28px Arial,sans-serif';ctx.fillText('OPEN THE CAMERA OR UPLOAD A PHOTO',600,650);
    }
    syncExport();return;
  }
  background();
  // Header and floor text are part of the downloaded image.
  ctx.fillStyle='#0c234b';ctx.fillRect(0,0,W,13);ctx.fillStyle='#ab0520';ctx.fillRect(0,0,270,13);
  ctx.fillStyle='#e6c59a';ctx.font='700 25px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText('THE UNIVERSITY OF ARIZONA  /  SMEMR',600,88);
  ctx.fillStyle='#f3eadf';ctx.font='800 92px "Barlow Condensed",Impact,sans-serif';ctx.fillText('AFTER HOURS',600,185);
  ctx.fillStyle='#f1b471';ctx.font='700 52px "Barlow Condensed",Impact,sans-serif';ctx.fillText('IN THE MINE',600,241);
  ctx.fillStyle='#dec2a4';ctx.fillRect(485,259,230,3);
  let count=clamp(state.faces.length||1,1,3);
  const slots=count===1?[{x:600,s:1.035}]:count===2?[{x:348,s:.925},{x:845,s:.925}]:[{x:225,s:.775},{x:600,s:.825},{x:978,s:.775}];
  slots.forEach((a,i)=>{const y=1360-1013*a.s;const face=state.faces[i]||null,pose=state.poses[i]||null;
    ctx.save();ctx.translate(a.x,y);ctx.scale(a.s,a.s);
    const rigged=state.poseEnabled&&face&&pose&&poseUsable(pose,face)&&drawPoseSkeleton(ctx,face,pose,{scene:state.scene,faceFit:state.faceFit,cutout:makeFaceCutout(face)});
    ctx.restore();
    if(!rigged)drawSkeleton(a.x,y,a.s,face,i);
  });
  const v=ctx.createLinearGradient(0,1230,0,H);v.addColorStop(0,'#05091100');v.addColorStop(.60,'#060c18d9');v.addColorStop(1,'#060a12');ctx.fillStyle=v;ctx.fillRect(0,1220,W,280);
  ctx.strokeStyle='#c09367';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(95,1370);ctx.lineTo(1105,1370);ctx.stroke();
  ctx.fillStyle='#f2dbb8';ctx.font='700 35px "Barlow Condensed",Impact,sans-serif';ctx.fillText('SKELETON CREW  •  HALLOWEEN 2026',600,1420);
  ctx.fillStyle='#a0b1bd';ctx.font='500 20px "DM Sans",sans-serif';ctx.fillText('School of Mining Engineering & Mineral Resources',600,1460);
  syncExport();
}
function syncExport(){
  const available=!!state.source&&(state.style==='frame'||state.faces.length>0);
  $('download').disabled=!available;
  $('download-duplicate').disabled=!available;
  $('share').disabled=!available;
}
document.addEventListener('DOMContentLoaded',init);
