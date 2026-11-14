// Code-native overlay icons; does not regenerate existing skin artwork.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const sharp=require(process.env.MEOW_SHARP||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
async function main(){
 const icons={
  stone:'<path d="M18 85L29 38L63 16L101 37L115 85L89 112H38Z" fill="#8F9CAF" stroke="#44305F" stroke-width="7" stroke-linejoin="round"/><path d="M29 38L65 56L101 37M65 56L54 105" fill="none" stroke="#C7D4E1" stroke-width="8" stroke-linejoin="round"/>',
  lock:'<path d="M36 57V36C36 0 92 0 92 36V57" fill="none" stroke="#44305F" stroke-width="15"/><path d="M36 57V36C36 0 92 0 92 36V57" fill="none" stroke="#FFF0C9" stroke-width="7"/><rect x="15" y="51" width="98" height="67" rx="16" fill="#FFD447" stroke="#44305F" stroke-width="7"/><circle cx="64" cy="79" r="10" fill="#7939CB"/><path d="M64 84V99" stroke="#7939CB" stroke-width="10" stroke-linecap="round"/>'
 };
 fs.mkdirSync('assets/art/ui',{recursive:true});
 for(const [name,body]of Object.entries(icons))await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">${body}</svg>`)).png().toFile(`assets/art/ui/${name}.png`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
