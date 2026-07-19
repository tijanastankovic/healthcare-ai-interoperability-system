import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("dataset/heart.csv")

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

X = df[features].rename(columns={
    "trestbps": "bloodPressure",
    "chol": "cholesterol"
})

y = df["target"].map({
    0: "LOW",
    1: "HIGH"
})

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

models = {
    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=2000))
    ]),

    "Decision Tree": DecisionTreeClassifier(
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=42
    ),

    "SVM": Pipeline([
        ("scaler", StandardScaler()),
        (
            "classifier",
            SVC(probability=True, random_state=42)
        )
    ])
}

best_model_name = None
best_model = None
best_accuracy = 0

print("\nModel evaluation results:\n")

for model_name, model in models.items():
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"Model: {model_name}")
    print(f"Accuracy: {accuracy:.2f}")
    print(classification_report(y_test, predictions, zero_division=0))
    print("-" * 40)

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model_name = model_name
        best_model = model

selected_model_name = "Logistic Regression"
selected_model = models[selected_model_name]

selected_model.fit(X, y)

joblib.dump(selected_model, "model.pkl")

print(f"\nHighest test accuracy: {best_model_name}")
print(f"Highest accuracy: {best_accuracy:.2f}")
print(f"Selected deployment model: {selected_model_name}")
print("Selected model saved as model.pkl")