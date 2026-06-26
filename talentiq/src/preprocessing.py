"""
src/preprocessing.py
TalentIQ — Phase 2
Steps: Load → Duplicates → Impute → Outliers → Encode → Split → Scale → Save
No sklearn Pipeline — every step is manual and explicit.
Mode-aware: sample (testing) / full (training) via config.yaml
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from src.config_loader import load_config, load_features, load_data

# ── 1. DROP DUPLICATES ────────────────────────────────────────────────────────

def drop_duplicates(df):
    before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"[INFO] Dropped {before - len(df)} duplicate rows → {len(df)} remaining")
    return df

# ── 2. IMPUTE MISSING VALUES ──────────────────────────────────────────────────

def impute_missing(df, feat_cfg):
    for col in feat_cfg["numerical_features"]:
        if col in df.columns and df[col].isnull().sum() > 0:
            val = df[col].median()
            df[col] = df[col].fillna(val)
            print(f"[INFO] Imputed '{col}' → median={val:.2f}")

    for col in feat_cfg["categorical_features"]:
        if col in df.columns and df[col].isnull().sum() > 0:
            val = df[col].mode()[0]
            df[col] = df[col].fillna(val)
            print(f"[INFO] Imputed '{col}' → mode='{val}'")

    return df

# ── 3. CAP OUTLIERS (IQR) ─────────────────────────────────────────────────────

def cap_outliers(df, feat_cfg):
    for col in feat_cfg["outlier_columns"]:
        if col not in df.columns:
            continue
        Q1  = df[col].quantile(0.25)
        Q3  = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
        n_clipped = ((df[col] < lower) | (df[col] > upper)).sum()
        df[col] = df[col].clip(lower, upper)
        print(f"[INFO] Outlier cap '{col}' [{lower:.2f}, {upper:.2f}] → {n_clipped} clipped")
    return df

# ── 4. ORDINAL ENCODE ─────────────────────────────────────────────────────────

def ordinal_encode(df, feat_cfg):
    for col, mapping in feat_cfg.get("ordinal_maps", {}).items():
        if col in df.columns:
            df[col] = df[col].map(mapping)
            print(f"[INFO] Ordinal encoded '{col}'")
    return df

# ── 5. ONE-HOT ENCODE ─────────────────────────────────────────────────────────

def onehot_encode(df, feat_cfg):
    ohe_cols = [c for c in feat_cfg.get("onehot_columns", []) if c in df.columns]
    df = pd.get_dummies(df, columns=ohe_cols, drop_first=True)
    print(f"[INFO] One-hot encoded: {ohe_cols} → {df.shape[1]} total columns")
    return df

# ── 6. TRAIN-TEST SPLIT ───────────────────────────────────────────────────────

def split_data(df, cfg, feat_cfg):
    target = feat_cfg["target"]
    X = df.drop(columns=[target])
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=cfg["split"]["test_size"],
        stratify=y if cfg["split"]["stratify"] else None,
        random_state=cfg["split"]["random_state"]
    )
    print(f"[INFO] Split → Train: {len(X_train)}, Test: {len(X_test)}")
    return X_train, X_test, y_train, y_test

# ── 7. SCALE — fit on train ONLY ──────────────────────────────────────────────

def scale_features(X_train, X_test, feat_cfg):
    """
    CRITICAL: fit scaler on train only → transform both.
    Fitting on full data before split = data leakage.
    """
    num_cols = [c for c in feat_cfg["numerical_features"] if c in X_train.columns]

    scaler = StandardScaler()
    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])
    X_test[num_cols]  = scaler.transform(X_test[num_cols])

    os.makedirs("artifacts", exist_ok=True)
    joblib.dump(scaler, "artifacts/scaler.pkl")
    print(f"[INFO] Scaler fitted on {len(num_cols)} numerical cols → saved artifacts/scaler.pkl")
    return X_train, X_test, scaler

# ── 8. SAVE SPLITS ────────────────────────────────────────────────────────────

def save_splits(X_train, X_test, y_train, y_test, feat_cfg):
    os.makedirs("data/splits", exist_ok=True)
    target = feat_cfg["target"]

    train_df = X_train.copy(); train_df[target] = y_train.values
    test_df  = X_test.copy();  test_df[target]  = y_test.values

    train_df.to_csv("data/splits/train.csv", index=False)
    test_df.to_csv("data/splits/test.csv",   index=False)
    print("[INFO] Saved → data/splits/train.csv & test.csv")

# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_preprocessing():
    cfg      = load_config()
    feat_cfg = load_features()
    mode     = cfg.get("mode", "full").upper()
    print(f"\n{'='*50}")
    print(f"  PREPROCESSING  |  Mode: {mode}")
    print(f"{'='*50}")

    df = load_data()
    df = drop_duplicates(df)
    df = impute_missing(df, feat_cfg)
    df = cap_outliers(df, feat_cfg)
    df = ordinal_encode(df, feat_cfg)
    df = onehot_encode(df, feat_cfg)

    os.makedirs("data/processed", exist_ok=True)
    df.to_csv("data/processed/cleaned.csv", index=False)
    print("[INFO] Saved → data/processed/cleaned.csv")

    X_train, X_test, y_train, y_test = split_data(df, cfg, feat_cfg)
    X_train, X_test, _               = scale_features(X_train, X_test, feat_cfg)
    save_splits(X_train, X_test, y_train, y_test, feat_cfg)

    print(f"\n[DONE] Preprocessing complete | Mode: {mode}\n")
    return X_train, X_test, y_train, y_test

if __name__ == "__main__":
    run_preprocessing()
