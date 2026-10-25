/**
 * Draw a pose-matched skeleton, retaining the exact visitor head.
 * Coordinates are MediaPipe PoseLandmarker normalized image coordinates.
 * Falls back to the standard standing skeleton when pose landmarks are unreliable.
 */
export function poseUsable(points,face){
  if(!Array.isArray(points)||points.length<29||!face)return false;
  const needed=[11,12,23,24]; // shoulders and hips
  if(needed.some(i=>!Number.isFinite(points[i]?.x)||!Number.isFinite(points[i]?.y)||(points[i]?.visibility??1)<.32))return false;
  const shoulders=(points[11].y+points[12].y)/2;
  const hips=(points[23].y+points[24].y)/2;
  return shoulders>face.y+.018 && hips>shoulders+.06 && Math.abs(points[11].x-points[12].x)>.045;
}
export function matchPoses(faces,results){
  const poseLists=results?.landmarks||[];
  const available=new Set(poseLists.map((_,i)=>i));
  return faces.map(face=>{
    let best=null,dist=Infinity,index=-1;
    for(const i of available){
      const pose=poseLists[i];
      const p=pose?.[0]; // nose
      if(!p)continue;
      const d=Math.abs(p.x-face.x)*1.2+Math.abs(p.y-face.y);
      if(d<dist){best=pose;dist=d;index=i}
    }
    if(index!==-1&&dist<.32){available.delete(index);return best}return null;
  });
}
export function facesFromPose(result,limit=3){
  return (result?.landmarks||[]).slice(0,limit).map(points=>{
    const nose=points?.[0],le=points?.[7],re=points?.[8],eyel=points?.[2],eyer=points?.[5];
    if(!nose||!le||!re||!eyel||!eyer)return null;
    const w=Math.max(Math.abs(le.x-re.x)*1.1,Math.abs(eyel.x-eyer.x)*1.9,.055);
    return{x:nose.x,y:nose.y-.012,w:Math.min(w,.3),h:Math.min(w*1.25,.4)};
  }).filter(Boolean).sort((a,b)=>a.x-b.x);
}
function bone(ctx,a,b,w=18){
  if(!a||!b)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.strokeStyle='#191d26';ctx.lineWidth=w+13;ctx.stroke();
  ctx.strokeStyle='#a89d8a';ctx.lineWidth=w+5;ctx.stroke();
  ctx.strokeStyle='#e6e0d0';ctx.lineWidth=w;ctx.stroke();
  ctx.strokeStyle='#fffaf0';ctx.globalAlpha=.48;ctx.lineWidth=Math.max(2,w*.16);ctx.stroke();
  ctx.restore();
}
function joint(ctx,p,r=20){
  if(!p)return;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.93,0,0,Math.PI*2);
  ctx.fillStyle='#ede4d1';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#5e5551';ctx.stroke();
  ctx.beginPath();ctx.ellipse(p.x-4,p.y-5,r*.38,r*.42,0,0,7);ctx.fillStyle='#fff9e280';ctx.fill();
}
function rib(ctx,a,b,c,r,weight=11){
  ctx.save();ctx.lineWidth=weight+7;ctx.strokeStyle='#1b222b';ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(b.x,b.y,c.x,c.y,r.x,r.y);ctx.stroke();
  ctx.strokeStyle='#e7decc';ctx.lineWidth=weight;ctx.stroke();
  ctx.strokeStyle='#fff9e6';ctx.globalAlpha=.40;ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function ellipse(ctx,x,y,rx,ry,color='#e8dfd0'){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#555152';ctx.lineWidth=6;ctx.stroke();
}
function center(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function lerp(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}
function add(a,x,y){return{x:a.x+x,y:a.y+y}}
function fingers(ctx,hand,elbow){
 if(!hand||!elbow)return;
 let vx=hand.x-elbow.x,vy=hand.y-elbow.y,mag=Math.hypot(vx,vy)||1;vx/=mag;vy/=mag;
 for(let j=-2;j<=2;j++){
  let px=hand.x+(-vy)*(j*10),py=hand.y+vx*(j*10);
  bone(ctx,{x:px,y:py},{x:px+vx*33-vy*j*2,y:py+vy*33+vx*j*2},j===0?7:5);
 }
}
function foot(ctx,ankle,knee,side){
 if(!ankle||!knee)return;
 const dir=side>0?1:-1;
 bone(ctx,ankle,{x:ankle.x+dir*22,y:ankle.y+20},18);
 bone(ctx,{x:ankle.x+dir*22,y:ankle.y+20},{x:ankle.x+dir*88,y:ankle.y+28},15);
 for(let i=0;i<4;i++){
  const b={x:ankle.x+dir*(63+i*6),y:ankle.y+17+i*7};
  bone(ctx,b,{x:b.x+dir*23,y:b.y+2},5);
 }
}
function helmet(ctx,scene){
 ctx.save();ctx.translate(0,-102);
 ctx.fillStyle=scene==='moon'?'#c4d9e1':'#dca66c';ctx.strokeStyle='#4b4140';ctx.lineWidth=7;
 ctx.beginPath();ctx.moveTo(-93,22);ctx.quadraticCurveTo(-110,-64,-14,-84);ctx.quadraticCurveTo(70,-99,96,20);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=scene==='moon'?'#e6e9ea':'#d99657';ctx.beginPath();ctx.ellipse(0,19,110,19,0,0,7);ctx.fill();ctx.stroke();
 ctx.fillStyle='#283843';ctx.beginPath();ctx.roundRect(-27,-37,54,45,9);ctx.fill();ctx.strokeStyle='#fae0af';ctx.stroke();
 ctx.fillStyle='#ffdea0';ctx.shadowColor='#ffc474';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(0,-15,13,0,7);ctx.fill();ctx.shadowBlur=0;ctx.restore();
}
/**
 * Caller is responsible for translating to a poster head position and scaling.
 * Source landmarks are transformed to relative "poster skeleton" coordinates.
 */
export function drawPoseSkeleton(ctx,face,pose,{scene='shaft',faceFit=100,cutout}={}){
 if(!poseUsable(pose,face))return false;
 const l=pose;
 const sh=center(l[11],l[12]),hp=center(l[23],l[24]);
 const sy=Math.min(1700,Math.max(400,190/Math.max(.03,sh.y-face.y)));
 const sx=Math.min(1650,Math.max(430,310/Math.max(.06,Math.abs(l[12].x-l[11].x))));
 const tr=i=>{
   const p=l[i];if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||(p.visibility??1)<.25)return null;
   return{x:(p.x-face.x)*sx,y:(p.y-face.y)*sy};
 };
 const pts={ls:tr(11),rs:tr(12),le:tr(13),re:tr(14),lw:tr(15),rw:tr(16),
           lh:tr(23),rh:tr(24),lk:tr(25),rk:tr(26),la:tr(27),ra:tr(28)};
 if(!pts.ls||!pts.rs||!pts.lh||!pts.rh)return false;
 const S=center(pts.ls,pts.rs),P=center(pts.lh,pts.rh);
 const chest=lerp(S,P,.28);
 // Torso - clavicles, spine and rib pairs.
 bone(ctx,S,P,17);
 for(let i=0;i<14;i++){const p=lerp(S,P,i/13);joint(ctx,p,11)}
 bone(ctx,S,pts.ls,13);bone(ctx,S,pts.rs,13);
 for(let i=0;i<7;i++){
  const t=.17+i*.091;
  const centerR=lerp(S,P,t),w=(.52+.42*Math.sin(i/6*Math.PI));
  const ribL=add(centerR,-95*w,16);
  const ribR=add(centerR,95*w,16);
  rib(ctx,centerR,add(centerR,-41,-36),add(ribL,-17,-40),ribL,12);
  rib(ctx,centerR,add(centerR,41,-36),add(ribR,17,-40),ribR,12);
 }
 // Pelvis and leg joints.
 bone(ctx,pts.lh,pts.rh,22);
 rib(ctx,pts.lh,add(pts.lh,-30,40),add(P,-25,66),add(P,0,55),20);
 rib(ctx,pts.rh,add(pts.rh,30,40),add(P,25,66),add(P,0,55),20);
 joint(ctx,P,20);
 for(const [s,e,w] of [[pts.ls,pts.le,23],[pts.rs,pts.re,23],
                        [pts.le,pts.lw,14],[pts.re,pts.rw,14],
                        [pts.lh,pts.lk,27],[pts.rh,pts.rk,27],
                        [pts.lk,pts.la,20],[pts.rk,pts.ra,20]]){
  if(s&&e)bone(ctx,s,e,w);
 }
 for(const p of [pts.ls,pts.rs,pts.le,pts.re,pts.lw,pts.rw,pts.lh,pts.rh,pts.lk,pts.rk,pts.la,pts.ra])if(p)joint(ctx,p,15);
 fingers(ctx,pts.lw,pts.le);fingers(ctx,pts.rw,pts.re);
 foot(ctx,pts.la,pts.lk,-1);foot(ctx,pts.ra,pts.rk,1);
 // Original unmodified face, feathered; helmet is a separate layer.
 const fw=198*faceFit/100,fh=232*faceFit/100;
 ellipse(ctx,0,0,fw*.52+14,fh*.52+12,'#ccc0a9');
 if(cutout){ctx.save();ctx.shadowColor='#0c1219';ctx.shadowBlur=22;ctx.drawImage(cutout,-fw/2,-fh/2-8,fw,fh);ctx.restore()}
 rib(ctx,{x:-45,y:105},{x:-30,y:143},{x:26,y:143},{x:45,y:105},10);
 helmet(ctx,scene);
 if(scene==='moon'){ctx.save();ctx.strokeStyle='#dce9f2';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,0,119,148,0,0,7);ctx.stroke();ctx.restore()}
 return true;
}
