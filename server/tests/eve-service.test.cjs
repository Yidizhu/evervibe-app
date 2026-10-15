'use strict';
require('./offline.cjs');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {createEveService,AppError}=require('../source/eve-service.cjs');
const {validCity,normalizeLocation,normalizePlanning,requestParameters}=require('../source/qloo-support.cjs');
const {CULTURAL_ARTIST_SEEDS,PROFILES}=require('../source/vibe-profiles.cjs');
const TYPE='urn:entity:movie';
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
const env={QLOO_API_KEY:'not-a-real-key'};
const consent=()=>({connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}});
const input=()=>({episode:'date',mode:'common',locale:'zh',consent:consent()});
const entity=(name,id,year)=>({name,entity_id:id,types:[TYPE],properties:{release_year:year}});
const response=body=>({ok:true,status:200,json:async()=>body});
function fixture(overrides={}) {
  const calls=[];
  const fetch=async(url,options)=>{
    calls.push({url:new URL(url),options});
    if(overrides.handle)return overrides.handle(url,options,calls);
    if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
    if(url.pathname==='/v2/analysis/compare')return response({results:{tags:[{tag_id:'urn:tag:genre:media:comedy',name:'Comedy'},{tag_id:'urn:tag:style:qloo:stylized',name:'Stylized'}]}});
    return response({results:{entities:[{...entity('A real returned title',ids[2],2020),properties:{release_year:2020,description:'Provider description',websites:['javascript:alert(1)','https://example.com/movie']}}]}});
  };
  return {calls,service:createEveService({env,fetch,...overrides})};
}
test('mutual sharing and receiving required before any request or cached read',async()=>{
  const {calls,service}=fixture();
  for(const group of ['share','receive'])for(const actor of ['leo','julian']) {
    const request=input();request.consent[group][actor]=false;
    await assert.rejects(service.recommend(request),error=>error instanceof AppError&&error.status===403&&error.code==='CONSENT_REQUIRED');
  }
  const disconnected=input();disconnected.consent.connected=false;
  await assert.rejects(service.recommend(disconnected),{code:'CONSENT_REQUIRED'});assert.equal(calls.length,0);
  await service.recommend(input());const revoked=input();revoked.consent.share.leo=false;
  await assert.rejects(service.recommend(revoked),{code:'CONSENT_REQUIRED'});assert.equal(calls.length,4);
});
test('fixed requests exclude private text and client seeds; response exposes only selected fields',async()=>{
  const {calls,service}=fixture();const result=await service.recommend({...input(),query:'PRIVATE_CHAT_CANARY',seeds:['ATTACKER_SEED']});
  assert.equal(calls.length,4);
  assert.equal(calls[0].url.origin,'https://hackathon.api.qloo.com');
  assert.equal(calls[0].options.redirect,'manual');
  assert.equal(calls[0].url.searchParams.get('types'),TYPE);
  const signalIds=[...ids.slice(0,2),CULTURAL_ARTIST_SEEDS[1][0].id].join(',');
  assert.equal(calls[3].url.searchParams.get('signal.interests.entities'),signalIds);
  assert.equal(calls[3].url.searchParams.get('filter.exclude.entities'),signalIds);
  assert.equal(calls[3].url.searchParams.get('take'),'3');
  assert(!calls.some(call=>call.url.href.includes('PRIVATE')||call.url.href.includes('ATTACKER')));
  assert.deepEqual(result.items,[{id:ids[2],title:'A real returned title',type:'movie',description:'Provider description',year:2020,url:'https://example.com/movie'}]);
  assert(!JSON.stringify(result).includes(env.QLOO_API_KEY));
});

