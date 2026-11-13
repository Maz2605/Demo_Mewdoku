// Offline deterministic UI artwork and production texture normalization.
const fs=require('node:fs');
const sharp=require(process.env.MEOW_SHARP || require('node:path').join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const dir='assets/art/ui';fs.mkdirSync(dir,{recursive:true});
const defs=`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#7CCAFD"/><stop offset="1" stop-color="#DCF7FF"/></linearGradient><linearGradient id="purple" x2="0" y2="1"><stop stop-color="#B786F1"/><stop offset=".5" stop-color="#9148DA"/><stop offset="1" stop-color="#672DB4"/></linearGradient><linearGradient id="gold" x2="0" y2="1"><stop stop-color="#FFF29A"/><stop offset=".45" stop-color="#FFD447"/><stop offset="1" stop-color="#FFAD35"/></linearGradient><radialGradient id="glow"><stop stop-color="white" stop-opacity=".75"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs>`;
async function svg(name,w,h,body){await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`)).png().toFile(`${dir}/${name}.png`);}
const round=(fill,stroke='#D8B5FA')=>`<rect x="3" y="8" width="122" height="117" rx="25" fill="#664099" opacity=".22"/><rect x="3" y="2" width="122" height="117" rx="25" fill="${fill}" stroke="${stroke}" stroke-width="5"/><path d="M27 9H100" stroke="white" stroke-opacity=".65" stroke-linecap="round" stroke-width="4"/>`;
async function main(){
 await svg('panel',128,128,round('#FFF8EE'));
 await svg('button-purple',128,128,round('url(#purple)','#E3C5FF'));
 await svg('button-gold',128,128,round('url(#gold)','#FFF4B2'));
 await svg('flat',2,2,'<path fill="white" d="M0 0H2V2H0Z"/>');
 await svg('sky',256,512,'<path fill="url(#sky)" d="M0 0H256V512H0Z"/>');
 await svg('cloud',512,256,'<g fill="white" opacity=".72"><ellipse cx="260" cy="180" rx="245" ry="67"/><circle cx="140" cy="150" r="75"/><circle cx="245" cy="115" r="106"/><circle cx="363" cy="151" r="78"/></g>');
 await svg('paw',128,128,'<g fill="white"><ellipse cx="64" cy="87" rx="28" ry="23"/><ellipse cx="26" cy="52" rx="14" ry="18" transform="rotate(-25 26 52)"/><ellipse cx="52" cy="30" rx="13" ry="18"/><ellipse cx="80" cy="30" rx="13" ry="18"/><ellipse cx="105" cy="52" rx="13" ry="18" transform="rotate(25 105 52)"/></g>');
 const heart=`M64 110C-20 59 17-7 64 29C111-7 148 59 64 110Z`;
 await svg('heart',128,128,`<path d="${heart}" fill="#E85C98" stroke="#FFF0F7" stroke-width="7"/><path d="M31 34Q42 24 51 36" stroke="white" stroke-opacity=".7" stroke-width="7" stroke-linecap="round" fill="none"/>`);
 await svg('heart-empty',128,128,`<path d="${heart}" fill="#E4D6EC" stroke="#B8A0CD" stroke-width="5"/>`);
 await svg('outline',128,128,'<rect x="7" y="7" width="114" height="114" rx="22" fill="none" stroke="white" stroke-width="7"/>');
 await svg('ring',128,128,'<circle cx="64" cy="64" r="54" fill="none" stroke="#FFE785" stroke-width="9"/>');
 await svg('mark',128,128,'<path d="M33 33L95 95M95 33L33 95" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/><path d="M33 33L95 95M95 33L33 95" stroke="#61446F" stroke-width="10" stroke-linecap="round"/>');
 await svg('dot',64,64,'<circle cx="32" cy="32" r="9" fill="#44305F" fill-opacity=".7"/>');
 await svg('hint',128,128,'<path d="M45 89H83M48 101H80M55 111H73" stroke="#FFF4B2" stroke-width="9" stroke-linecap="round"/><path d="M45 80C43 66 27 61 30 40C35 1 95 1 99 40C102 61 85 66 83 80Z" fill="url(#gold)" stroke="#FFF8CE" stroke-width="5"/><path d="M61 73L52 43M67 73L77 43" stroke="#D68829" stroke-width="5" fill="none"/>');
 await svg('inspect',128,128,'<rect x="14" y="14" width="44" height="44" rx="12" fill="#FFBD49"/><rect x="70" y="14" width="44" height="44" rx="12" fill="#62DCE5"/><rect x="14" y="70" width="44" height="44" rx="12" fill="#FFA3C9"/><rect x="70" y="70" width="44" height="44" rx="12" fill="#D9B1FA"/>');
 await svg('retry',128,128,'<path d="M100 76A41 41 0 1 1 93 30" fill="none" stroke="#FFF8EE" stroke-width="13" stroke-linecap="round"/><path d="M97 10L105 48L68 42Z" fill="#FFD447"/>');
 await svg('star',128,128,'<path d="M64 5L79 45L122 64L79 80L64 123L48 80L5 64L48 45Z" fill="#FFF1A4"/><path d="M64 27L73 55L102 64L73 73L64 101L55 73L26 64L55 55Z" fill="white"/>');
 await svg('puff',128,128,'<g fill="white"><circle cx="43" cy="75" r="31"/><circle cx="70" cy="42" r="33"/><circle cx="94" cy="76" r="29"/><ellipse cx="66" cy="90" rx="44" ry="26"/></g>');
 await svg('ray',128,32,'<rect x="0" y="7" width="128" height="18" rx="9" fill="#FFD447" fill-opacity=".6"/><rect x="0" y="13" width="128" height="6" rx="3" fill="#FFFADE"/>');
 await svg('confetti',32,32,'<rect x="7" y="3" width="18" height="26" rx="4" fill="white"/>');
 await svg('glow',256,256,'<circle cx="128" cy="128" r="128" fill="url(#glow)"/>');
 await svg('shadow',256,128,'<defs><radialGradient id="shade"><stop stop-color="#67488D" stop-opacity=".28"/><stop offset="1" stop-color="#67488D" stop-opacity="0"/></radialGradient></defs><ellipse cx="128" cy="64" rx="128" ry="64" fill="url(#shade)"/>');
 for(const name of ['idle','happy','surprised']){
  await sharp(`assets/art/mascot-${name}.png`).trim().resize(850,930,{fit:'contain',position:'bottom',background:{r:0,g:0,b:0,alpha:0}}).extend({top:47,bottom:47,left:87,right:87,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(`assets/art/mascot-${name}-skin.png`);
 }
 await sharp('assets/art/logo.png').resize({width:1024}).png().toFile('assets/art/logo-skin.png');
 await sharp('assets/art/cat-token-source.png').resize(256,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('assets/art/cat-token.png');
 console.log('Skin textures authored; normalized transparent mascot canvases are 1024x1024.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
