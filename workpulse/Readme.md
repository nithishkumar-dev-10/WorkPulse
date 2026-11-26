<div align="center">

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=WorkPulse&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=ML-Based%20Employee%20Attrition%20Prediction%20System&descAlignY=58&descSize=18&descColor=90cdf4&animation=fadeIn" width="100%"/>

<br/>

<table border="0" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

```
  🧠  Predict · Analyze · Retain  🎯
```

</td>
</tr>
</table>

<br/>

<!-- STAT PILLS -->
<img src="https://img.shields.io/badge/Accuracy-85.03%25-0ea5e9?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/F1--macro-0.7165-8b5cf6?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/ROC--AUC-0.7963-10b981?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/Selected-XGBoost-f97316?style=flat-square&labelColor=0f172a" />
&nbsp;
<img src="https://img.shields.io/badge/Models-3%20Compared-ec4899?style=flat-square&labelColor=0f172a" />

<br/><br/>

<!-- TECH STACK BADGES -->
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-Gradient%20Boosting-FF6600?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Pipeline-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

<br/>

[![Dataset](https://img.shields.io/badge/📊%20Dataset-IBM%20HR%20Analytics-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset)
[![SMOTE](https://img.shields.io/badge/Imbalance-SMOTE%20Applied-22C55E?style=for-the-badge)](https://imbalanced-learn.org)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)](LICENSE)

<br/>

---

<table border="0" width="85%">
<tr>
<td align="center" width="25%" style="padding: 10px">
<br/>
<b>🎯 Task</b><br/>
Binary Classification<br/>
<code>Attrition = Yes / No</code>
</td>
<td align="center" width="25%" style="padding: 10px">
<br/>
<b>📦 Dataset</b><br/>
IBM HR Analytics<br/>
<code>1,470 employees</code>
</td>
<td align="center" width="25%" style="padding: 10px">
<br/>
<b>🔬 Models</b><br/>
LR · RF · XGBoost<br/>
<code>5-fold CV tuning</code>
</td>
<td align="center" width="25%" style="padding: 10px">
<br/>
<b>✅ Winner</b><br/>
XGBoost<br/>
<code>F1=0.7165</code>
</td>
</tr>
</table>

<br/>

> *"Employees may leave for various reasons — better salary opportunities, career growth,*  
> *improved work-life balance, job dissatisfaction, or personal reasons.*  
> *HR departments often struggle to identify employees who are at risk of leaving before they resign."*
>
> **WorkPulse fixes that** — a tuned ML pipeline trained on structured employee data:  
> demographics · job role · satisfaction · tenure · workload · compensation

<br/>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0f2027,100:2c5364&height=3&section=header" width="85%"/>

<br/>

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Structure](#-project-structure)
- [Full-Stack Architecture](#full-stack-architecture)
- [ML Pipeline Overview](#-ml-pipeline-overview)
- [Feature Engineering](#-feature-engineering)
- [Model Results](#-model-results)
- [Misclassification Analysis](#-misclassification-analysis)
- [Why XGBoost Won](#-why-xgboost-won)
- [Visualizations](#-visualizations)
- [Quickstart](#-quickstart)
- [Recent Fixes & Hardening](#recent-fixes--hardening)
- [Configuration](#️-configuration)
- [Artifacts](#-artifacts)
- [Dataset](#-dataset)
- [Ethics, Privacy & Responsible AI](#ethics-privacy--responsible-ai)

---

## 🎯 Problem Statement

Employee attrition is a major challenge for organizations. Employees may leave for various reasons, such as **better salary opportunities, career growth, improved work-life balance, job dissatisfaction, or personal reasons**. High employee turnover increases recruitment and training costs, results in the loss of experienced talent, and disrupts business operations.

As a result, HR departments often struggle to identify employees who are at risk of leaving before they resign.

This project addresses that challenge by building a **machine learning-based employee attrition prediction system**. By analyzing an employee's demographic, job-related, and workplace attributes, the model predicts whether an employee is likely to leave the organization, enabling HR teams to take proactive retention measures.

<table>
<tr>
<td width="50%">

### The Challenge
- Employees leave for **salary, career growth, work-life balance, dissatisfaction, or personal reasons**
- High turnover drives up **recruitment and training costs**
- Losing experienced talent **disrupts business operations**
- HR teams struggle to spot **at-risk employees before they resign**

</td>
<td width="50%">

### The Solution
- Binary classifier → **Attrition (Yes / No)**
- Compare **3 ML models** head-to-head
- Select winner by **F1-macro + ROC-AUC** (handles class imbalance)
- Full pipeline: EDA → Engineering → Tuning → Evaluation
- Surfaces at-risk employees so HR can act **proactively**

</td>
</tr>
</table>

---

## 📁 Project Structure

```
WorkPulse/
│
├── 📂 frontend/                         # React 18 + TypeScript + Vite dashboard
│   ├── src/
│   │   ├── api/                         # client.ts, auth.ts
│   │   ├── auth/                        # AuthProvider + protected routes
│   │   ├── components/                  # AppShell, OfflineState, UI primitives
│   │   ├── features/predict/            # FieldRenderer, RiskGauge, FactorChart, compare
│   │   ├── lib/                         # csv, history, risk, modelInputs, utils
│   │   ├── pages/                       # Predict, Batch, History, About, Login, Signup
│   │   ├── types/api.ts                 # Shared API contracts
│   │   ├── index.css                    # Glass/accent design layer
│   │   └── main.tsx
│   ├── public/examples/employee.json    # Sample used by "Load typical employee"
│   ├── package.json                     # dev / build / lint / typecheck
│   └── vite.config.ts
│
└── 📂 workpulse/                        # FastAPI service + ML pipeline
    ├── config/
    │   ├── config.yaml                  # Pipeline mode, paths, split settings, SMOTE
    │   ├── features.yaml                # Numerical, categorical, ordinal, engineered
    │   └── hyperparameters.yaml         # GridSearch / RandomSearch param grids
    │
    ├── src/
    │   ├── config_loader.py             # YAML config loader
    │   ├── preprocessing.py             # Cleaning, encoding, split
    │   ├── feature_engineering.py       # 11 custom engineered features
    │   ├── train.py                     # SMOTE + training + tuning
    │   ├── metrics.py                   # Accuracy, F1-macro, ROC-AUC, FPR, FNR
    │   ├── plots.py                     # ROC, confusion matrix, SHAP figures
    │   ├── schemas.py                   # 30-field Employee validation + /schema
    │   ├── predict.py                   # Artifact loading + top SHAP factors
    │   ├── auth.py                      # Argon2, JWT cookies, rate-limited auth
    │   ├── rate_limit.py                # Lightweight request limiter
    │   ├── database.py                  # SQLAlchemy engine (Neon SSL + pre-ping)
    │   └── settings.py                  # Env-driven config, no secret fallbacks
    │
    ├── api.py                           # /health /models /schema /predict /explain
    ├── examples/employee.json           # Canonical sample payload
    ├── notebooks/                       # EDA + training experiments
    ├── data/{raw,processed,splits}/     # IBM HR dataset and derived splits
    ├── artifacts/                       # Preprocessor, columns, 3 models + SHAP
    ├── reports/                         # summary.md, figures/, metrics/
    ├── tests/                           # 20 API + auth tests
    ├── main.py                          # CLI entrypoint
    ├── train.py                         # Artifact regeneration
    └── Readme.md
```

---

## Full-Stack Architecture

WorkPulse is a **schema-driven full-stack application**. The browser never re-implements the model; it renders forms from API metadata and sends the exact numeric records the trained artifacts expect.

```text
 React 18 + TypeScript + Vite (frontend/)
   ├─ AuthProvider       → /api/auth/me + /api/auth/refresh (httpOnly cookies)
   ├─ React Query        → /schema, /models, /health
   ├─ Predict page       → /predict, /explain, model comparison
   ├─ Batch page         → CSV parse → /predict/batch (≤ 500 rows)
   └─ History page       → browser localStorage only
                │ JSON over HTTP(S), same API contract as the tests
                ▼
 FastAPI (workpulse/api.py)
   ├─ Public:    GET /health · /models · /schema
   ├─ Protected: POST /predict · /predict/batch · /explain
   └─ Auth:      POST /api/auth/{signup,login,logout,refresh} · GET /me
                ▼
 Pydantic Employee schema (30 fields, strict ranges)
                ▼
 predict.py → preprocessor.pkl + selected model.pkl → probability/threshold
                ▼
 SHAP explainer → top 5 local factors (when ENABLE_EXPLAIN=true)

 Persistence split:
   • PostgreSQL / Neon → users + password hashes only
   • Browser localStorage → assessment history only
   • No employee profiles are written to the API database
```

| Layer | Responsibility | Key technology |
|-------|----------------|----------------|
| UI shell | Responsive dashboard, protected routes, session bootstrap | React Router, React Query, Tailwind |
| Form engine | Renders 30 schema fields with sliders, switches, dropdowns and mapped inputs | React Hook Form + Zod resolver |
| Explainability UI | Risk gauge, factor bars and side-by-side model compare | Recharts, Framer Motion |
| API | Validation, auth dependency, prediction and explanation endpoints | FastAPI, Pydantic v2 |
| Security | Password hashing, token cookies, CORS allowlist, rate limits | argon2-cffi, PyJWT, SQLAlchemy |
| ML runtime | Artifact loading, feature alignment, thresholding, SHAP | scikit-learn, XGBoost, shap |

**Important design decisions**

- `/schema` is the single source of truth: field labels, groups, UI hints, ranges and defaults drive both the single-employee form and the CSV template.
- The form keeps values in the **model domain**. The Education dropdown shows degree names but emits `1–5`; the commute input shows km but emits `DistanceFromHome` `1–29`. Batch CSV remains strictly numeric.
- Authentication is required for scoring, but metadata and health checks stay public so the UI can render a useful signed-out state.
- Predictions are advisory. The API returns a calibrated-style probability, the model threshold and optional local factors—never a final HR decision.

---

## ⚙️ ML Pipeline Overview

```
Raw CSV (IBM HR Dataset)
        │
        ▼
┌───────────────────┐
│   Preprocessing   │  → Ordinal encoding, One-Hot encoding, outlier clipping,
│                   │    stratified 80/20 train-test split (random_state=42)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Feature Engineering│  → 11 custom features derived from domain logic
│                   │    (IncomePerYear, SatisfactionScore, OverTimeRisk, ...)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│    SMOTE          │  → Synthetic Minority Oversampling on training set only
│  (Imbalance Fix)  │    (applied post-split to prevent data leakage)
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│           Model Training + Tuning             │
│  Logistic Regression  │  Random Forest  │  XGBoost  │
│  GridSearchCV (5-fold)│  RandomSearchCV │  GridSearchCV  │
│  scoring = f1_macro   │  n_iter=30      │  scoring = f1_macro │
└────────────────────────┬──────────────────────┘
                         │
                         ▼
┌───────────────────┐
│   Evaluation      │  → Accuracy, F1-macro, Precision, Recall,
│                   │    ROC-AUC, FPR, FNR, Threshold
└────────┬──────────┘
         │
         ▼
  📊 Reports + Figures + Model Selection
```

---

## 🔧 Feature Engineering

Beyond raw features, **11 domain-specific features** were engineered to improve signal quality:

| Feature | Formula / Logic | Business Meaning |
|---------|----------------|-----------------|
| `IncomePerYear` | `MonthlyIncome / (YearsAtCompany + 1)` | Compensation relative to experience |
| `SatisfactionScore` | Avg of Job, Environment, Relationship Satisfaction | Composite wellbeing signal |
| `LoyaltyIndex` | `YearsAtCompany / (NumCompaniesWorked + 1)` | Tenure stability vs job-hopping |
| `WorkloadScore` | `OverTime × JobInvolvement` | Burnout risk proxy |
| `CareerGrowthRate` | `JobLevel / (YearsAtCompany + 1)` | Promotion velocity |
| `OverTimeRisk` | Binary flag from OverTime field | Direct overtime indicator |
| `TenureStabilityIndex` | `YearsInCurrentRole / (YearsAtCompany + 1)` | Role stability |
| `OverTimeXSatisfaction` | Interaction: `OverTime × JobSatisfaction` | Captures burnout-satisfaction link |
| `StagnationRisk` | `YearsSinceLastPromotion - CareerGrowthRate` | Risk of career plateauing |
| `IncomeVsExperience` | `MonthlyIncome / (TotalWorkingYears + 1)` | Pay vs years worked ratio |
| `DistanceXOverTime` | `DistanceFromHome × OverTime` | Commute + overwork stress factor |

**Raw Feature Groups:**

- **Numerical (14):** Age, DailyRate, DistanceFromHome, HourlyRate, MonthlyIncome, MonthlyRate, NumCompaniesWorked, PercentSalaryHike, TotalWorkingYears, TrainingTimesLastYear, YearsAtCompany, YearsInCurrentRole, YearsSinceLastPromotion, YearsWithCurrManager
- **Categorical (7, One-Hot):** BusinessTravel, Department, EducationField, Gender, JobRole, MaritalStatus, OverTime
- **Ordinal (9, Mapped):** Education, EnvironmentSatisfaction, JobInvolvement, JobLevel, JobSatisfaction, PerformanceRating, RelationshipSatisfaction, StockOptionLevel, WorkLifeBalance

---

## 📊 Model Results

<div align="center">

| Model | Accuracy | F1-macro | Precision | Recall | ROC-AUC | Threshold | Verdict |
|:------|:--------:|:--------:|:---------:|:------:|:-------:|:---------:|:-------:|
| Logistic Regression | 0.8537 | 0.7153 | 0.7262 | 0.7062 | 0.801 | 0.72 | Baseline |
| Random Forest | 0.8333 | 0.7116 | 0.6991 | 0.7285 | 0.794 | 0.36 | Compare |
| **XGBoost** | **0.8503** | **0.7165** | **0.7205** | **0.7128** | **0.7963** | **0.39** | **✅ Selected** |

</div>

> **Primary Metric: F1-macro** — chosen because the dataset has class imbalance.  
> Unlike accuracy, F1-macro penalises models that ignore the minority class.  
> **ROC-AUC** was used as a tiebreaker for ranking quality across thresholds.
> **Selection Rationale:** Macro-F1 was the primary metric and ROC-AUC the tiebreaker; Logistic Regression had higher accuracy (0.8537 vs 0.8503) and ROC-AUC (0.801 vs 0.7963).  
> XGBoost was still selected for the best macro-F1 (0.7165).

---

## ⚠️ Misclassification Analysis

Understanding *where* models fail is as important as overall accuracy.

<div align="center">

| Model | FPR | FNR | Dominant Error |
|:------|:---:|:---:|:--------------|
| Logistic Regression | 0.0769 | **0.5106** | Misses at-risk employees |
| Random Forest | 0.1174 | **0.4255** | Misses at-risk employees |
| **XGBoost** | **0.0850** | **0.4894** | **Balanced FPR/FNR trade-off** |

</div>

```
FPR (False Positive Rate) = Employees who stayed predicted as Attrition
                          → Wasted retention effort on low-risk employees

FNR (False Negative Rate) = Employees who left predicted as No Attrition
                          → Missed at-risk employees — costly, unplanned turnover
```

**Business Insight:** All models struggle with FNR; Logistic Regression has the lowest FPR, Random Forest the lowest FNR, and XGBoost sits between them with the best macro-F1.

---

## 🏆 Why XGBoost Won

```
Logistic Regression  →  Linear decision boundary. Cannot capture non-linear
                         attrition patterns (e.g., interaction between OverTime +
                         low satisfaction + low income). Good baseline, not enough.

Random Forest        →  Handles feature interactions well. But sensitive to
                         depth and sampling parameters. Higher FPR (0.1174) means
                         more wasted retention interventions on low-risk employees.

XGBoost ✅           →  Gradient boosting on structured data. Handles imbalance
                         well when tuned. Best macro-F1 (0.7165), with accuracy
                         and ROC-AUC within 0.01-0.02 of Logistic Regression.
                         Custom engineered features gave it more signal to learn from.
                         The gap between models is small; XGBoost was selected
                         for non-linear interaction handling and native SHAP
                         TreeExplainer support.
```

**Hyperparameter search used GridSearchCV (5-fold, scoring=f1_macro):**

```yaml
n_estimators:     [200, 300]
learning_rate:    [0.01, 0.05]
max_depth:        [5, 6]
subsample:        [0.7, 0.8]
colsample_bytree: [0.6, 0.7]
min_child_weight: [3]
gamma:            [0, 0.1]
```

---

## 📈 Visualizations

All figures are saved to `reports/figures/`. Key plots:

<table>
<tr>
<td align="center" width="33%">

**ROC Curves**  
Per-model AUC comparison  
`figures/*_roc_curve.png`

</td>
<td align="center" width="33%">

**Confusion Matrices**  
TP/FP/TN/FN breakdown  
`figures/*_confusion_matrix.png`

</td>
<td align="center" width="33%">

**Feature Importance**  
Top predictors per model  
`figures/*_feature_importance.png`

</td>
</tr>
<tr>
<td align="center">

**Model Comparison**  
Side-by-side bar chart  
`figures/model_comparison.png`

</td>
<td align="center">

**Correlation Heatmap**  
Feature correlation matrix  
`figures/heatmap.png`

</td>
<td align="center">

**SHAP Summary**  
Feature impact on predictions  
`figures/shap_summary.png`

</td>
</tr>
</table>

---

## 🚀 Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/WorkPulse.git
cd WorkPulse/workpulse
python3 -m venv venv
venv/bin/pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL, JWT_SECRET and FRONTEND_ORIGIN
```

The API creates the `users` table on startup. Auth endpoints are available under `/api/auth` (signup, login, logout, refresh, me); prediction endpoints require a logged-in session.

Model artifacts are generated, not committed. On a fresh clone, regenerate them first:

```bash
venv/bin/python train.py
```

### 2. Add Dataset

Download the IBM HR Analytics dataset from Kaggle and place it at:

```
data/raw/WA_Fn-UseC_-HR-Employee-Attrition.csv
```

> 📎 Dataset: [IBM HR Analytics Attrition Dataset — Kaggle](https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset)

### 3. Run the Pipeline

```bash
# Full pipeline (preprocess → features → train → evaluate)
venv/bin/python main.py --stage pipeline

# Or run individual stages
venv/bin/python main.py --stage preprocess
venv/bin/python main.py --stage features
venv/bin/python main.py --stage train
```

### 4. View Results

```bash
# Model comparison
cat reports/summary.md

# Metrics CSV
cat reports/metrics/metrics.csv

# All figures
open reports/figures/
```

### 5. Run the Full Stack

```bash
# Terminal 1 — API (from workpulse/)
venv/bin/uvicorn api:app --reload --port 8000

# Terminal 2 — dashboard (from frontend/)
cd ../frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000 for local dev
npm run dev
```

Open `http://localhost:5173`, sign up, then use **Predict**, **Batch**, **History** and **About**. For a production frontend build:

```bash
npm run typecheck
npm run lint
npm run build
```

Backend verification:

```bash
venv/bin/python -m pytest -q   # 20 passed
```

---

## Recent Fixes & Hardening

The latest pass improved reliability and clarity **without changing the API contract or any `artifacts/*.pkl` file**.

### Authentication & infrastructure

- Passwords are hashed with **argon2-cffi**; plaintext passwords are never stored or logged.
- JWTs use **HS256** with typed access/refresh tokens (20-minute access, 7-day refresh) delivered as `httpOnly`, `Secure`-in-production, `SameSite=lax` cookies.
- `/api/auth/signup` and `/api/auth/login` are rate-limited to **5 requests / 60 seconds** (HTTP 429 + `Retry-After`).
- Database settings use `sslmode=require` with SQLAlchemy pre-ping; there are no hardcoded secret fallbacks.
- CORS is restricted to the documented localhost dev ports plus `FRONTEND_ORIGIN`.

### Frontend correctness

- The form is rendered from `/schema`, so ranges and defaults stay aligned with Pydantic validation.
- **Education** is now a degree dropdown (`High School` → `Doctorate`) that emits the exact IBM HR tier `1–5` and displays `Model Tier: n / 5`.
- **DistanceFromHome** accepts real-world km with presets and shows `Normalized model scale: n / 29`; a documented helper maps km into the trained `1–29` domain. Stored/POSTed values remain integers.
- Batch CSV documents and preserves raw numeric `Education 1–5` and `DistanceFromHome 1–29`; the upload cap is explicit at 500 rows.
- The Batch page no longer collapses into a generic **Service unavailable** card on a transient metadata failure: `/schema` and `/models` errors are surfaced with a working retry, and queries refetch on mount.
- User-facing pages no longer expose connection URLs, startup commands, `VITE_API_URL`, `ENABLE_EXPLAIN`, or a "Connected" status pill.

### Validation performed

| Check | Result |
|-------|--------|
| `frontend`: `npm run typecheck` | pass |
| `frontend`: `npm run lint` | pass |
| `frontend`: `npm run build` | pass (pre-existing chunk-size warning only) |
| `workpulse`: `venv/bin/python -m pytest -q` | 20 passed |

`/predict`, `/predict/batch`, `/explain`, comparison and history payloads still carry the original model-domain values.

---

## 🛠️ Configuration

All pipeline settings are controlled via YAML — no hardcoded values.

**`config/config.yaml`**
```yaml
mode: full              # full | sample
sample_size: 500        # used when mode: sample

split:
  test_size: 0.20
  random_state: 42
  stratify: true        # preserves class distribution in splits

smote:
  enabled: true         # synthetic oversampling on train only
  random_state: 42
```

**`config/features.yaml`** — define which columns are numerical, categorical, ordinal, or engineered.

**`config/hyperparameters.yaml`** — modify param grids for each model without touching source code.

---

## 📦 Artifacts

Pre-trained artifacts are saved for inference without retraining:

| Artifact | Path | Description |
|----------|------|-------------|
| Preprocessor | `artifacts/preprocessor.pkl` | Fitted scaler + encoder (apply to new data) |
| Feature columns | `artifacts/feature_columns.pkl` | Exact feature order expected by models |
| Logistic Regression | `artifacts/models/logistic_regression.pkl` | Baseline model |
| Random Forest | `artifacts/models/random_forest.pkl` | Ensemble model |
| **XGBoost** | `artifacts/models/xgboost.pkl` | **Selected production model** |
| SHAP explainers | `artifacts/models/*_shap_explainer.pkl` | Top-factor attribution for `/explain` |
| Thresholds | `artifacts/thresholds.json` | Per-model decision thresholds |

**Using the saved model for prediction:**

```python
import pickle
import pandas as pd

# Load artifacts
with open("artifacts/preprocessor.pkl", "rb") as f:
    preprocessor = pickle.load(f)

with open("artifacts/models/xgboost.pkl", "rb") as f:
    model = pickle.load(f)

with open("artifacts/feature_columns.pkl", "rb") as f:
    feature_columns = pickle.load(f)

# Predict on new data
X_new = pd.DataFrame([...])  # structured employee profile
X_processed = preprocessor.transform(X_new)[feature_columns]
prediction = model.predict(X_processed)   # 0 = Stayed, 1 = Left (Attrition)
probability = model.predict_proba(X_processed)[:, 1]
```

---

## 📂 Dataset

| Property | Value |
|----------|-------|
| Source | [IBM HR Analytics — Kaggle](https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset) |
| Target Column | `Attrition` (Yes / No → 1 / 0) |
| Total Records | 1,470 employees |
| Features | 35 raw columns |
| Class Distribution | Imbalanced (~84% No, ~16% Yes) |
| Imbalance Fix | SMOTE on training set |

---

## Ethics, Privacy & Responsible AI

WorkPulse scores attrition **risk**, not people. It is intended as decision support for retention conversations, never as an automated basis for hiring, firing, pay, promotion or discipline.

### Privacy & data handling

- Employee profiles posted to `/predict` are validated and used for inference only; they are **not persisted** by the API.
- The `users` table stores account identity and argon2 password hashes only.
- Browser history lives in `localStorage` on the user's device and can be cleared from the History page.
- Tokens are delivered in `httpOnly` cookies; frontend JavaScript never reads them. Secrets remain server-side.
- In production: use HTTPS, set `AUTH_COOKIE_SECURE=true`, rotate `JWT_SECRET`, and keep a restricted CORS allowlist.

### Fairness & limitations

- The IBM HR Analytics dataset has 1,470 rows and ~16% attrition. It is historical/synthetic and may encode biased patterns; it is not representative of every workforce.
- The schema includes sensitive attributes such as `Gender` and `MaritalStatus`. They can influence predictions, so subgroup FPR/FNR should be reviewed before operational use.
- Selected-model FNR is **0.4894**: roughly half of actual leavers are missed. Low-risk results must be treated as uncertain and human-reviewed.
- SHAP factors are local, correlational explanations of model behavior—not causal proof of why someone wants to leave.

### Responsible use checklist

- Keep a human in the loop; use scores to start supportive conversations, not punitive action.
- Never present the probability as certainty or as a standalone performance rating.
- Monitor drift and revalidate metrics on your own population before deployment.
- Minimize collected fields and define retention, consent and access policies for real employee data.
- Record model version, threshold (`0.39` for XGBoost) and explanation status in any report.

---

## 🧱 Tech Stack

<div align="center">

| Layer | Tool |
|-------|------|
| Language / API | Python 3.10+, FastAPI, Pydantic v2, Uvicorn |
| Frontend | React 18, TypeScript, Vite, Tailwind, Radix UI |
| State & forms | React Query, React Hook Form, Zod |
| Auth & storage | argon2-cffi, PyJWT, SQLAlchemy, PostgreSQL / Neon |
| ML framework | scikit-learn, XGBoost |
| Imbalance handling | imbalanced-learn (SMOTE) |
| Explainability | SHAP |
| Data | pandas, NumPy |
| Visualization | matplotlib, seaborn, Recharts |
| Config | PyYAML, python-dotenv |
| Testing | pytest, httpx, ESLint, TypeScript |
| Serialization | pickle artifacts |

</div>

---

<div align="center">

**Built by [Nithish Kumar S](https://github.com/yourusername)**  
*SECOND-year CS student · AI Engineer in progress *

<br/>

⭐ Star this repo if WorkPulse helped you learn ML pipelines!

</div>
