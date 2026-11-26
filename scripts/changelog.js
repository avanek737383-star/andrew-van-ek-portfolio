(function(){
 'use strict';var body=document.getElementById('changelog-tbody');if(!body)return;
 var commits=[],category='all',query='';
 function render(){
  var rows=commits.filter(c=>(category==='all'||c.category===category)&&(!query||(c.subject+' '+c.sha+' '+c.category).toLowerCase().includes(query)));
  body.replaceChildren();
  rows.forEach(c=>{var tr=document.createElement('tr');[new Date(c.date).toLocaleDateString(),c.category,c.subject,c.sha.slice(0,8)].forEach((value,index)=>{var td=document.createElement('td');if(index===3){var a=document.createElement('a');a.href='https://github.com/avanek737383-star/andrew-van-ek-portfolio/commit/'+c.sha;a.textContent=value;a.target='_blank';a.rel='noopener noreferrer';td.appendChild(a)}else td.textContent=value;tr.appendChild(td)});body.appendChild(tr)});
  document.getElementById('changelog-count').textContent='Showing '+rows.length+' of '+commits.length+' recorded commits';
  document.getElementById('changelog-no-results').hidden=rows.length!==0;
 }
 fetch('data/changelog.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json()}).then(data=>{
  if(!Array.isArray(data.commits)||data.count!==data.commits.length)throw Error('Invalid snapshot');commits=data.commits;
  document.getElementById('changelog-snapshot').textContent='Generated '+new Date(data.generatedAt).toLocaleString()+' · '+data.count+' commits through '+data.sourceHead.slice(0,12)+'. Author dates below are not deployment dates.';
  document.getElementById('changelog-source').href='https://github.com/avanek737383-star/andrew-van-ek-portfolio/commits/'+data.sourceHead;
  render();
 }).catch(()=>document.getElementById('changelog-snapshot').textContent='Git snapshot unavailable. No substitute totals are displayed.');
 document.getElementById('changelog-search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===button));render()}));
})();
