import MetricCard from "../components/MetricCard";
import { getWeakestAreas, WEAK_THRESHOLD_DBM } from "../utils/signal";
import { downloadCsv } from "../utils/csv";

// Average of the values that were actually measured (ignores 0 / missing).
function averageOf(measurements, key) {
  const values = measurements
    .map((m) => Number(m[key]))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (values.length === 0) return null;
  return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
}

function Reports({ measurements }) {
  const avgDownload = averageOf(measurements, "download");
  const avgUpload = averageOf(measurements, "upload");
  const weakest = getWeakestAreas(measurements, 10);

  const exportCSV = () => {
    downloadCsv(measurements, "kaaf-main-campus-wifi-report.csv");
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 95px" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a" }}>
        Management Report Data
      </h1>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
        KAAF Main Campus • {measurements.length} recorded points
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <MetricCard
          title="Avg Download"
          value={avgDownload ? `${avgDownload} Mbps` : "—"}
        />
        <MetricCard
          title="Avg Upload"
          value={avgUpload ? `${avgUpload} Mbps` : "—"}
        />
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "#0f172a" }}>
          Weakest Signal Areas
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: "11px", color: "#94a3b8" }}>
          Points weaker than {WEAK_THRESHOLD_DBM} dBm, worst first
        </p>

        {measurements.length === 0 && (
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            No readings yet. Record points from the Survey tab.
          </div>
        )}

        {measurements.length > 0 && weakest.length === 0 && (
          <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
            No weak areas found. Every recorded point is at or above{" "}
            {WEAK_THRESHOLD_DBM} dBm.
          </div>
        )}

        {weakest.map((area, index) => (
          <div
            key={area.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                index < weakest.length - 1 ? "1px solid #f1f5f9" : "none",
              fontSize: "14px",
            }}
          >
            <div>
              <div>
                <strong>#{index + 1}</strong> {area.location}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                {area.lat}, {area.lng} • {area.download} Mbps down
                {area.ping ? ` • ${area.ping} ms ping` : ""}
              </div>
              {area.notes ? (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  {area.notes}
                </div>
              ) : null}
            </div>
            <strong style={{ color: "#dc2626", whiteSpace: "nowrap" }}>
              {area.signal} dBm
            </strong>
          </div>
        ))}
      </div>

      <p style={{ margin: "0 0 12px", fontSize: "11px", color: "#94a3b8" }}>
        Indicative field measurements. Signal strength (dBm) is entered from a
        Wi-Fi analyzer; speeds are medians of several browser tests and reflect
        the full path to the internet, not the Wi-Fi radio alone.
      </p>

      <button
        type="button"
        onClick={exportCSV}
        disabled={measurements.length === 0}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "12px",
          border: "none",
          background: measurements.length === 0 ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          fontWeight: "600",
          cursor: measurements.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        Download CSV for Management Report
      </button>
    </div>
  );
}

export default Reports;