from flask import Flask, request, jsonify
import joblib
import numpy as np
import torch
from torchvision import models, transforms
import torch.nn as nn
from PIL import Image

app = Flask(__name__)

model1 = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_decision_tree_model.pkl")
model2 = joblib.load("D:/CitrusBits/pythonic-rebirth/models/indian_diabetes_decision_tree.pkl")


# model 3 is a pytorch model, and thus cannot be loaded with joblib

def load_pneumonia_model():
    # 1. Building the SAME architecture trained earlier: resnet18 base + custom final layer
    model = models.resnet18(weights=None)  # no pretrained download needed, we're loading our own weights
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)  # matches your training: nn.Linear(num_features, 2)

    # 2. Load your saved weights into that empty architecture
    state_dict = torch.load(
        "D:/CitrusBits/pythonic-rebirth/models/chest_xray_resnet18_transfer.pth",
        map_location="cpu"
    )
    model.load_state_dict(state_dict)

    # 3. Put it in evaluation mode -- disables dropout/batchnorm training behavior
    model.eval()

    return model


model3 = load_pneumonia_model()

# Image preprocessing pipeline
pneumonia_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),  # duplicate 1 channel -> 3, matches your training
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


@app.route("/")  # @app.route("/") -> this decorator is what maps a URL path to the function right below it.
# When someone visits /, Flask calls home() and sends back whatever it returns.
def home():
    return "Flask checking & running"


@app.route("/predict/medical-cost", methods=["POST"])
def predict_medical_cost():
    data = request.get_json()

    sex = 1 if data["sex"] == "male" else 0
    smoker = 1 if data["smoker"] == "yes" else 0

    region_northeast = 1 if data["region"] == "northeast" else 0
    region_northwest = 1 if data["region"] == "northwest" else 0
    region_southeast = 1 if data["region"] == "southeast" else 0
    region_southwest = 1 if data["region"] == "southwest" else 0

    features1 = np.array([[
        data["age"], sex, data["bmi"], data["children"], smoker,
        region_northeast, region_northwest, region_southeast, region_southwest
    ]])

    prediction = model1.predict(features1)

    return jsonify({"prediction_cost": float(prediction[0])})


@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes():
    data = request.get_json()

    features2 = np.array([[
        data["pregnancies"],
        data["glucose"],
        data["blood_pressure"],
        data["skin_thickness"],
        data["insulin"],
        data["bmi"],
        data["diabetes_pedigree_function"],
        data["age"]
    ]])

    prediction = model2.predict(features2)
    result = "Diabetic" if int(prediction[0]) == 1 else "Not Diabetic"

    # NEW: get confidence
    probabilities = model2.predict_proba(features2)
    confidence = probabilities[0][int(prediction[0])]

    return jsonify({
        "prediction": result,
        "prediction_raw": int(prediction[0]),
        "confidence": round(float(confidence), 4)
    })


@app.route("/predict/pneumonia", methods=["POST"])
def predict_pneumonia():
    # since this is a file and not a structured data
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use form field name 'image'."}), 400

    file = request.files["image"]

    image = Image.open(file.stream).convert("RGB")
    tensor = pneumonia_transform(image)
    tensor = tensor.unsqueeze(0)  # model expects a batch: [1, 3, 224, 224], not just [3, 224, 224]

    with torch.no_grad():  # no gradients needed, we're not training
        output = model3(tensor)
        probabilities = torch.softmax(output, dim=1)  # 2 raw scores -> 2 probabilities summing to 1
        confidence, predicted_class = torch.max(probabilities, dim=1)

    # pneumonia = 1
    label = "PNEUMONIA" if predicted_class.item() == 1 else "NORMAL"

    return jsonify({
        "prediction": label,
        "confidence": round(confidence.item(), 4)
    })


if __name__ == "__main__":
    app.run(debug=True)
