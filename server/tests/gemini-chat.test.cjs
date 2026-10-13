'use strict';
require('./offline.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGeminiService,buildContext}=require('../source/gemini-chat.cjs');
const consent={connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}};
const base={episode:'date',actor:'leo',scope:'group',locale:'zh',consent,messages:[{from:'leo',text:'周六轻松看个电影？'}]};
test('Gemini chat context, provider configuration and failure redaction',async()=>{
 let calls=0,request;
 const service=createGeminiService({env:{GEMINI_API_KEY:'test-only-key',GEMINI_MODEL:'gemini-3.8-flash'},fetch:async(url,options)=>{calls++;request={url,options};const schema=JSON.parse(options.body).response_format?.schema;const output=schema?.properties?.partnerSuggestion?JSON.stringify({text:'一起留个不用赶时间的晚上。',partnerSuggestion:''}):'一起留个不用赶时间的晚上。';return {ok:true,status:200,json:async()=>({status:'completed',steps:[{type:'thought',content:[{type:'text',text:'NOT_USER_OUTPUT'}]},{type:'model_output',content:[{type:'text',text:output}]}]})};}});
 assert.equal((await service.chat(base)).text,'一起留个不用赶时间的晚上。');
 const sent=JSON.parse(request.options.body);assert.equal(sent.store,false);assert(!sent.input.includes('test-only-key'));assert(!sent.input.includes('NOT_USER_OUTPUT'));
 assert.equal(request.url,'https://generativelanguage.googleapis.com/v1beta/interactions');assert.equal(request.options.redirect,'manual');
 for(const group of ['share','receive'])for(const id of ['leo','julian']){const copy=structuredClone(base);copy.consent[group][id]=false;await assert.rejects(()=>service.chat(copy),e=>e.code==='CONSENT_REQUIRED');}
 assert.equal(calls,1,'Consent rejection must happen before provider call');
 const privacy={...base,scope:'private',messages:[{from:'leo',text:'PRIVATE_A'}],otherPrivate:'PRIVATE_B',sharedContext:'DO_NOT_IMPORT',consent:{...consent,share:{leo:true,julian:false}}};
 const ctx=buildContext(privacy);assert(!ctx.sharedVibes.julian);assert(!JSON.stringify(ctx).includes('PRIVATE_B'));assert(!JSON.stringify(ctx).includes('DO_NOT_IMPORT'));
 assert.throws(()=>buildContext({...privacy,messages:[{from:'julian',text:'PRIVATE_B'}]}),e=>e.code==='BAD_REQUEST');
 const oneWay=structuredClone(privacy);oneWay.consent.share={leo:false,julian:true};assert(buildContext(oneWay).sharedVibes.julian);oneWay.consent.receive={leo:false,julian:true};assert(!buildContext(oneWay).sharedVibes.julian);
 const before=structuredClone(base);before.scope='private';before.episode='meet';before.consent.connected=false;assert(!buildContext(before).sharedVibes.julian);
 const huge={...base,messages:[{from:'leo',text:'a'.repeat(6001)}]};assert.throws(()=>buildContext(huge),e=>e.code==='BAD_REQUEST');
 const rec={source:'qloo',seeds:[{title:'Amelie',year:2001}],items:[{id:'movie1',title:'A candidate',description:'CULTURAL_DATA'}]};
 await service.chat({...base,recommendationMode:'common'}, {recommendation:rec});assert(JSON.parse(request.options.body).input.includes('CULTURAL_DATA'));
 for(const [status,code] of [[429,'GEMINI_RATE_LIMIT'],[403,'GEMINI_AUTH_FAILED'],[404,'GEMINI_MODEL_UNAVAILABLE'],[500,'GEMINI_UNAVAILABLE']]){
  const bad=createGeminiService({env:{GEMINI_API_KEY:'test-only-key'},fetch:async()=>({ok:false,status,json:async()=>({error:'test-only-key'})})});
  await assert.rejects(()=>bad.chat(base),e=>e.code===code&&!e.message.includes('test-only-key'));
 }
 const empty=createGeminiService({env:{GEMINI_API_KEY:'test-only-key'},fetch:async()=>({ok:true,status:200,json:async()=>({status:'completed',steps:[]})})});await assert.rejects(()=>empty.chat(base),e=>e.code==='GEMINI_EMPTY_REPLY');
 const schema={type:'object',properties:{mood:{type:'string'}},required:['mood']};let structuredRequest;
 const structured=createGeminiService({env:{GEMINI_API_KEY:'test-only-key'},fetch:async(url,options)=>{structuredRequest=JSON.parse(options.body);return{ok:true,status:200,json:async()=>({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:'{"mood":"gentle"}'}]}]})};}});
 assert.deepEqual(await structured.structured('Extract a brief.',{messages:[]},schema,{maxOutput:1000}),{mood:'gentle'});
 assert.deepEqual(structuredRequest.response_format,{type:'text',mime_type:'application/json',schema});assert.equal(structuredRequest.generation_config.max_output_tokens,1000);assert.equal(structuredRequest.store,false);
 await assert.rejects(()=>service.structured('Extract a brief.',{},schema),e=>e.code==='GEMINI_PLAN_INVALID');
 // The shared incident and progress are available to authorized private advice,
 // without importing the other person's private transcript or arbitrary fields.
 const repair={...base,episode:'repair',scope:'private',relationshipState:{repairConversationComplete:true,agreement:'Send a quick message if work runs late.',agreementApproved:{leo:true,julian:true},selectedPlan:{id:'place-1',title:'A selected gallery',source:'qloo'},planApproved:{leo:true,julian:false},experienced:false,privateTranscript:'NEVER_IMPORT_PARTNER_PRIVATE'}};
 const repairContext=buildContext(repair);
 assert(repairContext.sharedStoryEvent.includes('restaurant'));assert.equal(repairContext.relationshipState.agreementApproved.julian,true);
 assert.equal(repairContext.relationshipState.selectedPlan.candidateMatched,false);assert(!JSON.stringify(repairContext).includes('NEVER_IMPORT_PARTNER_PRIVATE'));
 const unshared=structuredClone(repair);unshared.consent.share.julian=false;
 assert.equal(buildContext(unshared).sharedStoryEvent,undefined);assert.equal(buildContext(unshared).relationshipState,undefined);
 const notConnected=structuredClone(repair);notConnected.consent.connected=false;
 assert.equal(buildContext(notConnected).sharedStoryEvent,undefined);
 for(const state of [null,[],{experienced:'yes'},{planApproved:{leo:true}},{agreement:'x'.repeat(501)},{selectedPlan:{id:'place-1',title:'venue',source:'made-up'}}])assert.throws(()=>buildContext({...repair,relationshipState:state}),e=>e.code==='BAD_REQUEST');
 const verified=buildContext({...repair,scope:'group'},{source:'qloo',seeds:[],items:[{id:'place-1',title:'Provider title',description:'A stainless-steel exterior.'}]});
 assert.equal(verified.relationshipState.selectedPlan.title,'Provider title');assert.equal(verified.relationshipState.selectedPlan.candidateMatched,true);
 await service.chat(repair);const repairSent=JSON.parse(request.options.body);
 assert(JSON.parse(repairSent.input).sharedStoryEvent.includes('restaurant'));
 assert(repairSent.system_instruction.includes('Earlier EVE suggestions are not evidence'));
 console.log('PASS: Gemini context separation, four-switch gating, one-way sharing, fixed provider, stateless request, output parsing and redacted failures. No live API calls.');
});
