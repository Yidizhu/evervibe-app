/* Local procedural 3D demonstration asset. No external models or API calls. */
(function () {
  'use strict';
  window.mountEverBox = function (container, onOpen) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;border-radius:24px;overflow:hidden;background:#354657';
    const stage=Math.max(0,Math.min(3,(Number(document.body.dataset.chapter)||1)-1));
    const scenery=window.mountEverScenery?.(wrapper,stage,'box');
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:relative;width:100%;height:300px;display:block;cursor:grab;touch-action:none';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', (window.EverLocale?.t('box.aria')||'立体心意黑盒，可拖动旋转；使用下方按钮打开'));
    wrapper.appendChild(canvas);
    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden','true');
    glow.style.cssText='position:absolute;pointer-events:none;left:25%;top:12%;width:50%;height:160px;opacity:0;background:radial-gradient(ellipse,rgba(255,231,172,.8),rgba(247,209,130,.15) 48%,transparent 72%);mix-blend-mode:screen';
    wrapper.appendChild(glow);
    const footer = document.createElement('div');
    footer.style.cssText = 'position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:0 18px 16px';
    const caption = document.createElement('span');
    caption.textContent = (window.EverLocale?.t('box.drag')||'拖动旋转，打开一个相遇的可能');
    caption.style.cssText = 'font:11px system-ui;color:'+(scenery?.night?'#fff4df':'#364e45')+';text-shadow:0 1px 3px #343d4530';
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = (window.EverLocale?.t('box.open')||'打开黑盒');
    button.style.cssText = 'border:1px solid #decba4;border-radius:24px;padding:10px 19px;background:#efe4cd;color:#283b42;font:14px system-ui;cursor:pointer;box-shadow:0 3px 14px #202c3630';
    footer.append(caption, button); wrapper.appendChild(footer); container.appendChild(wrapper);
    let disposed = false, opened = false, frame = 0, started = 0, angle = -.55, pointer = null, lastX = 0, finishTimer = 0, completed = false;
    let gl, program, buffer, observer;
    const shaders = [];
    function finish() {
      if (disposed || completed) return;
      completed = true; clearTimeout(finishTimer);
      button.textContent = (window.EverLocale?.t('box.opened')||'黑盒已打开');
      if (typeof onOpen === 'function') onOpen();
    }
    button.addEventListener('click', function () {
      if (opened || disposed) return;
      opened = true; button.disabled = true;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reducedMotion) glow.animate([{opacity:0,transform:'translateY(22px) scale(.5)'},{opacity:.9,transform:'translateY(-8px) scale(1.1)',offset:.6},{opacity:0,transform:'translateY(-20px) scale(1.2)'}],{duration:1150,fill:'forwards'});
      button.textContent = (window.EverLocale?.t('box.opening')||'正在打开…');
      if (!program) { finishTimer=setTimeout(finish,reducedMotion?0:1150); return; }
      started = performance.now(); schedule();
      // Keep the action usable if the browser throttles or loses the animation frame.
      finishTimer = setTimeout(finish, reducedMotion?0:1250);
    });
    function dispose() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(frame); clearTimeout(finishTimer);
      if (observer) observer.disconnect();
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        shaders.forEach(s => gl.deleteShader(s));
        const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
      }
      wrapper.remove();
    }
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true });
      if (!gl) throw Error('WebGL unavailable');
      function shader(type, source) {
        const s = gl.createShader(type); shaders.push(s);
        gl.shaderSource(s, source); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error('Shader compilation failed');
        return s;
      }
      program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, `
        attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aLid;
        uniform float uAngle;uniform float uOpen;uniform float uAspect;varying vec3 vColor;
        void main(){
          vec3 p=aPosition,n=aNormal;
          if(aLid>.5){
            float c=cos(uOpen),s=sin(uOpen);mat3 hinge=mat3(1.,0.,0.,0.,c,-s,0.,s,c);
            p=hinge*(p-vec3(0.,.55,-.67))+vec3(0.,.55,-.67);n=hinge*n;
          }
          float c=cos(uAngle),s=sin(uAngle);mat3 turn=mat3(c,0.,-s,0.,1.,0.,s,0.,c);
          p=turn*p;n=normalize(turn*n);p.y-=.1;
          float yy=.91*p.y-.415*p.z;float zz=.415*p.y+.91*p.z-4.65;
          gl_Position=vec4(p.x*2.9/uAspect,yy*2.9,-1.00669*zz-.200669,-zz);
          float d=max(0.,dot(n,normalize(vec3(-.6,1.,1.))));
          vColor=aColor*(.50+.50*d);
        }`));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}'));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Shader link failed');
      gl.useProgram(program);
      const vertices = [];
      function cuboid(center, size, color, lid) {
        const points = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p => p.map((v,i) => center[i]+v*size[i]/2));
        [[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[3,7,6,2],[0,1,0]],[[0,1,5,4],[0,-1,0]]].forEach(([indices,n]) => {
          [0,1,2,0,2,3].forEach(i => vertices.push(...points[indices[i]],...n,...color,lid || 0));
        });
      }
      const black = [.17,.21,.23], edge = [.76,.65,.43];
      // Five solid walls leave a real open cavity under the hinged lid.
      cuboid([0,-.51,0],[1.5,.12,1.4],black);
      cuboid([-.7,0,0],[.10,1.0,1.4],black);
      cuboid([.7,0,0],[.10,1.0,1.4],black);
      cuboid([0,0,-.65],[1.3,1.0,.10],black);
      cuboid([0,0,.65],[1.3,1.0,.10],black);
      cuboid([0,.555,0],[1.55,.15,1.45],black,1);
      cuboid([0,.635,0],[1.47,.013,1.37],[.22,.24,.24],1);
      // Thin brass seams and an illuminated keepsake make the depth readable.
      [-.72,.72].forEach(x => cuboid([x,.46,0],[.024,.035,1.4],edge));
      [-.66,.66].forEach(z => cuboid([0,.46,z],[1.46,.035,.024],edge));
      cuboid([0,.13,.708],[.16,.23,.024],edge);
      cuboid([0,.64,0],[.24,.02,.24],[.78,.68,.47],1);
      cuboid([0,-.39,0],[.90,.12,.80],[.79,.65,.43]);
      cuboid([0,-.28,0],[.48,.13,.44],[.96,.82,.54]);
      cuboid([0,-.595,0],[1.75,.035,1.62],[.61,.50,.36]);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
      ['aPosition','aNormal','aColor','aLid'].forEach((name,i) => {
        const loc=gl.getAttribLocation(program,name); gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc,i===3?1:3,gl.FLOAT,false,40,i*12);
      });
      const angleLoc=gl.getUniformLocation(program,'uAngle'), openLoc=gl.getUniformLocation(program,'uOpen'), aspectLoc=gl.getUniformLocation(program,'uAspect');
      let finished = false;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function render(now) {
        frame=0; if(disposed)return;
        const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));
        gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        const progress=opened?(reduced?1:Math.min(1,(now-started)/650)):0;
        gl.uniform1f(angleLoc,angle);gl.uniform1f(openLoc,(1-Math.pow(1-progress,3))*1.8);gl.uniform1f(aspectLoc,canvas.width/canvas.height);
        gl.drawArrays(gl.TRIANGLES,0,vertices.length/10);
        if(opened && progress<1)schedule();
        else if(opened && !finished){finished=true;if(reduced)finish();}
      }
      function requestRender(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
      schedule = requestRender;
      observer=new ResizeObserver(schedule);observer.observe(canvas);
      canvas.addEventListener('pointerdown',e=>{pointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(pointer);canvas.style.cursor='grabbing';});
      canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;angle+=(e.clientX-lastX)*.012;lastX=e.clientX;schedule();});
      const release=()=>{pointer=null;canvas.style.cursor='grab';};
      canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
      schedule();
    } catch (error) {
      if (program && gl) gl.deleteProgram(program);
      program=null; caption.textContent=(window.EverLocale?.t('box.unavailable')||'当前浏览器无法显示 3D，可继续打开黑盒');
    }
    function schedule() {}
    return dispose;
  };
})();
