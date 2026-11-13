// OFFLINE authoring command. Scene/prefabs are checked in as assets; gameplay never runs this.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
// Run skin-assets.cjs first. Never replace generated production artwork here.
const ts=require('C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
const {LEVELS}=require('../assets/scripts/core/Levels.ts');
const BASE='C:/ProgramData/cocos/editors/Creator/3.8.4/resources/resources/3d/engine/editor/assets';
const ROOT_UUID='b750dc32-102d-4a36-bb87-8de9416765ef';
const RT_UUID='79b43a41-1ca9-4fc9-9998-c4cece310401';
const UI=33554432,MODEL=1<<19;
const clone=o=>JSON.parse(JSON.stringify(o)),id=i=>({__id__:i}),asset=(uuid,type)=>({__uuid__:uuid,...(type?{__expectedType__:type}:{})});
const uuid=name=>{const h=crypto.createHash('sha256').update('meow-authored:'+name).digest('hex').slice(0,32);return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;};
function write(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');}
function meta(file,importer,ver,chosen){if(fs.existsSync(file+'.meta'))return JSON.parse(fs.readFileSync(file+'.meta')).uuid;const u=chosen||uuid(file);write(file+'.meta',{ver,importer,imported:true,uuid:u,files:['scene','prefab','material','render-texture'].includes(importer)?['.json']:[],subMetas:{},userData:{}});return u;}
function compress(value){const h=value.replace(/-/g,'');let out=h.slice(0,5),chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';for(let i=5;i<32;i+=3){const v=parseInt(h.slice(i,i+3),16);out+=chars[v>>6]+chars[v&63];}return out;}
const vec=(x=0,y=0,z=0)=>({__type__:'cc.Vec3',x,y,z}),size=(w,h)=>({__type__:'cc.Size',width:w,height:h});
function color(hex,a=255){return {__type__:'cc.Color',r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16),a};}
function quat(x=0,y=0,z=0){const d=Math.PI/360,sx=Math.sin(x*d),cx=Math.cos(x*d),sy=Math.sin(y*d),cy=Math.cos(y*d),sz=Math.sin(z*d),cz=Math.cos(z*d);return {__type__:'cc.Quat',x:sx*cy*cz+cx*sy*sz,y:cx*sy*cz-sx*cy*sz,z:cx*cy*sz-sx*sy*cz,w:cx*cy*cz+sx*sy*sz};}
for(const dir of ['assets/resources/prefabs','assets/resources/render','assets/prefabs','assets/materials/palette'])fs.mkdirSync(dir,{recursive:true});
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory()){meta(f,'directory','1.2.0');walk(f);}else if(f.endsWith('.ts'))meta(f,'typescript','4.0.24');}}walk('assets');
const script=name=>compress(JSON.parse(fs.readFileSync('assets/scripts/'+name+'.ts.meta')).uuid);
const types={game:script('MeowGame'),cell:script('view/PixelCell'),board:script('view/Board3D'),fx:script('view/GameEffects'),mascot:script('view/MascotView')};
const fonts={title:meta('assets/art/fonts/Nunito-ExtraBold.ttf','ttf-font','1.0.1'),body:meta('assets/art/fonts/Nunito-SemiBold.ttf','ttf-font','1.0.1')};
const labelTemplate=JSON.parse(fs.readFileSync(BASE+'/default_prefab/ui/Label.prefab')).find(o=>o.__type__==='cc.Label');
const spriteTemplate=JSON.parse(fs.readFileSync(BASE+'/default_prefab/ui/Sprite.prefab')).find(o=>o.__type__==='cc.Sprite');
const buttonTemplate=JSON.parse(fs.readFileSync(BASE+'/default_prefab/ui/Button.prefab')).find(o=>o.__type__==='cc.Button');
const canvasTemplate=JSON.parse(fs.readFileSync(BASE+'/default_prefab/ui/Canvas.prefab'));
const rtTemplate=JSON.parse(fs.readFileSync(BASE+'/default_file_content/render-texture/default.rt.meta'));
function imageFrame(name,border=0,file='assets/art/ui/'+name+'.png'){
 const u=meta(file,'image','1.0.27'),buf=fs.readFileSync(file),w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);
 const sub=(importer,suffix,ver,data)=>({importer,uuid:u+'@'+suffix,displayName:name,id:suffix,name:importer==='texture'?'texture':'spriteFrame',userData:data,ver,imported:true,files:['.json'],subMetas:{}});
 write(file+'.meta',{ver:'1.0.27',importer:'image',imported:true,uuid:u,files:['.json','.png'],subMetas:{
 '6c48a':sub('texture','6c48a','1.0.22',{wrapModeS:'clamp-to-edge',wrapModeT:'clamp-to-edge',minfilter:'linear',magfilter:'linear',mipfilter:'none',anisotropy:0,isUuid:true,imageUuidOrDatabaseUri:u,visible:false}),
 'f9941':sub('sprite-frame','f9941','1.0.12',{trimType:'none',trimThreshold:1,rotated:false,offsetX:0,offsetY:0,trimX:0,trimY:0,width:w,height:h,rawWidth:w,rawHeight:h,borderTop:border,borderBottom:border,borderLeft:border,borderRight:border,packable:true,pixelsToUnit:100,pivotX:.5,pivotY:.5,meshType:0,isUuid:true,imageUuidOrDatabaseUri:u+'@6c48a',atlasUuid:''})},userData:{hasAlpha:true,type:'sprite-frame',fixAlphaTransparencyArtifacts:false,redirect:u+'@6c48a'}});
 return u+'@f9941';
}
const frames={panel:imageFrame('panel',30),flat:imageFrame('flat'),outline:imageFrame('outline',26),ring:imageFrame('ring'),cat:imageFrame('cat-token',0,'assets/art/cat-token.png')};
for(const n of ['button-purple','button-gold','sky','cloud','paw','heart','heart-empty','hint','inspect','retry','star','puff','ray','confetti','glow','shadow','mark','dot'])frames[n]=imageFrame(n,n.startsWith('button')?30:0);
frames.logo=imageFrame('logo',0,'assets/art/logo-skin.png');
for(const n of ['idle','happy','surprised'])frames[n]=imageFrame(n,0,`assets/art/mascot-${n}-skin.png`);
write('assets/resources/render/Board.rt',{__type__:'cc.RenderTexture',_objFlags:0,_native:'',content:{base:'2,2,0,0,0,0',w:1024,h:1024,n:'Board'}});
const rtMeta=clone(rtTemplate);rtMeta.uuid=RT_UUID;rtMeta.userData={...rtMeta.userData,width:1024,height:1024,redirect:RT_UUID+'@f9941',wrapModeS:'clamp-to-edge',wrapModeT:'clamp-to-edge'};
rtMeta.subMetas.f9941.uuid=RT_UUID+'@f9941';rtMeta.subMetas.f9941.displayName='Board';rtMeta.subMetas.f9941.userData={imageUuidOrDatabaseUri:RT_UUID,width:1024,height:1024};write('assets/resources/render/Board.rt.meta',rtMeta);
const materialBase=JSON.parse(fs.readFileSync('assets/resources/materials/GlossyBlock.mtl'));
const palette=[...new Set([...LEVELS.flatMap(l=>l.palette),'#FFF8EE','#D8B5FA','#9E78BB'])],materialMap={},flatMaterialMap={};
for(const hex of [...palette,'#A77AC0','#654E83']){
 const file='assets/materials/palette/Color_'+hex.slice(1)+'.mtl',m=clone(materialBase);m._name='Color_'+hex.slice(1);m._props[0].mainColor=color(hex);write(file,m);materialMap[hex]=meta(file,'material','1.0.21');
 const flatFile='assets/materials/palette/Flat_'+hex.slice(1)+'.mtl',flat=clone(materialBase);flat._name='Flat_'+hex.slice(1);flat._effectAsset=asset('a3cd009f-0ab0-420d-9278-b9fdab939bbc');flat._props=[{mainColor:color(hex)}];write(flatFile,flat);flatMaterialMap[hex]=meta(flatFile,'material','1.0.21');
}
const gltfMesh=file=>{const m=JSON.parse(fs.readFileSync(file+'.meta'));return Object.values(m.subMetas).find(s=>s.importer==='gltf-mesh').uuid;};
const meshes={cube:gltfMesh('assets/models/RoundedBlock.gltf'),tray:gltfMesh('assets/models/BevelledTray.gltf'),plane:gltfMesh('assets/models/ColorPlane.gltf')};
write('assets/art/ui/Ui.pac',{__type__:'cc.SpriteAtlas'});
const atlasMeta=JSON.parse(fs.readFileSync(BASE+'/default_file_content/auto-atlas/default.pac.meta'));
atlasMeta.uuid=meta('assets/art/ui/Ui.pac','auto-atlas','1.0.8');
Object.assign(atlasMeta.userData,{maxWidth:2048,maxHeight:2048,allowRotation:false});write('assets/art/ui/Ui.pac.meta',atlasMeta);
class Graph{
 constructor(name,file,chosen){this.file=file;this.uuid=meta(file,'prefab','1.1.50',chosen);this.a=[{__type__:'cc.Prefab',_name:name,_objFlags:0,_native:'',data:id(1),optimizationPolicy:0,persistent:false}];this.paths={};}
 add(o){this.a.push(o);return this.a.length-1;}
 node(name,parent=null,options={}){
  const i=this.add({__type__:'cc.Node',_name:name,_objFlags:0,__editorExtras__:{},_parent:parent===null?null:id(parent),_children:[],_active:options.active??true,_components:[],_prefab:null,_lpos:vec(...(options.pos||[0,0,0])),_lrot:quat(...(options.rot||[0,0,0])),_lscale:vec(...(options.scale||[1,1,1])),_mobility:0,_layer:options.layer??UI,_euler:vec(...(options.rot||[0,0,0])),_id:''});
  this.paths[i]=(parent===null?'':this.paths[parent]+'/')+name;if(parent!==null)this.a[parent]._children.push(id(i));
  if(options.width!==undefined)this.comp('cc.UITransform',i,{_contentSize:size(options.width,options.height??options.width),_anchorPoint:{__type__:'cc.Vec2',x:.5,y:.5}});return i;
 }
 comp(type,n,props={}){const i=this.add({_name:'',_objFlags:0,__editorExtras__:{},_enabled:true,_id:'',...props,__type__:type,node:id(n),__prefab:null});this.a[n]._components.push(id(i));return i;}
 sprite(n,frame,hex='#FFFFFF',sliced=false,a=255){const d=clone(spriteTemplate);delete d.__prefab;return this.comp('cc.Sprite',n,{...d,node:id(n),_spriteFrame:asset(frame,'cc.SpriteFrame'),_sizeMode:0,_type:sliced?1:0,_color:color(hex,a)});}
 label(name,parent,value,font=26,w=650,h=50,hex='#44305F',pos=[0,0,0]){const n=this.node(name,parent,{width:w,height:h,pos}),d=clone(labelTemplate);delete d.__prefab;const c=this.comp('cc.Label',n,{...d,node:id(n),_string:value,_fontSize:font,_actualFontSize:font,_lineHeight:font*1.22,_overflow:2,_isBold:false,_useSystemFont:false,_font:asset(fonts[font>=28?'title':'body'],'cc.TTFFont'),_color:color(hex)});return {n,c};}
 button(name,parent,value,w=194,hex='#FFFFFF',handler=null,target=null){const n=this.node(name,parent,{width:w,height:92});this.sprite(n,frames[name==='Confirm'||name==='Hint'?'button-gold':'button-purple'],'#FFFFFF',true);const l=this.label('Label',n,value,28,w-12,50,name==='Confirm'||name==='Hint'?'#663915':'#FFFFFF');const d=clone(buttonTemplate);delete d.__prefab;d._target=id(n);d._transition=3;d._zoomScale=.96;d.clickEvents=handler?[{__type__:'cc.ClickEvent',target:id(target),component:'MeowGame',_componentId:types.game,handler,customEventData:''}]:[];for(const k of ['_normalSprite','_hoverSprite','_pressedSprite','_disabledSprite'])d[k]=null;const c=this.comp('cc.Button',n,{...d,node:id(n)});return {n,c,label:l.c};}
 art(name,parent,frame,w,h=w,pos=[0,0,0],hex='#FFFFFF'){const n=this.node(name,parent,{width:w,height:h,pos});const c=this.sprite(n,frame,hex);return {n,c};}
 mascot(name,parent,w,pos){const v=this.art(name,parent,frames.idle,w,w,pos);const c=this.comp(types.mascot,v.n,{image:id(v.c),idle:asset(frames.idle,'cc.SpriteFrame'),happy:asset(frames.happy,'cc.SpriteFrame'),surprised:asset(frames.surprised,'cc.SpriteFrame')});return {n:v.n,c};}
 mesh(n,mesh,material){return this.comp('cc.MeshRenderer',n,{_materials:[asset(material,'cc.Material')],_mesh:asset(mesh,'cc.Mesh'),_shadowCastingMode:0,_receiveShadow:false});}
 cell(name,parent,width=166,active=true){
  const n=this.node(name,parent,{width,height:width,active}),pixel=this.node('Pixel',n,{width,height:width,active:false}),pixelSprite=this.sprite(pixel,frames.flat);
  const marker=this.label('Mark',n,'',28,width,width),mark=this.art('MarkSprite',n,frames.mark,width*.55),head=this.node('Cat',n,{width:width*.72,height:width*.72,active:false});this.sprite(head,frames.cat);this.a[mark.n]._active=false;
  const outline=this.node('Outline',n,{width:width-4,height:width-4,active:false}),outlineSprite=this.sprite(outline,frames.outline,'#FFFFFF',true);
  const ring=this.node('HoldRing',n,{width:width*.82,height:width*.82}),ringSprite=this.sprite(ring,frames.ring);Object.assign(this.a[ringSprite],{_type:3,_fillType:2,_fillCenter:{__type__:'cc.Vec2',x:.5,y:.5},_fillRange:0,_fillStart:.25});
  const c=this.comp(types.cell,n,{pixel:id(pixelSprite),marker:id(marker.c),markSprite:id(mark.c),catNode:id(head),outline:id(outlineSprite),holdRing:id(ringSprite)});return {n,c};
 }
 tile(name,parent,c=166,hex=0,x=0,y=0,active=true){const n=this.node(name,parent,{layer:MODEL,active}),base=this.node('Base',n,{layer:MODEL,pos:[x,y,-5],scale:[c,c,1]}),cap=this.node('Cap',n,{layer:MODEL,pos:[x,y,c*.16],scale:[c*.90,c*.90,c*.42],rot:[-7,-7,0]});this.mesh(base,meshes.plane,materialMap[LEVELS[0].palette[hex]]);this.mesh(cap,meshes.cube,materialMap[LEVELS[0].palette[hex]]);return n;}
 seal(){const objects=this.a.slice();objects.forEach((o,i)=>{if(o.__type__==='cc.Node'){const p=this.add({__type__:'cc.PrefabInfo',root:id(1),asset:id(0),fileId:compress(uuid(this.paths[i]))});o._prefab=id(p);o._id=uuid(this.paths[i]);}else if(o.node){o.__prefab=id(this.add({__type__:'cc.CompPrefabInfo',fileId:compress(uuid(this.paths[o.node.__id__]+'/'+o.__type__+'/'+i))}));}});write(this.file,this.a);}
}
const cellPrefab=new Graph('PixelCell','assets/prefabs/PixelCell.prefab');cellPrefab.cell('PixelCell',null);cellPrefab.seal();
const tilePrefab=new Graph('BoardTile','assets/prefabs/BoardTile.prefab');tilePrefab.tile('BoardTile',null);tilePrefab.seal();
const fragmentPrefab=new Graph('Fragment','assets/prefabs/Fragment.prefab');const fragRoot=fragmentPrefab.node('Fragment',null,{layer:MODEL});fragmentPrefab.mesh(fragRoot,meshes.cube,materialMap[palette[0]]);fragmentPrefab.seal();
const buttonPrefab=new Graph('GameButton','assets/prefabs/GameButton.prefab');buttonPrefab.button('GameButton',null,'Button');buttonPrefab.seal();
const g=new Graph('GameRoot','assets/resources/prefabs/GameRoot.prefab',ROOT_UUID),root=g.node('GameRoot',null,{width:720,height:1280});
const bg=g.node('Background',root,{width:720,height:1280});g.sprite(bg,frames.sky);
const cloudLeft=g.art('CloudLeft',root,frames.cloud,340,170,[-320,490,0]),cloudRight=g.art('CloudRight',root,frames.cloud,380,190,[320,-510,0]);
for(let i=0;i<8;i++){const p=g.art('Paw_'+i,root,frames.paw,35+(i%3)*12,35+(i%3)*12,[(i%2?1:-1)*310,450-i*130,0]);g.a[p.c]._color=color('#FFFFFF',55);g.a[p.n]._euler.z=(i%2?20:-20);}
const logo=g.art('Logo',root,frames.logo,350,120,[0,568,0]);
const brand=g.label('Brand',root,'',27,1,1);g.a[brand.n]._active=false;
const level=g.label('Level',root,'Màn 1 · Cá nhỏ',26,440,42,'#44305F',[0,510,0]);
const sizeBadge=g.label('SizeBadge',root,'4 × 4',24,100,40,'#7939CB',[280,510,0]);
const status=g.node('Status',root,{width:620,height:64,pos:[0,456,0]});g.sprite(status,frames.panel,'#FFFFFF',true);
g.art('CatIcon',status,frames.cat,50,50,[-230,2,0]);
const cats=g.label('Cats',status,'0 / 4',28,160,50,'#44305F',[-120,0,0]),hearts=g.label('Hearts',status,'',28,1,1);
const heartSprites=[];for(let i=0;i<3;i++)heartSprites.push(id(g.art('Heart_'+i,status,frames.heart,42,42,[120+i*54,0,0]).c));
const companion=g.mascot('MascotCompanion',root,130,[270,550,0]);
const board=g.node('Board',root,{width:664,height:664,pos:[0,8,0]});g.art('ContactShadow',board,frames.shadow,760,800,[0,-26,0]);const picture=g.node('BoardImage',board,{width:764,height:764});const image=g.sprite(picture,RT_UUID+'@f9941');
const cellPool=g.node('CellPool',board,{width:664,height:664}),cellViews=[];
for(let i=0;i<64;i++){const v=g.cell('Cell_'+String(i).padStart(2,'0'),cellPool,166,i<16);if(i<16){g.a[v.n]._lpos=vec(-332+(i%4+.5)*166,332-(Math.floor(i/4)+.5)*166,0);g.a[g.a[v.c].pixel.__id__]._color=color(LEVELS[0].palette[LEVELS[0].cells[i]]);}cellViews.push(id(v.c));}
const fxRoot=g.node('BlastEffects',board,{width:664,height:664,active:false}),arms=[];
g.comp('cc.UIOpacity',fxRoot,{_opacity:255});
for(let i=0;i<4;i++){const arm=g.node('Arm_'+i,fxRoot,{width:332,height:18,rot:[0,0,i*90]});const tr=g.a[g.a[arm]._components[0].__id__];tr._anchorPoint.x=0;g.sprite(arm,frames.ray);arms.push(id(arm));}
const particleSprites=[];for(let i=0;i<128;i++){const p=g.art('Particle_'+i,fxRoot,frames.star,24);g.a[p.n]._active=false;g.comp('cc.UIOpacity',p.n,{_opacity:255});particleSprites.push(id(p.c));}
const fx=g.comp(types.fx,fxRoot,{arms,particleSprites,particleFrames:['star','puff','confetti'].map(n=>asset(frames[n],'cc.SpriteFrame'))});
const hint=g.button('Hint',root,'Gợi ý · 2',194,'#7C6ABB','onHint',root),inspect=g.button('Inspect',root,'Xem màu',194,'#4F9F92','onInspect',root),retry=g.button('Retry',root,'Chơi lại',194,'#D68B63','onRetry',root);
[hint,inspect,retry].forEach((b,i)=>g.a[b.n]._lpos=vec((i-1)*210,-422,0));
for(const [b,key] of [[hint,'hint'],[inspect,'inspect'],[retry,'retry']])g.art('Icon',b.n,frames[key],42,42,[-62,0,0]);
const hintBadge=g.label('HintBadge',hint.n,'2',23,35,35,'#7939CB',[78,30,0]);
const message=g.label('Instruction',root,'Chạm: đánh dấu × · Giữ: tìm mèo',26,650,80,'#44305F',[0,-515,0]);
const modal=g.node('Modal',root,{width:720,height:1280,active:false}),dimmer=g.art('Dimmer',modal,frames.flat,720,1280);g.a[dimmer.c]._color=color('#29243E',185);g.comp('cc.BlockInputEvents',modal,{});
const card=g.node('Card',modal,{width:620,height:740});g.sprite(card,frames.panel,'#FFFFFF',true);g.comp('cc.UIOpacity',card,{_opacity:255});
const modalGlow=g.art('MascotGlow',card,frames.glow,300,300,[0,198,0],'#FFE391');
const modalMascot=g.mascot('ModalMascot',card,240,[0,205,0]);
const modalTitle=g.label('Title',card,'Tìm mèo',40,550,65,'#7939CB',[0,68,0]),description=g.label('Description',card,'Chạm để đánh dấu ×\nGiữ 0,4 giây để tìm mèo',27,540,110,'#44305F',[0,-146,0]);
const rules=g.node('TutorialRules',card,{width:560,height:142,pos:[0,-40,0]});
for(let i=0;i<3;i++){const rc=g.node('Rule_'+i,rules,{width:174,height:142,pos:[(i-1)*184,0,0]});g.sprite(rc,frames.panel,'#F4EAFF',true);
 for(let k=0;k<3;k++)g.art('Cube_'+k,rc,frames.panel,25,25,[(k-1)*29,34,0],i===0?'#FFD447':k===1?'#FFB14C':'#B992EC');
 if(i===2){g.art('CatA',rc,frames.cat,32,32,[-39,36,0]);g.art('CatB',rc,frames.cat,32,32,[39,6,0]);g.art('NoTouch',rc,frames.mark,25,25,[0,26,0]);}else g.art('Cat',rc,frames.cat,38,38,[0,34,0]);
 g.label('RuleText',rc,['1 mèo\nmỗi màu','1 mèo mỗi\nhàng / cột','Mèo không\nchạm nhau'][i],23,158,70,'#44305F',[0,-32,0]);}
