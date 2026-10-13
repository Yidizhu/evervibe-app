'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createApiHandler}=require('../source/api-handler.cjs');
const {createGeminiService,buildContext}=require('../source/gemini-chat.cjs');
const {AppError}=require('../source/eve-service.cjs');
const production='https://evervibe.zesty-mesa-1831.chatgpt.site',local='http://127.0.0.1:5173';
const post=(body,origin=production,url=production+'/api/eve/chat')=>new Request(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
const input=()=>({episode:'date',actor:'leo',scope:'private',locale:'en',consent:{connected:false,share:{leo:false,julian:false},receive:{leo:false,julian:false}},messages:[{from:'leo',text:'I would like a quiet conversation.'}]});

test('public status exposes readiness only even when a configuration value is misplaced',async()=>{
 const gemini=createGeminiService({env:{GEMINI_API_KEY:'offline-fixture',GEMINI_MODEL:'NOT_FOR_PUBLIC_OUTPUT'}});
 const handler=createApiHandler({gemini,qloo:{status:()=>({qloo:{configured:true,key:'NOT_FOR_PUBLIC_OUTPUT'},diagnostics:'NOT_FOR_PUBLIC_OUTPUT'})},allowedOrigins:[production]});
 const response=await handler(new Request(production+'/api/status'));assert.equal(response.status,200);
 const body=await response.json();assert.deepEqual(body,{qloo:{configured:true,provider:'qloo'},gemini:{configured:true,provider:'gemini'}});assert(!JSON.stringify(body).includes('NOT_FOR_PUBLIC_OUTPUT'));
});

test('configured local and production origins cannot post across each other',async()=>{
 let calls=0;const handler=createApiHandler({allowedOrigins:[production,local],tryService:{search:async()=>{calls++;return{items:[]};}}});
 const make=(url,origin)=>post({},origin,url+'/api/try/search');
 assert.equal((await handler(make(production,local))).status,403);assert.equal((await handler(make(local,production))).status,403);
 assert.equal((await handler(make(production,production))).status,200);assert.equal((await handler(make(local,local))).status,200);assert.equal(calls,2);
});

test('a caller cannot replace server-owned profiles or bypass actor and message validation',async()=>{
 let calls=0;const handler=createApiHandler({allowedOrigins:[production],validateChat:buildContext,gemini:{chat:async()=>{calls++;return{text:'Fixture',source:'gemini'};}}});
 for(const change of [{actor:'someone-else'},{episode:'__proto__'},{locale:'unknown'},{messages:[{from:'julian',text:'IMPORTED_PRIVATE_TRANSCRIPT'}]}])assert.equal((await handler(post({...input(),...change}))).status,400);
 assert.equal(calls,0);
 const context=buildContext({...input(),sharedVibes:{julian:{name:'CLIENT_OVERRIDE'}},partnerSuggestion:{text:'IMPORTED_PRIVATE_TRANSCRIPT'},apiKey:'CLIENT_OVERRIDE',privateHistory:'IMPORTED_PRIVATE_TRANSCRIPT'});
 assert(!JSON.stringify(context).includes('CLIENT_OVERRIDE'));assert(!JSON.stringify(context).includes('IMPORTED_PRIVATE_TRANSCRIPT'));
 assert.equal(context.sharedVibes.leo.name,'Chloe');assert.equal(context.sharedVibes.julian,undefined);
});

test('expired direct plan lookup returns a public recovery code without charging or leaking details',async()=>{
 let calls=0;const handler=createApiHandler({allowedOrigins:[production],validateChat:buildContext,planner:{getPlan:()=>{throw new AppError(410,'PLAN_EXPIRED','PRIVATE_INTERNAL_PLAN_STATE');}},gemini:{chat:async()=>{calls++;return{};}}});
 const body={...input(),scope:'group',planId:'11111111-1111-4111-8111-111111111111',consent:{connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}}};
 const response=await handler(post(body));assert.equal(response.status,410);assert.deepEqual(await response.json(),{error:{code:'PLAN_EXPIRED'}});assert.equal(calls,0);
});

test('release service sources cannot fall back to workstation configuration or Node server modules',()=>{
 const source=path.join(__dirname,'../source');
 for(const file of fs.readdirSync(source).filter(name=>name.endsWith('.cjs'))){
  const body=fs.readFileSync(path.join(source,file),'utf8');assert(!/process\.env|loadEnvFile|node:(?:fs|http|https)|C:\\Users\\|\.env\.local/.test(body),file);
 }
});
