"""One documented candidate; validation selects the checkpoint, test is read last.

Requires torch and numpy. Data are invented stochastic rules, not human behavior
or measurements of physical coins. Run from any directory.
"""
from pathlib import Path
from datetime import datetime,timezone
import csv,gzip,hashlib,json,random,re,time
import numpy as np
import torch
from torch import nn

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/coin';OUT.mkdir(exist_ok=True)
torch.set_num_threads(2)
torch.manual_seed(20261126);np.random.seed(20261126);random.seed(20261126)
torch.use_deterministic_algorithms(True)
RULES=['alternation','persistent','fair']
def features(past):
 streak=0
 for value in reversed(past):
  if value==past[-1]:streak+=1
  else:break
 heads=sum(v==1 for v in past[:-1]);hh=sum(a==b==1 for a,b in zip(past,past[1:]))
 return past+[(streak if past[-1] else -streak)/10,sum(past)/10,sum(a!=b for a,b in zip(past,past[1:]))/9,hh/heads if heads else .5]
def generate(seed,counts):
 rng=np.random.default_rng(seed);records=[]
 for rule,count in zip(RULES,counts):
  for _ in range(count):
   sequence=[int(rng.integers(0,2))]
   for step in range(11):
    streak=1
    for k in range(len(sequence)-1,0,-1):
     if sequence[k]==sequence[k-1]:streak+=1
     else:break
    persistence=(.18 if streak>=2 else .42) if rule=='alternation' else .515 if rule=='persistent' else .5
    sequence.append(sequence[-1] if rng.random()<persistence else 1-sequence[-1])
   past=sequence[-11:-1];records.append({'rule':rule,'past':past,'target':sequence[-1],'features':features(past)})
 return [records[int(i)] for i in rng.permutation(len(records))]
class Model(nn.Module):
 def __init__(self):
  super().__init__();self.fc1=nn.Linear(14,32);self.fc2=nn.Linear(32,16);self.fc3=nn.Linear(16,1)
 def forward(self,x):return torch.sigmoid(self.fc3(torch.relu(self.fc2(torch.relu(self.fc1(x))))))
def tensors(rows):return torch.tensor([r['features'] for r in rows],dtype=torch.float32),torch.tensor([[r['target']] for r in rows],dtype=torch.float32)
def export(model):
 s=model.state_dict();return {key:s[name].tolist() for key,name in [('fc1_w','fc1.weight'),('fc1_b','fc1.bias'),('fc2_w','fc2.weight'),('fc2_b','fc2.bias'),('fc3_w','fc3.weight'),('fc3_b','fc3.bias')]}
def load(weights):
 model=Model();model.load_state_dict({name:torch.tensor(weights[key]) for key,name in [('fc1_w','fc1.weight'),('fc1_b','fc1.bias'),('fc2_w','fc2.weight'),('fc2_b','fc2.bias'),('fc3_w','fc3.weight'),('fc3_b','fc3.bias')]});return model
def stats(rows,model):
 x,y=tensors(rows)
 with torch.no_grad():p=model(x).numpy().reshape(-1)
 truth=y.numpy().reshape(-1).astype(bool);pred=p>=.5;n=len(rows)
 c={'tp':int(np.sum(pred&truth)),'tn':int(np.sum(~pred&~truth)),'fp':int(np.sum(pred&~truth)),'fn':int(np.sum(~pred&truth))}
 a=(c['tp']+c['tn'])/n;z=1.96;den=1+z*z/n;center=(a+z*z/(2*n))/den;half=z*np.sqrt(a*(1-a)/n+z*z/(4*n*n))/den
 repeated=sum(row['past'][-1]==row['target'] for row in rows)/n
 return {'n':n,'accuracy':a,'confusion':c,'bce':float(nn.functional.binary_cross_entropy(torch.tensor(p),y.reshape(-1))), 'alwaysRepeatAccuracy':repeated,'alwaysSwitchAccuracy':1-repeated,'wilson95':[center-half,center+half]}
