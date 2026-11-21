function MetricCard({ title, value }) {
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
          marginBottom: "8px",
          color: "#0f172a",
          fontSize: "24px",
        }}
      >
        {value}
      </h3>

      <p
        style={{
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {title}
      </p>
    </div>
  );
}

export default MetricCard;