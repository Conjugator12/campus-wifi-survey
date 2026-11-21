function MetricCard({ title, value, accent = "#0f172a" }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "16px",
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          margin: "0 0 6px",
          color: accent,
          fontSize: "22px",
          fontWeight: "700",
        }}
      >
        {value}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {title}
      </p>
    </div>
  );
}

export default MetricCard;