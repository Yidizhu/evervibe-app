"use client";
import {useEffect, useState} from "react";
const words={
 en:{settings:"Settings",language:"Language",eyebrow:"A WORLD FOR TWO",title:"From me,\nto us.",body:"Qloo finds the cultural threads between two different tastes. EVE helps you turn them into a shared plan.",stories:"Follow four stories",storyNote:"Four fictional couples. Four ways to grow closer.",try:"Open the app",tryNote:"Chat with EVE, open your black box, and try a shared plan.",detail:"Cultural discovery by Qloo · Conversation with EVE",photo:"Leo and Julian looking through their memories in Wellington",cities:"Tokyo · New York · London · Wellington"},
 zh:{settings:"设置",language:"语言",eyebrow:"两个人的共同世界",title:"从我，\n到我们。",body:"Qloo 从不同的喜好里发现文化联系，EVE 帮你们把它变成一起想做的事。",stories:"走进四个故事",storyNote:"四对虚构人物，四种慢慢靠近的方式。",try:"打开应用",tryNote:"带上你的兴趣，和示例同伴发现可以一起喜欢的。",detail:"Qloo 发现文化共鸣 · EVE 陪你们一起聊",photo:"Leo 和 Julian 在惠灵顿一起翻看回忆",cities:"东京 · 纽约 · 伦敦 · 惠灵顿"}
};
export default function Home(){
 const [lang,setLang]=useState<"en"|"zh">("en");
 useEffect(()=>{try{const saved=localStorage.getItem("evervibe:language");if(saved==="en"||saved==="zh")setLang(saved);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang==="zh"?"zh-CN":"en";},[lang]);
 const text=words[lang];
 return <main className="welcome">
  <header className="welcome-header"><a className="wordmark" href="/">❧ EverVibe</a><details className="language-menu"><summary>{text.settings}</summary><label>{text.language}<select value={lang} onChange={e=>{const next=e.target.value as "en"|"zh";setLang(next);try{localStorage.setItem("evervibe:language",next);}catch{}}}><option value="en">English</option><option value="zh">中文</option></select></label></details></header>
  <section className="welcome-body"><div className="welcome-copy"><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}</h1><p className="intro">{text.body}</p><div className="entry"><a className="entry-button" href={'/stories?lang='+lang}>{text.stories}<span aria-hidden="true">↗</span></a><p>{text.storyNote}</p></div><div className="entry"><a className="entry-button secondary" href={'/try?lang='+lang}>{text.try}<span aria-hidden="true">→</span></a><p>{text.tryNote}</p></div></div><figure><img src="/assets/people/couple-lifetime-v2.png" alt={text.photo} width="1774" height="887" fetchPriority="high"/><figcaption>{text.cities}</figcaption><span className="photo-mark" aria-hidden="true">❧</span></figure></section>
  <footer>{text.detail}</footer>
 </main>;
}
