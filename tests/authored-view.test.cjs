const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
test('authored GameRoot contains a reusable 64-cell board and a bounded fragment pool',()=>{
 const data=read('assets/resources/prefabs/GameRoot.prefab');
 const nodes=data.filter(o=>o.__type__==='cc.Node');
 assert.equal(nodes.filter(n=>/^Cell_\d\d$/.test(n._name)).length,64);
 assert.equal(nodes.filter(n=>/^ModelTile_\d\d$/.test(n._name)).length,64);
 assert.equal(nodes.filter(n=>/^Fragment_\d\d$/.test(n._name)).length,32);
 const game=data.find(o=>o.cellViews);assert.equal(game.cellViews.length,64);
 assert.equal(game.heartSprites.length,3);
 assert.ok(data[game.companion.__id__].idle.__uuid__);
 assert.ok(data[game.modalMascot.__id__].happy.__uuid__);
 assert.equal(data[game.effects.__id__].particleSprites.length,128);
 assert.equal(data[game.effects.__id__].particleFrames.length,3);
 const modal=data[game.modalRoot.__id__];
 assert.ok(!modal._components.some(ref=>data[ref.__id__].__type__==='cc.Sprite'&&data[ref.__id__]._color.a<255),'dimmer must not cascade opacity into the result card');
 assert.equal(data[game.boardModel.__id__].tileNodes.length,64);
 assert.equal(data[game.boardModel.__id__].fragmentNodes.length,32);
 assert.equal(data[game.boardModel.__id__].paletteFlatMaterials.length,data[game.boardModel.__id__].paletteHexes.length,'unlit reveal colors must ship with every palette');
 for(const key of ['board','levelLabel','catsLabel','heartsLabel','hintButton','colorButton','retryButton','modalRoot','modalTitle','modalDescription','modalConfirmButton'])assert.ok(data[game[key].__id__],key);
 const camera=data.find(o=>o.__type__==='cc.Camera');
 const image=data[game.boardImage.__id__];assert.equal(image.__type__,'cc.Sprite');
 assert.equal(image._spriteFrame.__uuid__,camera._targetTexture.__uuid__+'@f9941');
});
test('authored hierarchy has valid node parents and internal serialized references',()=>{
 const data=read('assets/resources/prefabs/GameRoot.prefab');
 function walk(o){if(!o||typeof o!=='object')return;if(Object.hasOwn(o,'__id__'))assert.ok(data[o.__id__],'dangling ref '+o.__id__);else for(const v of Object.values(o))walk(v);}
 data.forEach(walk);
 data.forEach((o,i)=>{if(o.__type__==='cc.Node')for(const child of o._children)assert.equal(data[child.__id__]._parent.__id__,i);});
 const scene=read('assets/scenes/MeowPop.scene'),rootMeta=read('assets/resources/prefabs/GameRoot.prefab.meta');
 assert.ok(scene.some(o=>o.__type__==='cc.PrefabInfo'&&o.asset?.__uuid__===rootMeta.uuid));
 const sceneRoot=scene.find(o=>o.__type__==='cc.Scene');
 const roots=scene[sceneRoot._prefab?.__id__]?.nestedPrefabInstanceRoots;
 assert.ok(roots?.some(ref=>scene[ref.__id__]?._prefab),'scene expansion must visit the linked GameRoot');
});
