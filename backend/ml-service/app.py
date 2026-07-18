from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("model.pkl")


class PatientData(BaseModel):
    age: int
    bloodPressure: int
    cholesterol: int
    sex: int
    cp: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int


@app.post("/predict")
def predict(data: PatientData):
    input_data = pd.DataFrame([{
        "age": data.age,
        "sex": data.sex,
        "cp": data.cp,
        "bloodPressure": data.bloodPressure,
        "cholesterol": data.cholesterol,
        "fbs": data.fbs,
        "restecg": data.restecg,
        "thalach": data.thalach,
        "exang": data.exang,
        "oldpeak": data.oldpeak,
        "slope": data.slope,
        "ca": data.ca,
        "thal": data.thal
    }])

    prediction = model.predict(input_data)[0]

    return {
        "risk": prediction
    }