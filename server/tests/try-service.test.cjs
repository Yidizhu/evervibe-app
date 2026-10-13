'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createTryService}=require('../source/try-service.cjs');
const {AppError}=require('../source/eve-service.cjs');
const ids={film:'11111111-1111-4111-8111-111111111111',artist:'22222222-2222-4222-8222-222222222222',book:'33333333-3333-4333-8333-333333333333',place:'44444444-4444-4444-8444-444444444444',other:'55555555-5555-4555-8555-555555555555',third:'66666666-6666-4666-8666-666666666666'};
const makeEntity=(id,type,name)=>({entity_id:id,subtype:`urn:entity:${type}`,name,properties:{release_year:2001}});
const catalog={movie:makeEntity(ids.film,'movie','Provider Film'),artist:makeEntity(ids.artist,'artist','Provider Artist'),book:makeEntity(ids.book,'book','Provider Book')};
const place=()=>({...makeEntity(ids.place,'place','Provider Cafe'),location:{lat:51.5074,lon:-0.1278},properties:{address:'Provider address, London',geocode:{city:'London',country_code:'GB'},website:'https://example.com/cafe',description:'A cafe'},tags:[{id:'urn:tag:genre:place:restaurant:cafe',name:'Cafe'}]});
const request=()=>({locale:'en',city:'london',consent:true,vibes:{you:{entities:[ids.film],note:'PRIVATE_NOTE_YOU'},partner:{entities:[ids.artist],note:'PRIVATE_NOTE_PARTNER'}},messages:[{from:'you',text:'SHARED_TEXT_CAFE'}],ignoredPrivate:'NEVER_FORWARD'});
function fixture(options={}){
 const sent=[],calls=[];let clock=1000;
 const route=()=>({intent:'date',mode:'common',text:'',mood:'gentle',duration:'few-hours',interests:['art'],...options.route});
 const gemini={structured:async(system,context,schema,{signal})=>{
  sent.push({system,context,schema,signal});if(options.onGemini)await options.onGemini({system,context,schema,signal});
  if(schema.properties.intent)return route();
  return options.curated||{text:'Try a relaxed stop together.',selections:[{id:ids.place,reason:'Your film and music interests give you something to exchange.',activity:'Choose one song and one scene to tell each other about.',title:'INVENTED_TITLE',address:'INVENTED_ADDRESS'}]};
 }};
 const fetch=async(url,init)=>{
  calls.push({url:new URL(url),init});
  if(options.onFetch)return options.onFetch(url,init);
  if(url.pathname==='/v2/analysis/compare')return options.compareResponse ? options.compareResponse() : Response.json({results:{tags:options.compareTags||[]}});
  if(url.pathname==='/search'){
   const type=url.searchParams.get('types').replace('urn:entity:','');
   return {ok:true,status:200,json:async()=>({results:options.searchResults||[catalog[type]]})};
  }
  return {ok:true,status:200,json:async()=>({results:{entities:options.results||[place()]}})};
 };
 const service=createTryService({env:{QLOO_API_KEY:'TEST_KEY',...options.env},fetch,gemini,now:()=>clock,entityTtlMs:1000,...options.service});
 const seed=async()=>{for(const type of ['movie','artist','book'])await service.search({query:type,type,locale:'en'});calls.length=0;};
 return {service,sent,calls,seed,tick:amount=>{clock+=amount;}};
}

