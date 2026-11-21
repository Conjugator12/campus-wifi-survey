function Header({ title = "Good morning, Mintah 👋", subtitle = "Let's map a better connected campus." }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>{title}</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
          {subtitle}
        </p>
      </div>

      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        M
      </div>
    </div>
  );
}

export default Header;