test('common taste compares owners separately and changes the actual Insights signals',async()=>{
  const {calls,service}=fixture();
  const result=await service.recommend({...input(),planning:{interests:['art']},privateChats:'PRIVATE_COMPARE_CANARY'});
  const compare=calls.find(call=>call.url.pathname==='/v2/analysis/compare').url.searchParams;
  assert.equal(compare.get('a.signal.interests.entities'),ids[0]);
  assert.deepEqual(compare.get('b.signal.interests.entities').split(',').sort(),[ids[1],CULTURAL_ARTIST_SEEDS[1][0].id].sort());
  assert.equal(result.bridge.status,'ready');
  assert.deepEqual(result.bridge.inputs.leo.map(seed=>seed.title),['Knives Out']);
  assert.deepEqual(result.bridge.inputs.julian.map(seed=>seed.title),['Amélie','Nina Simone']);
  assert.deepEqual(result.sharedTagsApplied,['urn:tag:style:qloo:stylized','urn:tag:genre:media:comedy']);
  const tags=calls.at(-1).url.searchParams.get('signal.interests.tags').split(',');
  for(const id of result.sharedTagsApplied)assert(tags.includes(id),'Compared themes must affect real recommendations.');
  assert(tags.some(id=>id.includes('contemporary_art')),'Keep the current shared planning interest, too.');
  assert(!calls.some(call=>call.url.href.includes('PRIVATE_COMPARE_CANARY')));
  assert(!JSON.stringify(result.bridge).includes('score'));
  result.bridge.shared[0].name='CLIENT_MUTATION';
  const next=await service.recommend({...input(),mode:'explore'});
  assert.equal(calls.filter(call=>call.url.pathname==='/v2/analysis/compare').length,1);
  assert.equal(next.bridge.cached,true);assert.equal(next.bridge.shared[0].name,'Stylized');
});

test('empty or unavailable compare never invents themes or blocks valid entity-based ideas',async()=>{
  for(const compareBody of [{results:{tags:[]}},{results:{unsupported:true}}]){
    const {calls,service}=fixture({handle:async url=>{
      if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
      if(url.pathname==='/v2/analysis/compare')return response(compareBody);
      return response({results:{entities:[entity('Actual fallback idea',ids[2],2020)]}});
    }});
    const result=await service.recommend(input());
    assert.equal(result.bridge.status,compareBody.results.tags?'empty':'unavailable');
    assert.deepEqual(result.bridge.shared,[]);assert.deepEqual(result.sharedTagsApplied,[]);
    assert.equal(calls.at(-1).url.searchParams.has('signal.interests.tags'),false);
    assert.equal(result.items[0].title,'Actual fallback idea');
  }
});

