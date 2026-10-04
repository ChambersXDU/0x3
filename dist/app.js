'use strict';
const $ = s => document.querySelector(s);
const STORAGE = 'zero3.preferences.v1';
const defaults = {engine:'baidu',theme:'moon',mode:'auto',icons:'fade',newtab:true,banner:true,category:0};
const engines = [
 {id:'google',name:'谷歌',key:'gg',url:'https://www.google.com/search?q=',icon:true},
 {id:'bing',name:'必应',key:'bi',url:'https://www.bing.com/search?q=',icon:true},
 {id:'baidu',name:'百度',key:'bd',url:'https://www.baidu.com/s?wd=',icon:true},
 {id:'sogou',name:'搜狗',key:'sg',url:'https://www.sogou.com/web?query=',letter:'S'},
 {id:'360',name:'360搜索',key:'360',url:'https://www.so.com/s?q=',letter:'360'},
 {id:'yahoo',name:'雅虎',key:'yh',url:'https://search.yahoo.com/search?p=',letter:'Y!'},
 {id:'duckduckgo',name:'DuckDuckGo',key:'ddg',url:'https://duckduckgo.com/?q=',letter:'D'},
 {id:'ecosia',name:'Ecosia',key:'eco',url:'https://www.ecosia.org/search?q=',letter:'E'}
];
let prefs = {...defaults}, original, categories = [], icons = {}, selected = 0, editing = null, toastTimer;
try {const p=JSON.parse(localStorage.getItem(STORAGE));if(p?.preferences)prefs={...defaults,...p.preferences};} catch {}
const scheme = matchMedia('(prefers-color-scheme: dark)');
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({preferences:prefs,categories}));return true;}catch{toast('浏览器无法保存设置，请导出备份。');return false;}}
function toast(msg){$('#toast').textContent=msg;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,2600);}
function applyPreferences(){
 if(!engines.some(e=>e.id===prefs.engine))prefs.engine='baidu';
 document.documentElement.dataset.theme=prefs.theme;
 document.documentElement.dataset.mode=prefs.mode==='auto'?(scheme.matches?'dark':'light'):prefs.mode;
 document.body.className='icon-'+prefs.icons;
 $('#banners').hidden=!prefs.banner;
 $('#theme-cycle').textContent={auto:'自动',dark:'夜间',light:'日间'}[prefs.mode]||'自动';
 const e=engines.find(e=>e.id===prefs.engine);$('#engine-icon').hidden=!e.icon;$('#engine-letter').hidden=!!e.icon;
 if(e.icon){$('#engine-icon').src='/assets/'+e.id+'.svg';$('#engine-icon').alt=e.name;}else{$('#engine-letter').textContent=e.letter;}
 $('.engine-trigger').setAttribute('aria-label','选择搜索引擎，当前为'+e.name);
 document.querySelectorAll('.site a').forEach(a=>{a.target=prefs.newtab?'_blank':'_self';});
}
scheme.addEventListener('change',applyPreferences);
function iconFor(url){try{let h=new URL(url).hostname;return icons[h]||icons[h.replace(/^www\./,'')]||null;}catch{return null;}}
function siteImage(site){const src=iconFor(site.url);if(!src)return null;const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';return img;}
function btn(text,cls,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.addEventListener('click',action);return b;}
function renderDirectory(container,editable=false){
 container.replaceChildren();const nav=document.createElement('nav');nav.id='categories';nav.setAttribute('aria-label','网址分类');
 categories.forEach((cat,ci)=>{const b=btn(cat.name,'category'+(selected===ci?' active':''),()=>{if(editable&&selected===ci)openEditor({type:'category',ci});else{selected=ci;renderCurrentDirectory();}});b.setAttribute('aria-pressed',String(selected===ci));nav.append(b);});
 if(editable){const add=btn('+','add-button',()=>openEditor({type:'category',add:true}));add.setAttribute('aria-label','添加分类');nav.append(add);}
 container.append(nav);const groups=document.createElement('div');groups.id='groups';
 const cat=categories[selected];if(!cat){container.append(groups);return;}
 cat.group.forEach((group,gi)=>{const row=document.createElement('div');row.className='group-row';const label=document.createElement('div');label.className='group-name';
 if(editable)label.append(btn(group.name,'',()=>openEditor({type:'group',ci:selected,gi})));else label.textContent=group.name;
 const links=document.createElement('div');links.className='group-links';
 group.list.forEach((site,si)=>{const item=document.createElement(editable?'button':'div');item.className=editable?'site-edit':'site';const link=editable?item:document.createElement('a');
 if(editable){item.type='button';item.addEventListener('click',()=>openEditor({type:'site',ci:selected,gi,si}));item.setAttribute('aria-label','编辑'+site.name);}else{link.href=site.url;link.target=prefs.newtab?'_blank':'_self';link.rel='noopener noreferrer';link.title=site.name;}
 const img=siteImage(site);if(img)link.append(img);const text=document.createElement('span');text.textContent=site.name;link.append(text);if(!editable)item.append(link);links.append(item);});
 if(editable){const add=btn('+','add-button',()=>openEditor({type:'site',ci:selected,gi,add:true}));add.setAttribute('aria-label','在'+group.name+'添加网址');links.append(add);}
 row.append(label,links);groups.append(row);});
 if(editable){const add=btn('+','add-button',()=>openEditor({type:'group',ci:selected,add:true}));add.setAttribute('aria-label','添加分组');groups.append(add);}
 container.append(groups);
}
function renderCurrentDirectory(){if($('#settings-page').hidden)renderDirectory($('.directory'));else renderDirectory($('.settings-directory'),true);}
function optionControl(parent,label,name,options){const l=document.createElement('label');l.textContent=label;const s=document.createElement('select');s.name=name;s.setAttribute('aria-label',label);options.forEach(([value,text])=>{const o=document.createElement('option');o.value=value;o.textContent=text;s.append(o);});s.value=String(prefs[name]);s.addEventListener('change',()=>{prefs[name]=['newtab','banner'].includes(name)?s.value==='true':s.value;applyPreferences();});l.append(s);parent.append(l);}
function renderSettings(){
 const page=$('#settings-page');page.replaceChildren();const dir=document.createElement('div');dir.className='settings-directory';page.append(dir);renderDirectory(dir,true);
 const grid=document.createElement('div');grid.className='preference-grid';
 optionControl(grid,'风格样式','theme',[['moon','月灰'],['wave','浪花'],['mountain','远山'],['pure','素白'],['cyan','青川'],['lychee','荔枝'],['ocean','深海'],['ink','石墨'],['charcoal','消炭'],['moonlit','月夜']]);
 optionControl(grid,'主题模式','mode',[['auto','系统自动'],['dark','夜间模式'],['light','日间模式']]);
 optionControl(grid,'搜索引擎','engine',engines.map(e=>[e.id,e.name]));
 optionControl(grid,'链接方式','newtab',[['true','新标签打开'],['false','当前页打开']]);
 optionControl(grid,'网站图标','icons',[['color','全彩'],['fade','舒适'],['gray','灰白'],['hide','隐藏']]);
 optionControl(grid,'图片横幅','banner',[['true','开启'],['false','关闭']]);
 const localNote=document.createElement('p');localNote.textContent='设置和自定义网址保存在当前浏览器，可通过导出备份迁移到其他设备。';localNote.style.cssText='grid-column:1/-1;font-size:14px;color:var(--muted);line-height:1.7;margin:0';grid.append(localNote);page.append(grid);
 const actions=document.createElement('div');actions.className='settings-actions';const left=document.createElement('div');left.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
 left.append(btn('恢复初始设置','',()=>{editing={type:'reset'};$('#editor-title').textContent='恢复初始设置';$('#edit-name').parentElement.hidden=true;$('#edit-name').required=false;$('#edit-url').required=false;$('#url-label').hidden=true;$('#editor-error').hidden=false;$('#editor-error').textContent='将恢复默认主题和原始网址列表。';$('#delete-item').hidden=true;$('#editor').showModal();}),btn('导出备份','',exportBackup),btn('导入备份','',()=>fileInput.click()));
 actions.append(left,btn('保存','save-settings',()=>{if(persist()){toast('设置已保存');route('/');}}));page.append(actions);
}
function route(path,replace=false){
 const page=path==='/setting'?'settings':path==='/about'?'about':'home';
 $('#home').hidden=page!=='home';$('#settings-page').hidden=page!=='settings';$('#about-page').hidden=page!=='about';
 selected=Math.min(selected,Math.max(categories.length-1,0));if(page==='settings')renderSettings();else if(page==='home')renderDirectory($('.directory'));
 if(location.pathname!==path){if(replace)history.replaceState(null,'',path);else history.pushState(null,'',path);}
 document.title=page==='settings'?'设置 · 0x3':page==='about'?'关于 · 0x3':'0x3 · 极简导航';window.scrollTo(0,0);applyPreferences();if(page==='home')$('#search-input').focus({preventScroll:true});
}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.origin===location.origin&&['/','/setting','/about'].includes(a.pathname)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();route(a.pathname);}if(!e.target.closest('#search-form'))closeEngineMenu();});
window.addEventListener('popstate',()=>route(location.pathname));
function closeEngineMenu(){$('#engine-menu').hidden=true;$('.engine-trigger').setAttribute('aria-expanded','false');}
$('.engine-trigger').addEventListener('click',()=>{const menu=$('#engine-menu');if(!menu.hidden){closeEngineMenu();return;}menu.replaceChildren();engines.forEach(e=>{const b=btn('','engine-option',()=>{prefs.engine=e.id;persist();applyPreferences();closeEngineMenu();$('#search-input').focus();});b.setAttribute('aria-selected',String(e.id===prefs.engine));if(e.icon){const img=document.createElement('img');img.src='/assets/'+e.id+'.svg';img.alt='';b.append(img);}const name=document.createElement('span');name.textContent=e.name;const key=document.createElement('small');key.textContent='#'+e.key;b.append(name,key);menu.append(b);});menu.hidden=false;$('.engine-trigger').setAttribute('aria-expanded','true');});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();const q=$('#search-input').value.trim();if(!q)return;const engine=engines.find(e=>e.id===prefs.engine);const url=engine.url+encodeURIComponent(q);if(prefs.newtab)window.open(url,'_blank','noopener,noreferrer');else location.assign(url);});
$('#search-input').addEventListener('input',()=>$('#clear-search').hidden=!$('#search-input').value);
$('#clear-search').addEventListener('click',()=>{$('#search-input').value='';$('#clear-search').hidden=true;$('#search-input').focus();});
$('#search-input').addEventListener('keydown',e=>{if(e.key==='Escape')closeEngineMenu();if(e.key==='Tab'||e.key===' '){const term=$('#search-input').value.trim().replace(/^#/,'');const engine=engines.find(x=>x.key===term||x.name===term);if($('#search-input').value.startsWith('#')&&engine){e.preventDefault();prefs.engine=engine.id;$('#search-input').value='';$('#clear-search').hidden=true;persist();applyPreferences();}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeEngineMenu();if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('#home').hidden){e.preventDefault();$('#search-input').focus();}});
$('#theme-cycle').addEventListener('click',()=>{prefs.mode={auto:'dark',dark:'light',light:'auto'}[prefs.mode]||'auto';persist();applyPreferences();});
function openEditor(info){editing=info;const cat=categories[info.ci],group=cat?.group[info.gi],site=group?.list[info.si];const existing=info.type==='category'?cat:info.type==='group'?group:site;$('#editor-title').textContent=(info.add?'添加':'编辑')+{category:'分类',group:'分组',site:'网址'}[info.type];$('#edit-name').parentElement.hidden=false;$('#edit-name').required=true;$('#edit-name').value=existing?.name||'';$('#url-label').hidden=info.type!=='site';$('#edit-url').required=info.type==='site';$('#edit-url').value=existing?.url||'';$('#delete-item').hidden=!!info.add;$('#editor-error').hidden=true;$('#editor').showModal();$('#edit-name').focus();}
$('#cancel-editor').addEventListener('click',()=>$('#editor').close());
$('#editor-form').addEventListener('submit',e=>{e.preventDefault();if(editing?.type==='reset'){prefs={...defaults};categories=structuredClone(original.link);selected=0;}else{const name=$('#edit-name').value.trim();if(!name)return;const {type,ci,gi,si,add}=editing;let item={name};if(type==='site'){try{const u=new URL($('#edit-url').value);if(!['https:','http:'].includes(u.protocol))throw Error();item.url=u.href;}catch{$('#editor-error').textContent='请输入以 https:// 或 http:// 开头的网址。';$('#editor-error').hidden=false;return;}}
 if(type==='category'){if(add){categories.push({...item,group:[]});selected=categories.length-1;}else categories[ci].name=name;}
 if(type==='group'){if(add)categories[ci].group.push({...item,list:[]});else categories[ci].group[gi].name=name;}
 if(type==='site'){if(add)categories[ci].group[gi].list.push(item);else categories[ci].group[gi].list[si]=item;}}
 $('#editor').close();persist();renderSettings();applyPreferences();toast('已保存');});
$('#delete-item').addEventListener('click',()=>{const {type,ci,gi,si}=editing;if(type==='category'){if(categories.length===1){toast('请至少保留一个分类');return;}categories.splice(ci,1);selected=Math.min(selected,categories.length-1);}if(type==='group')categories[ci].group.splice(gi,1);if(type==='site')categories[ci].group[gi].list.splice(si,1);$('#editor').close();persist();renderSettings();toast('已删除');});
function exportBackup(){const blob=new Blob([JSON.stringify({preferences:prefs,categories},null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='0x3-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已导出');}
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';
function validCategories(list){return Array.isArray(list)&&list.length>0&&list.length<100&&list.every(c=>typeof c.name==='string'&&Array.isArray(c.group)&&c.group.every(g=>typeof g.name==='string'&&Array.isArray(g.list)&&g.list.every(s=>{try{return typeof s.name==='string'&&['http:','https:'].includes(new URL(s.url).protocol);}catch{return false;}})));}
fileInput.addEventListener('change',async()=>{const file=fileInput.files[0];if(!file)return;try{if(file.size>2000000)throw Error();const data=JSON.parse(await file.text());if(!validCategories(data.categories))throw Error();categories=data.categories;prefs={...defaults,...data.preferences};selected=0;persist();renderSettings();applyPreferences();toast('备份已导入');}catch{toast('备份格式有误，请选择此网站导出的 JSON 文件。');}fileInput.value='';});
async function init(){try{const responses=await Promise.all([fetch('/data.json'),fetch('/icons.json')]);if(responses.some(r=>!r.ok))throw Error();[original,icons]=await Promise.all(responses.map(r=>r.json()));categories=structuredClone(original.link);try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(validCategories(saved?.categories))categories=saved.categories;}catch{}selected=Math.min(prefs.category,categories.length-1);route(location.pathname,true);
 if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'set_navigation_category',description:'选择网址导航分类。',inputSchema:{type:'object',properties:{category:{type:'string'}},required:['category']},execute:async({category})=>{const index=categories.findIndex(c=>c.name===category);if(index<0)return{content:[{type:'text',text:'未找到该分类'}]};selected=index;route('/');return{content:[{type:'text',text:JSON.stringify(categories[index])}]};}})).catch(()=>{});}catch{}}
 }catch{const p=document.createElement('p');p.textContent='网址列表加载失败，请刷新页面重试。';p.style.padding='32px';$('.directory').replaceChildren(p);}}
init();
