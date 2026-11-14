const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('blocker overlays retain locks until their wave reveal and disappear from finished pictures',()=>{
 const {blockerAppearance}=require('../assets/scripts/view/CellAppearance.ts');
 const lock={type:'lock',index:0,unlockAfter:2},stone={type:'stone',index:1};
 assert.equal(blockerAppearance(lock,'unknown',0,false,true),'lock');
 assert.equal(blockerAppearance(lock,'unknown',2,false,true),'none');
 assert.equal(blockerAppearance(lock,'excluded',1,false,false),'lock');
 assert.equal(blockerAppearance(lock,'excluded',2,false,false),'lock','same find reaching threshold must still wait for the wave');
 assert.equal(blockerAppearance(lock,'excluded',3,false,false),'none','an already open lock must not reappear');
 assert.equal(blockerAppearance(lock,'excluded',1,false,true),'none');
 assert.equal(blockerAppearance(stone,'unknown',8,true,true),'none');
 assert.equal(blockerAppearance(stone,'unknown',1,false,true),'stone');
});
test('authored cells and result thumbnail have all blocker and picture bindings',()=>{
 const data=JSON.parse(fs.readFileSync('assets/resources/prefabs/GameRoot.prefab'));
 const game=data.find(o=>o.cellViews);
 for(const ref of game.cellViews){const cell=data[ref.__id__];for(const key of ['stoneIcon','lockIcon','lockCount'])assert.ok(data[cell[key]?.__id__],key);}
 assert.ok(data[game.pictureThumbnail?.__id__]);
 assert.equal(game.thumbnailPixels.length,64);
 for(const ref of game.thumbnailPixels)assert.equal(data[ref.__id__].__type__,'cc.Sprite');
});
