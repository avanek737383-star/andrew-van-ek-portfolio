(function(root){
 'use strict';
 function mount(panel){
  if(!panel)return;
  var stamp=document.getElementById('os-tracker-timestamp');
  if(stamp)stamp.textContent='Loading source checks…';
  fetch('data/releases.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json()}).then(data=>{
   if(!data.platforms)throw Error('Invalid data');var ok=0;
   Object.keys(data.platforms).forEach(key=>{
    var item=data.platforms[key],el=document.getElementById('os-ver-'+key);if(!el)return;
    el.textContent=item.label||'No verified value available';
    var card=el.closest('.os-card')||el.parentElement.parentElement;
    var stale=item.status!=='ok'||!item.checkedAt||(Date.now()-Date.parse(item.checkedAt)>48*3600000);
    if(!stale)ok++;
    var info=document.createElement('span');info.className='metric-source'+(stale?' metric-stale':'');
    info.textContent=(item.checkedAt?'Last successful source check: '+new Date(item.checkedAt).toLocaleString():'No successful source check recorded')+(stale?' · STALE / SOURCE UNAVAILABLE':'')+'. '+(item.channel||'');
    var existing=card.querySelector('[data-source-check]');if(existing)existing.remove();info.dataset.sourceCheck='true';el.insertAdjacentElement('afterend',info);
   });
   if(stamp)stamp.textContent=ok+'/6 source checks current · last attempt '+new Date(data.lastAttemptAt).toLocaleString();
  }).catch(()=>{if(stamp)stamp.textContent='Source data unavailable—no current versions can be verified';panel.querySelectorAll('[id^="os-ver-"]').forEach(el=>el.textContent='Source check unavailable')});
 }
 root.PortfolioReleases={mount};
})(window);
