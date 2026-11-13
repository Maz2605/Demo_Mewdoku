const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../build/web-mobile');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.wasm':'application/wasm','.svg':'image/svg+xml','.ttf':'font/ttf','.bin':'application/octet-stream'};
http.createServer((req,res)=>{
 let filename;try{filename=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 filename=path.resolve(root,'.'+filename);if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
 if(!fs.existsSync(filename)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');fs.createReadStream(filename).pipe(res);
}).listen(8088,'127.0.0.1',()=>console.log('Meow Pop: http://localhost:8088'));
