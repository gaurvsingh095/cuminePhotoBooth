/**
 * SMEMR Photo Booth — templates.js v6
 * Includes 5 Cu at the Mine! event banner templates (image-based)
 * + 12 standard canvas-art templates
 */

// ── TEMPLATE DEFINITIONS ─────────────────────────────────────────────────
const TEMPLATES = [
  // ── Cu at the Mine 2026 — IMAGE BANNER TEMPLATES ─────────────────────
  { id:'cu-educators-dark',    name:'AZ Educators at the Mine — Sunset', cat:'cu2026', tag:'Cu at the Mine',
    accent:'#C49A1B', bg:['#1a0800','#060200'], g:['#1a0800','#060200'], art:'cu2026',
    bannerSrc:'assets/banners/cu-educators-dark.png', hot:true, featured:true,
    bannerPos:'bottom' },

  { id:'cu-educators-vintage', name:'AZ Educators at the Mine — Vintage', cat:'cu2026', tag:'Cu at the Mine',
    accent:'#B87333', bg:['#2a1600','#0e0800'], g:['#2a1600','#0e0800'], art:'canyon',
    bannerSrc:'assets/banners/cu-educators-vintage.png', hot:true,
    bannerPos:'bottom' },

  { id:'cu-dig-discovery',     name:'Arizona Teachers Dig Discovery!', cat:'cu2026', tag:'Cu at the Mine',
    accent:'#C49A1B', bg:['#1a0c00','#060300'], g:['#1a0c00','#060300'], art:'cu2026',
    bannerSrc:'assets/banners/cu-dig-discovery.png', hot:false,
    bannerPos:'bottom' },

  { id:'cu-teachers-rock',     name:'Arizona Teachers Rock!', cat:'cu2026', tag:'Cu at the Mine',
    accent:'#B87333', bg:['#0a1818','#020808'], g:['#0a1818','#020808'], art:'circuit',
    bannerSrc:'assets/banners/cu-teachers-rock.png', hot:false,
    bannerPos:'bottom' },

  { id:'cu-mine-classic',      name:'Cu at the Mine — Clean', cat:'cu2026', tag:'Cu at the Mine',
    accent:'#B87333', bg:['#1a1208','#080604'], g:['#1a1208','#080604'], art:'crystals',
    bannerSrc:'assets/banners/cu-mine-classic.png', hot:false,
    bannerPos:'bottom' },

  // ── Cu at the Mine 2026 — canvas art fallback ─────────────────────────
  { id:'cu-at-the-mine-2026',  name:'Cu at the Mine 2026',    cat:'cu2026',   tag:'Cu at the Mine',
    bg:'#1a0800', accent:'#C49A1B', g:['#2a1200','#0d0600'], art:'cu2026', hot:false,
    subtitle:'Professional Development Summer Academy', event:'Cu at the Mine 2026' },

  // ── Standard templates ────────────────────────────────────────────────
  { id:'smemr-classic',    name:'Classic SMEMR Frame',       cat:'classic',  tag:'SMEMR Classic', bg:'#0C234B', accent:'#AB0520', g:['#0C234B','#07132e'], art:'chevron',   hot:false },
  { id:'mine-engineer',    name:'Future Mining Engineer',    cat:'mining',   tag:'Mining',        bg:'#180828', accent:'#AB0520', g:['#2a0a42','#0d0215'], art:'blueprint', hot:true  },
  { id:'az-copper',        name:'Arizona Copper Explorer',   cat:'minerals', tag:'Minerals',      bg:'#1e0e00', accent:'#C49A1B', g:['#3d1e00','#160900'], art:'crystals',  hot:true  },
  { id:'powered-minerals', name:'Powered by Minerals',       cat:'minerals', tag:'Minerals',      bg:'#001220', accent:'#C49A1B', g:['#002040','#000810'], art:'hexgrid',   hot:false },
  { id:'moon-mining',      name:'Mining the Moon',           cat:'space',    tag:'Space Mining',  bg:'#040415', accent:'#e8c050', g:['#080830','#020210'], art:'lunar',     hot:false },
  { id:'underground',      name:'Underground Mine Scene',    cat:'mining',   tag:'Mining',        bg:'#0a0800', accent:'#AB0520', g:['#1a1400','#060500'], art:'tunnel',    hot:false },
  { id:'wildcat-science',  name:'Wildcat Science Day',       cat:'family',   tag:'Family Fun',    bg:'#1a0519', accent:'#AB0520', g:['#2e0630','#0f0110'], art:'paws',      hot:false },
  { id:'stem-explorer',    name:'STEM Explorer',             cat:'family',   tag:'Family Fun',    bg:'#001910', accent:'#2dba5a', g:['#003820','#000e08'], art:'atoms',     hot:false },
  { id:'lunar-base',       name:'Lunar Mining Base',         cat:'space',    tag:'Space Mining',  bg:'#030416', accent:'#e8c050', g:['#06082a','#020210'], art:'spacegrid', hot:false },
  { id:'virtual-lab',      name:'Virtual Lab Explorer',      cat:'classic',  tag:'SMEMR Classic', bg:'#0C234B', accent:'#2a8fd4', g:['#143a7a','#061228'], art:'circuit',   hot:false },
  { id:'az-landscape',     name:'Arizona Mining Landscape',  cat:'mining',   tag:'Mining',        bg:'#1a0c00', accent:'#C49A1B', g:['#361800','#0e0700'], art:'canyon',    hot:false },
  { id:'mineral-wall',     name:'Mineral Discovery',         cat:'minerals', tag:'Minerals',      bg:'#14002a', accent:'#c060f0', g:['#260046','#0a0016'], art:'gems',      hot:false },
];

