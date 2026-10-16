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
  Object.assign(copy.en,{chatTab:'Chat',privateTab:'Private chat with EVE',directTab:'Chat with {name}',perspective:'Perspective',yourView:'Your view',partnerView:'{name}’s view',withPartner:'Your space with {name}',privateScope:'Just between you and EVE',directScope:'Your conversation together',groupScope:'You, {name} and EVE',privateEmpty:'What’s on your mind? A feeling, a little hesitation, or something you’d love to share.',directEmpty:'Say hello. Sometimes one small question is all it takes.',privatePlaceholder:'Tell EVE what’s on your mind…',directPlaceholder:'Write to {name}…',privateBusy:'EVE is listening…',connectionNeeded:'Open a demo connection to start this conversation.',privateIdea:'I’d like to get to know them, but I don’t know how to start.',writeTogether:'Write to {name}',privateReady:'You can talk to EVE here. Shared plans are one tab away.',privatePrivacy:'Private EVE messages stay in their own window. Only messages sent in Make plans enter the shared EVE conversation.'});
  Object.assign(copy.zh,{chatTab:'聊聊',privateTab:'和 EVE 私聊',directTab:'和{name}聊天',perspective:'体验身份',yourView:'我的视角',partnerView:'{name}的视角',withPartner:'与{name}的空间',privateScope:'只在你和 EVE 之间',directScope:'你们两个人的聊天',groupScope:'我、{name}和 EVE',privateEmpty:'有什么想和 EVE 聊聊的？一点心动、一点犹豫，或者想一起做的事。',directEmpty:'打个招呼吧。也许一个小问题，就能开始。',privatePlaceholder:'告诉 EVE 你的想法…',directPlaceholder:'给{name}写一句话…',privateBusy:'EVE 在听…',connectionNeeded:'先打开一个示例相遇，就能开始聊天。',privateIdea:'我想更了解对方，但不知道怎么开口。',writeTogether:'给{name}写句话',privateReady:'可以在这里和 EVE 聊聊，也可以切换到一起安排。',privatePrivacy:'EVE 私聊保留在各自窗口。只有在“一起安排”发送的消息会进入共同 EVE 对话。'});
  Object.assign(copy.en,{setupTitle:'Vibes & location',editVibes:'Vibes & location',makePlans:'Make plans',chatHeading:'Your shared space',chatHeadingDemo:'Your shared space',sharingOn:'Vibes shared · edit',sharingOff:'Vibe sharing is off · edit',useLocation:'Use my location',locating:'Finding your location…',nearMe:'Near me',locationReady:'Using your approximate location for nearby ideas.',locationDenied:'Location was not allowed. You can choose a city instead.',locationUnavailable:'Location could not be found. You can choose a city instead.',locationTimeout:'Location took too long. Try again or choose a city.',clearLocation:'Use selected city',firstIdeaNearby:'Could you find a cultural place nearby that fits both our tastes? We want time to talk.'});
  Object.assign(copy.zh,{setupTitle:'Vibe 与地点',editVibes:'Vibe 与地点',makePlans:'一起安排',chatHeading:'我们的共同空间',chatHeadingDemo:'我们的共同空间',sharingOn:'Vibe 已共享 · 修改',sharingOff:'Vibe 共享已关闭 · 修改',useLocation:'使用我的位置',locating:'正在获取位置…',nearMe:'我的附近',locationReady:'将使用大致位置寻找附近的安排。',locationDenied:'未允许定位，可以手动选择城市。',locationUnavailable:'暂时无法获取位置，可以手动选择城市。',locationTimeout:'定位超时，可以重试或手动选择城市。',clearLocation:'使用所选城市',firstIdeaNearby:'帮我们在附近找个适合两人口味的文化去处吧，想留些时间聊聊天。'});
  copy.en.fallbackCity='Fallback city';copy.zh.fallbackCity='备用城市';
  Object.assign(copy.en,{quickExample:'Try two different tastes',quickLoading:'Looking up two sample films…',quickReady:'Knives Out + Amélie, in New York. Share these sample Vibes to begin.',needYou:'Choose something you love first.',needPartner:'Open the demo connection or choose an interest for the sample partner.',needConsent:'Tick “Share these Vibes” beside Start together to continue.',consent:'Share these Vibes with EVE for this session',privacy:'Starting compares your selected interests with Qloo. Your notes and chat reach EVE when you send a message. Only your language preference is saved on this device.',bridgeTitle:'A little common ground',bridgeLoading:'Qloo is comparing both Vibes…',bridgeEmpty:'No shared themes returned this time. Your different tastes can still inspire a plan.',bridgeUnavailable:'Shared themes are unavailable right now. You can still plan from both Vibes.',bridgeSource:'Cultural themes from Qloo · not a relationship score',bridgeCache:'Recent Qloo comparison',firstIdea:'Could you find a cultural place in {city} that fits both our tastes? We want time to talk.'});
  Object.assign(copy.zh,{quickExample:'试试两种不同的口味',quickLoading:'正在查找两部示例电影…',quickReady:'《利刃出鞘》＋《天使爱美丽》，地点纽约。共享这两份示例 Vibe 即可开始。',needYou:'先选一个你喜欢的事物。',needPartner:'打开示例相遇，或为示例同伴选一个兴趣。',needConsent:'勾选“本次与 EVE 共享这些 Vibe”，再开始一起体验。',consent:'本次与 EVE 共享这些 Vibe',privacy:'开始时由 Qloo 比较所选兴趣。发送消息后，你们的心情备注和聊天才交给 EVE。设备上只保存语言偏好。',bridgeTitle:'一点共同的喜欢',bridgeLoading:'Qloo 正在比较两份 Vibe…',bridgeEmpty:'这次没有返回共同主题。不同的喜欢也能带来一起尝试的灵感。',bridgeUnavailable:'共同主题暂时连接不上，仍可根据两人的兴趣安排。',bridgeSource:'文化主题来自 Qloo · 不是感情评分',bridgeCache:'最近的 Qloo 比较结果',firstIdea:'帮我们在{city}找个适合两人口味的文化去处吧，想留些时间聊聊天。'});
  function initialLocale() {
    const fromUrl=new URLSearchParams(location.search).get('lang');
    if(['en','zh'].includes(fromUrl))return fromUrl;
    try{const saved=localStorage.getItem(LANGUAGE_KEY);if(['en','zh'].includes(saved))return saved;}catch{}
    return 'en';
  }
  let selectedPerson=null;
  const state = {locale:initialLocale(),city:'',consent:false,started:false,everStarted:false,revision:0,speaker:'you',messages:[],plan:null,selected:null,confirmations:{you:false,partner:false},busy:false,error:null,status:null,setup:null,retry:false,connection:{opened:false,busy:false,status:null,error:false},
    vibes:{you:{entities:[],note:''},partner:{entities:[],note:''}},search:{you:{query:'',type:'movie',items:[],busy:false,error:null,searched:false},partner:{query:'',type:'movie',items:[],busy:false,error:null,searched:false}}};
  state.bridge=null;state.bridgeBusy=false;state.exampleBusy=false;state.location=null;state.locationBusy=false;state.locationStatus=null;state.locationEpoch=0;
  state.view='private';state.privateMessages={you:[],partner:[]};state.directMessages=[];state.drafts={};
  state.sharing={you:{vibe:false,eve:true},partner:{vibe:false,eve:true}};state.checkins=new Set();state.unread={you:0,partner:0};
  Object.assign(copy.en,{memoriesTab:'Our memories',shareVibe:'Share my Vibe',receiveEve:'Receive EVE suggestions',qlooIntro:'Qloo connects what you both love. EVE turns that common ground into something to do together.',needConsent:'Both people need to share their Vibe and receive EVE suggestions to plan with EVE.',privacy:'Shared Vibes include chosen interests and today’s note. Private EVE chats stay separate. Only your language preference is saved on this device.',eveOff:'EVE suggestions are off. You can turn them on in Settings.',afterTime:'After our time together',sharedWelcome:'{name} enjoys {taste}. A little curiosity can be a lovely start — ask what they love about it.',memoryNudge:'When you’ve had that time together, tell me what stayed with you. You can keep it in Our memories.',nextSetting:'Open sharing settings'});
  Object.assign(copy.zh,{memoriesTab:'共同记忆',shareVibe:'共享我的 Vibe',receiveEve:'接收 EVE 建议',qlooIntro:'Qloo 连接你们各自喜欢的事物，EVE 把文化共鸣变成可以一起做的安排。',needConsent:'两人都开启共享 Vibe 和接收 EVE 建议后，就能和 EVE 一起安排。',privacy:'共享 Vibe 包含所选兴趣与今天的心情备注。EVE 私聊仍各自独立。设备上只保存语言偏好。',eveOff:'接收 EVE 建议已关闭，可以在设置里打开。',afterTime:'相处之后，留下一段回忆',sharedWelcome:'{name}喜欢{taste}。可以好奇地问问，最喜欢其中的什么。',memoryNudge:'等你们一起经历之后，告诉我最想记住的片刻吧，可以把它留在共同记忆里。',nextSetting:'打开共享设置'});
  Object.assign(copy.en,{visitorVibe:'Visitor’s Vibe',demoTasteHint:'Add your tastes when you’re ready to plan together.',done:'Done',myBlackbox:'My black box',sayHello:'Say hello',addYourVibe:'Add what you love',entryWelcome:'Tell me what’s on your mind. Or open your black box — someone’s world might make you curious.',demoStartHint:'A fictional connection to explore.',privateBefore:'I’d love to meet someone who shares my curiosity.',privateEmpty:'What’s on your mind?',demoReady:'You can say hello, or share your Vibes to plan with EVE.',boxOpen:'Open my black box',boxDrag:'Drag to explore · ← → to rotate',boxAria:'Your 3D black box. Drag or use the left and right arrow keys to rotate.',boxOpening:'Opening…',boxOpened:'Opened',boxUnavailable:'3D is unavailable here. You can still open the box.',qlooIntro:'Qloo connects your tastes. EVE helps turn them into shared plans.'});
  Object.assign(copy.zh,{visitorVibe:'体验者的 Vibe',demoTasteHint:'想一起安排时，再加入你的喜好。',done:'完成',myBlackbox:'我的黑盒',sayHello:'打个招呼',addYourVibe:'加入我的喜欢',entryWelcome:'有什么心事，慢慢和我说。也可以打开黑盒，看看谁的世界让你好奇。',demoStartHint:'一个可以认识的虚构示例人物。',privateBefore:'我想认识一个和我一样充满好奇的人。',privateEmpty:'有什么想和我聊聊的？',demoReady:'可以先打个招呼，也可以共享 Vibe，和 EVE 一起安排。',boxOpen:'打开我的黑盒',boxDrag:'拖动探索 · ← → 旋转',boxAria:'立体心意黑盒，可拖动或使用左右方向键旋转。',boxOpening:'正在打开…',boxOpened:'已打开',boxUnavailable:'当前浏览器无法显示 3D，仍可打开黑盒。',qlooIntro:'Qloo 连接你们的喜好，EVE 把共鸣变成共同安排。'});
  state.autoPartner=true;state.busyKind=null;state.retryKind=null;
  Object.assign(copy.en,{roleNote:'Switch perspectives to review either side.',demoReplies:'Anya replies automatically (demo)',simulated:'simulated reply',demoAutoNote:'Anya is a fictional character. Her replies are simulated.',demoManualNote:'Manual demo · switch perspectives to write both sides.',companionBusy:'Anya is typing…',companionUnavailable:'Anya couldn’t reply. Try again, or switch perspectives to write her response.',demoGreeting:'Hey, I’m Anya. I usually have a camera with me. What’s something you’ve been enjoying lately?',reviewOther:'Review as {name}',city:'City or area',chooseCity:'Choose a city instead',cityPlaceholder:'City, country',useCity:'Use this city',clearLocation:'Choose another city',locationActive:'Current location · on',locationNone:'Choose where to explore',cityActive:'Search area: {city}',needLocation:'Use your location or enter a city to find nearby ideas.',invalidCity:'Enter a city and country, such as Hamilton, New Zealand.',locationNotFound:'That city or area could not be matched. Add a country or try another name.',quickReady:'Two sample tastes are ready. Choose your location and review sharing to begin.',locationReady:'Nearby ideas use your approximate location.',locationDenied:'Location permission was not granted. Enter a city instead.',locationUnavailable:'Your location could not be found. Enter a city instead.',locationTimeout:'Location took too long. Try again or enter a city.'});
  Object.assign(copy.zh,{roleNote:'切换视角，查看双方的体验。',demoReplies:'Anya 自动回复（示例）',simulated:'模拟回应',demoAutoNote:'Anya 是虚构人物，回应由模拟角色生成。',demoManualNote:'手动演示 · 切换视角，输入双方的话。',companionBusy:'Anya 正在输入…',companionUnavailable:'Anya 暂时没能回复。可以重试，或切换视角输入她的回应。',demoGreeting:'嗨，我是 Anya。我出门总爱带着相机。你最近有什么特别喜欢的东西吗？',reviewOther:'切换到{name}确认',city:'城市或区域',chooseCity:'也可以输入城市',cityPlaceholder:'城市、国家',useCity:'使用这个城市',clearLocation:'换个城市',locationActive:'当前位置 · 已开启',locationNone:'选一个想探索的地方',cityActive:'推荐区域：{city}',needLocation:'开启定位或输入城市，就能寻找附近的安排。',invalidCity:'请输入城市和国家，例如 Hamilton, New Zealand。',locationNotFound:'没能识别这个城市或区域，补充国家或换个名称试试。',quickReady:'两种示例口味准备好了。选择地点，再确认共享即可开始。',locationReady:'附近推荐将使用你的大致位置。',locationDenied:'未允许定位，可以直接输入城市。',locationUnavailable:'暂时无法获取位置，可以输入城市。',locationTimeout:'定位超时，可以重试或输入城市。'});
  state.showBox=false;
  let boxDispose=null;
  function renderEntry(){
    const visible=state.view==='private'&&state.speaker==='you'&&state.showBox;
    $('first-meeting').hidden=!visible;
    $('entry-welcome').hidden=state.connection.opened;
    $('show-blackbox').hidden=state.speaker!=='you';
    $('live-blackbox').hidden=state.connection.opened;
    if(state.connection.opened){boxDispose?.();boxDispose=null;}
    else if(visible&&!boxDispose){
      const keys={'box.open':'boxOpen','box.drag':'boxDrag','box.aria':'boxAria','box.opening':'boxOpening','box.opened':'boxOpened','box.unavailable':'boxUnavailable'};
      boxDispose=window.mountEverBox($('live-blackbox'),openConnection,{t:key=>t(keys[key])});
    }
    boxDispose?.refreshLabels?.();
    $('messages').classList.toggle('entry-empty',visible&&!currentMessages().length);
  }
  function openConnection(){
    launchDiscovery();
  }
  function closeSettings(){if($('vibe-dialog').open)$('vibe-dialog').close();}
  const controllers = {you:null,partner:null,assist:null,connection:null,compare:null,example:null};
  const serials = {you:0,partner:0,assist:0,connection:0};
  const t = key => personText(key) ?? (key==='you'&&state.speaker==='partner'?(state.locale==='zh'?'体验者':'Visitor'):copy[state.locale][state.connection.opened&&['partner','partnerVibe','chatHeading'].includes(key)?key+'Demo':key] || key);
  function node(tag, className, text) { const el=document.createElement(tag); if(className)el.className=className; if(text!==undefined)el.textContent=text; return el; }
  function button(text, action, className='') {const el=node('button',className,text);el.type='button';el.addEventListener('click',action);return el;}
  function label(key, htmlFor, cls='field-label') {const el=node('label',cls);el.dataset.i18n=key;el.htmlFor=htmlFor;return el;}
  const otherPerson=()=>state.speaker==='you'?'partner':'you';
  const otherName=()=>state.speaker==='partner'?(state.locale==='zh'?'体验者':'the visitor'):t('partner');
  const threadKey=()=>state.view+':'+state.speaker;
  const currentMessages=()=>state.view==='private'?state.privateMessages[state.speaker]:state.view==='direct'?state.directMessages:state.messages;
  const canWrite=()=>state.view==='memories'?false:state.view==='plans'?state.started&&state.consent:state.view==='direct'?state.connection.opened:state.sharing[state.speaker].eve&&(state.speaker==='you'||state.connection.opened);
  function addCheckin(key,text){
    for(const owner of ['you','partner']){const id=key+':'+owner;if(!state.sharing[owner].eve||state.checkins.has(id))continue;state.checkins.add(id);state.privateMessages[owner].push({from:'eve',text:typeof text==='function'?text(owner):text,sourceLang:state.locale,checkin:true});if(state.view!=='private'||state.speaker!==owner)state.unread[owner]++;}
    $('chat-tab').textContent=t('chatTab')+(state.unread[state.speaker]?' · '+state.unread[state.speaker]:'');
  }
  function openSharing(){ $('vibe-setup').open=true;if(!$('vibe-dialog').open)$('vibe-dialog').showModal();if(!state.vibes.you.entities.length)$('you-query').focus();else $('share-'+state.speaker).focus(); }
  function changeSpace(view=state.view,speaker=state.speaker){
    state.drafts[threadKey()]=$('message').value;stopAssist();state.view=view;state.speaker=speaker;state.error=null;state.status=null;
    if(view==='private')state.unread[speaker]=0;
    state.retryKind=view==='direct'?'companion':view==='private'?'private':state.autoPartner&&currentMessages().at(-1)?.from==='you'?'companion':'plans';
    state.retry=view==='direct'?state.autoPartner&&speaker==='you'&&currentMessages().at(-1)?.from==='you':currentMessages().at(-1)?.from===speaker;
    $('speaker').value=speaker;$('message').value=state.drafts[threadKey()]||'';
    state.showBox=view==='private'&&speaker==='you'&&state.connection.opened&&state.showBox;
    renderControls();renderMessages();renderPlan();renderBridge();
  }
  function renderSpace(){
    const plans=state.view==='plans',direct=state.view==='direct',memories=state.view==='memories',other=otherName();
    renderEntry();
    for(const id of ['profile-photo-action','profile-discover-action'])if($(id))$(id).hidden=state.view!=='private'||state.speaker!=='you';
    $('demo-reply-note').hidden=!state.connection.opened||(!plans&&!direct);$('demo-reply-note').textContent=t(state.autoPartner?'demoAutoNote':'demoManualNote');
    $('plans-tab').hidden=!state.connection.opened;$('memories-tab').hidden=!state.connection.opened;
    $('perspective-bar').hidden=!state.connection.opened;
    document.querySelectorAll('.perspective-bar [data-person]').forEach(el=>{el.textContent=t(el.dataset.person);el.setAttribute('aria-pressed',String(el.dataset.person===state.speaker));});
    $('chat-heading').textContent=state.speaker==='you'?t('yourView'):t('partnerView').replace('{name}',t('partner'));
    const avatar=$('view-avatar');avatar.replaceChildren();
    if(state.speaker==='partner'&&state.connection.opened){const photo=node('img');photo.src=selectedPerson?.photo||'/assets/people/anya-v2.png';photo.alt='';avatar.append(photo);}else avatar.textContent=state.locale==='zh'?'我':'Y';
    $('shared-participants').textContent=state.connection.opened?t('withPartner').replace('{name}',other):t('privateScope');
    $('chat-tab').classList.toggle('active',!plans&&!memories);$('chat-tab').setAttribute('aria-selected',String(!plans&&!memories));
    $('chat-tab').textContent=t('chatTab')+(state.unread[state.speaker]?' · '+state.unread[state.speaker]:'');
    $('plans-tab').classList.toggle('active',plans);$('plans-tab').setAttribute('aria-selected',String(plans));
    $('memories-tab').classList.toggle('active',memories);$('memories-tab').setAttribute('aria-selected',String(memories));
    $('conversation-content').hidden=memories;$('try-memories').hidden=!memories;$('try-agreements').hidden=!plans;
    memoriesUI.render();agreementsUI.render();
    $('conversation-content').setAttribute('aria-labelledby',plans?'plans-tab':'chat-tab');
    $('chat-switch').hidden=plans||!state.connection.opened;$('private-tab').setAttribute('aria-selected',String(!direct));$('direct-tab').setAttribute('aria-selected',String(direct));
    $('direct-tab').textContent=t('directTab').replace('{name}',other);$('direct-tab').hidden=!state.connection.opened;
    $('scope-note').textContent=plans?[t('you'),t('partner'),'EVE'].join(' · '):t(direct?'directScope':'privateScope');
    $('message').placeholder=t(plans?'messagePlaceholder':direct?'directPlaceholder':'privatePlaceholder').replace('{name}',other);
    $('recommendations').hidden=!plans;
    document.querySelector('.speaker-row').hidden=true;
  }
  function errorKey(code) {
    if(code==='LOCATION_NOT_FOUND')return 'locationNotFound';
    if(code==='TRY_INTEREST_EXPIRED')return 'interestExpired';
    if(code==='TRY_PLAN_EXPIRED')return 'planExpired';
    if(code==='TRY_PLAN_INVALID')return 'planInvalid';
    if(/RATE_LIMIT|BUSY/.test(code||''))return 'rate';
    if(/CONSENT/.test(code||''))return 'consentError';
    if(/NOT_CONFIGURED|MISSING_KEY/.test(code||''))return 'config';
    if(/^GEMINI_(EMPTY_REPLY|PLAN_INVALID)$/.test(code||''))return 'unavailable';
    if(/NO_RECOMMENDATIONS|NO_FIT|EMPTY|NOT_FOUND/.test(code||''))return 'noFit';
    if(/INVALID|BAD_REQUEST|TOO_LONG/.test(code||''))return 'validation';
    if(/UNAVAILABLE|TIMEOUT/.test(code||''))return 'unavailable';
    return 'error';
  }
  Object.assign(copy.en,{recoverActivity:'Find cultural places',recoverMovie:'Find a film',recoverActivityMessage:'Find a cultural place for us to explore together.',recoverMovieMessage:'Find a film for us to watch together.'});
  Object.assign(copy.zh,{recoverActivity:'找一个文化场所',recoverMovie:'找一部电影',recoverActivityMessage:'帮我们找一个可以一起探索的文化场所。',recoverMovieMessage:'帮我们找一部适合一起看的电影。'});
  async function post(path, body, signal) {
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
    let data;try{data=await response.json();}catch{throw new Error('INTERNAL_ERROR');}
    if(!response.ok)throw new Error(data.error?.code || 'INTERNAL_ERROR');
    return data;
  }
  function abortSearch(owner) {serials[owner]++;controllers[owner]?.abort();controllers[owner]=null;state.search[owner].busy=false;}
  function stopAssist() {serials.assist++;controllers.assist?.abort();controllers.assist=null;state.busy=false;state.busyKind=null;}
  function stopConnectionSearch() {serials.connection++;controllers.connection?.abort();controllers.connection=null;state.connection.busy=false;}
  function stopCompare(){controllers.compare?.abort();controllers.compare=null;state.bridgeBusy=false;state.bridge=null;renderBridge();}
  function sharedInput(){return {locale:state.locale,city:state.location?'nearby':state.city,...(state.location?{location:{...state.location}}:{}),consent:state.consent,vibes:Object.fromEntries(['you','partner'].map(owner=>[owner,{entities:state.vibes[owner].entities.map(item=>item.id),note:state.vibes[owner].note}]))};}
  function clearLocation(){state.locationEpoch++;state.location=null;state.locationBusy=false;state.locationStatus=null;}
  function locate(){
    if(state.locationBusy)return;
    if(!navigator.geolocation){state.locationStatus='locationUnavailable';renderControls();return;}
    const epoch=++state.locationEpoch;state.locationBusy=true;state.locationStatus=null;renderControls();
    const failLocation=error=>{if(epoch!==state.locationEpoch)return;state.locationBusy=false;state.locationStatus=error?.code===1||error?.name==='SecurityError'?'locationDenied':error?.code===3?'locationTimeout':'locationUnavailable';renderControls();};
    try{navigator.geolocation.getCurrentPosition(position=>{
      if(epoch!==state.locationEpoch)return;
      const {latitude:lat,longitude:lon}=position.coords;
      state.locationBusy=false;
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){state.locationStatus='locationUnavailable';renderControls();return;}
      state.location={lat:Number(lat.toFixed(3)),lon:Number(lon.toFixed(3))};state.locationStatus='locationReady';$('manual-location').open=false;invalidate();
    },failLocation,{enableHighAccuracy:false,timeout:10000,maximumAge:300000});}catch(error){failLocation(error);}
  }
  const tagZh={'Comedy':'喜剧','Stylized':'鲜明风格','Eccentric':'古灵精怪','Drama':'剧情','Romance':'浪漫','Romantic':'浪漫','Cinematic':'电影感','Cinématic':'电影感','Quirky':'别具一格','Thought-provoking':'引人思考','Atmospheric':'氛围感','Melancholic':'淡淡忧伤'};
  function renderBridge(){
    const card=$('taste-bridge');card.replaceChildren();card.hidden=state.view!=='plans'||!state.started||!state.consent||(!state.bridge&&!state.bridgeBusy);if(card.hidden)return;
    card.append(node('h3','',state.locale==='zh'?'口味之桥':'A bridge between your worlds'));
    if(state.bridgeBusy){card.append(node('p','fine',t('bridgeLoading')));return;}
    const bridge=state.bridge;
    if(bridge?.status==='ready'&&Array.isArray(bridge.shared)){
      const inputs=node('div','bridge-inputs');for(const owner of ['you','partner'])inputs.append(node('span','',t(owner)+' · '+state.vibes[owner].entities.map(e=>e.title).join(' + ')));card.append(inputs);
      const seen=new Set(),themes=bridge.shared.filter(tag=>{const name=String(tag.name||'').trim().toLocaleLowerCase();if(!name||seen.has(name))return false;seen.add(name);return true;});
      const chips=node('div','bridge-tags');themes.slice(0,3).forEach(tag=>chips.append(node('span','',state.locale==='zh'?(tagZh[tag.name]||tag.name):tag.name)));card.append(chips,node('p','fine',t('bridgeSource')));
      if(bridge.cached)card.append(node('p','fine',t('bridgeCache')));
    }else{card.append(node('p','fine',state.locale==='zh'?'不必先喜欢同样的东西，才能一起发现新的喜欢。':'You don’t have to love the same things to discover something together.'));}
    const discovery=bridge?.discovery;
    if(['ready','exploratory'].includes(discovery?.status)&&discovery.items?.length){
      const flow=node('div','bridge-inputs');for(const owner of ['you','partner'])flow.append(node('span','',t(owner)+' · '+state.vibes[owner].entities.map(e=>e.title).join(' + ')));if(bridge.status!=='ready')card.append(flow);
      card.append(node('p','',discovery.status==='exploratory'?(state.locale==='zh'?'从一个新发现开始，一起看看喜不喜欢。':'A new starting point — discover whether you enjoy it together.'):(state.locale==='zh'?'你们都没有选过它，Qloo 找到了连接两份 Vibe 的新发现。':'Neither of you picked this — a new discovery connecting both your Vibes.')));
      discovery.items.slice(0,1).forEach(item=>{
        const pick=node('article','bridge-discovery');pick.append(node('h4','',item.title+(item.year?' · '+item.year:'')),node('p','fine',state.locale==='zh'?'双方的原始选择 → 一起探索的新电影':'Your two starting points → a new film to explore together'));
        const choose=button(state.locale==='zh'?'一起考虑这部电影':'Consider this together',()=>{
          if(state.busy||!state.started||!state.consent)return;
          state.plan={items:[{...item}],seeds:Object.entries(state.vibes).flatMap(([owner,vibe])=>vibe.entities.map(e=>({...e,owner}))),source:'qloo',expired:false};state.selected=item.id;state.confirmations={you:false,partner:false};renderPlan();
          $('recommendations').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        },'primary');choose.disabled=state.busy;pick.append(choose);const links=node('div','bridge-inputs');for(const owner of ['you','partner']){const evidenceIds=new Set((item.evidence?.[owner]||[]).map(e=>e.id));links.append(node('span','',t(owner)+' → '+state.vibes[owner].entities.filter(e=>evidenceIds.has(e.id)).map(e=>e.title).join(' + ')));}pick.append(links);card.append(pick);
      });
      if(discovery.status==='exploratory'){card.append(node('p','fine',state.locale==='zh'?'Qloo 使用了双方兴趣返回这个探索选项，但没有提供足够的双侧贡献证据；它不是已验证的共同口味。':'Qloo returned this exploration idea using both inputs, but did not provide enough evidence of contributions from both sides. It is not a verified shared taste.'));return;}
      const proof=node('details','plan-details');proof.append(node('summary','',state.locale==='zh'?'为什么是它？':'Why this bridge?'),node('p','fine',state.locale==='zh'?'Qloo 的推荐解释显示双方已选兴趣都对这部电影有贡献。我们优先展示两侧贡献较均衡的新作品；这不是喜欢的概率或感情匹配分数。':'Qloo’s explanation identifies contributions from both Vibes. We prioritize new films with more balanced input contributions. These describe the recommendation, not how much either person will like it or romantic compatibility.'));card.append(proof);
    }else if(discovery){
      card.append(node('p','fine',state.locale==='zh'?(discovery.status==='empty'?'这次还没找到经双方推荐验证的新电影。可以换一个兴趣，或继续一起安排。':'新的发现暂时连接不上，可以重试或继续一起安排。'):(discovery.status==='empty'?'Qloo did not return a new film with evidence from both Vibes this time. Try another interest, or keep planning together.':'New discoveries are temporarily unavailable. Retry, or keep planning together.')),button(t('retry'),()=>compareVibes(),'text-button'));
    }
  }
  async function compareVibes(){
    if(!state.started||!state.consent)return;controllers.compare?.abort();const controller=new AbortController(),revision=state.revision;controllers.compare=controller;state.bridgeBusy=true;renderBridge();
    try{const result=await post('/api/try/compare',{...sharedInput(),discover:true},controller.signal);if(!controller.signal.aborted&&revision===state.revision&&state.consent)state.bridge=result;}
    catch(error){if(!controller.signal.aborted&&revision===state.revision)state.bridge={status:'unavailable',shared:[]};}
    finally{if(controllers.compare===controller){controllers.compare=null;state.bridgeBusy=false;renderBridge();}}
  }
  async function quickExample(){
    if(state.exampleBusy||state.everStarted||state.vibes.you.entities.length||state.vibes.partner.entities.length)return;
    const controller=new AbortController(),revision=state.revision;controllers.example=controller;state.exampleBusy=true;state.setup=null;renderControls();
    try{
      const choices=await Promise.all([['Knives Out',2019],['Amélie',2001]].map(async([query,year])=>{const result=await post('/api/try/search',{query,type:'movie',locale:state.locale},controller.signal);const film=result.items?.find(i=>i.title.toLowerCase()===query.toLowerCase()&&Number(i.year)===year);if(!film)throw Error('NOT_FOUND');return film;}));
      if(controller.signal.aborted||revision!==state.revision)return;
      state.vibes.you.entities=[choices[0]];state.vibes.partner.entities=[choices[1]];state.connection.opened=true;invalidate();state.setup='quickReady';
      for(const owner of ['you','partner'])renderChips(owner);translate();$('share-you').focus();
    }catch(error){if(!controller.signal.aborted)state.setup='unavailable';}
    finally{if(controllers.example===controller){controllers.example=null;state.exampleBusy=false;renderControls();}}
  }
  function renderConnection() {
    const connection=state.connection;
    $('demo-connection').classList.toggle('opened',connection.opened);
    $('open-demo').hidden=true;$('open-demo').disabled=false;
    $('demo-start-hint').hidden=connection.opened;
    $('demo-profile').hidden=!connection.opened;
    const profileReady=state.vibes.you.entities.length&&state.vibes.partner.entities.length;
    const status=connection.busy?'demoSearching':!state.vibes.you.entities.length?'demoTasteHint':profileReady?(state.started?'demoSessionReady':'demoReady'):connection.status==='demoReady'?'demoEdit':connection.status;
    $('demo-status').textContent=status?t(status):'';
    $('demo-interest').textContent=state.vibes.partner.entities.map(item=>item.title+(item.year?' ('+item.year+')':'')).join(' · ');
    $('retry-demo').hidden=!connection.opened||connection.busy||profileReady||!(connection.error||connection.status==='demoMissing');
    $('retry-demo').disabled=false;
    document.querySelector('.demo-photo img').alt=t('demoPhotoAlt');
  }
  async function loadDemoInterest() {
    if(state.connection.busy)return;
    if(state.vibes.partner.entities.length){state.connection.status='demoReady';state.connection.error=false;renderConnection();return;}
    stopConnectionSearch();const token=serials.connection,controller=new AbortController();controllers.connection=controller;
    state.connection.busy=true;state.connection.error=false;state.connection.status=null;renderConnection();
    try {
      const data=await post('/api/try/search',{query:selectedPerson?.seeds[0].title||'Lost in Translation',type:'movie',locale:state.locale},controller.signal);
      if(token!==serials.connection)return;
      const items=Array.isArray(data.items)?data.items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string').slice(0,6):[];
      const film=items.find(item=>item.type==='movie'&&item.title.normalize('NFKD').toLowerCase()===(selectedPerson?.seeds[0].title||'Lost in Translation').normalize('NFKD').toLowerCase());
      if(!state.vibes.partner.entities.length){
        if(film){state.vibes.partner.entities.push({...film});if(!state.vibes.partner.note){state.vibes.partner.note=t('demoNote');$('partner-note').value=state.vibes.partner.note;}invalidate();renderChips('partner');state.connection.status='demoReady';}
        else {Object.assign(state.search.partner,{query:'Lost in Translation',type:'movie',items,searched:true,error:null});$('partner-query').value='Lost in Translation';$('partner-type').value='movie';state.connection.status=items.length?'demoChoose':'demoMissing';if(items.length)$('manual-vibes').open=true;}
      }else state.connection.status='demoReady';
      renderSearch('partner');
    }catch(error){if(token===serials.connection&&error.name!=='AbortError'){state.connection.error=true;state.connection.status='demoFailed';}}
    finally{if(token===serials.connection){state.connection.busy=false;controllers.connection=null;renderConnection();}}
  }
  function invalidate(reason='changed') {
    stopCompare();
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
    document.body.classList.toggle('session-started',state.everStarted);
    $('sharing-summary').textContent=t(state.consent?'sharingOn':'sharingOff');
    document.querySelector('[data-owner=you] h2').textContent=t(state.speaker==='partner'?'visitorVibe':'yourVibe');
    document.querySelectorAll('.sharing-people legend').forEach((el,i)=>el.textContent=t(i?'partner':'you'));
    renderSpace();
    $('use-location').disabled=state.locationBusy;$('use-location').textContent=t(state.locationBusy?'locating':'useLocation');
    $('clear-location').hidden=!state.location&&!state.city;
    $('location-status').textContent=state.locationBusy?t('locating'):state.locationStatus?t(state.locationStatus):'';
    $('location-current').textContent=state.location?t('locationActive'):state.city?t('cityActive').replace('{city}',t(state.city)):t('locationNone');
    $('location-current').classList.toggle('location-on',!!state.location);
    $('city').placeholder=t('cityPlaceholder');$('demo-replies').checked=state.autoPartner;
    $('city').setAttribute('aria-describedby','location-status');
    $('quick-example').hidden=state.everStarted||!!state.vibes.you.entities.length||!!state.vibes.partner.entities.length;
    $('quick-example').disabled=state.exampleBusy;$('quick-example').textContent=t(state.exampleBusy?'quickLoading':'quickExample');
    $('start').disabled=state.started;
    $('start').textContent=t(state.started?'active':'start');
    $('setup-status').textContent=state.setup?t(state.setup):'';
    $('setup-status').classList.toggle('needs-action',['needYou','needPartner','needConsent','needLocation','invalidCity'].includes(state.setup));
    $('consent').setAttribute('aria-invalid',String(state.setup==='needConsent'));
    for(const owner of ['you','partner']){$('share-'+owner).checked=state.sharing[owner].vibe;$('eve-'+owner).checked=state.sharing[owner].eve;}
    $('send').disabled=!canWrite()||state.busy;
    $('message').disabled=!canWrite();
    $('cancel').hidden=!state.busy;
    $('retry').hidden=!state.retry||state.busy||!canWrite()||(state.view==='direct'&&!state.autoPartner);
    $('plan-recovery').hidden=state.view!=='plans'||state.busy||!canWrite()||!['noFit','unavailable'].includes(state.error)||!!state.plan?.items?.length;
    $('chat-status').textContent=state.view==='private'&&!state.sharing[state.speaker].eve?t('eveOff'):state.busy?t(state.busyKind==='companion'?'companionBusy':state.view==='private'?'privateBusy':'busy'):state.status?t(state.status):'';
    $('chat-error').textContent=state.error?t(state.error):'';
    if(!currentMessages().length)renderMessages();
  }
  function renderMessages() {
    const container=$('messages');container.replaceChildren();
    const messages=currentMessages();
    if(!messages.length){
      container.append(node('p','empty-message',t(state.view==='private'?'privateEmpty':state.view==='direct'?'directEmpty':state.started?'emptyReady':'empty')));
      if(state.view==='private'&&(!state.showBox||state.connection.opened))container.append(button(t(state.connection.opened?'privateIdea':'privateBefore'),()=>{$('message').value=t(state.connection.opened?'privateIdea':'privateBefore');$('message').focus();},'private-prompt'));
      if(state.view==='plans'&&!state.started)container.append(button(t('nextSetting'),openSharing,'private-prompt'));
      return;
    }
    messages.forEach(message=>{
      const article=node('article','message '+(message.from==='eve'?'eve':message.from===state.speaker?'you':'partner'));article.append(node('p','sender',message.from==='eve'?'EVE':t(message.from)+(message.simulated?' · '+t('simulated'):'')),node('p','bubble',message.text));container.append(article);
    });
    if(state.view==='private'&&messages.at(-1)?.from==='eve'&&state.connection.opened)container.append(button(t('writeTogether').replace('{name}',otherName()),()=>{enterDirect();},'text-button private-next'));
    container.scrollTop=container.scrollHeight;
  }
  function renderPlan() {
    const container=$('recommendations');container.replaceChildren();container.hidden=state.view!=='plans';const plan=state.plan;if(!plan)return;
    if(plan.expired)container.append(node('p','expired-note',t('expired')));
    const grid=node('div','recommendation-grid'+(plan.expired?' expired':''));
    (plan.items||[]).slice(0,3).forEach(item=>{
      const selected=state.selected===item.id,card=node('article','recommendation'+(selected?' selected':''));card.dataset.candidate=item.id;
      card.append(node('p','metadata',[item.city||t(state.location?'nearMe':state.city),item.type&&t(item.type),item.year].filter(Boolean).join(' · ')),node('h3','',item.title));
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
      if(shared){result.append(node('p','fine',t('notBooked')),button(t('afterTime'),()=>{changeSpace('memories');memoriesUI.beginFromPlan(item);},'primary'));addCheckin('plan:'+item.id,t('memoryNudge'));}
      else {const confirm=button(t('confirmChoice')+t(state.speaker),()=>{if(!state.selected||state.plan?.expired||!state.started||!state.consent||state.busy)return;state.confirmations[state.speaker]=true;renderPlan();},'primary');confirm.id='confirm-choice';confirm.disabled=state.confirmations[state.speaker]||!state.started||!state.consent||state.busy;result.append(confirm);}
      if(!shared&&state.confirmations[state.speaker])result.append(button(t('reviewOther').replace('{name}',otherName()),()=>changeSpace('plans',otherPerson()),'text-button review-other'));
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
    stopAssist();const token=serials.assist,revision=state.revision,controller=new AbortController();controllers.assist=controller;state.busy=true;state.busyKind='eve';state.retryKind='plans';state.error=null;state.status=null;state.retry=false;renderPlan();renderControls();
    const body={...sharedInput(),messages};
    const selected=state.plan?.items.find(item=>item.id===state.selected);
    if(selected&&!state.plan.expired)body.selection={token:selected.contextToken||'',confirmed:{...state.confirmations}};
    else if(state.plan&&!state.plan.expired)body.offeredPlans=state.plan.items.map(item=>item.contextToken).filter(Boolean).slice(0,3);
    const explicitRequest=state.messages.filter(message=>message.revision===revision&&message.from!=='eve'&&!message.simulated).at(-1)?.requestedCategory;
    if(explicitRequest&&!body.selection&&!body.offeredPlans)body.requestedCategory=explicitRequest;
    try {
      const data=await post('/api/try/assist',body,controller.signal);
      if(token!==serials.assist||revision!==state.revision||!state.consent)return;
      if(typeof data.text!=='string'||!data.text.trim())throw new Error('INTERNAL_ERROR');
      state.messages.push({from:'eve',text:data.text,revision,sourceLang:data.sourceLang||body.locale});
      const items=Array.isArray(data.items)?data.items.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string').slice(0,3):[];
      if(data.bridge){state.bridge={...data.bridge,discovery:state.bridge?.discovery};renderBridge();}
      if(items.length&&(!state.selected||data.replaceSelection===true)){state.plan={items,seeds:data.seeds||[],source:data.source,expired:false};state.selected=null;state.confirmations={you:false,partner:false};}
      renderMessages();renderPlan();
    }catch(error){if(token===serials.assist&&error.name!=='AbortError'){
      state.error=errorKey(error.message);state.retry=!['interestExpired','planExpired','planInvalid'].includes(state.error);
      if(state.error==='interestExpired'){if(state.plan)state.plan.expired=true;state.selected=null;state.confirmations={you:false,partner:false};}
    }}
    finally{if(token===serials.assist){state.busy=false;controllers.assist=null;renderControls();renderPlan();}}
  }
  async function companionReply(thenPlan=false){
    const view=state.view;
    if(!state.autoPartner||state.speaker!=='you'||!['direct','plans'].includes(view)||!state.connection.opened||state.busy)return;
    const thread=view==='direct'?state.directMessages:state.messages;
    if(!thread.length||thread.at(-1).from!=='you')return;
    stopAssist();const token=serials.assist,revision=state.revision,controller=new AbortController();controllers.assist=controller;state.busy=true;state.busyKind='companion';state.retryKind='companion';state.retry=false;state.error=null;state.status=null;renderControls();
    let replied=false;
    const messages=thread.filter(m=>view==='direct'||m.revision===revision).slice(-20).map(({from,text})=>({from,text}));
    try{
      const data=await post('/api/try/companion',{locale:state.locale,scope:view,messages,...(selectedPerson?{characterId:selectedPerson.id}:{}),profile:{interests:state.vibes.partner.entities.map(e=>e.title),note:state.vibes.partner.note}},controller.signal);
      if(token!==serials.assist||revision!==state.revision||!state.autoPartner||state.view!==view)return;
      if(data.simulated!==true||typeof data.text!=='string'||!data.text.trim())throw Error('INTERNAL_ERROR');
      thread.push({from:'partner',text:data.text,revision,sourceLang:data.sourceLang,simulated:true});replied=true;renderMessages();
    }catch(error){if(token===serials.assist&&error.name!=='AbortError'){state.error='companionUnavailable';state.retry=true;}}
    finally{if(token===serials.assist){state.busy=false;state.busyKind=null;controllers.assist=null;renderControls();}}
    if(replied&&thenPlan&&token===serials.assist&&state.view==='plans'&&state.consent)assist();
  }
  function enterDirect(){
    if(state.autoPartner&&!state.directMessages.length)state.directMessages.push({from:'partner',text:t('demoGreeting'),simulated:true,sourceLang:state.locale});
    changeSpace('direct');$('message').focus();
  }
  function applyCity(){
    const city=$('city').value.trim();
    if(!city||city.length>100||/[\p{Cc}\u2028\u2029<>\\/]/u.test(city)||/(?:[a-z][a-z\d+.-]*:|www\.)/iu.test(city)){state.setup='invalidCity';renderControls();$('city').focus();return false;}
    clearLocation();state.city=city;state.setup=null;invalidate();$('manual-location').open=false;return true;
  }
  async function privateAssist(){
    if(state.view!=='private'||state.busy||!canWrite())return;
    const actor=state.speaker,messages=state.privateMessages[actor].slice(-20).map(({from,text})=>({from,text}));
    if(!messages.length||messages.at(-1).from!==actor)return;
    stopAssist();const token=serials.assist,controller=new AbortController();controllers.assist=controller;state.busy=true;state.busyKind='eve';state.retryKind='private';state.error=null;state.status=null;state.retry=false;renderControls();
    const partnerShared=state.sharing[otherPerson()].vibe,vibes={};
    for(const owner of [actor,...(partnerShared?[otherPerson()]:[])])vibes[owner]={entities:state.vibes[owner].entities.map(item=>item.id),note:state.vibes[owner].note};
    try{
      const data=await post('/api/try/private',{locale:state.locale,actor,partnerShared,vibes,messages},controller.signal);
      if(token!==serials.assist)return;
      if(typeof data.text!=='string'||!data.text.trim())throw Error('INTERNAL_ERROR');
      state.privateMessages[actor].push({from:'eve',text:data.text,sourceLang:data.sourceLang});renderMessages();
    }catch(error){if(token===serials.assist&&error.name!=='AbortError'){state.error=errorKey(error.message);state.retry=true;}}
    finally{if(token===serials.assist){state.busy=false;controllers.assist=null;renderControls();}}
  }
  function translate() {
    document.documentElement.lang=state.locale==='zh'?'zh-CN':'en';
    $('language').value=state.locale;
    document.title='EverVibe · '+(state.locale==='zh'?'体验我的 Vibe':'Try your Vibe');
    document.querySelectorAll('[data-i18n]').forEach(el=>{if(el.id==='page-title'){el.replaceChildren();t('title').split('\n').forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line));});}else el.textContent=t(el.dataset.i18n);});
    for(const owner of ['you','partner']){$(owner+'-query').placeholder=t('searchPlaceholder');$(owner+'-note').placeholder=t('notePlaceholder');$(owner+'-type').setAttribute('aria-label',t(owner==='you'?'yourVibe':'partnerVibe')+' · '+t('likes'));renderSearch(owner);renderChips(owner);}
    Array.from($('speaker').options).forEach(option=>option.textContent=t(option.value));
    $('message').placeholder=t('messagePlaceholder');$('vibe-setup').setAttribute('aria-label',state.locale==='zh'?'Vibe 设置':'Vibe setup');
    renderMessages();renderPlan();renderControls();renderBridge();refreshDiscovery();
  }
  $('your-vibe').append(makeVibeCard('you'));$('partner-vibe').append(makeVibeCard('partner'));
  $('quick-example').addEventListener('click',quickExample);
  $('open-demo').addEventListener('click',openConnection);
  $('say-hello').addEventListener('click',enterDirect);
  $('profile-vibe').addEventListener('click',openSharing);
  $('close-settings').addEventListener('click',closeSettings);
  $('show-blackbox').addEventListener('click',launchDiscovery);
  $('retry-demo').addEventListener('click',()=>loadDemoInterest());
  $('language').addEventListener('change',event=>{state.locale=event.target.value;try{localStorage.setItem(LANGUAGE_KEY,state.locale);}catch{}const url=new URL(location.href);if(url.searchParams.has('lang')){url.searchParams.set('lang',state.locale);history.replaceState(null,'',url);}translate();});
  $('apply-city').addEventListener('click',applyCity);
  $('city').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyCity();}});
  $('demo-replies').addEventListener('change',event=>{stopAssist();state.autoPartner=event.target.checked;state.retry=false;state.error=null;renderControls();});
  $('use-location').addEventListener('click',locate);
  $('clear-location').addEventListener('click',()=>{$('manual-location').open=true;$('city').focus();});
  $('edit-vibes').addEventListener('click',openSharing);
  for(const owner of ['you','partner'])for(const [prefix,key] of [['share','vibe'],['eve','eve']])$(prefix+'-'+owner).addEventListener('change',event=>{state.sharing[owner][key]=event.target.checked;state.consent=['you','partner'].every(person=>state.sharing[person].vibe&&state.sharing[person].eve);$('consent').checked=state.consent;if(!state.consent)invalidate('withdrawn');else{state.setup=null;renderControls();}renderMessages();});
  $('speaker').addEventListener('change',event=>changeSpace(state.view,event.target.value));
  document.querySelectorAll('.perspective-bar [data-person]').forEach(el=>el.addEventListener('click',()=>changeSpace(state.view,el.dataset.person)));
  $('chat-tab').addEventListener('click',()=>changeSpace('private'));
  $('plans-tab').addEventListener('click',()=>changeSpace('plans'));
  $('memories-tab').addEventListener('click',()=>changeSpace('memories'));
  $('private-tab').addEventListener('click',()=>changeSpace('private'));
  $('direct-tab').addEventListener('click',enterDirect);
  $('start').addEventListener('click',()=>{
    if(!state.vibes.you.entities.length){state.setup='needYou';renderControls();$('you-query').focus();return;}
    if(!state.vibes.partner.entities.length){state.setup='needPartner';$('manual-vibes').open=true;renderControls();$('partner-query').focus();return;}
    if($('manual-location').open&&$('city').value.trim()&&(!state.location||$('city').value.trim()!==state.city)){if(!applyCity())return;}
    if(!state.location&&!state.city){state.setup='needLocation';renderControls();$('manual-location').open=true;$('city').focus();return;}
    if(!state.consent){state.setup='needConsent';renderControls();$('share-'+state.speaker).focus();return;}
    state.connection.opened=true;state.started=true;state.everStarted=true;state.setup='ready';state.status=null;$('vibe-setup').open=false;closeSettings();translate();compareVibes();
    if(!state.messages.length&&!state.drafts['plans:'+state.speaker])state.drafts['plans:'+state.speaker]=state.location?t('firstIdeaNearby'):t('firstIdea').replace('{city}',t(state.city));
    addCheckin('welcome',owner=>{const other=owner==='you'?'partner':'you';return t('sharedWelcome').replace('{name}',t(other)).replace('{taste}',state.vibes[other].entities.map(item=>item.title).join(', '));});
    changeSpace('plans');
    if(!$('message').value){$('message').value=state.location?t('firstIdeaNearby'):t('firstIdea').replace('{city}',t(state.city));state.drafts[threadKey()]=$('message').value;}
    $('message').focus({preventScroll:true});document.querySelector('.conversation').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  $('chat-form').addEventListener('submit',event=>{
    event.preventDefault();const text=$('message').value.trim();if(!text||state.busy||!canWrite())return;
    if(text.length>1500){state.error='validation';state.retry=false;renderControls();return;}
    state.showBox=false;renderEntry();currentMessages().push({from:state.speaker,text,revision:state.revision});$('message').value='';state.drafts[threadKey()]='';state.error=null;state.status=null;state.retry=false;renderMessages();
    if(state.view==='private')privateAssist();else if(state.autoPartner&&state.speaker==='you')companionReply(state.view==='plans');else if(state.view==='plans')assist();else renderControls();
  });
  $('message').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chat-form').requestSubmit();}});
  $('cancel').addEventListener('click',()=>{stopAssist();state.status='cancelled';state.retry=true;renderControls();renderPlan();});
  $('retry').addEventListener('click',()=>state.retryKind==='companion'?companionReply(state.view==='plans'):state.view==='private'?privateAssist():assist());
  for(const category of ['activity','movie'])$('recover-'+category).addEventListener('click',()=>{
    if(state.view!=='plans'||state.busy||!canWrite()||state.plan?.items?.length)return;
    state.messages.push({from:state.speaker,text:t(category==='movie'?'recoverMovieMessage':'recoverActivityMessage'),revision:state.revision,requestedCategory:category});
    renderMessages();assist();
  });
  $('reset').addEventListener('click',()=>{
    discoveryController?.abort();selectedPerson=null;relationshipSessions.clear();discoveryResults=[];discoveryIndex=-1;if(personal.photo)URL.revokeObjectURL(personal.photo);Object.assign(personal,{age:null,gender:'',genders:[],minAge:null,maxAge:null,localOnly:false,discoverable:false,ideal:'',intro:'',photo:null});
    controllers.example?.abort();controllers.example=null;state.exampleBusy=false;stopCompare();
    stopAssist();stopConnectionSearch();state.connection={opened:false,busy:false,status:null,error:false};$('manual-vibes').open=false;for(const owner of ['you','partner']){abortSearch(owner);state.vibes[owner]={entities:[],note:''};state.search[owner]={query:'',type:'movie',items:[],busy:false,error:null,searched:false};$(owner+'-query').value='';$(owner+'-type').value='movie';$(owner+'-note').value='';}
    clearLocation();closeSettings();boxDispose?.();boxDispose=null;state.showBox=true;$('vibe-setup').open=false;state.city='';state.autoPartner=true;state.busyKind=null;state.retryKind=null;$('manual-location').open=false;state.consent=false;state.started=false;state.everStarted=false;state.revision++;state.speaker='you';state.messages=[];state.plan=null;state.selected=null;state.confirmations={you:false,partner:false};state.error=null;state.status=null;state.setup=null;state.retry=false;
    state.view='private';state.privateMessages={you:[],partner:[]};state.directMessages=[];state.drafts={};
    state.sharing={you:{vibe:false,eve:true},partner:{vibe:false,eve:true}};state.checkins.clear();state.unread={you:0,partner:0};memoriesUI.reset();agreementsUI.reset();
    $('city').value='';$('consent').checked=false;$('speaker').value='you';$('message').value='';translate();$('message').focus();
  });
  const context=()=>({locale:state.locale,actor:state.speaker,connected:state.connection.opened,eveEnabled:state.consent,names:{you:t('you'),partner:t('partner')},messages:state.consent?state.messages:[],plan:state.confirmations.you&&state.confirmations.partner?state.plan?.items.find(item=>item.id===state.selected)||null:null});
  const memoriesUI=window.EverTryMemories.create({host:$('try-memories'),getContext:context,onReviewAs:actor=>changeSpace('memories',actor)});
  const agreementsUI=window.EverTryAgreements.create({host:$('try-agreements'),getContext:context});
  // Private discovery is session-local. No feed or real-user registration.
  const pool=window.EverDiscoveryPool, rules=window.EverDiscoveryRules;
  let discoveryController=null, discoveryResults=[], discoveryIndex=-1;
  const relationshipSessions=new Map();
  const personal={age:null,gender:'',genders:[],minAge:null,maxAge:null,localOnly:false,discoverable:false,ideal:'',photo:null};
  const D=(en,zh)=>state.locale==='zh'?zh:en;
  function personText(key){
    if(!selectedPerson)return null;
    const p=selectedPerson;
    const labels={partner:p.name+' '+D('(demo)','（示例）'),partnerDemo:p.name+' '+D('(demo)','（示例）'),partnerVibe:p.name+D('’s Vibe',' 的 Vibe'),partnerVibeDemo:p.name+D('’s Vibe',' 的 Vibe'),demoBio:p.interests.join(' · '),demoNote:p.interests.join(', ').slice(0,160),demoGreeting:D('Hey, I’m '+p.name+'. '+p.voice.en,p.voice.zh),demoPhoto:D('A photo '+p.name+' chose to share',p.name+' 选择分享的照片'),demoReplies:D(p.name+' replies automatically (demo)',p.name+' 自动回复（示例）'),demoAutoNote:D(p.name+' is fictional. These are simulated replies.',p.name+' 是虚构人物，回复为模拟。'),companionBusy:D(p.name+' is typing…',p.name+' 正在输入…'),demoSearching:D('Finding '+p.name+'’s cultural interests…','正在查找 '+p.name+' 的文化兴趣…')};
    return labels[key]??null;
  }
  const mineDialog=node('dialog','my-vibe-dialog');mineDialog.id='my-vibe-dialog';document.body.append(mineDialog);
  const myVibeButton=button('My Vibe',()=>{renderMyVibe();mineDialog.showModal();},'text-button');$('show-blackbox').before(myVibeButton);
  const photoInput=node('input');photoInput.type='file';photoInput.accept='image/jpeg,image/png,image/webp';photoInput.hidden=true;document.body.append(photoInput);
  const photoButton=button('Add a photo',()=>photoInput.click(),'text-button');photoButton.id='profile-photo-action';$('chat-form').append(photoButton);
  const discoverButton=button('Open my black box',()=>launchDiscovery(),'text-button');discoverButton.id='profile-discover-action';$('chat-form').append(discoverButton);
  const boxDialog=node('dialog','discovery-box-dialog');boxDialog.setAttribute('aria-label','Your black box');document.body.append(boxDialog);
  const boxClose=button('Back to EVE',()=>{discoveryController?.abort();boxDialog.close();},'box-close');boxDialog.append(boxClose);
  const boxStage=node('div','discovery-box-stage');boxDialog.append(boxStage);let immersiveBox=null;
  boxDialog.addEventListener('close',()=>{discoveryController?.abort();immersiveBox?.();immersiveBox=null;});
  const findStatus=node('p','discovery-status');findStatus.setAttribute('role','status');boxDialog.append(findStatus);
  const skipPerson=button('Another connection',()=>chooseNext(),'text-button');$('say-hello').after(skipPerson);
  const reason=node('p','discovery-reason');$('demo-interest').after(reason);
  photoInput.addEventListener('change',()=>{
    const file=photoInput.files?.[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){photoButton.textContent=D('Choose a JPG, PNG or WebP under 8 MB','请选择 8 MB 以下的 JPG、PNG 或 WebP');return;}
    const url=URL.createObjectURL(file),probe=new Image();probe.onload=()=>{if(personal.photo)URL.revokeObjectURL(personal.photo);personal.photo=url;renderMyVibe();if(!mineDialog.open)mineDialog.showModal();photoInput.value='';};probe.onerror=()=>{URL.revokeObjectURL(url);photoButton.textContent=D('That photo could not be opened','这张照片无法打开');};probe.src=url;
  });

  async function draftMyVibe(){
    const messages=state.privateMessages.you.filter(m=>m.from==='you').slice(-20).map(({text})=>({from:'you',text}));
    if(!messages.length){mineDialog.close();changeSpace('private','you');$('message').focus();return;}
    const status=node('p','fine',D('EVE is preparing a draft for you to review…','EVE 正在整理，等你确认…'));mineDialog.append(status);
    const controller=new AbortController();const epoch=state.revision;
    try{const draft=await post('/api/try/profile',{locale:state.locale,messages},controller.signal);if(epoch!==state.revision)return;
      const review=node('section','vibe-draft');review.append(node('h3','',D('Your draft — edit before using','你的草稿，使用前可以修改')));
      const intro=node('textarea');intro.value=draft.summary;intro.maxLength=300;intro.setAttribute('aria-label',D('Draft introduction','介绍草稿'));
      const ideal=node('textarea');ideal.value=draft.ideal;ideal.maxLength=300;ideal.setAttribute('aria-label',D('Draft partner wishes','理想型草稿'));review.append(intro,ideal);
      const keep=new Set(draft.interests.map(x=>x.id));for(const item of draft.interests){const label=node('label','discovery-check'),check=node('input');check.type='checkbox';check.checked=true;check.onchange=()=>check.checked?keep.add(item.id):keep.delete(item.id);label.append(check,document.createTextNode(item.title));review.append(label);}
      review.append(button(D('Use this draft','使用这份草稿'),()=>{personal.intro=intro.value;personal.ideal=ideal.value;state.vibes.you.entities=draft.interests.filter(x=>keep.has(x.id));invalidate();renderChips('you');renderMyVibe();},'primary'),button(D('Keep my current Vibe','保留当前 Vibe'),()=>review.remove()));status.replaceWith(review);
    }catch{status.textContent=D('The draft could not be prepared. Your existing Vibe is unchanged; you can edit it yourself.','暂时无法整理草稿，原有 Vibe 没有改变，也可以自己填写。');}
  }

  function renderMyVibe(){
    mineDialog.replaceChildren();const head=node('div','dialog-heading');head.append(node('h2','',D('My Vibe','我的 Vibe')),button(D('Done','完成'),()=>mineDialog.close()));mineDialog.append(head);
    mineDialog.append(node('p','fine',D('Your private introduction. No public profile, likes or comments. This demo keeps it only in this tab.','这是你的私密介绍，没有公开主页、点赞或评论。本次体验仅保存在当前标签页。')));
    if(personal.photo){const img=node('img','private-photo');img.src=personal.photo;img.alt=D('Your chosen photo','你选择的照片');mineDialog.append(img,button(D('Remove photo','删除照片'),()=>{URL.revokeObjectURL(personal.photo);personal.photo=null;renderMyVibe();}));}
    mineDialog.append(button(D('Choose a photo','选择照片'),()=>photoInput.click()),node('p','fine',D('Photos stay on this device in the demo; EVE does not analyse this image. Add a few words if you like.','示例中的照片留在本机，EVE 不分析这张图片；你也可以写几句话。')));
    function field(title,key,type='text'){const wrap=node('label','discovery-field',title),el=node('input');el.type=type;el.value=personal[key]??'';if(type==='number'){el.min=18;el.max=99;el.inputMode='numeric';}el.maxLength=300;el.addEventListener('input',()=>{personal[key]=type==='number'?(el.value?Number(el.value):null):el.value;});wrap.append(el);return wrap;}
    mineDialog.append(field(D('My introduction','我的介绍'),'intro'));
    mineDialog.append(field(D('What I’m hoping for in a partner','我期待怎样的伴侣'),'ideal'));
    mineDialog.append(button(D('Draft my Vibe from our chat','请 EVE 根据聊天整理 Vibe'),draftMyVibe));
    mineDialog.append(button(D('Choose films, artists or books','选择电影、音乐人或书籍'),()=>{mineDialog.close();openSharing();}));
    const details=node('details');details.append(node('summary','',D('Who I would like to meet','我想认识怎样的人')));
    details.append(field(D('My age (18+)','我的年龄（18 岁以上）'),'age','number'));
    const gender=node('label','discovery-field',D('My gender (optional)','我的性别（可不填）')),select=node('select');
    for(const [value,en,zh] of [['','Not specified','未填写'],['woman','Woman','女性'],['man','Man','男性'],['nonbinary','Nonbinary','非二元']]){const option=node('option','',D(en,zh));option.value=value;select.append(option);}select.value=personal.gender;select.onchange=()=>personal.gender=select.value;gender.append(select);details.append(gender);
    const pref=node('fieldset');pref.append(node('legend','',D('I’m open to meeting','我愿意认识')));for(const [value,en,zh] of [['woman','Women','女性'],['man','Men','男性'],['nonbinary','Nonbinary people','非二元人士']]){const l=node('label','discovery-check'),c=node('input');c.type='checkbox';c.checked=personal.genders.includes(value);c.onchange=()=>personal.genders=c.checked?[...personal.genders,value]:personal.genders.filter(x=>x!==value);l.append(c,document.createTextNode(D(en,zh)));pref.append(l);}details.append(pref,field(D('Preferred minimum age (optional)','对方最小年龄（可不填）'),'minAge','number'),field(D('Preferred maximum age (optional)','对方最大年龄（可不填）'),'maxAge','number'));
    const local=node('label','discovery-check'),localCheck=node('input');localCheck.type='checkbox';localCheck.checked=personal.localOnly;localCheck.onchange=()=>personal.localOnly=localCheck.checked;local.append(localCheck,document.createTextNode(D('Only show verified nearby people','仅显示已核实的附近人士')));details.append(local,node('p','fine',D('Demo characters have no verified location. This requirement will leave the demo pool empty.','示例人物没有经过核实的位置，开启此条件后不会推荐示例人物。')));mineDialog.append(details);
    const permission=node('label','discovery-check'),check=node('input');check.type='checkbox';check.checked=personal.discoverable;check.onchange=()=>personal.discoverable=check.checked;permission.append(check,document.createTextNode(D('Use my selected tastes to explore demo connections with Qloo','用我选好的兴趣，通过 Qloo 探索示例相遇')));mineDialog.append(permission);
    const preview=node('details');preview.append(node('summary','',D('What a connection could see','对方可以看到什么')));preview.append(node('p','',personal.intro||D('Your introduction is still yours to write.','你的介绍还等着你来写。')),node('p','',state.vibes.you.entities.map(x=>x.title).join(' · ')));if(personal.photo){const img=node('img','private-photo');img.src=personal.photo;img.alt=D('Preview of your chosen photo','你选择的照片预览');preview.append(img);}preview.append(node('p','fine',D('Only your chosen photo, introduction and selected interests. Private EVE messages are not included. No real recipient exists in this demo.','仅包含你选好的照片、介绍与兴趣，不含 EVE 私聊。本示例没有真实接收者。')));mineDialog.append(preview,button(D('Explore my black box','探索我的黑盒'),()=>{mineDialog.close();launchDiscovery();},'primary'));
  }
  function refreshDiscovery(){
    myVibeButton.textContent=D('My Vibe','我的 Vibe');photoButton.textContent=D('Add a photo','添加照片');discoverButton.textContent=D('Open my black box','打开我的黑盒');boxClose.textContent=D('Back to EVE','返回 EVE');skipPerson.textContent=D('Another connection','看看另一位');
    if(mineDialog.open)renderMyVibe();
    if(selectedPerson){const head=document.querySelector('.demo-profile-head');head.querySelector('h2').textContent=selectedPerson.name+', '+selectedPerson.age;const img=head.querySelector('img');img.src=selectedPerson.photo;img.alt=selectedPerson.name;const pic=document.querySelector('.demo-photo img');pic.src=selectedPerson.photo;pic.alt=D('Fictional portrait of ','虚构人物照片：')+selectedPerson.name;
      const result=discoveryResults.find(r=>r.person.id===selectedPerson.id);const themes=result?.comparison?.shared?.slice(0,3).map(x=>x.name).filter(Boolean)||[];
      reason.textContent=(result?.eligibility.eligible?D('Your stated criteria fit in both directions. ','双方已填写的条件相互符合。'):D('An exploratory introduction — some preferences are still unknown. ','探索性介绍：部分条件尚未填写。'))+(themes.length?D('Qloo found cultural links: ','Qloo 找到的文化联系：')+themes.join(' · '):D('Different worlds to explore; no shared cultural themes have been verified.','可以探索不同的世界，目前尚未核实共同文化主题。'));
    }
  }
  async function launchDiscovery(){
    if(state.busy)return;
    if(personal.age!==null&&(!Number.isInteger(personal.age)||personal.age<18||personal.age>99)||personal.minAge&&personal.maxAge&&personal.minAge>personal.maxAge){renderMyVibe();mineDialog.showModal();return;}
    state.showBox=false;renderEntry();boxStage.replaceChildren();findStatus.textContent=D('A private introduction, one person at a time.','一次，只认识一个人的世界。');boxDialog.showModal();
    immersiveBox=window.mountEverBox(boxStage,findConnections,{t:key=>({'box.open':D('Find a connection','探索相遇'),'box.drag':D('Drag to turn · arrow keys work too','拖动旋转 · 也可使用方向键'),'box.opening':D('Opening…','正在打开…'),'box.opened':D('Opened','已打开'),'box.aria':D('Your 3D black box. Drag or use arrow keys to turn.','立体黑盒，可以拖动或使用方向键旋转'),'box.unavailable':D('You can still open this box without 3D.','无法显示立体画面，仍可打开黑盒。')})[key]});
  }
  async function findConnections(){
    discoveryController?.abort();const controller=new AbortController();discoveryController=controller;discoveryResults=[];discoveryIndex=-1;
    const eligible=pool.map(person=>({person,eligibility:rules.eligibility(personal,person)})).filter(x=>!x.eligibility.rejected.length&&!personal.localOnly);
    if(!eligible.length){findStatus.textContent=D('No demo character meets these conditions. You can review My Vibe; your preferences have not been changed.','没有示例人物符合这些条件。可以返回修改我的 Vibe，你的条件没有被自动更改。');return;}
    const useQloo=personal.discoverable&&state.vibes.you.entities.length>0;
    for(const entry of eligible){
      if(controller.signal.aborted)return;
      findStatus.textContent=useQloo?D('Comparing cultural interests with Qloo… ','正在用 Qloo 比较文化兴趣… ')+(discoveryResults.length+1)+' / '+eligible.length:D('Preparing a fictional introduction…','正在准备示例介绍…');
      entry.entities=structuredClone(entry.person.entities||[]);
      if(useQloo){
        try{
          for(const seed of entry.entities.length?[]:entry.person.seeds){const data=await post('/api/try/search',{query:seed.title,type:seed.type,locale:state.locale},controller.signal);const exact=data.items?.find(x=>x.title.normalize('NFKD').toLowerCase()===seed.title.normalize('NFKD').toLowerCase());if(exact&&!entry.entities.some(x=>x.id===exact.id))entry.entities.push(exact);}
          if(entry.entities.length)entry.comparison=await post('/api/try/compare',{locale:state.locale,city:'Worldwide',consent:true,vibes:{you:{entities:state.vibes.you.entities.map(x=>x.id),note:''},partner:{entities:entry.entities.map(x=>x.id),note:''}}},controller.signal);
        }catch(error){if(controller.signal.aborted)return;entry.unavailable=true;}
      }
      discoveryResults.push(entry);
    }
    if(controller.signal.aborted)return;
    discoveryResults.sort((a,b)=>Number(b.eligibility.eligible)-Number(a.eligibility.eligible)||rules.culturalRank(b.comparison)-rules.culturalRank(a.comparison));
    boxDialog.close();chooseNext();
  }
  function chooseNext(){
    if(!discoveryResults.length){launchDiscovery();return;}
    discoveryIndex++;
    if(discoveryIndex>=discoveryResults.length){discoveryIndex=discoveryResults.length-1;reason.textContent=D('You’ve seen this small demo pool. Return to EVE or update My Vibe.','这一小组示例人物已经看完了，可以返回 EVE 或更新我的 Vibe。');return;}
    switchConnection(discoveryResults[discoveryIndex]);
  }
  const relationshipKeys=['messages','privateMessages','directMessages','drafts','plan','selected','confirmations','sharing','unread','started','everStarted','consent','checkins','bridge'];
  function switchConnection(entry){
    stopAssist();stopCompare();stopConnectionSearch();abortSearch('partner');
    if(selectedPerson){const snapshot=Object.fromEntries(relationshipKeys.map(k=>[k,structuredClone(state[k])]));snapshot.partnerVibe=structuredClone(state.vibes.partner);snapshot.memories=memoriesUI.snapshot();snapshot.agreements=agreementsUI.snapshot();relationshipSessions.set(selectedPerson.id,snapshot);}
    selectedPerson=entry.person;state.revision++;state.speaker='you';state.view='private';state.error=null;state.retry=false;state.status=null;state.setup=null;
    const saved=relationshipSessions.get(selectedPerson.id);
    if(saved){for(const key of relationshipKeys)state[key]=structuredClone(saved[key]);state.vibes.partner=structuredClone(saved.partnerVibe);memoriesUI.restore(saved.memories);agreementsUI.restore(saved.agreements);state.started=false;state.confirmations={you:false,partner:false};if(state.plan)state.plan.expired=true;}
    else {state.messages=[];state.privateMessages={you:[],partner:[]};state.directMessages=[];state.drafts={};state.plan=null;state.selected=null;state.confirmations={you:false,partner:false};state.sharing={you:{vibe:false,eve:true},partner:{vibe:false,eve:true}};state.unread={you:0,partner:0};state.started=false;state.everStarted=false;state.consent=false;state.checkins=new Set();state.bridge=null;state.vibes.partner={entities:entry.entities||[],note:selectedPerson.interests.join(', ').slice(0,160)};memoriesUI.reset();agreementsUI.reset();}
    state.connection={opened:true,busy:false,status:'demoReady',error:false};state.showBox=true;state.search.partner={query:'',type:'movie',items:[],busy:false,error:null,searched:false};$('partner-note').value=state.vibes.partner.note;$('message').value='';translate();
    if(!state.vibes.partner.entities.length)loadDemoInterest();
  }
  const intro=node('div','discovery-intro');intro.setAttribute('role','dialog');intro.setAttribute('aria-label','Welcome to EverVibe');intro.append(node('p','eyebrow','EverVibe'),node('h1','',D('Less scrolling.\nMore discovering each other.','少一点滑动，\n多一点彼此发现。')),button(D('Meet EVE','认识 EVE'),()=>intro.remove(),'primary'));document.body.append(intro);setTimeout(()=>intro.remove(),3200);

  state.privateMessages.you.push({from:'eve',text:D('What have you been enjoying lately — a film, a song, a book, or a small moment? You can also share a photo, or open your black box when you feel ready.','最近有什么让你喜欢的电影、音乐、书，或者小事吗？也可以分享一张照片，或准备好后打开黑盒。'),sourceLang:state.locale});
  translate();
})();
