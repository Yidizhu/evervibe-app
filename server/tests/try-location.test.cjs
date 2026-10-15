'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createTryService}=require('../source/try-service.cjs');
const {requestParameters,cityDefinition}=require('../source/qloo-support.cjs');
const ids={a:'11111111-1111-4111-8111-111111111111',b:'22222222-2222-4222-8222-222222222222',hamilton:'33333333-3333-4333-8333-333333333333',paris:'44444444-4444-4444-8444-444444444444',outside:'55555555-5555-4555-8555-555555555555'};
const centres={hamilton:{lat:-37.787,lon:175.279},paris:{lat:48.857,lon:2.352}};
const place=(city,id,location,countryCode)=>({entity_id:id,type:'urn:entity:place',name:city+' Museum',location,properties:{geocode:{city,country_code:countryCode}},tags:[{id:'urn:tag:genre:place:museum',name:'Museum'}]});
const fixtures={hamilton:place('Hamilton',ids.hamilton,centres.hamilton,'NZ'),paris:place('Paris',ids.paris,centres.paris,'FR')};

test('New York city names do not use the provider state centre or discard valid NYC venues',async()=>{
 const nyc=place('New York',ids.hamilton,{lat:40.722,lon:-73.993},'US');
 const upstate=place('New York state',ids.outside,{lat:42.923,lon:-75.598},'US');
 const foreign={...nyc,entity_id:ids.paris,properties:{geocode:{country_code:'FR'}}};
 const f=fixture({insights:async()=>Response.json({query:{localities:{filter:[{name:'New York',location:upstate.location}]}},results:{entities:[nyc,upstate,foreign]}})});await f.seed();
 for(const city of ['New York, United States','New York City','NYC',' New York , USA ']){
  const result=await f.service.assist(input({city}));
  assert.deepEqual(result.items.map(item=>item.id),[nyc.entity_id]);
  const url=f.calls.filter(call=>call.pathname==='/v2/insights').at(-1);
  assert.equal(url.searchParams.get('filter.location'),'POINT(-74.006 40.7128)');
  assert.equal(url.searchParams.get('filter.geocode.country_code'),'US');
  assert(!url.searchParams.has('filter.location.query'));
 }
});

test('NYC disambiguation does not rewrite other cities, state requests or device locations',()=>{
 for(const city of ['New York State','York, United States','New York, United Kingdom','Paris, France']){
  assert.equal(cityDefinition(city),undefined);
  assert.equal(requestParameters('activity',{city,mood:'curious',interests:[]})['filter.location.query'],city);
 }
 const params=requestParameters('activity',{city:'New York, United States',location:centres.paris,mood:'curious',interests:[]});
 assert.equal(params['filter.location'],'POINT(2.352 48.857)');assert.equal(params['filter.geocode.country_code'],undefined);
});
const input=overrides=>({locale:'en',city:'nearby',consent:true,vibes:{you:{entities:[ids.a],note:''},partner:{entities:[ids.b],note:''}},messages:[{from:'you',text:'Find an art museum for us.'}],...overrides});
function fixture(options={}){
 const calls=[],contexts=[];
 const service=createTryService({env:{QLOO_API_KEY:'TEST_LOCATION_KEY'},fetch:async url=>{
  calls.push(new URL(url));
  if(url.pathname==='/search')return Response.json({results:[{entity_id:url.searchParams.get('query')==='A'?ids.a:ids.b,type:'urn:entity:movie',name:url.searchParams.get('query')}]});
  if(url.pathname==='/v2/analysis/compare')return Response.json({results:{tags:[]}});
  if(options.insights)return options.insights(new URL(url));
  return Response.json({results:{entities:[fixtures.hamilton,fixtures.paris]}});
 },gemini:{structured:async(system,context,schema)=>{
  contexts.push(structuredClone(context));
  if(schema.properties.intent){
   if(context.selectedPlan||context.offeredPlans)return {intent:'chat',mode:'common',text:'Keep the museum you chose.',mood:'curious',duration:'few-hours',interests:[],replaceSelection:false};
   return {intent:'activity',mode:'common',text:'',mood:'curious',duration:'few-hours',interests:[]};
  }
  return {text:'Choose a museum to explore together.',selections:context.candidates.map(item=>({id:item.id,reason:'A place to explore your interests.',activity:'Talk about one piece that catches your eye.'}))};
 }}});
 const seed=async()=>{for(const query of ['A','B'])await service.search({query,type:'movie',locale:'en'});calls.length=0;};
 return {service,calls,contexts,seed};
}

