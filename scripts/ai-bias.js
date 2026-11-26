import { START, applicantScores, evaluate, wordShares } from './ai-bias-model.js?v=20261126-guided-1';
const $ = id => document.getElementById(id);
const settings = { ...START };
const pct = value => (value * 100).toFixed(1).replace(/\.0$/, '') + '%';
const points = value => (value * 100).toFixed(1).replace(/\.0$/, '');
function update() {
  const pair = applicantScores(settings);
  const result = evaluate(settings);
  $('bias-penalty').value = settings.penalty;
  $('penalty-value').textContent = `${settings.penalty} points`;
  $('ignore-clue').checked = settings.ignore;
  $('threshold-slider').value = settings.cutoff;
  $('threshold-display').textContent = `${settings.cutoff} points`;
  $('ratio-slider').value = settings.share;
  $('ratio-display').textContent = `${settings.share}% A / ${100 - settings.share}% B`;
  $('applicant-a-score').textContent = pair.a;
  $('applicant-b-score').textContent = pair.b;
  $('applied-penalty').textContent = `${pair.penalty} points`;
  $('equation-penalty').textContent = pair.penalty;
  ['a', 'b'].forEach(group => {
    const pass = pair[`${group}Pass`];
    const el = $(`applicant-${group}-decision`);
    el.textContent = `${pass ? 'Invited' : 'Not invited'} · cutoff: ${settings.cutoff} points`;
    el.classList.toggle('not-invited', !pass);
  });
  $('applicant-explanation').textContent = pair.penalty === 0
    ? `Both applicants keep their 78 skill points. The irrelevant clue has no effect. ${pair.aPass ? 'Both get an interview.' : 'Both are rejected because the cutoff is above 78.'} This removes the one penalty built into our example; it is not a general fairness certificate.`
    : `Applicant B loses ${pair.penalty} points despite having the same job-relevant skills as A. ${pair.aPass && !pair.bPass ? 'That changes the interview decision.' : 'Their scores differ even though this cutoff currently gives them the same interview outcome.'} Neither applicant’s ability changed.`;
  $('lab-context').textContent = `Current setup: Group B loses ${result.penalty} points ${settings.ignore ? '(the clue is being ignored)' : 'for the irrelevant clue'}; the interview cutoff is ${result.cutoff}. Group A has ${result.a.total} applicants and Group B has ${result.b.total}.`;
  $('stat-accuracy').textContent = pct(result.accuracy);
  const correct = result.a.tp + result.a.tn + result.b.tp + result.b.tn;
  $('accuracy-calculation').textContent = `${correct} correct decisions ÷ 1,000 applicants = ${pct(result.accuracy)}. “Correct” means matching the label we assigned.`;
  $('group-results').innerHTML = ['a', 'b'].map(group => {
    const counts = result[group];
    const rate = group === 'a' ? result.recallA : result.recallB;
    return `<article class="bias-group-result"><div><h4>Group ${group.toUpperCase()}</h4><strong>${pct(rate)}</strong></div><p>${counts.tp} of ${counts.qualified} qualified applicants invited.</p><div class="bias-rate-track" aria-hidden="true"><span style="width:${rate * 100}%"></span></div><p><b>${counts.fn} qualified people missed.</b> ${counts.fp} unqualified people invited.</p></article>`;
  }).join('');
  $('stat-eod').textContent = `${points(result.gap)} percentage-point opportunity gap`;
  $('gap-calculation').textContent = `${pct(result.recallA)} − ${pct(result.recallB)} = ${points(result.gap)} percentage points between the groups’ qualified-applicant interview rates.`;
  const errors = result.a.fp + result.b.fp;
  $('imbalance-takeaway').textContent = result.penalty === 0
    ? `The group penalty is removed, so both groups now have the same interview rate among qualified applicants. At this cutoff, ${result.a.fn + result.b.fn} qualified people are still missed and ${errors} unqualified people are invited. Check those counts as well as the gap.`
    : `The headline says ${pct(result.accuracy)} accurate, but Group B misses ${result.b.fn} of its ${result.b.qualified} qualified applicants. ${errors ? `This cutoff also invites ${errors} unqualified applicants across the test set.` : 'No unqualified applicants are invited at this cutoff.'} The overall average doesn’t tell this whole story.`;
  const rows = [['All applicants', 'total'], ['Qualified applicants', 'qualified'], ['Qualified and invited (true positive)', 'tp'], ['Qualified but rejected (false negative)', 'fn'], ['Unqualified but invited (false positive)', 'fp'], ['Unqualified and rejected (true negative)', 'tn']];
  $('count-table').innerHTML = rows.map(([label, key]) => `<tr><th scope="row">${label}</th><td>${result.a[key]}</td><td>${result.b[key]}</td></tr>`).join('');
  $('selection-ratio').textContent = result.selectionRatio === null ? 'Nobody is selected in either group, so a ratio is undefined. Equal rejection rates alone would not mean a useful or fair system.' : `Group A selects ${result.a.tp + result.a.fp}/${result.a.total} = ${pct(result.selectionA)}. Group B selects ${result.b.tp + result.b.fp}/${result.b.total} = ${pct(result.selectionB)}. Lower rate ÷ higher rate = ${result.selectionRatio.toFixed(2)}. This uses selection rates, not individual scores.`;
}
$('bias-penalty').addEventListener('input', event => { settings.penalty = Number(event.target.value); update(); });
$('ignore-clue').addEventListener('change', event => { settings.ignore = event.target.checked; update(); });
$('threshold-slider').addEventListener('input', event => { settings.cutoff = Number(event.target.value); update(); });
$('ratio-slider').addEventListener('input', event => { settings.share = Number(event.target.value); update(); });
$('reset-bias').addEventListener('click', () => { Object.assign(settings, START); update(); });
document.querySelectorAll('[data-bias-preset]').forEach(button => button.addEventListener('click', () => {
  Object.assign(settings, START);
  if (button.dataset.biasPreset === 'cutoff') settings.cutoff = 40;
  if (button.dataset.biasPreset === 'remove') settings.ignore = true;
  update();
}));
document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
  $('check-feedback').textContent = button.dataset.answer === 'no' ? 'Exactly. Changing who dominates an average can improve the headline while Group B’s own outcomes stay the same. Check the group counts.' : 'Not necessarily. An average combines groups. It can change because the group mix changed, even when neither group’s own rate improved. Check Group B directly.';
}));
const words = ['he', 'she', 'they'];
function updateWords() {
  const counts = words.map(word => Number($(`count-${word}`).value));
  const result = wordShares(counts);
  words.forEach((word, index) => $(`value-${word}`).textContent = counts[index]);
  $('prob-bars').innerHTML = words.map((word, index) => `<div class="bias-word-result"><div><strong>“${word}”</strong><span>${counts[index]} ÷ ${result.total} = ${result.total ? pct(result.shares[index]) : 'undefined'}</span></div><div class="bias-rate-track" aria-hidden="true"><span style="width:${result.shares[index] * 100}%"></span></div></div>`).join('');
  $('llm-insight-content').textContent = result.total ? `There are ${result.total} total example mentions. Each bar is that pronoun’s count divided by the total. These are text frequencies—not the chance that a particular engineer uses that pronoun.` : 'There are no examples. With a total of zero, shares cannot be calculated. No data does not mean equal evidence for every answer.';
}
$('prompt-preset').addEventListener('change', event => {
  const values = { skewed: [80, 15, 5], balanced: [33, 33, 34], reversed: [15, 80, 5] }[event.target.value];
  words.forEach((word, index) => $(`count-${word}`).value = values[index]);
  updateWords();
});
words.forEach(word => $(`count-${word}`).addEventListener('input', updateWords));
update(); updateWords();
