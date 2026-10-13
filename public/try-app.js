'use strict';
(() => {
  const copy = {
    en: {
      stories:'Four stories ↗',language:'Language',eyebrow:'A little of you. A little of us.',title:'Bring a few things you love.\nFind something to share.',sampleNote:'The sample partner is a role you can try, not a person online.',
      you:'You',partner:'Sample partner',yourVibe:'Your Vibe',partnerVibe:'Sample partner’s Vibe',likes:'A film, artist or book you love',movie:'Film',artist:'Artist',book:'Book',search:'Search',searching:'Searching…',searchCancel:'Cancel search',noResults:'No matches. Try another title or artist.',example:'Try an example',searchPlaceholder:'Search by title or name',noteLabel:'What would feel good today? (optional)',notePlaceholder:'A quiet afternoon, a little adventure…',remove:'Remove',add:'Add',searchHint:'Choose 1–3 things for each person.',limit:'You have chosen three. Remove one to make room.',
      city:'Our city',tokyo:'Tokyo','new-york':'New York City',london:'London',wellington:'Wellington',consent:'Use these Vibes for this session',start:'Start together',active:'Session started',privacy:'Search sends only that search. Your two Vibes and chat go to EVE when you send a message. Nothing is saved in this browser after you leave.',ready:'Ready. Tell EVE what you would enjoy doing together.',incomplete:'Choose at least one thing for each person, then allow these Vibes for this session.',changed:'Your Vibes changed. Start again to use the new ones; your conversation stays here.',withdrawn:'Vibe sharing is off. Your conversation stays here.',
      together:'TOGETHER',chatHeading:'You, your sample partner & EVE',speaking:'Speaking as',roleNote:'Try either side of the conversation.',message:'Message',messagePlaceholder:'What would feel good to do together?',send:'Send',cancel:'Cancel response',retry:'Try again',reset:'Reset this session',sessionOnly:'Your session, here and now.',empty:'A shared idea starts with something each of you loves.',emptyReady:'Both Vibes are ready. A quiet café, an exhibition, a film — what are you in the mood for?',busy:'EVE is finding a way to bring your tastes together…',cancelled:'Response cancelled. You can send a new message or try again.',newMessage:'Send a message to begin.',choose:'Choose this',chosen:'Selected',clearChoice:'Cancel this choice',selectedPrefix:'Your shared idea: ',notBooked:'Saved for this session. Nothing has been booked.',details:'Why these suggestions?',qlooSource:'Candidates returned by Qloo. EVE connects them to your conversation.',geminiSource:'EVE’s conversational suggestion. No Qloo result was used for this reply.',seedHeading:'Cultural starting points',expired:'These suggestions belong to your earlier Vibes. Ask EVE again with your new ones.',open:'View details ↗',error:'Something went wrong. Your message is still here; try again when you are ready.',rate:'A few requests are already running. Wait a moment, then try again.',unavailable:'EVE is unavailable right now. Please try again later.',noFit:'No suitable match was returned. Try a different idea or add another interest.',consentError:'Choose both Vibes and allow them for this session first.',config:'This demo’s service is not configured yet. Please try later.',validation:'Please check the two Vibes and your message, then try again.'
    },
    zh: {
      stories:'四个故事 ↗',language:'语言',eyebrow:'从一点点的我，到一点点的我们。',title:'带上你喜欢的事物。\n发现可以一起喜欢的。',sampleNote:'示例同伴是供你体验的角色，并非在线真人。',
      you:'我',partner:'示例同伴',yourVibe:'我的 Vibe',partnerVibe:'示例同伴的 Vibe',likes:'喜欢的电影、音乐人或书',movie:'电影',artist:'音乐人',book:'书籍',search:'搜索',searching:'正在搜索…',searchCancel:'取消搜索',noResults:'没有找到，换个名称试试。',example:'填入一个例子',searchPlaceholder:'输入名称搜索',noteLabel:'今天想怎么度过？（可选）',notePlaceholder:'安静一点，或者来点小冒险…',remove:'移除',add:'添加',searchHint:'为每个人选 1–3 个喜欢的事物。',limit:'已经选了三个，移除一个就能换新的。',
      city:'所在城市',tokyo:'东京','new-york':'纽约',london:'伦敦',wellington:'惠灵顿',consent:'本次使用这两份 Vibe',start:'开始一起体验',active:'体验已开始',privacy:'搜索只发送本次搜索词。发送消息时，两份 Vibe 和聊天才会交给 EVE；离开页面后不在浏览器中保存。',ready:'准备好了，告诉 EVE 你们想一起做什么吧。',incomplete:'先为每人选至少一个事物，并勾选本次使用两份 Vibe。',changed:'Vibe 已更新，重新开始就能使用新的偏好，聊天会留在这里。',withdrawn:'已停止共享 Vibe，聊天会留在这里。',
      together:'一起安排',chatHeading:'我、示例同伴和 EVE',speaking:'当前发言',roleNote:'可以轮流体验双方的表达。',message:'消息',messagePlaceholder:'聊聊你们今天想一起做什么…',send:'发送',cancel:'取消回复',retry:'再试一次',reset:'重新体验本页',sessionOnly:'只属于这一次的相遇。',empty:'从各自喜欢的事物里，找一点共同期待。',emptyReady:'两份 Vibe 准备好了。安静的咖啡馆、一个展览、一部电影——今天想做什么？',busy:'EVE 正在把你们的喜好连在一起…',cancelled:'已取消回复。可以发新消息，也可以再试一次。',newMessage:'发一句话，开始吧。',choose:'选这个',chosen:'已选择',clearChoice:'取消这项选择',selectedPrefix:'想一起做的事：',notBooked:'已记在本次体验里，尚未预订。',details:'这些建议从哪里来？',qlooSource:'候选来自 Qloo，EVE 根据你们的聊天解释与安排。',geminiSource:'这是 EVE 的对话建议，本次回复没有使用 Qloo 候选。',seedHeading:'这次使用的文化偏好',expired:'这些建议对应之前的 Vibe。用新的偏好再问问 EVE 吧。',open:'查看详情 ↗',error:'刚刚没有成功，消息还在，可以稍后再试。',rate:'正在处理一些请求，稍等一会儿再试。',unavailable:'EVE 暂时连接不上，请稍后再试。',noFit:'这次没有返回合适的选项，可以换个想法或加一个兴趣。',consentError:'先选好两份 Vibe，并允许本次使用。',config:'体验服务还没有配置完成，请稍后再试。',validation:'检查一下两份 Vibe 和输入内容，再试一次。'
    }
  };
  const $ = id => document.getElementById(id);
  Object.assign(copy.en,{place:'Place',destination:'Destination',settings:'Settings',privacy:'Search sends only that search. Sending a message shares your two Vibes and chat with EVE. Only your language preference is saved on this device.',proposedPrefix:'An idea to consider: ',confirmChoice:'Confirm as ',confirmed:'Confirmed',waiting:'Not yet',interestExpired:'Your selected interests have expired. Remove them, then search and add them again. Your conversation is still here.',noFit:'No matching recommendations came back. Try a different activity or add another interest.'});
  Object.assign(copy.zh,{place:'地点',destination:'目的地',settings:'设置',privacy:'搜索只发送本次搜索词；发送消息时，两份 Vibe 和聊天才会交给 EVE。设备上只保存语言偏好。',proposedPrefix:'想试试的安排：',confirmChoice:'确认选择 · ',confirmed:'已确认',waiting:'待确认',interestExpired:'已选兴趣的搜索结果过期了。请移除后重新搜索、添加，聊天记录仍在。',noFit:'这次没有找到合适的推荐。可以换一种活动，或再加一个兴趣。'});
  Object.assign(copy.en,{flowYou:'Your Vibe',flowPartner:'A demo connection',flowTogether:'Plan with EVE',openDemo:'Open a demo connection',demoStartHint:'Choose one of your interests to open the box.',fictionalPartner:'Fictional demo partner',demoBio:'Film photography, quiet films, and the light between buildings.',demoPhoto:'A photo from Anya’s profile',demoPhotoAlt:'Architectural shadows in Anya’s fictional photo collection',demoSearching:'Looking up a film for Anya’s sample Vibe…',demoReady:'Both Vibes are ready. Allow this session, then start planning together.',demoChoose:'Choose the matching film below, or edit Anya’s sample Vibe.',demoMissing:'The sample film was not found. You can edit the sample Vibe or explore the four stories.',demoFailed:'The sample film could not be loaded. Anya’s profile and the four stories are still available.',retryDemo:'Search the sample interest again',exploreStories:'Explore the four stories ↗',manualVibes:'Edit the sample Vibe yourself',partnerDemo:'Anya (demo)',partnerVibeDemo:'Anya’s Vibe',chatHeadingDemo:'You, Anya & EVE',roleNote:'You write both sides in this demo.',demoNote:'Film photography, architecture, and a quiet conversation.'});
  Object.assign(copy.zh,{flowYou:'我的 Vibe',flowPartner:'示例相遇',flowTogether:'与 EVE 一起安排',openDemo:'打开一个示例相遇',demoStartHint:'先选一个你喜欢的事物，再打开黑盒。',fictionalPartner:'虚构示例同伴',demoBio:'喜欢胶片摄影、安静的电影，还有建筑之间的光影。',demoPhoto:'Anya 分享的照片',demoPhotoAlt:'Anya 虚构照片档案中的建筑光影',demoSearching:'正在为 Anya 的示例 Vibe 查找一部电影…',demoReady:'两份 Vibe 准备好了。勾选本次使用，就能一起安排。',demoChoose:'在下方选择对应电影，或编辑 Anya 的示例 Vibe。',demoMissing:'这次没找到示例电影。可以手动编辑示例 Vibe，或先体验四个故事。',demoFailed:'示例电影暂时没加载成功。仍然可以查看 Anya 的资料、体验四个故事。',retryDemo:'重新搜索示例兴趣',exploreStories:'体验四个故事 ↗',manualVibes:'手动编辑示例 Vibe',partnerDemo:'Anya（示例）',partnerVibeDemo:'Anya 的 Vibe',chatHeadingDemo:'我、Anya 和 EVE',roleNote:'在本次演示中，由你填写双方的话。',demoNote:'喜欢胶片摄影、建筑，想安静地聊聊天。'});
  copy.en.demoEdit='Choose an interest for Anya in the sample Vibe below.';copy.zh.demoEdit='在下方的示例 Vibe 中，为 Anya 选一个兴趣。';
  copy.en.demoSessionReady='Your shared space is ready. Tell EVE what you would enjoy together.';copy.zh.demoSessionReady='共同空间准备好了，告诉 EVE 你们想一起做什么吧。';
  Object.assign(copy.en,{planExpired:'The details of this idea have expired. Clear the choice and ask for fresh ideas; your conversation is still here.',planInvalid:'This choice no longer matches the current Vibes. Clear it and ask for fresh ideas.'});
  Object.assign(copy.zh,{planExpired:'这项选择的资料已过期。取消这项选择，再找一组新灵感；聊天仍然保留。',planInvalid:'这项选择已不符合当前的 Vibe。取消后再找一组新灵感吧。'});
  const LANGUAGE_KEY='evervibe:language';
  function initialLocale() {
    const fromUrl=new URLSearchParams(location.search).get('lang');
    if(['en','zh'].includes(fromUrl))return fromUrl;
    try{const saved=localStorage.getItem(LANGUAGE_KEY);if(['en','zh'].includes(saved))return saved;}catch{}
    return 'en';
  }
  const state = {locale:initialLocale(),city:'tokyo',consent:false,started:false,everStarted:false,revision:0,speaker:'you',messages:[],plan:null,selected:null,confirmations:{you:false,partner:false},busy:false,error:null,status:null,setup:null,retry:false,connection:{opened:false,busy:false,status:null,error:false},
    vibes:{you:{entities:[],note:''},partner:{entities:[],note:''}},search:{you:{query:'',type:'movie',items:[],busy:false,error:null,searched:false},partner:{query:'',type:'movie',items:[],busy:false,error:null,searched:false}}};
  const controllers = {you:null,partner:null,assist:null,connection:null};
  const serials = {you:0,partner:0,assist:0,connection:0};
  const t = key => copy[state.locale][state.connection.opened&&['partner','partnerVibe','chatHeading'].includes(key)?key+'Demo':key] || key;
  function node(tag, className, text) { const el=document.createElement(tag); if(className)el.className=className; if(text!==undefined)el.textContent=text; return el; }
  function button(text, action, className='') {const el=node('button',className,text);el.type='button';el.addEventListener('click',action);return el;}
  function label(key, htmlFor, cls='field-label') {const el=node('label',cls);el.dataset.i18n=key;el.htmlFor=htmlFor;return el;}
  function errorKey(code) {
    if(code==='TRY_INTEREST_EXPIRED')return 'interestExpired';
    if(code==='TRY_PLAN_EXPIRED')return 'planExpired';
    if(code==='TRY_PLAN_INVALID')return 'planInvalid';
    if(/RATE_LIMIT|BUSY/.test(code||''))return 'rate';
    if(/CONSENT/.test(code||''))return 'consentError';
    if(/NOT_CONFIGURED|MISSING_KEY/.test(code||''))return 'config';
    if(/NO_RECOMMENDATIONS|NO_FIT|EMPTY|NOT_FOUND/.test(code||''))return 'noFit';
    if(/INVALID|BAD_REQUEST|TOO_LONG/.test(code||''))return 'validation';
    if(/UNAVAILABLE|TIMEOUT/.test(code||''))return 'unavailable';
    return 'error';
  }
  async function post(path, body, signal) {
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
    let data;try{data=await response.json();}catch{throw new Error('INTERNAL_ERROR');}
    if(!response.ok)throw new Error(data.error?.code || 'INTERNAL_ERROR');
    return data;
  }
  function abortSearch(owner) {serials[owner]++;controllers[owner]?.abort();controllers[owner]=null;state.search[owner].busy=false;}
  function stopAssist() {serials.assist++;controllers.assist?.abort();controllers.assist=null;state.busy=false;}
  function stopConnectionSearch() {serials.connection++;controllers.connection?.abort();controllers.connection=null;state.connection.busy=false;}
  function renderConnection() {
    const connection=state.connection;
    $('demo-connection').classList.toggle('opened',connection.opened);
    $('open-demo').hidden=connection.opened;$('open-demo').disabled=!state.vibes.you.entities.length;
    $('demo-start-hint').hidden=connection.opened;
    $('demo-profile').hidden=!connection.opened;
    const profileReady=state.vibes.you.entities.length&&state.vibes.partner.entities.length;
    const status=connection.busy?'demoSearching':!state.vibes.you.entities.length?'demoStartHint':profileReady?(state.started?'demoSessionReady':'demoReady'):connection.status==='demoReady'?'demoEdit':connection.status;
    $('demo-status').textContent=status?t(status):'';
    $('demo-interest').textContent=state.vibes.partner.entities.map(item=>item.title+(item.year?' ('+item.year+')':'')).join(' · ');
    $('retry-demo').hidden=!connection.opened||connection.busy||profileReady||!(connection.error||connection.status==='demoMissing');
    $('retry-demo').disabled=!state.vibes.you.entities.length;
    $('demo-stories').href='/stories.html?lang='+state.locale;
    document.querySelector('.demo-photo img').alt=t('demoPhotoAlt');
  }
  async function loadDemoInterest() {
    if(!state.vibes.you.entities.length||state.connection.busy)return;
    if(state.vibes.partner.entities.length){state.connection.status='demoReady';state.connection.error=false;renderConnection();return;}
    stopConnectionSearch();const token=serials.connection,controller=new AbortController();controllers.connection=controller;
    state.connection.busy=true;state.connection.error=false;state.connection.status=null;renderConnection();
    try {
      const data=await post('/api/try/search',{query:'Lost in Translation',type:'movie',locale:state.locale},controller.signal);
      if(token!==serials.connection)return;
      const items=Array.isArray(data.items)?data.items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string').slice(0,6):[];
      const film=items.find(item=>item.type==='movie'&&item.title.trim().toLowerCase()==='lost in translation'&&Number(item.year)===2003);
      if(!state.vibes.partner.entities.length){
        if(film){state.vibes.partner.entities.push({...film});if(!state.vibes.partner.note){state.vibes.partner.note=t('demoNote');$('partner-note').value=state.vibes.partner.note;}invalidate();renderChips('partner');state.connection.status='demoReady';}
        else {Object.assign(state.search.partner,{query:'Lost in Translation',type:'movie',items,searched:true,error:null});$('partner-query').value='Lost in Translation';$('partner-type').value='movie';state.connection.status=items.length?'demoChoose':'demoMissing';if(items.length)$('manual-vibes').open=true;}
      }else state.connection.status='demoReady';
      renderSearch('partner');
    }catch(error){if(token===serials.connection&&error.name!=='AbortError'){state.connection.error=true;state.connection.status='demoFailed';}}
    finally{if(token===serials.connection){state.connection.busy=false;controllers.connection=null;renderConnection();}}
  }
  function invalidate(reason='changed') {
    const wasStarted=state.everStarted;
    stopAssist();state.revision++;state.started=false;state.selected=null;state.confirmations={you:false,partner:false};state.retry=false;state.error=null;state.status=null;state.setup=reason==='changed'&&!wasStarted?null:reason;
    if(state.plan)state.plan.expired=true;
    renderControls();renderPlan();
  }
  function makeVibeCard(owner) {
    const card=node('article','vibe-card '+owner);card.dataset.owner=owner;
    const head=node('div','card-title');const heading=node('h2');heading.dataset.i18n=owner==='you'?'yourVibe':'partnerVibe';head.append(heading,node('span','counter','0 / 3'));card.append(head);
    const form=node('form');form.id=owner+'-search-form';form.append(label('likes',owner+'-query'));
    const row=node('div','search-row'),type=node('select');type.id=owner+'-type';type.setAttribute('aria-label',owner+' cultural type');
    for(const kind of ['movie','artist','book']){const option=node('option','',kind);option.value=kind;option.dataset.i18n=kind;type.append(option);}
    const query=node('input');query.type='search';query.id=owner+'-query';query.maxLength=100;query.autocomplete='off';
    row.append(type,query);form.append(row);
    const actions=node('div','search-actions'),example=button('',()=>{query.value=owner==='you'?'Blade Runner':'Amélie';type.value='movie';state.search[owner].query=query.value;state.search[owner].type='movie';abortSearch(owner);state.search[owner].items=[];state.search[owner].error=null;state.search[owner].searched=false;renderSearch(owner);query.focus();},'text-button example');example.dataset.i18n='example';
    const submit=node('button','','');submit.type='submit';submit.id=owner+'-search-button';actions.append(example,submit);form.append(actions);
    const feedback=node('p','search-feedback');feedback.id=owner+'-search-status';feedback.setAttribute('role','status');form.append(feedback);
    const results=node('div','search-results');results.id=owner+'-results';form.append(results);card.append(form);
    const chips=node('div','chips');chips.id=owner+'-chips';card.append(chips);
    const note=node('div','note-field');note.append(label('noteLabel',owner+'-note'));const textarea=node('textarea');textarea.id=owner+'-note';textarea.maxLength=160;textarea.rows=2;note.append(textarea);card.append(note);
    query.addEventListener('input',()=>{abortSearch(owner);state.search[owner].query=query.value;state.search[owner].items=[];state.search[owner].error=null;state.search[owner].searched=false;renderSearch(owner);});
    type.addEventListener('change',()=>{abortSearch(owner);state.search[owner].type=type.value;state.search[owner].items=[];state.search[owner].searched=false;state.search[owner].error=null;renderSearch(owner);});
    textarea.addEventListener('input',()=>{state.vibes[owner].note=textarea.value;invalidate();});
    form.addEventListener('submit',event=>{event.preventDefault();if(state.search[owner].busy){abortSearch(owner);renderSearch(owner);}else search(owner);});
    return card;
  }
  async function search(owner) {
    const s=state.search[owner],query=s.query.trim();if(!query)return;
    if(owner==='partner'&&state.connection.busy){stopConnectionSearch();state.connection.status=null;renderConnection();}
    abortSearch(owner);const token=serials[owner],controller=new AbortController();controllers[owner]=controller;s.busy=true;s.error=null;s.items=[];s.searched=false;renderSearch(owner);
    try {
      const data=await post('/api/try/search',{query,type:s.type,locale:state.locale},controller.signal);
      if(token!==serials[owner])return;
      s.items=Array.isArray(data.items)?data.items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string').slice(0,6):[];s.searched=true;
    }catch(error){if(token===serials[owner]&&error.name!=='AbortError')s.error=errorKey(error.message);}
    finally{if(token===serials[owner]){s.busy=false;controllers[owner]=null;renderSearch(owner);}}
  }
  function renderSearch(owner) {
    const s=state.search[owner],vibe=state.vibes[owner],results=$(owner+'-results');results.replaceChildren();
    $(owner+'-search-button').textContent=t(s.busy?'searchCancel':'search');
    $(owner+'-search-button').disabled=!s.query.trim();
    const feedback=$(owner+'-search-status');feedback.classList.toggle('error',!!s.error);
    feedback.textContent=t(s.error || (s.busy?'searching':vibe.entities.length>=3?'limit':s.searched&&!s.items.length?'noResults':'searchHint'));
    for(const item of s.items) {
      const selected=vibe.entities.some(entity=>entity.id===item.id);
      const result=button('',()=>{if(vibe.entities.length>=3||selected)return;vibe.entities.push({...item});s.items=[];s.searched=false;invalidate();renderSearch(owner);renderChips(owner);},'search-result');
      result.append(node('span','',item.title),node('small','',[(item.type&&t(item.type))||t(s.type),item.year].filter(Boolean).join(' · ')));
      result.disabled=selected||vibe.entities.length>=3;result.dataset.entity=item.id;result.setAttribute('aria-label',t('add')+' '+item.title);results.append(result);
    }
  }
  function renderChips(owner) {
    const container=$(owner+'-chips');container.replaceChildren();
    state.vibes[owner].entities.forEach(entity=>{
      const chip=node('span','chip');chip.append(node('span','',entity.title));const remove=button('×',()=>{state.vibes[owner].entities=state.vibes[owner].entities.filter(item=>item.id!==entity.id);invalidate();renderChips(owner);renderSearch(owner);});remove.setAttribute('aria-label',t('remove')+' '+entity.title);chip.append(remove);container.append(chip);
    });
    document.querySelector('[data-owner="'+owner+'"] .counter').textContent=state.vibes[owner].entities.length+' / 3';
  }
  function renderControls() {
    renderConnection();
    $('start').disabled=state.started;
    $('start').textContent=t(state.started?'active':'start');
    $('setup-status').textContent=state.setup?t(state.setup):'';
    $('send').disabled=!state.started||state.busy||!state.consent;
    $('message').disabled=!state.started||!state.consent;
    $('cancel').hidden=!state.busy;
    $('retry').hidden=!state.retry||state.busy||!state.started||!state.consent;
    $('chat-status').textContent=state.busy?t('busy'):state.status?t(state.status):'';
    $('chat-error').textContent=state.error?t(state.error):'';
    if(!state.messages.length)renderMessages();
  }
  function renderMessages() {
    const container=$('messages');container.replaceChildren();
    if(!state.messages.length){container.append(node('p','empty-message',t(state.started?'emptyReady':'empty')));return;}
    state.messages.forEach(message=>{
      const article=node('article','message '+message.from);article.append(node('p','sender',message.from==='eve'?'EVE':t(message.from)),node('p','bubble',message.text));container.append(article);
    });
    container.scrollTop=container.scrollHeight;
  }
  function renderPlan() {
    const container=$('recommendations');container.replaceChildren();const plan=state.plan;if(!plan)return;
    if(plan.expired)container.append(node('p','expired-note',t('expired')));
    const grid=node('div','recommendation-grid'+(plan.expired?' expired':''));
    (plan.items||[]).slice(0,3).forEach(item=>{
      const selected=state.selected===item.id,card=node('article','recommendation'+(selected?' selected':''));card.dataset.candidate=item.id;
      card.append(node('p','metadata',[item.city||t(state.city),item.type&&t(item.type),item.year].filter(Boolean).join(' · ')),node('h3','',item.title));
      if(item.address)card.append(node('p','metadata',item.address));
      if(item.reason)card.append(node('p','',item.reason));
      if(item.activity)card.append(node('p','',item.activity));
      if(item.url){try{const url=new URL(item.url);if(url.protocol==='https:'&&!url.username&&!url.password){const link=node('a','',t('open'));link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';card.append(link);}}catch{}}
      const choose=button(t(selected?'clearChoice':'choose'),()=>{state.selected=selected?null:item.id;state.confirmations={you:false,partner:false};renderPlan();});choose.disabled=!!plan.expired||!state.started||!state.consent||state.busy;choose.setAttribute('aria-pressed',String(selected));card.append(choose);grid.append(card);
    });container.append(grid);
    if(state.selected&&!plan.expired){const item=plan.items.find(item=>item.id===state.selected);if(item){
      const shared=state.confirmations.you&&state.confirmations.partner;
      const result=node('div','selection-status');result.dataset.shared=String(shared);
      const status=node('p','',t(shared?'selectedPrefix':'proposedPrefix')+item.title);status.setAttribute('role','status');result.append(status);
      const confirmations=node('div','choice-confirmations');
      for(const owner of ['you','partner']){const badge=node('span','confirmation'+(state.confirmations[owner]?' confirmed':''),t(owner)+' · '+t(state.confirmations[owner]?'confirmed':'waiting'));badge.dataset.confirmation=owner;badge.dataset.confirmed=String(state.confirmations[owner]);confirmations.append(badge);}
      result.append(confirmations);
      if(shared)result.append(node('p','fine',t('notBooked')));
      else {const confirm=button(t('confirmChoice')+t(state.speaker),()=>{if(!state.selected||state.plan?.expired||!state.started||!state.consent||state.busy)return;state.confirmations[state.speaker]=true;renderPlan();},'primary');confirm.id='confirm-choice';confirm.disabled=state.confirmations[state.speaker]||!state.started||!state.consent||state.busy;result.append(confirm);}
      container.append(result);
    }}
    const details=node('details','plan-details');details.append(node('summary','',t('details')),node('p','',t(plan.source==='qloo'?'qlooSource':'geminiSource')));
    if(Array.isArray(plan.seeds)&&plan.seeds.length){details.append(node('p','',t('seedHeading')));const list=node('ul');plan.seeds.forEach(seed=>list.append(node('li','',t(seed.owner==='partner'?'partner':'you')+' · '+seed.title)));details.append(list);}
    container.append(details);
  }
  async function assist() {
    if(!state.started||!state.consent||state.busy)return;
    const messages=state.messages.filter(message=>message.revision===state.revision).slice(-20).map(({from,text})=>({from,text}));
    if(!messages.some(message=>message.from!=='eve'))return;
    stopAssist();const token=serials.assist,revision=state.revision,controller=new AbortController();controllers.assist=controller;state.busy=true;state.error=null;state.status=null;state.retry=false;renderPlan();renderControls();
    const body={locale:state.locale,city:state.city,vibes:{you:{entities:state.vibes.you.entities.map(item=>item.id),note:state.vibes.you.note},partner:{entities:state.vibes.partner.entities.map(item=>item.id),note:state.vibes.partner.note}},messages,consent:true};
    const selected=state.plan?.items.find(item=>item.id===state.selected);
    if(selected&&!state.plan.expired)body.selection={token:selected.contextToken||'',confirmed:{...state.confirmations}};
    try {
      const data=await post('/api/try/assist',body,controller.signal);
      if(token!==serials.assist||revision!==state.revision||!state.consent)return;
      if(typeof data.text!=='string'||!data.text.trim())throw new Error('INTERNAL_ERROR');
      state.messages.push({from:'eve',text:data.text,revision,sourceLang:data.sourceLang||body.locale});
      const items=Array.isArray(data.items)?data.items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string').slice(0,3):[];
      if(items.length&&(!state.selected||data.replaceSelection===true)){state.plan={items,seeds:data.seeds||[],source:data.source,expired:false};state.selected=null;state.confirmations={you:false,partner:false};}
      renderMessages();renderPlan();
    }catch(error){if(token===serials.assist&&error.name!=='AbortError'){
      state.error=errorKey(error.message);state.retry=!['interestExpired','planExpired','planInvalid'].includes(state.error);
      if(state.error==='interestExpired'){if(state.plan)state.plan.expired=true;state.selected=null;state.confirmations={you:false,partner:false};}
    }}
    finally{if(token===serials.assist){state.busy=false;controllers.assist=null;renderControls();renderPlan();}}
  }
  function translate() {
    document.documentElement.lang=state.locale==='zh'?'zh-CN':'en';
    $('language').value=state.locale;
    document.title='EverVibe · '+(state.locale==='zh'?'体验我的 Vibe':'Try your Vibe');
    document.querySelectorAll('[data-i18n]').forEach(el=>{if(el.id==='page-title'){el.replaceChildren();t('title').split('\n').forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line));});}else el.textContent=t(el.dataset.i18n);});
    for(const owner of ['you','partner']){$(owner+'-query').placeholder=t('searchPlaceholder');$(owner+'-note').placeholder=t('notePlaceholder');$(owner+'-type').setAttribute('aria-label',t(owner==='you'?'yourVibe':'partnerVibe')+' · '+t('likes'));renderSearch(owner);renderChips(owner);}
    Array.from($('city').options).forEach(option=>option.textContent=t(option.value));
    Array.from($('speaker').options).forEach(option=>option.textContent=t(option.value));
    $('message').placeholder=t('messagePlaceholder');$('vibe-setup').setAttribute('aria-label',state.locale==='zh'?'Vibe 设置':'Vibe setup');
    renderMessages();renderPlan();renderControls();
  }
  $('your-vibe').append(makeVibeCard('you'));$('partner-vibe').append(makeVibeCard('partner'));
  $('open-demo').addEventListener('click',()=>{if(!state.vibes.you.entities.length)return;state.connection.opened=true;translate();loadDemoInterest();});
  $('retry-demo').addEventListener('click',()=>loadDemoInterest());
  $('language').addEventListener('change',event=>{state.locale=event.target.value;try{localStorage.setItem(LANGUAGE_KEY,state.locale);}catch{}const url=new URL(location.href);if(url.searchParams.has('lang')){url.searchParams.set('lang',state.locale);history.replaceState(null,'',url);}translate();});
  $('city').addEventListener('change',event=>{state.city=event.target.value;invalidate();});
  $('consent').addEventListener('change',event=>{state.consent=event.target.checked;if(!state.consent)invalidate('withdrawn');else renderControls();});
  $('speaker').addEventListener('change',event=>{state.speaker=event.target.value;renderPlan();});
  $('start').addEventListener('click',()=>{
    if(!state.consent||!state.vibes.you.entities.length||!state.vibes.partner.entities.length){state.setup='incomplete';renderControls();return;}
    state.started=true;state.everStarted=true;state.setup='ready';state.status=null;renderControls();$('message').focus();
  });
  $('chat-form').addEventListener('submit',event=>{
    event.preventDefault();const text=$('message').value.trim();if(!text||state.busy||!state.started||!state.consent)return;
    if(text.length>1500){state.error='validation';state.retry=false;renderControls();return;}
    state.messages.push({from:state.speaker,text,revision:state.revision});$('message').value='';renderMessages();assist();
  });
  $('message').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chat-form').requestSubmit();}});
  $('cancel').addEventListener('click',()=>{stopAssist();state.status='cancelled';state.retry=true;renderControls();renderPlan();});
  $('retry').addEventListener('click',()=>assist());
  $('reset').addEventListener('click',()=>{
    stopAssist();stopConnectionSearch();state.connection={opened:false,busy:false,status:null,error:false};$('manual-vibes').open=false;for(const owner of ['you','partner']){abortSearch(owner);state.vibes[owner]={entities:[],note:''};state.search[owner]={query:'',type:'movie',items:[],busy:false,error:null,searched:false};$(owner+'-query').value='';$(owner+'-type').value='movie';$(owner+'-note').value='';}
    state.city='tokyo';state.consent=false;state.started=false;state.everStarted=false;state.revision++;state.speaker='you';state.messages=[];state.plan=null;state.selected=null;state.confirmations={you:false,partner:false};state.error=null;state.status=null;state.setup=null;state.retry=false;
    $('city').value='tokyo';$('consent').checked=false;$('speaker').value='you';$('message').value='';translate();$('you-query').focus();
  });
  translate();
})();
