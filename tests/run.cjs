// Use the TypeScript compiler bundled with the installed Creator; no download required.
const fs = require('node:fs');
const path = require('node:path');
require('../tools/toolchain.cjs').registerTypeScript();
for (const filename of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.cjs'))) require(path.join(__dirname, filename));