test('Try Hamilton and Paris points produce different venues, correct longitude-first WKT and no stale story-country filter',async()=>{
 const f=fixture();await f.seed();
 const h=await f.service.assist(input({city:'tokyo',location:{...centres.hamilton,accuracy:9}}));
 const p=await f.service.assist(input({city:'london',location:centres.paris}));
 assert.deepEqual(h.items.map(item=>item.id),[ids.hamilton]);assert.deepEqual(p.items.map(item=>item.id),[ids.paris]);
 const requests=f.calls.filter(url=>url.pathname==='/v2/insights');assert.equal(requests.length,2);
 assert.equal(requests[0].searchParams.get('filter.location'),'POINT(175.279 -37.787)');
 assert.equal(requests[1].searchParams.get('filter.location'),'POINT(2.352 48.857)');
 for(const url of requests){assert.equal(url.searchParams.get('filter.location.radius'),'15000');assert(!url.searchParams.has('filter.location.query'));assert(!url.searchParams.has('filter.geocode.country_code'));}
 // Only taste comparison is cached. Location-specific candidate requests stay distinct.
 assert.equal(f.calls.filter(url=>url.pathname==='/v2/analysis/compare').length,1);assert.equal(p.bridge.cached,true);
 for(const context of f.contexts){assert.equal(context.city,'nearby');assert.equal(context.location,undefined);assert.equal(context.locationScope,undefined);}
 const publicText=JSON.stringify([f.contexts,h,p]);
 for(const point of ['175.279','-37.787','2.352','48.857'])assert(!publicText.includes(point));
 assert.equal(h.city,'nearby');assert.equal(p.city,'nearby');
});

test('Try accepts arbitrary Unicode cities and validates candidates against the actual Qloo locality centre',async()=>{
 for(const city of ['Hamilton, New Zealand','Paris, France','東京都 日本']){
  const chosen=city.startsWith('Hamilton')?'hamilton':'paris',candidate=fixtures[chosen];
  const f=fixture({insights:async()=>Response.json({query:{localities:{filter:[{name:city,location:centres[chosen]}]}},results:{entities:[fixtures.hamilton,fixtures.paris]}})});await f.seed();
  const result=await f.service.assist(input({city:'  '+city+'  '}));
  const url=f.calls.find(url=>url.pathname==='/v2/insights');
  assert.equal(url.searchParams.get('filter.location.query'),city);assert(!url.searchParams.has('filter.location'));assert(!url.searchParams.has('filter.geocode.country_code'));
  assert.equal(result.city,city);assert.deepEqual(result.items.map(item=>item.id),[candidate.entity_id]);assert.equal(f.contexts[0].cityLabel,city);
  assert(!JSON.stringify(f.contexts).includes(String(centres[chosen].lat)));
 }
});

test('a provider locality country is checked without inventing one from a story city',async()=>{
 const wrong={...fixtures.hamilton,entity_id:ids.outside,properties:{geocode:{city:'Wrong country',country_code:'JP'}}};
 const f=fixture({insights:async()=>Response.json({query:{localities:{filter:[{name:'Hamilton City',location:centres.hamilton,country_code:'NZ'}]}},results:{entities:[wrong,fixtures.hamilton]}})});await f.seed();
 assert.deepEqual((await f.service.assist(input({city:'Hamilton, New Zealand'}))).items.map(item=>item.id),[ids.hamilton]);
});

