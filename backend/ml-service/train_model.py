import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC


data = {
    "age": [25, 35, 45, 55, 65, 70, 30, 50, 60, 40, 75, 52],
    "bloodPressure": [110, 120, 130, 145, 160, 170, 115, 140, 155, 125, 180, 150],
    "cholesterol": [4.2, 4.8, 5.3, 6.1, 6.8, 7.2, 4.5, 5.9, 6.4, 5.0, 7.5, 6.2],
    "risk": ["LOW", "LOW", "LOW", "MEDIUM", "HIGH", "HIGH", "LOW", "MEDIUM", "HIGH", "LOW", "HIGH", "MEDIUM"]
}

df = pd.DataFrame(data)

X = df[["age", "bloodPressure", "cholesterol"]]
y = df["risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "SVM": SVC()
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

joblib.dump(best_model, "model.pkl")

print(f"\nBest model: {best_model_name}")
print(f"Best accuracy: {best_accuracy:.2f}")
print("Best model saved as model.pkl")