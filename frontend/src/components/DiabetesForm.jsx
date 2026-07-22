import {useState} from "react";
import {predictDiabetes} from "../api";
import ResultPanel from "./ResultPanel";
import {IconCalendar, IconUser, IconActivity, IconUsers, IconFlame, IconMapPin, IconRuler} from "./Icons";


const fields = [
    {name: "pregnancies", label: "Pregnancies", icon: <IconUsers/>},
    {name: "glucose", label: "Glucose", icon: <IconActivity/>},
    {name: "blood_pressure", label: "Blood Pressure", icon: <IconFlame/>},
    {name: "skin_thickness", label: "Skin Thickness", icon: <IconRuler/>},
    {name: "insulin", label: "Insulin", icon: <IconActivity/>},
    {name: "diabetes_pedigree_function", label: "Pedigree Fn", icon: <IconUser/>},
    {name: "age", label: "Age", icon: <IconCalendar/>},
];

const initial = {...Object.fromEntries(fields.map((f) => [f.name, ""])), height: "", weight: ""};

export default function DiabetesForm({onLoadingChange}) {
    const [form, setForm] = useState(initial);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const update = (e) => setForm({...form, [e.target.name]: e.target.value});
    const bmi = form.height && form.weight
        ? (Number(form.weight) / (Number(form.height) / 100) ** 2)
        : null;

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onLoadingChange?.(true);
        setError(null);
        setResult(null);
        try {
            const res = await predictDiabetes({...form, bmi: bmi ? bmi.toFixed(1) : ""});
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
                <h2 style={styles.heading}>Diabetes Screen</h2>
                <p style={styles.sub}>Decision tree classifier &middot; Pima Indians dataset</p>
            </div>

            <form onSubmit={submit} style={styles.form}>
                <div style={styles.grid}>
                    {fields.map((f) => (
                        <label key={f.name} style={styles.field}>
                            <span style={styles.label}>{f.icon} {f.label}</span>
                            <input
                                className="field-input no-spinner"
                                type="number"
                                min="0"
                                step="any"
                                name={f.name}
                                value={form[f.name]}
                                onChange={update}
                                required
                            />
                        </label>
                    ))}
                    <label style={styles.field}>
                        <span style={styles.label}><IconRuler/> Height (cm)</span>
                        <input className="field-input no-spinner" type="number" name="height" min="0"
                               value={form.height}
                               onChange={update} placeholder="e.g. 175" required/>
                    </label>
                    <label style={styles.field}>
                        <span style={styles.label}><IconActivity/> Weight (kg)</span>
                        <input className="field-input no-spinner" type="number" name="weight" min="0"
                               value={form.weight}
                               onChange={update} placeholder="e.g. 70" required/>
                    </label>
                </div>

                <button className="primary-btn" style={styles.button} type="submit" disabled={loading}>
                    {loading ? "Screening…" : "Run Screen"}
                </button>

                {bmi && (
                    <div style={styles.bmiReadout}>
                        Calculated BMI: <strong>{bmi.toFixed(1)}</strong>
                    </div>
                )}
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
                            : result.prediction_raw === 1
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
    form: {display: "flex", flexDirection: "column", gap: "18px"},
    grid: {display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px"},
    field: {display: "flex", flexDirection: "column", gap: "5px"},
    label: {
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.08em",
        color: "var(--muted)",
        textTransform: "uppercase"
    },
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
    bmiReadout: {
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: "var(--muted)",
        textAlign: "right",
    }
};
