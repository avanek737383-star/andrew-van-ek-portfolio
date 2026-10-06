(function () {
"use strict";

const API='https://nucwol2-0--hdd.taile72a68.ts.net:8443';
let token=sessionStorage.getItem('council-token')||'',revision=-1,messages=[],running=false,polling=false;
const $=id=>document.getElementById(id);
let challenge='';
let visibleMessages=[], revealTimer=null, activeReveal=null;
const revealButton=document.createElement('button');
revealButton.type='button';revealButton.className='quiet';revealButton.textContent='Show remaining replies';revealButton.hidden=true;
$('copy').before(revealButton);
function cancelReveal(){clearTimeout(revealTimer);revealTimer=null;activeReveal=null;revealButton.hidden=true}
function addCard(m,text){const card=document.createElement('article');card.className='card '+m.speaker.toLowerCase();const name=document.createElement('div');name.className='name';name.textContent=m.speaker;const body=document.createElement('div');body.className='text';body.textContent=text;card.append(name,body);$('chat').append(card);return body}
function followReading(){if(window.innerHeight+window.scrollY>=document.body.scrollHeight-180)window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}
function revealNext(){
 if(revealTimer&&!activeReveal)return;
 if(activeReveal||visibleMessages.length>=messages.length){revealButton.hidden=!activeReveal&&visibleMessages.length>=messages.length;return}
 const m=messages[visibleMessages.length];
 if(m.speaker.toLowerCase()==='you'||m.speaker.toLowerCase()==='council'){addCard(m,m.text);visibleMessages.push(m);revealNext();return}
 const parts=m.text.match(/\S+\s*|\s+/g)||[];const body=addCard(m,'');activeReveal={body,parts,index:0,text:''};revealButton.hidden=false;
 function tick(){if(!activeReveal)return;const nearBottom=window.innerHeight+window.scrollY>=document.body.scrollHeight-180;activeReveal.text+=parts[activeReveal.index++]||'';body.textContent=activeReveal.text;if(nearBottom)followReading();if(activeReveal.index<parts.length){revealTimer=setTimeout(tick,200)}else{visibleMessages.push(m);activeReveal=null;revealTimer=setTimeout(()=>{revealTimer=null;revealNext()},2000)}}
 tick();
}
revealButton.onclick=()=>{cancelReveal();$('chat').replaceChildren();messages.forEach(m=>addCard(m,m.text));visibleMessages=messages.slice()};
function render(s){$('offline').hidden=true;running=s.running;$('status').textContent=s.status;$('status').classList.toggle('spinner',running);$('start').disabled=running;$('question').disabled=running;$('rounds').disabled=running;$('new').disabled=running;$('stop').hidden=!running;$('start').hidden=running;$('start').textContent=s.recommendation?'Ask follow-up ↗':'Start debate ↗';if(s.revision===revision)return;
 const first=revision===-1;revision=s.revision;
 const samePrefix=messages.length<=s.messages.length&&messages.every((m,i)=>m.speaker===s.messages[i].speaker&&m.text===s.messages[i].text);
 messages=s.messages;
 if(first||!samePrefix){cancelReveal();visibleMessages=[];$('chat').replaceChildren();if(first){messages.forEach(m=>addCard(m,m.text));visibleMessages=messages.slice()}}
 if(!messages.length){cancelReveal();visibleMessages=[];return showEmpty()}
 const emptyCard=$('chat').querySelector('.empty');if(emptyCard)emptyCard.remove();revealNext();
}
const empty=$('chat').innerHTML;
function showEmpty(){if(!$('chat').querySelector('.empty')){$('chat').innerHTML=empty;bindExamples()}}
function bindExamples(){document.querySelectorAll('.example').forEach(b=>b.onclick=()=>{$('question').value=b.textContent;$('question').focus()})}bindExamples();
function signedIn(value){$('loginbox').hidden=value;$('room').hidden=!value;if(!value){token='';sessionStorage.removeItem('council-token');cancelReveal();visibleMessages=[];revision=-1;messages=[];$('chat').replaceChildren();showEmpty()}}
async function poll(){if(polling||!token)return;polling=true;try{const r=await fetch(API+'/api/state',{cache:'no-store',headers:{Authorization:'Bearer '+token}});const data=await r.json();if(r.status===401){signedIn(false);$('loginstatus').textContent='Session expired. Sign in again.';return}if(!r.ok){if(r.status===503){$('offline').hidden=false;$('start').disabled=true}throw Error(data.error||'Room unavailable')};signedIn(true);render(data)}catch(e){$('status').textContent=e.message;$('status').classList.remove('spinner')}finally{polling=false}}
async function action(path,data={}){const r=await fetch(API+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(data)});const s=await r.json();if(r.status===401)signedIn(false);if(!r.ok)throw Error(s.error||'Request failed');await poll()}
$('loginform').onsubmit=async e=>{e.preventDefault();$('loginbutton').disabled=true;$('loginstatus').textContent='Signing in…';try{const r=await fetch(API+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('username').value.trim(),password:$('password').value})});const data=await r.json();if(!r.ok)throw Error(data.error||'Login failed');challenge=data.challenge;$('password').value='';$('loginstatus').textContent='';$('loginform').hidden=true;$('mfaform').hidden=false;$('mfastatus').textContent='Enter the current code from your authenticator app.';$('code').focus()}catch(e){$('loginstatus').textContent=e.message}finally{$('loginbutton').disabled=false}};
$('mfaform').onsubmit=async e=>{e.preventDefault();$('verifybutton').disabled=true;try{const r=await fetch(API+'/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge,code:$('code').value.trim()})});const data=await r.json();if(!r.ok)throw Error(data.error||'Verification failed');token=data.token;sessionStorage.setItem('council-token',token);$('code').value='';challenge='';$('mfaform').hidden=true;$('loginform').hidden=false;signedIn(true);await poll()}catch(e){$('mfastatus').textContent=e.message}finally{$('verifybutton').disabled=false}};
$('backlogin').onclick=()=>{challenge='';$('code').value='';$('mfaform').hidden=true;$('loginform').hidden=false};
$('logout').onclick=async()=>{try{await action('logout')}catch(e){}signedIn(false)};
$('form').onsubmit=async e=>{e.preventDefault();const q=$('question').value.trim();if(!q||running)return;$('start').disabled=true;try{await action('start',{question:q,rounds:Number($('rounds').value)});$('question').value=''}catch(e){$('status').textContent=e.message;$('start').disabled=false}};
$('stop').onclick=async()=>{try{await action('stop')}catch(e){$('status').textContent=e.message}};
$('new').onclick=async()=>{try{await action('new');$('question').value='';$('question').focus()}catch(e){$('status').textContent=e.message}};
$('copy').onclick=async()=>{const text=messages.map(m=>m.speaker+': '+m.text).join('\n\n');try{await navigator.clipboard.writeText(text);$('status').textContent='Chat copied.'}catch(e){$('status').textContent='Select the chat text to copy it.'}};
$('question').onkeydown=e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('form').requestSubmit()}};
signedIn(!!token);poll();setInterval(poll,1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});

})();
