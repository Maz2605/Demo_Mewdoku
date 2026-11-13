const {test}=require('node:test');const assert=require('node:assert/strict');
const {roundedCube}=require('../assets/scripts/view/ModelGeometry.ts');
const {blastDelay,blastDuration,sampleShard}=require('../assets/scripts/view/Motion.ts');
test('rounded model is bounded, has unit normals and outward triangles on every side',()=>{
 const m=roundedCube();assert.ok(m.positions.length>300);assert.equal(m.normals.length,m.positions.length);
 for(let i=0;i<m.positions.length;i+=3){
  const p=m.positions.slice(i,i+3),n=m.normals.slice(i,i+3);assert.ok(p.every(x=>Math.abs(x)<=.500001));assert.ok(Math.abs(Math.hypot(...n)-1)<1e-6);
 }
 for(let i=0;i<m.indices.length;i+=3){
  const ids=m.indices.slice(i,i+3),p=ids.map(k=>m.positions.slice(k*3,k*3+3));
  const a=p[1].map((v,k)=>v-p[0][k]),b=p[2].map((v,k)=>v-p[0][k]);
  const c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],n=m.normals.slice(ids[0]*3,ids[0]*3+3);
  assert.ok(c.reduce((s,v,k)=>s+v*n[k],0)>0,'inverted/degenerate triangle');
 }
});
test('blast ripples by distance and remains locked until last fragment finishes',()=>{
 assert.ok(blastDelay(8,0,1)<blastDelay(8,0,7));
 const excluded=Array.from({length:64},(_,i)=>i).slice(1);
 assert.ok(blastDuration(8,0,excluded)>=Math.max(...excluded.map(i=>blastDelay(8,0,i)))+.7);
});
test('unlock allows the latest block squeeze and longest shard lifetime to finish',()=>{
 const last=blastDelay(8,0,63);
 // Break squeeze is .08 s; the longest of six fragments lives .67 s.
 assert.ok(blastDuration(8,0,[63])>=last+.08+.67);
});
test('3D shard follows an arc, stays within effect bounds and shrinks away',()=>{
 const p={x:300,y:300,z:12,vx:200,vy:140,vz:200,life:.7};
 const a=sampleShard(p,0,340),b=sampleShard(p,.3,340),c=sampleShard(p,.7,340);
 assert.equal(a.x,300);assert.equal(a.scale,1);assert.ok(b.z>a.z);assert.ok(b.x<=340&&b.y<=340);assert.equal(c.scale,0);
});
