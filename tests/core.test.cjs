const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateLevel, solveLevel, createGame, applyAction, getLogicalHint, logicalSolve } = require('../assets/scripts/core/Puzzle.ts');

// Hand checked: cats at columns 1,3,0,2. Four unique color anchors.
const level = { id:'fixture', title:'Fixture', size:4, palette:['#48BFC2','#FFB64D','#FF7194','#394C83'],
  cells:[0,1,0,0, 0,0,0,2, 3,0,0,0, 0,0,0,0], cats:[1,7,8,14] };
test('rejects malformed, touching and invalid color answers', () => {
  assert.deepEqual(validateLevel(level), []);
  assert.ok(validateLevel({...level,cells:[0]}).length);
  assert.ok(validateLevel({...level,cats:[0,5,10,15]}).length);
  assert.ok(validateLevel({...level,palette:['#fff']}).length);
});
test('solver distinguishes unique, ambiguous and impossible boards', () => {
  assert.deepEqual(solveLevel(level), [[1,7,8,14]]);
  const ambiguous = {...level,cells:Array.from({length:16},(_,i)=>Math.floor(i/4))};
  assert.equal(solveLevel(ambiguous).length,2);
  assert.equal(solveLevel({...level,cells:Array(16).fill(0)}).length,0);
});
test('marking is reversible and a marked cell cannot be searched', () => {
  const initial=createGame(level);
  const marked=applyAction(initial,{type:'mark',index:1}).state;
  assert.equal(initial.cells[1],'unknown');
  assert.equal(marked.cells[1],'marked');
  assert.equal(applyAction(marked,{type:'find',index:1}).state.found.length,0);
  assert.equal(applyAction(marked,{type:'mark',index:1}).state.cells[1],'unknown');
});
test('correct cat excludes row, column, color and diagonal without harming remaining cats', () => {
  const result=applyAction(createGame(level),{type:'find',index:1});
  assert.equal(result.state.cells[1],'found');
  for(const i of [0,2,3,5,9,13,4,6]) assert.equal(result.state.cells[i],'excluded',String(i));
  for(const i of [7,8,14]) assert.equal(result.state.cells[i],'unknown',String(i));
  const excluded=result.events.find(e=>e.type==='found').excluded;
  assert.equal(new Set(excluded).size,excluded.length);
});
test('wrong guesses lose one heart once; lose and terminal actions are idempotent', () => {
  let s=applyAction(createGame(level),{type:'find',index:0}).state;
  assert.equal(s.hearts,2);
  s=applyAction(s,{type:'find',index:0}).state;
  assert.equal(s.hearts,2);
  s=applyAction(s,{type:'find',index:2}).state;
  const lost=applyAction(s,{type:'find',index:3});
  assert.equal(lost.state.status,'lost');
  assert.equal(lost.events.filter(e=>e.type==='lost').length,1);
  assert.deepEqual(applyAction(lost.state,{type:'hint'}).events,[]);
});
test('hint ignores incorrect manual exclusions and never collects a cat', () => {
  let s=createGame(level);
  for(const i of level.cats) s=applyAction(s,{type:'mark',index:i}).state;
  const result=applyAction(s,{type:'hint'});
  assert.equal(result.state.hints,1);
  assert.equal(result.state.found.length,0);
  const hint=result.events.find(e=>e.type==='hint');
  assert.ok(level.cats.includes(hint.index));
  assert.equal(result.state.cells[hint.index],'unknown');
  assert.ok(hint.reason.length>0);
  const second=applyAction(result.state,{type:'hint'});
  assert.equal(second.state.hints,0);
  assert.deepEqual(applyAction(second.state,{type:'hint'}).events,[]);
});
test('logical solver explains and solves without looking at authored cats', () => {
  const altered={...level,cats:[]};
  assert.deepEqual(logicalSolve(altered).cats.slice().sort((a,b)=>a-b),[1,7,8,14]);
  assert.equal(logicalSolve(altered).solved,true);
  assert.ok(getLogicalHint(level,createGame(level)).reason.length>0);
});
test('win occurs once, final board remains original colors, reset restores resources', () => {
  let s=createGame(level),wins=0;
  for(const index of level.cats){const r=applyAction(s,{type:'find',index});s=r.state;wins+=r.events.filter(e=>e.type==='won').length;}
  assert.equal(s.status,'won'); assert.equal(wins,1);
  assert.deepEqual(s.level.cells,level.cells);
  assert.deepEqual(applyAction(s,{type:'find',index:1}).events,[]);
  assert.deepEqual(createGame(level),{level,cells:Array(16).fill('unknown'),found:[],hearts:3,hints:2,status:'playing'});
});
