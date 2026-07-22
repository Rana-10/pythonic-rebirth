// Swap this for your ngrok URL when demoing publicly, e.g.
// "https://a1b2-c3-d4.ngrok-free.app" (no trailing slash)
export const API_BASE_URL = "http://127.0.0.1:5000";

async function postJSON(endpoint, data) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json;
}

async function postFile(endpoint, file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json;
}

export const predictMedicalCost = (data) => postJSON("/predict/medical-cost", data);
export const predictDiabetes = (data) => postJSON("/predict/diabetes", data);
export const predictPneumonia = (file) => postFile("/predict/pneumonia", file);
