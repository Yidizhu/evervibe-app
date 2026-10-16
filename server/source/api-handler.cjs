'use strict';

// Fetch API boundary. Inject services/configuration from the host (Node or Worker).
// This module deliberately has no filesystem, Node HTTP, or environment access.
const POST_ROUTES=new Set(['/api/recommend','/api/eve/chat','/api/eve/plan','/api/eve/assist','/api/eve/proactive','/api/try/search','/api/try/compare','/api/try/private','/api/try/profile','/api/try/companion','/api/try/assist']);
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers:{...JSON_HEADERS,...headers}});
const failure=(status,code)=>Object.assign(new Error(code),{status,code});
const checkAbort=signal=>{if(signal?.aborted)throw failure(499,'REQUEST_CANCELLED');};

async function readJson(request,{maxBytes,timeoutMs}){
 const declared=request.headers.get('content-length');
 if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw failure(413,'BODY_TOO_LARGE');
 checkAbort(request.signal);
 if(!request.body)throw failure(400,'BAD_REQUEST');
 const reader=request.body.getReader(),chunks=[];let size=0,timer,onAbort;
 const interrupted=new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(failure(408,'REQUEST_TIMEOUT')),timeoutMs);
  onAbort=()=>reject(failure(499,'REQUEST_CANCELLED'));
  request.signal.addEventListener('abort',onAbort,{once:true});
  if(request.signal.aborted)onAbort();
 });
 try{
  while(true){
   const {done,value}=await Promise.race([reader.read(),interrupted]);
   if(done)break;
   size+=value.byteLength;if(size>maxBytes)throw failure(413,'BODY_TOO_LARGE');
   chunks.push(value);
  }
  checkAbort(request.signal);
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
  catch{throw failure(400,'BAD_REQUEST');}
 }finally{
  clearTimeout(timer);request.signal.removeEventListener('abort',onAbort);
  // Leave transport disposal to the host adapter so a size error can be returned.
  reader.releaseLock();
 }
}

function createApiHandler(options={}){
 const {qloo,gemini,planner,proactive,tryService,companion,validateChat}=options;
 const now=options.now||Date.now;
 const maxBodyBytes=options.maxBodyBytes??48000,bodyTimeoutMs=options.bodyTimeoutMs??15000;
 // Short rolling-window protection only. No daily, total, or model-usage budget.
 const maxConcurrent=options.maxConcurrent??2,maxRequestsPerMinute=options.maxRequestsPerMinute??12;
 for(const number of [maxBodyBytes,bodyTimeoutMs,maxConcurrent,maxRequestsPerMinute])if(!Number.isInteger(number)||number<=0)throw new TypeError('Invalid API protection configuration.');
 const configuredOrigins=options.allowedOrigins===undefined?null:new Set(options.allowedOrigins);
 if(configuredOrigins)for(const origin of configuredOrigins){const url=new URL(origin);if(!['http:','https:'].includes(url.protocol)||url.origin!==origin)throw new TypeError('Origins must be exact HTTP(S) origins.');}
 let active=0,requests=[];
 async function call(service,method,input,signal){
  if(typeof service?.[method]!=='function')throw failure(503,'SERVICE_NOT_CONFIGURED');
  checkAbort(signal);const result=await service[method](input,{signal});checkAbort(signal);return result;
 }
 return async function handleApiRequest(request){
  let admitted=false;
  try{
   const url=new URL(request.url),origin=request.headers.get('origin');
   if(!['http:','https:'].includes(url.protocol)||request.headers.get('sec-fetch-site')==='cross-site'||(configuredOrigins&&!configuredOrigins.has(url.origin))||(origin&&origin!==url.origin))throw failure(403,'ORIGIN_REJECTED');
   checkAbort(request.signal);
   const route=url.pathname;
   if(route==='/api/status'){
    if(request.method!=='GET')return reply(405,{error:{code:'METHOD_NOT_ALLOWED'}},{Allow:'GET'});
    const qlooState=qloo?.status?.(),geminiState=gemini?.status?.();
    // Readiness only: do not echo model names, environment values or future diagnostics.
    return reply(200,{qloo:{configured:qlooState?.qloo?.configured===true,provider:'qloo'},gemini:{configured:geminiState?.configured===true,provider:'gemini'}});
   }
   if(!POST_ROUTES.has(route))throw failure(404,'NOT_FOUND');
   if(request.method!=='POST')return reply(405,{error:{code:'METHOD_NOT_ALLOWED'}},{Allow:'POST'});
   if(!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type')||''))throw failure(415,'JSON_REQUIRED');
   const time=now();requests=requests.filter(start=>time-start<60000);
   if(active>=maxConcurrent||requests.length>=maxRequestsPerMinute)return reply(429,{error:{code:'LOCAL_RATE_LIMIT'}},{'Retry-After':'60'});
   active++;admitted=true;requests.push(time);
   const input=await readJson(request,{maxBytes:maxBodyBytes,timeoutMs:bodyTimeoutMs}),signal=request.signal;
   if(!input||typeof input!=='object'||Array.isArray(input))throw failure(400,'BAD_REQUEST');
   let result;
   if(route==='/api/recommend')result=await call(qloo,'recommend',input,signal);
   else if(route==='/api/eve/plan')result=await call(planner,'plan',input,signal);
   else if(route==='/api/eve/assist')result=await call(planner,'assist',input,signal);
   else if(route==='/api/eve/proactive')result=await call(proactive,'greet',input,signal);
   else if(route==='/api/try/search')result=await call(tryService,'search',input,signal);
   else if(route==='/api/try/compare')result=await call(tryService,'compare',input,signal);
   else if(route==='/api/try/companion')result=await call(companion,'reply',input,signal);
   else if(route==='/api/try/profile')result=await call(tryService,'summarizeProfile',input,signal);
   else if(route==='/api/try/private')result=await call(tryService,'privateChat',input,signal);
   else if(route==='/api/try/assist')result=await call(tryService,'assist',input,signal);
   else{
    // Consent and scope validation must precede Qloo and Gemini calls.
    if(typeof validateChat!=='function')throw failure(503,'SERVICE_NOT_CONFIGURED');
    validateChat(input);
    let recommendation;
    if(input.planId){
     if(typeof planner?.getPlan!=='function')throw failure(503,'SERVICE_NOT_CONFIGURED');
     recommendation=await planner.getPlan(input.planId,input.episode);
    }else if(input.recommendationMode)recommendation=await call(qloo,'recommend',{episode:input.episode,mode:input.recommendationMode,locale:input.locale,consent:input.consent},signal);
    if(typeof gemini?.chat!=='function')throw failure(503,'SERVICE_NOT_CONFIGURED');
    checkAbort(signal);result=await gemini.chat(input,{recommendation,signal});checkAbort(signal);
   }
   return reply(200,result);
  }catch(error){
   // Service errors carry a public code. Provider messages, causes and stacks stay private.
   const safe=Number.isInteger(error?.status)&&error.status>=400&&error.status<=599&&typeof error?.code==='string'&&/^[A-Z][A-Z0-9_]{1,63}$/.test(error.code);
   return reply(safe?error.status:500,{error:{code:safe?error.code:'INTERNAL_ERROR'}});
  }finally{if(admitted)active--;}
 };
}
module.exports={createApiHandler};
