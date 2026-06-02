'use strict';
const S = {
  screen:'attract', mode:'single', layout:'grid', count:1,
  tmpl:null, timer:5, stream:null, photos:[], composited:null,
  gifBlob:null, pendingGifFrames:null, currentCat:'all',
  settings:{ eventName:'Cu at the Mine 2026', showDate:true, soundEnabled:true, autoResetSec:90 },
};

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('s-' + id);
  if (!el) return;
  el.classList.add('active');
  S.screen = id;
  resetIdle();
  if (id !== 'attract') startIdle();
  if (id === 'gallery')  renderTemplates(S.currentCat);
  if (id === 'preview')  setupCamUI();
  if (id === 'review')   renderReview();
  if (id === 'collage')  renderCollage();
  if (id === 'gif')      renderGIF();
  if (id === 'delivery') doDelivery();
}
function selectMode(m, l, c) { S.mode=m; S.layout=l||'grid'; S.count=parseInt(c)||1; goTo('gallery'); }

// ── Templates ─────────────────────────────────────────────────────────────
function renderTemplates(cat) {
  S.currentCat = cat;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('on', p.dataset.cat === cat));
  const list = cat === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.cat === cat);
  const grid = document.getElementById('tmpl-grid');
  grid.innerHTML = '';
  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tmpl-card' + (S.tmpl?.id === t.id ? ' sel' : '');
    card.dataset.id = t.id;
    const thumb = document.createElement('canvas');
    thumb.width = 180; thumb.height = 120;
    const wrap = document.createElement('div'); wrap.className = 'tmpl-thumb'; wrap.appendChild(thumb);
    if (t.hot) { const b = document.createElement('div'); b.className = 'tmpl-hot'; b.textContent = t.featured ? '★ Featured' : 'Popular'; wrap.appendChild(b); }
    const info = document.createElement('div'); info.className = 'tmpl-info';
    info.innerHTML = '<div class="tmpl-name">' + t.name + '</div><div class="tmpl-tag">' + t.tag + '</div>';
    card.appendChild(wrap); card.appendChild(info);
    card.addEventListener('click', () => {
      S.tmpl = t;
      document.querySelectorAll('.tmpl-card').forEach(c => c.classList.toggle('sel', c.dataset.id === t.id));
      document.getElementById('sel-btn').disabled = false;
    });
    grid.appendChild(card);
    requestAnimationFrame(() => renderTemplateThumbnail(thumb, t));
  });
  document.getElementById('sel-btn').disabled = !S.tmpl;
}

// ── Camera ────────────────────────────────────────────────────────────────
async function initCamera() {
  S.photos = [];
  goTo('preview');
  document.getElementById('cam-error').style.display = 'none';
  document.getElementById('snap-btn').disabled = false;
  if (S.stream) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; }
  try {
    const mob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    S.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mob ? { ideal:'environment' } : 'user', width:{ideal:1920}, height:{ideal:1080} },
      audio: false,
    });
    const vid = document.getElementById('cam-video');
    vid.srcObject = S.stream;
    vid.style.transform = mob ? 'none' : 'scaleX(-1)';
    await vid.play();
    setupCamUI();
  } catch(e) {
    console.warn(e);
    document.getElementById('cam-error').style.display = 'flex';
  }
}
function stopStream() {
  if (S.stream) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; }
  if (_cdt) { clearInterval(_cdt); _cdt = null; }
  document.getElementById('cd-overlay').classList.remove('vis');
}
function setupCamUI() {
  if (S.tmpl) document.getElementById('cam-tmpl-label').textContent = S.tmpl.name;
  const n = S.count, dots = document.getElementById('strip-dots');
  if (n > 1) {
    dots.style.display = 'flex';
    dots.innerHTML = Array.from({length:n},(_,i) =>
      '<div class="strip-dot ' + (i < S.photos.length ? 'done' : i === S.photos.length ? 'active' : '') + '"></div>'
    ).join('');
  } else dots.style.display = 'none';
  document.getElementById('cam-hint-text').textContent = n > 1
    ? 'Shot ' + (S.photos.length+1) + ' of ' + n
    : 'Stand in the frame — smile!';
}

