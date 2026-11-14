const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');

test('gallery cards stay inside the panel and preserve usable targets in portrait and landscape',()=>{
 const {galleryLayout,outroLayout}=require('../assets/scripts/core/Gallery.ts');
 const {computeLayout}=require('../assets/scripts/core/Layout.ts');
 for(const [cw,ch]of [[360,480],[360,640],[390,844],[640,360],[844,390],[1280,720]]){
  const ratio=cw/ch,w=ratio>1?900*ratio:720,h=ratio>1?900:720/ratio,s=cw/w;
  const g=galleryLayout(w,h,20),o=outroLayout(w,h);
  const main=computeLayout(w,h);
  assert.ok(main.galleryY+main.galleryHeight/2<=h/2-10,'choose-picture header button must not clip');
  assert.ok(main.galleryHeight*s>=44);
  assert.equal(g.items.length,20);
  for(const item of g.items){
   assert.ok(item.width*s>=44&&item.height*s>=44,`${cw}x${ch} target`);
   assert.ok(Math.abs(item.x)+item.width/2<=g.width/2-12);
   assert.ok(item.y+item.height/2<=g.headerBottom);
   assert.ok(item.y-item.height/2>=-g.height/2+30);
  }
  assert.ok(g.closeSize*s>=44);
  assert.ok(g.labelFontSize*s>=12,'picture names need readable text at mobile sizes');
  assert.ok(o.imageSize*s>=Math.min(cw,ch)*.52,'picture must be the main element');
  assert.ok(o.buttonHeight*s>=44);
  assert.ok(Math.abs(o.pictureX)+o.imageSize/2+16<=w/2);
  assert.ok(Math.abs(o.pictureY)+o.imageSize/2+16<=h/2);
  if(!o.landscape){
   assert.ok(o.actionsY+o.buttonHeight/2<o.pictureY-o.imageSize/2-20,'actions must sit below the frame');
   assert.ok(Math.abs(o.actionsY)+o.buttonHeight/2<=h/2-12);
   assert.ok(o.titleY+30<=h/2-12);
  }
 }
});

test('outro clock exposes actions after reveal, can settle on resize and resets on retry',()=>{
 const {OutroClock}=require('../assets/scripts/core/Gallery.ts');const clock=new OutroClock();
 clock.start();assert.equal(clock.ready,false);clock.tick(.5);assert.equal(clock.ready,false);
 clock.tick(.5);assert.equal(clock.ready,true);clock.start();assert.equal(clock.ready,false);
 clock.settle();assert.equal(clock.ready,true);clock.reset();assert.equal(clock.active,false);
 assert.equal(clock.progress,0);
});

test('menu and outro are authored with a complete twenty-picture catalog and blocked backdrops',()=>{
 const data=JSON.parse(fs.readFileSync('assets/resources/prefabs/GameRoot.prefab'));
 const game=data.find(o=>o.cellViews),gallery=data[game.gallery?.__id__];assert.ok(gallery,'gallery binding');
 assert.equal(gallery.tiles.length,20);assert.equal(gallery.pictureFrames.length,20);
 assert.equal(new Set(gallery.pictureFrames.map(f=>f.__uuid__)).size,20);
 for(const key of ['menuRoot','menuCard','outroRoot','picture','pictureFrame','actions','nextButton','chooseButton'])assert.ok(data[gallery[key]?.__id__],key);
 for(const root of [gallery.menuRoot,gallery.outroRoot]){
  const node=data[root.__id__];assert.ok(node._components.some(ref=>data[ref.__id__].__type__==='cc.BlockInputEvents'));
 }
 assert.ok(data[game.galleryButton?.__id__]);
 for(const ref of gallery.tiles){const button=data[ref.__id__];assert.equal(button.clickEvents.length,1);assert.equal(button.clickEvents[0].handler,'onTile');}
 for(const ref of gallery.tileLabels){const ink=data[ref.__id__]._color;assert.ok(ink.r<120&&ink.g<120,'picture titles need dark ink on cream cards');}
});

test('gallery/outro image assets preserve every source pixel and use nearest texture sampling',async()=>{
 const path=require('node:path'),os=require('node:os');
 const sharp=require(process.env.MEOW_SHARP||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
 const {LEVELS}=require('../assets/scripts/core/Levels.ts');
 for(const level of LEVELS){
  const file=`assets/art/pictures/${level.id}.png`;
  const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,level.size*32);assert.equal(info.height,info.width);
  for(let i=0;i<level.cells.length;i++){
   const offset=((Math.floor(i/level.size)*32+16)*info.width+(i%level.size*32+16))*info.channels;
   const actual='#'+Array.from(data.subarray(offset,offset+3)).map(v=>v.toString(16).padStart(2,'0')).join('');
   assert.equal(actual.toUpperCase(),level.palette[level.cells[i]].toUpperCase(),level.id+' pixel '+i);
  }
  const meta=JSON.parse(fs.readFileSync(file+'.meta'));
  assert.equal(meta.subMetas['6c48a'].userData.magfilter,'nearest');
 }
});
