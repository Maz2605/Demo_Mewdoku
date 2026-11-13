const {test}=require('node:test');const assert=require('node:assert/strict');
const {roundedCube}=require('../assets/scripts/view/ModelGeometry.ts');
test('crowned block has actual front curvature and valid transformed normals',()=>{
 const mesh=roundedCube(.18,.12);
 let maxZ=-Infinity,hasSlope=false;
 for(let i=0;i<mesh.positions.length;i+=3){
  const [x,y,z]=mesh.positions.slice(i,i+3),[nx,ny,nz]=mesh.normals.slice(i,i+3);
  maxZ=Math.max(maxZ,z);assert.ok(Math.abs(x)<=.50001&&Math.abs(y)<=.50001);
  assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<1e-6);
  if(z>.5&&Math.abs(x)>.1&&nz>.8&&Math.abs(nx)>.01)hasSlope=true;
 }
 assert.ok(maxZ>.60&&maxZ<=.621,'front must be domed rather than a flat slab');
 assert.ok(hasSlope,'curved front needs sloped lighting normals');
});
test('exploded cells retain a clean color only after their own reveal',()=>{
 const {cellAppearance}=require('../assets/scripts/view/CellAppearance.ts');
 assert.deepEqual(cellAppearance('excluded',false,false,true),{flat:true,mark:false,cat:false,symbol:false});
 assert.equal(cellAppearance('excluded',false,false,false).flat,false,'deferred wave must not cover still-visible 3D tiles');
 assert.equal(cellAppearance('marked',false,false,true).mark,true);
 assert.deepEqual(cellAppearance('found',true,false,true),{flat:true,mark:false,cat:false,symbol:false});
 assert.equal(cellAppearance('found',false,true,true).cat,false);
 assert.equal(cellAppearance('excluded',false,true,true).symbol,true);
});
