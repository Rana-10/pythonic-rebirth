# Project Flask Backend, Ngrok Deployment & React Interface

A full-stack medical AI demo: three trained models (medical cost regression,
diabetes classification, pneumonia X-ray classification) served through a
Flask REST API, tunneled publicly with ngrok, and consumed by a React frontend.

## Project Structure

```
pythonic-rebirth/
├── notebooks/
│   └── 008_Flask_ngrok_react/
│       ├── inspect_model.py       # one-off script used to inspect saved model
│       │                          # files (feature names/order) during development
│       └── backend/
│           ├── app.py             # Flask app — all API routes live here
│           └── models/            # trained model files (see "Models" below)
└── frontend/                      # React app (Vite)
    └── src/
        ├── App.jsx
        ├── api.js                 # Flask API base URL + request helpers
        └── components/
```

## Models

Model files are not committed to the repo, download them from Google Drive
and place them in `backend/models/`, and then set the paths accordingly:

**[Google Drive Link - https://drive.google.com/drive/folders/1FAXXnZX2AYTDXUlqxEK0AGTkEubFfiLg?usp=sharing]**

Required files:
- `insurance_decision_tree_model.pkl`
- `insurance_scaler.pkl` 
- `indian_diabetes_decision_tree.pkl`
- `chest_xray_resnet18_transfer.pth`

## Running the Backend

```bash
cd notebooks/008_Flask_ngrok_react/backend
poetry install
poetry run python app.py
```

Runs on `http://127.0.0.1:5000`. Confirm it's working by visiting that URL —
you should see `"Flask running"`.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Confirm `src/api.js` → `API_BASE_URL` points
at your Flask server (`http://127.0.0.1:5000` for local dev).

## Using Ngrok

1. Install ngrok and authenticate once: `ngrok config add-authtoken YOUR_TOKEN`
2. With Flask running, in a separate terminal: `ngrok http 5000`
3. Copy the `https://....ngrok-free.app` URL it gives you
4. Update `API_BASE_URL` in `frontend/src/api.js` to that URL

## API Reference

### `GET /`
Health check. Returns `"Flask running"`.

### `POST /predict/medical-cost`
Decision tree regression: Estimates annual insurance charges.

Request body:
```json
{
  "age": 34,
  "sex": "male",
  "bmi": 27.5,
  "children": 2,
  "smoker": "no",
  "region": "northeast"
}
```

Response:
```json
{ "prediction_cost": 8945.32 }
```

### `POST /predict/diabetes`
Decision tree classification: Pima Indians Diabetes dataset.

Request body:
```json
{
  "pregnancies": 2,
  "glucose": 130,
  "blood_pressure": 70,
  "skin_thickness": 25,
  "insulin": 80,
  "bmi": 28.5,
  "diabetes_pedigree_function": 0.45,
  "age": 33
}
```

Response:
```json
{
  "prediction": "Diabetic",
  "prediction_raw": 1,
  "confidence": 0.8393
}
```

### `POST /predict/pneumonia`
ResNet18 transfer-learning CNN: Chest X-ray classification.

Request: `multipart/form-data`, field name `image` (file upload).

Response:
```json
{
  "prediction": "PNEUMONIA",
  "confidence": 0.94
}
```

## Known Limitations

**Diabetes model is unreliable for patients over ~62.** The trained Decision
Tree (`max_depth=4`) has a terminal branch, `Age > 62.5 → class: 0 (Not
Diabetic)` that ignores all other features once a patient exceeds age 62.5.
This is a training data artifact, not a modeling error: the Pima Indians
Diabetes dataset contains very few patients in this age range, so the tree
never saw enough examples to learn a meaningful split there. Predictions for
patients over ~62 should not be trusted regardless of glucose, BMI, or other
risk factors.

## Troubleshooting

- **CORS error in browser console**. Confirm `flask-cors` is installed and
  `CORS(app)` is present in `app.py`.
- **`NetworkError when attempting to fetch resource`** means Flask isn't running,
  or CORS isn't applied. Visit `http://127.0.0.1:5000/` directly to confirm
  the server is reachable.
- **`_pickle.UnpicklingError: STACK_GLOBAL requires str`** means the file was
  saved with `joblib.dump()`, not `pickle.dump()`. Load it with `joblib.load()`
  instead.
