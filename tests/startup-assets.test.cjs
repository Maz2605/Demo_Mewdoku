const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const {DEFAULT_MATERIAL_UUID,DEFAULT_MATERIAL_PATH,DEFAULT_GAME_PREFAB_UUID}=require('../assets/scripts/core/DefaultAssets.ts');
test('Preview fallback resolves the same material UUID as the packaged resource and scene override',()=>{
 const path='assets/resources/'+DEFAULT_MATERIAL_PATH+'.mtl';
 const meta=JSON.parse(fs.readFileSync(path+'.meta','utf8'));
 assert.equal(meta.uuid,DEFAULT_MATERIAL_UUID);
 const material=JSON.parse(fs.readFileSync(path,'utf8'));
 assert.equal(material.__type__,'cc.Material');
 assert.equal(material._effectAsset.__uuid__,'c8f66d17-351a-48da-a12c-0212d28575c4');
 const scene=JSON.parse(fs.readFileSync('assets/scenes/MeowPop.scene','utf8'));
 const rootMeta=JSON.parse(fs.readFileSync('assets/resources/prefabs/GameRoot.prefab.meta','utf8'));
 assert.equal(rootMeta.uuid,DEFAULT_GAME_PREFAB_UUID);
 assert.ok(scene.some(c=>c.__type__==='cc.PrefabInfo'&&c.asset?.__uuid__===DEFAULT_GAME_PREFAB_UUID));
});
