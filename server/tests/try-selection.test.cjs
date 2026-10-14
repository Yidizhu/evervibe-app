'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createTryService}=require('../source/try-service.cjs');
const ids={film:'11111111-1111-4111-8111-111111111111',artist:'22222222-2222-4222-8222-222222222222',place:'33333333-3333-4333-8333-333333333333'};
const input=()=>({locale:'en',city:'london',consent:true,vibes:{you:{entities:[ids.film],note:'PRIVATE_NOTE_DO_NOT_SIGN'},partner:{entities:[ids.artist],note:'PRIVATE_OTHER_NOTE'}},messages:[{from:'you',text:'Find us an art activity. SHARED_CHAT_DO_NOT_SIGN'}]});
function fixture({store=new Map(),routeOverride={},onModel,apiKey='offline-selection-secret'}={}){
 let now=1000;const calls=[],contexts=[];
 const catalogStore={get:async id=>structuredClone(store.get(id)),set:async(id,item)=>store.set(id,structuredClone(item))};
 const service=createTryService({env:{QLOO_API_KEY:apiKey},now:()=>now,entityTtlMs:10000,planTtlMs:2000,catalogStore,
  fetch:async url=>{calls.push(new URL(url));if(url.pathname==='/search'){const type=url.searchParams.get('types').split(':').at(-1);return Response.json({results:[{entity_id:ids[type==='movie'?'film':'artist'],type:'urn:entity:'+type,name:type==='movie'?'Provider film':'Provider artist'}]});}
   if(url.pathname==='/v2/analysis/compare')return Response.json({results:{tags:[]}});
   return Response.json({results:{entities:[{entity_id:ids.place,type:'urn:entity:place',name:'Provider Museum',location:{lat:51.5074,lon:-0.1278},properties:{address:'Provider street, London',description:'A collection of paintings.',geocode:{country_code:'GB',city:'London'}},tags:[{id:'urn:tag:genre:place:museum',name:'Museum'}]}]}});},
  gemini:{structured:async(system,context,schema)=>{contexts.push({system,context:structuredClone(context)});onModel?.();if(schema.properties.intent)return context.selectedPlan||context.offeredPlans?.length?{intent:'chat',mode:'common',replaceSelection:false,text:'You could each choose a painting to talk about.',mood:'gentle',duration:'few-hours',interests:['art'],...routeOverride}:{intent:'activity',mode:'common',text:'',mood:'gentle',duration:'few-hours',interests:['art']};return {text:'A shared cultural stop.',selections:[{id:ids.place,reason:'EVE_INTERPRETATION_NOT_A_FACT',activity:'Choose a painting each.'}]};}}
 });
 const seed=async()=>{for(const type of ['movie','artist'])await service.search({query:type,type,locale:'en'});calls.length=0;};
 return {service,seed,calls,contexts,store,tick:ms=>now+=ms};
}
const follow=(plan,locale='en')=>({...input(),locale,messages:[{from:'partner',text:locale==='zh'?'我们在选好的这个地方可以聊些什么？':'What could we talk about at the place we chose?'}],selection:{token:plan.items[0].contextToken,confirmed:{you:true,partner:true},title:'FORGED CLIENT TITLE',address:'FORGED CLIENT ADDRESS'}});
function payload(token){return JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString('utf8'));}
async function signed(value,key='offline-selection-secret',purpose='EverVibe:Try:SelectedPlan:v1\n'){
 const encoded=Buffer.from(JSON.stringify(value)).toString('base64url'),hmac=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return encoded+'.'+Buffer.from(await crypto.subtle.sign('HMAC',hmac,new TextEncoder().encode(purpose+encoded))).toString('base64url');
}

test('selected public facts and confirmations survive independent services and both languages without another Qloo lookup',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());assert.equal(typeof plan.items[0].contextToken,'string');
 const proof=payload(plan.items[0].contextToken);for(const privateText of ['PRIVATE_NOTE','PRIVATE_OTHER','SHARED_CHAT','EVE_INTERPRETATION','offline-selection-secret'])assert(!JSON.stringify(proof).includes(privateText));assert.equal(proof.item.description,'A collection of paintings.');
 for(const locale of ['en','zh']){const second=fixture({store:first.store});const result=await second.service.assist(follow(plan,locale));assert.equal(result.kind,'chat');assert.equal(result.replaceSelection,false);assert.deepEqual(result.items,[]);assert.equal(second.calls.length,0);const selected=second.contexts[0].context.selectedPlan;assert.equal(selected.item.title,'Provider Museum');assert.equal(selected.item.address,'Provider street, London');assert.equal(selected.item.type,'place');assert.deepEqual(selected.confirmed,{you:true,partner:true});assert(!JSON.stringify(selected).includes('FORGED'));assert(!JSON.stringify(second.contexts).includes('contextToken'));assert.match(second.contexts[0].system,/ordinary follow-up[\s\S]*replaceSelection=false/);assert.match(second.contexts[0].system,/LATEST human message/);}
});

