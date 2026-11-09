(() => {
'use strict';
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const safe = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const defaults = () => ({schema:1,projects:[],tasks:[],events:[],settings:{workStart:'08:00',workEnd:'17:00',personalStart:'17:00',personalEnd:'21:00',weekendStart:'09:00',weekendEnd:'20:00',lunchStart:'12:00',lunchEnd:'12:30',weekdays:[1,2,3,4,5],autoPlan:true,categories:[{id:'general',name:'General',color:'#7165e8'}]}});
const colorChoices = ['#7165e8','#4f95c7','#39a68e','#df9864','#df6b93','#7e8fa9'];
const statusNames = {todo:'To do',doing:'In progress',review:'Review',done:'Done'};
const statuses = ['todo','doing','review','done'];
const priorities = {urgent:4,high:3,normal:2,low:1};
const iconPaths = {
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  home:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="m3 10 9-7 9 7M9 21v-8h6v8"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/>',
  settings:'<path d="M12 2l1.7 2.8 3.2-.3 1.3 3 2.8 1.7-1 3.2 1 3.2-2.8 1.7-1.3 3-3.2-.3L12 22l-1.7-2.8-3.2.3-1.3-3L3 14.8l1-3.2-1-3.2 2.8-1.7 1.3-3 3.2.3z"/><circle cx="12" cy="12" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  chevronLeft:'<path d="m15 18-6-6 6-6"/>',chevronRight:'<path d="m9 18 6-6-6-6"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7m4-7v7"/>',
  edit:'<path d="m14 4 6 6-12 12H3v-5L16 4a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3z"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>',
  board:'<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="8" rx="1"/><rect x="14" y="16" width="7" height="4" rx="1"/>',
  timeline:'<path d="M3 6h4M3 12h4M3 18h4M9 4h6v4H9zM9 10h12v4H9zM9 16h8v4H9z"/>',
  flag:'<path d="M5 22V4m0 1c5-4 8 4 15 0v10c-7 4-10-4-15 0"/>',
  spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
  grip:'<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
  alert:'<path d="m12 3 10 18H2zM12 9v5m0 3h.01"/>',
  logout:'<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m5-4 4-4-4-4m4 4H9"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 19v2h16v-2"/>',
  upload:'<path d="M12 21V8m-5 5 5-5 5 5M4 5V3h16v2"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  grip2:'<path d="M7 5h2M7 12h2M7 19h2M15 5h2M15 12h2M15 19h2"/>',
  repeat:'<path d="M17 2l4 4-4 4m4-4H7a4 4 0 0 0-4 4v2m4 10-4-4 4-4m-4 4h14a4 4 0 0 0 4-4v-2"/>'
};
const I = (name,size=17) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.target}</svg>`;
const id = () => (window.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);
const pad = n => String(n).padStart(2,'0');
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const at = (d,h=0,m=0) => new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m,0,0);
const parse = s => { if (!s) return new Date(NaN); const a = String(s).split(/[-T:]/).map(Number); return new Date(a[0],a[1]-1,a[2],a[3]||0,a[4]||0); };
const datetime = d => `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const addDays = (d,n) => {const v=new Date(d);v.setDate(v.getDate()+n);return v};
const monday = d => { const v=at(d);v.setDate(v.getDate()-((v.getDay()+6)%7));return v;};
const fmt = (d,opts) => new Intl.DateTimeFormat('en-CA',opts).format(d);
const timeLabel = s => {if(!s)return '';let d=typeof s==='string'?parse(s):s;return fmt(d,{hour:'numeric',minute:'2-digit'});};
const md = s => s ? fmt(parse(`${s}T12:00`),{month:'short',day:'numeric'}) : 'No deadline';
const minutes = t => {const [h,m]=String(t).split(':').map(Number); return h*60+m;};
const minutesBetween = (start,end) => Math.max(0,Math.round((parse(end)-parse(start))/60000));
const duration = n => n>=60 ? (n%60 ? `${Math.floor(n/60)}h ${n%60}m` : `${n/60}h`) : `${n}m`;
const today = () => dateKey(new Date());
let state=defaults(),undoSnapshot=null,undoLabel='',resizeState=null,page='calendar',calView=window.innerWidth<690?'day':'week',focus=new Date(),scope='all',projectId=null,projectView='board',saveTimer=null,saveChain=Promise.resolve(),scrollCal=true,storageType='local',selectedDate=today();
const projectById = id => state.projects.find(p=>p.id===id);
const taskById = id => state.tasks.find(t=>t.id===id);
const taskArea = t => projectById(t.projectId)?.area || t.area || 'work';
const areaFits = area => scope==='all'||scope===area;
const taskFits = t => areaFits(taskArea(t));
const projectColor = t => projectById(t.projectId)?.color || (taskArea(t)==='personal'?'#e18f73':'#6e69e9');
const isDone = t => t.status==='done';
const categoryById = id => (state.settings.categories||[]).find(c=>c.id===id);
const categoryFor = t => categoryById(t.categoryId) || state.settings.categories?.[0] || {id:'general',name:'General',color:'#7165e8'};
const categoryChip = t => { const c=categoryFor(t); return `<span class="category-chip" style="--category:${safe(c.color)}">${safe(c.name)}</span>`; };
const openTasks = () => state.tasks.filter(t=>!isDone(t));
const plannedMinutes = t => (t.blocks||[]).reduce((sum,b)=>sum+minutesBetween(b.start,b.end),0);
function childrenOf(id){return state.tasks.filter(t=>t.parentId===id);}
function isContainer(t){return !!t && childrenOf(t.id).length>0;}
function actionable(t){return !isContainer(t);}
function mainTasks(tasks){return tasks.filter(t=>!t.parentId);}
function sortedHierarchy(tasks){return mainTasks(tasks).sort(compareTasks).flatMap(t=>[t,...childrenOf(t.id).filter(c=>tasks.includes(c)).sort(compareTasks)]);}
function taskProgress(t){const kids=childrenOf(t.id);return {done:kids.filter(isDone).length,total:kids.length};}
function projectStats(tasks){
 const roots=mainTasks(tasks),units=roots.flatMap(t=>{const children=childrenOf(t.id);return children.length?children:[t];});
 const done=units.filter(isDone).length;
 return {total:roots.length,completed:roots.filter(isDone).length,subtasks:tasks.length-roots.length,percent:units.length?Math.round(done/units.length*100):0};
}
function syncParent(parentId){
 const parent=taskById(parentId);if(!parent)return;
 const kids=childrenOf(parentId);if(!kids.length)return;
 if(kids.every(isDone)){
   parent.status='done';parent.completedAt=parent.completedAt||new Date().toISOString();parent.blocks=[];
 }else if(parent.status==='done'){
   parent.status='doing';parent.completedAt=null;
 }else if(kids.some(isDone)&&parent.status==='todo')parent.status='doing';
}
function changeTaskStatus(task,status){
 if(!task)return;
 task.status=status;task.completedAt=status==='done'?new Date().toISOString():null;
 if(status==='done')task.blocks=[];
 const children=childrenOf(task.id);
 if(children.length){
   // Marking a container done also completes its children. Reopening a container
   // reopens its children to avoid contradictory done-parent / open-child states.
   if(status==='done'||status==='todo')for(const child of children)changeTaskStatus(child,status);
   syncParent(task.id);
 }
 if(task.parentId)syncParent(task.parentId);
}
function deleteTaskAndChildren(taskId){
 const ids=new Set([taskId,...childrenOf(taskId).map(x=>x.id)]);
 const old=taskById(taskId),parent=old?.parentId;
 state.tasks=state.tasks.filter(x=>!ids.has(x.id));
 state.tasks.forEach(t=>t.dependsOn=(t.dependsOn||[]).filter(x=>!ids.has(x)));
 if(parent)syncParent(parent);
}
function upgradeLegacyChecklists(){
 let changed=false;
 if(!state.settings.categories||!Array.isArray(state.settings.categories)||!state.settings.categories.length){state.settings.categories=[{id:'general',name:'General',color:'#7165e8'}];changed=true;}
 state.tasks.forEach(t=>{if(!t.categoryId){t.categoryId='general';changed=true;}});const ids=new Set(state.tasks.map(t=>t.id));const extra=[];
 for(const parent of state.tasks){
   if(!Array.isArray(parent.subtasks)||!parent.subtasks.length){if(parent.subtasks){delete parent.subtasks;changed=true;}continue;}
   for(const old of parent.subtasks){
     if(!old||!String(old.title||'').trim())continue;
     let newId=typeof old.id==='string'&&old.id&&!ids.has(old.id)?old.id:id();
     while(ids.has(newId))newId=id();ids.add(newId);
     const done=!!old.done||parent.status==='done';
     extra.push({id:newId,parentId:parent.id,title:String(old.title).trim(),projectId:parent.projectId||'',area:parent.area||'work',notes:'',priority:parent.priority||'normal',status:done?'done':'todo',estimate:30,dueDate:parent.dueDate||'',autoSchedule:true,blocks:[],dependsOn:[],createdAt:parent.createdAt||new Date().toISOString(),completedAt:done?new Date().toISOString():null,categoryId:parent.categoryId||'general'});
   }
   delete parent.subtasks;parent.blocks=[];parent.autoSchedule=true;changed=true;
 }
 if(extra.length)state.tasks.push(...extra);
 if(changed)for(const parent of state.tasks.filter(t=>!t.parentId))syncParent(parent.id);
 return changed;
}
function toast(msg,error=false,canUndo=false){ const el=document.createElement('div');el.className=`toast${error?' error':''}`;el.innerHTML=`<span>${safe(msg)}</span>${canUndo?'<button class="toast-undo" data-act="undo">Undo</button>':''}`;$('#toast-root').replaceChildren(el);setTimeout(()=>{if(el.isConnected)el.remove()},4200); }
function recordUndo(label){undoSnapshot=JSON.stringify(state);undoLabel=label;}
function undoLast(){if(!undoSnapshot)return;state=JSON.parse(undoSnapshot);undoSnapshot=null;closeModal();render();saveImmediate();toast(`Undid ${undoLabel}.`);}
function overlaps(a,b,c,d){return parse(a)<parse(d)&&parse(b)>parse(c);}
function manualConflicts(task,start,end){const out=[];for(const e of state.events)if(overlaps(start,end,e.start,e.end))out.push(`event “${e.title}”`);for(const other of state.tasks){if(other.id===task.id||other.autoSchedule!==false||isDone(other))continue;for(const b of other.blocks||[])if(overlaps(start,end,b.start,b.end)){out.push(`fixed task “${other.title}”`);break;}}return out;}
function confirmOverlap(task,start,end){const conflicts=manualConflicts(task,start,end);return !conflicts.length||confirm(`This overlaps ${conflicts.join(' and ')}. Accept the overlap?`);}
function update(mutates=true){if(mutates&&state.settings.autoPlan)replan(false);render();if(mutates)scheduleSave();}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const payload=JSON.stringify(state);saveChain=saveChain.catch(()=>{}).then(async()=>{const r=await fetch('/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:payload});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||'Saving failed');}).catch(err=>toast(err.message,true));},240);}
function saveImmediate(){clearTimeout(saveTimer);const payload=JSON.stringify(state);saveChain=saveChain.catch(()=>{}).then(()=>fetch('/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:payload})).then(r=>{if(!r.ok)throw new Error('Save failed');}).catch(err=>toast(err.message,true));return saveChain;}
function compareTasks(a,b){
  const pd=(priorities[b.priority]||2)-(priorities[a.priority]||2);
  const ad=a.dueDate||'9999-12-31',bd=b.dueDate||'9999-12-31';
  if(a.priority==='urgent'||b.priority==='urgent') return pd || ad.localeCompare(bd);
  return ad.localeCompare(bd) || pd || String(a.createdAt||'').localeCompare(String(b.createdAt||''));
}
function getWindows(area,day){
  const s=state.settings,weekend=day.getDay()===0||day.getDay()===6;
  if(area==='work'){
    if(!(s.weekdays||[1,2,3,4,5]).includes(day.getDay()))return [];
    const start=minutes(s.workStart||'08:00'),end=minutes(s.workEnd||'17:00');
    const lunchA=minutes(s.lunchStart||'12:00'),lunchB=minutes(s.lunchEnd||'12:30');
    if(lunchB>lunchA&&lunchA<end&&lunchB>start)return [[start,Math.min(lunchA,end)],[Math.max(lunchB,start),end]].filter(([a,b])=>b>a);
    return end>start?[[start,end]]:[];
  }
  const start=minutes(weekend?s.weekendStart||'09:00':s.personalStart||'17:00');
  const end=minutes(weekend?s.weekendEnd||'20:00':s.personalEnd||'21:00');
  return end>start?[[start,end]]:[];
}
function replan(showToast=true){
  const active=state.tasks.filter(t=>!isDone(t)&&actionable(t)&&t.autoSchedule!==false);
  active.forEach(t=>{t.blocks=[];});
  const busy=new Map(),now=new Date(),rounded=at(now,now.getHours(),Math.ceil(now.getMinutes()/15)*15);
  function reserve(start,end){let k=start.slice(0,10);if(!busy.has(k))busy.set(k,[]);const a=parse(start),b=parse(end);if(!Number.isFinite(+a)||!Number.isFinite(+b)||b<=a)return;busy.get(k).push([a.getHours()*60+a.getMinutes(),b.getHours()*60+b.getMinutes()]);}
  state.events.forEach(e=>reserve(e.start,e.end));
  state.tasks.filter(t=>actionable(t)&&t.autoSchedule===false&&!isDone(t)).forEach(t=>(t.blocks||[]).forEach(b=>reserve(b.start,b.end)));
  const visit=new Set(),finished=new Set(),unsched=[];
  function assign(t){
    if(finished.has(t.id))return;
    if(visit.has(t.id)){unsched.push(t.title+' (circular dependency)');return;}
    visit.add(t.id);
    let earliest=new Date(rounded);
    let blocked=false;
    const parent=t.parentId?taskById(t.parentId):null;
    const dependencyIds=[...new Set([...(t.dependsOn||[]),...(parent?.dependsOn||[])])];
    for(const depid of dependencyIds){
      const dep=taskById(depid);if(!dep||isDone(dep)||dep.id===t.id)continue;
      // A parent task is a container, so its dependencies finish only when
      // all its subtasks are complete or fully scheduled.
      const items=isContainer(dep)?childrenOf(dep.id):[dep];
      for(const item of items){
        if(isDone(item))continue;
        if(item.autoSchedule!==false)assign(item);
        const blocks=item.blocks||[];
        if(!blocks.length||plannedMinutes(item)<(Number(item.estimate)||30)){blocked=true;break;}
        const last=new Date(Math.max(...blocks.map(b=>+parse(b.end))));
        if(last>earliest)earliest=last;
      }
      if(blocked)break;
    }
    if(!blocked){
      let remaining=Math.max(15,Number(t.estimate)||30);
      let day=at(earliest),days=0;
      while(remaining>0&&days<60){
        const dk=dateKey(day),startAt=days===0?earliest:at(day),baseMin=startAt.getHours()*60+startAt.getMinutes();
        const reserved=busy.get(dk)||[];
        for(const [start,end] of getWindows(taskArea(t),day)){
          if(remaining<=0)break;
          let pos=Math.max(start,Math.ceil(baseMin/15)*15);
          while(pos+15<=end&&remaining>0){
            const conflicting=reserved.filter(([a,b])=>b>pos&&a<end).sort((a,b)=>a[0]-b[0]);
            const overlapping=conflicting.find(([a,b])=>a<=pos&&b>pos);
            if(overlapping){pos=Math.ceil(overlapping[1]/15)*15;continue;}
            const next=conflicting.find(([a])=>a>pos);
            const available=Math.min(end,next?next[0]:end)-pos;
            if(available<15){pos+=15;continue;}
            const amount=Math.min(remaining,available);
            const a=at(day,0,pos),b=at(day,0,pos+amount);
            const block={start:datetime(a),end:datetime(b)};
            t.blocks.push(block);reserve(block.start,block.end);
            remaining-=amount;pos+=amount;
          }
        }
        days++;day=addDays(day,1);
      }
      if(remaining>0)unsched.push(t.title);
    } else unsched.push(t.title+' (dependency not ready)');
    visit.delete(t.id);finished.add(t.id);
  }
  active.sort(compareTasks).forEach(assign);
  if(showToast){toast(unsched.length?`Replanned. ${unsched.length} task(s) need attention.`:'Your schedule is updated.');}
  return unsched;
}
function render(){
  const sc=$('.cal-scroll'),oldScroll=sc?.scrollTop ?? 0,oldLeft=sc?.scrollLeft??0;
  $('#app').innerHTML=`<div class="app-shell">${sidebar()}<main class="main">${topbar()}${renderPage()}</main></div>${mobileBottom()}`;
  const scroll=$('.cal-scroll');
  if(scroll){
    if(scrollCal && calView!=='month')scroll.scrollTop=145;
    else {scroll.scrollTop=oldScroll;scroll.scrollLeft=oldLeft;}
  }
  scrollCal=false;
}
function sidebar(){const nav=[['home','Today','home'],['calendar','Calendar','calendar'],['projects','Projects','folder'],['inbox','Task inbox','inbox']];return `<aside class="sidebar"><div class="brand"><img class="brand-wordmark" src="/evnflo-wordmark.png" alt="EvnFlo"></div><div class="nav-group">Workspace</div>${nav.map(([v,l,i])=>`<button class="nav-item ${page===v?'active':''}" data-act="nav" data-view="${v}" aria-label="${l}">${I(i)}<span class="nav-text">${l}</span>${v==='inbox'&&unscheduled().length?`<span class="nav-count">${unscheduled().length}</span>`:''}</button>`).join('')}<div class="nav-group">Preferences</div><button class="nav-item ${page==='settings'?'active':''}" data-act="nav" data-view="settings">${I('settings')}<span class="nav-text">Settings</span></button><div class="sidebar-spacer"></div><div class="sidebar-footer"><div class="workspace-footnote"><p>My workspace</p><small>Just you. All in sync.</small></div></div></aside>`;}
function mobileBottom(){const nav=[['home','Today','home'],['calendar','Calendar','calendar'],['new-task','Add','plus'],['projects','Projects','folder'],['inbox','Inbox','inbox']];return `<nav class="mobile-bottom" aria-label="Mobile navigation">${nav.map(([v,l,i])=>`<button class="mobile-nav ${page===v?'active':''} ${v==='new-task'?'add':''}" data-act="${v==='new-task'?'new-task':'nav'}" ${v!=='new-task'?`data-view="${v}"`:''}>${I(i)}<span>${safe(l)}</span></button>`).join('')}</nav>`;}
function topbar(){return `<header class="topbar"><div class="top-left"><img class="mobile-wordmark" src="/evnflo-wordmark.png" alt="EvnFlo"><div class="topbar-intro"><div class="eyebrow">${fmt(new Date(),{weekday:'long',month:'long',day:'numeric'})}</div><div class="context">Your space to get things done.</div></div></div><div class="topbar-actions"><div class="workspace-switch">${['all','work','personal'].map(v=>`<button class="${scope===v?'active':''}" data-act="scope" data-value="${v}">${v==='all'?'All':v==='work'?'Work':'Personal'}</button>`).join('')}</div><button class="button" data-act="new-event">${I('calendar')} Event</button><button class="button primary" data-act="new-task">${I('plus')} New task</button></div></header>`;}
function renderPage(){return `<div class="page">${page==='calendar'?calendarPage():page==='projects'?projectsPage():page==='inbox'?inboxPage():page==='settings'?settingsPage():todayPage()}</div>`;}
function pageHeader(title,sub,actions=''){return `<div class="page-header"><div><h1>${title}</h1>${sub?`<p class="sub">${sub}</p>`:''}</div>${actions?`<div class="page-tools">${actions}</div>`:''}</div>`;}
function filteredTasks(){return state.tasks.filter(taskFits);}
function unscheduled(){return filteredTasks().filter(t=>actionable(t)&&!isDone(t)&&plannedMinutes(t)<Math.max(15,Number(t.estimate)||30)).sort(compareTasks);}
function warnings(){return filteredTasks().filter(t=>!isDone(t)&&t.dueDate&&(t.dueDate<today()||(t.blocks||[]).some(b=>b.end.slice(0,10)>t.dueDate)));}
function calendarPage(){const title=calView==='month'?fmt(focus,{month:'long',year:'numeric'}):calView==='day'?fmt(focus,{weekday:'long',month:'long',day:'numeric'}):`${fmt(monday(focus),{month:'short',day:'numeric'})} – ${fmt(addDays(monday(focus),6),{month:'short',day:'numeric',year:'numeric'})}`;
 const actions=`<div class="segmented">${['day','week','month'].map(v=>`<button data-act="calview" data-view="${v}" class="${calView===v?'active':''}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div><button class="button primary" data-act="plan">${I('spark')} Plan my week</button>`;
 return `${pageHeader('Calendar','Everything, right where it belongs.',actions)}<div class="calendar-layout"><section class="panel calendar-panel"><div class="cal-toolbar"><div class="cal-header-left"><button class="button small" data-act="today">Today</button><button class="button small icon-only" data-act="calmove" data-step="-1" aria-label="Previous">${I('chevronLeft')}</button><button class="button small icon-only" data-act="calmove" data-step="1" aria-label="Next">${I('chevronRight')}</button></div><h2>${safe(title)}</h2></div>${calView==='month'?monthView():gridView()}</section><aside class="rail"><section class="panel rail-panel"><div class="rail-heading"><h3>To be scheduled</h3><span class="counter">${unscheduled().length}</span></div>${unscheduled().length?unscheduled().slice(0,12).map(railTask).join(''):`<div class="empty-hint">All caught up!<br/>Your open tasks are on the calendar.</div>`}<button class="button small" style="width:100%;margin-top:8px" data-act="new-task">${I('plus')} Add a task</button></section><section class="panel rail-panel"><div class="rail-heading"><h3>At a glance</h3>${I('target')}</div><div class="stat-row"><div class="stat-cell"><div class="stat-num">${filteredTasks().filter(t=>!isDone(t)).length}</div><div class="stat-text">Open tasks</div></div><div class="stat-cell"><div class="stat-num">${filteredTasks().filter(isDone).length}</div><div class="stat-text">Completed</div></div></div>${warnings().length?`<div class="section-label" style="margin:16px 0 9px">Heads up</div><div class="warning-list">${warnings().slice(0,3).map(t=>`<div class="warning-item">${I('alert',12)} ${safe(t.title)} — ${t.dueDate<today()?'overdue':'may miss deadline'}</div>`).join('')}</div>`:''}<div class="legend" style="margin-top:16px"><span class="legend-item"><span class="legend-dot" style="background:#7b70f0"></span>Work</span><span class="legend-item"><span class="legend-dot" style="background:#dc967e"></span>Personal</span></div></section></aside></div>`;
}
function railTask(t){return `<div class="rail-task drag-item" draggable="true" data-drag-task="${safe(t.id)}" data-act="edit-task" data-id="${safe(t.id)}"><input class="task-check" type="checkbox" data-check-id="${safe(t.id)}" aria-label="Complete ${safe(t.title)}"><div class="rail-task-text"><div class="rail-task-title">${t.parentId?'↳ ':''}${safe(t.title)}</div><div class="rail-task-meta"><span>${I('clock',11)} ${duration(Number(t.estimate)||30)}</span>${categoryChip(t)}<span><span class="color-dot" style="background:${projectColor(t)}"></span>${safe(projectById(t.projectId)?.name|| (taskArea(t)==='work'?'Work':'Personal'))}</span>${t.dueDate?`<span>Due ${md(t.dueDate)}</span>`:''}</div></div>${I('grip',13)}</div>`;}
function itemsOn(day){const key=dateKey(day),result=[];
 for(const t of filteredTasks())for(const b of t.blocks||[])if(b.start?.slice(0,10)===key){result.push({type:'task',entity:t,start:b.start,end:b.end,color:projectColor(t),title:t.parentId?`${t.title} · ${taskById(t.parentId)?.title||'Subtask'}`:t.title,done:isDone(t)});}
 for(const e of state.events.filter(e=>areaFits(e.area||'work')))if(e.start?.slice(0,10)===key)result.push({type:'event',entity:e,start:e.start,end:e.end,color:e.area==='personal'?'#d89175':'#467eb4',title:e.title});
 return result.sort((a,b)=>a.start.localeCompare(b.start));
}
function gridView(){const days=calView==='day'?[at(focus)]:Array.from({length:7},(_,i)=>addDays(monday(focus),i));const dayMode=calView==='day';const base=6*60,end=22*60,h=(end-base)*1.2;
 const header=`<div class="week-head ${dayMode?'day-mode':''}" style="--days:${days.length}"><div class="time-spacer"></div>${days.map(d=>`<div class="day-head ${dateKey(d)===today()?'today':''}">${safe(fmt(d,{weekday:'short'}))}<span class="day-num">${d.getDate()}</span></div>`).join('')}</div>`;
 const ruler=`<div class="time-ruler" style="height:${h}px">${Array.from({length:16},(_,i)=>`<span class="time-label" style="top:${i*72}px">${fmt(at(new Date(),6+i,0),{hour:'numeric'})}</span>`).join('')}</div>`;
 const cols=days.map(d=>{
   const all=itemsOn(d),layout=[];
   for(const ev of all){const st=parse(ev.start),en=parse(ev.end);let start=st.getHours()*60+st.getMinutes(),finish=en.getHours()*60+en.getMinutes();if(finish<=base||start>=end)continue;start=Math.max(base,start);finish=Math.min(end,finish);layout.push({...ev,min:start,max:finish});}
   // Adjacent overlapping items get their own horizontal lanes.
   for(const item of layout){let lane=0;while(layout.some(other=>other!==item&&other.lane===lane&&other.min<item.max&&other.max>item.min))lane++;item.lane=lane;}
   return `<div class="day-column ${dateKey(d)===today()?'today':''}" data-drop="calendar" data-date="${dateKey(d)}" style="height:${h}px">${dateKey(d)===today()?nowIndicator(base,end):''}${layout.map(b=>{
    const peers=layout.filter(x=>x.min<b.max&&x.max>b.min);const lanes=Math.max(...peers.map(x=>x.lane))+1;
    const tint=b.color||'#7369e6';const top=(b.min-base)*1.2,height=Math.max(20,(b.max-b.min)*1.2-2);
    const left=2+(b.lane/lanes)*96,width=96/lanes;
    return `<button class="cal-block ${b.type==='event'?'fixed':''} ${b.done?'completed':''} ${height<42?'tiny':''}" draggable="${b.type==='task'?'true':'false'}" ${b.type==='task'?`data-drag-task="${safe(b.entity.id)}"`:''} data-act="${b.type==='task'?'edit-task':'edit-event'}" data-id="${safe(b.entity.id)}" title="${safe(b.title)}" style="top:${top}px;height:${height}px;left:${left}%;right:auto;width:calc(${width}% - 5px);background:${tint}1c;border-color:${tint}35;color:${tint};border-left:3px solid ${tint}"><div class="block-title">${safe(b.title)}${b.type==='task'?categoryChip(b.entity):''}</div><span class="resize-handle" data-resize-task="${b.type==='task'?safe(b.entity.id):''}" data-resize-index="${b.type==='task'?b.entity.blocks.indexOf(b.entity.blocks.find(x=>x.start===b.start&&x.end===b.end)):''}" aria-label="Resize task"></span><div class="block-time">${timeLabel(b.start)} – ${timeLabel(b.end)}</div></button>`;
   }).join('')}</div>`;
 }).join('');
 return `<div class="cal-scroll">${header}<div class="week-grid ${dayMode?'day-mode':''}" style="--days:${days.length}">${ruler}${cols}</div></div>`;
}
function nowIndicator(base,end){const n=new Date(),min=n.getHours()*60+n.getMinutes();return min>=base&&min<=end?`<div class="now-line" style="top:${(min-base)*1.2}px"></div>`:'';}
function monthView(){const first=at(focus);first.setDate(1);const start=monday(first);const days=Array.from({length:42},(_,i)=>addDays(start,i));return `<div class="month-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<div class="month-dayname">${x}</div>`).join('')}${days.map(d=>{const events=itemsOn(d),out=d.getMonth()!==focus.getMonth();return `<div class="month-cell ${out?'muted':''}" data-act="month-day" data-date="${dateKey(d)}"><div class="month-day ${dateKey(d)===today()?'today':''}" style="${out?'color:#b9c1cd':''}">${d.getDate()}</div>${events.slice(0,3).map(item=>`<div class="month-entry" style="background:${item.color}17;color:${item.color}">${item.type==='task'?categoryChip(item.entity):''}${safe(item.title)}</div>`).join('')}${events.length>3?`<div class="month-more">+${events.length-3} more</div>`:''}</div>`}).join('')}</div>`;}
function todayPage(){const d=new Date(),dk=dateKey(d),items=itemsOn(d),toDo=filteredTasks().filter(t=>actionable(t)&&!isDone(t)),weekEnd=addDays(d,7);const dueSoon=toDo.filter(t=>t.dueDate&&t.dueDate>=dk&&t.dueDate<=dateKey(weekEnd)).length;return `${pageHeader('Good to see you.','Here’s what’s on your plate today.',`<button class="button primary" data-act="plan">${I('spark')} Plan my day</button>`)}<div class="today-brief"><div class="panel brief-card"><b>${items.length}</b><small>Scheduled blocks today</small></div><div class="panel brief-card"><b>${toDo.length}</b><small>Open tasks</small></div><div class="panel brief-card"><b>${dueSoon}</b><small>Due in the next 7 days</small></div></div><div class="quick-task-row"><input id="quick-task" placeholder="Add something you need to do..." aria-label="New quick task"/><button class="button primary" data-act="quick-add">${I('plus')} Add</button></div><div class="today-layout"><section class="panel"><div class="cal-toolbar"><h2>Today's plan</h2><button class="button small" data-act="nav" data-view="calendar">Full calendar ${I('arrow')}</button></div>${items.length?items.map(it=>`<div class="today-item"><div class="today-time">${timeLabel(it.start)}</div><div class="today-marker" style="background:${it.color}"></div><div style="flex:1"><div class="today-text" data-act="${it.type==='task'?'edit-task':'edit-event'}" data-id="${safe(it.entity.id)}">${safe(it.title)}</div><div class="today-meta">${duration(minutesBetween(it.start,it.end))} · ${it.type==='event'?'Event':safe(it.entity.parentId?`Subtask of ${taskById(it.entity.parentId)?.title||'task'}`:projectById(it.entity.projectId)?.name||taskArea(it.entity))}</div></div>${it.type==='task'?`<input class="task-check" type="checkbox" ${isDone(it.entity)?'checked':''} data-check-id="${safe(it.entity.id)}" aria-label="Complete task"/>`:''}</div>`).join(''):`<div class="empty-state"><div class="empty-icon">${I('calendar')}</div><h3>A clear calendar</h3><p>Add some tasks, then select “Plan my day” and the planner will find space for them.</p><button class="button primary" data-act="new-task">${I('plus')} Add your first task</button></div>`}</section><section class="panel rail-panel"><div class="rail-heading"><h3>Coming up</h3><button class="button small" data-act="nav" data-view="inbox">All tasks ${I('arrow')}</button></div>${toDo.sort(compareTasks).slice(0,9).map(railTask).join('')||'<div class="empty-hint">Nothing overdue. Nothing forgotten. Nice.</div>'}</section></div>`;}
function projectsPage(){
 if(projectId){const p=projectById(projectId);if(!p){projectId=null;return projectsPage();}return projectDetail(p);}
 const list=state.projects.filter(p=>areaFits(p.area||'work'));
 const action=`<button class="button primary" data-act="new-project">${I('plus')} New project</button>`;
 return `${pageHeader('Projects','Big goals, broken into manageable steps.',action)}${list.length?`<div class="project-grid">${list.map(projectCard).join('')}</div>`:`<div class="panel empty-state"><div class="empty-icon">${I('folder')}</div><h3>Start with one project</h3><p>Make a home for your tasks. See progress on a board, list, or timeline—and schedule the actual work on your calendar.</p><div class="multi-actions"><button class="button primary" data-act="new-project">${I('plus')} Create a project</button><button class="button" data-act="demo">Try sample projects</button></div></div>`}`;
}
function projectCard(p){const tasks=state.tasks.filter(t=>t.projectId===p.id),st=projectStats(tasks),done=st.completed,prog=st.percent;return `<section class="panel project-card" data-act="open-project" data-id="${safe(p.id)}" role="button" tabindex="0"><div style="display:flex;justify-content:space-between;align-items:center"><div class="project-symbol" style="background:${p.color}18;color:${p.color}">${I('folder',21)}</div><span class="scope-chip ${p.area==='personal'?'personal':''}">${p.area==='personal'?'Personal':'Work'}</span></div><div><div class="project-name">${safe(p.name)}</div><div class="project-description">${safe(p.description||'A space for what matters.')}</div></div><div style="margin-top:auto"><div class="project-card-bottom" style="margin-bottom:9px"><span>${done} of ${st.total} tasks complete${st.subtasks?' · '+st.subtasks+' subtasks':''}</span><strong style="color:${p.color}">${prog}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${prog}%;background:${p.color}"></div></div><div class="project-card-bottom" style="margin-top:13px"><span>${p.deadline?`Due ${md(p.deadline)}`:'No deadline'}</span><span>${I('arrow',14)}</span></div></div></section>`;}
function projectDetail(p){const tasks=state.tasks.filter(t=>t.projectId===p.id),st=projectStats(tasks),done=st.completed,prog=st.percent;
 const actions=`<button class="button" data-act="edit-project" data-id="${safe(p.id)}">${I('edit')} Edit project</button><button class="button primary" data-act="new-task" data-project="${safe(p.id)}">${I('plus')} Add task</button>`;
 return `<div class="breadcrumb"><button data-act="back-projects">Projects</button>${I('chevronRight',12)}<span>${safe(p.name)}</span></div>${pageHeader(safe(p.name),safe(p.description||'All your work, in one place.'),actions)}<div class="project-summary"><div class="summary-card"><div class="number">${st.total}</div><div class="caption">Main tasks${st.subtasks?` · ${st.subtasks} subtasks`:``}</div></div><div class="summary-card"><div class="number">${done}</div><div class="caption">Completed</div></div><div class="summary-card"><div class="number">${prog}%</div><div class="caption">Progress</div></div></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap"><div class="segmented">${[['board','Board'],['list','List'],['timeline','Timeline']].map(([v,l])=>`<button class="${projectView===v?'active':''}" data-act="projectview" data-view="${v}">${l}</button>`).join('')}</div><div class="mini-progress"><div class="progress-track"><div class="progress-fill" style="width:${prog}%;background:${p.color}"></div></div>${prog}% complete</div></div>${projectView==='board'?projectBoard(p,mainTasks(tasks)):projectView==='list'?projectList(p,tasks):projectTimeline(p,tasks)}`;
}
function projectBoard(p,tasks){return `<div class="board">${statuses.map(s=>{const subset=tasks.filter(t=>t.status===s);return `<div class="board-col" data-drop="board" data-status="${s}"><div class="board-col-head"><span>${statusNames[s]}</span><span class="board-count">${subset.length}</span></div>${subset.length?subset.sort(compareTasks).map(t=>boardCard(t)).join(''):`<div class="board-empty">Drop tasks here</div>`}<button class="button small" style="width:100%;margin-top:6px;background:transparent;border-style:dashed" data-act="new-task" data-project="${safe(p.id)}" data-status="${s}">${I('plus')} Add task</button></div>`;}).join('')}</div>`;}
function boardCard(t){
 const {done,total}=taskProgress(t);
 return `<article class="board-card drag-item" draggable="true" data-drag-task="${safe(t.id)}" data-act="edit-task" data-id="${safe(t.id)}"><div style="display:flex;align-items:center;justify-content:space-between;gap:5px;margin-bottom:10px"><span class="badge ${safe(t.priority||'normal')}">${safe((t.priority||'normal').replace(/^./,m=>m.toUpperCase()))}</span>${I('grip',13)}</div><div class="board-card-title">${safe(t.title)}</div><div class="board-card-footer"><span>${total?`${I('check',12)} ${done}/${total} subtasks`:`${I('clock',12)} ${duration(Number(t.estimate)||30)}`}</span><span>${t.dueDate?`Due ${md(t.dueDate)}`:''}</span></div>${total?`<div class="progress-track" style="margin-top:11px"><div class="progress-fill" style="width:${done/total*100}%;background:${projectColor(t)}"></div></div>`:''}<button type="button" class="subtask-shortcut" data-act="new-subtask" data-id="${safe(t.id)}">${I('plus',12)} Subtask</button></article>`;
}
function projectList(p,tasks){
 const rows=sortedHierarchy(tasks);
 return `<div class="panel task-list-panel">${rows.length?`<div style="overflow:auto"><table class="task-table"><thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Estimate</th><th>Due date</th><th></th></tr></thead><tbody>${rows.map(t=>`<tr class="${t.parentId?'subtask-table-row':''}"><td><div style="display:flex;align-items:center;gap:10px"><input class="task-check" type="checkbox" ${isDone(t)?'checked':''} data-check-id="${safe(t.id)}" aria-label="Complete ${safe(t.title)}"/><span data-act="edit-task" data-id="${safe(t.id)}" style="cursor:pointer">${t.parentId?`<span class="subtask-arrow">↳</span>`:''}${safe(t.title)}</span>${!t.parentId&&childrenOf(t.id).length?`<span class="tiny-count">${taskProgress(t).done}/${taskProgress(t).total}</span>`:''}</div></td><td><span class="status-pill">${statusNames[t.status]||'To do'}</span></td><td><span class="badge ${safe(t.priority||'normal')}">${safe(t.priority||'normal')}</span></td><td>${isContainer(t)?'Subtasks':duration(Number(t.estimate)||30)}</td><td>${md(t.dueDate)}</td><td style="white-space:nowrap">${!t.parentId?`<button class="button icon-only small quiet" data-act="new-subtask" data-id="${safe(t.id)}" aria-label="Add subtask">${I('plus',14)}</button>`:''}<button class="button icon-only small quiet" data-act="edit-task" data-id="${safe(t.id)}" aria-label="Edit task">${I('edit',14)}</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state"><div class="empty-icon">${I('list')}</div><h3>Nothing here yet</h3><p>Add tasks to start tracking this project.</p><button class="button primary" data-act="new-task" data-project="${safe(p.id)}">${I('plus')} Add task</button></div>`}</div>`;
}
function projectTimeline(p,tasks){const start=monday(new Date());const days=Array.from({length:14},(_,i)=>addDays(start,i));const end=addDays(start,14);const widthDays=14;
 return `<div class="panel timeline-panel"><div class="section-label" style="margin-bottom:8px">Next two weeks · Scheduled work and deadlines</div><div class="timeline-table"><div class="timeline-head"><div class="timeline-label">Task</div>${days.map(d=>`<div class="timeline-date">${fmt(d,{weekday:'narrow'})}<br/>${d.getDate()}</div>`).join('')}</div>${tasks.length?sortedHierarchy(tasks).map(t=>{
   const blocks=(t.blocks||[]).map(b=>parse(b.start)).filter(d=>d>=start&&d<end);
   const due=t.dueDate?parse(`${t.dueDate}T12:00`):null;
   const plannedDays=blocks.map(x=>Math.floor((at(x)-start)/86400000));
   const dueDay=due?Math.floor((at(due)-start)/86400000):null;
   const cells=days.map((d,i)=>`<div class="timeline-date" style="background:${dateKey(d)===today()?'#fbfaff':'transparent'}"></div>`).join('');
   let track='';const idx=[...new Set(plannedDays)].filter(i=>i>=0&&i<widthDays).sort((a,b)=>a-b);
   for(let i=0;i<idx.length;i++){const day=idx[i];track+=`<div class="timeline-bar" data-act="edit-task" data-id="${safe(t.id)}" title="Scheduled: ${safe(t.title)}" style="grid-column:${day+2};grid-row:1;background:${projectColor(t)};margin:0 4px"></div>`;}
   if(dueDay!==null&&dueDay>=0&&dueDay<widthDays)track+=`<div data-act="edit-task" data-id="${safe(t.id)}" title="Due ${md(t.dueDate)}" style="grid-column:${dueDay+2};grid-row:1;z-index:2;justify-self:end;color:#e17b82;font-weight:900;font-size:17px;cursor:pointer;margin-right:1px">│</div>`;
   return `<div class="timeline-task"><div class="timeline-label" data-act="edit-task" data-id="${safe(t.id)}" style="cursor:pointer">${t.parentId?'↳ ':''}${safe(t.title)}</div>${cells}${track}</div>`;
 }).join(''):`<div class="timeline-empty">Add tasks to display your project timeline.</div>`}</div><div style="display:flex;gap:14px;margin:13px 0 2px;font-size:11px;color:#9aa4b4"><span>■ Scheduled work</span><span style="color:#e17b82">│ Due date</span><span>Drag tasks on the Calendar to fix their time.</span></div></div>`;}
function inboxPage(){const tasks=filteredTasks(),incomplete=tasks.filter(t=>!isDone(t)).sort(compareTasks),done=tasks.filter(isDone).sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
 return `${pageHeader('Task inbox','Capture it now. Figure out the timing later.',`<button class="button primary" data-act="new-task">${I('plus')} Add task</button>`)}<div class="inbox-layout"><section class="panel inbox-list"><div class="rail-heading"><h3>To do <span style="color:#adb4c0;font-weight:500">(${incomplete.length})</span></h3><button class="button small" data-act="plan">${I('spark')} Schedule</button></div>${incomplete.length?incomplete.map(inboxTask).join(''):`<div class="empty-state"><div class="empty-icon">${I('check')}</div><h3>All clear</h3><p>Add a task when you're ready.</p></div>`}</section><section class="panel inbox-list"><div class="rail-heading"><h3>Completed <span style="color:#adb4c0;font-weight:500">(${done.length})</span></h3></div>${done.length?done.slice(0,40).map(inboxTask).join(''):`<div class="empty-hint">Completed work will show up here.</div>`}</section></div>`;
}
function inboxTask(t){return `<div class="inbox-task"><input class="task-check" type="checkbox" ${isDone(t)?'checked':''} data-check-id="${safe(t.id)}" aria-label="Complete ${safe(t.title)}"/><div style="flex:1;min-width:0" data-act="edit-task" data-id="${safe(t.id)}"><div style="font-weight:750;font-size:12px;${isDone(t)?'text-decoration:line-through;color:#a3adbb':''}">${t.parentId?'↳ ':''}${safe(t.title)}${categoryChip(t)}${!t.parentId&&childrenOf(t.id).length?` <span class="tiny-count">${taskProgress(t).done}/${taskProgress(t).total}</span>`:''}</div><div class="inbox-task-meta"><span class="color-dot" style="background:${projectColor(t)}"></span>${safe(projectById(t.projectId)?.name||taskArea(t))} · ${duration(Number(t.estimate)||30)}${t.dueDate?' · Due '+md(t.dueDate):''}${t.blocks?.length?' · Scheduled':''}</div></div>${!t.parentId?`<button class="button icon-only small quiet" data-act="new-subtask" data-id="${safe(t.id)}" aria-label="Add subtask">${I('plus',14)}</button>`:''}${I('chevronRight',14)}</div>`;}
function settingsPage(){const s=state.settings,days=['Su','Mo','Tu','We','Th','Fr','Sa'];return `${pageHeader('Settings','Make your planner work the way you actually do.')}
 <div class="settings-wrap"><section class="panel settings-panel"><h3>Work hours</h3><p>Your planner places work tasks only on your selected days and hours. Calendar events are kept clear.</p><div class="field-row"><div class="field"><label for="workStart">Start work</label><input type="time" id="workStart" name="workStart" value="${safe(s.workStart)}" data-setting="workStart"/></div><div class="field"><label for="workEnd">Finish work</label><input type="time" id="workEnd" name="workEnd" value="${safe(s.workEnd)}" data-setting="workEnd"/></div></div><div class="field"><label>Days I work</label><div class="day-buttons">${days.map((d,i)=>`<button class="${s.weekdays.includes(i)?'selected':''}" data-act="weekday" data-index="${i}">${d}</button>`).join('')}</div></div><div class="field-row"><div class="field"><label for="lunchStart">Break from</label><input type="time" id="lunchStart" name="lunchStart" value="${safe(s.lunchStart)}" data-setting="lunchStart"/></div><div class="field"><label for="lunchEnd">Break until</label><input type="time" id="lunchEnd" name="lunchEnd" value="${safe(s.lunchEnd)}" data-setting="lunchEnd"/></div></div></section>
 <section class="panel settings-panel"><h3>Personal time</h3><p>Give personal tasks their own space outside work, plus a wider window on weekends.</p><div class="field-row"><div class="field"><label>Weekday start</label><input type="time" data-setting="personalStart" value="${safe(s.personalStart)}"/></div><div class="field"><label>Weekday end</label><input type="time" data-setting="personalEnd" value="${safe(s.personalEnd)}"/></div><div class="field"><label>Weekend start</label><input type="time" data-setting="weekendStart" value="${safe(s.weekendStart)}"/></div><div class="field"><label>Weekend end</label><input type="time" data-setting="weekendEnd" value="${safe(s.weekendEnd)}"/></div></div></section>
 <section class="panel settings-panel"><h3>Task categories</h3><p>Choose the names and colors that help you scan your plan. Existing tasks keep their category when you rename it.</p><div class="category-settings">${(s.categories||[]).map(c=>`<div class="category-setting"><input value="${safe(c.name)}" data-category-field="name" data-category-id="${safe(c.id)}"/><input type="color" value="${safe(c.color)}" data-category-field="color" data-category-id="${safe(c.id)}"/><button class="button small quiet" data-act="remove-category" data-id="${safe(c.id)}" ${s.categories.length<2?'disabled':''}>Remove</button></div>`).join('')}</div><button class="button small" data-act="add-category">${I('plus')} Add category</button></section>
 <section class="panel settings-panel"><h3>Scheduling</h3><p>Let your planner make the plan automatically, or choose when you want to recalculate.</p><label class="toggle-row"><div><strong>Auto-plan on changes</strong><small>Rebalance tasks when you add, edit, or finish something</small></div><input type="checkbox" class="switch" data-setting="autoPlan" ${s.autoPlan?'checked':''}/></label><div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><button class="button primary" data-act="plan">${I('refresh')} Rebuild schedule</button></div></section>
 <section class="panel settings-panel"><h3>Data and account</h3><p>Your information is stored on your own server. Back it up whenever you want.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="button" data-act="export">${I('download')} Export backup</button><button class="button" data-act="import">${I('upload')} Import backup</button><button class="button" data-act="logout">${I('logout')} Sign out</button></div><input id="import-file" type="file" accept=".json,application/json" hidden/><div style="margin-top:17px" class="tiny-notice">Local file storage is active. For Railway, mount a volume at /data and set DATA_DIR=/data to preserve data after redeploys.</div><button class="button danger small" data-act="clear" style="margin-top:16px">${I('trash')} Delete all planner data</button></section></div>`;}
function emptyProjectOptions(selected){return `<option value="">No project</option>${state.projects.map(p=>`<option value="${safe(p.id)}" ${selected===p.id?'selected':''}>${safe(p.name)}</option>`).join('')}`;}
const selectOptions=(values,selected)=>values.map(([value,label])=>`<option value="${safe(value)}" ${String(value)===String(selected)?'selected':''}>${safe(label)}</option>`).join('');
function modal(markup,wide=false){$('#modal-root').innerHTML=`<div class="modal-overlay" data-act="overlay"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${markup}</section></div>`;const first=$('#modal-root input:not([type=hidden])');if(first)setTimeout(()=>first.focus(),40);}
function closeModal(){$('#modal-root').innerHTML='';}
function modalHead(title){return `<div class="modal-head"><h2>${safe(title)}</h2><button class="button quiet icon-only" type="button" data-act="close-modal" aria-label="Close">${I('close')}</button></div>`;}
function taskModal(existing=null,options={}){
 const parent=options.parentId?taskById(options.parentId):(existing?.parentId?taskById(existing.parentId):null);
 const t=existing||{id:'',title:'',notes:'',parentId:parent?.id||'',projectId:parent?.projectId||options.project||'',area:parent?.area||(scope==='personal'?'personal':'work'),status:options.status||'todo',priority:parent?.priority||'normal',estimate:30,dueDate:'',autoSchedule:true,dependsOn:[],blocks:[]};
 const pin=t.autoSchedule===false,firstBlock=t.blocks?.[0],fixedStart=firstBlock?.start||`${today()}T09:00`;
 const deps=state.tasks.filter(x=>x.id!==t.id&&x.id!==parent?.id&&x.parentId!==t.id&&(!t.projectId||x.projectId===t.projectId)&&x.status!=='done');
 const kids=!parent&&existing?childrenOf(t.id):[];
 const parentNote=parent?`<div class="parent-context"><button type="button" data-act="return-parent" data-id="${safe(parent.id)}">${I('chevronLeft',13)} ${safe(parent.title)}</button><span>Subtask · scheduled independently</span></div>`:'';
 const subtaskSection=!parent?`<div class="divider"></div><div class="field"><label>Subtasks ${kids.length?`(${kids.filter(isDone).length}/${kids.length} done)`:''}</label>${existing?`<div class="subtasks-box">${kids.length?kids.map(child=>`<div class="subtask-item"><input class="task-check" type="checkbox" data-check-id="${safe(child.id)}" ${isDone(child)?'checked':''} aria-label="Complete ${safe(child.title)}"/><button type="button" class="subtask-item-name ${isDone(child)?'completed':''}" data-act="edit-task" data-id="${safe(child.id)}">${safe(child.title)}<small>${duration(Number(child.estimate)||30)} · ${safe(child.priority)}${child.dueDate?' · Due '+md(child.dueDate):''}</small></button><button type="button" class="button small quiet icon-only" data-act="edit-task" data-id="${safe(child.id)}" aria-label="Edit subtask">${I('edit',13)}</button></div>`).join(''):`<div class="subtask-empty">No subtasks yet. Add one to break this down.</div>`}<button type="button" class="button small subtask-add" data-act="new-subtask" data-id="${safe(t.id)}">${I('plus',13)} Add subtask</button></div>`:`<div class="field-hint">Save this task first, then reopen it to add subtasks with their own dates, priorities, and calendar time.</div>`}${kids.length?`<div class="field-hint">The parent organizes these subtasks; only the individual subtasks take calendar time.</div>`:''}</div>`:'';
 const projectField=parent?`<div class="field"><label>Project</label><input value="${safe(projectById(parent.projectId)?.name||'No project')}" disabled/><div class="field-hint">Inherits project and Work/Personal space from the parent.</div></div>`:`<div class="field-row"><div class="field"><label>Project</label><select name="projectId">${emptyProjectOptions(t.projectId)}</select></div><div class="field"><label>Space</label><select name="area">${selectOptions([['work','Work'],['personal','Personal']],t.area||'work')}</select></div></div>`;
 const scheduleHint=kids.length?`<div class="tiny-notice">This is a parent task with ${kids.length} subtasks. The calendar schedules the subtasks individually, without double-booking the parent.</div>`:'';
 modal(`${modalHead(existing?(parent?'Edit subtask':'Edit task'):(parent?'New subtask':'New task'))}<form id="task-form">${parentNote}<div class="modal-body"><div class="field"><label>${parent?'Subtask':'Task'} name</label><input name="title" placeholder="What needs to get done?" value="${safe(t.title)}" required maxlength="170"/></div>${projectField}<div class="field"><label>Category</label><select name="categoryId">${(state.settings.categories||[]).map(c=>`<option value="${safe(c.id)}" ${c.id===(t.categoryId||'general')?'selected':''}>${safe(c.name)}</option>`).join('')}</select></div><div class="field-row"><div class="field"><label>Status</label><select name="status">${selectOptions(Object.entries(statusNames),t.status)}</select></div><div class="field"><label>Priority</label><select name="priority">${selectOptions([['urgent','Urgent'],['high','High'],['normal','Normal'],['low','Low']],t.priority)}</select></div></div><div class="field-row"><div class="field"><label>Time needed</label><select name="estimate">${selectOptions([[15,'15 minutes'],[30,'30 minutes'],[45,'45 minutes'],[60,'1 hour'],[90,'1.5 hours'],[120,'2 hours'],[180,'3 hours'],[240,'4 hours'],[360,'6 hours'],[480,'8 hours']],t.estimate)}</select></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${safe(t.dueDate||'')}"/></div></div><div class="field"><label>Notes</label><textarea name="notes" placeholder="Details, links, anything useful...">${safe(t.notes||'')}</textarea></div><div class="divider"></div><div class="field"><label>Scheduling</label><select id="schedule-mode" name="scheduleMode" ${kids.length?'disabled':''}>${selectOptions([['auto','Automatically find time'],['fixed','Keep at a fixed time']],pin?'fixed':'auto')}</select><div class="field-hint">${kids.length?'Only subtasks are put on the calendar.':'Automatic tasks move around events and your working hours.'}</div></div>${scheduleHint}<div class="field-row ${pin&&!kids.length?'':'hidden'}" id="fixed-fields"><div class="field"><label>Date</label><input type="date" name="fixedDate" value="${safe(fixedStart.slice(0,10))}"/></div><div class="field"><label>Start time</label><input type="time" name="fixedTime" value="${safe(fixedStart.slice(11,16))}"/></div></div>${subtaskSection}${deps.length?`<div class="field"><label>Must happen after (dependencies)</label><div class="depend-list">${deps.map(d=>`<label><input type="checkbox" name="dependency" value="${safe(d.id)}" ${(t.dependsOn||[]).includes(d.id)?'checked':''}/> ${safe(d.title)}</label>`).join('')}</div></div>`:''}</div><div class="modal-foot">${existing?`<button type="button" class="button danger" data-act="delete-task" data-id="${safe(t.id)}">${I('trash')} Delete</button>`:'<span></span>'}<div class="modal-foot-right"><button type="button" class="button" data-act="close-modal">Cancel</button><button type="submit" class="button primary">${I('check')} ${existing?'Save changes':parent?'Add subtask':'Add task'}</button></div></div></form>`,true);
 $('#task-form').dataset.id=t.id;
 $('#task-form').dataset.parentId=parent?.id||'';
 $('#task-form').dataset.returnToParent=options.returnToParent?'1':'0';
 $('#task-form').addEventListener('submit',saveTaskFromModal);
 $('#schedule-mode').addEventListener('change',e=>$('#fixed-fields').classList.toggle('hidden',e.target.value!=='fixed'));
}
function saveTaskFromModal(e){
 e.preventDefault();const form=e.currentTarget,fd=new FormData(form),old=taskById(form.dataset.id),parent=taskById(form.dataset.parentId);
 const title=String(fd.get('title')||'').trim();if(!title){toast('Add a task name.',true);return;}
 const projectId=parent?.projectId||String(fd.get('projectId')||'');const project=projectById(projectId);
 const estimate=Number(fd.get('estimate')||30);
 const hasKids=!!old&&isContainer(old);
 const autoSchedule=hasKids||fd.get('scheduleMode')==='auto';
 const blocks=[];
 if(!autoSchedule){const day=String(fd.get('fixedDate')||today()),time=String(fd.get('fixedTime')||'09:00');const start=parse(`${day}T${time}`),end=new Date(start.getTime()+estimate*60000);if(dateKey(start)!==dateKey(end)){toast('Fixed tasks need to fit on the same day.',true);return;}if(!confirmOverlap({...old,title,area:parent?.area||project?.area||String(fd.get('area')||'work')},datetime(start),datetime(end)))return;blocks.push({start:datetime(start),end:datetime(end),manual:true});}
 const obj={...(old||{}),id:old?.id||id(),parentId:parent?.id||'',title,notes:String(fd.get('notes')||'').trim(),projectId,area:parent?.area||project?.area||String(fd.get('area')||'work'),status:String(fd.get('status')||'todo'),priority:String(fd.get('priority')||'normal'),estimate,dueDate:String(fd.get('dueDate')||''),categoryId:String(fd.get('categoryId')||'general'),autoSchedule,blocks:autoSchedule?(old?.autoSchedule===true?old.blocks||[]:[]):blocks,dependsOn:fd.getAll('dependency').map(String),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 if(hasKids)obj.blocks=[];
 if(obj.status==='done'){obj.completedAt=new Date().toISOString();obj.blocks=[];}else obj.completedAt=null;
 recordUndo('task change');
 if(old)state.tasks.splice(state.tasks.indexOf(old),1,obj);else state.tasks.push(obj);
 if(hasKids&&obj.status==='done')childrenOf(obj.id).forEach(child=>changeTaskStatus(child,'done'));
 if(hasKids&&obj.status==='todo')childrenOf(obj.id).forEach(child=>changeTaskStatus(child,'todo'));
 if(old&&!parent&&(old.projectId!==obj.projectId||old.area!==obj.area))childrenOf(obj.id).forEach(child=>{child.projectId=obj.projectId;child.area=obj.area;});
 if(parent){parent.blocks=[];parent.autoSchedule=true;syncParent(parent.id);}
 if(hasKids)syncParent(obj.id);
 closeModal();update();
 if(parent&&form.dataset.returnToParent==='1')taskModal(taskById(parent.id));
 else toast(old?'Task updated.':parent?'Subtask added.':'Task added.',false,true);
}
function projectModal(existing=null){const p=existing||{id:'',name:'',description:'',area:scope==='personal'?'personal':'work',color:colorChoices[state.projects.length%colorChoices.length],deadline:''};
 modal(`${modalHead(existing?'Edit project':'New project')}<form id="project-form"><div class="modal-body"><div class="field"><label>Project name</label><input name="name" value="${safe(p.name)}" placeholder="e.g. Production improvements" maxlength="120" required/></div><div class="field"><label>Description</label><textarea name="description" placeholder="What are we working toward?">${safe(p.description)}</textarea></div><div class="field-row"><div class="field"><label>Space</label><select name="area">${selectOptions([['work','Work'],['personal','Personal']],p.area)}</select></div><div class="field"><label>Target date (optional)</label><input type="date" name="deadline" value="${safe(p.deadline)}"/></div></div><div class="field"><label>Colour</label><div style="display:flex;gap:8px;flex-wrap:wrap">${colorChoices.map(c=>`<label style="display:block"><input type="radio" name="color" value="${c}" ${p.color===c?'checked':''} style="position:absolute;opacity:0"/><span class="color-choice" style="display:block;width:33px;height:33px;border-radius:10px;background:${c};border:3px solid ${p.color===c?'#1c2844':'transparent'};box-shadow:inset 0 0 0 2px white;cursor:pointer"></span></label>`).join('')}</div></div></div><div class="modal-foot">${existing?`<button class="button danger" type="button" data-act="delete-project" data-id="${safe(p.id)}">${I('trash')} Delete</button>`:'<span></span>'}<div class="modal-foot-right"><button type="button" class="button" data-act="close-modal">Cancel</button><button class="button primary" type="submit">${I('check')} Save project</button></div></div></form>`);
 $('#project-form').dataset.id=p.id;
 $('#project-form').addEventListener('submit',e=>{e.preventDefault();recordUndo('project change');const fd=new FormData(e.currentTarget),old=projectById(e.currentTarget.dataset.id),name=String(fd.get('name')||'').trim();if(!name)return;
  const obj={...(old||{}),id:old?.id||id(),name,description:String(fd.get('description')||'').trim(),area:String(fd.get('area')||'work'),deadline:String(fd.get('deadline')||''),color:String(fd.get('color')||colorChoices[0]),createdAt:old?.createdAt||new Date().toISOString()};
  if(old){state.projects.splice(state.projects.indexOf(old),1,obj);state.tasks.filter(t=>t.projectId===obj.id).forEach(t=>t.area=obj.area);} else state.projects.push(obj);
  closeModal();update();toast(old?'Project updated.':'Project created.',false,true);
 });
 $$('#project-form input[name=color]').forEach(e=>e.addEventListener('change',()=>$$('#project-form .color-choice').forEach((x,i)=>x.style.borderColor=colorChoices[i]===e.value?'#1c2844':'transparent')));
}
function eventModal(existing=null,clickDate=null,clickTime='09:00'){const d=clickDate||dateKey(focus),e=existing||{id:'',title:'',notes:'',start:`${d}T${clickTime}`,end:`${d}T${pad((Number(clickTime.slice(0,2))+1)%24)}:${clickTime.slice(3,5)}`,area:scope==='personal'?'personal':'work'};
 modal(`${modalHead(existing?'Edit event':'New event')}<form id="event-form"><div class="modal-body"><div class="field"><label>Event name</label><input name="title" value="${safe(e.title)}" placeholder="Meeting, appointment, commitment..." maxlength="150" required/></div><div class="field"><label>Date</label><input name="date" type="date" value="${safe(e.start.slice(0,10))}" required/></div><div class="field-row"><div class="field"><label>Starts</label><input type="time" name="start" value="${safe(e.start.slice(11,16))}" required/></div><div class="field"><label>Ends</label><input type="time" name="end" value="${safe(e.end.slice(11,16))}" required/></div></div><div class="field"><label>Space</label><select name="area">${selectOptions([['work','Work'],['personal','Personal']],e.area)}</select></div><div class="field"><label>Notes</label><textarea name="notes" placeholder="Optional details">${safe(e.notes||'')}</textarea></div><div class="tiny-notice" style="margin-bottom:18px">Events stay fixed. Your planner schedules tasks around them.</div></div><div class="modal-foot">${existing?`<button type="button" class="button danger" data-act="delete-event" data-id="${safe(e.id)}">${I('trash')} Delete</button>`:'<span></span>'}<div class="modal-foot-right"><button type="button" class="button" data-act="close-modal">Cancel</button><button type="submit" class="button primary">${I('check')} Save event</button></div></div></form>`);
 $('#event-form').dataset.id=e.id;
 $('#event-form').addEventListener('submit',evt=>{evt.preventDefault();recordUndo('event change');const fd=new FormData(evt.currentTarget),old=state.events.find(e=>e.id===evt.currentTarget.dataset.id),day=String(fd.get('date')),start=`${day}T${fd.get('start')}`,end=`${day}T${fd.get('end')}`;
 if(end<=start){toast('End time must be after start time.',true);return;}
 const obj={...(old||{}),id:old?.id||id(),title:String(fd.get('title')||'').trim(),start,end,area:String(fd.get('area')||'work'),notes:String(fd.get('notes')||'').trim(),createdAt:old?.createdAt||new Date().toISOString()};if(!obj.title)return;
 if(old)state.events.splice(state.events.indexOf(old),1,obj);else state.events.push(obj);closeModal();update();toast(old?'Event updated.':'Event added.',false,true);
 });
}
function addQuickTask(){const input=$('#quick-task');const title=input?.value.trim();if(!title){input?.focus();return;}state.tasks.push({id:id(),title,notes:'',projectId:'',area:scope==='personal'?'personal':'work',status:'todo',priority:'normal',estimate:30,dueDate:'',categoryId:'general',autoSchedule:true,blocks:[],dependsOn:[],subtasks:[],createdAt:new Date().toISOString()});update();toast('Added to your plan.');}
function markTask(id,checked){
 recordUndo('task status change');const t=taskById(id);if(!t)return;
 changeTaskStatus(t,checked?'done':'todo');update();toast('Task status updated.',false,true);
 const openParentId=$('#task-form')?.dataset.id;
 if(openParentId&&openParentId===t.parentId)taskModal(taskById(openParentId));
}
function loadDemo(){if(state.projects.length||state.tasks.length||state.events.length){if(!confirm('Add example projects and tasks alongside your existing items?'))return;}
 const p1={id:id(),name:'Production improvements',description:'Plan the next round of process improvements.',area:'work',color:'#7165e8',deadline:dateKey(addDays(new Date(),20)),createdAt:new Date().toISOString()};
 const p2={id:id(),name:'Personal goals',description:'A few things to get done outside work.',area:'personal',color:'#df9864',deadline:'',createdAt:new Date().toISOString()};
 state.projects.push(p1,p2);
 const tasks=[['Review the improvement backlog',p1,'todo','high',60,3],['Create the rollout checklist',p1,'doing','normal',90,5],['Prepare next team update',p1,'todo','urgent',45,2],['Organize project notes',p1,'review','low',30,7],['Plan a weekend outing',p2,'todo','normal',45,8],['Practice music',p2,'todo','normal',60,9]];
 tasks.forEach(([title,p,status,priority,estimate,due])=>state.tasks.push({id:id(),title,projectId:p.id,area:p.area,status,priority,estimate,dueDate:dateKey(addDays(new Date(),due)),notes:'',autoSchedule:true,blocks:[],dependsOn:[],subtasks:[],createdAt:new Date().toISOString()}));
 state.events.push({id:id(),title:'Weekly planning catch-up',area:'work',start:`${dateKey(addDays(new Date(),2))}T10:00`,end:`${dateKey(addDays(new Date(),2))}T10:45`,notes:'Example calendar event',createdAt:new Date().toISOString()});
 closeModal();page='calendar';scrollCal=true;update();toast('Sample workspace added. Everything is editable.');
}
async function exportBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`evnflo-backup-${today()}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Backup downloaded.');}
async function importBackup(file){if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.projects)||!Array.isArray(data.tasks)||!Array.isArray(data.events)||!data.settings)throw new Error('Not a valid planner backup.');if(!confirm('Replace all current data with this backup?'))return;state={...defaults(),...data,settings:{...defaults().settings,...data.settings}};upgradeLegacyChecklists();projectId=null;page='calendar';closeModal();update();toast('Backup imported.');}catch(e){toast(e.message||'Could not import file.',true);}}
function loginScreen(){
 $('#app').innerHTML=`<div class="login-shell"><div class="login-card"><img class="login-wordmark" src="/evnflo-wordmark.png" alt="EvnFlo"><h1>Welcome back.</h1><p>Your calendar, projects and tasks—together.<br/>Enter your workspace password to continue.</p><form id="login-form"><div class="field"><label for="password">Workspace password</label><input id="password" type="password" name="password" autocomplete="current-password" placeholder="Your password" required/></div><button class="button primary" type="submit">Open my workspace ${I('arrow')}</button><div class="error-msg" id="login-error" role="alert"></div></form></div></div>`;
 $('#login-form').addEventListener('submit',async e=>{e.preventDefault();const btn=$('button[type=submit]','#login-form'),err=$('#login-error');btn.disabled=true;err.textContent='';try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('#password').value}),credentials:'same-origin'});const out=await r.json();if(!r.ok)throw new Error(out.error||'Could not sign in');await loadState();}catch(ex){err.textContent=ex.message;btn.disabled=false;}});
}
async function loadState(){const r=await fetch('/api/state',{credentials:'same-origin'});if(!r.ok){if(r.status===401){loginScreen();return;}throw new Error('Could not load your planner.');}const obj=await r.json();state={...defaults(),...obj,settings:{...defaults().settings,...obj.settings}};state.projects=Array.isArray(state.projects)?state.projects:[];state.tasks=Array.isArray(state.tasks)?state.tasks:[];state.events=Array.isArray(state.events)?state.events:[];const migrated=upgradeLegacyChecklists();if(state.settings.autoPlan){const stale=state.tasks.some(t=>!isDone(t)&&actionable(t)&&t.autoSchedule!==false&&((t.blocks||[]).some(b=>parse(b.end)<new Date())||plannedMinutes(t)<Math.max(15,Number(t.estimate)||30)));if(migrated||stale)replan(false);if(migrated||stale)scheduleSave();}else if(migrated)scheduleSave();render();}
async function init(){try{const r=await fetch('/api/session',{cache:'no-store'});if(!r.ok)throw new Error('Cannot contact server.');const s=await r.json();storageType=s.storage;if(!s.authenticated)loginScreen();else await loadState();}catch(e){$('#app').innerHTML=`<div class="boot-screen"><h2>EvnFlo couldn't connect.</h2><p style="color:#8993a6;font-size:13px">${safe(e.message)}</p><button class="button primary" data-act="reload">Try again</button></div>`;}}
function handleClick(e){
 if(e.target.closest('input[data-check-id]'))return;
 const el=e.target.closest('[data-act]');if(!el)return;
 const {act,id:entityId,view,value,step,project,status,index,date}=el.dataset;
 if(act==='overlay'){if(e.target===el)closeModal();return;}
 if(act==='reload'){location.reload();return;}
 if(act==='close-modal'){closeModal();return;}
 if(act==='nav'){page=view;if(page==='projects')projectId=null;scrollCal=true;render();return;}
 if(act==='scope'){scope=value;render();return;}
 if(act==='calview'){calView=view;scrollCal=true;render();return;}
 if(act==='calmove'){focus=calView==='month'?new Date(focus.getFullYear(),focus.getMonth()+Number(step),1):addDays(focus,Number(step)*(calView==='week'?7:1));scrollCal=true;render();return;}
 if(act==='today'){focus=new Date();scrollCal=true;render();return;}
 if(act==='month-day'){focus=parse(`${date}T12:00`);calView='day';scrollCal=true;render();return;}
 if(act==='open-project'){projectId=entityId;projectView='board';page='projects';render();return;}
 if(act==='back-projects'){projectId=null;render();return;}
 if(act==='projectview'){projectView=view;render();return;}
 if(act==='new-task'){taskModal(null,{project:project||(page==='projects'?projectId:''),status});return;}
 if(act==='edit-task'){const t=taskById(entityId);if(t)taskModal(t,{returnToParent:!!t.parentId&&!!$('#task-form')});return;}
 if(act==='new-subtask'){const parent=taskById(entityId);if(!parent||parent.parentId)return;const form=$('#task-form');if(form?.dataset.id===entityId){if(!form.checkValidity()){form.reportValidity();return;}form.requestSubmit();}taskModal(null,{parentId:entityId,returnToParent:true});return;}
 if(act==='return-parent'){const parent=taskById(entityId);if(parent)taskModal(parent);return;}
 if(act==='new-project'){projectModal();return;}
 if(act==='edit-project'){projectModal(projectById(entityId));return;}
 if(act==='new-event'){eventModal(null,dateKey(focus));return;}
 if(act==='edit-event'){eventModal(state.events.find(x=>x.id===entityId));return;}
 if(act==='plan'){recordUndo('schedule');replan(true);render();scheduleSave();return;}
 if(act==='undo'){undoLast();return;}
 if(act==='add-category'){recordUndo('category change');const n=(state.settings.categories||[]).length+1;state.settings.categories.push({id:id(),name:`Category ${n}`,color:colorChoices[n%colorChoices.length]});render();scheduleSave();toast('Category added.',false,true);return;}
 if(act==='remove-category'){if(state.settings.categories.length<2)return;recordUndo('category change');const removed=categoryById(entityId);state.settings.categories=state.settings.categories.filter(c=>c.id!==entityId);state.tasks.forEach(t=>{if(t.categoryId===entityId)t.categoryId=state.settings.categories[0].id});render();scheduleSave();toast(`${removed?.name||'Category'} removed.`,false,true);return;}
 if(act==='quick-add'){addQuickTask();return;}
 if(act==='demo'){loadDemo();return;}
 if(act==='weekday'){const n=Number(index),list=state.settings.weekdays;state.settings.weekdays=list.includes(n)?list.filter(x=>x!==n):[...list,n].sort();update();return;}
 if(act==='delete-task'){const t=taskById(entityId);if(!t)return;const parent=t.parentId;if(!confirm(isContainer(t)?'Delete this task and ALL of its subtasks?':'Delete this task?'))return;recordUndo('task deletion');deleteTaskAndChildren(entityId);closeModal();update();if(parent)taskModal(taskById(parent));toast('Task deleted.',false,true);return;}
 if(act==='delete-event'){if(!confirm('Delete this event?'))return;recordUndo('event deletion');state.events=state.events.filter(x=>x.id!==entityId);closeModal();update();toast('Event deleted.',false,true);return;}
 if(act==='delete-project'){const p=projectById(entityId);const total=state.tasks.filter(x=>x.projectId===entityId).length;if(!confirm(`Delete “${p?.name||'this project'}” and its ${total} task(s)?`))return;recordUndo('project deletion');state.projects=state.projects.filter(x=>x.id!==entityId);state.tasks=state.tasks.filter(x=>x.projectId!==entityId);state.tasks.forEach(t=>t.dependsOn=(t.dependsOn||[]).filter(dep=>!!taskById(dep)));projectId=null;closeModal();update();toast('Project deleted.',false,true);return;}
 if(act==='export'){exportBackup();return;}
 if(act==='import'){$('#import-file')?.click();return;}
 if(act==='clear'){if(!confirm('This will permanently delete ALL projects, tasks and events on this workspace. Export a backup first. Continue?'))return;const typed=prompt('Type DELETE to confirm');if(typed!=='DELETE')return;state=defaults();projectId=null;page='calendar';update();toast('Planner cleared.');return;}
 if(act==='logout'){fetch('/api/logout',{method:'POST',credentials:'same-origin'}).finally(()=>location.reload());return;}
}
function handleChange(e){
 const el=e.target;
 if(el.matches('[data-check-id]')){markTask(el.dataset.checkId,el.checked);return;}
 if(el.matches('[data-category-field]')){const c=categoryById(el.dataset.categoryId);if(c){recordUndo('category change');c[el.dataset.categoryField]=el.value;render();scheduleSave();toast('Category saved.',false,true);}return;}
 if(el.matches('[data-setting]')){
   const key=el.dataset.setting;state.settings[key]=el.type==='checkbox'?el.checked:el.value;
   if(key!=='autoPlan'&&state.settings.autoPlan)replan(false);render();scheduleSave();toast('Settings saved.');return;
 }
 if(el.id==='import-file')importBackup(el.files[0]);
}
function handleDrop(e){
 const target=e.target.closest('[data-drop]');if(!target)return;
 e.preventDefault();target.classList.remove('drag-over');
 const transfer=e.dataTransfer?.getData('text/plain');if(!transfer?.startsWith('evnflo-task:'))return;
 const t=taskById(transfer.slice('evnflo-task:'.length));if(!t)return;
 if(target.dataset.drop==='board'){
   const stage=target.dataset.status;if(!statuses.includes(stage))return;
   recordUndo('task status change');changeTaskStatus(t,stage);
   update();toast(`Moved to ${statusNames[stage]}.`,false,true);return;
 }
 if(target.dataset.drop==='calendar'){
   if(isContainer(t)){toast('Schedule its subtasks, rather than the parent task.',true);return;}
   const day=target.dataset.date,rect=target.getBoundingClientRect();
   const top=e.clientY-rect.top;
   const mins=Math.max(6*60,Math.min(22*60-15,6*60+Math.round(top/18)*15));
   const start=parse(`${day}T${pad(Math.floor(mins/60))}:${pad(mins%60)}`),end=new Date(start.getTime()+(Number(t.estimate)||30)*60000);
   if(!confirmOverlap(t,datetime(start),datetime(end)))return;
   if(dateKey(start)!==dateKey(end)){toast('Task would run past midnight. Choose an earlier time.',true);return;}
   recordUndo('calendar drop');t.autoSchedule=false;t.blocks=[{start:datetime(start),end:datetime(end),manual:true}];update();toast(`Pinned ${t.title} at ${timeLabel(start)}.`,false,true);return;
 }
}
document.addEventListener('click',handleClick);
document.addEventListener('change',handleChange);
document.addEventListener('dragstart',e=>{const t=e.target.closest('[data-drag-task]');if(t&&e.dataTransfer){e.dataTransfer.setData('text/plain',`evnflo-task:${t.dataset.dragTask}`);e.dataTransfer.effectAllowed='move';}});
document.addEventListener('dragover',e=>{const col=e.target.closest('[data-drop]');if(col){e.preventDefault();e.dataTransfer.dropEffect='move';col.classList.add('drag-over');}});
document.addEventListener('dragleave',e=>{const col=e.target.closest('[data-drop]');if(col&&!col.contains(e.relatedTarget))col.classList.remove('drag-over');});
document.addEventListener('drop',handleDrop);
document.addEventListener('pointerdown',e=>{const h=e.target.closest('.resize-handle');if(!h?.dataset.resizeTask)return;const t=taskById(h.dataset.resizeTask),i=Number(h.dataset.resizeIndex),b=t?.blocks?.[i];if(!b)return;e.preventDefault();recordUndo('calendar resize');resizeState={t,i,b,startY:e.clientY,originalEnd:b.end};});
document.addEventListener('pointermove',e=>{if(!resizeState)return;const {t,b,startY}=resizeState;const start=parse(b.start),col=e.target.closest('.day-column');const r=col?.getBoundingClientRect();let mins=minutes(start.toTimeString().slice(0,5))+Math.round((e.clientY-startY)/18)*15;mins=Math.max(minutes(start.toTimeString().slice(0,5))+15,Math.min(24*60,mins));const end=at(start,Math.floor(mins/60),mins%60);if(dateKey(end)!==dateKey(start))return;b.end=datetime(end);t.estimate=Math.max(15,minutesBetween(b.start,b.end));const block=e.target.closest('.cal-block');if(block){block.style.height=`${Math.max(20,(mins-(start.getHours()*60+start.getMinutes()))*1.2-2)}px`;}});
document.addEventListener('pointerup',e=>{if(!resizeState)return;const {t,b}=resizeState;resizeState=null;if(!confirmOverlap(t,b.start,b.end)){undoLast();return;}t.autoSchedule=false;update();toast(`Resized ${t.title}.`,false,true);});
document.addEventListener('dblclick',e=>{const col=e.target.closest('.day-column');if(!col||e.target.closest('.cal-block'))return;const r=col.getBoundingClientRect(),mins=Math.max(6*60,Math.min(21*60,6*60+Math.round((e.clientY-r.top)/18)*15));eventModal(null,col.dataset.date,`${pad(Math.floor(mins/60))}:${pad(mins%60)}`);});
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undoLast();return;}
 if(e.key==='Escape')closeModal();
 if(e.key==='Enter'&&e.target.id==='quick-task')addQuickTask();
 if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!$('#modal-root .modal')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();taskModal();}
 if(e.key==='Enter'&&e.target.matches('.project-card')){e.preventDefault();projectId=e.target.dataset.id;page='projects';render();}
});
init();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
