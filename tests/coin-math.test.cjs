const{test}=require('node:test');const assert=require('node:assert/strict');const math=require('../scripts/coin-math.js');
test('persistence selects the opposite face outside the probability interval',()=>{
 assert.equal(math.nextFace(1,()=>.514,.515),1);assert.equal(math.nextFace(1,()=>.516,.515),0);
 assert.equal(math.nextFace(0,()=>.516,.515),1);
});
test('a controlled uniform grid has exactly 51.5 percent persistence',()=>{
 let same=0;for(let i=0;i<10000;i++)same+=math.nextFace(1,()=>i/10000,.515)===1;
 assert.equal(same,5150);
});
test('balance entropy describes composition and does not prove unpredictability',()=>{
 assert.equal(math.balanceEntropy([0,1,0,1,0,1]),1);assert.equal(math.balanceEntropy([1,1,1]),0);assert.equal(math.balanceEntropy([]),null);
});