test('tampering, purpose, key, malformed type, city and Vibe scope reject before any model or lookup',async()=>{
 const f=fixture();await f.seed();const plan=await f.service.assist(input()),base=follow(plan),original=payload(base.selection.token);f.calls.length=0;f.contexts.length=0;
 const changed=structuredClone(original);changed.item.title='Forged museum';const forged=Buffer.from(JSON.stringify(changed)).toString('base64url')+'.'+base.selection.token.split('.')[1];
 const wrongType=structuredClone(original);wrongType.item.type='person';
 for(const token of [forged,await signed(original,'different-secret'),await signed(original,'offline-selection-secret','different-purpose'),await signed(wrongType),'not.a.signature','x'.repeat(16001)]){await assert.rejects(f.service.assist({...base,selection:{...base.selection,token}}),{code:'TRY_PLAN_INVALID'});}
 await assert.rejects(f.service.assist({...base,city:'tokyo'}),{code:'TRY_PLAN_INVALID'});
 const swapped=structuredClone(base);[swapped.vibes.you,swapped.vibes.partner]=[swapped.vibes.partner,swapped.vibes.you];await assert.rejects(f.service.assist(swapped),{code:'TRY_PLAN_INVALID'});
 await assert.rejects(f.service.assist({...base,selection:{...base.selection,confirmed:{you:'yes',partner:true}}}),{code:'TRY_PLAN_INVALID'});assert.equal(f.calls.length,0);assert.equal(f.contexts.length,0);
});

test('expired selected context is explicit and never silently starts a replacement search',async()=>{
 const f=fixture();await f.seed();const plan=await f.service.assist(input());f.tick(2001);f.calls.length=0;f.contexts.length=0;await assert.rejects(f.service.assist(follow(plan)),{code:'TRY_PLAN_EXPIRED'});assert.equal(f.calls.length,0);assert.equal(f.contexts.length,0);
});

test('a selected idea is replaced only by a routing decision explicitly marked as a replacement',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());
 const ordinary=fixture({store:first.store,routeOverride:{intent:'activity',replaceSelection:false,text:'Keep your museum choice and trade one painting each.'}});const kept=await ordinary.service.assist(follow(plan));assert.equal(kept.kind,'chat');assert.equal(kept.replaceSelection,false);assert.equal(ordinary.calls.length,0);
 const fresh=fixture({store:first.store,routeOverride:{intent:'activity',mode:'explore',replaceSelection:true,text:''}});const request=follow(plan);request.messages=[{from:'you',text:'Please replace that plan and find different museums.'}];const replacement=await fresh.service.assist(request);assert.equal(replacement.kind,'plan');assert.equal(replacement.replaceSelection,true);assert.equal(fresh.calls.length,2);assert.equal(fresh.calls.find(url=>url.pathname==='/v2/insights').searchParams.get('page'),'2');assert.equal(typeof replacement.items[0].contextToken,'string');
 const malformed=fixture({store:first.store,routeOverride:{replaceSelection:undefined}});await assert.rejects(malformed.service.assist(follow(plan)),{code:'GEMINI_PLAN_INVALID'});assert.equal(malformed.calls.length,0);
});

test('selected follow-ups preserve consent and cancellation gates before further work',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());const blocked=fixture({store:first.store});await assert.rejects(blocked.service.assist({...follow(plan),consent:false}),{code:'CONSENT_REQUIRED'});const before=new AbortController();before.abort();await assert.rejects(blocked.service.assist(follow(plan),{signal:before.signal}),{code:'TRY_CANCELLED'});assert.equal(blocked.contexts.length,0);assert.equal(blocked.calls.length,0);
 const during=new AbortController();const pending=fixture({store:first.store,onModel:()=>during.abort(),routeOverride:{intent:'activity',replaceSelection:true,text:''}});await assert.rejects(pending.service.assist(follow(plan),{signal:during.signal}),{code:'TRY_CANCELLED'});assert.equal(pending.calls.length,0);
});

