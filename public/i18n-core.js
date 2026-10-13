'use strict';
const LANGUAGE_PREFERENCE_KEY = 'evervibe:language';
function preferredLanguage(){
  const requested = new URLSearchParams(location.search).get('lang');
  if (['zh','en'].includes(requested)) return requested;
  try {const saved=localStorage.getItem(LANGUAGE_PREFERENCE_KEY);if(['zh','en'].includes(saved))return saved;}catch{}
  return 'en';
}
let locale = preferredLanguage();
const CORE_MESSAGES = {
  'app.title':['EverVibe · 两个人的共同世界','EverVibe · A world for two'],
  'app.home':['EverVibe 首页','EverVibe home'],
  'app.experience':['故事体验','Story experience'],
  'app.reset':['重新体验','Start over'],
  'app.language':['语言','Language'],
  'app.stages':['演示故事阶段','Story stages'],
  'app.stage1':['初次相遇','First meeting'], 'app.seed':['种子','Seed'],
  'app.stage2':['慢慢靠近','Growing closer'], 'app.sprout':['嫩芽','Sprout'],
  'app.stage3':['一起生活','Life together'], 'app.youngTree':['小树','Young tree'],
  'app.stage4':['长久相伴','Lasting love'], 'app.memories':['一树回忆','A tree of memories'],
  'app.episodes':['一起生活的场景','Life together scenes'], 'app.time':['演示时间跳转','Story time jumps'],
  'app.roles':['切换体验身份','Switch perspective'], 'app.role':['体验身份','Perspective'],
  'app.screen':['{name} 的屏幕',"{name}’s screen"], 'app.currentScreen':['当前用户页面','Current person’s screen'],
  'hint.eyebrow':['把心意，轻轻递过去','Let your feelings reach them gently'],
  'hint.close':['关闭预览','Close preview'],
  'hint.title':['这样表达，你舒服吗？','Does this feel right to you?'],
  'hint.recipient':['接收人：{name}','To: {name}'],
  'hint.style':['怎样递出这份心意','How would you like to express it?'],
  'hint.subtle':['含蓄助攻','A gentle nudge'], 'hint.direct':['直接表达','Say it directly'],
  'hint.complete':['对方将看到的完整文字','The exact message they will receive'],
  'hint.badge':['对方会知道：这是经你同意的 EVE 轻提示。','They will see that this EVE nudge was approved by you.'],
  'hint.meaning':['这次会透露的心意','What this shares'], 'hint.keep':['继续留在私聊','What stays private'],
  'hint.optional':['也用于一起安排（可选）','Also use for a shared plan (optional)'],
  'hint.consent':['允许把下面这些需要用于本次共同安排','Share the needs below for this shared plan'],
  'hint.summary':['用于本次安排的摘要','Needs to share for this plan'],
  'hint.cancel':['留在私聊','Keep it private'], 'hint.send':['确认发送这一条','Approve and send this message'],
  'hint.closed':['对方暂时关闭了轻提示。可以保留草稿，或自己和对方聊天。','They have turned off nudges for now. You can keep this draft or talk to them yourself.'],
  'hint.sent':['这条心意已经递出。切换到对方，看看怎样接住它。','Your nudge has been sent. Switch perspectives to see how it lands.'],
  'reset.title':['从头体验一次？','Start the story again?'],
  'reset.body':['会清除当前页面的示例聊天、计划和回忆。','This clears the demo conversations, plans and memories on this page.'],
  'reset.cancel':['继续现在的故事','Keep this story'], 'reset.confirm':['重新开始','Start again'],
  'original.show':['译文 · 查看发送原文','Translated · View sent original'],
  'notice.connected':['两个人都愿意了解，共同空间打开了。','You both want to get to know each other. Your shared space is open.'],
  'notice.pause':['先留在这里，没有向对方发送消息。','Take your time here. No message has been sent.'],
  'notice.withdraw':['已撤回页面提示，无法撤回对方已经读到的内容。','The nudge has been removed. Anything already read cannot be taken back.'],
  'notice.needs':['先写一点这次的需要。','Write a little about what you need this time.'],
  'notice.shared':['已分享这些需要，旧计划确认已清除。','Your needs are shared. The previous plan needs fresh confirmation.'],
  'notice.decline':['这次先不安排，仍然可以好好聊。','No plans for now. You can still spend time talking.'],
  'notice.saved':['这两句话，留在我们的树上了。','Both of your words now have a place on your tree.'],
  'notice.noArchive':['还没有双方愿意整理的新对话。','There are no new shared messages to turn into a draft yet.'],
  'archive.quote':['{name} 曾说：“{text}”','{name} said, “{text}”'],
  'ai.fallback':['这段话先留在你的私聊里。可以用下面的话题继续整理，也可以自己去和对方说。','Your words stay in this private chat. You can explore a topic below, or choose to tell your partner yourself.'],
  'ai.heartInvitation':['你想知道自己有没有被同样放在心上。现在你能看到的是，对方已经亲自回应了下一次见面。这是一条具体线索，但不是心动百分比。你想怎样接住这份期待？','You want to know whether they care about you too. You can see that they have personally responded to seeing you again. That is a real sign, but it is not a percentage of affection. How would you like to respond?'],
  'ai.heartHint':['对方愿意让你收到这条提示，是一个可以回应的信号。喜欢到什么程度，仍需要对方自己表达；我不会把私人倾诉换成一个分数。','Their choice to share this nudge is a signal you can respond to. How they feel is still theirs to express. I will not turn private thoughts into a score.'],
  'ai.heartUnknown':['你很想知道，这份期待会不会得到回应。我不能测量对方的心动，也不会转述对方的私人想法。可以先从一次轻松的邀请，看看彼此真实的回应。','You want to know whether your feelings are returned. I cannot measure their affection or share their private thoughts. A relaxed invitation can give you both room to respond in your own words.'],
  'proposal.words':['十五年了，你还是会让我看到那些差点错过的小东西。不用每次都安排得完美。我就是想，往后那些普通的星期六，也都和你一起过。','Fifteen years, and you still show me things I\'d have walked past. I don\'t need a perfect plan. I just want more ordinary Saturdays with you.'],
  'tree.seed':['一颗种子','A seed'], 'tree.sprout':['初生嫩芽','A new sprout'], 'tree.growing':['并肩成长','Growing side by side'], 'tree.mature':['枝叶相依','Branches intertwined'],
  'tree.aria':['{stage}，可拖动旋转的三维共生树','{stage}, a 3D tree you can drag to rotate'],
  'tree.drag':['拖动旋转，看看我们的树','Drag to explore your tree'],
  'tree.unavailable':['当前浏览器未启用 WebGL，暂时无法显示三维树。','This browser cannot display the 3D tree because WebGL is unavailable.'],
  'tree.zoomIn':['放大','Zoom in'], 'tree.zoomOut':['缩小','Zoom out'], 'tree.reset':['重置视角','Reset view'],
  'box.aria':['立体心意黑盒，可拖动旋转；使用下方按钮打开','3D keepsake box. Drag to rotate, or use the button below to open it.'],
  'box.drag':['拖动旋转，打开一个相遇的可能','Drag to explore a possible new connection'],
  'box.open':['打开黑盒','Open the box'], 'box.opened':['黑盒已打开','Box opened'], 'box.opening':['正在打开…','Opening…'],
  'box.unavailable':['当前浏览器无法显示 3D，可继续打开黑盒','3D is unavailable in this browser. You can still open the box.'],
  'model.loading':['正在载入纪念物…','Loading your keepsake…'], 'model.drag':['拖动旋转 · 滚轮缩放','Drag to rotate · Scroll to zoom'],
  'model.unavailable':['模型尚未就绪，请稍后刷新','The model is not ready. Please refresh later.']
};
// Four independent stories; all visible labels remain bilingual.
Object.assign(CORE_MESSAGES,{
  "app.seed": [
    "东京",
    "Tokyo"
  ],
  "app.sprout": [
    "纽约",
    "New York"
  ],
  "app.youngTree": [
    "伦敦",
    "London"
  ],
  "app.memories": [
    "惠灵顿",
    "Wellington"
  ],
  "hint.title": [
    "这次允许 EVE 怎样帮忙？",
    "How may EVE help this time?"
  ],
  "hint.style": [
    "建议的表达方式",
    "Suggestion style"
  ],
  "hint.subtle": [
    "留一点空间",
    "Leave some room"
  ],
  "hint.direct": [
    "具体一点",
    "More concrete"
  ],
  "hint.complete": [
    "对方在 EVE 私聊里看到的建议",
    "Suggestion shown in their private EVE chat"
  ],
  "hint.badge": [
    "仅用于这次建议，48 小时后到期。不会自动替任何人发消息。",
    "For this suggestion only; expires in 48 hours. Nothing is sent on anyone’s behalf."
  ],
  "hint.send": [
    "允许这次帮助",
    "Allow this help"
  ],
  "hint.sent": [
    "已授权。对方可以在 EVE 私聊里选择是否采用。",
    "Approved. They can choose whether to use it in their private EVE chat."
  ],
  "nudge.authorized": [
    "我允许的帮助",
    "Help I approved"
  ],
  "nudge.idea": [
    "一件可以试试的小事",
    "Something you could try"
  ],
  "nudge.source": [
    "为什么建议这个？",
    "Why this suggestion?"
  ],
  "nudge.basis": [
    "结合共享兴趣，以及 {name} 允许用于本次建议的偏好：",
    "Based on shared interests and the preference {name} approved for this suggestion:"
  ],
  "nudge.expiry": [
    "本次建议，48 小时内有效；查看不代表答应。",
    "Valid for this suggestion for 48 hours. Viewing it does not mean agreeing."
  ],
  "nudge.use": [
    "我想自己开口",
    "I'll say it myself"
  ],
  "nudge.skip": [
    "这次先不用",
    "Not this time"
  ],
  "nudge.withdraw": [
    "撤回授权",
    "Withdraw permission"
  ],
  "nudge.used": [
    "已选择。草稿仍需本人确认发送。",
    "Selected. You still choose whether to send your draft."
  ],
  "nudge.revoked": [
    "授权已撤回。已被看见的内容无法收回。",
    "Permission withdrawn. Anything already seen cannot be taken back."
  ],
  "nudge.expired": [
    "本次授权已到期。",
    "This permission has expired."
  ],
  "nudge.dismissed": [
    "本次建议已结束。",
    "This suggestion has ended."
  ],
  "private.hint": [
    "让 EVE 帮一点忙",
    "Let EVE help a little"
  ],
  "home.auckland": [
    "一位也在东京的人",
    "Someone else in Tokyo"
  ],
  "home.profileJulia": [
    "喜欢画建筑的阴影，也喜欢合成器音乐。",
    "Enjoys drawing architectural shadows and listening to synth music."
  ],
  "home.profileLeo": [
    "喜欢拍混凝土建筑，也喜欢在雨天听音乐。",
    "Enjoys photographing concrete buildings and listening to music on rainy days."
  ],
  "interest.scores": [
    "合成器音乐",
    "Synth music"
  ],
  "interest.scifi": [
    "建筑速写",
    "Architectural sketches"
  ],
  "interest.film": [
    "建筑摄影",
    "Architecture photography"
  ],
  "photo.stage1": [
    "第一次，把共同的好奇变成相处。",
    "The first time shared curiosity became time together."
  ],
  "photo.stage2": [
    "这次，留够时间听你讲完。",
    "This time, there's room to hear the whole story."
  ],
  "photo.stage3": [
    "坐下来，听见彼此。",
    "Sit together. Hear each other."
  ],
  "photo.stage4": [
    "十五年，还想和你一起。",
    "Fifteen years, and still choosing you."
  ],
  "time.older": [
    "纪念日之后",
    "After the anniversary"
  ],
  "commitment.both": [
    "Julian 也愿意继续一起走。",
    "Julian wants to keep walking beside you, too."
  ],
  "settings.fiction": [
    "四对人物与故事均为虚构。对话、文化候选为本地示例；未接入聊天或 Qloo API。",
    "All four couples and stories are fictional. Conversations and cultural suggestions are local examples; no chat or Qloo API is connected."
  ],
  "settings.assets": [
    "人物照片均为 AI 生成。每对的照片、聊天和回忆独立；成熟树使用已有 Tripo 模型。",
    "All character photos are AI-generated. Photos, chats and memories are separate for each couple. The mature tree uses an existing Tripo model."
  ],
  "settings.receive": [
    "允许 EVE 使用 {name} 授权的偏好给我建议",
    "Allow EVE suggestions using preferences approved by {name}"
  ]
});
Object.assign(CORE_MESSAGES,{"relationship.title":["我们的关系 AI","Our relationship AI"],"relationship.about":["双方选择愿意共享的范围后，EVE 会在你们聊起约会、磨合或计划时，结合这些信息主动提供帮助。","Once you both choose what to share, EVE can use it to offer help when you discuss dates, disagreements or plans."],"relationship.interests":["兴趣与喜欢的相处方式","Interests and ways of spending time together"],"relationship.communication":["沟通偏好与在意的边界","Communication preferences and personal boundaries"],"relationship.plans":["一起安排的时间与节奏","Timing and pace for shared plans"],"relationship.data":["查看允许使用的信息","Review the information EVE may use"],"relationship.interestData":["已选择分享的文化兴趣；不包括其他应用的数据。","Cultural interests you chose to share; no data from other apps."],"relationship.noPreference":["暂未添加额外沟通偏好。","No additional communication preference yet."],"relationship.limit":["仅使用以上选定范围的资料与摘要。私人聊天原文、未分享的情绪不自动共享。范围改变后需重新确认。","Only the selected information and summaries above may be used. Raw private chats and unshared emotions are not automatically shared. Confirm again after changing scope."],"relationship.approve":["允许 EVE 持续使用我选择的范围","Allow EVE to keep using my selected information"],"relationship.on":["已共同开启。试着回私聊，聊聊眼前的事。","Enabled together. Return to your private chat and explore a topic."],"relationship.wait":["等待双方各自确认。","Waiting for each person to confirm."],"relationship.duration":["来自双方已开启的关系协助。可随时在设置中关闭；已读信息无法收回。","Based on your ongoing relationship permission. You can turn it off in settings; information already seen cannot be taken back."],"preparation.title":["纪念日，想亲口告诉他的话","Words for him on your anniversary"],"commitment.say":["把那句心意，亲口告诉他。","Tell him those words in person."],"commitment.said":["已经亲口告诉他","I've told him in person"],"commitment.confirmSaid":["我已经亲口告诉他","I've now told him in person"]});
Object.assign(CORE_MESSAGES,{
 'relationship.title':['从我，到我们','From me to us'],
 'relationship.about':['让 EVE 更懂我们：记得那些没说出口的期待，发现可以一起喜欢的事，也在闹别扭时，帮我们找到靠近的办法。','Let EVE get to know us: the hopes we find hard to say, things we could enjoy together, and ways to reconnect when we disagree.'],
 'relationship.manage':['查看与调整 EVE 了解的内容','Review and adjust what EVE knows'],
 'relationship.approve':['让 EVE 深入了解我们，持续帮我们靠近','Let EVE know us better and help us grow closer'],
 'relationship.on':['EVE 会带着这些了解，陪你们聊聊、计划，也为彼此多想一步。','EVE can bring this understanding to your conversations and plans, and help you think a little further for each other.'],
 'relationship.wait':['等你们一起开启，这份了解就能慢慢积累。','Once you both begin, this understanding can grow with you.']
});
Object.assign(CORE_MESSAGES,{
 'relationship.title':['EVE','EVE'],
 'vibe.share':['共享我的 Vibe','Share My Vibe'],
 'vibe.eveOn':['EVE 参与','EVE on'],
 'vibe.eveOff':['EVE 不参与','EVE off'],
 'vibe.suggestion':['可以从对方分享的安排偏好出发，约一段不赶时间的相处。先问问哪天方便，再一起挑地方。','Start with the planning preferences they shared. Suggest some unhurried time together, ask which day works, then choose a place together.'],
 'relationship.duration':['来自对方开启的 Vibe 共享。','Based on the Vibe they chose to share.']
});
Object.assign(CORE_MESSAGES,{'private.conversationHelp':['想想怎么开口','Find the words']});
Object.assign(CORE_MESSAGES,{'private.starters':['{name} · 你可以这样问 EVE','{name} · You could ask EVE']});
Object.assign(CORE_MESSAGES,{
 'vibe.eveOn':['接收 EVE 建议','Receive EVE suggestions'],'vibe.eveOff':['接收 EVE 建议','Receive EVE suggestions'],
 'group.title':['我们一起聊','Let’s plan together'],
 'group.active':['EVE 已加入','EVE has joined'],
 'group.paused':['双方开启 Vibe 共享并接收建议后，EVE 就会加入。','EVE joins when you both share your Vibe and receive suggestions.'],
 'group.settings':['我的设置','My settings'],
 'group.placeholder':['和大家说说你的想法……','Tell us what you have in mind…'],
 'group.common':['找找共同喜欢的','Find something we both enjoy'],
 'group.explore':['再看看其他选择','Explore other options'],
 'group.listen':['听到了。你们接着聊，我也可以帮你们找个共同喜欢的，或者换点新鲜的。','Got it. Keep talking — I can suggest something you both enjoy, or something new to try.'],
 'group.reply1':['你们都喜欢建筑和音乐。可以带着照片去走走，再找个地方听歌；想换个角度，也可以一起画一张建筑速写。','You both enjoy architecture and music. Bring some photos for a walk, then find somewhere to listen to music. For a new angle, try sketching a building together.'],
 'group.reply2':['你们喜欢有故事的东西。这次试试一个小展览，或者一起挑部没看过的悬疑片？留点时间聊结尾，别把下午排满。','You both enjoy a good story. How about a small exhibition, or a mystery film neither of you has seen? Leave room to talk about the ending.'],
 'group.reply3':['今晚不用安排得很满。各选一首歌，或者一起做道没做过的菜。还没想好也没关系，先坐下来聊。','No need to fill the evening. Bring a song each, or cook something new together. If you’re not ready to choose, just sit and talk first.'],
 'group.reply4':['你们都想慢一点，也还对新地方好奇。可以找个能坐下看风景的地方，带上相册；或者一起试一道新菜，把晚上留给彼此。','You both want a slower pace, and still enjoy discovering places. Find somewhere to sit with a view and bring your album, or try a new recipe together.'],
 'group.options':['看看这两个方向','A couple of possibilities']
});
Object.assign(CORE_MESSAGES,{
 'group.new1':['换个玩法：你们各选一张照片，再给对方的照片配一首歌。选完再揭晓，说不定会听见不一样的故事。','Try a twist: choose a photo each and pick a song for the other person’s photo. Reveal your choices together and see what stories come up.'],
 'group.new2':['这次各提名一部没看过的悬疑片吧。看完先猜对方最喜欢哪个角色，再听听为什么。','Nominate a mystery film neither of you has seen. Afterwards, guess each other’s favourite character, then find out why.'],
 'group.new3':['要不要一起试一道都没做过的菜？一个看步骤，一个动手，做砸了就叫外卖，也能算个晚上。','Try a recipe neither of you has made? One reads the steps, the other cooks. If it goes wrong, order takeaway — it still counts as an evening together.'],
 'group.new4':['换一种纪念方式：各找一首最近才喜欢上的歌，再一起做道新菜。十五年了，也还有新的你可以认识。','Mark the anniversary differently: bring a song you only recently discovered and cook something new together. There’s still more to learn about each other after fifteen years.']
});
Object.assign(CORE_MESSAGES,{
 'live.thinking':['EVE 正在想……','EVE is thinking…'],
 'live.movies':['电影候选 · Qloo','Film candidates · Qloo'],
 'live.movieNote':['先看看哪部让你们好奇，再一起决定。播放渠道与可用性还需确认。','See what catches your interest, then decide together. Viewing options and availability still need checking.'],
 'live.basis':['参考的文化兴趣','Cultural interests used'],
 'live.otherPlans':['其他安排','Other plans'],
 'live.storyPlans':['预设故事安排，未调用 Qloo。可以继续一起商量。','Scripted story plans, not Qloo results. Yours to discuss and adjust.'],
 'live.about':['四对人物均为虚构。自由输入由 Gemini 回答，电影候选来自 Qloo；快捷话题与其他安排保留预设剧本。服务不可用时会直接提示，不用预设回复冒充实时回答。','All four couples are fictional. Free-text replies use Gemini and film candidates use Qloo. Quick topics and other plans retain scripted examples. Unavailable services show an error rather than a simulated live reply.'],
 'live.demoSeeds':['演示文化输入：Kenji — Blade Runner、Kino（Кино）；Anya — Amélie、Kino（Кино）。Chloe — Knives Out；Sarah — Amélie、Nina Simone。Emma — Paddington 2；Arjun — Notting Hill。Leo — Before Sunrise；Julian — The Secret Life of Walter Mitty。它们是虚构人物的电影与音乐兴趣，并非从私人聊天提取。','Demo culture inputs: Kenji — Blade Runner and Kino (Кино); Anya — Amélie and Kino (Кино). Chloe — Knives Out; Sarah — Amélie and Nina Simone. Emma — Paddington 2; Arjun — Notting Hill. Leo — Before Sunrise; Julian — The Secret Life of Walter Mitty. These are fictional film and music interests, not extracted private conversations.'],
 'live.error.SERVICE_UNAVAILABLE':['这次没连上 EVE。消息还在，可以稍后再试。','EVE could not reply this time. Your message is still here; please try again later.'],
 'live.error.CONSENT_REQUIRED':['EVE 暂停参与。你们仍可以继续聊。','EVE is paused. You can still keep talking together.'],
 'live.error.QLOO_NOT_CONFIGURED':['文化推荐还未配置好。','Cultural recommendations are not configured yet.'],
 'live.error.QLOO_AUTH_FAILED':['文化推荐暂时无法连接。','Cultural recommendations cannot connect right now.'],
 'live.error.QLOO_UNAVAILABLE':['这次没取到文化候选，可以稍后再试。','No cultural candidates came through this time. Please try later.'],
 'live.error.QLOO_TIMEOUT':['文化推荐有点慢，可以稍后再试。','Cultural recommendations are taking too long. Please try later.'],
 'live.error.QLOO_RATE_LIMIT':['文化推荐暂时繁忙，过一会儿再试。','Cultural recommendations are busy. Please try again shortly.'],
 'live.error.SEED_NOT_FOUND':['有一项兴趣还没找到准确对应的作品。','One interest could not be matched to the right work yet.'],
 'live.error.SEED_AMBIGUOUS':['有同名作品，需要先确认具体是哪一部。','A title matches more than one work and needs checking first.'],
 'live.error.NO_RECOMMENDATIONS':['这次没有找到合适的电影候选。','No matching film candidates were found this time.'],
 'live.error.GEMINI_NOT_CONFIGURED':['EVE 的聊天服务还未配置好。','EVE’s chat service is not configured yet.'],
 'live.error.GEMINI_AUTH_FAILED':['EVE 的聊天服务暂时无法连接。','EVE’s chat service cannot connect right now.'],
 'live.error.GEMINI_UNAVAILABLE':['EVE 这次没能回复，可以稍后再试。','EVE could not reply this time. Please try later.'],
 'live.error.GEMINI_TIMEOUT':['EVE 回复有点慢，可以稍后再试。','EVE is taking too long. Please try later.'],
 'live.error.GEMINI_RATE_LIMIT':['EVE 暂时繁忙，过一会儿再试。','EVE is busy. Please try again shortly.']
});
Object.assign(CORE_MESSAGES,{
 'live.error.LOCAL_RATE_LIMIT':['刚才的请求还在处理中，稍等一下再试。','Please wait a moment before trying another request.'],
 'live.error.GEMINI_BAD_REQUEST':['EVE 的聊天连接需要调整，暂时无法回复。','EVE’s chat connection needs an adjustment before it can reply.'],
 'live.error.QLOO_CONFIG_INVALID':['文化推荐的连接需要调整。','The cultural recommendation connection needs an adjustment.'],
 'live.error.QLOO_RESPONSE_INVALID':['这次的文化推荐没有完整返回，可以稍后再试。','The cultural recommendations did not return correctly. Please try later.'],
 'live.error.REQUEST_BUDGET':['这次先查到这里，稍后可以再试。','That is the request limit for now. Please try again later.']
});
Object.assign(CORE_MESSAGES,{
 'planning.category':['这次想做什么','What shall we do?'],
 'planning.more':['更多选项','More options'],
 'eve.retryProactive':['让 EVE 再试一下','Let EVE try again'],
 'planning.location.current':['当前位置','Current location'],
 'planning.location.use':['使用当前位置','Use my location'],
 'planning.location.refresh':['更新位置','Update location'],
 'planning.location.clear':['清除位置','Clear location'],
 'planning.location.finding':['正在定位…','Finding your location…'],
 'planning.location.manual':['输入城市或地区','Enter a city or area'],
 'planning.location.denied':['定位未开启，也可以在更多选项里输入城市。','Location access is off. You can enter a city in More options.'],
 'planning.location.unavailable':['暂时无法取得位置，可以在更多选项里输入城市。','Your location is unavailable. You can enter a city in More options.'],
 'planning.location.timeout':['定位有点慢，可以重试或手动输入城市。','Finding your location took too long. Try again or enter a city.'],
 'planning.date':['约会地点','Date spots'],
 'planning.activity':['一起活动','Activities'],
 'planning.travel':['旅行','Travel'],
 'planning.movie':['电影','Films'],
 'planning.city':['城市','City'],
 'planning.from':['从哪里出发','Starting from'],
 'planning.city.tokyo':['东京','Tokyo'],
 'planning.city.new-york':['纽约','New York'],
 'planning.city.london':['伦敦','London'],
 'planning.city.wellington':['惠灵顿','Wellington'],
 'planning.city.auckland':['奥克兰','Auckland'],
 'planning.find.date':['找个去处','Find a place'],
 'planning.find.activity':['找个活动','Find an activity'],
 'planning.find.travel':['看看旅行方向','Explore a trip'],
 'planning.find.movie':['一起选电影','Find a film'],
 'planning.ask.date':['帮我们找个适合约会的地方吧。','Help us find somewhere for a date.'],
 'planning.ask.activity':['找个我们可以一起做的活动吧。','Find something we could do together.'],
 'planning.ask.travel':['我们想一起去旅行，帮我们找找方向。','We’d like to travel together. Help us find a direction.'],
 'planning.ask.movie':['帮我们挑部电影吧。','Help us pick a film.'],
 'planning.explore.date':['还有别的约会地方吗？想试点新鲜的。','Any other date spots? Let’s try something new.'],
 'planning.explore.activity':['换个没怎么试过的活动吧。','How about an activity we haven’t really tried?'],
 'planning.explore.travel':['再看看别的旅行方向吧。','Let’s explore another direction for our trip.'],
 'planning.explore.movie':['再找几部不一样的电影吧。','Let’s look for some different films.'],
 'planning.results.date':['这几个地方，看看喜欢哪个','A few places for you'],
 'planning.results.activity':['可以一起试试','Something to try together'],
 'planning.results.travel':['下一站，想去哪里','Where shall we go next?'],
 'planning.results.movie':['今晚想看哪一部','What shall we watch?'],
 'planning.choose':['就选这个','Let’s pick this'],
 'planning.chosen':['已提议','Proposed'],
 'planning.details':['地点与详情','Details'],
 'planning.website':['查看网站','View website'],
 'planning.check':['出发前再确认开放时间、费用和预约。','Check opening times, prices and booking details before you go.'],
 'planning.filmCheck':['播放渠道与可用性还需确认。','Check viewing options and availability.'],
 'planning.source':['地点与作品资料：Qloo','Place and title information: Qloo'],
 'live.presetShared':['「一起生活」与「长久相伴」预设为两人已共享 Vibe 并接收 EVE 建议，可在设置里随时调整。','Life together and Lasting love begin with both people sharing their Vibe and receiving EVE suggestions. These settings can be changed at any time.'],
 'live.about':['四对人物均为虚构。自由输入由 Gemini 回答，地点、旅行方向与电影候选来自 Qloo，EVE 结合共同聊天里的心情来安排。快捷话题与其他安排保留预设剧本。','All four couples are fictional. Gemini answers free-text messages; Qloo supplies places, travel directions and films. EVE uses the mood expressed in the shared chat to help plan. Quick topics and other plans retain scripted examples.'],
 'live.error.NO_RECOMMENDATIONS':['这次没找到合适的选择，换个方向或城市试试。','No suitable options came through. Try another direction or city.'],
 'live.error.PLANNING_LOCATION_UNSUPPORTED':['这次没找到对应的位置，试试更具体的城市名或当前位置。','That location could not be matched. Try a more specific city name or your current location.'],
 'live.error.PLAN_EXPIRED':['这组选择已经过期，重新找一次就好。','These options have expired. Find a fresh set to continue.'],
 'live.error.PLAN_NO_FIT':['这次的候选还不太贴合你们，换个方向试试。','These candidates don’t quite fit. Let’s try another direction.'],
 'live.error.GEMINI_PLAN_INVALID':['EVE 没整理好这次的安排，可以再试一次。','EVE couldn’t finish shaping this plan. Please try again.']
});
function t(key, params={}, lang=locale) {
  const entry=CORE_MESSAGES[key]||UI_MESSAGES[key];
  if(!entry)throw new Error('Missing translation: '+key);
  return entry[lang==='en'?1:0].replace(/\{(\w+)\}/g,(_,name)=>String(params[name]??''));
}
function storyFor(key,lang=locale){return (lang==='en'?STORY_EN:STORY)[key];}
function resolveText(path,lang=locale){
  if(path[0]==='ui')return t(path[1],{},lang);
  return path.slice(2).reduce((value,key)=>value[key],storyFor(path[1],lang));
}
// A reference changes only its presentation. The exact approved/sent source stays immutable.
class LocaleText {
  constructor(path,sourceLang=locale,source){this.path=path;this.sourceLang=sourceLang;this.source=source??resolveText(path,sourceLang);}
  toString(){return resolveText(this.path);}
  trim(){return this;}
}
class ArchiveText {
  constructor(name,text){this.name=name;this.text=text;}
  toString(){return t('archive.quote',{name:this.name,text:this.text});}
  trim(){return this;}
}
const ref=(...path)=>new LocaleText(['story',episode,...path]);
const uiRef=key=>new LocaleText(['ui',key]);
function approvedText(value){return value instanceof LocaleText?new LocaleText(value.path,locale,String(value)):value;}
function messageText(value){
  let html=esc(value);
  if(value instanceof LocaleText&&value.sourceLang!==locale)html+=`<details class="original-message"><summary>${esc(t('original.show'))}</summary><span lang="${value.sourceLang==='en'?'en':'zh-CN'}">${esc(value.source)}</span></details>`;
  return html;
}
window.EverLocale={t:(key,params)=>t(key,params)};
function localizeStatic(){
  document.documentElement.lang=locale==='en'?'en':'zh-CN';document.title=t('app.title');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-language]').forEach(el=>{el.value=locale;el.setAttribute('aria-label',t('app.language'));});
  for(const id of Object.keys(names))document.getElementById(id).setAttribute('aria-label',t('app.screen',{name:names[id]}));
}
function switchLanguage(next){
  if(!['zh','en'].includes(next)||next===locale)return;
  const scrolls=['.chat-body','.pane'].map(sel=>[sel,document.querySelector(sel)?.scrollTop]);
  // Original-wording disclosures appear only in the other language. Excluding them
  // keeps the stable story panels from shifting when that extra UI comes and goes.
  const storyDetails='.person.mobile-visible details:not(.original-message)';
  const opened=[...document.querySelectorAll(storyDetails)].map((el,index)=>el.open?index:-1);
  const focused=document.activeElement;
  const focusInfo=focused?.matches('textarea,input')?{id:focused.id,field:focused.dataset.input,composer:!!focused.closest('#chat-form'),start:focused.selectionStart,end:focused.selectionEnd}:null;
  locale=next;try{localStorage.setItem(LANGUAGE_PREFERENCE_KEY,next);}catch{}render();if(hintContext)renderHint();
  scrolls.forEach(([sel,top])=>{const el=document.querySelector(sel);if(el&&top!==undefined)el.scrollTop=top;});
  document.querySelectorAll(storyDetails).forEach((el,index)=>{el.open=opened.includes(index);});
  if(focusInfo){const el=focusInfo.id?document.getElementById(focusInfo.id):focusInfo.field?document.querySelector(`[data-input="${focusInfo.field}"]`):focusInfo.composer?document.querySelector('#chat-form textarea'):null;if(el){el.focus({preventScroll:true});if(focusInfo.start!==null&&el.setSelectionRange&&el.type!=='checkbox')el.setSelectionRange(focusInfo.start,focusInfo.end);}}
  const toastElement=document.getElementById('toast');if(toastElement.dataset.messageKey)toastElement.textContent=t(toastElement.dataset.messageKey);
}
document.addEventListener('change',e=>{if(e.target.matches('[data-language]'))switchLanguage(e.target.value);});
Object.assign(CORE_MESSAGES,{
 'photo.anyaShadowAlt':['东京楼梯上，栏杆的影子像一排琴键。','Railing shadows like piano keys across a concrete stairway in Tokyo.'],
 'photo.anyaShadowCaption':['那天在这里站了好久。','I stood here for ages.'],
 'photo.anyaShared':['Anya 分享的照片','A photo from Anya’s profile']
});

Object.assign(CORE_MESSAGES,{
 'moment.eveTitle':['EVE · 留下这一刻？','EVE · Keep this moment?'],
 'moment.eveAbout':['把刚才你们说的话，留成一份可编辑的草稿。','A draft using the words you just shared.'],
 'moment.eveReview':['看看草稿','Review draft'],
 'moment.eveSource':['来自你们的共同聊天 · 可编辑草稿','From your shared chat · Editable draft'],
 'moment.eveDismiss':['暂时不用','Not now'],
 'moment.eveExisting':['先看看你正在写的这份，原来的内容已保留。','Your unfinished draft is here, just as you left it.']
});
