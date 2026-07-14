const http=require('http'),fs=require('fs'),path=require('path');
const DIST=path.join(process.cwd(),'dist');
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.otf':'font/otf','.ttf':'font/ttf','.map':'application/json','.txt':'text/plain','.webmanifest':'application/manifest+json','.mp4':'video/mp4'};
http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]);
  let c=path.join(DIST,u);
  try{ if(fs.existsSync(c)&&fs.statSync(c).isDirectory()) c=path.join(c,'index.html'); }catch{}
  if(fs.existsSync(c)&&fs.statSync(c).isFile()){
    res.writeHead(200,{'Content-Type':MIME[path.extname(c)]||'application/octet-stream'});
    fs.createReadStream(c).pipe(res); return;
  }
  res.writeHead(200,{'Content-Type':'text/html'});
  fs.createReadStream(path.join(DIST,'index.html')).pipe(res);
}).listen(4300,()=>console.log('Preview (prerendered dist) on http://localhost:4300'));
