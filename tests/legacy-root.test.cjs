const {test}=require('node:test');const assert=require('node:assert/strict');
test('legacy replacement retires old board camera and geometry but preserves the Canvas screen camera',()=>{
 const {retireLegacyChildren}=require('../assets/scripts/view/LegacyRoot.ts');
 const screenCamera={active:true},boardCamera={active:true},geometry={active:true},oldUi={active:true};
 retireLegacyChildren([screenCamera,boardCamera,geometry,oldUi],screenCamera);
 assert.equal(screenCamera.active,true);assert.equal(boardCamera.active,false);assert.equal(geometry.active,false);assert.equal(oldUi.active,false);
 const oldBoard={active:true};retireLegacyChildren([oldBoard]);assert.equal(oldBoard.active,false);
});
