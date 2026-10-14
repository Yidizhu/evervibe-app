'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {AppError}=require('../source/eve-service.cjs');
const {createPlanner}=require('../source/eve-planner.cjs');
const consent=()=>({connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}});
const input=(category='date')=>({episode:'daily',category,actor:'leo',scope:'group',locale:'zh',city:'london',mode:'common',consent:consent(),messages:[{from:'leo',text:'SHARED_REQUEST_QUIET'}],privateChats:'NEVER_FORWARD_PRIVATE'});
const brief=()=>({city:'london',mood:'gentle',duration:'few-hours',interests:['art'],summary:'慢一点，留时间聊聊。',locationRequestSupported:true});
const facts=[{id:'place-1',title:'Actual Qloo title',type:'place',address:'Provider address',tags:['Museum'],url:'https://example.com/official'},{id:'place-2',title:'Another verified place',type:'place'}];
function fixture(overrides={}){
 const sent=[],queried=[];let clock=1000;
 const qloo={recommend:async request=>{queried.push(request);if(overrides.qlooError)throw overrides.qlooError;return{source:'qloo',category:request.category,items:structuredClone(facts),seeds:[{id:'seed',title:'A shared film'}],cached:false};}};
 const gemini={structured:async(system,context,schema)=>{
  sent.push({system,context,schema});if(overrides.geminiError)throw overrides.geminiError;
  if(schema.properties.intent)return overrides.route||{intent:'activity',text:'',...brief()};
  if(schema.properties.mood)return overrides.brief||brief();
  if(overrides.curateError)throw overrides.curateError;
  return overrides.curated||{text:'先一起看会儿，再找时间聊聊。',selections:[{id:'place-1',title:'MODEL_MUST_NOT_OVERWRITE_FACT',reason:'你们都想慢一点，先看看展。',activity:'一起选一件喜欢的作品，聊聊各自看见什么。',pace:'不赶时间'}]};
 }};
 const planner=createPlanner({qloo,gemini,now:()=>clock,ttlMs:100});
 return{planner,sent,queried,tick:()=>{clock+=101;}};
}
test('all categories compose shared intent with real facts; Qloo never receives raw chat',async()=>{
 for(const category of ['date','activity','travel','movie']){
  const {planner,sent,queried}=fixture();const result=await planner.plan(input(category));
  assert.equal(result.items[0].title,'Actual Qloo title');assert.equal(result.items[0].address,'Provider address');assert(result.items[0].reason);assert(result.planId);
  assert.equal(queried[0].planning.mood,'gentle');assert.equal(queried[0].category,category);assert(!JSON.stringify(queried).includes('SHARED_REQUEST_QUIET'));
  assert(!JSON.stringify(sent).includes('NEVER_FORWARD_PRIVATE'));assert(JSON.stringify(sent).includes('SHARED_REQUEST_QUIET'));
  assert.equal(sent.length,2);assert.equal(result.sourceLang,'zh');
 }
});