let _cdt = null;
function startCountdown() {
  if (_cdt) return;
  document.getElementById('snap-btn').disabled = true;
  const ov = document.getElementById('cd-overlay'), num = document.getElementById('cd-num');
  ov.classList.add('vis');
  let n = S.timer; num.textContent = n; animNum(num);
  if (S.settings.soundEnabled) beep(440);
  _cdt = setInterval(() => {
    n--;
    if (n > 0) { num.textContent = n; animNum(num); if (S.settings.soundEnabled) beep(440); }
    else {
      clearInterval(_cdt); _cdt = null; ov.classList.remove('vis');
      if (S.settings.soundEnabled) beep(880, 0.15);
      captureFrame();
      document.getElementById('snap-btn').disabled = false;
    }
  }, 1000);
}
function animNum(el) { el.style.animation='none'; void el.offsetWidth; el.style.animation='cdPop .45s cubic-bezier(.34,1.56,.64,1)'; }

function captureFrame() {
  const flash = document.getElementById('flash-layer');
  flash.classList.add('on'); setTimeout(() => flash.classList.remove('on'), 180);
  const vid = document.getElementById('cam-video');
  const W = vid.videoWidth||1280, H = vid.videoHeight||720;
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const ctx = c.getContext('2d');
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    ctx.save(); ctx.translate(W,0); ctx.scale(-1,1); ctx.drawImage(vid,0,0,W,H); ctx.restore();
  } else ctx.drawImage(vid,0,0,W,H);
  S.photos.push(c);
  if (S.photos.length >= S.count) { stopStream(); processCapture(); }
  else { setupCamUI(); setTimeout(startCountdown, 900); }
}

// ── Compositing ────────────────────────────────────────────────────────────
function processCapture() {
  showProc(true, 'Compositing your photo…');
  window.__smemr_tmpl_name = S.tmpl?.name || '';
  const opts = { eventName: S.settings.eventName, showDate: S.settings.showDate };
  // If banner template, load image first then composite
  if (S.tmpl?.bannerSrc) {
    loadImg(S.tmpl.bannerSrc).then(img => {
      opts.bannerImg = img || null;
      _doComposite(opts);
    });
  } else {
    setTimeout(() => _doComposite(opts), 100);
  }
}
function _doComposite(opts) {
  try {
    if (S.mode === 'single') {
      S.composited = compositeImage(S.photos[0], S.tmpl, opts);
      showProc(false); goTo('review');
    } else if (S.mode === 'gif' || S.mode === 'boomer') {
      const frames = S.photos.map((p,i) => compositeImage(p, S.tmpl, {...opts, frameIndex:i, totalFrames:S.photos.length}));
      S.composited = frames[0]; S.pendingGifFrames = frames;
      showProc(false); goTo('gif');
    } else {
      S.composited = buildCollage(S.photos, S.tmpl, S.layout, opts);
      showProc(false); goTo('collage');
    }
  } catch(e) { console.error(e); showProc(false); alert('Error — please try again.'); }
}
function renderReview() { if (!S.composited) return; const c=document.getElementById('result-canvas'); c.width=S.composited.width; c.height=S.composited.height; c.getContext('2d').drawImage(S.composited,0,0); }
function renderCollage() { if (!S.composited) return; const c=document.getElementById('collage-canvas'); c.width=S.composited.width; c.height=S.composited.height; c.getContext('2d').drawImage(S.composited,0,0); }

async function renderGIF() {
  const prev=document.getElementById('gif-preview'), st=document.getElementById('gif-status');
  prev.src=''; st.textContent='Encoding GIF…';
  showProc(true,'Building GIF…','Takes ~15 seconds');
  try {
    const frames=S.pendingGifFrames||[S.composited];
    const delay=S.mode==='boomer'?120:200;
    const seq=S.mode==='boomer'?[...frames,...[...frames].reverse().slice(1,-1)]:frames;
    const blob=await makeGIF(seq,delay,pct=>{document.getElementById('proc-bar').style.width=pct+'%';});
    S.gifBlob=blob; prev.src=URL.createObjectURL(blob);
    st.textContent='GIF ready — '+(blob.size/1024).toFixed(0)+' KB'; showProc(false);
  } catch(e) { showProc(false); if(S.composited){prev.src=S.composited.toDataURL('image/png');st.textContent='GIF failed — showing PNG';} }
}

