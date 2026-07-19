import joblib
import numpy as np
import pandas as pd

from sklearn.base import clone

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_validate
)

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    make_scorer,
    precision_score,
    recall_score
)

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


DATASET_PATH = "dataset/heart.csv"
MODEL_PATH = "model.pkl"
RANDOM_STATE = 42


features = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]


# LOAD DATASET
df = pd.read_csv(DATASET_PATH)

required_columns = features + ["target"]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        "Dataset is missing required columns: "
        + ", ".join(missing_columns)
    )


# REMOVE DUPLICATE RECORDS
initial_rows = len(df)
duplicate_rows = int(df.duplicated().sum())

df = df.drop_duplicates().reset_index(
    drop=True
)

print(
    f"Rows before duplicate removal: "
    f"{initial_rows}"
)

print(
    f"Duplicate rows removed: "
    f"{duplicate_rows}"
)

print(
    f"Rows after duplicate removal: "
    f"{len(df)}"
)


# VALIDATE TARGET VALUES
if df["target"].isna().any():
    raise ValueError(
        "Target column contains missing values."
    )

unexpected_targets = (
    set(df["target"].unique()) - {0, 1}
)

if unexpected_targets:
    raise ValueError(
        "Target column contains unsupported values: "
        f"{sorted(unexpected_targets)}"
    )


# PREPARE INPUT FEATURES
X = df[features].rename(
    columns={
        "trestbps": "bloodPressure",
        "chol": "cholesterol"
    }
)

X = X.astype("float64")

if X.isna().any().any():
    raise ValueError(
        "Input features contain missing values."
    )

if not np.isfinite(X.to_numpy()).all():
    raise ValueError(
        "Input features contain infinite or "
        "invalid numeric values."
    )


# PREPARE TARGET LABELS
y = df["target"].map({
    0: "LOW",
    1: "HIGH"
})

if y.isna().any():
    raise ValueError(
        "Unable to transform target labels."
    )


# CREATE TRAIN AND TEST SETS
X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=RANDOM_STATE,
        stratify=y
    )
)

print(
    f"\nTraining records: {len(X_train)}"
)

print(
    f"Test records: {len(X_test)}"
)

print("\nTraining class distribution:")
print(
    y_train
    .value_counts()
    .sort_index()
    .to_string()
)

print("\nTest class distribution:")
print(
    y_test
    .value_counts()
    .sort_index()
    .to_string()
)


# DEFINE CANDIDATE MODELS
models = {
    "Logistic Regression": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                solver="liblinear",
                random_state=RANDOM_STATE
            )
        )
    ]),

    "Decision Tree": DecisionTreeClassifier(
        random_state=RANDOM_STATE
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),

    "SVM": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "classifier",
            SVC(
                probability=True,
                random_state=RANDOM_STATE
            )
        )
    ])
}


# DEFINE CROSS-VALIDATION
cross_validation = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=RANDOM_STATE
)

scoring = {
    "accuracy": "accuracy",

    "precision_macro": make_scorer(
        precision_score,
        average="macro",
        zero_division=0
    ),

    "recall_macro": make_scorer(
        recall_score,
        average="macro",
        zero_division=0
    ),

    "f1_macro": make_scorer(
        f1_score,
        average="macro",
        zero_division=0
    )
}


# AUTOMATIC MODEL SELECTION
best_model_name = None
best_model = None
best_cv_metrics = None

best_selection_score = (
    float("-inf"),
    float("-inf")
)

print("\nCross-validation results:\n")

for model_name, model in models.items():
    cv_results = cross_validate(
        model,
        X_train,
        y_train,
        cv=cross_validation,
        scoring=scoring,
        error_score="raise"
    )

    mean_metrics = {
        metric: float(
            cv_results[f"test_{metric}"].mean()
        )
        for metric in scoring
    }

    standard_deviations = {
        metric: float(
            cv_results[f"test_{metric}"].std()
        )
        for metric in scoring
    }

    print(f"Model: {model_name}")

    print(
        "CV accuracy: "
        f"{mean_metrics['accuracy']:.3f} "
        "+/- "
        f"{standard_deviations['accuracy']:.3f}"
    )

    print(
        "CV macro precision: "
        f"{mean_metrics['precision_macro']:.3f} "
        "+/- "
        f"{standard_deviations['precision_macro']:.3f}"
    )

    print(
        "CV macro recall: "
        f"{mean_metrics['recall_macro']:.3f} "
        "+/- "
        f"{standard_deviations['recall_macro']:.3f}"
    )

    print(
        "CV macro F1: "
        f"{mean_metrics['f1_macro']:.3f} "
        "+/- "
        f"{standard_deviations['f1_macro']:.3f}"
    )

    print("-" * 40)

    current_selection_score = (
        mean_metrics["f1_macro"],
        mean_metrics["accuracy"]
    )

    if (
        current_selection_score
        > best_selection_score
    ):
        best_selection_score = (
            current_selection_score
        )

        best_model_name = model_name
        best_model = clone(model)
        best_cv_metrics = mean_metrics


if best_model is None:
    raise RuntimeError(
        "Unable to select a deployment model."
    )


# FINAL EVALUATION ON UNTOUCHED TEST SET
evaluation_model = clone(best_model)

evaluation_model.fit(
    X_train,
    y_train
)

test_predictions = evaluation_model.predict(
    X_test
)

test_accuracy = accuracy_score(
    y_test,
    test_predictions
)

test_macro_f1 = f1_score(
    y_test,
    test_predictions,
    average="macro",
    zero_division=0
)

print(
    f"\nSelected model: "
    f"{best_model_name}"
)

print(
    "Selection CV macro F1: "
    f"{best_cv_metrics['f1_macro']:.3f}"
)

print(
    "Selection CV accuracy: "
    f"{best_cv_metrics['accuracy']:.3f}"
)

print(
    f"\nFinal test accuracy: "
    f"{test_accuracy:.3f}"
)

print(
    f"Final test macro F1: "
    f"{test_macro_f1:.3f}"
)

print("\nFinal test classification report:\n")

print(
    classification_report(
        y_test,
        test_predictions,
        labels=["HIGH", "LOW"],
        zero_division=0
    )
)


# TRAIN DEPLOYMENT MODEL ON ALL CLEAN DATA
deployment_model = clone(best_model)

deployment_model.fit(
    X,
    y
)

if not hasattr(
    deployment_model,
    "predict_proba"
):
    raise RuntimeError(
        "Selected model does not support "
        "probability prediction."
    )

joblib.dump(
    deployment_model,
    MODEL_PATH
)

print(
    f"Deployment model: "
    f"{best_model_name}"
)

print(
    f"Deployment model trained on "
    f"{len(X)} records."
)

print(
    f"Model saved as {MODEL_PATH}"
)