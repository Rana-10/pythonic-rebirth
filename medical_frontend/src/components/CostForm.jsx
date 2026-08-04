import {useState} from "react";
import {predictMedicalCost} from "../api";
import ResultPanel from "./ResultPanel";
import {IconCalendar, IconUser, IconActivity, IconUsers, IconFlame, IconMapPin, IconRuler} from "./Icons";

const initial = {age: "", sex: "male", height: "", weight: "", children: "", smoker: "no", region: "northeast"};


export default function CostForm({onLoadingChange}) {
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
            const res = await predictMedicalCost({...form, bmi: bmi ? bmi.toFixed(1) : ""});
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
                <h2 style={styles.heading}>Cost Estimate</h2>
                <p style={styles.sub}>Decision tree regression &middot; annual insurance charge</p>
            </div>

            <form onSubmit={submit} style={styles.form}>
                <div style={styles.grid}>
                    <Field label="Age" icon={<IconCalendar/>}>
                        <input className="field-input no-spinner" type="number" min="0" name="age" value={form.age}
                               onChange={update} placeholder="e.g. 34" required/>
                    </Field>
                    <Field label="Sex">
                        <select className="field-input" name="sex" value={form.sex} onChange={update}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </Field>
                    <Field label="Height (cm)" icon={<IconRuler/>}>
                        <input className="field-input no-spinner" type="number" min="0" name="height"
                               value={form.height}
                               onChange={update} placeholder="e.g. 175" required/>
                    </Field>
                    <Field label="Weight (kg)" icon={<IconActivity/>}>
                        <input className="field-input no-spinner" type="number" min="0" name="weight"
                               value={form.weight}
                               onChange={update} placeholder="e.g. 70" required/>
                    </Field><Field label="Children" icon={<IconUsers/>}>
                    <input className="field-input no-spinner" type="number" min="0" name="children"
                           value={form.children} onChange={update} placeholder="e.g. 2" required/>
                </Field>
                    <Field label="Smoker">
                        <select className="field-input" name="smoker" value={form.smoker} onChange={update}>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </Field>
                    <Field label="Region">
                        <select className="field-input" name="region" value={form.region} onChange={update}>
                            <option value="northeast">Northeast-US</option>
                            <option value="northwest">Northwest-US</option>
                            <option value="southeast">Southeast-US</option>
                            <option value="southwest">Southwest-US</option>
                        </select>
                    </Field>
                </div>

                <button className="primary-btn" style={styles.button} type="submit" disabled={loading}>
                    {loading ? "Estimating…" : "Estimate Cost"}
                </button>

                {bmi && (
                    <div style={styles.bmiReadout}>
                        Calculated BMI: <strong>{bmi.toFixed(1)}</strong>
                    </div>
                )}
            </form>

            <ResultPanel
                result={result ? {...result, prediction_cost: formatCurrency(result.prediction_cost)} : null}
                error={error}
                loading={loading}
                headlineKey="prediction_cost"
            />
        </div>
    );
}

function formatCurrency(n) {
    return new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 0}).format(n);
}

function Field({label, children}) {
    return (
        <label style={styles.field}>
            <span style={styles.label}>{label}</span>
            {children}
        </label>
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
