// Offline constrained pixel authoring. Deterministic seed; never runs in the game.
const fs=require('node:fs');
const ts=require('C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {logicalSolve}=require('../assets/scripts/core/Puzzle.ts');
let seed=871245;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const pictures=[
 {id:'fish',title:'Cá nhỏ',palette:['#55C5DD','#FFAF42','#FFF0B3','#343956'],rows:['0010','0121','0113','0010']},
 {id:'paw',title:'Dấu chân',palette:['#79C9BA','#F5DFB5','#FF8FAD','#474276','#FFB24A'],rows:['01010','21212','00200','02320','04440']},
 {id:'kitten',title:'Mèo tinh nghịch',palette:['#79C9BA','#FFB24A','#E77936','#FFF0C9','#3A3654','#FF8FAD'],rows:['100001','121121','111111','141141','133331','013530']},
 {id:'ginger',title:'Mèo cam may mắn',palette:['#67C7D5','#FFB84C','#DD793C','#FFE4B3','#3B3956','#F791B1','#C8E7DD','#FFF8EE'],rows:['11000011','12100121','12211221','11111111','17411471','33355333','03333330','00633600']}
];
function permutations(n){const result=[],a=[];function go(){if(a.length===n){result.push(a.map((v,r)=>r*n+v));return;}for(let c=0;c<n;c++)if(!a.includes(c)&&(!a.length||Math.abs(c-a[a.length-1])>1)){a.push(c);go();a.pop();}}go();return result;}
function count(cells,perms,limit=Infinity){let count=0,first;for(const p of perms){let bits=0,ok=true;for(const i of p){const bit=1<<cells[i];if(bits&bit){ok=false;break;}bits|=bit;}if(ok){first=p;count++;if(count>=limit)break;}}return {count,first};}
const levels=[];
for(const pic of pictures){
 const n=pic.rows.length,base=pic.rows.join('').split('').map(Number),perms=permutations(n);
 let best=null,bestScore=Infinity;
 for(let attempt=0;attempt<18000;attempt++){
   const cats=perms[Math.floor(random()*perms.length)],cells=base.slice(),used=new Set(),duplicates=[];
   for(const i of cats){if(used.has(cells[i]))duplicates.push(i);else used.add(cells[i]);}
   const missing=Array.from({length:n},(_,i)=>i).filter(i=>!used.has(i));
   for(const i of duplicates){const k=Math.floor(random()*missing.length);cells[i]=missing.splice(k,1)[0];}
   // Extra small edits can remove alternative solutions, while preserving this one.
   for(let k=0;k<Math.floor(attempt/4000);k++){
     const i=Math.floor(random()*cells.length);if(!cats.includes(i))cells[i]=Math.floor(random()*n);
   }
   const score=cells.reduce((s,c,i)=>s+(c!==base[i]?1:0),0);
   if(score>=bestScore)continue;
   const answer=count(cells,perms,2);if(answer.count!==1)continue;
   const level={id:pic.id,title:pic.title,size:n,palette:pic.palette,cells,cats:answer.first};
   if(!logicalSolve(level).solved)continue;
   best=level;bestScore=score;
   if(!score)break;
 }
 if(!best)throw Error('Cannot author '+pic.id);
 levels.push(best);console.log(pic.id+': '+bestScore+' edited pixels; answer '+best.cats.join(','));
}
fs.writeFileSync('assets/scripts/core/Levels.ts',"import { LevelDefinition } from './Puzzle';\n\n/** Authored pictures; same color may have disconnected islands. */\nexport const LEVELS: LevelDefinition[] = "+JSON.stringify(levels,null,2)+';\n');