def main():
 original_path=OUT/'original-weights.json'
 if not original_path.exists():
  script=(ROOT/'scripts/coin-predictor.js').read_text(encoding='utf-8');original=json.loads(re.search(r'const ORIGINAL_MODEL_WEIGHTS = (\{[^\n]+\});',script)[1]);original_path.write_text(json.dumps(original,separators=(',',':'))+'\n')
 original=json.loads(original_path.read_text())
 train=generate(20261126,[8000,6000,6000]);validation=generate(20261127,[2000,1500,1500]);x,y=tensors(train);vx,vy=tensors(validation)
 model=Model();optimizer=torch.optim.Adam(model.parameters(),lr=.003,weight_decay=.001);loss_fn=nn.BCELoss();history=[];best=float('inf');best_weights=None;best_epoch=0;stale=0;started=time.perf_counter()
 for epoch in range(1,61):
  model.train();order=torch.randperm(len(train))
  for start in range(0,len(train),256):
   ix=order[start:start+256];optimizer.zero_grad();loss=loss_fn(model(x[ix]),y[ix]);loss.backward();optimizer.step()
  model.eval()
  with torch.no_grad():
   tp=model(x);vp=model(vx);tl=loss_fn(tp,y).item();vl=loss_fn(vp,vy).item();ta=((tp>=.5)==y.bool()).float().mean().item();va=((vp>=.5)==vy.bool()).float().mean().item()
  history.append({'epoch':epoch,'train_loss':tl,'val_loss':vl,'train_acc':ta*100,'val_acc':va*100})
  if vl<best-1e-6:best=vl;best_weights=export(model);best_epoch=epoch;stale=0
  else:stale+=1
  if epoch==1 or epoch%5==0:print(f'Epoch {epoch}: train {ta:.4f}, validation {va:.4f}, validation loss {vl:.5f}',flush=True)
  if stale>=8:break
 candidate=load(best_weights);candidate.eval();old=load(original);old.eval()
 # A separate seed is used only after checkpoint selection has finished.
 test=generate(20261128,[6000,4500,4500])
 results={}
 for rule in ['all',*RULES]:
  rows=test if rule=='all' else [row for row in test if row['rule']==rule]
  results[rule]={'original':stats(rows,old),'candidate':stats(rows,candidate)}
 csv_path=OUT/'transparent-dataset.csv'
 with csv_path.open('w',encoding='utf-8',newline='') as handle:
  writer=csv.writer(handle,lineterminator='\n');writer.writerow(['id','split','synthetic_rule',*[f'past_{i+1}' for i in range(10)],'target'])
  for split,rows in [('train',train),('validation',validation),('test',test)]:
   for index,row in enumerate(rows):writer.writerow([split+'-'+str(index),split,row['rule'],*row['past'],row['target']])
 (OUT/'transparent-dataset.csv.gz').write_bytes(gzip.compress(csv_path.read_bytes(),mtime=0))
 payload={'schema':1,'generatedAt':datetime.now(timezone.utc).isoformat(),'scope':'One controlled candidate trained on synthetic rules. Validation loss selected its checkpoint; the independent test set was evaluated only after selection. Not human data or physical coin measurements.', 'seeds':{'initialization':20261126,'train':20261126,'validation':20261127,'test':20261128},'sizes':{'train':len(train),'validation':len(validation),'test':len(test)},'training':{'maxEpochs':60,'completedEpochs':len(history),'selectedEpoch':best_epoch,'earlyStoppingPatience':8,'selection':'lowest validation binary cross-entropy','optimizer':'Adam','learningRate':.003,'weightDecay':.001,'batchSize':256,'architecture':[14,32,16,1],'device':'CPU','seconds':time.perf_counter()-started},'rules':{'alternation':'Repeat with probability 0.42 after a run of one; 0.18 after a run of two or more. Invented rule, not measured human behavior.','persistent':'Repeat with probability 0.515, otherwise switch.','fair':'Repeat with probability 0.5, otherwise switch.'},'datasetSha256':hashlib.sha256(csv_path.read_bytes()).hexdigest(),'versions':{'torch':torch.__version__,'numpy':np.__version__},'history':history,'results':results,'weights':best_weights}
 candidate_path=OUT/'candidate-weights.json'
 candidate_path.write_text(json.dumps(best_weights,separators=(',',':'))+'\n',encoding='utf-8')
 payload['sourceSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
 payload['modelSha256']=hashlib.sha256(candidate_path.read_bytes()).hexdigest()
 (OUT/'transparent-training.json').write_text(json.dumps(payload,indent=2)+'\n',encoding='utf-8')
 print('Selected epoch',best_epoch,'Final test:',{rule:{key:round(item['accuracy'],5) for key,item in value.items()} for rule,value in results.items()},flush=True)
if __name__=='__main__':main()
