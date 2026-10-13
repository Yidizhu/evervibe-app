'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createGeminiService,buildContext}=require('../source/gemini-chat.cjs');
const base=()=>({episode:'date',actor:'julian',scope:'private',locale:'en',consent:{connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}},messages:[{from:'julian',text:'I would love a quiet afternoon where we can listen to a song and actually hear each other.'}]});
const suggestion='Chloe, invite Sarah to choose a Nina Simone track, then leave a little room to trade stories.';
function fixture(options={}){
 const calls=[];
 const service=createGeminiService({env:options.env||{GEMINI_API_KEY:'offline-fixture'},fetch:async(url,request)=>{
  const body=JSON.parse(request.body);calls.push({url,request,body});if(options.onCall)options.onCall();
  const output=options.raw!==undefined?options.raw:body.response_format?.schema?.properties?.partnerSuggestion?JSON.stringify(options.result||{text:'A softer afternoon could give the conversation room.',partnerSuggestion:suggestion}):'A plain private answer.';
  return {ok:true,status:200,json:async()=>({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:output}]}]})};
 }});
 return {service,calls};
}

test('one structured call gives a private reply and a distinct recipient-facing cultural suggestion',async()=>{
 const f=fixture(),input=base();input.messages.unshift({from:'eve',text:'EVE_INVENTED_WISH'});
 const reply=await f.service.chat(input);assert.equal(f.calls.length,1);assert.equal(reply.source,'gemini');assert.equal(reply.text,'A softer afternoon could give the conversation room.');assert.deepEqual(reply.partnerSuggestion,{text:suggestion,sourceLang:'en'});
 const body=f.calls[0].body,context=JSON.parse(body.input);assert.equal(body.store,false);assert.equal(context.bridge.speakerName,'Sarah');assert.equal(context.bridge.recipientName,'Chloe');assert.equal(context.bridge.recipient,'leo');assert.deepEqual(context.bridge.humanMessages,[input.messages.at(-1).text]);assert(!context.bridge.humanMessages.includes('EVE_INVENTED_WISH'));assert.equal(context.bridge.eligible,true);
 assert.deepEqual(body.response_format.schema.required,['text','partnerSuggestion']);assert.equal(body.response_format.schema.additionalProperties,false);assert(body.system_instruction.includes('ONLY a desire, interest or preferred pace actually expressed'));
});

test('both share and receive switches plus connection gate the bridge; plain private chat survives',async()=>{
 for(const group of ['share','receive'])for(const actor of ['leo','julian']){
  const f=fixture(),input=base();input.consent[group][actor]=false;const reply=await f.service.chat(input);
  assert.equal(reply.text,'A plain private answer.');assert.equal(reply.partnerSuggestion,undefined);assert.equal(f.calls[0].body.response_format,undefined);
 }
 const f=fixture(),input=base();input.consent.connected=false;assert.equal((await f.service.chat(input)).partnerSuggestion,undefined);assert.equal(f.calls[0].body.response_format,undefined);
});

test('group requests cannot import private transcripts or ask the bridge to run',async()=>{
 const f=fixture(),input=base();input.scope='group';input.privateMessages=[{from:'julian',text:'PRIVATE_HISTORY'}];input.partnerSuggestion={text:'DO_NOT_IMPORT'};input.bridge={humanMessages:['PRIVATE_HISTORY']};
 const context=buildContext(input);assert(!JSON.stringify(context).includes('PRIVATE_HISTORY'));assert(!JSON.stringify(context).includes('DO_NOT_IMPORT'));assert.equal(context.bridge,undefined);
 assert.equal((await f.service.chat(input)).partnerSuggestion,undefined);assert.equal(f.calls[0].body.response_format,undefined);
});

test('explicit confidentiality overrides a model suggestion in English and Chinese',async()=>{
 for(const phrase of ["I wish we could walk, but don't tell her.",'I would love a song. Please keep this private.','I wish we could talk; this is between you and me.','我希望她约我看展，但别告诉她。','我想一起听歌，这件事只跟你说。','我希望他来陪我，但不要让他知道。']){
  const f=fixture(),input=base();input.messages=[{from:'julian',text:phrase}];const result=await f.service.chat(input);assert.equal(result.partnerSuggestion,undefined,phrase);assert.equal(JSON.parse(f.calls[0].body.input).bridge.eligible,false);assert(result.text);
 }
 const f=fixture(),input=base();input.messages.unshift({from:'julian',text:'Keep our conversation confidential.'});assert.equal((await f.service.chat(input)).partnerSuggestion,undefined);
});

