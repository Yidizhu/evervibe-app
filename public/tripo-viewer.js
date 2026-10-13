import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createRoseGarden} from './rose-garden.js';

export function mountModel(host,name,onOpen,stage=name==='tree'?3:0,care={}){
 const wrap=document.createElement('div');
 wrap.style.cssText='height:100%;min-height:270px;position:relative;overflow:hidden;border-radius:24px;background:#e2d8bb';host.append(wrap);
 const scenery=window.mountEverScenery?.(wrap,stage,name==='tree'?'tree':'box');
 const status=document.createElement('span');
 status.textContent=window.EverLocale?.t('model.loading')||'正在载入纪念物…';
 status.style.cssText='position:absolute;z-index:1;left:16px;top:14px;color:'+(scenery?.labelColor||'#364e45')+';font:12px system-ui;pointer-events:none';wrap.append(status);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.style.cssText='position:relative;width:100%;height:100%;display:block;touch-action:none';
 renderer.domElement.setAttribute('role','img');
 renderer.domElement.setAttribute('aria-label',window.EverLocale?.t('tree.aria',{stage:window.EverLocale?.t('tree.mature')||'枝叶相依'})||'可拖动旋转的共生树');
 wrap.append(renderer.domElement);
 const disposeCare=name==='tree'?window.mountEverTreeCare?.(wrap,care):null;
 const careCount=name==='tree'?Math.max(0,Math.min(8,Number(care.count)||0)):0;
 renderer.domElement.dataset.careGrowth=String(careCount);
 const garden=name==='tree'?window.everGardenLayout?.(stage,care):null;
 renderer.domElement.dataset.gardenGrass=String(garden?.grass.length||0);renderer.domElement.dataset.gardenFlowers=String(garden?.flowers.length||0);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);
 const startPosition=new THREE.Vector3(3,2.4,4.3);camera.position.copy(startPosition);
 scene.add(new THREE.HemisphereLight(0xfff5df,0x797858,2.3));
 const key=new THREE.DirectionalLight(0xffe4ad,3.2);key.position.set(-3,6,4);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;scene.add(key);
 const fill=new THREE.DirectionalLight(0xe7eee0,1.6);fill.position.set(4,3,-2);scene.add(fill);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:.17}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
 if(name==='tree'&&stage===3){const meadow=createRoseGarden(care);scene.add(meadow);renderer.domElement.dataset.meadowRoses=String(meadow.userData.roseCount);}
 const controls=new OrbitControls(camera,renderer.domElement);
 // Demand rendering keeps the scene still at rest and respects reduced motion.
 controls.enableDamping=false;controls.enablePan=false;controls.minDistance=3.5;controls.maxDistance=8;
 controls.minPolarAngle=.4;controls.maxPolarAngle=1.35;controls.target.set(0,.9,0);
 let disposed=false,model,frame=0;
 function render(){frame=0;if(!disposed)renderer.render(scene,camera);}
 function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(render);}
 controls.addEventListener('change',schedule);
 const observer=new ResizeObserver(()=>{
  const w=Math.max(1,wrap.clientWidth),h=Math.max(1,wrap.clientHeight||340);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();schedule();
 });observer.observe(wrap);
 const toolbar=document.createElement('div');toolbar.style.cssText='position:absolute;right:12px;top:10px;display:flex;gap:5px';wrap.append(toolbar);
 for(const [symbol,keyName,factor]of [['＋','tree.zoomIn',.86],['−','tree.zoomOut',1.16],['↺','tree.reset',0]]){
  const b=document.createElement('button');b.type='button';b.textContent=symbol;b.setAttribute('aria-label',window.EverLocale?.t(keyName)||keyName);
  b.style.cssText='border:1px solid #dce1d3;background:#ffffffd9;color:#435c45;border-radius:50%;width:30px;height:30px;padding:0;cursor:pointer;font:16px system-ui';
  b.addEventListener('click',()=>{
   if(!factor)camera.position.copy(startPosition);
   else{const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);}
   controls.update();schedule();
  });toolbar.append(b);
 }
 new GLTFLoader().load('/assets/'+name+'.glb',g=>{
  if(disposed){disposeScene(g.scene);return;}
  model=g.scene;
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=2.25/Math.max(size.x,size.y,size.z);
  model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  scene.add(model);controls.target.set(0,size.y*scale*.43,0);camera.position.copy(startPosition);controls.update();
  if(garden?.grass.length){
   const bed=new THREE.Group();bed.name='shared-memory-garden';
   const soil=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.22,.045,48),new THREE.MeshStandardMaterial({color:0x95a879,roughness:1}));
   soil.scale.z=.82;soil.position.y=.025;soil.receiveShadow=true;bed.add(soil);
   const green=new THREE.MeshStandardMaterial({color:0x789a59,roughness:1,side:THREE.DoubleSide});
   garden.grass.forEach(({x,z,height},i)=>{
    const tuft=new THREE.Group();tuft.position.set(x*1.3,.05,z*1.4);tuft.rotation.y=i*1.2;
    for(let b=0;b<4;b++){
     const geometry=new THREE.BufferGeometry(),bend=(b-1.5)*.038;
     geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.018,0,0,bend,height-(b%2)*.035,.016,.018,0,0],3));geometry.computeVertexNormals();
     const blade=new THREE.Mesh(geometry,green);blade.rotation.y=b*.85;tuft.add(blade);
    }bed.add(tuft);
   });
   (stage===3?[]:garden.flowers).forEach(({x,z,height,color},i)=>{
    const flower=new THREE.Group();flower.position.set(x*1.3,.05,z*1.4);flower.rotation.y=.6+(i%3)*.3;
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.007,.011,height,5),green);stem.position.y=height/2;flower.add(stem);
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(.05,6,4),green);leaf.scale.set(1.4,.35,.6);leaf.position.set(-.035,height*.45,0);flower.add(leaf);
    const petals=new THREE.MeshStandardMaterial({color:[0xe9b8b4,0xf4e7b8,0xbcb3db][color],roughness:.9});
    for(let p=0;p<5;p++){const a=p*Math.PI*2/5,petal=new THREE.Mesh(new THREE.SphereGeometry(.044,7,5),petals);petal.position.set(Math.cos(a)*.046,height+Math.sin(a)*.046,0);petal.scale.z=.5;flower.add(petal);}
    const heart=new THREE.Mesh(new THREE.SphereGeometry(.027,7,5),new THREE.MeshStandardMaterial({color:0xe0b04e,roughness:1}));heart.position.set(0,height,.025);flower.add(heart);bed.add(flower);
   });scene.add(bed);
  }
  if(careCount){
   const flowers=new THREE.Group();flowers.name='shared-memory-blossoms';
   for(let i=0;i<careCount;i++){
    const flower=new THREE.Group(),side=i%2?-1:1;
    flower.position.set(side*(.34+(i%3)*.08),size.y*scale*(.62+(i%3)*.095),.94+(i%2)*.025);
    for(let p=0;p<5;p++){const angle=p*Math.PI*2/5,petal=new THREE.Mesh(new THREE.SphereGeometry(.071,10,8),new THREE.MeshStandardMaterial({color:0xe8bdca,roughness:.8}));petal.position.set(Math.cos(angle)*.063,Math.sin(angle)*.063,0);petal.scale.set(1,1,.45);flower.add(petal);}
    const center=new THREE.Mesh(new THREE.SphereGeometry(.043,10,8),new THREE.MeshStandardMaterial({color:0xeec46a,roughness:.7}));center.position.z=.04;flower.add(center);flowers.add(flower);
   }scene.add(flowers);
  }
  status.textContent=window.EverLocale?.t('model.drag')||'拖动旋转 · 滚轮缩放';renderer.domElement.dataset.loaded=name;schedule();
  if(onOpen){const b=document.createElement('button');b.type='button';b.textContent=window.EverLocale?.t('box.open')||'打开黑盒';b.style.cssText='position:absolute;bottom:12px;right:16px;border:0;border-radius:24px;padding:10px 18px;background:#303c32;color:white;cursor:pointer';b.onclick=()=>{b.disabled=true;onOpen()};wrap.append(b);}
 },undefined,()=>{if(!disposed)status.textContent=window.EverLocale?.t('model.unavailable')||'模型尚未就绪，请稍后刷新';});
 function disposeScene(root){root.traverse(o=>{o.geometry?.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}});}
 schedule();
 return()=>{
  if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.removeEventListener('change',schedule);controls.dispose();
  disposeScene(scene);renderer.dispose();renderer.forceContextLoss();scenery?.dispose();disposeCare?.();wrap.remove();
 };
}
