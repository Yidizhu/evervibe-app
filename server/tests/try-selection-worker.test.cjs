'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {build}=require('esbuild'),{Miniflare}=require('miniflare');

test('Workers Web Crypto verifies selected candidate facts across independent isolates without external requests',async()=>{
 const source=String.raw`
import trial from './server/source/try-service.cjs';
const ids={film:'11111111-1111-4111-8111-111111111111',place:'33333333-3333-4333-8333-333333333333'};
const service=trial.createTryService({env:{QLOO_API_KEY:'offline-worker-selection-key'},catalogStore:{get:async id=>({expires:Date.now()+600000,item:{id,type:'movie',title:'Provider Film'}}),set:async()=>{}},
fetch:async()=>Response.json({results:{entities:[{entity_id:ids.place,type:'urn:entity:place',name:'Provider Museum',location:{lat:51.5074,lon:-0.1278},properties:{description:'Paintings from the public collection.',geocode:{country_code:'GB',city:'London'}},tags:[{id:'urn:tag:genre:place:museum',name:'Museum'}]}]}}),
gemini:{structured:async(system,context,schema)=>schema.properties.intent?(context.selectedPlan?{intent:'chat',replaceSelection:false,mode:'common',text:context.selectedPlan.item.title+' — '+context.selectedPlan.item.description,mood:'gentle',duration:'few-hours',interests:['art']}:{intent:'activity',mode:'common',text:'',mood:'gentle',duration:'few-hours',interests:['art']}):{text:'Consider a museum.',selections:[{id:ids.place,reason:'Cultural starting point.',activity:'Choose one painting each.'}]}}});
export default {async fetch(request){const selected=await request.json();try{return Response.json(await service.assist({locale:'en',city:'london',consent:true,vibes:{you:{entities:[ids.film],note:''},partner:{entities:[ids.film],note:''}},messages:[{from:'you',text:selected?'What could we talk about there?':'Find a museum.'}],...(selected?{selection:selected}:{})}));}catch(error){return Response.json({code:error.code},{status:error.status||500});}}};`;
 const result=await build({stdin:{contents:source,resolveDir:path.resolve(__dirname,'../..'),loader:'js'},bundle:true,write:false,platform:'browser',format:'esm',target:'es2022',logLevel:'silent'});
 const create=()=>new Miniflare({modules:true,compatibilityDate:'2026-05-15',script:result.outputFiles[0].text,outboundService:()=>{throw new Error('OFFLINE_TEST_NETWORK_BLOCKED');}});
 const first=create(),second=create();
 try{
  const post=(worker,body)=>worker.dispatchFetch('https://selection.test/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const response=await post(first,null);assert.equal(response.status,200);const plan=await response.json();assert.equal(typeof plan.items[0].contextToken,'string');
  const follow=await post(second,{token:plan.items[0].contextToken,confirmed:{you:true,partner:true}});assert.equal(follow.status,200);const body=await follow.json();assert.equal(body.kind,'chat');assert.equal(body.text,'Provider Museum — Paintings from the public collection.');assert.equal(body.replaceSelection,false);
  const bad=await post(second,{token:plan.items[0].contextToken.replace(/^./,c=>c==='A'?'B':'A'),confirmed:{you:true,partner:true}});assert.equal(bad.status,422);assert.deepEqual(await bad.json(),{code:'TRY_PLAN_INVALID'});
 }finally{await Promise.all([first.dispose(),second.dispose()]);}
});