test('typed search trusts provider identity, caps six results and caches without extra requests',async()=>{
 const f=fixture();const result=await f.service.search({query:'Film',type:'movie',locale:'en',title:'CLIENT_FAKE'});
 assert.deepEqual(result.items,[{id:ids.film,title:'Provider Film',type:'movie',year:2001}]);
 assert.equal(f.calls[0].url.origin,'https://hackathon.api.qloo.com');assert.equal(f.calls[0].url.pathname,'/search');assert.equal(f.calls[0].url.searchParams.get('types'),'urn:entity:movie');assert.equal(f.calls[0].init.redirect,'manual');
 result.items[0].title='MUTATED';assert.equal((await f.service.search({query:'film',type:'movie',locale:'zh'})).items[0].title,'Provider Film');assert.equal(f.calls.length,1);
 const many=fixture({searchResults:Array.from({length:8},(_,i)=>makeEntity(`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,'movie',`Film ${i}`))});assert.equal((await many.service.search({query:'x',type:'movie',locale:'en'})).items.length,6);
 const invalid=fixture({searchResults:[catalog.artist,{...catalog.movie,entity_id:'bad'},catalog.movie,catalog.movie]});assert.equal((await invalid.service.search({query:'x',type:'movie',locale:'en'})).items.length,1);
});

test('both independently selected profiles affect Qloo IDs; personal text stays only with Gemini',async()=>{
 const f=fixture();await f.seed();const result=await f.service.assist(request());
 assert.equal(result.kind,'plan');assert.equal(result.source,'qloo');assert.equal(result.items[0].title,'Provider Cafe');assert.equal(result.items[0].address,'Provider address, London');assert.equal(result.items[0].reason.length>0,true);
 assert.deepEqual(result.seeds.map(s=>[s.owner,s.title]),[['you','Provider Film'],['partner','Provider Artist']]);
 assert.equal(f.calls.find(c=>c.url.pathname==='/v2/insights').url.searchParams.get('signal.interests.entities'),`${ids.film},${ids.artist}`);
 const allQloo=f.calls.map(c=>c.url.href).join('');for(const text of ['PRIVATE_NOTE_YOU','PRIVATE_NOTE_PARTNER','SHARED_TEXT_CAFE','NEVER_FORWARD'])assert(!allQloo.includes(text));
 assert(JSON.stringify(f.sent).includes('PRIVATE_NOTE_YOU'));assert(!JSON.stringify(f.sent).includes('NEVER_FORWARD'));
 const changed=request();changed.vibes.partner.entities=[ids.book];await f.service.assist(changed);
 assert.equal(f.calls.filter(c=>c.url.pathname==='/v2/insights')[1].url.searchParams.get('signal.interests.entities'),`${ids.film},${ids.book}`);
});

test('routing and selection prompts distinguish personal wishes from verified venue conditions in both languages',async()=>{
 for(const locale of ['en','zh']){
  const f=fixture();await f.seed();const input=request();input.locale=locale;
  input.vibes.you.note='QUIET_WISH_CANARY: quiet, no crowds, somewhere to sit and have tea.';
  input.messages=[{from:'eve',text:'Earlier unverified suggestion: this is a quiet book gallery with seats.'},{from:'you',text:'Can we find a place like that?'}];
  await f.service.assist(input);assert.equal(f.sent.length,2);
  for(const call of f.sent){
   assert.match(call.system,/Never turn a preference into a venue fact/);
   for(const condition of ['quiet','crowds','seating','cafe','tea service'])assert(call.system.includes(condition));
   assert.match(call.system,/conditional/);assert.match(call.system,/check them/);
   assert.match(call.system,/Earlier EVE messages[\s\S]*not evidence of venue facts/);
  }
  assert.match(f.sent[1].system,/text, reason and activity/);
  assert.match(f.sent[1].system,/search filters do not verify/);
  const candidate=f.sent[1].context.candidates[0];
  assert.equal(candidate.description,'A cafe');
  assert(!JSON.stringify(candidate).includes('QUIET_WISH_CANARY'));
  assert(!f.calls.some(call=>call.url.href.includes('QUIET_WISH_CANARY')));
 }
});

test('consent, unknown IDs and expired IDs reject before any AI lookup',async()=>{
 const f=fixture();await f.seed();
 await assert.rejects(f.service.assist({...request(),consent:false}),{code:'CONSENT_REQUIRED'});
 const unknown=request();unknown.vibes.partner.entities=[ids.other];await assert.rejects(f.service.assist(unknown),{code:'TRY_INTEREST_EXPIRED'});
 f.tick(1001);await assert.rejects(f.service.assist(request()),{code:'TRY_INTEREST_EXPIRED'});
 assert.equal(f.sent.length,0);assert.equal(f.calls.length,0);
});

test('invalid cities, bounds and messages never call a provider',async()=>{
 const f=fixture();await f.seed();
 const examples=[{city:'auckland'},{city:'https://evil.invalid'},{locale:'xx'},{messages:[{from:'eve',text:'Ask me.'}]},{messages:[{from:'you',text:'x'.repeat(1501)}]},{messages:Array.from({length:21},()=>({from:'you',text:'x'}))}];
 for(const change of examples)await assert.rejects(f.service.assist({...request(),...change}),{code:'BAD_REQUEST'});
 for(const profile of [{entities:[],note:''},{entities:[ids.film],note:'x'.repeat(161)},{entities:[ids.film,ids.film],note:''}]){const bad=request();bad.vibes.you=profile;await assert.rejects(f.service.assist(bad),{code:'BAD_REQUEST'});}
 for(const change of [{type:'person'},{query:''},{query:'x'.repeat(101)},{query:'a\nb'}])await assert.rejects(f.service.search({query:'valid',locale:'en',type:'movie',...change}),{code:'BAD_REQUEST'});
 assert.equal(f.sent.length,0);assert.equal(f.calls.length,0);
});

test('chat needs no fresh Qloo call and never invents companion messages',async()=>{
 const f=fixture({route:{intent:'chat',text:'Tell me what would make tonight feel easier.'}});await f.seed();const result=await f.service.assist(request());
 assert.equal(result.kind,'chat');assert.equal(result.source,'gemini');assert.equal(f.calls.length,0);assert.deepEqual(result.items,[]);assert.equal(result.messages,undefined);
});

test('Gemini hallucinated or repeated choice IDs reject instead of becoming provider facts',async()=>{
 for(const selections of [[{id:'hallucinated',reason:'x',activity:'x'}],[{id:ids.place,reason:'x',activity:'x'},{id:ids.place,reason:'x',activity:'x'}]]){
  const f=fixture({curated:{text:'Made-up result',selections}});await f.seed();await assert.rejects(f.service.assist(request()),{code:'GEMINI_PLAN_INVALID'});
 }
});

test('Qloo coordinates, country, category and radius filter candidates before Gemini',async()=>{
 const wrongCountry=place();wrongCountry.entity_id=ids.other;wrongCountry.properties.geocode.country_code='NZ';
 const far=place();far.entity_id=ids.third;far.location={lat:-41.2866,lon:174.7756};
 const malformed=place();malformed.location={lat:100,lon:0};
 const unlocated=place();delete unlocated.location;
 const wrongTag=place();wrongTag.tags=[{id:'urn:tag:genre:place:hotel'}];
 const f=fixture({results:[wrongCountry,far,malformed,unlocated,wrongTag,place()]});await f.seed();const result=await f.service.assist(request());
 assert.deepEqual(f.sent[1].context.candidates.map(c=>c.id),[ids.place]);
 assert(!JSON.stringify(result).includes('51.5074'));assert(!JSON.stringify(f.sent[1].context.candidates).includes('51.5074'));
 assert.equal(result.items[0].location,undefined);assert.equal(result.items[0].url,'https://example.com/cafe');
 const unsafe=place();unsafe.properties.website='http://127.0.0.1/private';const g=fixture({results:[unsafe]});await g.seed();assert.equal((await g.service.assist(request())).items[0].url,undefined);
});

test('empty or invalid provider results never get invented away; empty curation is retained',async()=>{
 const f=fixture({results:[]});await f.seed();await assert.rejects(f.service.assist(request()),{code:'NO_RECOMMENDATIONS'});assert.equal(f.sent.length,1);
 const g=fixture({curated:{text:'These do not fit the pace you want.',selections:[]}});await g.seed();assert.deepEqual((await g.service.assist(request())).items,[]);
});

test('cross-domain activity, film and nearby travel use strict Qloo output types',async()=>{
 const museum=place();museum.tags=[{id:'urn:tag:genre:place:museum',name:'Museum'}];
 const destination=makeEntity(ids.place,'destination','Nearby destination');destination.location={lat:51.75,lon:-1.25};destination.properties={geocode:{country_code:'GB',city:'Oxford'}};
 for(const [category,candidate,type] of [['activity',museum,'place'],['movie',makeEntity(ids.place,'movie','Provider movie'),'movie'],['travel',destination,'destination']]){
  const f=fixture({route:{intent:category,duration:category==='travel'?'weekend':'few-hours'},results:[candidate]});await f.seed();const result=await f.service.assist(request());
  assert.equal(result.category,category);assert.equal(result.items[0].type,type);assert.equal(f.calls.find(c=>c.url.pathname==='/v2/insights').url.searchParams.get('filter.type'),`urn:entity:${type}`);
 }
});

test('caller cancellation before, during routing and during Qloo prevents subsequent work',async()=>{
 const f=fixture();await f.seed();const before=new AbortController();before.abort();await assert.rejects(f.service.assist(request(),{signal:before.signal}),{code:'TRY_CANCELLED'});assert.equal(f.sent.length,0);
 const during=new AbortController(),g=fixture({onGemini:()=>during.abort()});await g.seed();await assert.rejects(g.service.assist(request(),{signal:during.signal}),{code:'TRY_CANCELLED'});assert.equal(g.calls.length,0);
 const controller=new AbortController();const h=fixture({onFetch:async(url,{signal})=>{if(url.pathname==='/search')return{ok:true,status:200,json:async()=>({results:[catalog.movie]})};controller.abort();return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));}});
 await h.service.search({query:'x',type:'movie',locale:'en'});const shared=request();shared.vibes.partner.entities=[ids.film];await assert.rejects(h.service.assist(shared,{signal:controller.signal}),{code:'TRY_CANCELLED'});assert.equal(h.sent.length,1);
});

test('timeouts are bounded with no automatic provider retry and never leak provider error text',async()=>{
 const f=fixture({onFetch:()=>new Promise(()=>{}),service:{timeoutMs:15}});await assert.rejects(f.service.search({query:'x',type:'movie',locale:'en'}),{code:'QLOO_TIMEOUT'});assert.equal(f.calls.length,1);
 const g=fixture({onFetch:async()=>{throw new Error('SECRET_HEADER_AND_PRIVATE_URL');}});await assert.rejects(g.service.search({query:'x',type:'movie',locale:'en'}),error=>error.code==='QLOO_UNAVAILABLE'&&!error.message.includes('SECRET'));
 const h=fixture({onGemini:()=>new Promise(()=>{}),service:{geminiTimeoutMs:15}});await h.seed();await assert.rejects(h.service.assist(request()),{code:'GEMINI_TIMEOUT'});assert.equal(h.calls.length,0);
});

test('configuration cannot redirect an API key and rate limits impose a cooldown',async()=>{
 const f=fixture({env:{QLOO_API_BASE_URL:'https://evil.invalid'}});await assert.rejects(f.service.search({query:'x',type:'movie',locale:'en'}),{code:'QLOO_CONFIG_INVALID'});assert.equal(f.calls.length,0);
 const g=fixture({onFetch:async()=>({ok:false,status:429})});await assert.rejects(g.service.search({query:'x',type:'movie',locale:'en'}),{code:'QLOO_RATE_LIMIT'});await assert.rejects(g.service.search({query:'y',type:'movie',locale:'en'}),{code:'QLOO_RATE_LIMIT'});assert.equal(g.calls.length,1);
});

test('routing errors stop; transient curator errors preserve genuine Qloo results without retries',async()=>{
 for(const code of ['GEMINI_RATE_LIMIT','GEMINI_AUTH_FAILED','GEMINI_UNAVAILABLE']){
  const f=fixture({onGemini:()=>{throw new AppError(503,code,'Provider unavailable.');}});await f.seed();
  await assert.rejects(f.service.assist(request()),{code});assert.equal(f.sent.length,1);assert.equal(f.calls.length,0);
  const g=fixture({onGemini:({schema})=>{if(schema.properties.selections)throw new AppError(503,code,'Provider unavailable.');}});await g.seed();
  if(code==='GEMINI_AUTH_FAILED')await assert.rejects(g.service.assist(request()),{code});
  else {const result=await g.service.assist(request());assert.equal(result.explanationAvailable,false);assert.equal(result.source,'qloo');assert.equal(result.items[0].id,ids.place);assert.equal(result.items[0].reason,'');assert.equal(result.items[0].activity,'');}
  assert.equal(g.sent.length,2);assert.equal(g.calls.length,2);
 }
});

test('Unicode searches stay intact and do not invent a Qloo language parameter',async()=>{
 const f=fixture();await f.service.search({query:'千と千尋の神隠し',type:'movie',locale:'zh'});
 assert.equal(f.calls[0].url.searchParams.get('query'),'千と千尋の神隠し');
 assert.deepEqual([...f.calls[0].url.searchParams.keys()].sort(),['query','take','types']);
});

test('a shared public catalog allows search and assist in different service instances',async()=>{
 const saved=new Map(),writes=[];
 const catalogStore={get:async id=>structuredClone(saved.get(id)),set:async(id,entry,options)=>{writes.push({id,entry,options});saved.set(id,structuredClone(entry));}};
 const first=fixture({service:{catalogStore}});await first.seed();
 assert.equal(writes.length,3);assert.equal(writes[0].options.ttlSeconds,1);assert(!JSON.stringify(writes).includes('PRIVATE_NOTE'));
 const second=fixture({service:{catalogStore}});const result=await second.service.assist(request());
 assert.equal(result.items[0].title,'Provider Cafe');assert.deepEqual(second.calls.map(call=>call.url.pathname),['/v2/analysis/compare','/v2/insights'],'No search repeats in the second instance');
 const third=fixture({service:{catalogStore}});third.tick(1001);await assert.rejects(third.service.assist(request()),{code:'TRY_INTEREST_EXPIRED'});assert.equal(third.sent.length,0);
});

test('shared catalog errors, malformed entries and cancellation fail before a model call',async()=>{
 const f=fixture({service:{catalogStore:{get:async()=>{throw new Error('PRIVATE_STORAGE_CONFIG');},set:async()=>{}}}});
 await assert.rejects(f.service.assist(request()),error=>error.code==='TRY_CATALOG_UNAVAILABLE'&&!error.message.includes('PRIVATE_STORAGE_CONFIG'));assert.equal(f.sent.length,0);
 const g=fixture({service:{catalogStore:{get:async()=>({expires:9000,item:{id:ids.other,title:'Forged',type:'person'}}),set:async()=>{}}}});
 await assert.rejects(g.service.assist(request()),{code:'TRY_INTEREST_EXPIRED'});assert.equal(g.sent.length,0);
 const controller=new AbortController(),h=fixture({service:{catalogStore:{get:async()=>{controller.abort();return new Promise(()=>{});},set:async()=>{}}}});
 await assert.rejects(h.service.assist(request(),{signal:controller.signal}),{code:'TRY_CANCELLED'});assert.equal(h.sent.length,0);
 const timed=fixture({service:{catalogTimeoutMs:10,catalogStore:{get:async()=>new Promise(()=>{}),set:async()=>{}}}});
 await assert.rejects(timed.service.assist(request()),{code:'TRY_CATALOG_TIMEOUT'});assert.equal(timed.sent.length,0);
});

const commonTags=[{tag_id:'urn:tag:genre:media:comedy',name:'Comedy',query:{score:0.91}},{tag_id:'urn:tag:style:qloo:stylized',name:'Stylized'}];
test('compare sends separate verified groups and returns public themes, never scores or notes',async()=>{
 const f=fixture({compareTags:commonTags});await f.seed();const result=await f.service.compare({...request(),shared:[{id:'urn:tag:fake',name:'Soulmates'}]});
 assert.equal(result.status,'ready');assert.equal(result.source,'qloo');assert.equal(f.sent.length,0);assert.equal(f.calls.length,1);
 const params=f.calls[0].url.searchParams;assert.equal(params.get('a.signal.interests.entities'),ids.film);assert.equal(params.get('b.signal.interests.entities'),ids.artist);assert.equal([...params].length,2);
 assert.deepEqual(result.shared,[{id:commonTags[0].tag_id,name:'Comedy'},{id:commonTags[1].tag_id,name:'Stylized'}]);
 assert.deepEqual(result.inputs.you,[{id:ids.film,title:'Provider Film',type:'movie'}]);
 for(const text of ['PRIVATE_NOTE','SHARED_TEXT','Soulmates','score'])assert(!JSON.stringify(result).includes(text));
 assert(!f.calls[0].url.href.includes('PRIVATE_NOTE'));
});
test('compare caches public themes but recomputes when either person changes an interest',async()=>{
 const f=fixture({compareTags:commonTags,service:{entityTtlMs:2000000}});await f.seed();assert.equal((await f.service.compare(request())).cached,false);
 const translated={...request(),locale:'zh'};translated.vibes.you.note='A different private mood';assert.equal((await f.service.compare(translated)).cached,true);assert.equal(f.calls.length,1);
 translated.vibes.partner.entities=[ids.book];assert.equal((await f.service.compare(translated)).cached,false);assert.equal(f.calls.length,2);
 f.tick(15*60*1000+1);assert.equal((await f.service.compare(translated)).cached,false);assert.equal(f.calls.length,3);
});
test('compare gates consent, verified interests and cancellation before any lookup',async()=>{
 const f=fixture();await f.seed();await assert.rejects(f.service.compare({...request(),consent:false}),{code:'CONSENT_REQUIRED'});
 const unknown=request();unknown.vibes.you.entities=[ids.other];await assert.rejects(f.service.compare(unknown),{code:'TRY_INTEREST_EXPIRED'});
 const controller=new AbortController();controller.abort();await assert.rejects(f.service.compare(request(),{signal:controller.signal}),{code:'TRY_CANCELLED'});assert.equal(f.calls.length,0);
});
test('real compare themes enter insights signals and the explanation context',async()=>{
 const f=fixture({compareTags:commonTags});await f.seed();await f.service.compare(request());const result=await f.service.assist({...request(),shared:[{id:'urn:tag:fake',name:'Fake'}]});
 assert.equal(f.calls.filter(c=>c.url.pathname==='/v2/analysis/compare').length,1);
 const insights=f.calls.find(c=>c.url.pathname==='/v2/insights').url;assert.equal(insights.searchParams.get('signal.interests.entities'),`${ids.film},${ids.artist}`);
 for(const tag of commonTags)assert(insights.searchParams.get('signal.interests.tags').split(',').includes(tag.tag_id));
 assert(!insights.href.includes('urn%3Atag%3Afake'));assert.deepEqual(result.sharedTagsApplied,commonTags.map(tag=>tag.tag_id));
 assert.deepEqual(f.sent[1].context.bridge.shared,result.bridge.shared);assert.match(f.sent[1].system,/from EACH person/);
});
test('no overlap and compare outages stay explicit while entity-based recommendations continue',async()=>{
 for(const options of [{},{compareResponse:()=>Response.json({error:'offline'},{status:503})},{compareResponse:()=>Response.json({results:{a:[],b:[]}})}]){
  const f=fixture(options);await f.seed();const result=await f.service.assist(request());assert.equal(result.items[0].title,'Provider Cafe');assert.deepEqual(result.bridge.shared,[]);assert.deepEqual(result.sharedTagsApplied,[]);
  assert.equal(result.bridge.status,options.compareResponse?'unavailable':'empty');
  const count=f.calls.length;await f.service.compare(request());assert.equal(f.calls.length,count,'Failure and empty results are briefly cached');
 }
});