test('cancelling compare never continues into Insights',async()=>{
  const abort=new AbortController();
  const {calls,service}=fixture({handle:async url=>{
    if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
    abort.abort();throw new Error('Request stopped');
  }});
  await assert.rejects(service.recommend(input(),{signal:abort.signal}),{code:'QLOO_CANCELLED'});
  assert(!calls.some(call=>call.url.pathname==='/v2/insights'));
});
test('reviewed movie plus artist interests reach actual place query without raw chat or client IDs',async()=>{
 for(const [chapter,episode,city] of [[0,'meet','tokyo'],[1,'date','new-york']]){
  const calls=[],artist=CULTURAL_ARTIST_SEEDS[chapter][0];
  const service=createEveService({env,fetch:async(url,options)=>{
   calls.push(new URL(url));
   if(url.pathname==='/search'){
    const name=url.searchParams.get('query');
    return response({results:[entity(name,name==='Amélie'?ids[1]:ids[0],name==='Amélie'?2001:episode==='meet'?1982:2019)]});
   }
   const coordinates=city==='tokyo'?{lat:35.6762,lon:139.6503}:{lat:40.7128,lon:-74.006};
   return response({results:{entities:[{name:'Returned culture venue',entity_id:ids[2],subtype:'urn:entity:place',location:coordinates,properties:{},tags:[{id:'urn:tag:genre:place:museum',name:'Museum'}]}]}});
  }});
  const result=await service.recommend({...input(),episode,category:'activity',planning:{city,interests:['music','art']},query:'PRIVATE_NEW_RAW_CHAT',seeds:[{id:'ATTACKER_ID',type:'book'}]});
  assert.equal(calls.length,4,'Reviewed artist needs no extra recurring provider lookup.');
  const sent=calls.at(-1).searchParams;
  assert.equal(sent.get('filter.type'),'urn:entity:place');assert(sent.get('signal.interests.entities').split(',').includes(artist.id));
  assert.equal(result.seeds.filter(seed=>seed.type==='movie').length,2);assert.equal(result.seeds.filter(seed=>seed.type==='artist').length,1);
  assert(result.seeds.some(seed=>seed.id===artist.id&&seed.title===artist.name));
  assert(!calls.some(url=>/PRIVATE_NEW_RAW_CHAT|ATTACKER_ID|urn%3Aentity%3Abook/.test(url.href)));
  for(const owner of artist.owners)assert(PROFILES[chapter][owner].interests.includes(artist.profileInterest));
 }
});
test('strict title, category, and release year resolution rejects wrong same-name entries',async()=>{
  let count=0;
  const {service}=fixture({handle:async()=>{count++;return response({results:[entity('Knives Out',ids[0],2016),{...entity('Knives Out',ids[1],2019),types:['urn:entity:book']}]});}});
  await assert.rejects(service.recommend(input()),{code:'SEED_NOT_FOUND'});assert.equal(count,1);
});
test('ambiguous duplicate title and year fails rather than guessing',async()=>{
  const {service,calls}=fixture({handle:async()=>response({results:[entity('Knives Out',ids[0],2019),entity('Knives Out',ids[1],2019)]})});
  await assert.rejects(service.recommend(input()),{code:'SEED_AMBIGUOUS'});assert.equal(calls.length,1);
});
test('cache avoids requests, clones response, refreshes after TTL, and explore changes the page',async()=>{
  let time=100000;const {service,calls}=fixture({now:()=>time,resultTtlMs:1000});
  const first=await service.recommend(input());assert.equal(first.cached,false);first.items[0].title='mutated';
  const cached=await service.recommend({...input(),locale:'en'});assert.equal(cached.cached,true);assert.equal(calls.length,4);assert.equal(cached.items[0].title,'A real returned title');
  await service.recommend({...input(),mode:'explore'});assert.equal(calls.length,5);assert.equal(calls[4].url.searchParams.get('page'),'2');
  time+=1001;await service.recommend(input());assert.equal(calls.length,6);
});
test('simultaneous identical requests deduplicate upstream calls',async()=>{
  const {service,calls}=fixture();const values=await Promise.all([service.recommend(input()),service.recommend(input())]);
  assert.equal(calls.length,4);assert.equal(values[0].cached,false);assert.equal(values[1].cached,true);
});
test('429 has a local cooldown with no retry or provider switch',async()=>{
  const {service,calls}=fixture({handle:async()=>({ok:false,status:429,headers:{get:()=> '120'}})});
  await assert.rejects(service.recommend(input()),{status:429,code:'QLOO_RATE_LIMIT'});
  await assert.rejects(service.recommend(input()),{code:'QLOO_RATE_LIMIT'});assert.equal(calls.length,1);
});
test('provider and network errors are sanitized',async()=>{
  for(const status of [401,403,500]) {
    const {service}=fixture({handle:async()=>({status,ok:false,json:async()=>({error:env.QLOO_API_KEY})})});
    await assert.rejects(service.recommend(input()),error=>error instanceof AppError&&!JSON.stringify(error).includes(env.QLOO_API_KEY)&&!error.message.includes(env.QLOO_API_KEY));
  }
  const {service}=fixture({handle:async()=>{throw new Error(env.QLOO_API_KEY);}});
  await assert.rejects(service.recommend(input()),{code:'QLOO_UNAVAILABLE'});
});
test('timeout cancels upstream work and returns a sanitized error',async()=>{
  const {service}=fixture({timeoutMs:5,handle:async(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('request with secret'))))});
  await assert.rejects(service.recommend(input()),{status:504,code:'QLOO_TIMEOUT'});
});
test('invalid inputs and configuration never contact arbitrary origins',async()=>{
  const {service,calls}=fixture();
  for(const value of [null,[],{}, {...input(),episode:'constructor'}, {...input(),mode:'https://attacker.example'}, {...input(),locale:'unknown'}])await assert.rejects(service.recommend(value),{code:'BAD_REQUEST'});
  assert.equal(calls.length,0);
  const disabled=fixture({env:{}});assert.equal(disabled.service.status().qloo.configured,false);await assert.rejects(disabled.service.recommend(input()),{code:'QLOO_NOT_CONFIGURED'});
  const altered=fixture({env:{...env,QLOO_API_BASE_URL:'https://attacker.example'}});await assert.rejects(altered.service.recommend(input()),{code:'QLOO_CONFIG_INVALID'});assert.equal(altered.calls.length,0);
});

test('cancelling the only consumer stops a cold lookup before more upstream calls',async()=>{
  const {service,calls}=fixture({handle:async(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted'))))});
  const abort=new AbortController();const result=service.recommend(input(),{signal:abort.signal});
  const checked=assert.rejects(result,{code:'QLOO_CANCELLED'});abort.abort();await checked;
  await new Promise(resolve=>setImmediate(resolve));assert.equal(calls.length,1);
});

test('one cancelled consumer does not cancel another consumer of the same result',async()=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});
  const {service,calls}=fixture({handle:async(url,options,seen)=>{
    if(seen.length===1)await gate;
    assert.equal(options.signal.aborted,false);
    if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
    return response({results:{entities:[entity('Another movie',ids[2],2020)]}});
  }});
  const abort=new AbortController();const first=service.recommend(input(),{signal:abort.signal}),second=service.recommend(input());
  const checked=assert.rejects(first,{code:'QLOO_CANCELLED'});abort.abort();release();await checked;
  assert.equal((await second).items[0].title,'Another movie');assert.equal(calls.length,4);
});

