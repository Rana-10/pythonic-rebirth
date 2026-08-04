from fastapi import FastAPI
from constants import *
from .schema import FlightRequest
import joblib
import pickle
import pandas as pd
import os
import holidays
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Flight Delay Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

clf = joblib.load(os.path.join(MODELS_DIR, "delay_classifier.pkl"))
reg = joblib.load(os.path.join(MODELS_DIR, "delay_regressor.pkl"))
with open(os.path.join(MODELS_DIR, "encoders.pkl"), 'rb') as f:
    encoders = pickle.load(f)

us_holidays = holidays.US(years=[2025, 2026, 2027])


@app.get("/")
def root():
    return {"message": "Flight Delay Prediction API is running"}


@app.get("/airports")
def list_airports():
    return {"airports": list(encoders['origin_freq'].keys())}


@app.get("/carriers")
def list_carriers():
    return {"carriers": list(encoders['carrier_freq'].keys())}


@app.get("/distance")
def get_distance(origin: str, dest: str):
    key = f"{origin.upper()}-{dest.upper()}"
    dist = encoders['route_distances'].get(key)
    return {"distance": dist, "found": dist is not None}


@app.post("/predict")
def predict(request: FlightRequest):
    fl_date = pd.to_datetime(request.fl_date)

    features = {
        'MONTH': fl_date.month,
        'DAY_OF_WEEK': fl_date.dayofweek,
        'DAY_OF_MONTH': fl_date.day,
        'IS_WEEKEND': int(fl_date.dayofweek in [5, 6]),
        'IS_HOLIDAY': int(fl_date.date() in us_holidays),
        'CRS_DEP_TIME_HOUR': request.crs_dep_hour,
        'CRS_ARR_TIME_HOUR': request.crs_arr_hour,
        'DISTANCE': request.distance,
        'ORIGIN_FREQ': encoders['origin_freq'].get(request.origin, 0),
        'DEST_FREQ': encoders['dest_freq'].get(request.dest, 0),
        'OP_UNIQUE_CARRIER_FREQ': encoders['carrier_freq'].get(request.carrier, 0),
        'ORIGIN_DELAY_MEAN': encoders['origin_delay_mean'].get(request.origin, encoders['overall_train_mean']),
        'DEST_DELAY_MEAN': encoders['dest_delay_mean'].get(request.dest, encoders['overall_train_mean']),
        'CARRIER_DELAY_MEAN': encoders['carrier_delay_mean'].get(request.carrier, encoders['overall_train_mean']),
        'temp': request.temp if request.temp is not None else 15.0,
        'rhum': request.rhum if request.rhum is not None else 50.0,
        'prcp': request.prcp if request.prcp is not None else 0.0,
        'wspd': request.wspd if request.wspd is not None else 10.0,
        'pres': request.pres if request.pres is not None else 1015.0,
        'coco': request.coco if request.coco is not None else -1,
    }

    X = pd.DataFrame([features])

    pred_class = clf.predict(X)[0]
    pred_proba = clf.predict_proba(X)[0]
    confidence = max(pred_proba)

    pred_delay_minutes = reg.predict(X)[0]

    weather_used = {
        "temp": features["temp"],
        "wspd": features["wspd"],
        "prcp": features["prcp"],
    }

    return {
        "predicted_status": pred_class,
        "confidence": round(float(confidence), 3),
        "predicted_delay_minutes": round(float(pred_delay_minutes), 1),
        "weather_used": weather_used
    }
