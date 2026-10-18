'use strict';
require('./offline.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createTryService}=require('../source/try-service.cjs');
const id='11111111-1111-4111-8111-111111111111';
test('returning private chat keeps confirmed memory when public catalog entries expire',async()=>{
 let seen;const service=createTryService({catalogStore:{get:async()=>null,set:async()=>{}},gemini:{structured:async(s,c)=>{seen=c;return {text:'You still enjoy photography.'};}}});
 const result=await service.privateChat({locale:'en',actor:'you',partnerShared:false,vibes:{you:{entities:[id],note:''}},messages:[{from:'you',text:'What do you remember?'}],ownProfile:{summary:'I enjoy photography.',ideal:'Live music'},ownHistory:[{from:'you',text:'I love photography.'}]});
 assert.equal(result.source,'gemini');assert.deepEqual(seen.ownVibe.entities,[]);assert.equal(seen.confirmedOwnProfile.summary,'I enjoy photography.');assert.equal(seen.earlierOwnMessages[0].text,'I love photography.');assert.equal(seen.sharedPartnerVibe,undefined);
});
test('expired recommendation inputs refresh by exact provider ID once, without replacing tastes',async()=>{
 const source=fs.readFileSync(require.resolve('../../public/try-app.js'),'utf8');const code=source.slice(source.indexOf('  async function post('),source.indexOf('  function abortSearch('));
 let requests=[],tries=0;const body={locale:'en',entities:[id],type:'movie'},ctx={state:{locale:'en',vibes:{you:{entities:[{id,title:'A real film',type:'movie'}]},partner:{entities:[]}}},pool:[],fetch:async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});if(url.endsWith('/search'))return {ok:true,json:async()=>({items:[{id}]})};return ++tries===1?{ok:false,json:async()=>({error:{code:'TRY_INTEREST_EXPIRED'}})}:{ok:true,json:async()=>({items:[]})};}};
 vm.runInNewContext(code+';this.run=post',ctx);await ctx.run('/api/try/solo',body);assert.equal(requests.length,3);assert.equal(requests[1].body.query,'A real film');assert.deepEqual(requests[2].body,body);
 tries=0;ctx.fetch=async()=>({ok:false,json:async()=>({error:{code:'TRY_INTEREST_EXPIRED'}})});await assert.rejects(ctx.run('/api/try/solo',body),/TRY_INTEREST_EXPIRED/);
});
