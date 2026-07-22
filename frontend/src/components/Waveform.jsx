export default function Waveform({ active }) {
  return (
    <div style={styles.wrap}>
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        style={styles.svg}
      >
        <line x1="0" y1="20" x2="1200" y2="20" stroke="var(--line)" strokeWidth="1" />
        <path
          d="M 0 20 L 500 20 L 520 6 L 540 34 L 560 20 L 1200 20"
          fill="none"
          stroke="var(--teal)"
          strokeWidth="1.5"
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: active ? 0 : 1200,
            transition: active ? "stroke-dashoffset 1.1s ease-in-out infinite alternate" : "none",
            opacity: active ? 1 : 0,
          }}
        />
      </svg>
    </div>
  );
}

const styles = {
  wrap: {
    width: "100%",
    height: "24px",
    margin: "0 0 8px 0",
  },
  svg: {
    width: "100%",
    height: "100%",
    display: "block",
  },
};
