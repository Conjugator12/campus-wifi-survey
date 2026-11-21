import Header from "../components/Header";
import MetricCard from "../components/MetricCard";
import { WEAK_THRESHOLD_DBM } from "../utils/signal";

// Number of spots in the survey list (see SPOTS in CoverageMap.jsx).
const TOTAL_SPOTS = 15;

// Average of the readable numbers for a field; null when there is nothing to average.
function averageOf(measurements, key, { skipZero = false } = {}) {
  const values = measurements
    .map((item) => Number(item[key]))
    .filter((v) => Number.isFinite(v) && (!skipZero || v > 0));
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

const formatValue = (value, unit) => (value === null ? "—" : `${value} ${unit}`);

function Dashboard({ measurements, onNavigate, onSelectLocation }) {
  const avgSignal = averageOf(measurements, "signal");
  const avgDownload = averageOf(measurements, "download", { skipZero: true });
  const avgUpload = averageOf(measurements, "upload", { skipZero: true });
  const totalPoints = measurements.length;

  // Newest readings are first, so the first one seen for a spot is its latest.
  const latestByLocation = new Map();
  for (const item of measurements) {
    if (!latestByLocation.has(item.location)) {
      latestByLocation.set(item.location, item);
    }
  }
  const areasSurveyed = latestByLocation.size;

  // Coverage = share of surveyed spots whose latest signal is Good or better.
  const goodSpots = [...latestByLocation.values()].filter(
    (item) => Number(item.signal) >= WEAK_THRESHOLD_DBM
  ).length;
  const coverage =
    areasSurveyed > 0 ? Math.round((goodSpots / areasSurveyed) * 100) : null;

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "20px 20px 90px",
      }}
    >
      <Header />

      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "12px",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Campus Coverage</h2>
          <strong>{coverage === null ? "—" : `${coverage}%`}</strong>
        </div>
        <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
          Surveyed spots with Good or better signal ({WEAK_THRESHOLD_DBM} dBm or stronger)
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.25)",
            height: "8px",
            borderRadius: "999px",
            marginTop: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${coverage ?? 0}%`,
              height: "100%",
              background: "#ffffff",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>{totalPoints}</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>Points Collected</div>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              {areasSurveyed} / {TOTAL_SPOTS}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>Areas Surveyed</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <MetricCard title="Avg Signal" value={formatValue(avgSignal, "dBm")} />
        <MetricCard title="Download Speed" value={formatValue(avgDownload, "Mbps")} />
        <MetricCard title="Upload Speed" value={formatValue(avgUpload, "Mbps")} />
        <MetricCard title="Points Collected" value={`${totalPoints}`} />
      </div>

      <button
        onClick={() => onNavigate("survey")}
        style={{
          width: "100%",
          marginTop: "18px",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
        }}
      >
        Start Survey →
      </button>

      <div style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
            Recent Measurements
          </h3>
          <button
            onClick={() => onNavigate("reports")}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            See all
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {measurements.length === 0 && (
            <div style={{ padding: "16px", fontSize: "13px", color: "#64748b" }}>
              No readings yet. Tap "Start Survey" to record your first point.
            </div>
          )}

          {measurements.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onSelectLocation(item)}
              style={{
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom:
                  idx < measurements.slice(0, 4).length - 1
                    ? "1px solid #f1f5f9"
                    : "none",
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                  {item.location}
                </div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                  {item.signal} dBm • {item.download} Mbps
                </div>
              </div>
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;