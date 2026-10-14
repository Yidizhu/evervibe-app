'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createApiHandler}=require('../source/api-handler.cjs');
const origin='https://evervibe.example';
function fixture(extra={}){
 const calls=[];
 const call=name=>async(input,options)=>{calls.push({name,input,options});return{name,source:name==='gemini'?'gemini':'qloo'};};
 const qloo={status:()=>({qloo:{configured:true}}),recommend:call('qloo')};
 const gemini={status:()=>({configured:true}),chat:call('gemini')};
 const planner={plan:call('plan'),assist:call('assist'),getPlan:(id,episode)=>({id,episode,source:'qloo'})};
 const proactive={greet:call('proactive')},tryService={search:call('search'),compare:call('compare'),privateChat:call('private'),assist:call('try')};
 const validateChat=input=>{if(input.consent!==true)throw Object.assign(new Error('Private reason'),{status:403,code:'CONSENT_REQUIRED'});};
 return {calls,handle:createApiHandler({qloo,gemini,planner,proactive,tryService,validateChat,allowedOrigins:[origin],...extra})};
}
function request(route='/api/try/search',body={},options={}){
 const headers={'content-type':'application/json',origin,...options.headers};
 const init={method:'POST',...options,headers};
 if(!['GET','HEAD'].includes(init.method))init.body=typeof body==='string'?body:JSON.stringify(body);
 return new Request(origin+route,init);
}
const code=async response=>(await response.json()).error.code;

test('Fetch handler serves all old and new API routes and keeps chat plan composition',async()=>{
 const f=fixture();
 const status=await f.handle(request('/api/status',null,{method:'GET'}));assert.equal(status.status,200);assert.equal((await status.json()).gemini.configured,true);
 for(const [route,name] of [['/api/recommend','qloo'],['/api/eve/plan','plan'],['/api/eve/assist','assist'],['/api/eve/proactive','proactive'],['/api/try/search','search'],['/api/try/compare','compare'],['/api/try/private','private'],['/api/try/assist','try']]){
  const result=await f.handle(request(route,{locale:'zh'}));assert.equal(result.status,200);assert.equal((await result.json()).name,name);assert.equal(f.calls.at(-1).input.locale,'zh');
 }
 assert.equal((await f.handle(request('/api/eve/chat',{consent:false,recommendationMode:'common'}))).status,403);
 const before=f.calls.length;await f.handle(request('/api/eve/chat',{consent:true,episode:'date',recommendationMode:'common'}));
 assert.deepEqual(f.calls.slice(before).map(c=>c.name),['qloo','gemini']);assert.equal(f.calls.at(-1).options.recommendation.name,'qloo');
 await f.handle(request('/api/eve/chat',{consent:true,episode:'date',planId:'verified-plan'}));assert.equal(f.calls.at(-1).options.recommendation.id,'verified-plan');
});

test('origin, method, content-type and JSON checks run before any provider',async()=>{
 const f=fixture();
 for(const req of [request('/api/try/search',{}, {headers:{origin:'https://other.example'}}),new Request('https://other.example/api/try/search',{method:'POST',body:'{}',headers:{'content-type':'application/json'}}),request('/api/try/search',{}, {headers:{'sec-fetch-site':'cross-site'}})])assert.equal((await f.handle(req)).status,403);
 assert.equal((await f.handle(request('/api/unknown'))).status,404);
 const method=await f.handle(request('/api/try/search',null,{method:'GET'}));assert.equal(method.status,405);assert.equal(method.headers.get('allow'),'POST');
 for(const contentType of ['text/plain','application/jsonp'])assert.equal((await f.handle(request('/api/try/search',{}, {headers:{'content-type':contentType}}))).status,415);
 for(const body of ['{','null','[]','true'])assert.equal((await f.handle(request('/api/try/search',body))).status,400);
 assert.equal(f.calls.length,0);
});

test('body limits count bytes and safely decode Unicode split between stream chunks',async()=>{
 const f=fixture();const bytes=new TextEncoder().encode(JSON.stringify({query:'周六一起散步？'}));
 const stream=new ReadableStream({start(controller){controller.enqueue(bytes.slice(0,11));controller.enqueue(bytes.slice(11));controller.close();}});
 const response=await f.handle(new Request(origin+'/api/try/search',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'}));
 assert.equal(response.status,200);assert.equal(f.calls[0].input.query,'周六一起散步？');
 assert.equal((await f.handle(request('/api/try/search',{query:'字'.repeat(16001)}))).status,413);
 assert.equal((await f.handle(request('/api/try/search',{}, {headers:{'content-length':'48001'}}))).status,413);
 const badUtf8=new ReadableStream({start(c){c.enqueue(new Uint8Array([123,34,120,34,58,34,255,34,125]));c.close();}});
 assert.equal((await f.handle(new Request(origin+'/api/try/search',{method:'POST',headers:{'content-type':'application/json'},body:badUtf8,duplex:'half'}))).status,400);
 assert.equal(f.calls.length,1);
});

test('rolling rate protection resets after one minute and does not impose a daily or total limit',async()=>{
 let time=0;const f=fixture({now:()=>time});
 for(let round=0;round<3;round++){
  for(let i=0;i<12;i++)assert.equal((await f.handle(request())).status,200);
  const limited=await f.handle(request());assert.equal(limited.status,429);assert.equal(await code(limited),'LOCAL_RATE_LIMIT');
  time+=60001;
 }
 assert.equal(f.calls.length,36);
});

test('concurrency slots release on completion and service error details are redacted',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r;});
 const f=fixture({tryService:{search:()=>pending}});
 const a=f.handle(request()),b=f.handle(request());await new Promise(setImmediate);
 assert.equal((await f.handle(request())).status,429);resolve({items:[]});assert.equal((await a).status,200);assert.equal((await b).status,200);assert.equal((await f.handle(request())).status,200);
 for(const error of [new Error('SECRET'),Object.assign(new Error('SECRET'),{code:'QLOO_AUTH_FAILED',status:503}),{code:'secret-client-configuration',status:502}]){
  const g=fixture({tryService:{search:async()=>{throw error;}}});const response=await g.handle(request());const body=await response.text();assert(!body.includes('SECRET'));assert(!body.includes('secret-client'));assert.equal(response.status,error.code==='QLOO_AUTH_FAILED'?503:500);
 }
});

test('request cancellation reaches the provider and body timeout releases concurrency',async()=>{
 const controller=new AbortController();let seenSignal,started;
 const ready=new Promise(resolve=>{started=resolve;});
 const f=fixture({tryService:{search:async(input,{signal})=>{seenSignal=signal;started();await new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));return{items:[]};}}});
 const pending=f.handle(request('/api/try/search',{}, {signal:controller.signal}));await ready;controller.abort();const cancelled=await pending;assert.equal(cancelled.status,499);assert.equal(seenSignal.aborted,true);
 const g=fixture({bodyTimeoutMs:10,maxConcurrent:1});const stream=new ReadableStream({start(){}});
 const slow=await g.handle(new Request(origin+'/api/try/search',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'}));assert.equal(slow.status,408);assert.equal((await g.handle(request())).status,200);
});

test('business boundary loads with only web globals and injected services',async()=>{
 const context={module:{exports:{}},Request,Response,Headers,URL,TextDecoder,Uint8Array,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(require.resolve('../source/api-handler.cjs'),'utf8'),context);
 const handler=context.module.exports.createApiHandler({allowedOrigins:[origin],tryService:{search:async()=>({items:[]})}});
 assert.equal((await handler(request())).status,200,'No require, process, fs or HTTP globals provided');
});
