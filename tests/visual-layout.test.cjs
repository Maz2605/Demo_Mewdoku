const {test}=require('node:test');
const assert=require('node:assert/strict');
const {computeLayout}=require('../assets/scripts/core/Layout.ts');
test('visual layout preserves board targets and separates header, controls and modal across six viewports',()=>{
 for(const [cw,ch] of [[360,480],[360,640],[390,844],[640,360],[844,390],[1280,720]]){
  const ratio=cw/ch,w=ratio>1?900*ratio:720,h=ratio>1?900:720/ratio;
  const l=computeLayout(w,h),scale=cw/w;
  assert.ok(l.buttonHeight*scale>=44,`${cw}x${ch} buttons`);
  assert.ok(l.modalWidth<=w-24&&l.modalHeight<=h-24,'modal bounds');
  const modalScale=Math.min(1,(w-24)/620,(h-24)/740);
  assert.ok(l.modalActionHeight*modalScale*scale>=44,'modal actions need full touch targets');
  assert.ok(l.logoY+l.logoHeight/2<=h/2-8,'logo top');
  assert.ok(l.buttonsY-l.buttonHeight/2>=-h/2+45,'button bottom');
  if(!l.landscape){
   assert.ok(l.boardSize/8*scale>=36,'8x8 target');
   assert.ok(l.statusY-l.statusHeight/2>l.boardY+l.boardSize/2+12,'status/board');
   assert.ok(l.buttonsY+l.buttonHeight/2<l.boardY-l.boardSize/2-12,'board/buttons');
  }
 }
});
