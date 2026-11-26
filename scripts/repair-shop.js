import { CASES, createGame, restoreGame, freshCase, totalScore, scoreCase, inspect, repair, verify, getHint } from './repair-shop-engine.js';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'avanek-please-hold-v1';
let storageAvailable = true;
let game;
try { game = restoreGame(localStorage.getItem(STORAGE_KEY)); } catch { game = createGame(); storageAvailable = false; }
let activeTab = 'files';
let resetTarget = 'case';
const esc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const tabNames = { files: 'File explorer', tasks: 'Task manager', network: 'Network diagnostics', hardware: 'Hardware inspection', settings: 'System settings' };

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); } catch { storageAvailable = false; }
}
function announce(message) { $('announcement').textContent = message; }
function renderTabs() {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  document.querySelectorAll('[data-tab]').forEach(button => {
    const selected = button.dataset.tab === activeTab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    const hasClue = item.tools.some(tool => tool.tab === button.dataset.tab && !state.clues.includes(tool.id));
    button.classList.toggle('has-clue', hasClue);
  });
  $('tool-panel').setAttribute('aria-labelledby', `tab-${activeTab}`);
  const tools = item.tools.filter(tool => tool.tab === activeTab);
  const actions = item.actions.filter(action => action.tab === activeTab);
  const latest = state.events.at(-1);
  $('tool-panel').innerHTML = `<div class="tool-heading"><h3>${tabNames[activeTab]}</h3><span>SIMULATED WORKSPACE</span></div>${tools.length ? `<p class="tool-caption">Investigate</p><div class="tool-buttons">${tools.map(tool => `<button type="button" class="diagnostic-button ${state.clues.includes(tool.id) ? 'checked' : ''}" data-inspect="${tool.id}"><span>${state.clues.includes(tool.id) ? '✓' : '↳'}</span>${esc(tool.title)}<small>${state.clues.includes(tool.id) ? 'CHECKED' : 'RUN CHECK'}</small></button>`).join('')}</div>` : '<p class="empty-tool">No diagnostic checks here for this ticket. A dot on a tool tab marks an unchecked diagnostic.</p>'}${actions.length ? `<p class="tool-caption repair-caption">Try a repair</p><div class="repair-buttons">${actions.map(action => `<button type="button" class="repair-button" data-repair="${action.id}" ${state.fixed || state.verified ? 'disabled' : ''}>${esc(action.title)} <span>→</span></button>`).join('')}</div>` : ''}${latest ? `<article class="log-entry live-output ${esc(latest.kind)}"><h4>${esc(latest.title)}</h4><pre>${esc(latest.text)}</pre></article>` : ''}`;
}
function render() {
  const item = CASES[game.active];
  const state = game.cases[game.active];
  const solved = game.cases.filter(state => state.verified).length;
  $('closed-count').textContent = `${solved}/${CASES.length}`;
  $('total-score').textContent = totalScore(game);
  $('ticket-list').innerHTML = CASES.map((item, index) => `<button type="button" data-case="${index}" class="queue-ticket ${index === game.active ? 'active' : ''} ${game.cases[index].verified ? 'solved' : ''}" ${index === game.active ? 'aria-current="true"' : ''}><span class="queue-meta"><span>TICKET ${item.number}</span><span>${game.cases[index].verified ? '✓ CLOSED' : 'OPEN'}</span></span><strong>${esc(item.title)}</strong><span class="queue-customer">${esc(item.customer)} <span>↗</span></span></button>`).join('');
  $('ticket-label').textContent = `TICKET #${item.number}`;
  $('case-level').textContent = item.level;
  $('case-title').textContent = item.title;
  $('customer-quote').textContent = item.quote;
  $('customer-avatar').textContent = item.avatar;
  $('customer-name').textContent = item.customer;
  $('customer-device').textContent = item.device;
  $('ticket-state').textContent = state.verified ? 'CLOSED ✓' : state.fixed ? 'RETEST NEEDED' : 'OPEN';
  $('ticket-state').classList.toggle('done', state.verified);
  $('desktop-file-name').textContent = item.file;
  $('symptom').textContent = state.verified ? 'It actually works. Document this.' : state.fixed ? 'Fix applied. Prove it.' : item.symptom;
  $('desktop-status').textContent = state.verified ? 'Verified. Please accept this imaginary invoice.' : state.fixed ? '3. Verify the original problem ↓' : '1. Investigate → 2. Fix → 3. Verify';
  $('evidence-count').textContent = `${state.clues.length}/${item.tools.length} found`;
  $('evidence-list').innerHTML = state.clues.length ? state.clues.map(id => `<li><span>✓</span>${esc(item.tools.find(tool => tool.id === id).title)}</li>`).join('') : '<li class="no-evidence">Your notebook is empty. Start with a diagnostic check.</li>';
  $('hint').disabled = state.hints >= 2 || state.verified;
  $('hint').innerHTML = state.hints >= 2 ? 'Senior tech is on lunch' : `Ask the senior tech <span>−8 pts</span>`;
  $('verify').disabled = state.verified;
  $('verify').innerHTML = state.verified ? 'Verified & closed ✓' : `Retest the original problem <span>↗</span>`;
  $('verify').classList.toggle('ready', state.fixed && !state.verified);
  $('case-summary').textContent = item.summary;
  $('activity-log').innerHTML = state.events.length ? [...state.events].reverse().map((event, index) => `<article class="log-entry ${esc(event.kind)} ${index === 0 ? 'latest' : ''}"><h4><span>${event.kind === 'good' ? '✓' : event.kind === 'bad' ? '!' : '↳'}</span>${esc(event.title)}</h4><pre>${esc(event.text)}</pre></article>`).join('') : '<p class="empty-log">No checks run. The customer is watching you thoughtfully.</p>';
  $('result-card').hidden = !state.verified;
  if (state.verified) {
    const next = game.cases.findIndex((state, index) => !state.verified && index > game.active);
    const nextOpen = next === -1 ? game.cases.findIndex(state => !state.verified) : next;
    const score = scoreCase(state);
    const rank = totalScore(game) >= 550 ? 'Evidence-based legend' : totalScore(game) >= 430 ? 'Senior tech energy' : 'Certified survivor';
    $('result-card').innerHTML = `<div class="result-stamp">${solved === CASES.length ? 'SHIFT COMPLETE' : 'FIX VERIFIED'} ✓</div><div class="result-heading"><h3 id="result-title">${solved === CASES.length ? rank : score === 100 ? 'Textbook fix. Cursed textbook.' : 'Another computer, uncursed.'}</h3><strong>${score}<span>/100</span></strong></div><p>${esc(item.lesson)}</p>${item.source ? `<a class="source-link" href="${item.source.url}" target="_blank" rel="noopener noreferrer">${esc(item.source.label)} ↗</a>` : ''}<div class="result-footer"><span>${state.mistakes} wrong repairs · ${state.hints} hints${!storageAvailable ? ' · Progress cannot be saved in this browser' : ' · Progress saved on this device'}</span>${nextOpen >= 0 ? `<button type="button" data-next="${nextOpen}">Next customer →</button>` : `<strong class="final-score">${totalScore(game)} / 600 · Six tickets. One cold coffee.</strong>`}</div>`;
  }
  renderTabs();
}
function act(action) {
  const result = action();
  save();
  render();
  if (result) announce(`${result.title}. ${result.text}`);
}
function selectCase(index) {
  if (!Number.isInteger(index) || index < 0 || index >= CASES.length) return;
  game.active = index;
  activeTab = CASES[index].tools[0].tab;
  save(); render();
  $('workbench').focus({ preventScroll: true });
  if (matchMedia('(max-width: 760px)').matches) $('workbench').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  announce(`Ticket ${CASES[index].number}. ${CASES[index].title}`);
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.case !== undefined) selectCase(Number(button.dataset.case));
  if (button.dataset.next !== undefined) selectCase(Number(button.dataset.next));
  if (button.dataset.tab) { activeTab = button.dataset.tab; renderTabs(); }
  if (button.dataset.inspect) { const id = button.dataset.inspect; act(() => inspect(game, id)); document.querySelector(`[data-inspect="${id}"]`).focus({ preventScroll: true }); }
  if (button.dataset.repair) { const id = button.dataset.repair; act(() => repair(game, id)); (game.cases[game.active].fixed ? $('verify') : document.querySelector(`[data-repair="${id}"]`)).focus({ preventScroll: true }); }
});
document.querySelector('.tool-tabs').addEventListener('keydown', event => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const current = tabs.findIndex(tab => tab.dataset.tab === activeTab);
  let next;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (next === undefined) return;
  event.preventDefault(); activeTab = tabs[next].dataset.tab; renderTabs(); tabs[next].focus();
});
$('verify').addEventListener('click', () => { act(() => verify(game)); if (game.cases[game.active].verified) $('result-card').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' }); });
$('hint').addEventListener('click', () => act(() => getHint(game)));
function requestReset(target) {
  resetTarget = target;
  $('reset-title').textContent = target === 'shift' ? 'Start a fresh shift?' : 'Retry this ticket?';
  $('reset-description').textContent = target === 'shift' ? 'This resets all six tickets, your notes, and your score on this device.' : 'This resets the current ticket’s evidence and score. Your other tickets stay as they are.';
  $('reset-dialog').showModal();
}
$('reset-case').addEventListener('click', () => requestReset('case'));
$('reset-shift').addEventListener('click', () => requestReset('shift'));
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => {
  if (resetTarget === 'shift') game = createGame(); else game.cases[game.active] = freshCase();
  activeTab = CASES[game.active].tools[0].tab;
  $('reset-dialog').close(); save(); render(); announce('Fresh start. The coffee is still cold.');
});
activeTab = CASES[game.active].tools[0].tab;
render();
