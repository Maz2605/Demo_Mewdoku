const {test}=require('node:test');const assert=require('node:assert/strict');
const {HoldInput}=require('../assets/scripts/core/HoldInput.ts');
const {computeLayout}=require('../assets/scripts/core/Layout.ts');
test('tap marks, hold finds once and release after hold does not tap',()=>{
 const h=new HoldInput();h.begin(1,7,0,0,true);assert.deepEqual(h.end(1),{type:'mark',index:7});
 h.begin(1,7,0,0,true);assert.equal(h.tick(.39),null);assert.deepEqual(h.tick(.01),{type:'find',index:7});assert.equal(h.tick(1),null);assert.equal(h.end(1),null);
});
test('move threshold, cancel, secondary pointer and marked holds never create unintended finds',()=>{
 const h=new HoldInput();h.begin(1,7,0,0,true);h.begin(2,8,0,0,true);assert.equal(h.end(2),null);
 h.move(1,13,0);assert.equal(h.tick(1),null);assert.equal(h.end(1),null);
 h.begin(1,7,0,0,true);h.cancel();assert.equal(h.end(1),null);
 h.begin(1,7,0,0,false);assert.equal(h.tick(1),null);assert.equal(h.end(1),null);
});
test('8x8 board has 36 CSS px targets at 360x640 and clears portrait controls',()=>{
 const l=computeLayout(720,1280);assert.ok(l.boardSize/8/2>=36);
 assert.ok(l.buttonsY+40<l.boardY-l.boardSize/2);
 const wide=computeLayout(1600,900);assert.equal(wide.landscape,true);assert.ok(wide.boardSize<=770);
});
test('short 360x480 portrait still reserves 36 CSS px per cell and visible controls',()=>{
 const l=computeLayout(720,960);assert.ok(l.boardSize/8/2>=36);
 assert.ok(l.buttonsY-38>=-480);
});
