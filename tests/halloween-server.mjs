import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';

const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.wasm':'application/wasm','.tflite':'application/octet-stream','.task':'application/octet-stream','.json':'application/json'};
const models={
 '/vendor/models/face_detector.tflite':'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
 '/vendor/models/pose_landmarker_lite.task':'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
};
const library='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35';
createServer(async (req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const dest=models[pathname]||(pathname==='/vendor/mediapipe/vision_bundle.mjs'?library+'/vision_bundle.mjs':pathname.startsWith('/vendor/mediapipe/wasm/')?library+'/wasm/'+pathname.slice('/vendor/mediapipe/wasm/'.length):null);
    if(dest){
      const remote=await fetch(dest);
      if(!remote.ok)throw new Error('Upstream '+remote.status+' '+dest);
      res.writeHead(200,{'Content-Type':mime[extname(pathname)]||'application/octet-stream','Cache-Control':'public,max-age=86400'});
      res.end(Buffer.from(await remote.arrayBuffer()));return;
    }
    let file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+'/')){res.writeHead(403);res.end('Forbidden');return}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(data);
  }catch(e){console.error('HTTP',req.url,e.message);res.writeHead(404);res.end(e.message)}
}).listen(8765,'127.0.0.1',()=>console.log('SMEMR test server listening on http://127.0.0.1:8765'));