const CATS = ['all','cu2026','mining','minerals','space','family','classic'];

// ── HELPERS ───────────────────────────────────────────────────────────────
function hexRgba(hex, a) {
  if (!hex?.startsWith('#')) return `rgba(128,128,128,${a})`;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ── IMAGE LOADER ──────────────────────────────────────────────────────────
const _imgCache = {};
function loadImg(src) {
  if (_imgCache[src]) return Promise.resolve(_imgCache[src]);
  return new Promise(res => {
    const img = new Image();
    img.onload  = () => { _imgCache[src] = img; res(img); };
    img.onerror = () => res(null);
    img.src     = src;
  });
}

// ── ART GENERATORS ────────────────────────────────────────────────────────
const Art = {
  cu2026(ctx, w, h, accent) {
    ctx.save();
    const sky=ctx.createLinearGradient(0,0,w,h); sky.addColorStop(0,'#1a0800'); sky.addColorStop(.5,'#2d1200'); sky.addColorStop(1,'#0d0600');
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.22; ctx.strokeStyle=accent; ctx.lineWidth=2.5; ctx.shadowColor=accent; ctx.shadowBlur=8;
    [[.08,.6,.35,.2,.62,.55,.9,.15],[.0,.8,.28,.45,.6,.7,.92,.35]].forEach(p=>{ctx.beginPath();ctx.moveTo(p[0]*w,p[1]*h);ctx.bezierCurveTo(p[2]*w,p[3]*h,p[4]*w,p[5]*h,p[6]*w,p[7]*h);ctx.stroke();});
    ctx.shadowBlur=0;
    const nodes=[[.5,.42],[.5-.18,.42-.11],[.5+.18,.42-.11],[.5+.18,.42+.11],[.5-.18,.42+.11],[.5,.42-.22],[.5,.42+.22]];
    const edges=[[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1],[1,5],[2,5],[3,6],[4,6]];
    ctx.strokeStyle=accent; ctx.lineWidth=1.8; ctx.globalAlpha=.45;
    edges.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(nodes[a][0]*w,nodes[a][1]*h);ctx.lineTo(nodes[b][0]*w,nodes[b][1]*h);ctx.stroke();});
    nodes.forEach((n,i)=>{ctx.globalAlpha=i===0?.95:.7;ctx.fillStyle=i===0?accent:'#fff';ctx.shadowColor=accent;ctx.shadowBlur=i===0?18:8;ctx.beginPath();ctx.arc(n[0]*w,n[1]*h,i===0?9:5,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=.08; ctx.fillStyle=accent; ctx.font=`bold ${h*.55}px Oswald,sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Cu',w*.5,h*.5);
    const sun=ctx.createRadialGradient(w*.82,h*.78,0,w*.82,h*.78,h*.35); sun.addColorStop(0,hexRgba(accent,.35)); sun.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalAlpha=1; ctx.fillStyle=sun; ctx.fillRect(0,0,w,h);
    ctx.restore();
  },
  chevron(ctx,w,h,accent){ctx.save();for(let i=-h;i<w+h;i+=32){ctx.globalAlpha=.10;ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+16,0);ctx.lineTo(i+16+h*.5,h);ctx.lineTo(i+h*.5,h);ctx.closePath();ctx.fill();}ctx.globalAlpha=.06;ctx.fillStyle='#fff';ctx.font=`bold ${h*.95}px 'Oswald',sans-serif`;ctx.textBaseline='bottom';ctx.textAlign='right';ctx.fillText('A',w+12,h+8);ctx.restore();},
  blueprint(ctx,w,h,accent){ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#5cf';ctx.lineWidth=.8;for(let x=0;x<w;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}const cx=w*.5,cy=h*.44;ctx.globalAlpha=.85;ctx.strokeStyle='#5cf';ctx.lineWidth=3.5;ctx.lineCap='round';ctx.shadowColor='#5cf';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(cx-w*.28,cy+h*.28);ctx.lineTo(cx+w*.28,cy-h*.28);ctx.stroke();ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(cx+w*.28,cy-h*.28);ctx.bezierCurveTo(cx+w*.44,cy-h*.46,cx+w*.37,cy-h*.52,cx+w*.12,cy-h*.44);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+w*.28,cy-h*.28);ctx.bezierCurveTo(cx+w*.18,cy-h*.44,cx-w*.04,cy-h*.36,cx-w*.04,cy-h*.18);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#5cf';[[cx+w*.28,cy-h*.28],[cx-w*.28,cy+h*.28]].forEach(([px,py])=>{ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();});ctx.restore();},
  crystals(ctx,w,h,accent){ctx.save();const hex=(cx,cy,r,a)=>{ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=accent;ctx.lineWidth=2.5;ctx.shadowColor=accent;ctx.shadowBlur=12;ctx.beginPath();for(let i=0;i<6;i++){const ang=Math.PI/3*i-Math.PI/6;i===0?ctx.moveTo(cx+r*Math.cos(ang),cy+r*Math.sin(ang)):ctx.lineTo(cx+r*Math.cos(ang),cy+r*Math.sin(ang));}ctx.closePath();ctx.stroke();ctx.globalAlpha=a*.18;ctx.fillStyle=accent;ctx.fill();ctx.restore();};const m=Math.min(w,h);hex(w*.18,h*.22,m*.18,.9);hex(w*.78,h*.28,m*.13,.85);hex(w*.52,h*.14,m*.09,.7);hex(w*.82,h*.72,m*.14,.8);hex(w*.22,h*.74,m*.11,.7);hex(w*.58,h*.62,m*.07,.5);ctx.globalAlpha=.28;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.shadowBlur=0;ctx.beginPath();[[w*.18,h*.22],[w*.78,h*.28],[w*.52,h*.14],[w*.82,h*.72],[w*.22,h*.74]].forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.stroke();ctx.restore();},
  hexgrid(ctx,w,h,accent){ctx.save();const step=Math.min(w,h)*.15;for(let x=step*.5;x<w;x+=step)for(let y=step*.5;y<h;y+=step){const r=step*.4;ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=accent;ctx.lineWidth=1.8;ctx.shadowColor=accent;ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y-r*.3);ctx.lineTo(x+r*.7,y+r*.3);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y+r*.3);ctx.lineTo(x-r*.7,y-r*.3);ctx.closePath();ctx.stroke();ctx.globalAlpha=.1;ctx.fillStyle=accent;ctx.fill();ctx.restore();}ctx.restore();},
  lunar(ctx,w,h,accent){ctx.save();for(let i=0;i<100;i++){const x=Math.random()*w,y=Math.random()*h*.65,r=Math.random()*1.8+.3;ctx.globalAlpha=Math.random()*.8+.2;ctx.fillStyle=r>1.2?accent:'#fff';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowColor=accent;ctx.shadowBlur=30;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(w*.78,h*.22,h*.14,0,Math.PI*2);ctx.fill();const dg=ctx.createRadialGradient(w*.84,h*.16,0,w*.84,h*.16,h*.13);dg.addColorStop(0,hexRgba('#040415',1));dg.addColorStop(1,hexRgba('#040415',0));ctx.fillStyle=dg;ctx.beginPath();ctx.arc(w*.84,h*.16,h*.11,0,Math.PI*2);ctx.fill();ctx.restore();},
  tunnel(ctx,w,h,accent){ctx.save();const cx=w/2,cy=h*.52;for(let i=0;i<7;i++){const r=(Math.min(w,h)*.46)-i*Math.min(w,h)*.055;ctx.globalAlpha=.14+i*.045;ctx.strokeStyle=i<3?accent:'#998877';ctx.lineWidth=2;ctx.shadowColor=i<2?accent:'transparent';ctx.shadowBlur=i<2?10:0;ctx.beginPath();ctx.arc(cx,cy+h*.12,r,Math.PI,0);ctx.stroke();}ctx.shadowBlur=0;ctx.globalAlpha=.65;ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.33,h);ctx.lineTo(cx-w*.03,h*.56);ctx.stroke();ctx.beginPath();ctx.moveTo(w*.67,h);ctx.lineTo(cx+w*.03,h*.56);ctx.stroke();for(let t=0;t<4;t++){const ty=h*.6+t*(h*.4/4),sp=(ty-h*.56)/(h*.44)*w*.17;ctx.globalAlpha=.3;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx-sp,ty);ctx.lineTo(cx+sp,ty);ctx.stroke();}const glow=ctx.createRadialGradient(cx,h*.52,0,cx,h*.52,Math.min(w,h)*.28);glow.addColorStop(0,hexRgba(accent,.4));glow.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1;ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.restore();},
  paws(ctx,w,h,accent){ctx.save();const paw=(x,y,s,angle)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.shadowColor=accent;ctx.shadowBlur=12;ctx.globalAlpha=.58;ctx.fillStyle=accent;ctx.beginPath();ctx.ellipse(0,0,s*.55,s*.7,0,0,Math.PI*2);ctx.fill();[[-s*.65,-s*1.1],[0,-s*1.3],[s*.65,-s*1.1],[-s*1.2,-s*.4]].forEach(([tx,ty])=>{ctx.beginPath();ctx.ellipse(tx,ty,s*.38,s*.45,0,0,Math.PI*2);ctx.fill();});ctx.restore();};const m=Math.min(w,h);paw(w*.2,h*.3,m*.07,.2);paw(w*.76,h*.22,m*.065,-.3);paw(w*.55,h*.68,m*.06,.1);ctx.restore();},
  atoms(ctx,w,h,accent){ctx.save();const nodes=[[.5,.38],[.24,.56],[.76,.56],[.5,.74],[.28,.24],[.72,.24]];const edges=[[0,1],[0,2],[0,3],[1,3],[2,3],[0,4],[0,5],[4,5],[1,4],[2,5]];ctx.strokeStyle=accent;ctx.lineWidth=1.5;edges.forEach(([a,b])=>{ctx.globalAlpha=.32;ctx.beginPath();ctx.moveTo(nodes[a][0]*w,nodes[a][1]*h);ctx.lineTo(nodes[b][0]*w,nodes[b][1]*h);ctx.stroke();});nodes.forEach((n,i)=>{ctx.save();ctx.globalAlpha=.95;ctx.fillStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(n[0]*w,n[1]*h,i===0?9:5.5,0,Math.PI*2);ctx.fill();ctx.restore();});ctx.globalAlpha=.2;ctx.strokeStyle=accent;ctx.lineWidth=1;[0,Math.PI/3,2*Math.PI/3].forEach(rot=>{ctx.save();ctx.translate(w*.5,h*.46);ctx.rotate(rot);ctx.beginPath();ctx.ellipse(0,0,w*.38,h*.24,0,0,Math.PI*2);ctx.stroke();ctx.restore();});ctx.restore();},
  spacegrid(ctx,w,h,accent){ctx.save();ctx.strokeStyle=accent;ctx.lineWidth=.8;ctx.globalAlpha=.18;for(let x=0;x<w;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}ctx.globalAlpha=1;const horiz=ctx.createLinearGradient(0,h*.55,0,h);horiz.addColorStop(0,'rgba(0,0,0,0)');horiz.addColorStop(1,hexRgba(accent,.45));ctx.fillStyle=horiz;ctx.fillRect(0,h*.55,w,h);ctx.globalAlpha=.65;ctx.fillStyle=hexRgba(accent,.3);ctx.shadowColor=accent;ctx.shadowBlur=22;ctx.beginPath();ctx.arc(w*.2,h*.25,Math.min(w,h)*.13,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=hexRgba(accent,.8);ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(w*.2,h*.25,Math.min(w,h)*.22,Math.min(w,h)*.065,-.3,0,Math.PI*2);ctx.stroke();ctx.restore();},
  circuit(ctx,w,h,accent){ctx.save();const pts=[[.08,.28],[.28,.28],[.28,.55],[.55,.55],[.55,.18],[.82,.18],[.82,.48],[.55,.48],[.55,.75],[.82,.75],[.18,.75],[.18,.48]];ctx.strokeStyle=accent;ctx.lineWidth=1.8;ctx.lineCap='square';ctx.shadowColor=accent;ctx.shadowBlur=10;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);pts.slice(1,9).forEach(p=>ctx.lineTo(p[0]*w,p[1]*h));ctx.stroke();ctx.beginPath();ctx.moveTo(pts[7][0]*w,pts[7][1]*h);ctx.lineTo(pts[10][0]*w,pts[10][1]*h);ctx.lineTo(pts[11][0]*w,pts[11][1]*h);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=accent;ctx.shadowBlur=14;pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0]*w,p[1]*h,3.5,0,Math.PI*2);ctx.fill();});ctx.restore();},
  canyon(ctx,w,h,accent){ctx.save();const sky=ctx.createLinearGradient(0,0,w,h*.55);sky.addColorStop(0,'#0d0600');sky.addColorStop(1,'#3d1800');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.55);const sun=ctx.createRadialGradient(w*.62,h*.22,0,w*.62,h*.22,h*.32);sun.addColorStop(0,hexRgba(accent,.9));sun.addColorStop(.3,hexRgba(accent,.28));sun.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,w,h*.62);ctx.fillStyle='#2a1400';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,h*.3);ctx.lineTo(w*.12,h*.18);ctx.lineTo(w*.22,h*.32);ctx.lineTo(w*.32,h*.12);ctx.lineTo(w*.42,h*.42);ctx.lineTo(w*.5,h*.55);ctx.lineTo(w*.5,h);ctx.closePath();ctx.fill();ctx.fillStyle='#1e0e00';ctx.beginPath();ctx.moveTo(w,h);ctx.lineTo(w,h*.28);ctx.lineTo(w*.88,h*.16);ctx.lineTo(w*.75,h*.30);ctx.lineTo(w*.63,h*.14);ctx.lineTo(w*.52,h*.44);ctx.lineTo(w*.5,h*.55);ctx.lineTo(w*.5,h);ctx.closePath();ctx.fill();const glow=ctx.createLinearGradient(0,h*.7,0,h);glow.addColorStop(0,'rgba(0,0,0,0)');glow.addColorStop(1,hexRgba(accent,.22));ctx.fillStyle=glow;ctx.fillRect(0,h*.7,w,h);ctx.restore();},
  gems(ctx,w,h,accent){ctx.save();const gem=(cx,cy,r,rot,color)=>{for(let i=0;i<7;i++){const a1=(Math.PI*2/7)*i+rot,a2=(Math.PI*2/7)*(i+.5)+rot;ctx.globalAlpha=.14+(i%3)*.1;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a1),cy+r*Math.sin(a1));ctx.lineTo(cx+r*Math.cos(a2)*.65,cy+r*Math.sin(a2)*.65);ctx.closePath();ctx.fill();}ctx.globalAlpha=.65;ctx.fillStyle='#fff';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(cx,cy,r*.08,0,Math.PI*2);ctx.fill();};const m=Math.min(w,h);gem(w*.22,h*.26,m*.22,0,accent);gem(w*.76,h*.22,m*.16,.5,'#fff');gem(w*.6,h*.7,m*.14,1.2,accent);gem(w*.18,h*.7,m*.1,.8,'#fff');ctx.restore();},
};

// ── THUMBNAIL RENDERER ────────────────────────────────────────────────────
function renderTemplateThumbnail(canvas, tmpl) {
  canvas.width = 180; canvas.height = 120;
  const ctx = canvas.getContext('2d'), w=180, h=120;

  // Background
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, tmpl.g[0]); g.addColorStop(1, tmpl.g[1]);
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

  const drawLabel = () => {
    ctx.fillStyle = 'rgba(0,0,0,0.68)'; ctx.fillRect(0, h-24, w, 24);
    ctx.fillStyle = tmpl.accent; ctx.fillRect(0, h-24, w, 2);
    ctx.font = '600 9.5px Oswald,sans-serif';
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(tmpl.name, w/2, h-12);
  };

  if (tmpl.bannerSrc) {
    // Show banner image preview at bottom of thumbnail
    loadImg(tmpl.bannerSrc).then(img => {
      if (!img) { (Art[tmpl.art]||Art.chevron)(ctx,w,h,tmpl.accent); drawLabel(); return; }
      // Draw banner filling the bottom 45% of thumbnail
      const ZONE_H = h * 0.48;
      const ZONE_Y = h - ZONE_H;
      const scale  = w / img.naturalWidth;
      const drawH  = img.naturalHeight * scale;
      // If banner is shorter than zone, zoom up
      const zoom   = Math.max(ZONE_H / drawH, 1);
      const fW = w * zoom, fH = drawH * zoom;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, ZONE_Y, w, ZONE_H); ctx.clip();
      ctx.drawImage(img, (w-fW)/2, h-fH, fW, fH);
      ctx.restore();
      // Soft gradient between top canvas-art and banner
      const fade = ctx.createLinearGradient(0, ZONE_Y-10, 0, ZONE_Y+20);
      fade.addColorStop(0,'rgba(0,0,0,0)'); fade.addColorStop(1,'rgba(0,0,0,0.4)');
      ctx.fillStyle = fade; ctx.fillRect(0, ZONE_Y-10, w, 30);
      drawLabel();
    });
    // Draw art in top half while image loads
    (Art[tmpl.art]||Art.chevron)(ctx, w, h*0.55, tmpl.accent);
  } else {
    (Art[tmpl.art]||Art.chevron)(ctx, w, h, tmpl.accent);
    drawLabel();
  }
}

// ── STANDARD COMPOSITOR ───────────────────────────────────────────────────
function compositeImage(photoCanvas, tmpl, opts={}) {
  const {
    eventName='Cu at the Mine 2026', showDate=true,
    outputW=1080, outputH=1350,
    bannerImg=null, frameIndex=0, totalFrames=1,
  } = opts;

  const out = document.createElement('canvas');
  out.width=outputW; out.height=outputH;
  const ctx = out.getContext('2d');

  if (bannerImg) {
    _compositeWithBanner(ctx, photoCanvas, tmpl, bannerImg, outputW, outputH, opts);
  } else {
    _compositeStandard(ctx, photoCanvas, tmpl, outputW, outputH, opts);
  }

  // Frame counter badge (collage/multi-shot)
  if (totalFrames > 1) {
    ctx.fillStyle='rgba(0,0,0,0.65)'; roundRect(ctx,outputW-94,14,78,34,8); ctx.fill();
    ctx.font='bold 18px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(`${frameIndex+1} / ${totalFrames}`, outputW-55, 31);
  }

  return out;
}

// ── BANNER COMPOSITOR ─────────────────────────────────────────────────────
function _compositeWithBanner(ctx, photo, tmpl, banner, W, H, opts) {
  const { eventName, showDate } = opts;

  // 1. Dark background fill
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0, tmpl.g[0]); bg.addColorStop(1, tmpl.g[1]);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // 2. Banner strip at bottom
  const BANNER_H  = 400;  // pixels reserved for banner at bottom
  const BANNER_Y  = H - BANNER_H;

  // Scale banner to fill full width, potentially cropping height
  const bScale = W / banner.naturalWidth;
  const bDrawH = banner.naturalHeight * bScale;
  // If banner draws shorter than zone, zoom up
  const zoom   = Math.max(BANNER_H / bDrawH, 1.0);
  const fW     = W * zoom;
  const fH     = bDrawH * zoom;

  ctx.save();
  ctx.beginPath(); ctx.rect(0, BANNER_Y, W, BANNER_H); ctx.clip();
  ctx.drawImage(banner, (W-fW)/2, H-fH, fW, fH);
  ctx.restore();

  // 3. User photo — fills top portion, fades into banner
  const PHOTO_TOP = 0;
  const PHOTO_BOT = BANNER_Y + 80; // slight overlap into banner zone
  const PHOTO_H   = PHOTO_BOT - PHOTO_TOP;

  const srcW = photo.width||1280, srcH = photo.height||960;
  const sc   = Math.max(W/srcW, PHOTO_H/srcH);
  const dW   = srcW*sc, dH = srcH*sc;

  ctx.save();
  ctx.beginPath(); ctx.rect(0, PHOTO_TOP, W, PHOTO_H); ctx.clip();
  ctx.drawImage(photo, (W-dW)/2, PHOTO_TOP+(PHOTO_H-dH)/2, dW, dH);
  ctx.restore();

  // 4. Gradient: photo → banner blend
  const fade = ctx.createLinearGradient(0, BANNER_Y-100, 0, BANNER_Y+80);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle=fade; ctx.fillRect(0, BANNER_Y-100, W, 180);

  // 5. Minimal top header (UA brand)
  const topFade = ctx.createLinearGradient(0,0,0,80);
  topFade.addColorStop(0,'rgba(0,0,0,0.72)'); topFade.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=topFade; ctx.fillRect(0,0,W,80);
  ctx.fillStyle='#AB0520'; ctx.fillRect(0,0,W,5);
  ctx.font='500 17px Oswald,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.textBaseline='middle'; ctx.textAlign='left';
  ctx.fillText('SCHOOL OF MINING ENGINEERING & MINERAL RESOURCES', 18, 36);
  ctx.font='400 15px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent;
  ctx.textAlign='right';
  if (showDate) ctx.fillText(new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), W-18, 36);
}

// ── STANDARD COMPOSITOR (canvas art) ─────────────────────────────────────
function _compositeStandard(ctx, photo, tmpl, W, H, opts) {
  const { eventName='Cu at the Mine 2026', showDate=true } = opts;

  // Background
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,tmpl.g[0]); bg.addColorStop(1,tmpl.g[1]);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Art
  (Art[tmpl.art]||Art.chevron)(ctx, W, H, tmpl.accent);

  // Atmosphere glow
  const glow=ctx.createRadialGradient(W*.25,H*.35,0,W*.25,H*.35,W*.55);
  glow.addColorStop(0,hexRgba(tmpl.accent,.13)); glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);

  // Photo (cover fit, clipped)
  const PHOTO_TOP=96, PHOTO_BOT=H-190, PHOTO_H=PHOTO_BOT-PHOTO_TOP;
  const srcW=photo.width||1280, srcH=photo.height||960;
  const sc=Math.max(W/srcW,PHOTO_H/srcH);
  const dW=srcW*sc, dH=srcH*sc;
  ctx.save();
  ctx.beginPath(); ctx.rect(0,PHOTO_TOP,W,PHOTO_H); ctx.clip();
  ctx.drawImage(photo,(W-dW)/2,PHOTO_TOP+(PHOTO_H-dH)/2,dW,dH);
  ctx.restore();

  // Photo fades
  const topFade=ctx.createLinearGradient(0,PHOTO_TOP,0,PHOTO_TOP+80);
  topFade.addColorStop(0,hexRgba(tmpl.g[0],.7)); topFade.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=topFade; ctx.fillRect(0,PHOTO_TOP,W,80);
  const botFade=ctx.createLinearGradient(0,PHOTO_BOT-120,0,PHOTO_BOT+20);
  botFade.addColorStop(0,'rgba(0,0,0,0)'); botFade.addColorStop(1,hexRgba(tmpl.g[1],.95));
  ctx.fillStyle=botFade; ctx.fillRect(0,PHOTO_BOT-120,W,140);

  // Header
  const hGrad=ctx.createLinearGradient(0,0,0,92);
  hGrad.addColorStop(0,'rgba(0,0,0,0.82)'); hGrad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=hGrad; ctx.fillRect(0,0,W,92);
  ctx.fillStyle='#AB0520'; ctx.fillRect(0,0,W,6);
  ctx.font='bold 62px Oswald,sans-serif'; ctx.fillStyle='#AB0520';
  ctx.textBaseline='middle'; ctx.textAlign='left';
  ctx.shadowColor='rgba(171,5,32,0.5)'; ctx.shadowBlur=12;
  ctx.fillText('A',26,52); ctx.shadowBlur=0;
  ctx.font='600 18px Oswald,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.48)';
  ctx.fillText('THE UNIVERSITY OF ARIZONA',96,30);
  ctx.font='600 22px Oswald,sans-serif'; ctx.fillStyle='#fff';
  ctx.fillText('School of Mining Engineering & Mineral Resources',96,56);

  // Footer
  _drawStandardFooter(ctx, W, H, tmpl, eventName, showDate);
}

function _drawStandardFooter(ctx, W, H, tmpl, eventName, showDate) {
  const fY=H-180;
  const grad=ctx.createLinearGradient(0,fY-40,0,H);
  grad.addColorStop(0,'rgba(0,0,0,0)'); grad.addColorStop(.35,hexRgba(tmpl.bg||tmpl.g[1],.92)); grad.addColorStop(1,tmpl.bg||tmpl.g[1]);
  ctx.fillStyle=grad; ctx.fillRect(0,fY-40,W,220);

  if (tmpl.id === 'cu-at-the-mine-2026') {
    ctx.font='bold 58px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent;
    ctx.textBaseline='bottom'; ctx.textAlign='left';
    ctx.shadowColor=tmpl.accent; ctx.shadowBlur=14;
    ctx.fillText('Cu at the Mine',44,H-96); ctx.shadowBlur=0;
    ctx.font='600 26px Oswald,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.72)';
    ctx.fillText('Professional Development Summer Academy',44,H-60);
    ctx.font='bold 26px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent;
    ctx.textAlign='right'; ctx.fillText('2026',W-44,H-60);
    ctx.fillStyle='#AB0520'; ctx.fillRect(44,H-104,560,4);
    ctx.font='400 18px Source Sans 3,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.textAlign='left'; ctx.fillText('mining.arizona.edu',44,H-28);
    if (showDate) { const d=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});ctx.textAlign='right';ctx.fillStyle=tmpl.accent;ctx.fillText(d,W-44,H-28); }
    return;
  }

  const tmplName=window.__smemr_tmpl_name||'';
  ctx.font='bold 54px Oswald,sans-serif'; ctx.fillStyle='#fff';
  ctx.textBaseline='bottom'; ctx.textAlign='left'; ctx.fillText(tmplName,44,H-82);
  ctx.fillStyle=tmpl.accent; ctx.fillRect(44,H-88,Math.min(tmplName.length*25,460),4);
  ctx.font='bold 20px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent;
  ctx.textAlign='right'; ctx.textBaseline='bottom';
  ctx.fillText((eventName||'SMEMR').toUpperCase(),W-44,H-20);
  ctx.font='400 19px Source Sans 3,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.42)';
  ctx.textAlign='left'; ctx.fillText('mining.arizona.edu',44,H-20);
  if (showDate) {
    const d=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    ctx.font='400 17px Source Sans 3,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.28)';
    ctx.textAlign='left'; ctx.fillText(d,44,H-48);
  }
}

// ── COLLAGE COMPOSITOR ────────────────────────────────────────────────────
function buildCollage(photos, tmpl, layout, opts={}) {
  const { eventName='', showDate=true } = opts;
  let W,H;
  if (layout==='strip'){W=450;H=1300;}
  else if (layout==='wide'){W=1600;H=560;}
  else {W=1080;H=1080;}

  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,tmpl.g[0]); bg.addColorStop(1,tmpl.g[1]);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  (Art[tmpl.art]||Art.chevron)(ctx,W,H,tmpl.accent);

  const HH=80,FH=68,pad=layout==='strip'?14:18,gap=layout==='strip'?10:14;
  const innerH=H-HH-FH-pad*2,innerW=W-pad*2;
  let cells=[];
  if (layout==='strip'){const n=photos.length,rh=Math.floor((innerH-gap*(n-1))/n);cells=Array.from({length:n},(_,i)=>({x:pad,y:HH+pad+i*(rh+gap),w:innerW,h:rh}));}
  else if (layout==='wide'){const n=photos.length,cw=Math.floor((innerW-gap*(n-1))/n);cells=Array.from({length:n},(_,i)=>({x:pad+i*(cw+gap),y:HH+pad,w:cw,h:innerH}));}
  else {const cols=photos.length<=2?photos.length:2,rows=Math.ceil(photos.length/cols),cw=Math.floor((innerW-gap*(cols-1))/cols),ch=Math.floor((innerH-gap*(rows-1))/rows);cells=Array.from({length:photos.length},(_,i)=>{const col=i%cols,row=Math.floor(i/cols);return{x:pad+col*(cw+gap),y:HH+pad+row*(ch+gap),w:cw,h:ch};});}

  photos.forEach((p,i)=>{
    if(!p||!cells[i])return;
    const cell=cells[i];
    ctx.save();
    ctx.beginPath(); roundRect(ctx,cell.x,cell.y,cell.w,cell.h,8); ctx.clip();
    const sW=p.width||1280,sH=p.height||960,sc=Math.max(cell.w/sW,cell.h/sH);
    ctx.drawImage(p,cell.x+(cell.w-sW*sc)/2,cell.y+(cell.h-sH*sc)/2,sW*sc,sH*sc);
    ctx.restore();
    ctx.fillStyle=tmpl.accent; ctx.beginPath(); ctx.arc(cell.x+22,cell.y+22,15,0,Math.PI*2); ctx.fill();
    ctx.font='bold 14px Oswald,sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i+1,cell.x+22,cell.y+22);
  });

  ctx.fillStyle='rgba(0,0,0,0.68)'; ctx.fillRect(0,0,W,HH);
  ctx.fillStyle='#AB0520'; ctx.fillRect(0,0,W,5);
  ctx.font=`bold ${Math.round(HH*.52)}px Oswald,sans-serif`; ctx.fillStyle='#AB0520'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText('A',16,HH/2);
  ctx.font=`600 ${Math.round(HH*.28)}px Oswald,sans-serif`; ctx.fillStyle='#fff';
  ctx.fillText('SMEMR — University of Arizona',16+HH*.6,HH/2);

  ctx.fillStyle='rgba(0,0,0,0.68)'; ctx.fillRect(0,H-FH,W,FH);
  ctx.font='bold 21px Oswald,sans-serif'; ctx.fillStyle=tmpl.accent; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText(eventName||'mining.arizona.edu',pad,H-FH/2);
  if (showDate){const d=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});ctx.font='400 17px Source Sans 3,sans-serif';ctx.fillStyle='rgba(255,255,255,.38)';ctx.textAlign='right';ctx.fillText(d,W-pad,H-FH/2);}
  return out;
}

// ── GIF ENCODER ───────────────────────────────────────────────────────────
async function makeGIF(frames, delay=200, onProgress=null) {
  return new Promise((resolve,reject)=>{
    if(!window.GIF){reject(new Error('gif.js not loaded'));return;}
    const TW=540,TH=Math.round(540*(frames[0].height/frames[0].width));
    const gif=new window.GIF({workers:2,quality:6,width:TW,height:TH,workerScript:'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'});
    frames.forEach(f=>{const sc=document.createElement('canvas');sc.width=TW;sc.height=TH;sc.getContext('2d').drawImage(f,0,0,TW,TH);gif.addFrame(sc,{delay,copy:true});});
    gif.on('progress',p=>onProgress&&onProgress(Math.round(p*100)));
    gif.on('finished',resolve);
    gif.on('error',reject);
    gif.render();
  });
}

// ── THUMBNAIL HELPER ──────────────────────────────────────────────────────
function makeThumbnail(canvas, maxW=400) {
  const ratio=maxW/canvas.width;
  const th=document.createElement('canvas');
  th.width=maxW; th.height=Math.round(canvas.height*ratio);
  th.getContext('2d').drawImage(canvas,0,0,th.width,th.height);
  return th.toDataURL('image/jpeg',0.75);
}

// ── EXPORTS ───────────────────────────────────────────────────────────────
window.TEMPLATES            = TEMPLATES;
window.CATS                 = CATS;
window.Art                  = Art;
window.loadImg              = loadImg;
window.renderTemplateThumbnail = renderTemplateThumbnail;
window.compositeImage       = compositeImage;
window.buildCollage         = buildCollage;
window.makeGIF              = makeGIF;
window.makeThumbnail        = makeThumbnail;
window.hexRgba              = hexRgba;
window.roundRect            = roundRect;
