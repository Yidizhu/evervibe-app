'use strict';

// Server-only Qloo adapter. These are fictional demo interests, not inferred personal data.
// Official contracts: https://docs.qloo.com/reference/get-search
// https://docs.qloo.com/reference/insights-api-deep-dive
const QLOO_ORIGIN = 'https://hackathon.api.qloo.com';
const {CITIES,CATEGORY_VALUES,PLANNING_VALUES,validCity,normalizeLocation,normalizePlanning,requestParameters,distanceMetres}=require('./qloo-support.cjs');
const MOVIE_TYPE = 'urn:entity:movie';
const {CULTURAL_SEEDS,CULTURAL_ARTIST_SEEDS}=require('./vibe-profiles.cjs');
const {readSharedTags,bridgeSignals}=require('./taste-bridge.cjs');
const SEED_TYPES=Object.freeze(['movie','artist']);
const SEEDS=Object.freeze(Object.fromEntries(['meet','date','repair','lifetime'].map((story,index)=>[story,[...CULTURAL_SEEDS[index].map((seed,owner)=>({...seed,owners:[['leo','julian'][owner]]})),...CULTURAL_ARTIST_SEEDS[index]]])));
const EPISODES = Object.freeze({meet:'meet',date:'date',daily:'repair',repair:'repair',lifetime:'lifetime',older:'lifetime'});
const MODES = Object.freeze(['common','explore']);
const ACTORS = Object.freeze(['leo','julian']);

