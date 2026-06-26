<div align="center">

# 🧠 TalentIQ
### ML-Powered Resume Screening Pipeline

**Binary Classification · 200,000 Candidates · 3 Models · SHAP Explainability**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-Latest-189AB4?style=flat-square)
![Status](https://img.shields.io/badge/Phase-2%20Complete-22C55E?style=flat-square)

</div>

---

## The Problem

Companies receive thousands of resumes per job posting. Reviewing them manually is **slow, inconsistent, and expensive** — a recruiter spends 6–10 seconds per resume and still misses great candidates or wastes time on wrong ones.

## The Solution

TalentIQ is a machine learning pipeline that reads candidate resume data — CGPA, skills, experience, projects, certifications — and predicts whether a candidate should be hired. It gives recruiters a ranked shortlist instead of a pile of 10,000 PDFs.

**Output:** `1 = Hire` · `0 = Reject` — with confidence scores and explainability via SHAP.

---

## Project Structure

```
talentiq/
├── config/
│   ├── config.yaml            # mode (sample/full), paths, split settings
│   ├── features.yaml          # column definitions, encoding maps
│   └── hyperparameters.yaml   # search spaces for all 3 models
│
├── data/
│   ├── raw/                   # original resume_dataset.csv (200K rows)
│   ├── processed/             # cleaned.csv after preprocessing
│   └── splits/                # train.csv and test.csv
│
├── src/
│   ├── config_loader.py       # YAML loaders + mode-aware load_data()
│   ├── preprocessing.py       # clean → encode → split → scale
│   ├── feature_engineering.py # 7 engineered features
│   ├── train.py               # 3 models + hyperparameter tuning
│   ├── metrics.py             # evaluation + misclassification analysis
│   └── plots.py               # SHAP, ROC, confusion matrix, importances
│
├── notebooks/
│   └── 01_eda.ipynb           # full EDA with problem/solution explanations
│
├── artifacts/
│   ├── scaler.pkl
│   ├── encoder.pkl
│   ├── feature_columns.pkl
│   └── models/
│       ├── logistic_regression.pkl
│       ├── random_forest.pkl
│       └── xgboost.pkl
│
├── reports/
│   ├── figures/               # all plots saved here
│   ├── metrics/               # per-model metric JSONs
│   └── summary.md             # final model comparison table
│
├── inference.py               # predict on a single candidate JSON
├── main.py                    # pipeline entry point
└── requirements.txt
```

---

## Phase Breakdown

###  Phase 1 — Setup
Project skeleton, virtual environment, config structure, folder layout, dataset placed in `data/raw/`.

---

### Phase 2 — EDA · Preprocessing · Feature Engineering

#### Problem 1 — We don't understand the data yet
Before building any model, we need to know what we're working with. Are the classes balanced? Are there missing values? Which features actually predict hiring?

**Solution:** Full EDA in `notebooks/01_eda.ipynb` covering class distribution, missing value heatmap, outlier detection, correlation analysis, feature vs class boxplots, and categorical hire rates. Every finding maps to a concrete fix in preprocessing.

---

#### Problem 2 — Running 200K rows every time is slow during development
Testing code, tweaking features, and debugging plots on 200,000 rows wastes time during development. But we need to train on the full data eventually.

**Solution:** A **mode system** in `config/config.yaml`.

```yaml
mode: "sample"   # loads 5,000 rows → fast testing, safe to push
mode: "full"     # loads all 200K rows → real training
```

`src/config_loader.py → load_data()` reads this and loads accordingly. One word change switches the entire pipeline.

---

#### Problem 3 — Raw data has missing values, outliers, and text columns
ML models can't handle missing values (they crash), extreme outliers (they distort learning), or text categories (they need to be numbers).

**Solution:** Step-by-step manual preprocessing in `src/preprocessing.py` — no sklearn Pipeline used, every step is explicit:

| Step | What it does | Why |
|---|---|---|
| Drop duplicates | Remove identical rows | Prevents model from memorising repeated data |
| Impute missing | Median for numerical, mode for categorical | Median is outlier-resistant; mode preserves most common category |
| Cap outliers (IQR) | Clip values beyond Q1−1.5×IQR and Q3+1.5×IQR | Removes extremes without deleting rows |
| Ordinal encode | EducationLevel, UniversityTier → integers | Preserves natural order (PhD > Master > Bachelor) |
| One-hot encode | CompanyType, ProgrammingLanguages → binary columns | No order exists, so no number ranking |
| Split 80/20 | Stratified train/test split | Keeps class ratio equal in both sets |
| Scale (StandardScaler) | Fit on train only, transform both | **Prevents data leakage** — test data must stay unseen |

>  **Critical rule:** The scaler is fitted on the training set only. Fitting on the full dataset before splitting leaks test information into training — your model would appear better than it actually is.

---

#### Problem 4 — Raw features alone may not be expressive enough
Individual columns like CGPA or SkillsScore are useful, but a model learns better from **combinations** that represent higher-level candidate qualities.

**Solution:** 7 engineered features in `src/feature_engineering.py`:

| Feature | Formula | Captures |
|---|---|---|
| `EmployabilityScore` | 0.3×CGPA + 0.4×SkillsScore + 0.3×SoftSkillsScore | Overall job-readiness |
| `PortfolioStrength` | Projects×0.5 + Hackathons×0.3 + ResearchPapers×0.2 | Evidence of applied work |
| `TechnicalReadiness` | Languages×0.4 + Certifications×0.3 + SkillsScore×0.3 | Depth of technical preparation |
| `ExperienceQuality` | (YearsExp×0.6 + Internships×0.4) — normalized | Practical exposure, scaled fairly |
| `LearningIndex` | Certifications + ResearchPapers + Hackathons | Continuous learning habits |
| `ProfileCompleteness` ★ | % of non-null, non-zero fields per row | How seriously a candidate filled their profile |
| `SkillExperienceGap` ★ | abs(SkillsScore − YearsExp×10) | Mismatch between skills and real-world exposure |

★ = newly added features

---

###  Phase 3 — Model Training · Hyperparameter Tuning 

Three models trained with cross-validated hyperparameter search:

| Model | Search | CV | Primary Metric |
|---|---|---|---|
| Logistic Regression | GridSearchCV | 5-fold | F1-macro |
| Random Forest | RandomizedSearchCV (n=30) | 5-fold | F1-macro |
| XGBoost | RandomizedSearchCV (n=30) | 5-fold | F1-macro |

SMOTE applied on training set only (after split) to handle class imbalance. All search spaces loaded from `config/hyperparameters.yaml` — nothing hardcoded in `train.py`.

---

###  Phase 4 — Evaluation · SHAP · Report 

| Deliverable | File |
|---|---|
| Accuracy, F1-macro, ROC-AUC per model | `src/metrics.py` |
| FPR / FNR misclassification analysis | `src/metrics.py` |
| SHAP values (XGBoost) | `src/plots.py` |
| Feature importance (RF) | `src/plots.py` |
| Coefficient magnitudes (LR) | `src/plots.py` |
| ROC curves — all 3 models | `src/plots.py` |
| Final comparison + winner justification | `reports/summary.md` |

---

## Running the Pipeline

```bash
# 1. Clone and set up
git clone https://github.com/yourname/talentiq.git
cd talentiq
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Place dataset
# Copy resume_dataset.csv → data/raw/resume_dataset.csv

# 3. Set mode in config/config.yaml
#    mode: "sample"  →  fast test run
#    mode: "full"    →  real training

# 4. Run pipeline stages
python main.py --stage preprocess
python main.py --stage features
python main.py --stage train
python main.py --stage evaluate

# 5. Predict on a single candidate
python inference.py --model xgboost --input candidate.json
```

---

## Key Design Decisions

**No sklearn Pipeline** — every preprocessing step is written out explicitly. This makes it easier to understand what's happening at each stage, easier to debug, and easier to explain in a report.

**Mode-aware loading** — switching between 5K and 200K rows requires changing one word in a YAML file. No code changes needed.

**Config-driven** — column definitions, encoding maps, hyperparameter search spaces, and file paths all live in `config/`. Nothing is hardcoded in source files.

**Leakage prevention** — scaler is fitted on training data only. SMOTE is applied on training data only. Test set is never touched until final evaluation.

---

## EDA Notebook

`notebooks/01_eda.ipynb` walks through every analysis step with plain-English explanations:
- What problem each step is solving
- What the plots are actually telling us
- Which file implements the fix

Run it after placing the dataset. All plots auto-save to `reports/figures/`.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| pandas, numpy | Data manipulation |
| scikit-learn | Preprocessing, models, metrics |
| XGBoost | Gradient boosting classifier |
| imbalanced-learn | SMOTE for class imbalance |
| SHAP | Model explainability |
| matplotlib, seaborn | Visualisation |
| joblib | Model serialisation |
| PyYAML | Config loading |

---

<div align="center">

**TalentIQ** · Binary Classification Pipeline · 

*Built for Task 2 — Classification Pipeline*

</div>
