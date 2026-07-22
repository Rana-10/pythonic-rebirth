import {useEffect, useState} from "react";

export default function ResultPanel({result, error, loading, headlineKey, confidenceKey, isPositive, toneLevel}) {
    if (loading) {
        return (
            <div style={styles.panel}>
                <span style={styles.pendingLabel}>READING</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{...styles.panel, borderColor: "var(--alert)", background: "var(--alert-dim)"}}>
                <div style={styles.errorLabel}>ERROR</div>
                <div style={styles.errorText}>{error}</div>
            </div>
        );
    }

    if (!result) return <IdlePanel/>;

    const toneMap = {alert: "var(--alert)", warn: "var(--warn)", teal: "var(--teal)"};
    const toneBgMap = {alert: "var(--alert-dim)", warn: "var(--warn-dim)", teal: "var(--teal-dim)"};
    const resolvedLevel = toneLevel || (isPositive ? "alert" : "teal");
    const tone = toneMap[resolvedLevel];
    const toneBg = toneBgMap[resolvedLevel];
    const confidence = confidenceKey ? result[confidenceKey] : null;
    const secondaryEntries = Object.entries(result).filter(
        ([k]) => k !== headlineKey && k !== confidenceKey
    );

    return (
        <div className="result-enter" style={{...styles.panel, borderColor: tone, background: toneBg}}>
            <div style={{...styles.resultLabel, color: tone}}>RESULT</div>

            {headlineKey && (
                <div className="headline-value" style={{...styles.headline, color: "var(--ink)"}}>
                    {String(result[headlineKey])}
                </div>
            )}

            {confidence !== null && confidence !== undefined && (
                <ConfidenceBar value={confidence} tone={tone}/>
            )}

            {secondaryEntries.length > 0 && (
                <div style={styles.secondary}>
                    {secondaryEntries.map(([key, value]) => (
                        <div key={key} style={styles.row}>
                            <span style={styles.rowLabel}>{key.replace(/_/g, " ")}</span>
                            <span style={styles.rowValue}>
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ConfidenceBar({value, tone}) {
    const [width, setWidth] = useState(0);
    const pct = Math.round(value * 100);

    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 40);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div style={styles.confidenceWrap}>
            <div style={styles.confidenceLabelRow}>
                <span style={styles.rowLabel}>confidence</span>
                <span style={styles.rowValue}>{pct}%</span>
            </div>
            <div className="confidence-track">
                <div className="confidence-fill" style={{width: `${width}%`, background: tone}}/>
            </div>
        </div>
    );
}

function IdlePanel() {
    return (
        <div style={styles.idle}>
            <svg viewBox="0 0 300 30" style={styles.idleSvg} className="idle-pulse">
                <line x1="0" y1="15" x2="300" y2="15" stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4"/>
            </svg>
            <span style={styles.idleText}>STANDING BY</span>
        </div>
    );
}

const styles = {
    panel: {
        marginTop: "20px",
        padding: "20px 22px",
        border: "1px solid var(--teal)",
        borderRadius: "2px",
    },
    pendingLabel: {
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.12em",
        color: "var(--muted)",
    },
    errorLabel: {
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.12em",
        color: "var(--alert)",
        marginBottom: "6px",
    },
    errorText: {
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        color: "var(--ink)",
    },
    resultLabel: {
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.12em",
        marginBottom: "10px",
    },
    headline: {
        fontSize: "32px",
        lineHeight: 1.1,
        marginBottom: "16px",
    },
    confidenceWrap: {
        marginBottom: "14px",
    },
    confidenceLabelRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
    },
    secondary: {
        paddingTop: "10px",
        borderTop: "1px solid rgba(18, 32, 59, 0.1)",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
    },
    rowLabel: {
        fontFamily: "var(--font-body)",
        fontSize: "12px",
        color: "var(--muted)",
        textTransform: "capitalize",
    },
    rowValue: {
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--ink)",
    },
    idle: {
        marginTop: "20px",
        padding: "18px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    idleSvg: {
        width: "100%",
        height: "20px",
    },
    idleText: {
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.16em",
        color: "#B8B2A0",
    }
};
