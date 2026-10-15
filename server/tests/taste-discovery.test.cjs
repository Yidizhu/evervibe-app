'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {explainedCandidates}=require('../source/taste-discovery.cjs');
const {createTryService}=require('../source/try-service.cjs');
test('bridge rejects missing, one-sided and invalid evidence, seeds and duplicates',()=>{
 const make=(id,rows)=>({id,query:{explainability:{'signal.interests.entities':rows}}});
 const both=[{entity_id:'left',score:.55},{entity_id:'right',score:.45}];
 const items=[make('left',both),make('one',[both[0]]),make('bridge',both),make('bridge',both),make('invalid',[{entity_id:'left',score:2},both[1]])];
 const result=explainedCandidates(items,[['left'],['right']],e=>({id:e.id,title:e.id}));
 assert.deepEqual(result.map(x=>x.id),['bridge']);assert.equal(result[0].evidence.method,'qloo-explainability');
});
function fixture({fail=false,empty=false}={}){
 const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
 const entity=i=>({entity_id:ids[i],name:['Left','Right','Bridge'][i],subtype:'urn:entity:movie',properties:{release_year:2001},query:{explainability:{'signal.interests.entities':[{entity_id:ids[0],score:.52},{entity_id:ids[1],score:.48}]}}});
 const calls=[];const service=createTryService({env:{QLOO_API_KEY:'TEST_KEY'},fetch:async url=>{
  calls.push(url);
  if(url.pathname==='/search')return Response.json({results:[entity(url.searchParams.get('query')==='Left'?0:1)]});
  if(url.pathname==='/v2/analysis/compare')return Response.json({results:{tags:[]}});
  if(fail)return Response.json({error:'offline'},{status:503});
  return Response.json({results:{entities:empty?[]:[entity(0),entity(2)]}});
 }});
 const input={locale:'en',city:'Hamilton, New Zealand',consent:true,discover:true,vibes:{you:{entities:[ids[0]],note:'PRIVATE'},partner:{entities:[ids[1]],note:'PRIVATE'}}};
 return {service,input,calls,seed:async()=>{for(const query of ['Left','Right'])await service.search({query,type:'movie',locale:'en'});calls.length=0;}};
}
test('no shared tags can still yield a verified bridge with signed plan context; private text stays out',async()=>{
 const f=fixture();await f.seed();const result=await f.service.compare(f.input);
 assert.equal(result.status,'empty');assert.equal(result.discovery.status,'ready');assert.equal(result.discovery.items[0].title,'Bridge');
 assert(result.discovery.items[0].contextToken.includes('.'));
 const insights=f.calls.filter(u=>u.pathname==='/v2/insights');assert.equal(insights.length,1);assert.equal(insights[0].searchParams.get('feature.explainability'),'true');
 assert.equal(new Set(insights.map(u=>u.searchParams.get('signal.interests.entities'))).size,1);
 assert(!f.calls.some(u=>/PRIVATE|Hamilton/.test(u.href)));
 const count=f.calls.length;await f.service.compare({...f.input,locale:'zh'});assert.equal(f.calls.length,count);
});
test('empty or failing provider lists do not fabricate a bridge',async()=>{
 for(const options of [{fail:true},{empty:true}]){const f=fixture(options);await f.seed();const result=await f.service.compare(f.input);assert.equal(result.discovery.status,options.fail?'unavailable':'empty');assert.deepEqual(result.discovery.items,[]);}
});
test('discovery cannot bypass sharing or cancellation',async()=>{
 const f=fixture();await f.seed();await assert.rejects(f.service.compare({...f.input,consent:false}),{code:'CONSENT_REQUIRED'});
 const c=new AbortController();c.abort();await assert.rejects(f.service.compare(f.input,{signal:c.signal}),{code:'TRY_CANCELLED'});assert.equal(f.calls.length,0);
});
