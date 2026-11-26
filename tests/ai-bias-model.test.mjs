import { test } from 'node:test';
import assert from 'node:assert/strict';
import { START, applicantScores, evaluate, wordShares } from '../scripts/ai-bias-model.js';
test('two equal skills differ only by the explicit penalty',()=>{
  assert.equal(applicantScores(START).b,53);
  assert.equal(applicantScores({...START,ignore:true}).b,78);
});
test('all confusion-matrix counts sum to 1000 and metrics follow the counts',()=>{
  for(const penalty of [0,10,25,30])for(const cutoff of [20,40,70,90])for(const share of [50,70,90]){
    const r=evaluate({penalty,cutoff,share});
    assert.equal(r.a.total+r.b.total,1000);
    for(const g of [r.a,r.b]){
      assert.equal(g.tp+g.fn+g.fp+g.tn,g.total);
      assert.equal(g.tp+g.fn,g.qualified);
    }
    assert.equal(r.accuracy,(r.a.tp+r.a.tn+r.b.tp+r.b.tn)/1000);
    assert.equal(r.gap,Math.abs(r.a.tp/r.a.qualified-r.b.tp/r.b.qualified));
  }
});
test('mixing groups changes the headline without changing within-group rates',()=>{
  const a=evaluate(START),b=evaluate({...START,share:50});
  assert.equal(a.recallA,b.recallA); assert.equal(a.recallB,b.recallB);
  assert.notEqual(a.accuracy,b.accuracy);
  assert.ok(a.accuracy>.95);assert.ok(a.recallB<.2);
});
test('lowering cutoff admits more qualified people but can add false positives',()=>{
  const a=evaluate(START),b=evaluate({...START,cutoff:40});
  assert.ok(b.b.tp>a.b.tp);assert.ok(b.a.fp>a.a.fp);
});
test('removing this explicit penalty equalizes rates without making every cutoff perfect',()=>{
  const r=evaluate({...START,ignore:true,cutoff:90});
  assert.equal(r.gap,0);assert.ok(r.a.fn>0);
});
test('word shares show a real denominator and handle no examples',()=>{
  assert.deepEqual(wordShares([80,15,5]),{total:100,shares:[.8,.15,.05]});
  assert.deepEqual(wordShares([0,0,0]),{total:0,shares:[0,0,0]});
});
