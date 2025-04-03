from fastapi import FastAPI
import joblib
from pydantic import BaseModel

app = FastAPI()

# Load models
model_1 = joblib.load("model1.sav")
model_2 = joblib.load("model2.sav")

class InputData(BaseModel): 
    features: list[float]

@app.post("/predict/model1")
def predict_model1(data: InputData):
    return {"model": "model1", "prediction": model_1.predict([data.features]).tolist()}

@app.post("/predict/model2")
def predict_model2(data: InputData):
    return {"model": "model2", "prediction": model_2.predict([data.features]).tolist()}
