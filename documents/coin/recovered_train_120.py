# Recovered training script. Adaptations: portable output path, accurate descriptions,
# explicit fixed sample count, and label-flip odds renamed (not physical SNR).
# All examples are synthetic rules, not measured human behavior or physical coin data.
import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Set random seed
torch.manual_seed(42)
np.random.seed(42)

device = torch.device('cpu')

def generate_synthetic_coin_sequences(n_samples=6000, window_size=10):
    if n_samples != 6000:
        raise ValueError('This recovered generator has fixed counts totaling 6000 examples.')
    X_list = []
    y_list = []

    # 1. Invented alternation rule (not measured human choices)
    for _ in range(2400):
        seq = [np.random.choice([0, 1])]
        for _ in range(window_size + 1):
            streak = 1
            for k in range(len(seq)-1, 0, -1):
                if seq[k] == seq[k-1]:
                    streak += 1
                else:
                    break
            if streak >= 2:
                prob_same = max(0.18, 0.5 - 0.18 * streak)
            else:
                prob_same = 0.42
            next_val = seq[-1] if np.random.rand() < prob_same else (1 - seq[-1])
            seq.append(next_val)
        past = seq[-(window_size+1):-1]
        target = seq[-1]
        X_list.append(extract_features(past))
        y_list.append(target)

    # 2. Synthetic 53% persistence rule (not physical simulation)
    for _ in range(1800):
        seq = [np.random.choice([0, 1])]
        for _ in range(window_size + 1):
            prob_same = 0.53
            next_val = seq[-1] if np.random.rand() < prob_same else (1 - seq[-1])
            seq.append(next_val)
        past = seq[-(window_size+1):-1]
        target = seq[-1]
        X_list.append(extract_features(past))
        y_list.append(target)

    # 3. Pure fair Bernoulli trials (50/50 control)
    for _ in range(1800):
        seq = np.random.choice([0, 1], size=window_size + 2).tolist()
        past = seq[-(window_size+1):-1]
        target = seq[-1]
        X_list.append(extract_features(past))
        y_list.append(target)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.float32).reshape(-1, 1)

    indices = np.random.permutation(len(X))
    return X[indices], y[indices]

def extract_features(past_window):
    feats = list(past_window) # 10 values
    curr = past_window[-1]
    streak = 0
    for val in reversed(past_window):
        if val == curr:
            streak += 1
        else:
            break
    streak_val = (streak if curr == 1 else -streak) / 10.0
    feats.append(streak_val)

    heads_ratio = sum(past_window) / float(len(past_window))
    feats.append(heads_ratio)

    alternations = sum(1 for i in range(len(past_window)-1) if past_window[i] != past_window[i+1])
    alt_rate = alternations / float(len(past_window) - 1)
    feats.append(alt_rate)

    hh_count = sum(1 for i in range(len(past_window)-1) if past_window[i] == 1 and past_window[i+1] == 1)
    h_count = sum(1 for i in range(len(past_window)-1) if past_window[i] == 1)
    p_hh = (hh_count / float(h_count)) if h_count > 0 else 0.5
    feats.append(p_hh)

    return feats