function localFixture(category,modify,extra={}) {
  return fixture({handle:async(url)=>{
    if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
    const type=category==='travel'?'destination':'place';
    const value={name:type==='place'?'A real culture venue':'A real nearby town',entity_id:ids[2],subtype:'urn:entity:'+type,location:{lat:type==='place'?40.73:41.2,lon:-74.01},properties:{address:'18 Verified Street',website:'https://example.com/venue',description:'Original provider description',geocode:{city:'New York',country:'United States',country_code:'US'}},tags:[{id:category==='activity'?'urn:tag:genre:place:museum':'urn:tag:genre:place:restaurant:cafe',name:category==='activity'?'Museum':'Cafe'}]};
    return response({...extra,results:{entities:modify?modify(value):[value]}});
  }});
}

test('date and activity use real place types, allowed categories and local bounds',async()=>{
  for(const category of ['date','activity']){
    const {service,calls}=localFixture(category);
    const result=await service.recommend({...input(),category,planning:{mood:'gentle',interests:['art','photography']}});
    const params=calls.at(-1).url.searchParams;
    assert.equal(params.get('filter.type'),'urn:entity:place');
    assert.equal(params.get('filter.location'),'POINT(-74.006 40.7128)');
    assert.equal(params.get('filter.location.radius'),'15000');
    assert.equal(params.get('filter.geocode.country_code'),'US');
    assert.equal(params.get('take'),'6');
    assert.match(params.get('filter.tags'),category==='date'?/coffee_shop/:/museum/);
    assert.match(params.get('signal.interests.tags'),/contemporary_art/);
    assert.match(params.get('signal.interests.tags'),/photography/);
    assert.equal(params.get('filter.exclude.tags'),'urn:tag:activity_type:qloo:nightlife');
    assert(!calls.at(-1).url.href.includes('gentle'));
    assert.equal(result.items[0].type,'place');assert.equal(result.items[0].address,'18 Verified Street');
    assert.equal(result.items[0].url,'https://example.com/venue');assert.equal(result.locationLabel,'New York');
  }
});

test('mood changes venue filters and interests change cultural signals, without sending emotions',()=>{
  const gentle=requestParameters('date',normalizePlanning('date','date',{mood:'gentle',interests:['art']}));
  const playful=requestParameters('date',normalizePlanning('date','date',{mood:'playful',interests:['food']}));
  assert.notEqual(gentle['filter.tags'],playful['filter.tags']);
  assert.match(playful['filter.tags'],/ice_cream_shop/);
  assert.notEqual(gentle['signal.interests.tags'],playful['signal.interests.tags']);
  assert(!JSON.stringify([gentle,playful]).includes('gentle'));
});

test('travel supports bounded nearby destinations and same-country longer inspiration',async()=>{
  const {service,calls}=localFixture('travel');
  const near=await service.recommend({...input(),category:'travel',planning:{duration:'weekend'}});
  assert.equal(near.items[0].type,'destination');assert.equal(near.travelScope,'nearby');
  assert.equal(calls.at(-1).url.searchParams.get('filter.type'),'urn:entity:destination');
  assert.equal(calls.at(-1).url.searchParams.get('filter.location.radius'),'300000');
  const far=await service.recommend({...input(),category:'travel',planning:{duration:'long'}});
  assert.equal(far.travelScope,'same-country');
  assert.equal(calls.at(-1).url.searchParams.get('filter.geocode.country_code'),'US');
  assert.equal(calls.at(-1).url.searchParams.has('filter.location'),false);
  assert.equal(calls.length,5);
});

