'use strict';
// A single-user, dependency-free HTTP app with an optional persistent data volume.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const port = Number(process.env.PORT || 3000);
const password = process.env.APP_PASSWORD || '';
const production = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.NODE_ENV === 'production');
if (production && !password) console.warn('NOTICE: APP_PASSWORD is not set. EvnFlo is running without login protection. Add APP_PASSWORD later to enable the login page.');
if (password && password.length < 8) {
  console.error('SECURITY: APP_PASSWORD must have at least 8 characters.');
  process.exit(1);
}
const secret=crypto.createHash('sha256').update(password || 'craigs-planner-local-development-only').digest();
const dataDir=path.resolve(process.env.DATA_DIR || path.join(__dirname,'storage'));
const dataFile=path.join(dataDir,'state.json');
const defaultState=()=>({schema:1,projects:[],tasks:[],events:[],settings:{
  workStart:'08:00',workEnd:'17:00',personalStart:'17:00',personalEnd:'21:00',
  weekendStart:'09:00',weekendEnd:'20:00',lunchStart:'12:00',lunchEnd:'12:30',
  weekdays:[1,2,3,4,5],autoPlan:true
}});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml'};
const staticFiles=new Set(['/','/index.html','/styles.css','/app.js','/sw.js','/manifest.webmanifest','/manus-routes.json','/evnflo-wordmark.png','/evnflo-192.png','/evnflo-512.png']);
const blocked=new Map();
let fileQueue=Promise.resolve();
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=')).filter(v=>v.length===2));
const sign=x=>crypto.createHmac('sha256',secret).update(x).digest('base64url');
const token=()=>{const part=`${Date.now()}.${crypto.randomBytes(16).toString('hex')}`;return `${part}.${sign(part)}`;};
function authorized(req){
 if(!password)return true;
 const jar=cookies(req),t=jar.evnflo_session||jar.craigs_planner_session;
 if(!t||t.length>256)return false;
 const idx=t.lastIndexOf('.');if(idx<0)return false;
 const data=t.slice(0,idx),sig=t.slice(idx+1),expected=sign(data);
 const age=Date.now()-Number(data.split('.')[0]);
 return Number.isFinite(age)&&age>=0&&age<30*86400000&&sig.length===expected.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected));
}
const isHttps=req=>req.headers['x-forwarded-proto']==='https'||req.socket.encrypted;
const cookieOptions=req=>`Path=/; HttpOnly; SameSite=${isHttps(req)?'None':'Lax'}; Max-Age=2592000${isHttps(req)?'; Secure':''}`;
function send(res,code,data,headers={}){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin',...headers});res.end(JSON.stringify(data));}
function rejectOrigin(req){const origin=req.headers.origin;if(!origin)return false;try{return new URL(origin).host !== req.headers.host;}catch{return true;}}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2e6)throw new Error('Request too large');}return JSON.parse(raw||'{}');}
async function load(){return JSON.parse(await fs.readFile(dataFile,'utf8'));}
async function save(data){fileQueue=fileQueue.catch(()=>{}).then(async()=>{const tmp=`${dataFile}.${process.pid}.tmp`;await fs.writeFile(tmp,JSON.stringify(data,null,2));await fs.rename(tmp,dataFile);});await fileQueue;}
async function route(req,res){
 const url=new URL(req.url,'http://localhost');const endpoint=url.pathname;
 if(endpoint==='/api/health'&&(req.method==='GET'||req.method==='HEAD'))return send(res,200,{status:'ok'});
 if(endpoint==='/api/session'&&req.method==='GET')return send(res,200,{authenticated:authorized(req),protected:Boolean(password),storage:'file'});
 if(endpoint==='/api/login'&&req.method==='POST'){
  if(rejectOrigin(req))return send(res,403,{error:'Origin not allowed'});
  if(!password)return send(res,200,{ok:true});
  const ip=req.headers['x-forwarded-for']?.split(',')[0]?.trim()||req.socket.remoteAddress||'local',prev=blocked.get(ip)||{attempts:0,until:0};
  if(prev.until>Date.now())return send(res,429,{error:'Too many attempts. Try again in five minutes.'});
  const input=await body(req);const received=crypto.createHash('sha256').update(typeof input.password==='string'?input.password:'').digest();
  const expected=crypto.createHash('sha256').update(password).digest();
  if(!crypto.timingSafeEqual(received,expected)){
   prev.attempts++;if(prev.attempts>=6){prev.until=Date.now()+300000;prev.attempts=0;}blocked.set(ip,prev);
   return send(res,401,{error:'Incorrect password.'});
  }
  blocked.delete(ip);
  return send(res,200,{ok:true},{'Set-Cookie':`evnflo_session=${token()}; ${cookieOptions(req)}`});
 }
 if(endpoint==='/api/logout'&&req.method==='POST'){
  if(rejectOrigin(req))return send(res,403,{error:'Origin not allowed'});
  const cleared=cookieOptions(req).replace('Max-Age=2592000','Max-Age=0');
  return send(res,200,{ok:true},{'Set-Cookie':[`evnflo_session=; ${cleared}`,`craigs_planner_session=; ${cleared}`]});
 }
 if(endpoint==='/api/state'){
  if(!authorized(req))return send(res,401,{error:'Please sign in.'});
  if(req.method==='GET')return send(res,200,await load());
  if(req.method==='PUT'){
   if(rejectOrigin(req))return send(res,403,{error:'Origin not allowed'});
   const data=await body(req);
   if(!data||!Array.isArray(data.projects)||!Array.isArray(data.tasks)||!Array.isArray(data.events)||!data.settings||data.projects.length>3000||data.tasks.length>30000||data.events.length>30000)return send(res,400,{error:'Invalid planner data.'});
   await save(data);return send(res,200,{ok:true});
  }
  return send(res,405,{error:'Method not allowed'});
 }
 if((req.method==='GET'||req.method==='HEAD')&&staticFiles.has(endpoint)){
   const full=path.join(__dirname,endpoint==='/'?'index.html':endpoint);
   const bytes=await fs.readFile(full);
   res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':endpoint==='/index.html'||endpoint==='/'?'no-cache':'public, max-age=300','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors *",'X-Content-Type-Options':'nosniff'});
   if(req.method==='HEAD')res.end();else res.end(bytes);return;
 }
 send(res,404,{error:'Not found'});
}
async function boot(){await fs.mkdir(dataDir,{recursive:true});try{await fs.access(dataFile);}catch{await fs.writeFile(dataFile,JSON.stringify(defaultState(),null,2));}
 if(production&&!process.env.DATA_DIR)console.warn('IMPORTANT: DATA_DIR is not set. Add a Railway volume mounted at /data and set DATA_DIR=/data for persistent data.');
 http.createServer((req,res)=>route(req,res).catch(e=>{console.error(e);if(!res.headersSent)send(res,e.message==='Request too large'?413:500,{error:'Server error. Check logs.'});})).listen(port,'0.0.0.0',()=>console.log(`EvnFlo running on port ${port}. Data: ${dataFile}`));
}
boot().catch(e=>{console.error(e);process.exit(1);});
