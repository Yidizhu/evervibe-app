'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createProactive}=require('../source/eve-proactive.cjs');
const {PROFILES,CULTURAL_SEEDS}=require('../source/vibe-profiles.cjs');
const input=()=>({episode:'daily',scope:'group',actor:'leo',locale:'zh',consent:{connected:true,share:{leo:true,julian:true},receive:{leo:true,julian:true}},messages:[],private:'PRIVATE_NEVER_SEND',location:{lat:13.123456,lon:25.123456}});
test('proactive EVE starts without human input and uses shared story only',async()=>{
 let sent;const service=createProactive({gemini:{structured:async(system,context)=>{sent={system,context};return{group:'留一个慢慢吃饭的晚上吧。',private:{leo:'挑个你想聊的小故事。',julian:'简单的食物就够了。'}};}}});
 const result=await service.greet(input());assert(result.group&&result.private.leo&&result.private.julian);assert.equal(result.source,'gemini');assert(!JSON.stringify(sent).includes('PRIVATE_NEVER_SEND'));assert(!JSON.stringify(sent).includes('13.123456'));assert(sent.context.sharedStoryEvent.includes('Friday'));assert.equal(sent.context.trigger,'shared-story-opened');
});
test('all consent gates apply before proactive paid request',async()=>{
 let calls=0;const service=createProactive({gemini:{structured:async()=>{calls++;}}});
 for(const key of ['share','receive'])for(const actor of ['leo','julian']){const data=input();data.consent[key][actor]=false;await assert.rejects(service.greet(data),{code:'CONSENT_REQUIRED'});}
 const data=input();data.consent.connected=false;await assert.rejects(service.greet(data),{code:'CONSENT_REQUIRED'});assert.equal(calls,0);
});
test('invalid proactive scope, transcripts and incomplete model result are rejected',async()=>{
 const service=createProactive({gemini:{structured:async()=>({group:'only shared'})}});
 for(const change of [{scope:'private'},{episode:'unknown'},{messages:[{from:'hidden-private',text:'secret'}]}])await assert.rejects(service.greet({...input(),...change}),{code:'BAD_REQUEST'});
 await assert.rejects(service.greet(input()),{code:'GEMINI_EMPTY_REPLY'});
});
test('shared Vibe cultural seeds stay aligned with both people across all stories',()=>{
 for(let chapter=0;chapter<4;chapter++)for(const [index,actor]of ['leo','julian'].entries()){const seed=CULTURAL_SEEDS[chapter][index];assert(PROFILES[chapter][actor].interests.includes(seed.name+' ('+seed.year+')'));}
});
test('a resumed shared check-in receives progress but no private preparation',async()=>{
 let context;const service=createProactive({gemini:{structured:async(system,value)=>{context=value;return{group:'Keep a little time for each other.',private:{leo:'Bring the photo you chose together.',julian:'Leave room for a new detail.'}};}}});
 await service.greet({...input(),episode:'lifetime',relationshipState:{selectedPlan:{id:'public-option',title:'A nearby outing',source:'story'},planApproved:{leo:true,julian:true},experienced:true,proposalWords:'PRIVATE_PROPOSAL_NEVER_IMPORT'}});
 assert.equal(context.relationshipState.experienced,true);assert.deepEqual(context.relationshipState.planApproved,{leo:true,julian:true});
 assert(!JSON.stringify(context).includes('PRIVATE_PROPOSAL_NEVER_IMPORT'));
});