// ── Delivery ───────────────────────────────────────────────────────────────
async function doDelivery() {
  if (!S.composited) return;
  const name = (S.tmpl?.name||'SMEMR').replace(/\s+/g,'-');
  const date = new Date().toISOString().slice(0,10);
  let dataUrl, filename;
  if (S.gifBlob) { dataUrl=URL.createObjectURL(S.gifBlob); filename='SMEMR-GIF-'+name+'-'+date+'.gif'; }
  else { dataUrl=S.composited.toDataURL('image/jpeg',0.93); filename='SMEMR-'+name+'-'+date+'.jpg'; }
  document.getElementById('delivery-thumb').src = S.composited.toDataURL('image/jpeg',0.5);
  const dl = document.getElementById('download-link');
  dl.href = dataUrl; dl.download = filename;

  // Save thumbnail to shared gallery
  try {
    const thumb = makeThumbnail(S.composited, 400);
    await GalleryStore.save({
      thumbnail:    thumb,
      templateName: S.tmpl?.name,
      eventName:    S.settings.eventName,
      mode:         S.mode,
    });
    const cnt = await GalleryStore.count();
    const badge = document.getElementById('gallery-count-badge');
    if (badge && cnt > 0) { badge.textContent = cnt; badge.style.display = 'flex'; }
  } catch(e) { console.warn('Gallery:', e); }
}

function sendEmail() {
  const inp = document.getElementById('email-inp');
  if (!inp.value?.includes('@')) return;
  inp.value = ''; inp.placeholder = '✓ Photo sent!';
  setTimeout(() => { inp.placeholder = 'your@email.com'; }, 3000);
}

// ── Utils ──────────────────────────────────────────────────────────────────
function showProc(on, text, sub) {
  document.getElementById('processing').classList.toggle('vis', on);
  if (on) {
    if (text) document.querySelector('.proc-text').textContent = text;
    if (sub)  document.querySelector('.proc-sub').textContent  = sub;
    document.getElementById('proc-bar').style.width = '0%';
  }
}
let _ac=null;
function beep(f, v) {
  if (!S.settings.soundEnabled) return;
  try {
    if (!_ac) _ac = new (window.AudioContext||window.webkitAudioContext)();
    const o=_ac.createOscillator(), g=_ac.createGain();
    o.connect(g); g.connect(_ac.destination);
    o.frequency.value=f; g.gain.setValueAtTime(v||0.07,_ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,_ac.currentTime+0.18);
    o.start(); o.stop(_ac.currentTime+0.18);
  } catch(e){}
}
let _it=null;
function startIdle(){resetIdle();_it=setTimeout(resetBooth,(S.settings.autoResetSec||90)*1000);}
function resetIdle(){if(_it){clearTimeout(_it);_it=null;}}
['touchstart','mousemove','click','keydown'].forEach(e=>document.addEventListener(e,()=>{if(S.screen!=='attract')startIdle();},{passive:true}));
function resetBooth(){stopStream();S.photos=[];S.composited=null;S.gifBlob=null;S.pendingGifFrames=null;S.mode='single';S.count=1;document.getElementById('sel-btn').disabled=true;document.getElementById('email-inp').value='';document.getElementById('proc-bar').style.width='0%';resetIdle();goTo('attract');}
function setTimer(v,el){S.timer=v;document.querySelectorAll('.t-btn').forEach(b=>b.classList.remove('on'));el.classList.add('on');}
function adminPrompt(){const c=prompt('Admin passcode:');if(c)window.open('admin.html','_blank');}

document.addEventListener('DOMContentLoaded', async () => {
  const bar = document.getElementById('cat-bar');
  if (bar) CATS.forEach(c => {
    const p = document.createElement('div');
    p.className = 'cat-pill' + (c==='all'?' on':'');
    p.dataset.cat = c;
    p.textContent = c==='all'?'All':c==='cu2026'?'Cu 2026':c.charAt(0).toUpperCase()+c.slice(1);
    p.addEventListener('click', () => renderTemplates(c));
    bar.appendChild(p);
  });
  renderTemplates('all');
  try {
    const cnt = await GalleryStore.count();
    const badge = document.getElementById('gallery-count-badge');
    if (badge && cnt > 0) { badge.textContent = cnt; badge.style.display = 'flex'; }
  } catch(e) {}
});

window.goTo=goTo; window.selectMode=selectMode; window.initCamera=initCamera;
window.stopStream=stopStream; window.startCountdown=startCountdown; window.setTimer=setTimer;
window.sendEmail=sendEmail; window.resetBooth=resetBooth; window.adminPrompt=adminPrompt;
