import Header from "../components/Header";
import MetricCard from "../components/MetricCard";

function Dashboard() {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <Header />

      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#0f172a",
        }}
      >
        Campus WiFi Survey
      </h1>

      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
        }}
      >
        <h2>Campus Coverage</h2>
        <p>82% Complete</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <MetricCard title="Avg Signal" value="-63 dBm" />
        <MetricCard title="Download Speed" value="52 Mbps" />
        <MetricCard title="Upload Speed" value="24 Mbps" />
        <MetricCard title="Points Collected" value="328" />
      </div>
    </div>
  );
}

export default Dashboard;