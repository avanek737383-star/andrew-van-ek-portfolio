import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),math=require('./coin-math.js');
const root=new URL('../',import.meta.url);
const script=readFileSync(new URL('scripts/coin-predictor.js',root),'utf8');
const weights=JSON.parse(readFileSync(new URL('data/coin/original-weights.json',root),'utf8'));
const archived=JSON.parse(script.match(/const ORIGINAL_METRICS = (\{[^\n]+\});/)[1]);
const modelHash=createHash('sha256').update(JSON.stringify(weights)).digest('hex');
function run(persistence){
 const n=20000,seed=20261126,rng=math.seeded(seed),history=Array.from({length:10},()=>rng()<.5?0:1);
 let tp=0,tn=0,fp=0,fn=0,repeated=0,loss=0;
 for(let i=0;i<n;i++){
  const p=math.probability(math.features(history.slice(-10)),weights),prediction=p>=.5?1:0;
  const previous=history.at(-1),outcome=math.nextFace(previous,rng,persistence);
  if(outcome===previous)repeated++;
  if(prediction&&outcome)tp++;else if(prediction&&!outcome)fp++;else if(!prediction&&outcome)fn++;else tn++;
  const clamped=Math.max(1e-12,Math.min(1-1e-12,p));loss-=outcome*Math.log(clamped)+(1-outcome)*Math.log(1-clamped);
  history.push(outcome);
 }
 const accuracy=(tp+tn)/n,z=1.96,den=1+z*z/n,center=(accuracy+z*z/(2*n))/den,half=z*Math.sqrt(accuracy*(1-accuracy)/n+z*z/(4*n*n))/den;
 return{n,seed,persistence,accuracy,bce:loss/n,confusion:{tp,tn,fp,fn},observedPersistence:repeated/n,alwaysRepeatAccuracy:repeated/n,wilson95:[center-half,center+half]};
}
const result={schema:1,generatedAt:new Date().toISOString(),modelSha256:modelHash,scope:'Re-evaluation of the existing browser weights on newly generated synthetic sequences; no retraining and no physical-coin validation.',generator:'next = random() < persistence ? previous : opposite',runs:{fair:run(.5),persistent:run(.515)},archivedTraining:{...archived,status:'Historical validation snapshot. A separate seed-42 reconstruction matches its final confusion counts; this continuous-sequence benchmark does not reconstruct the optimization trajectory.'}};
writeFileSync(new URL('data/coin-benchmark.json',root),JSON.stringify(result,null,2)+'\n');
console.log('Reproducible synthetic evaluation:',Object.fromEntries(Object.entries(result.runs).map(([key,r])=>[key,{n:r.n,accuracy:r.accuracy,alwaysRepeat:r.alwaysRepeatAccuracy}])));