const discussOffered=plan=>({...input(),messages:[{from:'partner',text:'One gallery sounds lovely. Let’s pick Provider Museum, then leave some time to talk over coffee.'}],offeredPlans:plan.items.map(item=>item.contextToken)});
test('unselected offered cards provide verified follow-up facts without becoming confirmed plans',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());
 for(const locale of ['en','zh']){
  const next=fixture({store:first.store,routeOverride:{intent:'date',replaceSelection:false,text:'That sounds like a lovely stop. Choose its card so you can both confirm; a coffee stop still needs to be chosen.'}});
  const result=await next.service.assist({...discussOffered(plan),locale});
  assert.equal(result.kind,'chat');assert.equal(result.replaceSelection,false);assert.deepEqual(result.items,[]);assert.equal(next.calls.length,0);
  const context=next.contexts[0].context;assert.equal(context.offeredPlans[0].item.title,'Provider Museum');assert.equal(context.offeredPlans[0].item.description,'A collection of paintings.');assert.equal(context.selectedPlan,undefined);
  assert.equal(context.offeredPlans[0].confirmed,undefined);
  for(const unverified of ['contextToken','EVE_INTERPRETATION_NOT_A_FACT',plan.items[0].contextToken])assert(!JSON.stringify(context).includes(unverified));
 }
});
test('offered context bounds, signatures, expiry and Vibe/location scope reject before a model call',async()=>{
 const f=fixture();await f.seed();const plan=await f.service.assist(input()),base=discussOffered(plan),token=base.offeredPlans[0];f.calls.length=0;f.contexts.length=0;
 for(const offeredPlans of [null,'not-an-array',[{}],[''],['x'.repeat(16001)],Array(4).fill(token),[token,token],['not.a.signature'],[token.replace(/^./,c=>c==='A'?'B':'A')]])await assert.rejects(f.service.assist({...base,offeredPlans}),{code:'TRY_PLAN_INVALID'});
 await assert.rejects(f.service.assist({...base,city:'tokyo'}),{code:'TRY_PLAN_INVALID'});
 const swapped=structuredClone(base);[swapped.vibes.you,swapped.vibes.partner]=[swapped.vibes.partner,swapped.vibes.you];await assert.rejects(f.service.assist(swapped),{code:'TRY_PLAN_INVALID'});
 await assert.rejects(f.service.assist({...base,location:{lat:51.5,lon:-.1}}),{code:'TRY_PLAN_INVALID'});
 f.tick(2001);await assert.rejects(f.service.assist(base),{code:'TRY_PLAN_EXPIRED'});assert.equal(f.calls.length,0);assert.equal(f.contexts.length,0);
});
test('new offered cards require an explicit replacement route while a malformed follow-up keeps them intact',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());
 const fresh=fixture({store:first.store,routeOverride:{intent:'activity',mode:'explore',replaceSelection:true,text:''}}),request=discussOffered(plan);request.messages=[{from:'you',text:'Please find us different museums instead.'}];
 const replacement=await fresh.service.assist(request);assert.equal(replacement.kind,'plan');assert.equal(replacement.replaceSelection,true);assert.equal(fresh.calls.length,2);assert.equal(fresh.calls.find(url=>url.pathname==='/v2/insights').searchParams.get('page'),'2');
 for(const routeOverride of [{replaceSelection:undefined},{intent:'date',replaceSelection:false,text:''}]){
  const malformed=fixture({store:first.store,routeOverride});await assert.rejects(malformed.service.assist(discussOffered(plan)),{code:'GEMINI_PLAN_INVALID'});assert.equal(malformed.calls.length,0);
 }
});
test('offered-plan follow-ups retain consent and request cancellation gates',async()=>{
 const first=fixture();await first.seed();const plan=await first.service.assist(input());const request=discussOffered(plan),blocked=fixture({store:first.store});
 await assert.rejects(blocked.service.assist({...request,consent:false}),{code:'CONSENT_REQUIRED'});
 const before=new AbortController();before.abort();await assert.rejects(blocked.service.assist(request,{signal:before.signal}),{code:'TRY_CANCELLED'});assert.equal(blocked.calls.length,0);assert.equal(blocked.contexts.length,0);
 const during=new AbortController(),pending=fixture({store:first.store,onModel:()=>during.abort(),routeOverride:{intent:'activity',replaceSelection:true,text:''}});
 await assert.rejects(pending.service.assist(request,{signal:during.signal}),{code:'TRY_CANCELLED'});assert.equal(pending.calls.length,0);
});
