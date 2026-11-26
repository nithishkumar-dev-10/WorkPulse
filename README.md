<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=ACM%20SIG-AI%20TASKS&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Recruitment%20Task%20Portfolio%20%E2%80%94%20Nithish%20Kumar%20S&descAlignY=58&descSize=18&descColor=90cdf4&animation=fadeIn" width="100%"/>

<br/>

```
  🧠  Learn · Build · Ship  🚀
```

<img src="https://img.shields.io/badge/Projects-3-0ea5e9?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/Language-Python-8b5cf6?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/Focus-Applied%20ML-10b981?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/Status-Completed-22c55e?style=flat-square&labelColor=0f172a" />

</div>

---

## Introduction

This repository consolidates all tasks completed as part of the **ACM SIG-AI recruitment process**. It contains three independent machine learning projects, each corresponding to a distinct stage of the selection process and reflecting an increasing level of technical scope — from single-model feature engineering, to multi-model comparison, to a complete multi-stage system architecture.

The projects are structured to be reviewed sequentially, as each builds on the methodology and evaluation practices established in the previous one.

---

## Progression

```
Feature Engineering Challenge
        ↓
     WorkPulse
        ↓
TransReliant Cascade
```

| Stage | Core Competency Demonstrated |
|---|---|
| **Feature Engineering Challenge** | Extracting predictive signal from weakly correlated, anonymized data under a fixed-model constraint |
| **WorkPulse** | Comparative model evaluation, class-imbalance handling, and prediction explainability |
| **TransReliant Cascade** | Multi-model system design — a classification stage feeding a conditionally-triggered regression stage, with leakage-aware architecture |

Each project increases in scope relative to the last: single-model optimization → multi-model comparison → multi-stage pipeline architecture.

---

## Repository Overview

| Project Name | Stage | Status | Primary Focus |
|---|:---:|:---:|---|
| **Feature Engineering Challenge** | Week 1 | Completed | Feature engineering under a fixed model constraint (Logistic Regression only) |
| **WorkPulse** | Week 2 | Completed | Model comparison, tuning, and explainability (SHAP) on imbalanced data |
| **TransReliant Cascade** | Final Project | Completed | Two-stage ML system: classification → regression cascade |

---

## Project Timeline

```
Week 1   →  Feature Engineering Challenge   (Santander Transaction Prediction)
Week 2   →  WorkPulse                       (IBM HR Attrition Prediction)
Final      →  TransReliant Cascade            (Indian Railway Ticket Confirmation)
```

---

## 01 · Feature Engineering Challenge

**Dataset:** Santander Customer Transaction Prediction (Kaggle)

A binary classification task constrained to a single model family — Logistic Regression, with no ensembling and no external data permitted. The objective was to raise recall from a baseline of **0.83 to 0.88+** through feature engineering alone.

**Approach:**
- Constructed frequency-encoded, row-wise statistical, and pairwise interaction features to surface signal from 200 anonymized, weakly correlated columns
- Diagnosed a **spurious-recall failure mode**, where naive `class_weight='balanced'` inflated recall by over-predicting the positive class rather than learning genuine signal
- Replaced the blunt class-weight switch with a **tuned weight ratio combined with a calibrated decision threshold**

**Result:** Final test recall of **0.888**, with a precision/F1 trade-off that was deliberately chosen and justified over the naive balanced-weight alternative.

---

## 02 · WorkPulse

**Dataset:** IBM HR Analytics Attrition Dataset (Kaggle)

An employee attrition prediction system designed to help HR teams identify at-risk employees ahead of resignation.

**Approach:**
- Benchmarked **Logistic Regression, Random Forest, and XGBoost** using cross-validated hyperparameter tuning
- Engineered **10 domain-informed features** (e.g. `WorkloadScore`, `LoyaltyIndex`, `StagnationRisk`) to capture burnout and turnover risk beyond the raw dataset
- Addressed class imbalance using **SMOTE**, applied strictly to the training split to prevent leakage
- Evaluated model explainability with **SHAP** and quantified error trade-offs via False Positive/Negative rate analysis

**Result:** XGBoost selected as the production model (**F1-macro 0.7165, ROC-AUC 0.7963**), offering the strongest balance between missed attrition risk and unnecessary retention effort.

---

## 03 · TransReliant Cascade

