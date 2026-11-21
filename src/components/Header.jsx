function Header() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <div>
        <h2>Good Morning 👋</h2>
        <p
          style={{
            color: "#64748b",
          }}
        >
          Let's map the campus network
        </p>
      </div>

      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          background: "#2563eb",
        }}
      />
    </div>
  );
}

export default Header;