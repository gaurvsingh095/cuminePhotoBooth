import { kv } from '@vercel/kv';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const LIST='smemr:wall:v1:ids';
const itemKey=id=>'smemr:wall:v1:item:'+id;
const tokenKey=id=>'smemr:wall:v1:token:'+id;
const TTL=60*60*24*30; // Photo wall retains images up to 30 days.
const configured=()=>Boolean(process.env.KV_REST_API_URL&&process.env.KV_REST_API_TOKEN);
const tokenHash=v=>createHash('sha256').update(v).digest('hex');
const idOk=id=>typeof id==='string'&&/^[a-f0-9]{24}$/.test(id);

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(!['GET','POST','DELETE'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(!configured())return res.status(503).json({error:'Shared wall storage is not connected. Local wall remains available.',shared:false});
 try{
  if(req.method==='GET'){
   const ids=await kv.lrange(LIST,0,79);
   const photos=await Promise.all((ids||[]).filter(idOk).map(id=>kv.get(itemKey(id))));
   return res.status(200).json({shared:true,photos:photos.filter(Boolean)});
  }
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(req.method==='POST'){
   if(body.consent!==true) return res.status(400).json({error:'Explicit event-wall consent required'});
   if(body.confirmedAdults!==true)return res.status(400).json({error:'Permission confirmation required'});
   if(typeof body.thumbnail!=='string'||body.thumbnail.length>380000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(body.thumbnail))
     return res.status(400).json({error:'Expected a JPEG photo under 280 KB'});
   // Lightweight abuse protection: store only a short-lived hashed sender bucket.
   const host=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   const key='smemr:wall:rate:'+tokenHash(host).slice(0,18);
   const attempts=await kv.incr(key);
   if(attempts===1)await kv.expire(key,3600);
   if(attempts>15)return res.status(429).json({error:'Photo-wall limit reached. Ask the event organizer.'});
   const id=randomBytes(12).toString('hex'),removeToken=randomBytes(24).toString('hex');
   const photo={id,thumbnail:body.thumbnail,kind:String(body.kind||'SMEMR Halloween').slice(0,42),
     createdAt:Date.now()};
   await kv.set(itemKey(id),photo,{ex:TTL});
   await kv.set(tokenKey(id),tokenHash(removeToken),{ex:TTL});
   await kv.lpush(LIST,id);await kv.ltrim(LIST,0,199);
   return res.status(201).json({id,removeToken,shared:true});
  }
  if(req.method==='DELETE'){
   if(!idOk(body.id)||typeof body.removeToken!=='string'||body.removeToken.length!==48)
    return res.status(400).json({error:'A valid ownership receipt is required'});
   const stored=await kv.get(tokenKey(body.id));
   const actual=tokenHash(body.removeToken);
   if(typeof stored!=='string'||stored.length!==actual.length||!timingSafeEqual(Buffer.from(stored),Buffer.from(actual)))
    return res.status(403).json({error:'Cannot remove a photo without its ownership receipt'});
   await kv.del(itemKey(body.id));await kv.del(tokenKey(body.id));
   return res.status(200).json({removed:true});
  }
 }catch(e){console.error('SMEMR wall storage operation failed',e);
  return res.status(503).json({error:'Shared wall is temporarily unavailable. Your device copy remains available.',shared:false})}
}
