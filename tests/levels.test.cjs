const {test}=require('node:test');
const assert=require('node:assert/strict');
const {LEVELS}=require('../assets/scripts/core/Levels.ts');
const {validateLevel,solveLevel,logicalSolve,createGame,applyAction}=require('../assets/scripts/core/Puzzle.ts');
test('authored pictures have unique independent answers and a complete logical path',()=>{
  assert.equal(LEVELS.length,20);
  for(const l of LEVELS){
    assert.deepEqual(validateLevel(l),[],l.id);
    const answers=solveLevel(l);
    assert.equal(answers.length,1,l.id);
    assert.deepEqual(answers[0],l.cats,l.id);
    const logic=logicalSolve({...l,cats:[]});
    assert.equal(logic.solved,true,l.id);
    assert.equal(logic.steps.length,l.size,l.id);
    let state=createGame(l);
    while(state.status==='playing'){
      const hint=applyAction({...state,hints:2},{type:'hint'});
      const event=hint.events.find(e=>e.type==='hint');
      assert.ok(event,l.id+' no logical move');
      state=applyAction(hint.state,{type:'find',index:event.index}).state;
    }
    assert.equal(state.status,'won');assert.equal(state.hearts,3);
  }
});
