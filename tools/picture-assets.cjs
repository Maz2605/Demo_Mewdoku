// Exact-color, nearest-neighbor assets from the same cells used by the puzzle.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
require('./toolchain.cjs').registerTypeScript();
function picturePixels(level){
 const data=Buffer.alloc(level.size*level.size*4);
 level.cells.forEach((c,i)=>{const hex=level.palette[c].slice(1);data[i*4]=parseInt(hex.slice(0,2),16);data[i*4+1]=parseInt(hex.slice(2,4),16);data[i*4+2]=parseInt(hex.slice(4,6),16);data[i*4+3]=255;});
 return data;
}
async function main(){
 const sharp=require(process.env.MEOW_SHARP||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
 const {LEVELS}=require('../assets/scripts/core/Levels.ts');fs.mkdirSync('assets/art/pictures',{recursive:true});
 for(const level of LEVELS)await sharp(picturePixels(level),{raw:{width:level.size,height:level.size,channels:4}}).resize(level.size*32,level.size*32,{kernel:'nearest'}).png().toFile(`assets/art/pictures/${level.id}.png`);
 console.log(`${LEVELS.length} exact-color picture assets exported.`);
}
module.exports={picturePixels};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
