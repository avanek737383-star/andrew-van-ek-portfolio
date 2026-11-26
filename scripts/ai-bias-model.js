// Deliberately invented teaching data, not measured AI output or hiring advice.
const bound = (value, low, high) => Math.max(low, Math.min(high, Number(value)));
export const START = Object.freeze({ penalty: 25, cutoff: 70, share: 90, ignore: false });
export function applicantScores(settings) {
  const penalty = settings.ignore ? 0 : bound(settings.penalty, 0, 30);
  const cutoff = bound(settings.cutoff, 20, 90);
  return { a: 78, b: 78 - penalty, penalty, cutoff, aPass: 78 >= cutoff, bPass: 78 - penalty >= cutoff };
}
export function groupSample(penalty, cutoff) {
  const counts = { tp: 0, fn: 0, fp: 0, tn: 0, total: 100, qualified: 50 };
  for (let i = 0; i < 100; i++) {
    const qualified = i < 50;
    const position = ((i % 50) + 0.5) / 50;
    const skillScore = qualified ? 70 + 28 * position : 5 + 43 * position;
    const selected = Math.max(0, skillScore - penalty) >= cutoff;
    counts[qualified ? (selected ? 'tp' : 'fn') : (selected ? 'fp' : 'tn')]++;
  }
  return counts;
}
function scaleCounts(counts, factor) {
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value * factor]));
}
export function evaluate(settings) {
  const penalty = settings.ignore ? 0 : bound(settings.penalty, 0, 30);
  const cutoff = bound(settings.cutoff, 20, 90);
  const share = Math.round(bound(settings.share, 50, 90) / 10) * 10;
  const a = scaleCounts(groupSample(0, cutoff), share / 10);
  const b = scaleCounts(groupSample(penalty, cutoff), (100 - share) / 10);
  const accuracy = (a.tp + a.tn + b.tp + b.tn) / 1000;
  const recallA = a.tp / a.qualified;
  const recallB = b.tp / b.qualified;
  const selectionA = (a.tp + a.fp) / a.total;
  const selectionB = (b.tp + b.fp) / b.total;
  const higherRate = Math.max(selectionA, selectionB);
  return { a, b, accuracy, recallA, recallB, selectionA, selectionB, gap: Math.abs(recallA - recallB), selectionRatio: higherRate === 0 ? null : Math.min(selectionA, selectionB) / higherRate, penalty, cutoff, share };
}
export function wordShares(counts) {
  const normalized = counts.map(count => Math.max(0, Math.round(Number(count) || 0)));
  const total = normalized.reduce((sum, count) => sum + count, 0);
  return { total, shares: normalized.map(count => total ? count / total : 0) };
}
