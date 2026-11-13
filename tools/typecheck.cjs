const {spawnSync}=require('node:child_process');
const path=require('node:path');
const base=process.env.MEOW_TYPESCRIPT||'C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript';
const result=spawnSync(process.execPath,[path.join(base,'lib/tsc.js'),'--noEmit','--skipLibCheck','--lib','ES2020,DOM','-p','tsconfig.json'],{stdio:'inherit'});
process.exit(result.status??1);
