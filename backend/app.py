from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd

# -----------------------------
# Load model & features
# -----------------------------
try:
    model = pickle.load(open("model.pkl", "rb"))
    feature_names = pickle.load(open("features.pkl", "rb"))
except Exception as e:
    print("Error loading model or features:", e)
    raise e

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Car Price Prediction API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing; restrict later to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Input schema
# -----------------------------
class CarInput(BaseModel):
    year: int
    odometer: int
    manufacturer: str
    model: str
    fuel: str
    transmission: str

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict_price(data: CarInput):
    try:
        # Convert input to DataFrame
        df = pd.DataFrame([data.dict()])

        # Validate numeric inputs
        if not (1980 <= df.at[0, "year"] <= 2025):
            raise HTTPException(status_code=400, detail="Year must be between 1980 and 2025")
        if df.at[0, "odometer"] < 0:
            raise HTTPException(status_code=400, detail="Odometer cannot be negative")

        # Encode categorical columns
        for col in ["manufacturer", "model", "fuel", "transmission"]:
            df[col] = df[col].astype("category").cat.codes

        # Align columns with training features
        df = df.reindex(columns=feature_names, fill_value=0)

        # Predict
        prediction = model.predict(df)[0]

        return {"estimated_price": round(float(prediction), 2)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

# -----------------------------
# Run server (optional)
# -----------------------------
# Remove uvicorn.run() here if you always run via terminal
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
