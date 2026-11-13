const fs=require('node:fs');
const ts=require('C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
const {LEVELS}=require('../assets/scripts/core/Levels.ts');
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="450"><rect width="1280" height="450" fill="#F7F3EE"/>';
LEVELS.forEach((l,k)=>{const left=k*320+32,top=90,sz=256/l.size;svg+=`<text x="${left}" y="44" font-family="Arial" font-size="21" fill="#373454">${l.title} · ${l.size}×${l.size}</text>`;l.cells.forEach((c,i)=>svg+=`<rect x="${left+(i%l.size)*sz}" y="${top+Math.floor(i/l.size)*sz}" width="${sz+.1}" height="${sz+.1}" fill="${l.palette[c]}"/>`);svg+=`<text x="${left}" y="389" font-family="Arial" font-size="17" fill="#638C7C">1 solution · logically solvable</text>`;});
svg+='</svg>';fs.mkdirSync('docs/images',{recursive:true});fs.writeFileSync('docs/images/pictures.svg',svg);
// Exact-color PNG contact sheet without third-party image dependencies.
const zlib=require('node:zlib'),width=1280,height=360,pixels=Buffer.alloc((width*4+1)*height);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 let hex='#F7F3EE';const k=Math.floor(x/320),l=LEVELS[k],xx=x%320-32,yy=y-52;
 if(xx>=0&&xx<256&&yy>=0&&yy<256)hex=l.palette[l.cells[Math.floor(yy/256*l.size)*l.size+Math.floor(xx/256*l.size)]];
 const offset=y*(width*4+1)+1+x*4;pixels[offset]=parseInt(hex.slice(1,3),16);pixels[offset+1]=parseInt(hex.slice(3,5),16);pixels[offset+2]=parseInt(hex.slice(5,7),16);pixels[offset+3]=255;
}
function chunk(type,data){const tag=Buffer.from(type),payload=Buffer.concat([tag,data]);let crc=0xffffffff;for(const value of payload){crc^=value;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}const header=Buffer.alloc(4),tail=Buffer.alloc(4);header.writeUInt32BE(data.length);tail.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([header,payload,tail]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
fs.writeFileSync('docs/images/pictures.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));