test('curation receives the actual compared owners and themes without inventing a relationship score',async()=>{
 const bridge={source:'qloo',status:'ready',shared:[{id:'urn:tag:style:qloo:stylized',name:'Stylized'}],inputs:{leo:[{title:'Knives Out',type:'movie'}],julian:[{title:'Amélie',type:'movie'},{title:'Nina Simone',type:'artist'}]}};
 let sent;
 const planner=createPlanner({qloo:{recommend:async()=>({source:'qloo',items:structuredClone(facts),bridge})},gemini:{structured:async(system,context,schema)=>{
  if(schema.properties.mood)return brief();
  sent={system,context};return {text:'A place to compare what catches your eye.',selections:[{id:'place-1',reason:'Look for a detail you each love.',activity:'Choose one detail each and compare notes.',pace:'Time to talk'}]};
 }}});
 const result=await planner.plan({...input('activity'),episode:'date'});
 assert.deepEqual(sent.context.bridge,bridge);assert.deepEqual(result.bridge,bridge);
 assert.match(sent.system,/EACH owner/);assert.match(sent.system,/never a romantic compatibility/);
 assert(!JSON.stringify(sent.context).includes('NEVER_FORWARD_PRIVATE'));
});
test('gates and invalid city/category reject before any provider calls',async()=>{
 const {planner,sent,queried}=fixture();
 for(const group of ['share','receive'])for(const actor of ['leo','julian']){const request=input();request.consent[group][actor]=false;await assert.rejects(planner.plan(request),{code:'CONSENT_REQUIRED'});}
 for(const change of [{city:'https://unrecognised.example'},{category:'hotel-reservation'},{scope:'private'},{location:{lat:91,lon:0}},{location:null}])await assert.rejects(planner.plan({...input(),...change}),{code:'BAD_REQUEST'});
 assert.equal(sent.length,0);assert.equal(queried.length,0);
});
test('unsupported destination never falls back to a different city or charges Qloo',async()=>{
 const {planner,queried}=fixture({brief:{...brief(),locationRequestSupported:false}});
 await assert.rejects(planner.plan(input('travel')),{code:'PLANNING_LOCATION_UNSUPPORTED'});assert.equal(queried.length,0);
});
test('unknown or duplicate candidate IDs never appear as real recommendations',async()=>{
 for(const selections of [[{id:'invented',reason:'x',activity:'x',pace:'x'}],[{id:'place-1',reason:'x',activity:'x',pace:'x'},{id:'place-1',reason:'x',activity:'x',pace:'x'}]]){
  const {planner}=fixture({curated:{text:'MODEL_UNSUPPORTED',selections}});const result=await planner.plan(input());
  assert.equal(result.warning,'GEMINI_PLAN_INVALID');assert.equal(result.text,'');assert(!result.items.some(i=>i.id==='invented'));assert(!result.items.some(i=>i.reason));
 }
});
test('no suitable candidates is explicit, never padded with rejected suggestions',async()=>{
 const {planner}=fixture({curated:{text:'这一批不适合慢慢聊天，换个方向吧。',selections:[]}});
 const result=await planner.plan(input());assert.deepEqual(result.items,[]);assert.equal(result.warning,'PLAN_NO_FIT');
});
test('Gemini failures keep only Qloo facts; Qloo failures are not invented away',async()=>{
 const err=new AppError(502,'GEMINI_UNAVAILABLE','Provider unavailable.');
 for(const override of [{geminiError:err},{curateError:err}]){const {planner}=fixture(override);const result=await planner.plan(input());assert.equal(result.warning,'GEMINI_UNAVAILABLE');assert(!result.items.some(i=>i.reason));assert.equal(result.text,'');}
 const {planner}=fixture({qlooError:new AppError(502,'QLOO_UNAVAILABLE','Not available.')});await assert.rejects(planner.plan(input()),{code:'QLOO_UNAVAILABLE'});
});
test('server-owned plans are episode-bound, copied and expire',async()=>{
 const {planner,tick}=fixture();const result=await planner.plan(input());result.items[0].title='CLIENT_MUTATION';assert.equal(planner.getPlan(result.planId,'daily').items[0].title,'Actual Qloo title');
 assert.throws(()=>planner.getPlan(result.planId,'lifetime'),{code:'PLAN_SCOPE_MISMATCH'});tick();assert.throws(()=>planner.getPlan(result.planId,'daily'),{code:'PLAN_EXPIRED'});
});
test('abort after brief prevents subsequent Qloo lookup',async()=>{
 const controller=new AbortController();let calls=0;
 const planner=createPlanner({qloo:{recommend:async()=>{calls++;}},gemini:{structured:async()=>{controller.abort();return brief();}}});
 await assert.rejects(planner.plan(input(),{signal:controller.signal}),{code:'PLAN_CANCELLED'});assert.equal(calls,0);
});
test('chat-driven planning detects type, reuses the extracted brief and excludes private fields',async()=>{
 const {planner,sent,queried}=fixture();const request=input();delete request.category;
 const result=await planner.assist(request);assert.equal(result.kind,'plan');assert.equal(result.category,'activity');assert.equal(sent.length,2);assert.equal(queried.length,1);
 assert(!JSON.stringify(sent).includes('NEVER_FORWARD_PRIVATE'));
});
test('ordinary shared chat and candidate follow-ups need no fresh Qloo search',async()=>{
 const {planner,sent,queried}=fixture({route:{intent:'chat',text:'可以就坐下来聊一会儿。',...brief()}});
 const saved=await planner.plan(input());const calls=queried.length;
 const result=await planner.assist({...input(),planId:saved.planId});assert.equal(result.kind,'chat');assert.equal(queried.length,calls);assert(sent.at(-1).context.culturalCandidates.items.some(i=>i.title==='Actual Qloo title'));
});
test('manual city is flexible; approximate location goes only to Qloo',async()=>{
 const point={lat:-36.848578,lon:174.762924,accuracy:9};
 const {planner,sent,queried}=fixture({brief:{...brief(),city:'',useCurrentLocation:true}});
 const result=await planner.plan({...input(),location:point});assert.deepEqual(queried[0].planning.location,{lat:-36.849,lon:174.763});
 assert(!JSON.stringify(sent).includes('-36.849'));assert(!JSON.stringify(result).includes('-36.849'));assert.equal(result.brief.city,'');
 const manual=fixture({brief:{...brief(),city:'Hamilton, New Zealand'}});await manual.planner.plan({...input(),city:'Hamilton, New Zealand'});assert.equal(manual.queried[0].planning.city,'Hamilton, New Zealand');
});
test('new explicit city drops device location; malformed routing never reaches Qloo',async()=>{
 const {planner,queried}=fixture({brief:{...brief(),city:'Hamilton, New Zealand',useCurrentLocation:false}});
 await planner.plan({...input(),location:{lat:-36.849,lon:174.763}});assert.equal(queried[0].planning.location,undefined);
 const malformed=fixture({route:{intent:'booking',text:''}});await assert.rejects(malformed.planner.assist(input()),{code:'GEMINI_PLAN_INVALID'});assert.equal(malformed.queried.length,0);
});
test('expired candidate cache does not trap shared chat; cross-story ID still rejects',async()=>{
 const {planner,tick,queried}=fixture({route:{intent:'chat',text:'今晚想怎么过？',...brief()}});
 const saved=await planner.plan(input());
 await assert.rejects(planner.assist({...input(),episode:'lifetime',planId:saved.planId}),{code:'PLAN_SCOPE_MISMATCH'});
 tick();const response=await planner.assist({...input(),planId:saved.planId});assert.equal(response.kind,'chat');assert.equal(response.clearPlan,true);assert.equal(queried.length,1);
});
test('conversational request for other options uses Qloo explore page',async()=>{
 const {planner,queried}=fixture({route:{intent:'activity',mode:'explore',text:'',...brief()}});
 await planner.assist(input());assert.equal(queried[0].mode,'explore');
});
test('follow-up planning sees shared repair progress and verified selected facts without private extras',async()=>{
 const {planner,sent,queried}=fixture({route:{intent:'chat',text:'Keep the plan gentle and leave time to listen.',...brief()}});
 const request={...input(),episode:'repair'};
 const saved=await planner.plan(request),lookups=queried.length;
 const relationshipState={repairConversationComplete:true,agreement:'Text if running late.',agreementApproved:{leo:true,julian:true},selectedPlan:{source:'qloo',id:'place-1',title:'CLIENT_CANNOT_REPLACE_PROVIDER_NAME'},planApproved:{leo:true,julian:false},experienced:false,privateTranscript:'NEVER_IMPORT_PRIVATE_PROGRESS'};
 const result=await planner.assist({...request,planId:saved.planId,relationshipState,messages:[{from:'julian',text:'That one works for me.'}]});
 assert.equal(result.kind,'chat');assert.equal(queried.length,lookups);
 const context=sent.at(-1).context;assert(context.sharedStoryEvent.includes('restaurant'));
 assert.equal(context.relationshipState.selectedPlan.title,'Actual Qloo title');assert.equal(context.relationshipState.selectedPlan.candidateMatched,true);
 assert.deepEqual(context.relationshipState.planApproved,{leo:true,julian:false});assert(!JSON.stringify(context).includes('NEVER_IMPORT_PRIVATE_PROGRESS'));
});
test('curation preserves supplied architecture facts and distinguishes suggestions from facilities',async()=>{
 let selection;
 const planner=createPlanner({qloo:{recommend:async()=>({source:'qloo',items:[{id:'steel-church',title:'A cathedral',type:'place',description:'A cathedral with a stainless-steel exterior.',tags:['Architecture']}],seeds:[]})},gemini:{structured:async(system,context,schema)=>{
  if(schema.properties.mood)return brief();
  selection={system,context};return{text:'You could compare the shapes you each notice.',selections:[{id:'steel-church',reason:'An architectural detail to photograph together.',activity:'Choose one shape each and compare your photos.',pace:'Unhurried'}]};
 }}});
 const result=await planner.plan({...input('activity'),episode:'meet'});
 assert.equal(selection.context.candidates[0].description,'A cathedral with a stainless-steel exterior.');
 assert.equal(result.items[0].description,'A cathedral with a stainless-steel exterior.');
 assert.equal(result.items[0].title,'A cathedral');assert(!result.items[0].address);
 assert(selection.system.includes('concrete buildings does not make a steel building concrete'));
 assert(selection.system.includes('single Qloo result is not an opening-hours or access check'));
});
