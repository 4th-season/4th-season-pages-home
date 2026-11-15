
(()=> {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nums=[...document.querySelectorAll('[data-home-count]')];
  const animate=n=>{
    const target=Number(String(n.textContent).replace(/[^0-9]/g,''))||0;
    if(reduce||!target){n.textContent=String(target);return;}
    n.textContent='0';
    const start=performance.now(),dur=800;
    const tick=t=>{
      const p=Math.min(1,(t-start)/dur);
      const e=1-Math.pow(1-p,3);
      n.textContent=String(Math.round(target*e));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  nums.forEach(animate);
  const io=('IntersectionObserver' in window)&&!reduce?new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})
  },{threshold:.12}):null;
  document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('is-visible'));
  const cards=[...document.querySelectorAll('.feature-card')];
  if(cards.length>1&&!reduce){
    let i=0;cards[0].classList.add('is-active');
    setInterval(()=>{cards[i].classList.remove('is-active');i=(i+1)%cards.length;cards[i].classList.add('is-active')},4200);
  }
})();
