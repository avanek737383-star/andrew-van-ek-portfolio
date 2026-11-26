const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const crypto=require('node:crypto');const path=require('node:path');
const root=path.resolve(__dirname,'..');const math=require('../scripts/coin-math.js');
const read=p=>fs.readFileSync(path.join(root,p));const json=p=>JSON.parse(read(p));
const sha=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
test('published source, dataset, and model hashes match their artifacts',()=>{
 const a=json('data/coin/transparent-training.json'),b=json('data/coin/reconstruction.json');
 assert.equal(a.datasetSha256,sha('data/coin/transparent-dataset.csv'));
 assert.equal(a.modelSha256,sha('data/coin/candidate-weights.json'));
 assert.equal(a.sourceSha256,sha('scripts/train-coin-transparent.py'));
 assert.equal(b.datasetSha256,sha('data/coin/reconstructed-seed42.csv'));
 assert.equal(b.sourceSha256,sha('documents/coin/recovered_train_120.py'));
});
test('JavaScript inference reproduces both models final-test counts from the published CSV',()=>{
 const a=json('data/coin/transparent-training.json');
 const models={original:json('data/coin/original-weights.json'),candidate:a.weights};
 const lines=read('data/coin/transparent-dataset.csv').toString().trim().split('\n').slice(1);
 const counts={},splits={train:0,validation:0,test:0};
 for(const rule of ['all','alternation','persistent','fair'])counts[rule]={original:{tp:0,tn:0,fp:0,fn:0},candidate:{tp:0,tn:0,fp:0,fn:0}};
 for(const line of lines){
  const row=line.trim().split(',');splits[row[1]]++;
  if(row[1]!=='test')continue;
  const features=math.features(row.slice(3,13).map(Number)),actual=Number(row[13]);
  for(const [name,weights] of Object.entries(models)){
   const predicted=math.probability(features,weights)>=.5;
   const key=actual?(predicted?'tp':'fn'):(predicted?'fp':'tn');
   for(const rule of ['all',row[2]])counts[rule][name][key]++;
  }
 }
 assert.deepEqual(splits,a.sizes);
 for(const rule of Object.keys(counts))for(const name of Object.keys(models))assert.deepEqual(counts[rule][name],a.results[rule][name].confusion,rule+' '+name);
 const script=read('scripts/coin-predictor.js').toString();
 const embedded=JSON.parse(script.match(/const CANDIDATE_MODEL = (.*);\r?\n/)[1]);
 assert.deepEqual(embedded.weights,a.weights);
});
