(function(){
  document.querySelectorAll('.sitejob-auto-children').forEach(function(section){
    var list=section.querySelector('.sitejob-all-list'); if(!list) return;
    var buttons=section.querySelectorAll('[data-sitejob-sort]');
    var rows=Array.prototype.slice.call(list.querySelectorAll('.sitejob-all-item'));
    rows.forEach(function(row,i){row.dataset.domOrder=String(i);});
    function title(el){return (el.getAttribute('data-title')||'').trim();}
    function date(el){return (el.getAttribute('data-date')||'').trim();}
    function order(el){var v=Number(el.getAttribute('data-order')||'');return Number.isFinite(v)?v:null;}
    function ko(a,b){return a.localeCompare(b,'ko',{sensitivity:'base',numeric:true});}
    function sort(mode){
      var arr=Array.prototype.slice.call(list.querySelectorAll('.sitejob-all-item'));
      arr.sort(function(a,b){
        if(mode==='latest'){
          var ad=date(a),bd=date(b); if(ad&&bd&&ad!==bd)return bd.localeCompare(ad); if(ad&&!bd)return -1;if(!ad&&bd)return 1;
          var ao=order(a),bo=order(b); if(ao!==null&&bo!==null&&ao!==bo)return bo-ao;
          return Number(a.dataset.domOrder)-Number(b.dataset.domOrder);
        }
        return ko(title(a),title(b));
      });
      arr.forEach(function(row){list.appendChild(row);});
      buttons.forEach(function(btn){btn.setAttribute('aria-pressed',btn.getAttribute('data-sitejob-sort')===mode?'true':'false');});
    }
    buttons.forEach(function(btn){btn.addEventListener('click',function(){sort(btn.getAttribute('data-sitejob-sort'));});});
    sort('latest');
  });
})();
