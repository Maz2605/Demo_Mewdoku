const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame,applyAction,solveLevel,logicalSolve,validateLevel,validatePlayableLevel,getLogicalHint,cellAccess}=require('../assets/scripts/core/Puzzle.ts');
const base={id:'fixture',title:'Fixture',size:4,palette:['#48BFC2','#FFB64D','#FF7194','#394C83'],
 cells:[0,1,0,0,0,0,0,2,3,0,0,0,0,0,0,0],cats:[1,7,8,14]};

test('stone and closed lock reject actions without spending hearts or changing state',()=>{
 const level={...base,blockers:[{type:'stone',index:0},{type:'lock',index:1,unlockAfter:1}]};
 const state=createGame(level);
 assert.equal(cellAccess(state,0),'stone');assert.equal(cellAccess(state,1),'locked');
 for(const index of [0,1])for(const type of ['mark','find']){
  const result=applyAction(state,{type,index});assert.equal(result.state,state);assert.deepEqual(result.events,[]);
 }
 assert.equal(state.hearts,3);assert.equal(state.hints,2);
 assert.deepEqual(solveLevel(level),[[1,7,8,14]]);
});

test('logical hints skip a locked single and finding another cat opens it exactly once',()=>{
 const level={...base,blockers:[{type:'stone',index:0},{type:'lock',index:1,unlockAfter:1}]};
 const initial=createGame(level),hint=getLogicalHint(level,initial);
 assert.equal(hint.index,7);
 const result=applyAction(initial,{type:'find',index:7});
 assert.equal(cellAccess(result.state,1),'open');
 assert.deepEqual(result.events.filter(e=>e.type==='unlocked'),[{type:'unlocked',index:1}]);
 assert.equal(result.state.cells[0],'unknown','stone must not join an exclusion blast');
 assert.equal(applyAction(result.state,{type:'find',index:8}).events.some(e=>e.type==='unlocked'),false);
 assert.equal(cellAccess(createGame(level),1),'locked','retry recloses locks');
 assert.equal(logicalSolve({...level,cats:[]}).solved,true);
});

test('excluded closed locks reveal without an unlock event and stones are absent from answer search',()=>{
 const level={...base,blockers:[{type:'lock',index:0,unlockAfter:2}]};
 const result=applyAction(createGame(level),{type:'find',index:1});
 assert.equal(result.state.cells[0],'excluded');assert.equal(cellAccess(result.state,0),'open');
 assert.equal(result.events.some(e=>e.type==='unlocked'),false);
 assert.deepEqual(solveLevel({...base,blockers:[{type:'stone',index:1}]}),[]);
});

test('blocker validation rejects duplicate, outside, cat stones and malformed thresholds',()=>{
 for(const blockers of [
  [{type:'stone',index:1}], [{type:'stone',index:16}], [{type:'stone',index:0},{type:'lock',index:0,unlockAfter:1}],
  [{type:'lock',index:1,unlockAfter:0}],[{type:'lock',index:1,unlockAfter:3}],[{type:'lock',index:1,unlockAfter:1.5}],
  [{type:'mist',index:0}]
 ])assert.ok(validateLevel({...base,blockers}).length,JSON.stringify(blockers));
 assert.deepEqual(validateLevel({...base,blockers:[{type:'stone',index:0}]}),[]);
});

test('playability validator rejects inaccessible answers and checks every reachable correct subset',()=>{
 const dead={...base,blockers:base.cats.map(index=>({type:'lock',index,unlockAfter:1}))};
 assert.equal(logicalSolve(dead).solved,false);
 assert.ok(validatePlayableLevel(dead).errors.length);
 const valid={...base,blockers:[{type:'lock',index:1,unlockAfter:1}]};
 const report=validatePlayableLevel(valid);
 assert.deepEqual(report.errors,[]);assert.equal(report.reachableStates,15);
 assert.equal(report.steps[0].index,7);
 assert.deepEqual(report.steps.map(s=>s.index).sort((a,b)=>a-b),[1,7,8,14]);
});
