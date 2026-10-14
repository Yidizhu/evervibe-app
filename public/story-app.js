'use strict';
const CAST={1:{leo:'Kenji',julian:'Anya',photo:'meet'},2:{leo:'Chloe',julian:'Sarah',photo:'date'},3:{leo:'Emma',julian:'Arjun',photo:'repair'},4:{leo:'Leo',julian:'Julian',photo:'lifetime'}};
const names={get leo(){return CAST[data().chapter].leo},get julian(){return CAST[data().chapter].julian}},other=id=>id==='leo'?'julian':'leo';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=value=>({leo:value,julian:value});
function portrait(id,cls='person-photo',alt=names[id]){const stage=data().chapter,filename=stage===1?(id==='leo'?'kenji':'anya')+'-v2.png':'couple-'+CAST[stage].photo+'-v2.png',side=[2,3].includes(stage)?other(id):id;return '<img class="'+cls+(stage>1?' portrait-aged portrait-'+side:'')+'" src="/assets/people/'+filename+'" alt="'+esc(alt)+'" width="96" height="96" decoding="async">';}
let actor='leo',episode='meet',states={},disposers=[],hintContext=null,toastTimer,seq=0;
const relationshipModes={};
// One chapter belongs to one couple. A saved episode is one stable memory;
// editing or approving that same memory again must not create another reward.
const treeCareByChapter={};
// Fictional archive balances for the established couples, separate from newly
// confirmed memories. Re-entering a chapter never grants the balance again.
const TREE_CARE_ARCHIVE={1:0,2:0,3:12,4:365};
function treeCare(chapter=data().chapter){return treeCareByChapter[chapter]||(treeCareByChapter[chapter]={archive:TREE_CARE_ARCHIVE[chapter]||0,memories:[],actions:[],pulse:null});}
function treeCareBalance(kind,care=treeCare()){return Math.max(0,care.archive+care.memories.length-care.actions.filter(action=>action.kind===kind).length);}
function rewardMemoryCare(key){const s=states[key];if(!s?.saved||!both(s.memoryApproved))return false;const care=treeCare(storyFor(key).chapter);if(care.memories.includes(key))return false;care.memories.push(key);return true;}
function careForTree(kind){if(!['water','nourish'].includes(kind))return false;const care=treeCare(),used=care.actions.filter(action=>action.kind===kind).length;if(!treeCareBalance(kind,care))return false;const memory=used<care.archive?'archive-'+used:care.memories[used-care.archive];care.actions.push({memory,kind});care.pulse=kind;return true;}
// Real-life entries belong to the couple, independently of scripted episodes.
// Drafts are per author; saving explicitly adds their words to the shared album.
const memoryNotebooks={};
function memoryNotebook(chapter=data().chapter){return memoryNotebooks[chapter]||(memoryNotebooks[chapter]={entries:[],openId:'',editors:{leo:{open:false,key:'new',drafts:{}},julian:{open:false,key:'new',drafts:{}}}});}
function momentToday(){const date=new Date();return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
function momentDraft(){const book=memoryNotebook(),editor=book.editors[actor];if(!editor.drafts[editor.key]){const entry=book.entries.find(m=>m.id===editor.key&&m.author===actor);editor.drafts[editor.key]=entry?{id:entry.id,text:entry.text,date:entry.date,sourceKey:entry.sourceKey,sourceIds:entry.sourceIds}:{id:'moment-'+(++seq),text:'',date:momentToday()};}return editor.drafts[editor.key];}
function startMoment(key='new'){if(!current().connected)return;const book=memoryNotebook();if(key!=='new'&&!book.entries.some(m=>m.id===key&&m.author===actor))return;const editor=book.editors[actor];editor.key=key;editor.open=true;momentDraft();render();document.getElementById('moment-body')?.focus();}
// An extractive draft from shared human messages, never a generated event or a
// private-chat summary. IDs keep the same moment stable across people/languages.
function eveMomentSuggestion(){
 if(!groupEveReady())return null;
 const book=memoryNotebook(),messages=current().direct.filter(m=>m.type==='text'&&!m.history&&['leo','julian'].includes(m.from));
 const latest=['leo','julian'].map(who=>messages.filter(m=>m.from===who).at(-1));
 if(latest.some(m=>!m))return null;
 const used=new Set(book.entries.flatMap(entry=>entry.sourceIds||[]));
 if(latest.some(m=>used.has(episode+':'+m.id)))return null;
 const selected=messages.filter(m=>latest.includes(m)),sourceIds=selected.map(m=>episode+':'+m.id),key='shared:'+sourceIds.join('|');
 if(book.entries.some(entry=>entry.sourceKey===key)||(book.dismissedEve||[]).includes(key))return null;
 const text=selected.map(m=>names[m.from]+': “'+String(m.text instanceof LocaleText?m.text.source:m.text)+'”').join('\n\n');
 if(text.length>1000)return null;
 return {key,sourceIds,text};
}
function reviewEveMoment(){
 const suggestion=eveMomentSuggestion();if(!suggestion)return;
 const book=memoryNotebook(),editor=book.editors[actor],existing=editor.drafts.new;
 if(existing&&existing.text.trim()){startMoment();toast('moment.eveExisting');return;}
 editor.key='new';editor.open=true;
 editor.drafts.new={id:existing?.id||'moment-'+(++seq),text:suggestion.text,date:momentToday(),sourceKey:suggestion.key,sourceIds:[...suggestion.sourceIds]};
 render();document.getElementById('moment-body')?.focus();
}
function dismissEveMoment(){const suggestion=eveMomentSuggestion();if(!suggestion)return;const book=memoryNotebook();(book.dismissedEve||(book.dismissedEve=[])).push(suggestion.key);render();}
function saveMoment(){
 if(!current().connected)return null;
 const book=memoryNotebook(),editor=book.editors[actor];if(!editor.open)return null;
 const draft=momentDraft(),text=draft.text.trim(),date=draft.date;
 if(!text||text.length>1000||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T12:00:00')))return null;
 const sharedEntry=draft.sourceKey&&book.entries.find(m=>m.sourceKey===draft.sourceKey&&m.id!==draft.id);
 if(sharedEntry){book.openId=sharedEntry.id;delete editor.drafts[editor.key];editor.open=false;editor.key='new';return sharedEntry.id;}
 let entry=book.entries.find(m=>m.id===draft.id);
 if(entry){if(entry.author!==actor)return null;entry.text=text;entry.date=date;}
 else{
  entry={id:draft.id,author:actor,text,date,...(draft.sourceKey?{sourceKey:draft.sourceKey,sourceIds:[...draft.sourceIds]}:{})};book.entries.unshift(entry);
  const care=treeCare();if(!care.memories.includes(entry.id))care.memories.push(entry.id);
 }
 book.openId=entry.id;delete editor.drafts[editor.key];editor.open=false;editor.key='new';return entry.id;
}
const sharedByDefault=chapter=>chapter>=3;
const PLAN_CATEGORIES=['date','activity','travel','movie'];
const PLAN_CITIES=['tokyo','new-york','london','wellington','auckland'];
const defaultPlanCity=chapter=>({1:'tokyo',2:'new-york',3:'london',4:'wellington'})[chapter];
function relationshipMode(){return relationshipModes[data().chapter]||(relationshipModes[data().chapter]={approved:pair(sharedByDefault(data().chapter)),scopes:{leo:{interests:true,communication:true,plans:true},julian:{interests:true,communication:true,plans:true}}});}
const reception={};const preferences={get receive(){return reception[data().chapter]||(reception[data().chapter]=pair(true))},set receive(value){for(const key of Object.keys(reception))delete reception[key];reception[data().chapter]=value;}};
function fresh(key){const d=storyFor(key),seed=(...path)=>new LocaleText(['story',key,...path]);return {
  opened:pair(false),interest:pair(false),connected:key!=='meet',nudges:[],bridgeDelivered:[],group:[],groupDraft:pair(''),proactive:{status:key==='repair'?'not-scheduled':'idle',error:null},eveUnread:pair(false),live:{epoch:0,groupBusy:false,privateBusy:pair(false),groupError:null,privateError:pair(null),recommendError:null,recommendations:null,recommendationMode:null,planId:null,category:'date',city:defaultPlanCity(d.chapter),location:null,locationBusy:false,locationError:null,locationEpoch:0,moreOpen:false},liveChoice:null,
  views:{leo:{page:d.start,mode:'private'},julian:{page:d.start,mode:'private'}},
  private:{leo:[],julian:[]},direct:(d.history||[]).map((m,i)=>({...m,text:seed('history',i,'text'),type:'text',history:true,id:++seq})),
  drafts:{leo:{private:'',direct:'',tag:null},julian:{private:'',direct:'',tag:null}},unread:pair(0),paused:pair(false),
  needs:{leo:seed('needs','leo'),julian:seed('needs','julian')},shared:pair(''),sharedSource:pair(null),generated:false,choice:null,planVersion:0,planApproved:pair(false),experienced:false,
  agreementDraft:d.agreement?seed('agreement'):'',agreement:'',agreementApproved:pair(false),
  memoryDraft:{leo:seed('memory','leo'),julian:seed('memory','julian')},memory:pair(''),memoryApproved:pair(false),saved:false,archiveConsent:pair(sharedByDefault(d.chapter)),archiveText:'',
  prepared:[false,false,false],proposalWords:uiRef('proposal.words'),proposalSaid:false,proposalYes:false,older:false
};}
const current=()=>states[episode]||(states[episode]=fresh(episode));
const data=()=>storyFor(episode);
const both=o=>o.leo&&o.julian;
const has=tag=>current().direct.some(m=>m.tag===tag);
function button(label,action,arg='',cls='secondary',disabled=false){return `<button class="${cls}" data-do="${action}" data-arg="${esc(arg)}" ${disabled?'disabled':''}>${label}</button>`;}
function toast(key){const el=document.getElementById('toast');el.dataset.messageKey=key;el.textContent=t(key);el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.classList.remove('show');delete el.dataset.messageKey;},3500);}
function go(page,mode){const s=current();if(!s.connected&&(page==='plan'||page==='memory'||(page==='chat'&&mode==='direct')))return;s.views[actor].page=page;if(!s.connected)s.views[actor].mode='private';if(mode)s.views[actor].mode=mode;if(page==='chat'&&s.views[actor].mode==='direct')s.unread[actor]=0;render();}
function setEpisode(key){cancelLocation();hintContext=null;document.getElementById('hint-dialog').close();episode=key;current();render();}
function invalidatePlan(){const s=current();s.choice=null;s.liveChoice=null;s.planApproved=pair(false);s.experienced=false;s.planVersion++;}
function selectedPlanTitle(){const s=current();return s.choice==='live'?s.liveChoice?.title||'':data().options[s.choice]?.[0]||'';}
function notifyPartner(){current().unread[other(actor)]++;}
function groupEveReady(){return current().connected&&both(relationshipMode().approved)&&both(preferences.receive);}
function storyPlanReady(){return current().connected&&(episode!=='repair'||both(current().agreementApproved));}
function sharedRelationshipState(key){const s=states[key];if(!s)return;const choice=s.choice==='live'?s.liveChoice:s.choice!==null?storyFor(key).options[s.choice]:null;return {repairConversationComplete:key==='repair'&&s.direct.some(m=>m.tag==='repair-agree'),agreement:String(s.agreement||'').slice(0,500),agreementApproved:{...s.agreementApproved},selectedPlan:choice?{id:s.choice==='live'?String(choice.id):'story-'+s.choice,title:String(s.choice==='live'?choice.title:choice[0]).slice(0,200),source:s.choice==='live'?'qloo':'story'}:null,planApproved:{...s.planApproved},experienced:s.experienced};}
const liveRequests=new Set();let liveServiceStatus=null;
function consentFor(key){const chapter=storyFor(key).chapter;return {connected:states[key]?.connected===true,share:{...(relationshipModes[chapter]?.approved||pair(sharedByDefault(chapter)))},receive:{...(reception[chapter]||pair(true))}};}
function privateBridgeReady(key){const consent=consentFor(key);return consent.connected&&both(consent.share)&&both(consent.receive);}
function markPrivateRead(state,who){state.eveUnread[who]=false;for(const message of state.private[who])if(message.role==='ai')message.read=true;}
function removeUnreadBridges(chapter){
 for(const [key,state]of Object.entries(states))if(storyFor(key).chapter===chapter)for(const who of ['leo','julian']){
  state.private[who]=state.private[who].filter(message=>message.source!=='shared-vibe-bridge'||message.read===true);
  state.eveUnread[who]=state.private[who].some(message=>message.role==='ai'&&!message.read&&(message.proactive||message.source==='shared-vibe-bridge'));
 }
}
function deliverPrivateBridge(request,suggestion){
 if(!request.bridgeAllowed||!liveValid(request)||!privateBridgeReady(request.episode)||!suggestion)return false;
 const state=request.state,to=other(request.actor),key=request.bridgeKey;
 if(!key||state.bridgeDelivered.includes(key)||!String(suggestion.text||'').trim()||String(suggestion.text).length>1600)return false;
 // Store only the derived suggestion on the recipient side, never the source
 // transcript, a source-message reference, or private preparation metadata.
 state.private[to].push({role:'ai',text:suggestion.text,source:'shared-vibe-bridge',sourceLang:['en','zh'].includes(suggestion.sourceLang)?suggestion.sourceLang:request.locale,read:false});
 state.bridgeDelivered.push(key);state.eveUnread[to]=true;return true;
}
function liveValid(request){return !request.controller.signal.aborted&&states[request.episode]===request.state&&request.state.live.epoch===request.epoch&&(request.scope!=='group'||(consentFor(request.episode).connected&&both(consentFor(request.episode).share)&&both(consentFor(request.episode).receive)));}
function renderLive(request){if(states[episode]===request.state)render();}
function cancelLive(chapter){for(const [key,state]of Object.entries(states))if(chapter===undefined||storyFor(key).chapter===chapter){state.live.epoch++;state.live.groupBusy=false;state.live.privateBusy=pair(false);state.live.locationEpoch++;state.live.locationBusy=false;if(state.proactive.status==='loading')state.proactive.status='idle';}for(const request of liveRequests)if(chapter===undefined||request.chapter===chapter){request.controller.abort();liveRequests.delete(request);}}
function beginLive(scope){const state=current(),who=actor;if(scope==='group'?state.live.groupBusy:state.live.privateBusy[who])return;const request={scope,state,actor:who,episode,chapter:data().chapter,epoch:state.live.epoch,locale,controller:new AbortController(),bridgeAllowed:scope==='private'&&privateBridgeReady(episode),bridgeKey:'live-'+(++seq)};if(scope==='group'){state.live.groupBusy=true;state.live.groupError=null;}else{state.live.privateBusy[who]=true;state.live.privateError[who]=null;}liveRequests.add(request);return request;}
function finishLive(request){liveRequests.delete(request);if(liveValid(request)){if(request.scope==='group')request.state.live.groupBusy=false;else request.state.live.privateBusy[request.actor]=false;renderLive(request);}}
async function postLive(path,payload,request){const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:request.controller.signal});let result;try{result=await response.json();}catch{throw {code:'SERVICE_UNAVAILABLE'};}if(!response.ok)throw {code:result?.error?.code||result?.code||'SERVICE_UNAVAILABLE'};return result;}
function liveError(error){const key='live.error.'+error?.code;return CORE_MESSAGES[key]?key:'live.error.SERVICE_UNAVAILABLE';}
function liveMessages(request){const source=request.scope==='group'?request.state.group:request.state.private[request.actor].filter(message=>message.source!=='shared-vibe-bridge');return source.slice(-16).map(message=>({from:request.scope==='group'?message.from:message.role==='user'?request.actor:'eve',text:String(message.text).slice(0,1500)}));}
function planningLocation(state){return state.live.location?{location:{...state.live.location}}:state.live.city.trim()?{city:state.live.city.trim()}:{};}
function planCityLabel(city){return PLAN_CITIES.includes(city)?t('planning.city.'+city):city;}
function cancelLocation(){const s=states[episode];if(s){s.live.locationEpoch++;s.live.locationBusy=false;}}
function locateForPlanning(){
 const state=current();if(state.live.groupBusy||state.live.locationBusy)return;
 state.live.locationError=null;
 if(!navigator.geolocation){state.live.locationError='planning.location.unavailable';render();return;}
 const key=episode,epoch=state.live.epoch,locationEpoch=++state.live.locationEpoch;
 state.live.locationBusy=true;render();
 const valid=()=>episode===key&&states[key]===state&&state.live.epoch===epoch&&state.live.locationEpoch===locationEpoch;
 const fail=error=>{if(!valid())return;state.live.locationBusy=false;state.live.locationError='planning.location.'+({1:'denied',2:'unavailable',3:'timeout'}[error?.code]||'unavailable');render();};
 try{navigator.geolocation.getCurrentPosition(position=>{if(!valid())return;const {latitude,longitude,accuracy}=position.coords;if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){fail();return;}state.live.location={lat:Math.round(latitude*1000)/1000,lon:Math.round(longitude*1000)/1000,...(Number.isFinite(accuracy)&&accuracy>=0?{accuracy:Math.round(accuracy)}:{})};state.live.locationBusy=false;state.live.locationError=null;render();},fail,{enableHighAccuracy:false,timeout:10000,maximumAge:300000});}catch{fail();}
}
function acceptPlanResult(request,result){
 if(result.source!=='qloo'||!Array.isArray(result.items)||!PLAN_CATEGORIES.includes(result.category))throw {code:'SERVICE_UNAVAILABLE'};
 const state=request.state;state.generated=true;state.choice=null;state.liveChoice=null;state.planApproved=pair(false);state.experienced=false;state.planVersion++;
 state.live.recommendationMode=null;state.live.recommendError=null;state.live.category=result.category;
 state.live.recommendations={...result,items:result.items.slice(0,3),sourceLang:result.sourceLang||request.locale};state.live.planId=result.planId||null;
 const returnedCity=typeof result.brief?.city==='string'?result.brief.city.trim():'';
 if(result.brief?.useCurrentLocation===false&&returnedCity){state.live.location=null;state.live.locationBusy=false;state.live.locationEpoch++;}
 if(!state.live.location&&returnedCity)state.live.city=returnedCity.slice(0,100);
 if(typeof result.text==='string'&&result.text.trim())state.group.push({from:'eve',text:result.text,source:'gemini',sourceLang:result.sourceLang||request.locale});
 if(result.warning||!result.items.length)state.live.recommendError=liveError({code:result.warning||'NO_RECOMMENDATIONS'});
}
async function getLiveReply(request){if(!liveValid(request))return;const payload={episode:request.episode,scope:request.scope,actor:request.actor,locale:request.locale,consent:consentFor(request.episode),relationshipState:sharedRelationshipState(request.episode),messages:liveMessages(request)};if(request.scope==='group'){Object.assign(payload,planningLocation(request.state));if(request.state.live.planId)payload.planId=request.state.live.planId;}const result=await postLive(request.scope==='group'?'/api/eve/assist':'/api/eve/chat',payload,request);if(!liveValid(request))return;if(request.scope==='group'&&result.kind==='plan'){acceptPlanResult(request,result);renderLive(request);return;}if(result.source!=='gemini'||typeof result.text!=='string'||!result.text.trim())throw {code:'SERVICE_UNAVAILABLE'};if(request.scope==='group'&&result.clearPlan===true)request.state.live.planId=null;const message={text:result.text,source:'gemini',sourceLang:result.sourceLang||request.locale};if(request.scope==='group')request.state.group.push({...message,from:'eve'});else{request.state.private[request.actor].push({...message,role:'ai'});if(result.partnerSuggestion&&typeof result.partnerSuggestion.text==='string')deliverPrivateBridge(request,result.partnerSuggestion);}renderLive(request);}
async function liveChat(scope){const request=beginLive(scope);if(!request)return;renderLive(request);try{await getLiveReply(request);}catch(error){if(liveValid(request)){if(scope==='group')request.state.live.groupError=liveError(error);else request.state.live.privateError[request.actor]=liveError(error);}}finally{finishLive(request);}}
function scheduleProactive(){
 const state=current(),key=episode;if(state.proactive.status!=='idle'||state.live.groupBusy||!groupEveReady())return;
 queueMicrotask(()=>{if(episode===key&&states[key]===state&&state.proactive.status==='idle'&&!state.live.groupBusy&&groupEveReady())proactiveEve();});
}
async function proactiveEve(){
 if(!groupEveReady()||current().proactive.status!=='idle')return;const request=beginLive('group');if(!request)return;
 const state=request.state;state.proactive={status:'loading',error:null};renderLive(request);
 try{
  const result=await postLive('/api/eve/proactive',{episode:request.episode,scope:'group',actor:request.actor,locale:request.locale,consent:consentFor(request.episode),relationshipState:sharedRelationshipState(request.episode),messages:liveMessages(request)},request);
  if(!liveValid(request))return;
  if(result.source!=='gemini'||![result.group,result.private?.leo,result.private?.julian].every(text=>typeof text==='string'&&text.trim()))throw {code:'SERVICE_UNAVAILABLE'};
  const base={source:'gemini',sourceLang:result.sourceLang||request.locale,proactive:true};
  state.group.push({...base,from:'eve',text:result.group});
  for(const id of ['leo','julian']){state.private[id].push({...base,role:'ai',text:result.private[id]});state.eveUnread[id]=true;}
  state.proactive={status:'done',error:null};
 }catch(error){if(liveValid(request))state.proactive={status:'error',error:liveError(error)};}finally{finishLive(request);}
}
async function liveIdeas(mode){
 if(!groupEveReady()||!storyPlanReady())return;const request=beginLive('group');if(!request)return;
 const state=request.state,category=state.live.category;
 state.group.push({from:request.actor,text:approvedText(uiRef(mode==='explore'?'planning.explore.'+category:'planning.ask.'+category))});
 state.generated=true;state.live.recommendations=null;state.live.recommendationMode=null;state.live.planId=null;state.live.recommendError=null;invalidatePlan();renderLive(request);
 try{
  const result=await postLive('/api/eve/plan',{episode:request.episode,actor:request.actor,scope:'group',category,...planningLocation(state),mode,locale:request.locale,consent:consentFor(request.episode),relationshipState:sharedRelationshipState(request.episode),messages:liveMessages(request)},request);
  if(!liveValid(request))return;acceptPlanResult(request,result);
 }catch(error){if(liveValid(request))state.live.recommendError=liveError(error);}finally{finishLive(request);}
}
function offerScenarioBridge(sc,turnId){
 if(!sc.partnerHint||sc.prepare||!privateBridgeReady(episode)||(sc.bridgeAfter&&!has(sc.bridgeAfter)))return;
 const request={scope:'private',state:current(),actor,episode,chapter:data().chapter,epoch:current().live.epoch,locale,controller:new AbortController(),bridgeAllowed:true,bridgeKey:'story-'+turnId};
 deliverPrivateBridge(request,{text:approvedText(scenarioRef(sc.key,'partnerHint')),sourceLang:locale});
}
function line(id){return data().lines.find(l=>l.id===id);}
function lineAvailable(l){return current().connected&&l&&l.by===actor&&(!l.after||has(l.after))&&!has(l.id);}
function sentStoryLine(text){const normalize=value=>String(value).normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();return data().lines.find(l=>lineAvailable(l)&&[STORY,STORY_EN].some(stories=>normalize(stories[episode].lines.find(x=>x.id===l.id)?.text||'')===normalize(text)));}
function scenarioRef(key,field){const index=data().scenarios[actor].findIndex(sc=>sc.key===key);return ref('scenarios',actor,index,field);}
function scenarioReply(sc){if(!sc.heart)return scenarioRef(sc.key,'reply');const s=current(),invitation=s.direct.some(m=>m.from===other(actor)&&m.type==='text'&&['date-invite','date-yes'].includes(m.tag)),hint=s.direct.some(m=>m.from===other(actor)&&m.type==='hint');return uiRef(invitation?'ai.heartInvitation':hint?'ai.heartHint':'ai.heartUnknown');}
function renderHint(){const c=hintContext;if(!c)return;const hint=storyFor(c.episode).scenarios[c.actor].find(sc=>sc.key===c.key).hint;
  document.getElementById('hint-recipient').textContent=t('hint.recipient',{name:names[other(c.actor)]});document.getElementById('hint-style').value=c.style;document.getElementById('hint-text').value=String(c.text);document.getElementById('hint-meaning').textContent=hint.meaning;document.getElementById('hint-keep').textContent=hint.keep;document.getElementById('plan-summary').value=String(c.summary);document.getElementById('plan-summary').disabled=!c.share;document.getElementById('plan-consent').checked=c.share;document.getElementById('hint-error').textContent=c.error?t(c.error):'';
}
function hintRef(key,field){const index=data().scenarios[actor].findIndex(sc=>sc.key===key);return ref('scenarios',actor,index,'hint',field);}
function openHint(key){const sc=data().scenarios[actor].find(x=>x.key===key);if(!sc?.hint||!current().connected)return;hintContext={actor,episode,key,style:'subtle',text:hintRef(key,'subtle'),summary:hintRef(key,'summary'),share:false,error:null};renderHint();document.getElementById('hint-dialog').showModal();}
function stageDraft(id){const l=line(id);if(!lineAvailable(l))return;const s=current();s.drafts[actor].direct=ref('lines',data().lines.findIndex(l=>l.id===id),'text');s.drafts[actor].tag=id;go('chat','direct');document.querySelector('.composer textarea')?.focus();}
function addScenario(key){if(!current().connected){const allowed=current().opened[actor]?'curious':'begin';if(key!==allowed)return;current().private[actor].push({role:'user',text:uiRef('meet.'+key+'.question')},{role:'ai',text:uiRef('meet.'+key+'.reply')});render();return;}const sc=data().scenarios[actor].find(x=>x.key===key);if(!sc)return;const turnId=++seq;current().private[actor].push({role:'user',text:scenarioRef(key,'text')},{role:'ai',text:scenarioReply(sc),sc:key});offerScenarioBridge(sc,turnId);render();}
function revealSharedOutcome(action,previousScroll){
 if(previousScroll===undefined)return;
 const pane=document.querySelector('.pane');if(!pane)return;
 // Rebuilding a view must not send a confirmation back to the start of the conversation.
 pane.scrollTop=previousScroll;
 const selector=action==='choose'||action==='choose-live'||action==='approve-plan'?'[data-plan-status]':current().saved?':scope > .status':action==='share-memory'?'.memory-editor .shared-needs':'.memory-editor [data-do="approve-memory"]';
 const target=pane.querySelector(selector);if(!target)return;
 const bounds=pane.getBoundingClientRect(),position=target.getBoundingClientRect();
 const choosing=action==='choose'||action==='choose-live';
 if(choosing||position.top<bounds.top+12||position.bottom>bounds.bottom-12){
  const top=pane.scrollTop+position.top-bounds.top-16;
  pane.scrollTo({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-do]');if(!el||el.disabled)return;const a=el.dataset.do,arg=el.dataset.arg,s=current();
 const outcomeScroll=['choose','choose-live','approve-plan','share-memory','approve-memory'].includes(a)?document.querySelector('.pane')?.scrollTop:undefined;
 switch(a){
 case 'page':go(arg);return;case 'private':go('chat','private');return;case 'direct':go('chat','direct');return;case 'mode':go('chat',arg);return;case 'episode':setEpisode(arg);return;
 case 'interest':if(!s.opened[actor])return;s.interest[actor]=true;if(both(s.interest)){s.connected=true;toast('notice.connected');}break;
 case 'scenario':addScenario(arg);return;case 'hint':openHint(arg);return;case 'draft':stageDraft(arg);return;
 case 'relationship-settings':go('settings');return;
 case 'group-ideas':liveIdeas(arg==='new'?'explore':'common');return;
 case 'plan-category':if(PLAN_CATEGORIES.includes(arg)&&!s.live.groupBusy)s.live.category=arg;break;
 case 'plan-location':locateForPlanning();return;
 case 'clear-location':if(s.live.groupBusy)return;cancelLocation();s.live.location=null;s.live.locationError=null;break;
 case 'retry-proactive':if(groupEveReady()&&s.proactive.status==='error')s.proactive={status:'idle',error:null};break;
 case 'focus':document.querySelector('.composer textarea')?.focus();return;
 case 'pause':s.paused[actor]=true;toast('notice.pause');break;case 'resume':s.paused[actor]=false;break;
 case 'withdraw':{const m=s.nudges.find(m=>m.id===+arg&&m.from===actor);if(m){m.revoked=true;if(s.sharedSource[actor]===m.id){s.shared[actor]='';s.sharedSource[actor]=null;invalidatePlan();}toast('notice.withdraw');}break;}
 case 'nudge-dismiss':{const m=s.nudges.find(m=>m.id===+arg&&m.to===actor);if(m)m.dismissed=true;break;}
 case 'nudge-use':{const m=s.nudges.find(m=>m.id===+arg&&m.to===actor);if(m&&preferences.receive[actor]&&!m.used&&!m.revoked&&!m.dismissed&&Date.now()<m.expires){m.used=true;const next=data().lines.find(lineAvailable);if(next){stageDraft(next.id);return;}go('chat','direct');return;}break;}
 case 'share-needs':if(!s.needs[actor].trim()){toast('notice.needs');return;}s.shared[actor]=approvedText(s.needs[actor].trim());s.sharedSource[actor]=null;s.generated=false;invalidatePlan();toast('notice.shared');break;
 case 'clear-shared':s.shared[actor]='';s.sharedSource[actor]=null;s.generated=false;invalidatePlan();break;
 case 'generate':if(both(s.shared))s.generated=true;break;
 case 'choose':if(!storyPlanReady()||!Number.isInteger(+arg)||!data().options[+arg])return;s.generated=true;s.choice=+arg;s.liveChoice=null;s.planVersion++;s.planApproved=pair(false);s.experienced=false;break;
 case 'choose-live':{if(!storyPlanReady()||!groupEveReady()||s.live.groupBusy||!Number.isInteger(+arg))return;const item=s.live.recommendations?.items[+arg];if(!item)return;s.choice='live';s.liveChoice={...item,planId:s.live.planId,category:s.live.recommendations.category,sourceLang:s.live.recommendations.sourceLang};s.planVersion++;s.planApproved=pair(false);s.experienced=false;break;}
 case 'approve-plan':if(storyPlanReady()&&s.choice!==null)s.planApproved[actor]=true;break;
 case 'decline-plan':invalidatePlan();toast('notice.decline');break;
 case 'time-after':if(!storyPlanReady()||s.choice===null||!both(s.planApproved))return;s.experienced=true;for(const id of Object.keys(names))s.views[id].page=episode==='lifetime'?'plan':'memory';break;
 case 'propose-agreement':if(!has('repair-agree')||!s.agreementDraft.trim())return;s.agreement=approvedText(s.agreementDraft.trim());s.agreementApproved=pair(false);invalidatePlan();break;
 case 'approve-agreement':if(s.agreement)s.agreementApproved[actor]=true;break;
 case 'edit-agreement':s.agreementApproved=pair(false);invalidatePlan();break;
 case 'review-eve-moment':reviewEveMoment();return;
 case 'dismiss-eve-moment':dismissEveMoment();return;
 case 'new-moment':startMoment();return;
 case 'edit-moment':startMoment(arg);return;
 case 'close-moment':memoryNotebook().editors[actor].open=false;render();document.querySelector('[data-do="new-moment"]')?.focus();return;
 case 'share-memory':if(!s.memoryDraft[actor].trim())return;s.memory[actor]=approvedText(s.memoryDraft[actor].trim());s.memoryApproved=pair(false);s.saved=false;break;
 case 'approve-memory':if(!s.experienced||!both(s.memory)||(episode==='lifetime'&&!s.proposalYes))return;s.memoryApproved[actor]=true;s.saved=both(s.memoryApproved);if(s.saved){rewardMemoryCare(episode);toast('notice.saved');}break;
 case 'tree-care':{const scroll=document.querySelector('.pane')?.scrollTop||0;if(!careForTree(arg))return;render();const pane=document.querySelector('.pane');if(pane){pane.scrollTop=scroll;const tree=pane.querySelector('.memory-tree'),tools=pane.querySelector('.tree-care');if(tree&&tools){const p=pane.getBoundingClientRect(),t=tree.getBoundingClientRect(),c=tools.getBoundingClientRect();if(t.top<p.top||c.bottom>p.bottom)pane.scrollTop+=t.top-p.top-12;}}return;}
 case 'archive':if(!both(s.archiveConsent))return;{const m=s.direct.filter(m=>m.type==='text'&&(!data().history||m.tag)).at(-1);if(!m){toast('notice.noArchive');return;}s.archiveText=new ArchiveText(names[m.from],m.text);}break;
 case 'use-archive':if(s.archiveText&&both(s.archiveConsent))s.memoryDraft[actor]=s.archiveText;break;
 case 'say-proposal':if(actor==='leo'&&s.experienced)s.proposalSaid=true;break;
 case 'say-yes':if(actor==='julian'&&s.proposalSaid)s.proposalYes=true;break;
 case 'older':setEpisode(episode==='older'?'lifetime':'older');return;
 case 'next-episode':setEpisode({meet:'date',date:'repair',daily:'repair',repair:'lifetime'}[episode]||'lifetime');return;
 }render();revealSharedOutcome(a,outcomeScroll);
});
document.addEventListener('input',e=>{const s=current(),target=e.target;if(target.closest('#group-form'))s.groupDraft[actor]=target.value;if(target.closest('#chat-form'))s.drafts[actor][s.views[actor].mode]=target.value;
 switch(target.dataset.input){case 'moment-body':momentDraft().text=target.value;target.setCustomValidity('');break;case 'moment-date':momentDraft().date=target.value;break;case 'needs':s.needs[actor]=target.value;break;case 'memory':s.memoryDraft[actor]=target.value;break;case 'agreement':s.agreementDraft=target.value;break;case 'proposal':s.proposalWords=target.value;break;}
 if(hintContext){if(target.id==='hint-text')hintContext.text=target.value;if(target.id==='plan-summary')hintContext.summary=target.value;}
});
document.addEventListener('change',e=>{const target=e.target,s=current();if(target.dataset.relationship){if(!s.connected)return;cancelLive(data().chapter);const r=relationshipMode();if(target.dataset.relationship==='approve')r.approved[actor]=target.checked;else{r.scopes[actor][target.dataset.relationship]=target.checked;r.approved[actor]=false;}if(!r.approved[actor])for(const [key,state] of Object.entries(states))if(storyFor(key).chapter===data().chapter)state.nudges.filter(n=>n.ongoing&&n.from===actor).forEach(n=>n.revoked=true);if(!privateBridgeReady(episode))removeUnreadBridges(data().chapter);render();}if(target.dataset.input==='receive'){cancelLive(data().chapter);preferences.receive[actor]=target.checked;if(!privateBridgeReady(episode))removeUnreadBridges(data().chapter);render();}if(target.dataset.input==='archive'){s.archiveConsent[actor]=target.checked;s.archiveText='';render();}if(target.dataset.prep!==undefined)s.prepared[+target.dataset.prep]=target.checked;});
document.addEventListener('input',e=>{const target=e.target;if(target.dataset.input==='plan-city'&&!current().live.groupBusy){cancelLocation();current().live.city=target.value.slice(0,100);current().live.location=null;current().live.locationError=null;}});
document.addEventListener('change',e=>{if(e.target.dataset.input==='plan-city')render();});
document.addEventListener('toggle',e=>{if(e.target.isConnected&&e.target.matches('.planning-more'))current().live.moreOpen=e.target.open;},true);
document.addEventListener('submit',e=>{if(e.target.id==='moment-form'){e.preventDefault();const id=saveMoment();if(!id){const field=document.getElementById('moment-body');if(field&&!field.value.trim()){field.setCustomValidity(t('moment.empty'));field.reportValidity();}return;}render();toast('moment.saved');document.querySelector('[data-moment-id="'+id+'"]')?.scrollIntoView({block:'nearest'});return;}if(e.target.id==='group-form'){e.preventDefault();const s=current(),text=s.groupDraft[actor].trim();if(s.live.groupBusy)return;if(text){s.group.push({from:actor,text});s.groupDraft[actor]='';render();if(groupEveReady())liveChat('group');}return;}if(e.target.id!=='chat-form')return;e.preventDefault();const s=current(),mode=s.views[actor].mode,draft=s.drafts[actor][mode],text=draft.trim();if(!text||(mode==='private'&&s.live.privateBusy[actor]))return;s.drafts[actor][mode]='';if(mode==='private'){s.private[actor].push({role:'user',text:approvedText(text)});render();liveChat('private');return;}else if(s.connected){const l=sentStoryLine(text);s.direct.push({id:++seq,from:actor,type:'text',text:approvedText(text),tag:l?.id||null});s.drafts[actor].tag=null;notifyPartner();}render();});
document.getElementById('hint-style').onchange=e=>{if(hintContext){hintContext.style=e.target.value;hintContext.text=hintRef(hintContext.key,e.target.value);renderHint();}};
document.getElementById('plan-consent').onchange=e=>{if(hintContext)hintContext.share=e.target.checked;document.getElementById('plan-summary').disabled=!e.target.checked;};
document.getElementById('hint-form').onsubmit=e=>{e.preventDefault();const c=hintContext;if(!c||c.actor!==actor||c.episode!==episode)return;const s=current(),text=c.text.trim(),summary=c.summary.trim();if(!preferences.receive[other(actor)]){c.error='hint.closed';renderHint();return;}if(!text||(c.share&&!summary))return;const id=++seq;s.nudges.push({id,from:actor,to:other(actor),text:approvedText(text),meaning:approvedText(hintRef(c.key,'meaning')),expires:Date.now()+48*60*60*1000,used:false,dismissed:false,revoked:false});if(c.share){s.shared[actor]=approvedText(summary);s.needs[actor]=summary;s.sharedSource[actor]=id;s.generated=false;invalidatePlan();}document.getElementById('hint-dialog').close();hintContext=null;render();toast('hint.sent');};
for(const id of ['close-hint','cancel-hint'])document.getElementById(id).onclick=()=>{document.getElementById('hint-dialog').close();hintContext=null;};
document.getElementById('hint-dialog').addEventListener('cancel',()=>{hintContext=null;});
document.getElementById('reset').onclick=()=>document.getElementById('reset-dialog').showModal();document.getElementById('cancel-reset').onclick=()=>document.getElementById('reset-dialog').close();document.getElementById('confirm-reset').onclick=()=>{cancelLive();states={};for(const k of Object.keys(relationshipModes))delete relationshipModes[k];for(const k of Object.keys(treeCareByChapter))delete treeCareByChapter[k];for(const k of Object.keys(memoryNotebooks))delete memoryNotebooks[k];actor='leo';episode='meet';preferences.receive=pair(true);hintContext=null;document.getElementById('reset-dialog').close();render();};
document.querySelectorAll('[data-mobile]').forEach(b=>b.onclick=()=>{actor=b.dataset.mobile;const s=current();if(s.views[actor].page==='chat'&&s.views[actor].mode==='direct')s.unread[actor]=0;render();});
document.querySelectorAll('button[data-chapter]').forEach(b=>b.onclick=()=>setEpisode({1:'meet',2:'date',3:'repair',4:'lifetime'}[b.dataset.chapter]));
document.querySelector('.brand').onclick=e=>{e.preventDefault();go('home');};
render();
fetch('/api/status').then(response=>response.ok?response.json():null).then(result=>{liveServiceStatus=result;if(current().views[actor].page==='settings')render();}).catch(()=>{});
