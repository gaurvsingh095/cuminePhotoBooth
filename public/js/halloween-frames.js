/**
 * SMEMR cinematic photo overlays. All artwork is local Canvas vector rendering;
 * originals never leave the device. No generated likeness or remote-image service.
 */
export const FRAMES = Object.freeze([
  {id:'copper',name:'Copper After Dark',accent:'#f9ae67',title:'COPPER AFTER DARK',tag:'HAUNTED MINE • 2026'},
  {id:'specter',name:'Ghost Shift',accent:'#b0f3f0',title:'GHOST SHIFT',tag:'CLOCKED IN FROM BEYOND'},
  {id:'witch',name:'Witching Hour',accent:'#d8aaeb',title:'WITCHING HOUR',tag:'THE CAULDRON CREW'},
  {id:'pumpkin',name:'Pumpkin Panic',accent:'#ffad57',title:'PUMPKIN PANIC',tag:'PICK • CARVE • REPEAT'},
  {id:'moon',name:'Midnight Miner',accent:'#a4c9ff',title:'MIDNIGHT MINER',tag:'NIGHT SHIFT AT THE MINE'},
  {id:'polaroid',name:'Cursed Polaroid',accent:'#e6d4b4',title:'THE LOST EXPEDITION',tag:'FOUND IN THE MINE • 2026'},
]);
export const CAPTIONS = Object.freeze([
  {id:'crew',text:'THE HAUNTED CREW'},
  {id:'shift',text:'SURVIVED THE NIGHT SHIFT'},
  {id:'mine',text:'I DIG HALLOWEEN'},
  {id:'boo',text:'BOO AT THE MINE'},
  {id:'none',text:''},
]);
const TAU=Math.PI*2;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const rnd=n=>{let x=Math.sin(n*91.319+17.73)*43758.5453;return x-Math.floor(x)};
function line(ctx,points,width,color){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,TAU);ctx.fillStyle=color;ctx.fill()}
function glow(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function web(ctx,x,y,scale,mirrored){
 ctx.save();ctx.translate(x,y);ctx.scale((mirrored?-1:1)*scale,scale);ctx.strokeStyle='#d8dce59e';ctx.lineWidth=2.6;
 for(let a=0;a<=5;a++){const rad=a*Math.PI/10;line(ctx,[[0,0],[Math.cos(rad)*290,Math.sin(rad)*290]],2.5,'#d8dce5a8')}
 for(const r of [62,120,185,253]){ctx.beginPath();for(let a=0;a<=5;a++){const rad=a*Math.PI/10;const px=Math.cos(rad)*r,py=Math.sin(rad)*r;if(a===0)ctx.moveTo(px,py);else ctx.quadraticCurveTo(Math.cos(rad-Math.PI/20)*r*.82,Math.sin(rad-Math.PI/20)*r*.82,px,py)}ctx.stroke()}
 ctx.restore();
}
function bat(ctx,x,y,scale,color='#0b111a'){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=color;ctx.beginPath();
 ctx.moveTo(0,8);ctx.bezierCurveTo(-17,-10,-35,-18,-55,4);ctx.quadraticCurveTo(-54,31,-77,18);ctx.quadraticCurveTo(-61,42,-43,41);ctx.quadraticCurveTo(-25,35,-9,30);
 ctx.lineTo(0,35);ctx.lineTo(9,30);ctx.quadraticCurveTo(25,35,43,41);ctx.quadraticCurveTo(61,42,77,18);ctx.quadraticCurveTo(54,31,55,4);ctx.bezierCurveTo(35,-18,17,-10,0,8);ctx.fill();ctx.restore();
}
function pumpkin(ctx,x,y,r){
 ctx.save();ctx.translate(x,y);ctx.shadowColor='#fa762c';ctx.shadowBlur=23;
 ellipse(ctx,0,0,r*.95,r*.68,'#ce652a');
 for(const a of [-.55,-.22,.22,.55]){ellipse(ctx,a*r,0,r*.29,r*.65,a>0?'#e77a34':'#b65320')}
 ctx.shadowBlur=0;ctx.fillStyle='#20301e';ctx.beginPath();ctx.moveTo(-4,-r*.64);ctx.lineTo(8,-r);ctx.lineTo(21,-r*.95);ctx.lineTo(13,-r*.55);ctx.fill();
 ctx.fillStyle='#25131a';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.11,-r*.2);ctx.lineTo(s*r*.45,-r*.3);ctx.lineTo(s*r*.28,r*.1);ctx.fill()}
 ctx.beginPath();ctx.arc(0,r*.17,r*.34,0,Math.PI);ctx.lineTo(-r*.34,r*.17);ctx.fill();ctx.restore();
}
function ghost(ctx,x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.shadowColor='#91d8e2';ctx.shadowBlur=23;
 ctx.beginPath();ctx.moveTo(-37,28);ctx.lineTo(-37,-22);ctx.bezierCurveTo(-37,-87,38,-87,38,-22);ctx.lineTo(38,28);ctx.lineTo(24,14);ctx.lineTo(9,30);ctx.lineTo(-6,16);ctx.lineTo(-22,30);ctx.closePath();
 ctx.fillStyle='#d5fcf2dd';ctx.fill();ctx.shadowBlur=0;ellipse(ctx,-12,-19,5,10,'#172939');ellipse(ctx,14,-19,5,10,'#172939');ellipse(ctx,1,3,8,9,'#172939');ctx.restore();
}
function helmet(ctx,x,y,scale){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.shadowColor='#080c16';ctx.shadowBlur=17;
 ctx.fillStyle='#dba460';ctx.strokeStyle='#4d382d';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-94,5);ctx.quadraticCurveTo(-87,-95,0,-95);ctx.quadraticCurveTo(91,-95,94,5);ctx.closePath();ctx.fill();ctx.stroke();
 ellipse(ctx,0,8,110,19,'#eeb976');ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#344452';ctx.fillRect(-29,-45,58,44);glow(ctx,0,-24,35,'#ffe5ae66');ellipse(ctx,0,-25,16,16,'#ffe4a1');ctx.restore();
}
function witchHat(ctx,x,y,scale){
 ctx.save();ctx.translate(x,y);ctx.rotate(-.075);ctx.scale(scale,scale);ctx.shadowColor='#080c15';ctx.shadowBlur=19;
 ctx.fillStyle='#352140';ctx.beginPath();ctx.moveTo(-88,3);ctx.quadraticCurveTo(-18,-80,30,-190);ctx.quadraticCurveTo(22,-118,70,-32);ctx.lineTo(93,4);ctx.closePath();ctx.fill();
 ellipse(ctx,0,2,115,23,'#41244b');ctx.fillStyle='#cc9dd6';ctx.fillRect(-55,-18,116,11);ctx.shadowBlur=0;ctx.restore();
}
function horns(ctx,x,y,scale){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.shadowColor='#c33a37';ctx.shadowBlur=12;ctx.fillStyle='#c43641';
 for(const dir of [-1,1]){ctx.beginPath();ctx.moveTo(dir*42,-18);ctx.quadraticCurveTo(dir*97,-52,dir*83,-137);ctx.quadraticCurveTo(dir*104,-100,dir*97,-36);ctx.lineTo(dir*71,0);ctx.fill()}
 ctx.restore();
}
function accessory(ctx,faces,source,box,kind){
 if(!kind||kind==='none'||!faces?.length)return;
 const ratio=Math.max(box.w/source.width,box.h/source.height);
 const dw=source.width*ratio,dh=source.height*ratio;
 const ox=box.x+(box.w-dw)/2,oy=box.y+(box.h-dh)/2;
 ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();
 for(const f of faces.slice(0,3)){
  const x=ox+f.x*dw,y=oy+f.y*dh,w=clamp(f.w*dw,66,260),h=clamp(f.h*dh,90,340);
  // Avoid drawing accessories for completely cropped-out faces.
  if(x<box.x-80||x>box.x+box.w+80||y<box.y-90||y>box.y+box.h+100)continue;
  if(kind==='helmet')helmet(ctx,x,y-h*.65,clamp(w/200,.38,1.55));
  if(kind==='witch')witchHat(ctx,x,y-h*.63,clamp(w/190,.4,1.5));
  if(kind==='horns')horns(ctx,x,y-h*.68,clamp(w/180,.38,1.4));
  if(kind==='glow'){
    ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,x-w*.19,y-h*.07,w*.27,'#df394abb');glow(ctx,x+w*.19,y-h*.07,w*.27,'#df394abb');ctx.restore();
  }
 }
 ctx.restore();
}
function drawScene(ctx,theme,intensity){
 const amount=clamp(intensity/100,0,1);
 ctx.save();ctx.globalAlpha=amount;
 if(theme==='moon'){glow(ctx,900,280,610,'#b2c9ff48');for(let i=0;i<55;i++){let x=rnd(i+99)*1200,y=rnd(i+27)*1000;ellipse(ctx,x,y,1+rnd(i+19)*2,1+rnd(i+19)*2,'#f5fbff88')}}
 if(theme==='copper'||theme==='pumpkin'){glow(ctx,110,450,510,'#e8803d62');glow(ctx,1090,930,410,'#fc8b4f50')}
 if(theme==='specter'||theme==='witch'){glow(ctx,150,440,550,theme==='witch'?'#aa66c759':'#78d6ca59');glow(ctx,1080,940,480,'#a3ddf636')}
 // Local fog bands and motes, fixed seed (consistent image output).
 for(let i=0;i<9;i++){ctx.save();ctx.globalAlpha=.035+.042*amount;ctx.translate(140+rnd(i+10)*930,420+rnd(i+70)*880);ctx.rotate(rnd(i+111)*.38-.19);ctx.scale(2,.28);
  const g=ctx.createRadialGradient(0,0,0,0,0,270);g.addColorStop(0,'#e7e8e8');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,270,0,TAU);ctx.fill();ctx.restore()}
 ctx.restore();
}
function drawPhoto(ctx,source,box,filter){
 const ratio=Math.max(box.w/source.width,box.h/source.height);
 const dw=source.width*ratio,dh=source.height*ratio;
 const x=box.x+(box.w-dw)/2,y=box.y+(box.h-dh)/2;
 ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();
 const filters={cinema:'contrast(1.12) saturate(.84) brightness(.93)',natural:'none',copper:'sepia(.25) saturate(1.27) contrast(1.06)',moon:'saturate(.75) hue-rotate(14deg) contrast(1.09) brightness(.91)'};
 ctx.filter=filters[filter]||filters.cinema;ctx.drawImage(source,x,y,dw,dh);ctx.filter='none';ctx.restore();
}
export function drawAugmentedFrame(ctx,source,{theme='copper',filter='cinema',intensity=65,caption='crew',faces=[],accessoryKind='none'}={}){
 const W=ctx.canvas.width,H=ctx.canvas.height;
 const frame=FRAMES.find(f=>f.id===theme)||FRAMES[0];
 const photo={x:65,y:190,w:1070,h:1070};
 ctx.save();
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#111b29');bg.addColorStop(1,'#060a11');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // Matte around the real photo is deliberately visible in the export.
 ctx.shadowColor='#000e';ctx.shadowBlur=46;ctx.fillStyle='#101923';ctx.fillRect(photo.x-15,photo.y-15,photo.w+30,photo.h+30);ctx.shadowBlur=0;
 drawPhoto(ctx,source,photo,filter);
 ctx.save();ctx.beginPath();ctx.rect(photo.x,photo.y,photo.w,photo.h);ctx.clip();
 const shade=ctx.createLinearGradient(0,photo.y,0,photo.y+photo.h);shade.addColorStop(0,'#040715aa');shade.addColorStop(.25,'#050a1500');shade.addColorStop(.75,'#050a1515');shade.addColorStop(1,'#060913ce');ctx.fillStyle=shade;ctx.fillRect(photo.x,photo.y,photo.w,photo.h);
 drawScene(ctx,theme,intensity);
 ctx.restore();
 accessory(ctx,faces,source,photo,accessoryKind);
 ctx.strokeStyle=frame.accent;ctx.lineWidth=7;ctx.strokeRect(photo.x,photo.y,photo.w,photo.h);
 ctx.strokeStyle='#ffffff5b';ctx.lineWidth=2;ctx.strokeRect(photo.x+15,photo.y+15,photo.w-30,photo.h-30);
 if(theme==='witch'){web(ctx,photo.x,photo.y,1.1,false);web(ctx,photo.x+photo.w,photo.y,1.1,true);}
 else if(theme==='specter'){ghost(ctx,160,1120,1.3);ghost(ctx,1030,1025,.8);}
 else if(theme==='pumpkin'){pumpkin(ctx,162,1163,112);pumpkin(ctx,1030,1168,95);}
 else if(theme==='moon'){for(let i=0;i<5;i++)bat(ctx,140+i*200,300+rnd(i+5)*140,.7,'#070f24');}
 else if(theme==='polaroid'){ctx.strokeStyle='#f0e8d5';ctx.lineWidth=17;ctx.strokeRect(photo.x-9,photo.y-9,photo.w+18,photo.h+18);web(ctx,photo.x,photo.y,.75,false);}
 else {for(let i=0;i<5;i++)bat(ctx,160+i*205,280+rnd(i+8)*170,.7);pumpkin(ctx,111,1164,80);}
 // Theme-specific accent texture (screen-print style), no random networks.
 ctx.fillStyle='#ffffff';for(let i=0;i<300;i++){const x=rnd(i+45)*W,y=rnd(i+77)*H;ctx.globalAlpha=.015+rnd(i+107)*.04;ctx.fillRect(x,y,2,2)}ctx.globalAlpha=1;
 ctx.fillStyle='#0c234b';ctx.fillRect(0,0,W,15);ctx.fillStyle='#ab0520';ctx.fillRect(0,0,280,15);
 ctx.textAlign='center';ctx.fillStyle='#e6ddd0';ctx.font='700 24px Arial,sans-serif';ctx.fillText('THE UNIVERSITY OF ARIZONA / SMEMR',600,65);
 ctx.font='bold 74px Impact,Arial,sans-serif';ctx.fillStyle=frame.accent;ctx.fillText(frame.title,600,139);
 const cap=CAPTIONS.find(x=>x.id===caption)?.text||'';
 if(cap){ctx.fillStyle='#f5e6d6';ctx.font='bold 52px Impact,Arial,sans-serif';ctx.fillText(cap,600,1199,990);}
 ctx.fillStyle='#0b131f';ctx.fillRect(0,1300,W,200);
 ctx.strokeStyle=frame.accent;ctx.lineWidth=3;line(ctx,[[84,1330],[1116,1330]],3,frame.accent);
 ctx.fillStyle='#f6e5c9';ctx.font='bold 44px Impact,Arial,sans-serif';ctx.fillText(frame.tag,600,1401,1060);
 ctx.font='500 20px Arial,sans-serif';ctx.fillStyle='#c5d0d9';ctx.fillText('CU AT THE MINE  •  HALLOWEEN 2026',600,1450);
 ctx.restore();
}