test('sensitive details, surprises and third-party information stay out of the bridge',async()=>{
 for(const phrase of ['I want to share my password: not-a-real-password.','I wish we could discuss my medical diagnosis.','I would like to talk about my salary.','I want a surprise proposal next Friday.','I would love to discuss my friend Alex at dinner.','我希望我们讨论这张病历。','我想说说我的银行账户。','我希望他喜欢我准备的求婚戒指。']){
  const f=fixture(),input=base();input.messages=[{from:'julian',text:phrase}];assert.equal((await f.service.chat(input)).partnerSuggestion,undefined,phrase);
 }
});

test('no current human wish means no generic profile-only bridge',async()=>{
 const f=fixture(),input=base();input.messages=[{from:'eve',text:'You secretly wish Chloe would choose a song.'},{from:'julian',text:'Hello EVE.'}];
 assert.equal((await f.service.chat(input)).partnerSuggestion,undefined);assert.equal(JSON.parse(f.calls[0].body.input).bridge.eligible,false);
});

test('raw copied stretches and private-source attribution are discarded',async()=>{
 const input=base();
 for(const proposed of [input.messages[0].text,'Try this: a quiet afternoon where we can listen to a song and actually hear each other.','Sarah told me she wants a quiet day.','In our private chat, Sarah mentioned music.']){
  const f=fixture({result:{text:'Your private reply.',partnerSuggestion:proposed}});assert.equal((await f.service.chat(input)).partnerSuggestion,undefined,proposed);
 }
 const zh=base();zh.locale='zh';zh.messages=[{from:'julian',text:'我希望她愿意听完我那个一直没有机会讲完的故事。'}];const f=fixture({result:{text:'慢慢说就好。',partnerSuggestion:'陪她听完我那个一直没有机会讲完的故事。'}});assert.equal((await f.service.chat(zh)).partnerSuggestion,undefined);
});

test('natural Chinese bridge uses the correct story recipient and source language',async()=>{
 const input=base();input.episode='repair';input.actor='leo';input.locale='zh';input.messages=[{from:'leo',text:'我想明天一起找本书翻翻，慢一点就好。'}];
 const f=fixture({result:{text:'一本书，也可以留出一个不急着回答的下午。',partnerSuggestion:'Arjun，不妨邀 Emma 各挑一本书，聊聊封面让你想起的事。'}});
 const reply=await f.service.chat(input);assert.equal(reply.partnerSuggestion.sourceLang,'zh');const bridge=JSON.parse(f.calls[0].body.input).bridge;assert.equal(bridge.recipientName,'Arjun');assert.equal(bridge.speakerName,'Emma');
});

test('empty suggestions and revoked gates never escape as partner messages',async()=>{
 const f=fixture({result:{text:'A private answer.',partnerSuggestion:''}});assert.equal((await f.service.chat(base())).partnerSuggestion,undefined);
 const input=base(),g=fixture({onCall:()=>{input.consent.receive.leo=false;}});assert.equal((await g.service.chat(input)).partnerSuggestion,undefined);
});

test('missing service, malformed JSON and schema errors never produce a bridge or retry',async()=>{
 const missing=fixture({env:{}});await assert.rejects(missing.service.chat(base()),{code:'GEMINI_NOT_CONFIGURED'});assert.equal(missing.calls.length,0);
 const invalid=[null,[],{text:'Only a reply.'},{text:'',partnerSuggestion:'x'},{text:'x',partnerSuggestion:12},{text:'x',partnerSuggestion:'x',rawPrivate:'NO'},{text:'x',partnerSuggestion:'x'.repeat(401)}];
 for(const value of invalid){const f=fixture({raw:JSON.stringify(value)});await assert.rejects(f.service.chat(base()),{code:'GEMINI_BRIDGE_INVALID'});assert.equal(f.calls.length,1);}
 const malformed=fixture({raw:'This is not JSON.'});await assert.rejects(malformed.service.chat(base()),{code:'GEMINI_BRIDGE_INVALID'});assert.equal(malformed.calls.length,1);
 const empty=fixture({raw:''});await assert.rejects(empty.service.chat(base()),{code:'GEMINI_EMPTY_REPLY'});assert.equal(empty.calls.length,1);
});
