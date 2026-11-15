
(()=> {
  const sections=[...document.querySelectorAll('.home-section')];
  const links=[...document.querySelectorAll('[data-section-link]')];

  const setActive=id=>{
    links.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+id));
  };

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting && e.intersectionRatio>.45){
          e.target.classList.add('is-visible');
          setActive(e.target.id);
        }
      });
    },{threshold:[.45,.62]});
    sections.forEach(s=>io.observe(s));
  }

  // Mouse drag scrolling on non-interactive empty areas. Native wheel/touch scrolling remains intact.
  let active=false,lastY=0,moved=false;
  const interactive='a,button,input,textarea,select,label,[contenteditable="true"]';
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse' || e.button!==0 || e.target.closest(interactive)) return;
    active=true;lastY=e.clientY;moved=false;
    document.body.classList.add('is-dragging');
  });
  window.addEventListener('pointermove',e=>{
    if(!active) return;
    const dy=e.clientY-lastY;
    if(Math.abs(dy)>1){window.scrollBy(0,-dy);moved=true;lastY=e.clientY;}
  });
  const stop=()=>{active=false;document.body.classList.remove('is-dragging')};
  window.addEventListener('pointerup',stop);
  window.addEventListener('pointercancel',stop);

  // Keep home counts pleasantly animated without changing their Registry source.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('[data-home-count]').forEach(el=>{
      const target=Number((el.textContent||'').replace(/\D/g,''))||0;
      if(!target)return;
      el.textContent='0';
      const st=performance.now();
      const tick=t=>{
        const p=Math.min(1,(t-st)/850);
        el.textContent=String(Math.round(target*(1-Math.pow(1-p,3))));
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
})();
