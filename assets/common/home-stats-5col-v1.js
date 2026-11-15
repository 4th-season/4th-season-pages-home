/* HOME_STATS_RECOUNT_EFFECT_R2_20261003 */
/* CLEAN-v1이 data-home-count 값들을 현재 Registry로 갱신한 뒤,
   home-v6.js가 0→현재값 카운트업을 시작하기 전에 In:Choice를 계산한다. */
(function(){
  var root=document.getElementById('s4-home-stats');
  if(!root) return;
  function read(key){
    var el=root.querySelector('[data-home-count="'+key+'"]');
    if(!el) return 0;
    var s=(el.textContent||'').replace(/[^0-9]/g,'');
    return s?parseInt(s,10):0;
  }
  var choice=Math.max(0,read('all')-read('learn')-read('world')-read('life')-read('insite'));
  var item=root.querySelector('.s4hs-choice');
  if(!item){
    item=document.createElement('div');
    item.className='s4hs-item s4hs-choice';
    item.innerHTML='<span>IN:CHOICE</span><strong data-home-count="inchoice">0</strong>';
    root.appendChild(item);
  }
  var strong=item.querySelector('strong');
  if(strong){
    strong.setAttribute('data-home-count','inchoice');
    strong.textContent=String(choice);
  }
  root.setAttribute('data-theme-grid','5');
})();
