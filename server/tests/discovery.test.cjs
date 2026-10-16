'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function load(file){const ctx={module:{exports:{}},structuredClone,Date,Set};vm.runInNewContext(fs.readFileSync(require.resolve(file),'utf8'),ctx);return ctx.module.exports;}
const rules=load('../../public/discovery-rules.js');
const {createCompanionService}=require('../source/try-companion.cjs');
const {createStore:memories}=load('../../public/try-memories.js');
const {createStore:agreements}=load('../../public/try-agreements.js');
const candidate={age:27,gender:'woman',accepts:{minAge:25,maxAge:40,genders:['woman']}};
test('profile drafts use only visitor messages and stay reviewable without inventing demographic fields',async()=>{
 const {createTryService}=require('../source/try-service.cjs');let received;
 const service=createTryService({gemini:{structured:async(system,context)=>{received=context;return {summary:'I enjoy quiet afternoons.',ideal:'Someone curious.',interests:[]};}}});
 const input={locale:'en',messages:[{from:'you',text:'I enjoy quiet afternoons and want someone curious.'}]};
 Object.defineProperty(input,'privatePartnerChat',{get(){throw Error('leak');}});
 const result=await service.summarizeProfile(input);assert.equal(result.requiresReview,true);assert.equal(result.interests.length,0);assert.equal(received.messages[0].text,input.messages[0].text);
 await assert.rejects(service.summarizeProfile({...input,messages:[{from:'partner',text:'Secret'}]}),{code:'BAD_REQUEST'});
});
test('bilateral constraints reject either direction and unknown never becomes a verified fit',()=>{
 assert.equal(rules.eligibility({age:30,gender:'woman',genders:['woman']},candidate).eligible,true);
 assert.equal(rules.eligibility({age:22,gender:'woman',genders:['woman']},candidate).eligible,false);
 assert.equal(rules.eligibility({age:30,gender:'man',genders:['woman']},candidate).rejected.join(','),'gender');
 assert.equal(rules.eligibility({age:30,gender:'woman',genders:['man']},candidate).rejected.join(','),'preferredGender');
 assert.equal(rules.eligibility({},candidate).exploratory,true);
 assert.equal(rules.eligibility({age:30,gender:'woman',localOnly:true},candidate).eligible,false);
});
test('Qloo evidence ranks cultural links only; unavailable evidence and repeated labels cannot inflate results',()=>{
 assert.equal(rules.culturalRank({source:'qloo',status:'ready',shared:[{name:'Jazz'},{name:'jazz'}]}),1);
 assert.equal(rules.culturalRank({source:'gemini',status:'ready',shared:[{name:'Jazz'}]}),0);
 assert.equal(rules.culturalRank({source:'qloo',status:'unavailable',shared:[{name:'Jazz'}]}),0);
});
test('public pool has eight adults, no authoring personality classifications or fabricated locations',()=>{
 const context={window:{}};const source=fs.readFileSync(require.resolve('../../public/discovery-pool.js'),'utf8');vm.runInNewContext(source,context);
 const pool=context.window.EverDiscoveryPool;assert.equal(pool.length,8);assert.equal(new Set(pool.map(x=>x.id)).size,8);
 assert(!/mbti|INFP|ENFP|INTJ|ISFJ|ENFJ|ISTP|ISFP|ENTP/i.test(source));
 for(const person of pool){assert(person.age>=18);assert.equal(person.fictional,true);assert.equal(person.location,undefined);assert.equal(person.seeds.length,3);}
});
test('companion identity is selected from server-owned characters and cannot be prompt-injected',async()=>{
 let context,system;const service=createCompanionService({gemini:{structured:async(s,c)=>{system=s;context=c;return {text:'A quiet bookshop sounds lovely. What do you like to read?'};}}});
 const input={characterId:'mira',locale:'en',scope:'direct',messages:[{from:'you',text:'Hello'}],profile:{interests:[],note:''}};
 await service.reply(input);assert.equal(context.character.name,'Mira');assert.match(system,/only as Mira/);assert(!system.includes('only as Anya'));
 await assert.rejects(service.reply({...input,characterId:'__proto__'}),{code:'BAD_REQUEST'});
});
test('relationship memories and agreements can be restored without leaking another relationship',()=>{
 const first=memories();const date=new Date().toISOString().slice(0,10);first.propose('you',{title:'Our film',text:'We talked about the ending.',date});const saved=first.snapshot();first.reset();assert.equal(first.data.pending.length,0);first.restore(saved);assert.equal(first.data.pending[0].title,'Our film');saved.data.pending[0].title='changed';assert.equal(first.data.pending[0].title,'Our film');
 const a=agreements();a.setDraft('you','Text when plans change.');a.propose('you');const snapshot=a.exportState();a.reset();assert.equal(a.snapshot().pending,null);a.restore(snapshot);assert.equal(a.snapshot().pending.text,'Text when plans change.');
});
