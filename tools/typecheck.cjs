const {spawnSync}=require('node:child_process');
const path=require('node:path');
const base=require('./toolchain.cjs').typescriptPath;
const result=spawnSync(process.execPath,[path.join(base,'lib/tsc.js'),'--noEmit','--skipLibCheck','--lib','ES2020,DOM','-p','tsconfig.json'],{stdio:'inherit'});
process.exit(result.status??1);