test('rejects misleading venues, absent geodata, wrong category and out-of-area results without fabricating replacements',async()=>{
  const mutations=[
    v=>({...v,subtype:'urn:entity:movie'}),
    v=>({...v,location:undefined}),
    v=>({...v,location:{lat:-36.84,lon:174.76}}),
    v=>({...v,properties:{...v.properties,is_closed:true}}),
    v=>({...v,properties:{...v.properties,geocode:{country_code:'NZ'}}}),
    v=>({...v,tags:[{id:'urn:tag:genre:place:supermarket',name:'Supermarket'}]}),
    v=>({...v,tags:[...v.tags,{id:'urn:tag:genre:place:adult_entertainment_club',name:'Adult entertainment club'}]})
  ];
  for(const modify of mutations){
    const {service}=localFixture('date',v=>[modify(v)]);
    await assert.rejects(service.recommend({...input(),category:'date'}),{code:'NO_RECOMMENDATIONS'});
  }
  const sameCity=localFixture('travel',v=>[{...v,name:'New York',location:{lat:40.7128,lon:-74.006}}]);
  await assert.rejects(sameCity.service.recommend({...input(),category:'travel'}),{code:'NO_RECOMMENDATIONS'});
  const unknownCountry=localFixture('travel',v=>[{...v,properties:{...v.properties,geocode:{}}}]);
  await assert.rejects(unknownCountry.service.recommend({...input(),category:'travel',planning:{duration:'long'}}),{code:'NO_RECOMMENDATIONS'});
});

test('place output keeps only sanitized useful fields; object addresses are not invented strings',async()=>{
  const {service}=localFixture('date',v=>[{...v,properties:{...v.properties,address:{raw:'not a supported address'},website:'javascript:alert(1)',phone:'NOT_NEEDED',private:'CANARY'}}]);
  const {items}=await service.recommend({...input(),category:'date'});
  assert.equal(items[0].address,undefined);assert.equal(items[0].url,undefined);
  assert(!JSON.stringify(items).includes('CANARY'));assert(!JSON.stringify(items).includes('[object Object]'));
  for(const website of ['https://metadata.internal/private','https://machine.local/path','https://[::1]/','https://127.0.0.1/private']){
    const fixture=localFixture('date',v=>[{...v,properties:{...v.properties,website}}]);
    assert.equal((await fixture.service.recommend({...input(),category:'date'})).items[0].url,undefined);
  }
});

test('controlled planning refuses city URLs, categories and injected tags before any network calls',async()=>{
  const {service,calls}=localFixture('date');
  for(const fields of [
    {category:'hotel'}, {planning:{city:'https://secret.example'}},
    {planning:{duration:'unlimited'}}, {planning:{mood:'PRIVATE_EMOTION'}},
    {planning:{interests:['urn:tag:unverified']}}, {planning:[]},
    {planning:{interests:'food'}}
  ])await assert.rejects(service.recommend({...input(),...fields}),{code:'BAD_REQUEST'});
  assert.equal(calls.length,0);
  assert.equal(normalizePlanning('repair','date').city,'london');
  assert.equal(normalizePlanning('lifetime','travel').city,'wellington');
  assert.equal(normalizePlanning('lifetime','travel').duration,'weekend');
});

test('locality and device coordinates validate strictly and reduce precision before use',()=>{
  for(const city of ['Hamilton, New Zealand','  Québec  ','東京','Auckland CBD','Washington, D.C.'])assert.equal(validCity(city),true);
  for(const city of ['',null,12,'https://example.com','www.example.com','example.com','Auckland\nHamilton','Hamilton\u0085NZ','a'.repeat(101)])assert.equal(validCity(city),false);
  assert.equal(normalizePlanning('date','date',{city:'  Hamilton, New Zealand  '}).city,'Hamilton, New Zealand');
  assert.deepEqual(normalizeLocation({lat:-37.7871234,lon:175.2795678,accuracy:8.2}),{lat:-37.787,lon:175.28});
  for(const location of [null,[],{lat:'40',lon:20},{lat:NaN,lon:20},{lat:40,lon:Infinity},{lat:90.01,lon:0},{lat:0,lon:-180.01},{lat:0,lon:0,accuracy:-1},{lat:0,lon:0,accuracy:'5'}]) {
    assert.equal(normalizeLocation(location),null);
    assert.equal(normalizePlanning('date','date',{location}),null);
  }
});

test('manual locality uses the official query and matched name without inventing a centre or country',async()=>{
  const {service,calls}=localFixture('date',null,{query:{locality:{signal:{name:'Jersey City, New Jersey'}}}});
  const result=await service.recommend({...input(),category:'date',planning:{city:'Jersey City'}});
  const params=calls.at(-1).url.searchParams;
  assert.equal(params.get('filter.location.query'),'Jersey City');
  assert.equal(params.get('filter.location.radius'),'15000');
  assert.equal(params.has('filter.location'),false);
  assert.equal(params.has('filter.geocode.country_code'),false);
  assert.equal(result.locationLabel,'Jersey City, New Jersey');
  assert.equal(result.items.length,1);
});

