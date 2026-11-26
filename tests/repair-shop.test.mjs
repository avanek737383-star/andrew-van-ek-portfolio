import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES, createGame, restoreGame, inspect, repair, verify, getHint, totalScore, scoreCase } from '../scripts/repair-shop-engine.js';

test('all six tickets require evidence, a matching fix, and an explicit retest', () => {
  const game = createGame();
  CASES.forEach((item, index) => {
    game.active = index;
    const fix = item.actions.find(action => action.correct);
    repair(game, fix.id);
    assert.equal(game.cases[index].fixed, false, item.id);
    verify(game);
    assert.equal(game.cases[index].verified, false, item.id);
    item.requires.forEach(id => inspect(game, id));
    repair(game, fix.id);
    assert.equal(game.cases[index].fixed, true, item.id);
    assert.equal(game.cases[index].verified, false, item.id);
    verify(game);
    assert.equal(scoreCase(game.cases[index]), 100, item.id);
  });
  assert.equal(totalScore(game), 600);
});

test('wrong fixes cost points, hints are bounded, and retries cannot farm score', () => {
  const game = createGame();
  const item = CASES[0];
  item.requires.forEach(id => inspect(game, id));
  repair(game, item.actions.find(action => !action.correct).id);
  getHint(game); getHint(game); assert.equal(getHint(game), null);
  repair(game, item.actions.find(action => action.correct).id);
  verify(game); verify(game);
  assert.equal(totalScore(game), 69);
  repair(game, item.actions.find(action => action.correct).id);
  assert.equal(totalScore(game), 69);
  assert.equal(getHint(game), null);
});

test('cloud ticket requires its own diagnosis even after the image-association case', () => {
  const game = createGame();
  game.active = 5;
  CASES[5].requires.forEach(id => inspect(game, id));
  repair(game, 'register');
  assert.equal(game.cases[5].fixed, false);
  repair(game, 'download'); verify(game);
  assert.equal(game.cases[5].verified, true);
});

test('progress survives reload while invalid storage safely starts a new game', () => {
  const game = createGame();
  inspect(game, 'file');
  assert.deepEqual(restoreGame(JSON.stringify(game)), game);
  for (const bad of [null, '{bad', '{}', JSON.stringify({ ...game, active: 99 }), JSON.stringify({ ...game, cases: [] })]) {
    assert.deepEqual(restoreGame(bad), createGame());
  }
  game.cases[0].clues.push('not-a-real-check', 'file');
  game.cases[0].verified = true;
  const safe = restoreGame(JSON.stringify(game));
  assert.deepEqual(safe.cases[0].clues, ['file']);
  assert.equal(safe.cases[0].verified, false);
});

test('every case has a unique identity and a reachable, unambiguous repair', () => {
  assert.equal(new Set(CASES.map(item => item.id)).size, CASES.length);
  for (const item of CASES) {
    assert.equal(item.actions.filter(action => action.correct).length, 1);
    assert.ok(item.requires.every(id => item.tools.some(tool => tool.id === id)));
    assert.equal(new Set(item.tools.map(tool => tool.id)).size, item.tools.length);
  }
});
