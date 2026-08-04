import {useState} from "react";
import {predictPneumonia} from "../api";
import ResultPanel from "./ResultPanel";

export default function PneumoniaForm({onLoadingChange}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResult(null);
        setError(null);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        onLoadingChange?.(true);
        setError(null);
        setResult(null);
        try {
            const res = await predictPneumonia(file);
            setResult(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            onLoadingChange?.(false);
        }
    };

    return (
        <div>
            <div style={styles.intro}>
                <h2 style={styles.heading}>Chest X-Ray Read</h2>
                <p style={styles.sub}>ResNet18 transfer model &middot; pneumonia vs normal</p>
            </div>

            <form onSubmit={submit} style={styles.form}>
                <div style={styles.viewer}>
                    {preview ? (
                        <img src={preview} alt="chest x-ray preview" style={styles.image}/>
                    ) : (
                        <span style={styles.placeholder}>NO FILM LOADED</span>
                    )}
                </div>

                <label style={styles.fileLabel} className="file-drop">
                    <input type="file" accept="image/*" onChange={handleFile} style={styles.fileInput}/>
                    <span>{file ? file.name : "Choose X-ray image"}</span>
                </label>

                <button className="primary-btn" style={styles.button} type="submit" disabled={loading || !file}>
                    {loading ? "Analyzing…" : "Analyze Film"}
                </button>
            </form>

            <ResultPanel
                result={result}
                error={error}
                loading={loading}
                headlineKey="prediction"
                confidenceKey="confidence"
                toneLevel={
                    result
                        ? result.confidence < 0.7
                            ? "warn"
                            : result.prediction === "PNEUMONIA"
                                ? "alert"
                                : "teal"
                        : undefined
                }
            />
        </div>
    );
}

const styles = {
    intro: {marginBottom: "22px"},
    heading: {fontFamily: "var(--font-display)", fontSize: "22px", margin: 0, color: "var(--ink)"},
    sub: {fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)", marginTop: "6px"},
    form: {display: "flex", flexDirection: "column", gap: "16px"},
    viewer: {
        height: "220px",
        background: "#0d1420",
        border: "1px solid var(--line)",
        borderRadius: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    image: {width: "100%", height: "100%", objectFit: "contain"},
    placeholder: {
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.12em",
        color: "#4A5568",
    },
    fileLabel: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        border: "1px dashed var(--line)",
        borderRadius: "2px",
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        color: "var(--muted)",
        cursor: "pointer",
    },
    fileInput: {display: "none"},
    button: {
        padding: "11px",
        border: "1px solid var(--teal)",
        borderRadius: "2px",
        background: "var(--teal)",
        color: "var(--paper)",
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        letterSpacing: "0.06em",
        cursor: "pointer",
    },
};
