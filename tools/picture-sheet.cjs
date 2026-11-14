// Compatibility entrypoint; previews never overwrite runtime levels.
require('node:child_process').execFileSync(process.execPath,[require('node:path').join(__dirname,'author-levels.cjs'),'--preview'],{stdio:'inherit'});
