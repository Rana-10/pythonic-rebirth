import {useEffect, useState} from "react";

export default function LiveClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const time = now.toLocaleTimeString("en-US", {hour12: false});
    const date = now.toLocaleDateString("en-US", {year: "numeric", month: "short", day: "2-digit"});

    return (
        <div style={styles.wrap}>
            <div style={styles.time}>{time}</div>
            <div style={styles.date}>{date}</div>
        </div>
    );
}

const styles = {
    wrap: {
        textAlign: "right",
    },
    time: {
        fontFamily: "var(--font-mono)",
        fontSize: "20px",
        fontWeight: 600,
        color: "var(--ink)",
        letterSpacing: "0.04em",
    },
    date: {
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.1em",
        color: "var(--muted)",
        marginTop: "2px",
    },
};