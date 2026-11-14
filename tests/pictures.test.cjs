const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const {LEVELS}=require('../assets/scripts/core/Levels.ts');
const {validatePlayableLevel}=require('../assets/scripts/core/Puzzle.ts');
const {buildCatalog}=require('../tools/author-levels.cjs');
const {execFileSync}=require('node:child_process');
test('twenty immutable picture inputs round-trip into independently playable levels',()=>{
 const pictures=JSON.parse(fs.readFileSync('tools/data/pictures.json','utf8'));
 assert.equal(pictures.length,20);assert.equal(LEVELS.length,20);
 assert.equal(new Set(LEVELS.map(l=>l.id)).size,20);
 for(let k=0;k<20;k++){
  const p=pictures[k],l=LEVELS[k];
  assert.deepEqual(l.cells,p.rows.join('').split('').map(Number),l.id+' pixels changed');
  assert.deepEqual(l.palette,p.palette,l.id+' colors changed');
  const report=validatePlayableLevel(l);assert.deepEqual(report.errors,[],l.id);
 }
 for(const id of ['fish','paw','kitten','ginger'])assert.ok(LEVELS.some(l=>l.id===id));
 assert.ok(LEVELS.slice(8,12).every(l=>l.blockers.some(b=>b.type==='stone')));
 assert.ok(LEVELS.slice(12,16).every(l=>l.blockers.some(b=>b.type==='lock')));
 assert.ok(LEVELS.slice(16).every(l=>['stone','lock'].every(type=>l.blockers.some(b=>b.type===type))));
});

test('authoring never changes input pixels and default/check commands do not overwrite runtime levels',()=>{
 const input=JSON.parse(fs.readFileSync('tools/data/pictures.json','utf8')),snapshot=JSON.stringify(input);
 const result=buildCatalog(input);assert.equal(JSON.stringify(input),snapshot);
 assert.equal(result.levels.length,20);
 const source=fs.readFileSync('assets/scripts/core/Levels.ts','utf8');
 execFileSync(process.execPath,['tools/author-levels.cjs']);
 execFileSync(process.execPath,['tools/author-levels.cjs','--check']);
 assert.equal(fs.readFileSync('assets/scripts/core/Levels.ts','utf8'),source);
 assert.throws(()=>buildCatalog([{...input[0],rows:['0']}]),/invalid square|expected one|Kích thước/);
 assert.throws(()=>buildCatalog([input[0],input[0]]),/Duplicate/);
});
