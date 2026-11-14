// Immutable pixel input -> independent answer validation -> explicit export.
const fs=require('node:fs'),crypto=require('node:crypto');
require('./toolchain.cjs').registerTypeScript();
const {solveLevel,validatePlayableLevel}=require('../assets/scripts/core/Puzzle.ts');
function buildCatalog(pictures){
 const ids=new Set(),levels=[],reports=[];
 for(const p of pictures){
  if(ids.has(p.id))throw Error('Duplicate picture id: '+p.id);ids.add(p.id);
  const n=p.rows.length;
  if(p.rows.some(row=>row.length!==n||!/^[0-7]+$/.test(row)))throw Error(p.id+': invalid square pixel rows');
  const level={id:p.id,title:p.title,size:n,palette:p.palette.slice(),cells:p.rows.join('').split('').map(Number),cats:[],...(p.blockers?.length?{blockers:p.blockers.map(b=>({...b}))}:{})};
  const answers=solveLevel(level);
  if(answers.length!==1)throw Error(p.id+': expected one solution, got '+answers.length);
  level.cats=answers[0];
  const report=validatePlayableLevel(level);
  if(report.errors.length)throw Error(p.id+': '+report.errors.join('; '));
  levels.push(level);reports.push({id:p.id,title:p.title,size:n,pixelHash:crypto.createHash('sha256').update(JSON.stringify({rows:p.rows,palette:p.palette})).digest('hex'),solutions:1,reachableStates:report.reachableStates,steps:report.steps});
 }
 return {levels,reports};
}
function contactSheet(levels){
 const columns=5,w=1200,h=Math.ceil(levels.length/columns)*270+20;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#FFF8EE"/>`;
 levels.forEach((l,k)=>{const x=k%columns*240+20,y=Math.floor(k/columns)*270+45,c=192/l.size;
  svg+=`<text x="${x}" y="${y-14}" font-family="Arial" font-size="16" fill="#44305F">${k+1}. ${l.title}</text>`;
  l.cells.forEach((v,i)=>svg+=`<rect x="${x+i%l.size*c}" y="${y+Math.floor(i/l.size)*c}" width="${c}" height="${c}" fill="${l.palette[v]}"/>`);
  const stones=(l.blockers||[]).filter(b=>b.type==='stone').length,locks=(l.blockers||[]).filter(b=>b.type==='lock').length;
  svg+=`<text x="${x}" y="${y+216}" font-family="Arial" font-size="13" fill="#7939CB">${l.size}×${l.size} · ${stones} đá · ${locks} khóa</text>`;
 });return svg+'</svg>';
}
async function main(){
 const args=process.argv.slice(2);
 if(!args.length){console.log('Usage: node tools/author-levels.cjs --check | --preview | --export\nReads tools/data/pictures.json without changing its pixels. Only --export writes Levels.ts.');return;}
 if(args.some(a=>!['--check','--preview','--export'].includes(a)))throw Error('Unknown authoring option');
 const source=fs.readFileSync('tools/data/pictures.json','utf8'),{levels,reports}=buildCatalog(JSON.parse(source));
 if(args.includes('--export')){
  fs.writeFileSync('assets/scripts/core/Levels.ts',"import { LevelDefinition } from './Puzzle';\n\n/** Exported from immutable tools/data/pictures.json. Use author-levels --export. */\nexport const LEVELS: LevelDefinition[] = "+JSON.stringify(levels,null,2)+';\n');
  fs.writeFileSync('docs/level-validation.json',JSON.stringify({creator:require('../package.json').creator.version,pictures:reports},null,2)+'\n');
 }
 if(args.includes('--preview')){
  fs.mkdirSync('docs/images',{recursive:true});const svg=contactSheet(levels);fs.writeFileSync('docs/images/pictures.svg',svg);
  const sharp=require(process.env.MEOW_SHARP||require('node:path').join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
  await sharp(Buffer.from(svg)).png().toFile('docs/images/pictures.png');
 }
 if(fs.readFileSync('tools/data/pictures.json','utf8')!==source)throw Error('Picture input was modified');
 console.log(`${levels.length} pictures: unique answers, logical completion and all reachable correct subsets verified.`);
}
module.exports={buildCatalog,contactSheet};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
