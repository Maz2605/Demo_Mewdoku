// Editable glTF copies of the exact procedural geometry used by Board3D.
const fs=require('node:fs');
const ts=require('C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
const {roundedCube}=require('../assets/scripts/view/ModelGeometry.ts');
fs.mkdirSync('assets/models',{recursive:true});
for(const [name,radius,scale,rgba] of [['RoundedBlock',.12,[1,1,.4],[1,.68,.25,1]],['BevelledTray',.035,[8,8,.6],[.65,.48,.75,1]],['ColorPlane',0,[1,1,1],[1,1,1,1]]]){
 const m=name==='ColorPlane'?{positions:[-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],normals:[0,0,1,0,0,1,0,0,1,0,0,1],indices:[0,1,2,0,2,3]}:roundedCube(name==='RoundedBlock'?.18:radius,name==='RoundedBlock'?.12:0),buffers=[Buffer.from(new Float32Array(m.positions).buffer),Buffer.from(new Float32Array(m.normals).buffer),Buffer.from(new Uint16Array(m.indices).buffer)];
 const binary=Buffer.concat(buffers);let offset=0;
 const gltf={asset:{version:'2.0',generator:'Meow Pop procedural models'},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0,scale}],
  meshes:[{name,primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0}]}],materials:[{name:'GlossyToy',pbrMetallicRoughness:{baseColorFactor:rgba,roughnessFactor:.36,metallicFactor:0}}],
  buffers:[{byteLength:binary.length,uri:'data:application/octet-stream;base64,'+binary.toString('base64')}],
  bufferViews:buffers.map((b,i)=>{const v={buffer:0,byteOffset:offset,byteLength:b.length,target:i===2?34963:34962};offset+=b.length;return v;}),
  accessors:[{bufferView:0,componentType:5126,count:m.positions.length/3,type:'VEC3',min:[-.5,-.5,name==='ColorPlane'?0:-.5],max:[.5,.5,name==='RoundedBlock'?.62:name==='ColorPlane'?0:.5]},
   {bufferView:1,componentType:5126,count:m.normals.length/3,type:'VEC3'},
   {bufferView:2,componentType:5123,count:m.indices.length,type:'SCALAR'}]};
 fs.writeFileSync('assets/models/'+name+'.gltf',JSON.stringify(gltf));console.log(name+': '+m.positions.length/3+' vertices, '+m.indices.length/3+' triangles');
}
