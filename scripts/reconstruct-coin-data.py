"""Reconstruct the recovered seed-42 dataset and verify its validation counts.

Requires numpy and torch. It evaluates existing weights; it does not retrain them.
"""
from pathlib import Path
import csv, hashlib, importlib.util, json, re
from datetime import datetime, timezone
import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'documents/coin/recovered_train_120.py'
spec = importlib.util.spec_from_file_location('recovered_coin_training', source)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
np.random.seed(42)
permutations = []
original_permutation = np.random.permutation
def capture_permutation(n):
    result = original_permutation(n)
    permutations.append(result.copy())
    return result
np.random.permutation = capture_permutation
try:
    x, y = module.generate_synthetic_coin_sequences()
finally:
    np.random.permutation = original_permutation
script = (ROOT / 'scripts/coin-predictor.js').read_text(encoding='utf-8')
weights = json.loads((ROOT / 'data/coin/original-weights.json').read_text(encoding='utf-8'))
model = module.NeuralCoinPredictor()
model.load_state_dict({
    name: torch.tensor(weights[key], dtype=torch.float32)
    for name, key in [('fc1.weight','fc1_w'),('fc1.bias','fc1_b'),('fc2.weight','fc2_w'),('fc2.bias','fc2_b'),('fc3.weight','fc3_w'),('fc3.bias','fc3_b')]
})
model.eval()
with torch.no_grad():
    predicted = (model(torch.tensor(x[4800:])) >= .5).numpy().reshape(-1)
actual = y[4800:].reshape(-1).astype(bool)
counts = dict(tp=int(np.sum(predicted & actual)), tn=int(np.sum(~predicted & ~actual)), fp=int(np.sum(predicted & ~actual)), fn=int(np.sum(~predicted & actual)))
assert counts == {'tp':361,'tn':270,'fp':322,'fn':247}, counts
data_dir = ROOT / 'data/coin'
data_dir.mkdir(exist_ok=True)
dataset = data_dir / 'reconstructed-seed42.csv'
with dataset.open('w', encoding='utf-8', newline='') as handle:
    writer = csv.writer(handle, lineterminator='\n')
    writer.writerow(['row','split','synthetic_rule',*[f'past_{i+1}' for i in range(10)],'target',*[f'feature_{i}' for i in range(14)]])
    for i, original_index in enumerate(permutations[-1]):
        regime = 'alternation_rule' if original_index < 2400 else 'persistence_53pct' if original_index < 4200 else 'independent_fair'
        writer.writerow([i,'train' if i<4800 else 'validation',regime,*map(int,x[i,:10]),int(y[i,0]),*[format(float(value),'.9g') for value in x[i]]])
proof = {
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'method':'Reconstruction from the recovered generator with NumPy seed 42; existing saved weights evaluated without retraining.',
    'rows':len(x),'trainRows':4800,'validationRows':1200,'seed':42,
    'mixture':{'alternation_rule':2400,'persistence_53pct':1800,'independent_fair':1800},
    'scope':'Invented sequence rules. Not collected human choices, physical coin measurements, or proof of the original optimization run.',
    'datasetSha256':hashlib.sha256(dataset.read_bytes()).hexdigest(),
    'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
    'versions':{'numpy':np.__version__,'torch':torch.__version__},
    'reproducedValidation':{'n':1200,'confusion':counts,'accuracy':(counts['tp']+counts['tn'])/1200},
    'validationUse':'This split was monitored during the original 120 epochs; it is validation data, not an untouched final test set. New synthetic test runs are separate.'
}
(data_dir / 'reconstruction.json').write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
print('Reconstructed',len(x),'rows; validation counts match:',counts,'accuracy:',proof['reproducedValidation']['accuracy'])