const confirm=g.button('Confirm',card,'Bắt đầu',470,'#FFFFFF','onModalConfirm',root);g.a[confirm.n]._lpos=vec(0,-238,0);
const peek=g.label('Peek',card,'Xem tranh',25,400,42,'#7939CB',[0,-302,0]);const peekButton=clone(buttonTemplate);peekButton._target=id(peek.n);peekButton._transition=0;peekButton.clickEvents=[{__type__:'cc.ClickEvent',target:id(root),component:'MeowGame',_componentId:types.game,handler:'onPeek',customEventData:''}];for(const k of ['_normalSprite','_hoverSprite','_pressedSprite','_disabledSprite'])peekButton[k]=null;g.comp('cc.Button',peek.n,peekButton);
const modelRoot=g.node('BoardModels',root,{layer:MODEL,pos:[10000,0,0]});
const tray=g.node('Tray',modelRoot,{layer:MODEL,pos:[0,0,-43],scale:[706,706,56]});g.mesh(tray,meshes.tray,materialMap['#A77AC0']);
const inset=g.node('Inset',modelRoot,{layer:MODEL,pos:[0,0,-13],scale:[672,672,9]});g.mesh(inset,meshes.tray,materialMap['#654E83']);
const modelPool=g.node('TilePool',modelRoot,{layer:MODEL}),tileNodes=[];
for(let i=0;i<64;i++)tileNodes.push(id(g.tile('ModelTile_'+String(i).padStart(2,'0'),modelPool,166,LEVELS[0].cells[i]||0,-332+(i%4+.5)*166,332-(Math.floor(i/4)+.5)*166,i<16)));
const fragmentPool=g.node('FragmentPool',modelRoot,{layer:MODEL}),fragmentNodes=[];
for(let i=0;i<32;i++){const n=g.node('Fragment_'+String(i).padStart(2,'0'),fragmentPool,{layer:MODEL,active:false,scale:[15,15,15]});g.mesh(n,meshes.cube,materialMap[palette[0]]);fragmentNodes.push(id(n));}
const lightNode=g.node('KeyLight',modelRoot,{layer:MODEL,rot:[-28,-32,0]});g.comp('cc.DirectionalLight',lightNode,{_color:color('#FFFFFF'),_useColorTemperature:false,_illuminanceHDR:55250});
const cameraNode=g.node('BoardCamera',modelRoot,{layer:MODEL,pos:[0,0,1200]}),cameraData=clone(canvasTemplate.find(o=>o.__type__==='cc.Camera'));delete cameraData.__prefab;
const camera=g.comp('cc.Camera',cameraNode,{...cameraData,node:id(cameraNode),_priority:-10,_orthoHeight:382,_near:1,_far:3000,_visibility:MODEL,_clearFlags:7,_color:color('#000000',0),_targetTexture:asset(RT_UUID,'cc.RenderTexture')});
const boardModel=g.comp(types.board,modelRoot,{tileNodes,fragmentNodes,paletteHexes:palette,paletteMaterials:palette.map(hex=>asset(materialMap[hex],'cc.Material')),paletteFlatMaterials:palette.map(hex=>asset(flatMaterialMap[hex],'cc.Material')),boardCamera:id(camera),boardImage:id(image),trayNode:id(tray),insetNode:id(inset),maxFragments:32});
g.comp(types.game,root,{background:id(bg),brandLabel:id(brand.c),logo:id(logo.n),cloudLeft:id(cloudLeft.n),cloudRight:id(cloudRight.n),sizeBadge:id(sizeBadge.c),heartSprites,heartFull:asset(frames.heart,'cc.SpriteFrame'),heartEmpty:asset(frames['heart-empty'],'cc.SpriteFrame'),hintBadge:id(hintBadge.c),companion:id(companion.c),modalMascot:id(modalMascot.c),tutorialRules:id(rules),modalGlow:id(modalGlow.n),levelLabel:id(level.c),statusPanel:id(status),catsLabel:id(cats.c),heartsLabel:id(hearts.c),board:id(board),boardImage:id(image),cellViews,boardModel:id(boardModel),effects:id(fx),hintButton:id(hint.c),colorButton:id(inspect.c),retryButton:id(retry.c),hintLabel:id(hint.label),colorLabel:id(inspect.label),messageLabel:id(message.c),modalRoot:id(modal),modalCard:id(card),modalTitle:id(modalTitle.c),modalDescription:id(description.c),modalConfirmButton:id(confirm.c),modalConfirmLabel:id(confirm.label),modalPeek:id(peek.n),bounceStrength:.65});
g.seal();
// The scene owns a normal, Editor-expandable instance of GameRoot. Editing the prefab updates it.
const sceneUuid=JSON.parse(fs.readFileSync('assets/scenes/MeowPop.scene.meta')).uuid;
const s=[{__type__:'cc.SceneAsset',_name:'MeowPop',_objFlags:0,_native:'',scene:id(1)}];
function sceneNode(name,parent,children,components,layer=UI){return {__type__:'cc.Node',_name:name,_objFlags:0,__editorExtras__:{},_parent:parent===null?null:id(parent),_children:children.map(id),_active:true,_components:components.map(id),_prefab:null,_lpos:vec(),_lrot:quat(),_lscale:vec(1,1,1),_layer:layer,_euler:vec(),_id:uuid('scene/'+name)};}
s.push({...sceneNode('MeowPop',null,[2],[],1073741824),__type__:'cc.Scene',_globals:id(10),autoReleaseAssets:false,_id:sceneUuid});
s.push(sceneNode('Canvas',1,[3,7],[4,5,6]));
s.push({...sceneNode('Camera',2,[],[8],1073741824),_lpos:vec(0,0,1000)});
s.push({__type__:'cc.UITransform',node:id(2),_enabled:true,__prefab:null,_contentSize:size(720,1280),_anchorPoint:{__type__:'cc.Vec2',x:.5,y:.5}});
s.push({__type__:'cc.Canvas',node:id(2),_enabled:true,__prefab:null,_cameraComponent:id(8),_alignCanvasWithScreen:true});
const widget=clone(canvasTemplate.find(o=>o.__type__==='cc.Widget'));widget.node=id(2);widget.__prefab=null;s.push(widget);
s.push({...sceneNode('GameRoot',2,[],[]),_prefab:id(9)});
const mainCam=clone(canvasTemplate.find(o=>o.__type__==='cc.Camera'));mainCam.node=id(3);mainCam.__prefab=null;mainCam._clearFlags=7;mainCam._color=color('#F7F3EE');s.push(mainCam);
s.push({__type__:'cc.PrefabInfo',root:id(7),asset:asset(ROOT_UUID,'cc.Prefab'),fileId:g.a[g.a[1]._prefab.__id__].fileId,instance:id(11)});
s.push({__type__:'cc.SceneGlobals'});s.push({__type__:'cc.PrefabInstance',fileId:compress(uuid('scene/GameRootInstance')),prefabRootNode:null,mountedChildren:[],mountedComponents:[],propertyOverrides:[],removedComponents:[]});
s[1]._prefab=id(s.length);s.push({__type__:'cc.PrefabInfo',root:null,asset:null,fileId:'',instance:null,nestedPrefabInstanceRoots:[id(7)]});
s[10].ambient=id(s.length);
const neutral=(v)=>({__type__:'cc.Vec4',x:v,y:v,z:v,w:1});
s.push({__type__:'cc.AmbientInfo',_skyColorHDR:neutral(.8),_skyIllumHDR:20000,_groundAlbedoHDR:neutral(.3),_skyColorLDR:neutral(.8),_skyIllumLDR:.8,_groundAlbedoLDR:neutral(.3)});
write('assets/scenes/MeowPop.scene',s);walk('assets');console.log('Authored GameRoot: 64 UI cells, 64 model tiles, 32 fragments, fixed UI/modal/camera/light/RenderTexture.');
