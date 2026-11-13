const {test}=require('node:test');const assert=require('node:assert/strict');
const {blastDuration,blastDelay}=require('../assets/scripts/view/Motion.ts');
test('unlock waits for sprite puffs emitted at the end of the farthest tile wave',()=>{
 const last=blastDelay(8,0,63)+.08+.78;
 assert.ok(blastDuration(8,0,[63])>=last);
});