test('legacy locality signal shape and provider-filtered results without a centre do not crash free-city requests',async()=>{
 for(const query of [{locality:{signal:{name:'Hamilton',location:centres.hamilton}}},undefined]){
  const f=fixture({insights:async()=>Response.json({query,results:{entities:[fixtures.hamilton]}})});await f.seed();
  assert.equal((await f.service.assist(input({city:'Hamilton, New Zealand'}))).items[0].id,ids.hamilton);
 }
});

test('missing, reserved and unsafe cities fail before catalog or model work instead of silently choosing Tokyo',async()=>{
 const f=fixture();await f.seed();
 for(const city of [undefined,null,'','   ','nearby',' NEARBY ','https://example.com','example.com','a/b','<London>','Paris\nFrance','x'.repeat(101)]){
  await assert.rejects(f.service.assist(input({city})),{code:'BAD_REQUEST'});
 }
 assert.equal(f.calls.length,0);assert.equal(f.contexts.length,0);
 const result=await f.service.assist(input({city:'',location:centres.hamilton}));
 assert.equal(result.city,'nearby');assert.equal(result.items[0].id,ids.hamilton);
});

test('city-resolution errors remain actionable and never fall back to a story city',async()=>{
 for(const makeResponse of [()=>new Response('{"error":"TEST_LOCATION_KEY"}',{status:400}),()=>Response.json({query:{localities:{filter:[]}},results:{entities:[fixtures.paris]}})]){
  const f=fixture({insights:makeResponse});await f.seed();
  await assert.rejects(f.service.assist(input({city:'Unmatched Town'})),error=>error.code==='LOCATION_NOT_FOUND'&&error.status===422&&!error.message.includes('TEST_LOCATION_KEY'));
  assert.equal(f.calls.filter(url=>url.pathname==='/v2/insights').length,1);assert.equal(f.contexts.length,1);
  assert.equal(f.calls.at(-1).searchParams.get('filter.location.query'),'Unmatched Town');
 }
});

test('empty or distant real results never become fabricated local recommendations',async()=>{
 for(const entities of [[],[fixtures.paris],[{...fixtures.hamilton,location:undefined}]]){
  const f=fixture({insights:async()=>Response.json({query:{localities:{filter:[{name:'Hamilton',location:centres.hamilton}]}},results:{entities}})});await f.seed();
  await assert.rejects(f.service.assist(input({city:'Hamilton, New Zealand'})),{code:'NO_RECOMMENDATIONS'});assert.equal(f.contexts.length,1);
 }
});

test('changing real location invalidates both selected and offered options even when taste comparison is cached',async()=>{
 const f=fixture();await f.seed();const plan=await f.service.assist(input({location:centres.hamilton}));
 const token=plan.items[0].contextToken;f.calls.length=0;f.contexts.length=0;
 for(const extra of [{selection:{token,confirmed:{you:true,partner:true}}},{offeredPlans:[token]}]){
  for(const changed of [{city:'nearby',location:centres.paris},{city:'Hamilton, New Zealand'},{city:'Paris, France'}]){
   await assert.rejects(f.service.assist(input({...changed,...extra})),{code:'TRY_PLAN_INVALID'});
  }
 }
 assert.equal(f.calls.length,0);assert.equal(f.contexts.length,0);
 // The irrelevant fallback city does not change a valid location-bound choice.
 assert.equal((await f.service.assist(input({city:'tokyo',location:centres.hamilton,selection:{token,confirmed:{you:true,partner:false}}}))).kind,'chat');
});

test('switching a free-text city invalidates its signed offered and selected plans',async()=>{
 const f=fixture({insights:async()=>Response.json({query:{localities:{filter:[{location:centres.hamilton}]}},results:{entities:[fixtures.hamilton]}})});await f.seed();
 const plan=await f.service.assist(input({city:'Hamilton, New Zealand'})),token=plan.items[0].contextToken;
 for(const extra of [{offeredPlans:[token]},{selection:{token,confirmed:{you:true,partner:true}}}])await assert.rejects(f.service.assist(input({city:'Paris, France',...extra})),{code:'TRY_PLAN_INVALID'});
});
