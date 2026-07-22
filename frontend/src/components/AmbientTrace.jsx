export default function AmbientTrace() {
    const segment =
        "L 60 0 L 340 0 L 355 -14 L 370 14 L 385 0 L 620 0 L 635 -8 L 650 8 L 665 0 L 900 0";
    const path = `M 0 0 ${segment} ${segment.replace(/L (\d+)/g, (_, n) => `L ${Number(n) + 900}`)}`;

    return (
        <div className="ambient-trace" aria-hidden="true">
            <svg viewBox="0 0 1800 40" preserveAspectRatio="none" height="40">
                <path
                    d={path}
                    transform="translate(0, 20)"
                    fill="none"
                    stroke="var(--ink)"
                    strokeWidth="1"
                    opacity="0.05"
                />
            </svg>
        </div>
    );
}