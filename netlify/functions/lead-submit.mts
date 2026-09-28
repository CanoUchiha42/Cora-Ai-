import type { Config } from "@netlify/functions";
const ALLOWED_ORIGIN="https://canouchiha42.github.io";
const MAX_FIELD=1000;
const RATE_WINDOW_MS=60_000;
const RATE_MAX=5;
const rateBucket=new Map<string,{started:number,count:number}>();
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Idempotency-Key"}});
const clean=(v:unknown)=>String(v??"").trim().slice(0,MAX_FIELD);
function allowedRate(req:Request){const key=(req.headers.get("x-forwarded-for")||req.headers.get("client-ip")||"unknown").split(",")[0].trim();const now=Date.now();const current=rateBucket.get(key);if(!current||now-current.started>=RATE_WINDOW_MS){rateBucket.set(key,{started:now,count:1});return true}current.count++;return current.count<=RATE_MAX}
export default async(req:Request)=>{
 if(req.method==="OPTIONS")return json({ok:true});
 if(req.headers.get("origin")!==ALLOWED_ORIGIN)return json({ok:false,error:"Origin not allowed"},403);
 if(req.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
 if(!allowedRate(req))return json({ok:false,error:"Rate limit exceeded",retryAfter:60},429);
 const target=Netlify.env.get("CORA_LEADS_URL");
 const sharedSecret=Netlify.env.get("CORA_LEADS_SHARED_SECRET");
 if(!target||!sharedSecret)return json({ok:false,error:"Lead endpoint not securely configured"},500);
 let body:any;try{body=await req.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
 const payload:any={};["name","company","email","phone","website","industry","company_size","goal","service","message","monthlyInquiries","plan","interest","privacy_consent","source","page","lead_id"].forEach(k=>{if(body[k]!==undefined)payload[k]=clean(body[k])});
 if(payload.privacy_consent!=="yes"||!payload.name||!payload.company||!payload.email||!payload.message)return json({ok:false,error:"Required fields missing"},400);
 if(!/^\S+@\S+\.\S+$/.test(payload.email))return json({ok:false,error:"Invalid email"},400);
 payload.source="Cora Website";
 payload.shared_secret=sharedSecret;
 payload.idempotency_key=clean(req.headers.get("Idempotency-Key")||payload.lead_id||"");
 try{
  const upstream=await fetch(target,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams(payload)});
  const text=await upstream.text();let data:any;try{data=JSON.parse(text)}catch{return json({ok:false,error:"Invalid lead service response"},502)}
  if(!upstream.ok||data.ok!==true||!data.leadId||data.status!=="Neu")return json({ok:false,error:"Lead could not be confirmed"},502);
  return json({ok:true,leadId:String(data.leadId),status:"Neu"});
 }catch(e){console.error("Lead proxy failure",e instanceof Error?e.message:"unknown");return json({ok:false,error:"Lead service unavailable"},502)}
};
export const config:Config={path:"/.netlify/functions/lead-submit",method:["POST","OPTIONS"]};