test('device coordinates override story city and country, are rounded, and are not echoed in the plan',async()=>{
  const {service,calls}=localFixture('date');
  const request={...input(),category:'date',planning:{city:'tokyo',location:{lat:40.71281234,lon:-74.00604321,accuracy:6}}};
  const result=await service.recommend(request),params=calls.at(-1).url.searchParams;
  assert.equal(params.get('filter.location'),'POINT(-74.006 40.713)');
  assert.equal(params.has('filter.geocode.country_code'),false);
  assert.equal(params.has('filter.location.query'),false);
  assert.equal(params.has('accuracy'),false);
  assert.equal(result.locationLabel,'Nearby');
  assert.equal(result.planning.location,undefined);
  assert.equal(result.planning.locationAvailable,true);
  assert.equal(result.items[0].countryCode,'US');
  assert(!JSON.stringify(result).includes('40.71281234'));
  assert(!JSON.stringify(result.planning).includes('40.713'));
  const cached=await service.recommend({...request,planning:{...request.planning,location:{lat:40.71282234,lon:-74.00603321,accuracy:12}}});
  assert.equal(cached.cached,true);assert.equal(calls.length,4);
  const outside=localFixture('date',v=>[{...v,location:{lat:-36.84,lon:174.76}}]);
  await assert.rejects(outside.service.recommend(request),{code:'NO_RECOMMENDATIONS'});
});

test('unknown-country long travel stays radius bounded and does not claim same-country coverage',async()=>{
  for(const planning of [{city:'Jersey City',duration:'long'},{city:'tokyo',location:{lat:40.7128,lon:-74.006},duration:'long'}]) {
    const {service,calls}=localFixture('travel');
    const result=await service.recommend({...input(),category:'travel',planning});
    const params=calls.at(-1).url.searchParams;
    assert.equal(params.get('filter.location.radius'),'500000');
    assert.equal(params.has('filter.geocode.country_code'),false);
    assert.equal(result.travelScope,'nearby');
  }
});

test('unresolved locality returns a useful sanitized error and never guesses another city',async()=>{
  const {service,calls}=fixture({handle:async(url)=>url.pathname==='/search'
    ?response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]})
    :({ok:false,status:400,json:async()=>({error:env.QLOO_API_KEY})})});
  await assert.rejects(service.recommend({...input(),category:'date',planning:{city:'Unmatched Locality'}}),error=>error.code==='LOCATION_NOT_FOUND'&&error.status===422&&!error.message.includes(env.QLOO_API_KEY));
  assert.equal(calls.length,4);
  assert.equal(calls.at(-1).url.searchParams.get('filter.location.query'),'Unmatched Locality');
});

test('venue cache separates category, city, mood and interests while language changes reuse results',async()=>{
  const {service,calls}=localFixture('date');
  const request={...input(),category:'date'};
  await service.recommend(request);
  assert.equal((await service.recommend({...request,locale:'en'})).cached,true);
  assert.equal(calls.length,4);
  await service.recommend({...request,planning:{mood:'gentle'}});
  assert.equal(calls.length,5);
  await service.recommend({...request,planning:{mood:'gentle',interests:['art']}});
  assert.equal(calls.length,6);
});


test('story insights permits slower discovery but retains a deadline and request budget',async()=>{
 const handle=async(url,{signal})=>{
  if(url.pathname==='/search')return response({results:[url.searchParams.get('query')==='Knives Out'?entity('Knives Out',ids[0],2019):entity('Amélie',ids[1],2001)]});
  if(url.pathname==='/v2/analysis/compare')return response({results:{tags:[]}});
  await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,35);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new Error('aborted'));},{once:true});});
  return response({results:{entities:[entity('Slow real candidate',ids[2],2020)]}});
 };
 const slower=fixture({handle,timeoutMs:10,insightsTimeoutMs:150});
 const result=await slower.service.recommend(input());assert.equal(result.items[0].id,ids[2]);assert.equal(slower.calls.length,4);
 const bounded=fixture({handle,timeoutMs:10,insightsTimeoutMs:15});
 await assert.rejects(bounded.service.recommend(input()),{code:'QLOO_TIMEOUT'});assert.equal(bounded.calls.length,4);
});