**Dataset:** Indian Railway Ticket Confirmation Dataset (Kaggle)

A two-stage cascade system that predicts ticket confirmation status and, for passengers flagged as unconfirmed, estimates the severity of their waitlist position.

**System design:**
- **Stage 1 (Classification):** Predicts `Confirmation Status` from booking and journey features
- **Stage 2 (Regression):** Triggered only for the subset flagged "Not Confirmed" by Stage 1, predicting `Waitlist Position`
- Stage 2 is trained on ground-truth labels but **routed by Stage 1's predictions at inference time**, avoiding compounded errors and label leakage between stages

**Pipeline scope:** EDA → data cleaning → feature engineering (`seat_pressure`, `booking_urgency_bucket`) → independent preprocessing per stage → per-stage model comparison and tuning → threshold optimization → system-level evaluation, supported by a CLI demo, architecture diagram, and full experiment log.

---

## Repository Structure

```
ACM-SIG-AI-TASKS/
│
├── 01-feature-engineering-challenge/
│   ├── notebooks/
│   ├── logs/
│   ├── reports/
│   ├── artifacts/
│   └── README.md
│
├── 02-workpulse/
│   ├── config/
│   ├── src/
│   ├── notebooks/
│   ├── data/
│   ├── artifacts/
│   ├── reports/
│   └── README.md
│
├── 03-transreliant-cascade/
│   ├── data/
│   ├── src/
│   ├── notebooks/
│   ├── artifacts/
│   ├── reports/
│   └── README.md
│
└── README.md          ← you are here
```

---

## Technologies Used

<div align="center">

| Layer | Tools |
|---|---|
| Language | Python 3.10+ |
| ML Frameworks | scikit-learn, XGBoost |
| Imbalance Handling | imbalanced-learn (SMOTE, class weighting) |
| Explainability | SHAP, permutation importance |
| Data | pandas, NumPy |
| Visualization | matplotlib, seaborn |
| Config Management | PyYAML |
| Serialization | joblib, pickle |
| Data Access | kagglehub, python-dotenv |

</div>

---

## Skills Covered

- Feature engineering under fixed-model constraints
- Class-imbalance handling (SMOTE, custom class weighting, decision-threshold tuning)
- Comparative model evaluation and hyperparameter search (GridSearch / RandomizedSearch)
- Model explainability (SHAP, feature and permutation importance)
- Leakage-aware data pipeline design
- Multi-stage cascade architecture (classification → conditional regression)
- Configuration-driven, reproducible ML pipelines
- Structured experiment logging and evaluation reporting

---

## Current Repository Status

| Project | Status |
|---|:---:|
| Feature Engineering Challenge | Completed |
| WorkPulse | Completed |
| TransReliant Cascade | Completed |

---

## How to run the WorkPulse web app (with authentication)

Accounts protect `/predict`, `/predict/batch`, `/explain` and the Predict, Batch and History pages. `/health`, `/models`, `/schema` and About stay public.

### 1. Configure

```bash
cd workpulse
cp .env.example .env
# Fill in DATABASE_URL (Neon Postgres), JWT_SECRET and FRONTEND_ORIGIN

cd ../frontend
cp .env.example .env   # optional; VITE_API_URL defaults to http://localhost:8000
```

Tables (`users`) are created automatically when the API starts. Never commit the real `.env`.

### 2. Install and run

```bash
# Terminal 1 — API
cd workpulse
python -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/uvicorn api:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### 3. Manual auth checklist

- [ ] Signup with a new email → redirected to Predict as a logged-in user
- [ ] Duplicate email → inline "already exists" error
- [ ] Wrong password → inline "Invalid email or password"
- [ ] `GET /api/auth/me` → returns the current user; without cookies → 401
- [ ] Open `/` while logged out → redirected to Login, then back after login
- [ ] Logout → `/api/auth/me` returns 401 and Login/Signup buttons reappear
- [ ] After access-token expiry, a prediction triggers `/api/auth/refresh` once and succeeds

---

## Closing Note

This repository documents a deliberate, stage-by-stage progression in applied machine learning — from feature-level optimization, through comparative model evaluation, to the design of a complete multi-model system. Each project builds on the methodology and evaluation standards established in the previous one, with the broader objective of developing production-oriented AI engineering skills.

<div align="center">

**Nithish Kumar S** · B.Tech, Computer Science

</div>