class AppError extends Error {
  constructor(status,code,message) {
    super(message); this.name='AppError'; this.status=status; this.code=code;
  }
}
const fail = (status,code,message) => { throw new AppError(status,code,message); };
const normalize = text => String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const isMovie = entity => entity?.subtype===MOVIE_TYPE || entity?.type===MOVIE_TYPE || (Array.isArray(entity?.types)&&entity.types.includes(MOVIE_TYPE));
const isType = (entity,type) => entity?.subtype===type||entity?.type===type||(Array.isArray(entity?.types)&&entity.types.includes(type));
const validId = id => typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const cleanText = (value,max) => typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
function safeUrl(value) {
  if(typeof value!=='string'||value.length>1000)return;
  try {
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.')||url.hostname.includes(':')||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)||/\.(local|localhost|internal)$/i.test(url.hostname))return;
    return url.href;
  } catch { return; }
}
function requireConsent(consent) {
  if(consent?.connected!==true||!ACTORS.every(actor=>consent.share?.[actor]===true&&consent.receive?.[actor]===true)) {
    fail(403,'CONSENT_REQUIRED','Both people must share their Vibe and receive EVE suggestions first.');
  }
}
function createEveService(options={}) {
  const env=options.env||{};
  const fetchImpl=options.fetch||globalThis.fetch;
  const now=options.now||Date.now;
  const timeoutMs=options.timeoutMs??12000;
  const resultTtlMs=options.resultTtlMs??30*60*1000;
  const entityTtlMs=options.entityTtlMs??24*60*60*1000;
  const cache=new Map(), entities=new Map(), pending=new Map(), comparisons=new Map();
  let cooldownUntil=0;

  function status() {
    return {qloo:{configured:typeof env.QLOO_API_KEY==='string'&&env.QLOO_API_KEY.trim().length>0,provider:'qloo'},recommendation:{episodes:Object.keys(EPISODES),modes:[...MODES],categories:[...CATEGORY_VALUES],planning:structuredClone(PLANNING_VALUES)}};
  }
  function configuration() {
    if(!status().qloo.configured)fail(503,'QLOO_NOT_CONFIGURED','Qloo is not configured on this server yet.');
    // Never send the key to a configurable/client-supplied origin or follow a redirect.
    const base=(env.QLOO_API_BASE_URL||env.QLOO_BASE_URL||QLOO_ORIGIN).replace(/\/$/,'');
    if(base!==QLOO_ORIGIN)fail(503,'QLOO_CONFIG_INVALID','The Qloo hackathon server configuration is invalid.');
    return env.QLOO_API_KEY.trim();
  }
  async function request(endpoint,params,budget) {
    if(budget.signal?.aborted)fail(499,'QLOO_CANCELLED','Recommendation cancelled.');
    // A cold story plan resolves two films, compares the two owners, then finds ideas.
    if(++budget.calls>4)fail(429,'REQUEST_BUDGET','The recommendation request limit was reached.');
    if(now()<cooldownUntil)fail(429,'QLOO_RATE_LIMIT','Qloo is busy. Please try again later.');
    const apiKey=configuration();
    const url=new URL(endpoint,QLOO_ORIGIN);url.search=new URLSearchParams(params).toString();
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      // Workers supports manual, not error. Never follow a redirect with the key;
      // the non-ok response check below also rejects every 3xx response.
      const response=await fetchImpl(url,{method:'GET',headers:{accept:'application/json','X-Api-Key':apiKey},redirect:'manual',signal:AbortSignal.any([controller.signal,...(budget.signal?[budget.signal]:[])])});
      if(response.status===429) {
        const seconds=Number(response.headers?.get?.('retry-after'));
        cooldownUntil=now()+Math.max(60000,Math.min(300000,Number.isFinite(seconds)?seconds*1000:60000));
        fail(429,'QLOO_RATE_LIMIT','Qloo is busy. Please try again later.');
      }
      if(response.status===401||response.status===403)fail(503,'QLOO_AUTH_FAILED','Qloo could not authorize this server.');
      if(response.status===404&&endpoint==='/search')fail(422,'SEED_NOT_FOUND','A demo interest could not be matched reliably.');
      if(response.status===400&&endpoint==='/v2/insights'&&params['filter.location.query'])fail(422,'LOCATION_NOT_FOUND','Qloo could not match this city or area. Please try a more specific location.');
      if(!response.ok)fail(502,'QLOO_UNAVAILABLE','Qloo could not complete this recommendation.');
      let body;
      try {body=await response.json();}catch{fail(502,'QLOO_RESPONSE_INVALID','Qloo returned an unreadable response.');}
      if(!body||typeof body!=='object'||body.success===false)fail(502,'QLOO_RESPONSE_INVALID','Qloo returned an unexpected response.');
      return body;
    } catch(error) {
      if(error instanceof AppError)throw error;
      if(budget.signal?.aborted)fail(499,'QLOO_CANCELLED','Recommendation cancelled.');
      if(controller.signal.aborted)fail(504,'QLOO_TIMEOUT','Qloo took too long to reply. Please try again.');
      // Do not expose request headers, URLs, network causes, or provider error bodies.
      fail(502,'QLOO_UNAVAILABLE','Qloo could not be reached. Please try again.');
    } finally {clearTimeout(timer);}
  }
  async function resolveSeed(seed,budget) {
    const type=seed.type||'movie';
    if(!SEED_TYPES.includes(type))fail(503,'QLOO_CONFIG_INVALID','The server cultural interest type is unsupported.');
    // These are reviewed identifiers in our fictional fixture, never client IDs.
    // Reusing a verified artist ID avoids a new name lookup on every cold plan.
    if(type==='artist'){
      if(!validId(seed.id)||!cleanText(seed.name,160)||seed.verifiedSource!==QLOO_ORIGIN+'/search'||!/^\d{4}-\d{2}-\d{2}$/.test(seed.verifiedOn||''))fail(503,'QLOO_CONFIG_INVALID','An artist interest has not been verified.');
      return {id:seed.id,title:cleanText(seed.name,160),type:'artist'};
    }
    const key=type+'|'+seed.name+'|'+seed.year;
    const saved=entities.get(key);
    if(saved&&saved.expires>now())return saved.value;
    const body=await request('/search',{query:seed.name,types:MOVIE_TYPE,take:'8'},budget);
    if(!Array.isArray(body.results))fail(502,'QLOO_RESPONSE_INVALID','Qloo returned an unexpected search response.');
    const matches=body.results.filter(entity=>isMovie(entity)&&normalize(entity.name)===normalize(seed.name)&&Number(entity.properties?.release_year)===seed.year&&validId(entity.entity_id));
    const distinct=[...new Map(matches.map(entity=>[entity.entity_id.toLowerCase(),entity])).values()];
    if(distinct.length!==1)fail(422,distinct.length?'SEED_AMBIGUOUS':'SEED_NOT_FOUND','A demo interest could not be matched reliably.');
    const entity=distinct[0];
    const value={id:entity.entity_id,title:cleanText(entity.name,160),type:'movie',year:seed.year};
    entities.set(key,{expires:now()+entityTtlMs,value});
    return value;
  }
  async function compareTastes(seeds,budget) {
    const inputs=Object.fromEntries(ACTORS.map(owner=>[owner,seeds.filter(seed=>seed.owners.includes(owner)).map(({id,title,type,year})=>({id,title,type,...(year?{year}:{})}))]));
    const groups=ACTORS.map(owner=>inputs[owner].map(seed=>seed.id).sort());
    const key=JSON.stringify(groups),saved=comparisons.get(key);
    if(saved&&saved.expires>now())return {...structuredClone(saved.value),inputs,cached:true};
    let value;
    try {
      const body=await request('/v2/analysis/compare',{'a.signal.interests.entities':groups[0].join(','),'b.signal.interests.entities':groups[1].join(',')},budget);
      const shared=readSharedTags(body);
      value={status:shared.length?'ready':'empty',source:'qloo',shared};
    } catch(error) {
      if(budget.signal?.aborted||error?.code==='QLOO_CANCELLED')throw error;
      // Continue with both owners' entity signals, never invent common themes.
      value={status:'unavailable',source:'qloo',shared:[]};
    }
    for(const [entry,record] of comparisons)if(record.expires<=now())comparisons.delete(entry);
    while(comparisons.size>=32)comparisons.delete(comparisons.keys().next().value);
    comparisons.set(key,{expires:now()+(value.status==='unavailable'?30000:15*60*1000),value});
    return {...structuredClone(value),inputs,cached:false};
  }
  function toItem(entity,category,planning,params) {
    const type=category==='movie'?'movie':category==='travel'?'destination':'place';
    if(!isType(entity,'urn:entity:'+type)||!validId(entity.entity_id)||entity.properties?.is_closed===true)return;
    const title=cleanText(entity.name,160);
    if(!title)return;
    const item={id:entity.entity_id,title,type};
    const description=cleanText(entity.properties?.description,600);
    if(description)item.description=description;
    const year=Number(entity.properties?.release_year);
    if(type==='movie'&&Number.isInteger(year)&&year>=1880&&year<=2100)item.year=year;
    const websites=[entity.properties?.website,...(Array.isArray(entity.properties?.websites)?entity.properties.websites:[])];
    const url=websites.map(safeUrl).find(Boolean);
    if(url)item.url=url;
    if(type!=='movie') {
      const city=!planning.location&&Object.hasOwn(CITIES,planning.city)?CITIES[planning.city]:undefined,geo=entity.properties?.geocode;
      const origin=planning.location||city;
      const location=entity.location;
      // Do not replace missing geodata with an assumed address or fabricated travel time.
      if(!location||typeof location.lat!=='number'||typeof location.lon!=='number'||!Number.isFinite(location.lat)||!Number.isFinite(location.lon)||Math.abs(location.lat)>90||Math.abs(location.lon)>180)return;
      // For free-text cities Qloo resolves the locality and applies the radius; do not invent a centre.
      const distance=origin?distanceMetres(origin,location):undefined,radius=Number(params['filter.location.radius']);
      if((origin&&Number.isFinite(radius)&&distance>radius+1000)||(city&&geo?.country_code&&geo.country_code!==city.countryCode))return;
      if(type==='destination'&&planning.duration==='long'&&city&&geo?.country_code!==city.countryCode)return;
      if(type==='destination'&&((origin&&distance<15000)||(city&&normalize(entity.name)===normalize(city.label))))return;
      item.location={lat:location.lat,lon:location.lon};
      const address=cleanText(entity.properties?.address,320),town=cleanText(geo?.city||geo?.name,120),country=cleanText(geo?.country,100);
      if(address)item.address=address;if(town)item.city=town;if(country)item.country=country;
      if(typeof geo?.country_code==='string'&&/^[A-Z]{2}$/.test(geo.country_code))item.countryCode=geo.country_code;
      const allTags=Array.isArray(entity.tags)?entity.tags:[];
      if(type==='place') {
        const allowed=new Set(params['filter.tags'].split(','));
        if(!allTags.some(tag=>allowed.has(tag.id)))return;
        const primary=entity.properties?.primary_genre?.id||'';
        if(/:(hotel|supermarket|grocery_store|adult_entertainment_club|strip_club)(:|$)/.test(primary)||allTags.some(tag=>/:(adult_entertainment_club|strip_club)(:|$)/.test(tag.id||'')))return;
      }
      const tags=[...new Set(allTags.filter(tag=>/^urn:tag:(genre|interests|ambience|noise_level|activity_type):/.test(tag.id||'')).map(tag=>cleanText(tag.name,80)).filter(Boolean))].slice(0,16);
      if(tags.length)item.tags=tags;
    }
    return item;
  }
  function joinPending(entry,signal){
    entry.users++;
    return new Promise((resolve,reject)=>{
      let done=false;
      const finish=(callback,value)=>{if(done)return;done=true;entry.users--;signal?.removeEventListener('abort',abort);callback(value);};
      const abort=()=>{finish(reject,new AppError(499,'QLOO_CANCELLED','Recommendation cancelled.'));if(!entry.users){entry.controller.abort();if(pending.get(entry.key)===entry)pending.delete(entry.key);}};
      signal?.addEventListener('abort',abort,{once:true});
      entry.task.then(value=>finish(resolve,value),error=>finish(reject,error));
      if(signal?.aborted)abort();
    });
  }
  async function recommend(input,{signal}={}) {
    if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'BAD_REQUEST','Invalid recommendation request.');
    const {episode,mode='common',locale='en',consent,category='movie'}=input;
    if(typeof episode!=='string'||!Object.hasOwn(EPISODES,episode)||!MODES.includes(mode)||!['zh','en'].includes(locale)||!CATEGORY_VALUES.includes(category))fail(400,'BAD_REQUEST','Invalid recommendation request.');
    const planning=normalizePlanning(episode,category,input.planning);
    if(!planning)fail(400,'BAD_REQUEST','Invalid planning preferences.');
    requireConsent(consent);
    if(signal?.aborted)fail(499,'QLOO_CANCELLED','Recommendation cancelled.');
    configuration();
    const story=EPISODES[episode],key=JSON.stringify([story,mode,category,planning]);
    const saved=cache.get(key);
    if(saved&&saved.expires>now())return {...structuredClone(saved.value),cached:true};
    if(pending.has(key)) {
      const value=await joinPending(pending.get(key),signal);requireConsent(consent);
      return {...structuredClone(value),cached:true};
    }
    const entry={key,controller:new AbortController(),users:0,task:null};
    const task=entry.task=(async()=>{
      const budget={calls:0,signal:entry.controller.signal},seeds=[];
      for(const seed of SEEDS[story])seeds.push({...await resolveSeed(seed,budget),owners:[...seed.owners]});
      const bridge=await compareTastes(seeds,budget);
      const ids=seeds.map(seed=>seed.id).join(',');
      const params=bridgeSignals(requestParameters(category,planning),bridge),take=category==='movie'?3:6;
      const body=await request('/v2/insights',{...params,'signal.interests.entities':ids,'filter.exclude.entities':ids,take:String(take),page:mode==='explore'?'2':'1'},budget);
      if(!Array.isArray(body.results?.entities))fail(502,'QLOO_RESPONSE_INVALID','Qloo returned an unexpected recommendation response.');
      const seedIds=new Set(seeds.map(seed=>seed.id.toLowerCase()));
      const items=[...new Map(body.results.entities.map(entity=>toItem(entity,category,planning,params)).filter(item=>item&&!seedIds.has(item.id.toLowerCase())).map(item=>[item.id.toLowerCase(),item])).values()].slice(0,take);
      if(!items.length)fail(422,'NO_RECOMMENDATIONS','No matching recommendations were found this time.');
      // Device coordinates belong only in the request and ephemeral cache key, never a returned plan.
      const publicPlanning={...planning};
      if(planning.location){delete publicPlanning.location;publicPlanning.locationAvailable=true;}
      const value={source:'qloo',category,planning:publicPlanning,items,seeds,bridge,sharedTagsApplied:bridge.shared.map(tag=>tag.id),fetchedAt:new Date(now()).toISOString(),cached:false};
      const knownCity=!planning.location&&Object.hasOwn(CITIES,planning.city)?CITIES[planning.city]:undefined;
      if(category!=='movie') {
        const signal=body.query?.locality?.signal;
        const matched=Array.isArray(signal)?signal[0]:signal;
        const matchedLabel=cleanText(matched?.name,100);
        value.locationLabel=planning.location?'Nearby':knownCity?.label||(validCity(matchedLabel)?matchedLabel:planning.city);
      }
      if(category==='travel')value.travelScope=planning.duration==='long'&&knownCity?'same-country':'nearby';
      if(cache.size>=128)cache.delete(cache.keys().next().value);
      cache.set(key,{expires:now()+resultTtlMs,value});
      return value;
    })();
    pending.set(key,entry);
    const clear=()=>{if(pending.get(key)===entry)pending.delete(key);};task.then(clear,clear);
    const value=await joinPending(entry,signal);requireConsent(consent);return structuredClone(value);
  }
  return {status,recommend};
}
const service=createEveService();
module.exports={AppError,createEveService,status:service.status,recommend:service.recommend,CATEGORY_VALUES,PLANNING_VALUES,validCity,normalizeLocation,normalizePlanning};
