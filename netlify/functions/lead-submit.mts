import type { Config } from "@netlify/functions";
const ALLOWED_ORIGIN="https://canouchiha42.github.io";
const MAX_FIELD=1000;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
const clean=(v:unknown)=>String(v??"").trim().slice(0,MAX_FIELD);
export default async(req:Request)=>{
 if(req.method==="OPTIONS")return json({ok:true});
 if(req.headers.get("origin")!==ALLOWED_ORIGIN)return json({ok:false,error:"Origin not allowed"},403);
 if(req.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
 const target=Netlify.env.get("CORA_LEADS_URL");
 if(!target)return json({ok:false,error:"Lead endpoint not configured"},500);
 let body:any;try{body=await req.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
 const payload:any={};["name","company","email","phone","website","industry","company_size","goal","service","message","monthlyInquiries","plan","interest","privacy_consent","source","page","lead_id"].forEach(k=>{if(body[k]!==undefined)payload[k]=clean(body[k])});
 if(payload.privacy_consent!=="yes"||!payload.name||!payload.company||!payload.email||!payload.message)return json({ok:false,error:"Required fields missing"},400);
 payload.source="Cora Website";
 try{
  const upstream=await fetch(target,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams(payload)});
  const text=await upstream.text();let data:any;try{data=JSON.parse(text)}catch{return json({ok:false,error:"Invalid lead service response"},502)}
  if(!upstream.ok||data.ok!==true||!data.leadId||data.status!=="Neu")return json({ok:false,error:"Lead could not be confirmed"},502);
  return json({ok:true,leadId:String(data.leadId),status:"Neu"});
 }catch(e){console.error("Lead proxy failure",e instanceof Error?e.message:"unknown");return json({ok:false,error:"Lead service unavailable"},502)}
};
export const config:Config={path:"/.netlify/functions/lead-submit",method:["POST","OPTIONS"]};