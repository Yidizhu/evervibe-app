import * as THREE from 'three';

// A real 3D meadow: shared geometry keeps hundreds of layered roses inexpensive.
// Petals form nested cups around a rolled centre, rather than a daisy shape.
export function createRoseGarden(care={}){
 const root=new THREE.Group();root.name='anniversary-rose-meadow';
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshStandardMaterial({color:0xa6b387,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.012;ground.receiveShadow=true;root.add(ground);
 const plants=[];
 for(let row=0;row<32;row++)for(let col=0;col<36;col++){
  const n=row*36+col,x=(col-17.5)*.34+Math.sin(n*4.73)*.075,z=(row-15.5)*.34+Math.cos(n*2.81)*.075;
  // Keep their shared tree and the memories at its roots visible.
  if(x*x+z*z<1.28*1.28)continue;
  const variant=(row*7+col*3)%11;
  plants.push({x,z,height:.12+(n%5)*.025,scale:.85+(n%7)*.065,color:variant<5?0xf1dbc4:variant<9?0xe3a9b1:0xb96b83,angle:n*2.399963});
 }
 // The small inner ring still responds to each use of the care controls.
 const nearby=window.everGardenLayout(3,care).flowers;
 nearby.forEach(({x,z,height,color},i)=>plants.push({x:x*1.3,z:z*1.4,height,scale:1.1,color:[0xe3a9b1,0xf1dbc4,0xb96b83][color],angle:i*2.399963}));
 const petalMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.83});
 const green=new THREE.MeshStandardMaterial({color:0x68884f,roughness:1});
 const roses=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),petalMaterial,plants.length*14);
 const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.007,.010,1,5),green,plants.length);
 const leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),green,plants.length*2);
 const transform=new THREE.Object3D(),tint=new THREE.Color();let petalIndex=0;
 plants.forEach((plant,index)=>{
  const {x,z,height,scale,angle,color}=plant;
  transform.position.set(x,height/2,z);transform.rotation.set(0,angle,0);transform.scale.set(1,height,1);transform.updateMatrix();stems.setMatrixAt(index,transform.matrix);
  for(let side=0;side<2;side++){
   const a=angle+side*Math.PI;
   transform.position.set(x+Math.cos(a)*.035,height*(.38+side*.18),z+Math.sin(a)*.035);
   transform.rotation.set(0,-a,side?.25:-.25);transform.scale.set(.063*scale,.012,.028*scale);transform.updateMatrix();leaves.setMatrixAt(index*2+side,transform.matrix);
  }
  for(let layer=0;layer<3;layer++){
   const number=[6,5,3][layer],radius=[.061,.035,.012][layer]*scale;
   for(let p=0;p<number;p++){
    const a=angle+p*Math.PI*2/number+layer*.6;
    transform.position.set(x+Math.sin(a)*radius,height+[0,.022,.034][layer]*scale,z+Math.cos(a)*radius);
    transform.rotation.set([-.50,-.23,.08][layer],a,0);
    transform.scale.set([.053,.043,.030][layer]*scale,[.045,.042,.031][layer]*scale,.018*scale);
    transform.updateMatrix();roses.setMatrixAt(petalIndex,transform.matrix);
    tint.setHex(color).multiplyScalar([1,.94,.81][layer]);roses.setColorAt(petalIndex,tint);petalIndex++;
   }
  }
 });
 for(const mesh of [roses,stems,leaves]){mesh.instanceMatrix.needsUpdate=true;mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);}
 roses.instanceColor.needsUpdate=true;root.userData.roseCount=plants.length;
 return root;
}
