from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("model.pkl")


class PatientData(BaseModel):
    age: int
    bloodPressure: int
    cholesterol: float


@app.post("/predict")
def predict(data: PatientData):
    input_data = pd.DataFrame([{
        "age": data.age,
        "bloodPressure": data.bloodPressure,
        "cholesterol": data.cholesterol
    }])

    prediction = model.predict(input_data)[0]

    return {
        "risk": prediction
    }