class NeuralCoinPredictor(nn.Module):
    def __init__(self, input_dim=14, hidden1=32, hidden2=16):
        super(NeuralCoinPredictor, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden1)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(hidden1, hidden2)
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(hidden2, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        out = self.relu1(self.fc1(x))
        out = self.relu2(self.fc2(out))
        out = self.sigmoid(self.fc3(out))
        return out

def run_extended_120_epochs():
    print("Generating dataset on CPU...")
    X, y = generate_synthetic_coin_sequences(n_samples=6000, window_size=10)

    n_train = int(len(X) * 0.8)
    X_train, y_train = torch.tensor(X[:n_train], device=device), torch.tensor(y[:n_train], device=device)
    X_val, y_val = torch.tensor(X[n_train:], device=device), torch.tensor(y[n_train:], device=device)

    model = NeuralCoinPredictor(input_dim=14, hidden1=32, hidden2=16).to(device)
    criterion = nn.BCELoss()
    # Using cosine annealing or step decay for the extended 120-epoch run
    optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=120, eta_min=0.0005)

    epochs = 120
    batch_size = 64
    history = []

    print(f"Beginning 120-Epoch CPU Training...")
    for epoch in range(1, epochs + 1):
        model.train()
        permutation = torch.randperm(len(X_train))
        epoch_loss = 0.0
        correct_train = 0
        total_train = 0

        for i in range(0, len(X_train), batch_size):
            indices = permutation[i:i+batch_size]
            batch_x, batch_y = X_train[indices], y_train[indices]

            optimizer.zero_grad()
            preds = model(batch_x)
            loss = criterion(preds, batch_y)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * len(batch_x)
            predicted_class = (preds >= 0.5).float()
            correct_train += (predicted_class == batch_y).sum().item()
            total_train += len(batch_x)

        scheduler.step()
        train_loss = epoch_loss / total_train
        train_acc = (correct_train / total_train) * 100.0

        model.eval()
        with torch.no_grad():
            val_preds = model(X_val)
            val_loss = criterion(val_preds, y_val).item()
            val_pred_class = (val_preds >= 0.5).float()
            val_acc = ((val_pred_class == y_val).sum().item() / len(y_val)) * 100.0

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_loss": round(val_loss, 4),
            "train_acc": round(train_acc, 2),
            "val_acc": round(val_acc, 2),
            "lr": round(optimizer.param_groups[0]['lr'], 6)
        })

        if epoch % 20 == 0 or epoch == 1 or epoch == epochs:
            print(f"Epoch [{epoch:3d}/{epochs:3d}] | Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")

    # Compute Complete Holdout Evaluation & Confusion Matrix
    print("\nComputing Confusion Matrix & Statistical Metrics...")
    model.eval()
    with torch.no_grad():
        preds_val = model(X_val)
        y_hat = (preds_val >= 0.5).float().cpu().numpy().flatten()
        y_true = y_val.cpu().numpy().flatten()

    TP = int(np.sum((y_hat == 1) & (y_true == 1)))
    TN = int(np.sum((y_hat == 0) & (y_true == 0)))
    FP = int(np.sum((y_hat == 1) & (y_true == 0)))
    FN = int(np.sum((y_hat == 0) & (y_true == 1)))
    total_val = len(y_true)

    accuracy = (TP + TN) / total_val * 100.0
    precision = (TP / (TP + FP)) * 100.0 if (TP + FP) > 0 else 0.0
    recall = (TP / (TP + FN)) * 100.0 if (TP + FN) > 0 else 0.0 # Sensitivity
    specificity = (TN / (TN + FP)) * 100.0 if (TN + FP) > 0 else 0.0
    f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    balanced_acc = (recall + specificity) / 2.0
    mcc_num = (TP * TN) - (FP * FN)
    mcc_den = np.sqrt(float((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN)))
    mcc = (mcc_num / mcc_den) if mcc_den > 0 else 0.0

    confusion_matrix_data = {
        "TP": TP, "FP": FP, "TN": TN, "FN": FN,
        "total_samples": total_val,
        "accuracy_pct": round(accuracy, 2),
        "precision_pct": round(precision, 2),
        "recall_sensitivity_pct": round(recall, 2),
        "specificity_pct": round(specificity, 2),
        "f1_score": round(f1_score, 2),
        "balanced_accuracy_pct": round(balanced_acc, 2),
        "mcc": round(mcc, 4),
        "random_baseline_pct": 50.00
    }

    # Noise Perturbation & Robustness Sweep
    print("Executing label-flip sensitivity sweep (not physical signal-to-noise)...")
    noise_levels = [0.0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.50]
    noise_sweep = []

    for nl in noise_levels:
        # Flip a fraction nl of ground truth labels
        y_noisy = y_val.clone()
        if nl > 0:
            flip_mask = torch.rand_like(y_noisy) < nl
            y_noisy[flip_mask] = 1.0 - y_noisy[flip_mask]

        with torch.no_grad():
            preds_n = model(X_val)
            pred_classes = (preds_n >= 0.5).float()
            acc_n = ((pred_classes == y_noisy).sum().item() / len(y_noisy)) * 100.0
            loss_n = criterion(preds_n, y_noisy).item()

        # Odds of unchanged vs flipped labels in logarithmic units, not signal power.
        label_odds_db = round(10.0 * np.log10((1.0 - nl) / nl), 1) if 0 < nl < 1 else None

        noise_sweep.append({
            "noise_pct": int(nl * 100),
            "unchanged_to_flipped_label_odds_db": label_odds_db,
            "accuracy_pct": round(acc_n, 2),
            "bce_loss": round(loss_n, 4),
            "edge_over_random": round(acc_n - 50.0, 2)
        })

    state_dict = model.state_dict()
    exported_weights = {
        "fc1_w": state_dict["fc1.weight"].cpu().numpy().tolist(),
        "fc1_b": state_dict["fc1.bias"].cpu().numpy().tolist(),
        "fc2_w": state_dict["fc2.weight"].cpu().numpy().tolist(),
        "fc2_b": state_dict["fc2.bias"].cpu().numpy().tolist(),
        "fc3_w": state_dict["fc3.weight"].cpu().numpy().tolist(),
        "fc3_b": state_dict["fc3.bias"].cpu().numpy().tolist(),
    }

    output_package = {
        "model_architecture": {
            "name": "NeuralCoinPredictor",
            "type": "Multi-Layer Perceptron (Binary Sequence Classifier)",
            "input_dimension": 14,
            "hidden_layers": [32, 16],
            "output_dimension": 1,
            "activations": ["ReLU", "ReLU", "Sigmoid"],
            "loss_function": "Binary Cross-Entropy (BCE)",
            "optimizer": "Adam + CosineAnnealing (lr=0.005 -> 0.0005)",
            "device": "CPU (PyTorch 2.13.0+cpu)",
            "training_epochs": epochs,
            "total_samples": len(X),
        },
        "final_metrics": {
            "final_train_loss": history[-1]["train_loss"],
            "final_val_loss": history[-1]["val_loss"],
            "final_train_acc": history[-1]["train_acc"],
            "final_val_acc": history[-1]["val_acc"],
            "eval_accuracy": round(accuracy, 2),
            "random_baseline": 50.00
        },
        "confusion_matrix": confusion_matrix_data,
        "noise_sweep": noise_sweep,
        "training_history": history,
        "weights": exported_weights
    }

    out_path = os.path.join(os.getcwd(), "reproduced_coin_model_telemetry.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_package, f, indent=2)

    print(f"\nExtended 120-Epoch Telemetry saved to {out_path}")
    print(f"Confusion Matrix: TP={TP}, FP={FP}, TN={TN}, FN={FN} | F1={f1_score:.2f}% | Accuracy={accuracy:.2f}%")

if __name__ == "__main__":
    run_extended_120_epochs()
