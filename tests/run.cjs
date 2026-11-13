// Use the TypeScript compiler bundled with the installed Creator; no download required.
const fs = require('node:fs');
const path = require('node:path');
const ts = require(process.env.MEOW_TYPESCRIPT || 'C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }, fileName: filename
  });
  module._compile(result.outputText, filename);
};
for (const filename of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.cjs'))) require(path.join(__dirname, filename));
