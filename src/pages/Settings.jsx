import { useState } from "react";

function Settings() {
  const [autoSync, setAutoSync] = useState(true);
  const [autoGps, setAutoGps] = useState(true);

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 90px" }}>
      <h1 style={{ margin: "0 0 16px", fontSize: "22px", color: "#0f172a" }}>Settings</h1>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          padding: "16px",
        }}
      >
        <div style={{ paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontWeight: "600", color: "#0f172a" }}>User Profile</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Mintah • Default Network: Campus-WIFI</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Cloud Data Sync</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Automatically sync survey points</div>
          </div>
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "14px",
          }}
        >
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Auto GPS Capture</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Attach coordinates when recording</div>
          </div>
          <input
            type="checkbox"
            checked={autoGps}
            onChange={(e) => setAutoGps(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;