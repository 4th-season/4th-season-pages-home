/* 4S:STDICT-GLOBAL-SEARCH-v1 */
(()=>{const root=document.getElementById('s4-stdict-search');if(!root)return;const form=root.querySelector('.s4-dict-form');const input=root.querySelector('.s4-dict-input');const panel=root.querySelector('.s4-dict-panel');const endpoint=root.dataset.endpoint||'/api/stdict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=msg=>{panel.hidden=false;panel.innerHTML='<div class="s4-dict-state">'+esc(msg)+'</div>'};
const itemHtml=item=>{const link=item.link||'https://stdict.korean.go.kr/';return '<a class="s4-dict-item" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer"><div class="s4-dict-wordline"><span class="s4-dict-word">'+esc(item.word)+'</span>'+(item.pos?'<span class="s4-dict-pos">'+esc(item.pos)+'</span>':'')+(item.origin?'<span class="s4-dict-origin">'+esc(item.origin)+'</span>':'')+'</div><p class="s4-dict-def">'+esc(item.definition||'뜻풀이 정보가 없습니다.')+'</p></a>'};
const render=data=>{const items=Array.isArray(data.items)?data.items:[];if(!items.length){state('표준국어대사전에서 찾은 결과가 없습니다.');return}panel.hidden=false;panel.innerHTML='<div class="s4-dict-panel-head"><strong>'+esc(data.query||input.value)+'</strong><span>'+Number(data.total||items.length).toLocaleString()+'개 결과</span></div>'+items.map(itemHtml).join('')+'<span class="s4-dict-source">표준국어대사전 · 국립국어원</span>'};
const search=async()=>{const q=input.value.trim();if(!q){root.classList.add('is-open');input.focus();return}root.classList.add('is-open');state('표준국어대사전에서 찾는 중입니다…');try{const url=new URL(endpoint,location.origin);url.searchParams.set('q',q);const res=await fetch(url,{headers:{'Accept':'application/json'}});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'SEARCH_ERROR');render(data)}catch(e){state('사전 검색에 잠시 문제가 있습니다. 다시 시도해 주세요.')}};
form.addEventListener('submit',e=>{e.preventDefault();search()});
form.querySelector('.s4-dict-submit').addEventListener('click',()=>{if(!root.classList.contains('is-open')&&!input.value.trim()){root.classList.add('is-open');setTimeout(()=>input.focus(),0)}});
input.addEventListener('focus',()=>root.classList.add('is-open'));input.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;root.classList.remove('is-open');input.blur()}});
document.addEventListener('pointerdown',e=>{if(root.contains(e.target))return;panel.hidden=true;if(!input.value.trim())root.classList.remove('is-open')});
})();

/* 4S:GLOBAL-ANALYTICS-v1 | GA=G-8B5209M1JF | NAVER-WA=1c3d145e1421950 */
(()=>{
  if(!window.__fsGoogleAnalyticsV1){
    window.__fsGoogleAnalyticsV1=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config','G-8B5209M1JF');
    const g=document.createElement('script');
    g.async=true;
    g.src='https://www.googletagmanager.com/gtag/js?id=G-8B5209M1JF';
    document.head.appendChild(g);
  }
  if(!window.__fsNaverAnalyticsV1){
    window.__fsNaverAnalyticsV1=true;
    const run=()=>{
      window.wcs_add=window.wcs_add||{};
      window.wcs_add["wa"]="1c3d145e1421950";
      if(window.wcs&&typeof window.wcs_do==="function")window.wcs_do();
    };
    if(window.wcs){run();}
    else{
      const n=document.createElement('script');
      n.async=true;
      n.src='https://wcs.pstatic.net/wcslog.js';
      n.onload=run;
      document.head.appendChild(n);
    }
  }
})();
