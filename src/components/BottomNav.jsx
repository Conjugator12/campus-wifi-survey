function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "survey", label: "Survey", icon: "📡" },
    { id: "map", label: "Map", icon: "🗺️" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 8px",
        zIndex: 20,
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              color: active ? "#2563eb" : "#64748b",
              fontWeight: active ? "700" : "500",
              fontSize: "12px",
            }}
          >
            <span style={{ fontSize: "16px" }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;