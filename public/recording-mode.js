// Opt-in presentation styling only. It does not send messages, skip consent,
// alter story state, or change API responses. Ordinary app use is untouched.
(()=>{
 if(new URLSearchParams(location.search).get('recording')!=='1')return;
 document.documentElement.classList.add('recording-mode');
 const style=document.createElement('style');
 style.textContent=`.recording-mode,.recording-mode *{cursor:none!important}
 .recording-tap{position:fixed;z-index:2147483647;pointer-events:none;width:30px;height:30px;margin:-15px;border:3px solid #23685f;border-radius:50%;background:#e8f3ed66;box-shadow:0 0 0 2px #ffffffd9;animation:recording-tap .9s ease-out forwards}
 .recording-tap::after{content:'';position:absolute;left:50%;top:50%;width:7px;height:7px;border-radius:50%;background:#23685f;transform:translate(-50%,-50%)}
 .recording-mode .recording-pressed{outline:2px solid #23685f!important;outline-offset:3px;filter:brightness(.94)}
 @media(min-width:1000px){
  .recording-mode body{height:100dvh;overflow:hidden;display:flex;flex-direction:column}
  .recording-mode .masthead{width:100%;max-width:none;height:40px;min-height:40px;padding:0 38px;margin:0;flex-shrink:0}
  .recording-mode .brand{font-size:23px}.recording-mode .mark{font-size:28px}
  .recording-mode main{position:relative;display:flex;flex-direction:column;flex:1;min-height:0;width:100%;max-width:1240px;margin:0 auto;padding:6px 24px 8px}
  .recording-mode .chapter-switch{flex-shrink:0;margin:0 0 5px;padding:3px}
  .recording-mode .chapter-switch button{font-size:14px;padding:3px 8px;line-height:1.25}
  .recording-mode .chapter-switch small{font-size:11px}
  .recording-mode .mobile-switch{flex-shrink:0;min-height:32px;margin:0 0 5px}
  .recording-mode .mobile-switch button{padding:4px 20px;font-size:14px}
  .recording-mode .switch-label{font-size:12px}
  .recording-mode .chapter-caption{position:absolute;right:28px;top:55px;z-index:1}
  .recording-mode #time-control{margin:0}.recording-mode #time-control button{font-size:13px;min-height:30px}
  .recording-mode .duo{flex:1;min-height:0;display:flex}
  .recording-mode .person.mobile-visible{display:flex;flex-direction:column;width:100%;min-height:0;border-radius:16px}
  .recording-mode .person-head{flex-shrink:0;height:56px;padding:7px 22px;gap:10px}
  .recording-mode .person-head .avatar{width:40px;height:40px}
  .recording-mode .person-head h2{font-size:18px}.recording-mode .person-head small{font-size:12px}
  .recording-mode .screen{flex:1;min-height:0;height:auto}
  .recording-mode .tabs{flex-shrink:0;padding:0 24px;gap:28px}
  .recording-mode .tabs button{padding:7px 1px;font-size:14px}
  .recording-mode .chat-switch{flex-shrink:0;margin:7px 24px 4px;padding:3px}
  .recording-mode .chat-switch button{padding:4px 10px;font-size:14px}
  .recording-mode .scope{flex-shrink:0;margin:0 26px;font-size:12px}
  .recording-mode .chat-body{min-height:0;padding:12px 26px;overscroll-behavior:contain}
  .recording-mode .message{max-width:82%;margin-bottom:15px}
  .recording-mode .message .sender{font-size:13px;margin-bottom:4px}
  .recording-mode .bubble{font-size:18px;line-height:1.5;padding:11px 15px}
  .recording-mode .composer{flex-shrink:0;padding:9px 22px 11px;background:#fff}
  .recording-mode .composer textarea{height:56px;font-size:17px;line-height:1.45;padding:10px 12px}
  .recording-mode .composer button{font-size:15px;min-height:49px}
  .recording-mode .pane{min-height:0;padding:16px 26px;font-size:16px}
  .recording-mode .pane h3{font-size:27px}
  .recording-mode .fine,.recording-mode .more-topics,.recording-mode .inline-btn{font-size:13px}
  .recording-mode .primary,.recording-mode .secondary,.recording-mode .make-hint{font-size:15px}
  .recording-mode .seed{max-width:780px}.recording-mode .seed button{font-size:16px;line-height:1.5;padding:9px 13px}
  .recording-mode .seed-label{font-size:13px}
  .recording-mode .activity p,.recording-mode .status,.recording-mode .settings-row,.recording-mode .pane textarea,.recording-mode .memory-leaf p{font-size:16px;line-height:1.5}
  .recording-mode .activity h4{font-size:19px}.recording-mode .activity small{font-size:13px}
  .recording-mode .shared-photo>img{max-height:290px;object-fit:cover}
  .recording-mode .memory-tree{height:290px!important}
 }
 @keyframes recording-tap{0%{transform:scale(.65);opacity:1}35%{opacity:1}100%{transform:scale(1.9);opacity:0}}
 @media(prefers-reduced-motion:reduce){.recording-tap{animation:none;opacity:.8}}`;
 document.head.append(style);
 document.addEventListener('pointerdown',event=>{
  if(event.button!==0||!document.documentElement.classList.contains('recording-mode'))return;
  document.querySelectorAll('.recording-tap').forEach(dot=>dot.remove());
  const dot=document.createElement('span');dot.className='recording-tap';dot.setAttribute('aria-hidden','true');dot.style.left=event.clientX+'px';dot.style.top=event.clientY+'px';document.body.append(dot);setTimeout(()=>dot.remove(),950);
  const control=event.target instanceof Element?event.target.closest('button,[role="button"],summary,a'):null;
  if(control){control.classList.add('recording-pressed');setTimeout(()=>control.classList.remove('recording-pressed'),280);}
 },{passive:true});
 // Escape temporarily restores the arrow if the presenter needs it.
 document.addEventListener('keydown',event=>{if(event.key==='Escape')document.documentElement.classList.remove('recording-mode');});
})();
