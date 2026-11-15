/* COMMON-MENU-SYSTEM-v1-20260919 + LIFE-ESSAY-BRANCH-20260924 */
(()=>{"use strict";
const ROOT="/assets/common/", DATA=ROOT+"menu-data.json", MAP=ROOT+"article-map.json", CSS=ROOT+"menu-bar.css", ESSAY_CSS="/assets/series/essay.css";
const norm=p=>{p=(p||"/").split("?")[0].split("#")[0]; if(!p.startsWith("/"))p="/"+p; return p!=="/"?p.replace(/\/+$/,''):p};
const loadJSON=async u=>{const r=await fetch(u,{cache:"no-cache",credentials:"same-origin"}); if(!r.ok) throw new Error(u+" "+r.status); return r.json()};
const ensureCSS=()=>{if(document.querySelector('link[data-fs-common-menu-css]'))return; const l=document.createElement("link");l.rel="stylesheet";l.href=CSS;l.dataset.fsCommonMenuCss="1";document.head.appendChild(l)};
const ensureEssayCSS=()=>{if(document.querySelector('link[data-fs-essay-css]'))return; const l=document.createElement("link");l.rel="stylesheet";l.href=ESSAY_CSS;l.dataset.fsEssayCss="1";document.head.appendChild(l)};
const articleId=()=>document.querySelector('meta[name="article-id"]')?.content?.trim()||document.body?.dataset?.articleId?.trim()||"";
const seriesMeta=()=>({section:document.querySelector('meta[name="4th-section"]')?.content?.trim().toUpperCase()||"",series:document.querySelector('meta[name="4th-series"]')?.content?.trim().toLowerCase()||""});
function essayRuntime(data){
  const life=data?.sections?.LIFE;
  if(life?.items){
    const it=life.items.find(x=>x.key==="journal"||x.key==="essay");
    if(it){it.key="essay";it.label="생활의 기록";it.href="/life/essay/"}
  }
  return data;
}
function fromPath(data,path){for(const [sk,s] of Object.entries(data.sections||{})){const sh=norm(s.href);if(path===sh||path.startsWith(sh+"/")){let series="",level4="";for(const it of s.items||[]){const ih=norm(it.href);if(path===ih||path.startsWith(ih+"/")){series=it.key;for(const sub of it.subitems||[]){const uh=norm(sub.href);if(path===uh||path.startsWith(uh+"/")){level4=sub.key;break}}break}}return {section:sk,series,level4}}}return null}
function fromId(data,id){if(!id)return null;const u=id.toUpperCase();for(const r of data.id_prefix_rules||[])if(u.startsWith(String(r.prefix).toUpperCase()))return {section:r.section,series:r.series};return null}
function byKey(data,section,key){return (data.sections?.[section]?.items||[]).find(x=>x.key===key)}
function resolve(data,map){const path=norm(location.pathname);const meta=seriesMeta();let r=null;if(meta.section&&data.sections?.[meta.section])r={section:meta.section,series:meta.series};r=r||fromPath(data,path);if(!r||!r.series){const aid=articleId();r=(map?.by_path?.[path]||map?.by_id?.[aid]||fromId(data,aid)||r)}if(!r?.section)return null;if(r.section==="LIFE"&&r.series==="journal")r={...r,series:"essay"};return {...r,path}}
function render(data,r){if(document.getElementById("fs-common-menu"))return;const s=data.sections[r.section];if(!s)return;let parentLabel=s.label,parentHref=s.href,links=s.items||[],seriesItem=r.series?byKey(data,r.section,r.series):null;if(r.level4&&seriesItem?.subitems?.length){parentLabel=seriesItem.label;parentHref=seriesItem.href;links=seriesItem.subitems}else if(r.series&&seriesItem&&r.path!==norm(seriesItem.href)&&seriesItem.subitems?.some(x=>r.path===norm(x.href)||r.path.startsWith(norm(x.href)+"/"))){parentLabel=seriesItem.label;parentHref=seriesItem.href;links=seriesItem.subitems}
const nav=document.createElement("nav");nav.id="fs-common-menu";nav.setAttribute("aria-label","공통 상단 메뉴");nav.innerHTML='<div class="fsn-inner"><div class="fsn-left"><a class="fsn-home" href="/">홈</a><span class="fsn-sep">|</span><a class="fsn-parent"></a></div><div class="fsn-right"></div></div>';
nav.querySelector('.fsn-parent').textContent=parentLabel;nav.querySelector('.fsn-parent').href=parentHref;const right=nav.querySelector('.fsn-right');for(const x of links){const a=document.createElement('a');a.className='fsn-link';a.href=x.href;a.textContent=x.label;const h=norm(x.href);if(r.path===h||r.path.startsWith(h+"/")||(r.series===x.key&&!r.level4))a.setAttribute('aria-current','page');right.appendChild(a)}document.body.insertBefore(nav,document.body.firstChild)}
async function boot(){if(!document.body)return;ensureCSS();let data,map;try{[data,map]=await Promise.all([loadJSON(DATA),loadJSON(MAP).catch(()=>null)])}catch(e){console.warn('[4th-season menu]',e);return}data=essayRuntime(data);const r=resolve(data,map);if(r?.section==="LIFE"&&r.series==="essay"){document.body.classList.add("fs-essay-page");ensureEssayCSS()}if(r)render(data,r)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();