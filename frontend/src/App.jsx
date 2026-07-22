import {useState} from "react";
import CostForm from "./components/CostForm";
import DiabetesForm from "./components/DiabetesForm";
import PneumoniaForm from "./components/PneumoniaForm";
import Waveform from "./components/Waveform";
import LiveClock from "./components/LiveClock";
import AmbientTrace from "./components/AmbientTrace";

const TABS = [
    {key: "cost", label: "Cost"},
    {key: "diabetes", label: "Diabetes"},
    {key: "pneumonia", label: "X-Ray"},
];

export default function App() {
    const [activeTab, setActiveTab] = useState("cost");
    const [busy, setBusy] = useState(false);

    return (
        <div style={styles.page}>
            <AmbientTrace/>
            <div style={styles.sheet}>
                <header style={styles.header} className="stagger-1">
                    <div>
                        <h1 style={styles.title}>The Diagnostic Bench</h1>
                        <div style={styles.eyebrow}> &middot; One panel. Three diagnoses.</div>
                    </div>
                    <LiveClock/>
                </header>

                <div className="stagger-2">
                    <Waveform active={busy}/>
                </div>

                <nav style={styles.tabs} className="stagger-3">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`tab-btn${activeTab === t.key ? " active" : ""}`}
                            style={styles.tab}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                <main style={styles.panel} className="stagger-4">
                    <div key={activeTab} className="panel-content">
                        {activeTab === "cost" && <CostForm onLoadingChange={setBusy}/>}
                        {activeTab === "diabetes" && <DiabetesForm onLoadingChange={setBusy}/>}
                        {activeTab === "pneumonia" && <PneumoniaForm onLoadingChange={setBusy}/>}
                    </div>
                </main>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        justifyContent: "center",
        padding: "48px 20px",
    },
    sheet: {
        width: "100%",
        maxWidth: "620px",
        position: "relative",
        zIndex: 1,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "18px",
    },
    eyebrow: {
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.12em",
        color: "var(--muted)",
        marginBottom: "6px",
    },
    title: {
        fontFamily: "var(--font-display)",
        fontSize: "30px",
        margin: 0,
        color: "var(--ink)",
        fontWeight: 600,
    },
    stamp: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
    },
    stampRow: {
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.1em",
        color: "var(--muted)",
    },
    tabs: {
        display: "flex",
        marginTop: "6px",
    },
    tab: {
        flex: 1,
        padding: "12px 0",
        background: "transparent",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.08em",
        cursor: "pointer",
    },
    panel: {
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderTop: "none",
        padding: "32px 28px",
        boxShadow: "0 18px 40px rgba(18, 32, 59, 0.10)",
    },
};
