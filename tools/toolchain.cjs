// One local Creator installation for authoring, tests and typechecking. No download.
const path=require('node:path');
const fs=require('node:fs');
const version=require('../package.json').creator.version;
const creatorHome=process.env.MEOW_CREATOR||`C:/ProgramData/cocos/editors/Creator/${version}`;
const typescriptPath=process.env.MEOW_TYPESCRIPT||path.join(creatorHome,'resources/app.asar.unpacked/node_modules/typescript');
function registerTypeScript(){
 if(!fs.existsSync(typescriptPath))throw Error(`Creator TypeScript not found: ${typescriptPath}. Install Creator ${version}, or set MEOW_CREATOR / MEOW_TYPESCRIPT.`);
 const ts=require(typescriptPath);
 require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,experimentalDecorators:true},fileName:filename
 }).outputText,filename);
}
module.exports={creatorHome,typescriptPath,registerTypeScript};
