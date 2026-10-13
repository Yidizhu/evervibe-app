/* EverVibe procedural WebGL tree. Local demonstration asset; not a Tripo model. */
(function () {
  'use strict';
  // Shared, bounded garden layout for both the procedural and Tripo trees.
  // Water fills the grass; nourishment adds flowers. Earlier plants keep their
  // positions on every render so each new patch is a visible addition.
  window.everGardenLayout = function(stage, care = {}) {
    if(stage < 2)return {grass:[],flowers:[]};
    const grassCount=Math.min(60,(stage===3?24:9)+Math.max(0,Number(care.water)||0)*3);
    const flowerCount=Math.min(32,(stage===3?9:3)+Math.max(0,Number(care.nourish)||0)*2);
    const point=(i,offset)=>{const angle=i*2.399963+offset,radius=.62+(i%4)*.085;return {x:Math.cos(angle)*radius,z:Math.sin(angle)*radius*.73,height:.16+(i%3)*.035};};
    return {grass:Array.from({length:grassCount},(_,i)=>point(i,.4)),flowers:Array.from({length:flowerCount},(_,i)=>({...point(i,1.7),color:i%3}))};
  };
  // Scenery is local, static artwork behind the interactive 3D object. It never
  // adds another animation loop or intercepts the object's drag gestures.
  let sceneryId = 0;
  window.mountEverScenery = function (host, stage, kind = 'tree') {
    stage = Math.max(0, Math.min(3, Number(stage) || 0));
    const id = 'ever-scene-' + (++sceneryId), night = stage === 0;
    const palettes = [
      ['#243951','#536379','#b8a8ac','#e6be82'],
      ['#d8e7e1','#f2edda','#a7bd9c','#667f67'],
      ['#ece0c8','#f6ead1','#b59c80','#6c8167'],
      ['#e6c28e','#f3e3be','#b1ae89','#748772']
    ], p = palettes[stage];
    host.dataset.sceneStage = String(stage);
    host.style.background = p[0];
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.className = 'ever-scene-backdrop';
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    let scenery = '';
    if (night) {
      scenery = `<rect width="1000" height="460" fill="#303f50"/>
        <rect x="52" y="-18" width="620" height="315" rx="4" fill="url(#${id}-sky)"/>
        <circle cx="516" cy="72" r="26" fill="#ece2c2" opacity=".86"/>
        <path d="M52 213h45v-38h44v22h43v-64h56v58h28v-29h45v41h29v-84h58v62h31v-39h39v66h53v-23h40v42h45v-55h42v42h32v99H52Z" fill="#25384b"/>
        <path d="M111 202v-10m17 10v-10m80-26v-11m15 11v-11m135 27v-11m17 11v-11m68 34v-12m49 25v-9m94 10v-11" stroke="#d4b98c" stroke-width="5" opacity=".8"/>
        <path d="M49 0v304h627V0M360 0v298M55 151h613" stroke="#c3b69f" stroke-width="11" fill="none"/>
        <path d="M0 0h63c18 107 18 206-3 315H0Z" fill="#9b938d"/>
        <path d="M682 0h51c-21 101-25 206-4 314h-47Z" fill="#a49c93"/>
        <path d="M746 216h254v18H746Z" fill="#8b7968"/><path d="M785 211v-61h13v61m8 0v-73h17v73m9 0v-58h12v58" stroke="#c1b29d" stroke-width="8"/>
        <path d="M892 193h36v15c0 15-36 15-36 0Z" fill="#a9b5a8"/><path d="M929 196c23-6 22 20 0 12" fill="none" stroke="#a9b5a8" stroke-width="5"/>
        <path d="M0 319L1000 294v166H0Z" fill="#806f60"/><path d="M0 359L1000 331M175 460l72-137m504 137-42-150" stroke="#9c8874" opacity=".42" stroke-width="2"/>
        <ellipse cx="500" cy="357" rx="290" ry="76" fill="#b4a18a"/>
        <ellipse cx="500" cy="350" rx="290" ry="71" fill="url(#${id}-light)"/>
        <ellipse cx="500" cy="343" rx="136" ry="31" fill="#463e3b" opacity=".25"/>`;
    } else if (stage === 1) {
      scenery = `<rect width="1000" height="460" fill="url(#${id}-sky)"/>
        <circle cx="736" cy="78" r="42" fill="#fff7d6" opacity=".7"/>
        <path d="M0 237Q165 183 323 230T632 222T1000 203V460H0Z" fill="#b7c7aa"/>
        <path d="M0 286Q184 220 404 278T1000 257V460H0Z" fill="#d5dbb9"/>
        <path d="M649 238Q513 281 632 325T725 460H386Q459 382 515 346T573 240Z" fill="#e6ddc3" opacity=".93"/>
        <path d="M0 345Q177 302 380 350T1000 316V460H0Z" fill="#a5b794"/>
        <path d="M0 371Q210 340 372 375T1000 355V460H0Z" fill="#c3cca8"/>
        <path d="M34 0q67 80 115 138M112 42l-40 7m65 68 53-35M965 0q-70 81-97 157m22-73 56 4" stroke="#71826d" stroke-width="13" fill="none"/>
        <g fill="#88a58b"><ellipse cx="60" cy="35" rx="83" ry="39" transform="rotate(22 60 35)"/><ellipse cx="160" cy="83" rx="60" ry="29" transform="rotate(-24 160 83)"/><ellipse cx="20" cy="108" rx="78" ry="35"/><ellipse cx="929" cy="30" rx="79" ry="38"/><ellipse cx="924" cy="114" rx="64" ry="31" transform="rotate(-21 924 114)"/></g>
        <g fill="#e7c8cb"><circle cx="135" cy="83" r="10"/><circle cx="165" cy="66" r="7"/><circle cx="55" cy="116" r="8"/><circle cx="897" cy="94" r="9"/></g>
        <g stroke="#718965" stroke-width="3"><path d="M127 388l-9-36m20 45 10-51m642 43 12-30m28 47-1-40"/></g>
        <g fill="#f3e7c3"><circle cx="118" cy="352" r="7"/><circle cx="148" cy="346" r="8"/><circle cx="802" cy="359" r="6"/><circle cx="829" cy="366" r="7"/></g>`;
    } else if (stage === 2) {
      scenery = `<rect width="1000" height="460" fill="url(#${id}-sky)"/>
        <path d="M0 0h292v300H0Z" fill="#c8b49c"/><rect x="36" y="38" width="206" height="203" fill="#8b9b92"/>
        <path d="M47 229V49h184v180Zm92-180v180M47 138h184" stroke="#ece2cc" fill="none" stroke-width="10"/>
        <path d="M278 0h26v302h-26Z" fill="#ae9279"/>
        <path d="M304 193Q485 136 661 178T1000 138V330H304Z" fill="#9cae8b"/>
        <path d="M306 235Q488 177 703 232T1000 207V338H306Z" fill="#7f967e"/>
        <path d="M0 285h1000v175H0Z" fill="#d4c1a5"/><path d="M0 332h1000M0 399h1000M173 285 81 460M421 285l-18 175m267-175 34 175m218-175 80 175" stroke="#b6a38b" stroke-width="2" opacity=".52"/>
        <path d="M698 281h221v16H698Zm14-52h195v14H712Zm0 23h195v14H712Z" fill="#9c795e"/><path d="M722 227v116m174-116v116" stroke="#826d58" stroke-width="10"/>
        <path d="M829 232h37v25h-37Z" fill="#d6b09b" transform="rotate(5 847 242)"/>
        <path d="M780 0q34 49 51 123m-22-64 59-17m-53 42-52-22" stroke="#7a7c5e" stroke-width="9" fill="none"/>
        <g fill="#8a9a72"><ellipse cx="793" cy="18" rx="75" ry="37"/><ellipse cx="869" cy="42" rx="74" ry="29"/><ellipse cx="788" cy="86" rx="56" ry="25"/></g>
        <path d="M304 16Q611 140 1000 33" fill="none" stroke="#887e68" stroke-width="2"/>
        <g fill="#fff2c1" stroke="#c1a46f"><circle cx="366" cy="38" r="5"/><circle cx="486" cy="68" r="5"/><circle cx="621" cy="84" r="5"/><circle cx="756" cy="79" r="5"/><circle cx="896" cy="57" r="5"/></g>
        <path d="M44 300h84l-12 66H56Z" fill="#a77e67"/><path d="M85 304v-72m0 38-25-22m26 34 28-27" stroke="#6f8569" stroke-width="5"/>
        <g fill="#769073"><ellipse cx="82" cy="231" rx="15" ry="28"/><ellipse cx="59" cy="249" rx="23" ry="11" transform="rotate(30 59 249)"/><ellipse cx="115" cy="251" rx="23" ry="11" transform="rotate(-35 115 251)"/></g>`;
    } else {
      scenery = `<rect width="1000" height="460" fill="url(#${id}-sky)"/>
        <circle cx="745" cy="111" r="42" fill="#fff0c1" opacity=".87"/>
        <path d="M0 230Q168 121 300 212T620 205T1000 214V315H0Z" fill="#9ba796"/>
        <path d="M0 268Q143 207 338 255T682 253T1000 235V336H0Z" fill="#7e9281"/>
        <path d="M0 295Q175 267 343 288T733 271T1000 286V350H0Z" fill="#c7c8a7"/>
        <path d="M0 339Q206 295 430 339T1000 301V460H0Z" fill="#afaf85"/>
        <path d="M677 311Q600 344 695 382T879 460H485Q564 415 579 379T640 316Z" fill="#e1d0aa"/>
        <path d="M0 401Q223 349 481 405T1000 375V460H0Z" fill="#c0b48e"/>
        <path d="M76 0q20 103-22 247m37-132L158 68M25 83l64 38M966 0q-67 122-31 241m-20-127-71-52" fill="none" stroke="#7f795e" stroke-width="16"/>
        <g fill="#929572"><ellipse cx="72" cy="19" rx="133" ry="48"/><ellipse cx="156" cy="68" rx="69" ry="34"/><ellipse cx="21" cy="110" rx="76" ry="34"/><ellipse cx="943" cy="40" rx="109" ry="55"/><ellipse cx="855" cy="91" rx="70" ry="31"/></g>
        <g fill="#b9a578"><ellipse cx="118" cy="37" rx="76" ry="27"/><ellipse cx="926" cy="83" rx="73" ry="25"/></g>
        <path d="M772 325h135v10H772Zm7-33h122v9H779Zm0 16h122v8H779Z" fill="#8e7f60"/><path d="M785 291v69m110-69v69" stroke="#7c735c" stroke-width="7"/>
        <g fill="#d4b679"><ellipse cx="197" cy="378" rx="9" ry="4" transform="rotate(-24 197 378)"/><ellipse cx="766" cy="416" rx="11" ry="4" transform="rotate(24 766 416)"/><ellipse cx="238" cy="426" rx="8" ry="4"/><ellipse cx="833" cy="379" rx="8" ry="4" transform="rotate(-35 833 379)"/></g>`;
    }
    layer.innerHTML = `<svg viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" focusable="false"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient><radialGradient id="${id}-light"><stop stop-color="#d0b894"/><stop offset="1" stop-color="#a18b72"/></radialGradient></defs>${scenery}<rect width="1000" height="460" fill="${night?'#253446':'#fff6dd'}" opacity=".05"/></svg>`;
    host.prepend(layer);
    return { night, labelColor: night ? '#f1e4cb' : '#364e45', dispose: () => layer.remove() };
  };
  // Care is a short, intentional moment. No background timers or daily chores.
  window.mountEverTreeCare = function (host, care = {}) {
    const count=Math.max(0,Math.min(8,Number(care.count)||0));host.dataset.careLevel=String(count);
    if(!count)return ()=>{};
    const layer=document.createElement('div');layer.className='tree-care-effect';layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<span class="tree-care-halo"></span>';
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(care.animate){layer.dataset.action=care.animate;layer.classList.add(reduced?'care-still':'care-pulse');
      if(!reduced)for(let i=0;i<9;i++){const mote=document.createElement('i');mote.className=care.animate==='water'?'tree-care-drop':'tree-care-spark';mote.style.setProperty('--i',i);layer.append(mote);}
    }
    host.append(layer);
    const timer=care.animate?setTimeout(()=>{layer.classList.remove('care-pulse','care-still');layer.querySelectorAll('i').forEach(mote=>mote.remove());delete layer.dataset.action;},1900):null;
    return ()=>{clearTimeout(timer);layer.remove();};
  };
  window.mountEverTree = function (container, stage, hasMemory, care = {}) {
    stage = Math.max(0, Math.min(3, Number(stage) || 0));
    const previousHeight=container.style.height;
    container.style.height='340px';
    const names = [(window.EverLocale?.t('tree.seed')||'一颗种子'), (window.EverLocale?.t('tree.sprout')||'初生嫩芽'), (window.EverLocale?.t('tree.growing')||'并肩成长'), (window.EverLocale?.t('tree.mature')||'枝叶相依')];
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;height:340px;min-height:240px;border-radius:24px;overflow:hidden;touch-action:pan-y';
    const scenery = window.mountEverScenery(wrapper, stage);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:relative;width:100%;height:100%;display:block;cursor:grab;touch-action:none';
    canvas.setAttribute('aria-label', (window.EverLocale?.t('tree.aria',{stage:names[stage]}) || names[stage] + '，可拖动旋转的三维共生树'));
    canvas.setAttribute('role', 'img');
    wrapper.appendChild(canvas);
    const badge = document.createElement('span');
    badge.textContent = '3D · ' + names[stage];
    badge.style.cssText = 'position:absolute;top:15px;left:17px;font:12px system-ui;color:'+scenery.labelColor+';pointer-events:none';
    wrapper.appendChild(badge);
    const caption = document.createElement('span');
    caption.textContent = (window.EverLocale?.t('tree.drag')||'拖动旋转，看看我们的树');
    caption.style.cssText = 'position:absolute;bottom:13px;left:17px;font:11px system-ui;color:'+scenery.labelColor+';pointer-events:none';
    wrapper.appendChild(caption);
    const controls = document.createElement('div');
    controls.style.cssText = 'position:absolute;right:12px;top:10px;display:flex;gap:5px';
    wrapper.appendChild(controls);
    container.appendChild(wrapper);
    const disposeCare=window.mountEverTreeCare(wrapper,care);
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) {
      caption.textContent = (window.EverLocale?.t('tree.unavailable')||'当前浏览器未启用 WebGL，暂时无法显示三维树。');
      return function () { disposeCare();wrapper.remove();container.style.height=previousHeight; };
    }
    const vertexSource = `attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;
      uniform float uAngle;uniform float uAspect;uniform float uDistance;varying vec3 vColor;
      void main(){float c=cos(uAngle),s=sin(uAngle);mat3 r=mat3(c,0.,-s,0.,1.,0.,s,0.,c);
      vec3 p=r*aPosition;vec3 n=normalize(r*aNormal);p.y-=${stage===3?1.30:stage===2?1.05:.67};
      float yy=.94*p.y-.342*p.z;float zz=.342*p.y+.94*p.z-uDistance;
      gl_Position=vec4(p.x*2.75/uAspect,yy*2.75,-1.00669*zz-.200669,-zz);
      float d=max(0.,dot(n,normalize(vec3(-.65,1.,.8))));
      vColor=aColor*(.57+.43*d);}`;
    const fragmentSource = 'precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}';
    const shaders = [];
    function shader(type, source) {
      const result = gl.createShader(type); gl.shaderSource(result, source); gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(result));
      shaders.push(result); return result;
    }
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const vertices = [];
    const subtract = (a, b) => a.map((v, i) => v - b[i]);
    const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    function triangle(a, b, c, color) {
      const n = cross(subtract(b, a), subtract(c, a)); const length = Math.hypot(...n) || 1;
      const normal = n.map(v => v / length);
      [a, b, c].forEach(p => vertices.push(...p, ...normal, ...color));
    }
    function ellipsoid(center, size, color, segments = 9, rings = 6) {
      const point = (i, j) => {
        const lat = Math.PI * i / rings; const lng = Math.PI * 2 * j / segments;
        return [center[0]+size[0]*Math.sin(lat)*Math.cos(lng),center[1]+size[1]*Math.cos(lat),center[2]+size[2]*Math.sin(lat)*Math.sin(lng)];
      };
      for (let i=0;i<rings;i++) for (let j=0;j<segments;j++) {
        const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);
        triangle(a,d,b,color); triangle(b,d,c,color);
      }
    }
    function branch(a,b,r1,r2,color) {
      const axis=subtract(b,a); const len=Math.hypot(...axis); const dir=axis.map(v=>v/len);
      let side=cross(dir,Math.abs(dir[1])>.9?[1,0,0]:[0,1,0]); const sl=Math.hypot(...side);side=side.map(v=>v/sl);
      const up=cross(dir,side); const point=(p,r,t)=>p.map((v,i)=>v+r*(side[i]*Math.cos(t)+up[i]*Math.sin(t)));
      for(let j=0;j<9;j++) {const t=j*Math.PI*2/9,u=(j+1)*Math.PI*2/9;
        const v1=point(a,r1,t),v2=point(a,r1,u),v3=point(b,r2,t),v4=point(b,r2,u);
        triangle(v1,v2,v3,color);triangle(v2,v4,v3,color);triangle(b,v3,v4,color);
      }
    }
    // Real three-dimensional geometry, including a low plinth and a soft-looking shadow disk.
    ellipsoid([0,-.075,0],[1.20,.075,.84],[.56,.60,.44],32,4);
    branch([0,-.045,0],[0,.10,0],1.03,1.08,stage===2?[.69,.61,.46]:[.75,.75,.55]);
    ellipsoid([0,.105,0],[1.0,.025,.70],[.51,.61,.39],24,4);
    // Low grasses and stones give the tree a tangible place within its garden.
    for(let i=0;i<(stage<2?11:0);i++){
      const t=i*2.4,x=Math.cos(t)*(.62+(i%3)*.13),z=Math.sin(t)*.54;
      triangle([x-.035,.12,z],[x+.012,.26+(i%3)*.02,z-.025],[x+.026,.12,z+.012],[.47,.60,.34]);
      triangle([x-.03,.12,z+.015],[x-.10,.22,z-.01],[x+.006,.12,z],[.62,.69,.40]);
    }
    [[-.72,.13,.3],[.57,.13,.39],[.74,.13,-.19]].forEach((p,i)=>ellipsoid(p,[.11,.06,.08],[.78,.76,.61],7,4));
    const garden=window.everGardenLayout(stage,care);
    canvas.dataset.gardenGrass=String(garden.grass.length);canvas.dataset.gardenFlowers=String(garden.flowers.length);
    garden.grass.forEach(({x,z,height},i)=>{
      for(let blade=0;blade<3;blade++){
        const bend=(blade-1)*.055;
        triangle([x-.018,.12,z+blade*.012],[x+bend,.12+height-(blade%2)*.035,z-.025],[x+.018,.12,z+blade*.012],i%2?[.43,.61,.35]:[.60,.72,.41]);
      }
    });
    garden.flowers.forEach(({x,z,height,color})=>{
      const y=.17+height;
      branch([x,.12,z],[x+.018,y,z],.012,.008,[.34,.53,.32]);
      ellipsoid([x-.04,y-.09,z],[.07,.025,.034],[.56,.70,.39],6,3);
      for(let p=0;p<5;p++){const a=p*Math.PI*2/5;ellipsoid([x+.018+Math.cos(a)*.052,y+Math.sin(a)*.052,z+.01],[.05,.05,.025],[[.95,.79,.78],[.97,.91,.70],[.76,.72,.88]][color],6,4);}
      ellipsoid([x+.018,y,z+.035],[.028,.028,.023],[.91,.67,.28],6,4);
    });
    const bark=[.46,.32,.23], green=[.39,.59,.36], light=[.60,.73,.43], dark=[.27,.46,.30];
    if(stage===0) {
      ellipsoid([0,.36,0],[.26,.31,.21],[.58,.39,.26],10,7);
      branch([-.02,.48,.1],[.07,.78,.08],.023,.014,green);
      ellipsoid([.15,.77,.06],[.17,.045,.085],light,7,4);
    } else if(stage===1) {
      branch([0,.13,0],[.025,1.05,0],.057,.026,green);
      branch([0,.69,0],[-.24,.89,.035],.025,.012,green);
      ellipsoid([-.32,.91,.035],[.34,.095,.16],light,8,5);
      ellipsoid([.3,1.02,0],[.37,.10,.17],green,8,5);
      ellipsoid([.04,1.19,-.005],[.10,.20,.08],light,7,4);
    } else {
      const mature=stage===3;const height=mature?1.90:1.50;
      branch([0,.12,0],[-.06,height,0],mature?.135:.09,.047,bark);
      const clusters = mature ? [
        [-.72,1.83,.0,.57], [.65,1.94,-.12,.56],[-.36,2.35,-.21,.61],[.32,2.45,.13,.57],
        [0,2.74,-.03,.49],[-.51,2.09,.40,.44],[.43,1.83,.46,.43],[.17,2.17,-.49,.50]
      ] : [[-.42,1.45,.0,.42],[.41,1.59,-.12,.41],[.0,1.99,.0,.46],[-.1,1.63,.31,.35]];
      clusters.forEach((p,i)=>{
        branch([-.03,height*.66,0],p.slice(0,3),mature?.055:.04,.021,bark);
        ellipsoid(p.slice(0,3),[p[3],p[3]*.87,p[3]*.89],[green,light,dark,green][i%4],8,5);
      });
      [[-.24,.15,.16],[.22,.14,.15],[.05,.14,-.24]].forEach(p=>branch([0,.30,0],p,.065,.022,bark));
    }
    if(hasMemory) {
      const y=stage<2?.63:stage===2?1.57:2.02;
      const x=stage<2?.37:.68;
      branch([x,y+.25,.30],[x,y,.30],.009,.009,[.73,.60,.33]);
      ellipsoid([x,y,.30],[.09,.15,.035],[.93,.69,.39],6,4);
    }
    const careCount=Math.max(0,Math.min(8,Number(care.count)||0));
    canvas.dataset.careGrowth=String(careCount);
    for(let i=0;i<careCount;i++){
      const side=i%2?-1:1,offset=Math.floor(i/2)*.07;
      if(stage<2){
        const y=(stage===0?.74:.72)+offset,x=side*(stage===0?.25:.42);
        branch([0,y-.22,.07],[x,y,.13],.018,.008,green);
        ellipsoid([x+side*.055,y+.018,.13],[stage===0?.18:.23,.065,.12],[.68,.80,.43],8,5);
        ellipsoid([x-side*.035,y+.11,.12],[.055,.115,.055],[.79,.85,.48],7,4);
      }else{
        const x=side*(.31+(i%3)*.1),y=(stage===2?1.58:2.02)+offset,z=.43+(i%2)*.06;
        for(let p=0;p<5;p++){const a=p*Math.PI*2/5;ellipsoid([x+Math.cos(a)*.065,y+Math.sin(a)*.065,z],[.06,.068,.025],[.91,.77,.80],7,4);}
        ellipsoid([x,y,z+.025],[.043,.043,.025],[.93,.76,.35],7,4);
      }
    }
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    ['aPosition','aNormal','aColor'].forEach((name,i)=>{const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,i*12);});
    const angleLocation=gl.getUniformLocation(program,'uAngle'), aspectLocation=gl.getUniformLocation(program,'uAspect'),distanceLocation=gl.getUniformLocation(program,'uDistance');
    let angle=-.4,distance=stage===3?6.2:4.9,disposed=false,pointer=null,lastX=0,frame=0;
    const defaultDistance=distance;
    function render() {
      frame=0;if(disposed)return;
      const rect=wrapper.getBoundingClientRect();const ratio=Math.min(window.devicePixelRatio||1,2);
      const width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(angleLocation,angle);gl.uniform1f(aspectLocation,width/height);gl.uniform1f(distanceLocation,distance);
      gl.drawArrays(gl.TRIANGLES,0,vertices.length/9);
    }
    function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
    const observer=new ResizeObserver(schedule);observer.observe(wrapper);
    canvas.addEventListener('pointerdown',e=>{pointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(pointer);canvas.style.cursor='grabbing';});
    canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;angle+=(e.clientX-lastX)*.012;lastX=e.clientX;schedule();});
    function release(){pointer=null;canvas.style.cursor='grab';}
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
    [['＋',(window.EverLocale?.t('tree.zoomIn')||'放大'),()=>{distance=Math.max(3.9,distance-.4);}],['−',(window.EverLocale?.t('tree.zoomOut')||'缩小'),()=>{distance=Math.min(7,distance+.4);}],['↺',(window.EverLocale?.t('tree.reset')||'重置视角'),()=>{angle=-.4;distance=defaultDistance;}]].forEach(([text,label,action])=>{
      const button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-label',label);
      button.style.cssText='border:1px solid #dce1d3;background:#ffffffc9;color:#435c45;border-radius:50%;width:30px;height:30px;padding:0;cursor:pointer;font:16px system-ui';
      button.addEventListener('click',()=>{action();schedule();});controls.appendChild(button);
    });
    schedule();
    return function dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();disposeCare();gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));const ext=gl.getExtension('WEBGL_lose_context');if(ext)ext.loseContext();wrapper.remove();container.style.height=previousHeight;};
  };
})();

