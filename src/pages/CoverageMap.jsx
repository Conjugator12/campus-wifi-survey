import { useState } from "react";
import { getSignalStatus } from "../utils/signal";

// Schematic layout of the survey spots (x and y are percentages of the map box).
// The names MUST match the spot names in Survey.jsx exactly.
// Layout follows the walking distances between blocks: the Main Entrance is at the
// top, and you walk down the map towards the Pool Side. Not to scale.
const SPOTS = [
  // Entrance area
  { name: "Main Entrance", x: 22, y: 6 },
  { name: "Pharmacy Block", x: 68, y: 6 },

  // Central cluster (all very close together)
  { name: "Sefwi Block", x: 20, y: 20 },
  { name: "NLLH", x: 50, y: 20 },
  { name: "Engineering Block", x: 80, y: 20 },
  { name: "Daycare", x: 20, y: 32 },
  { name: "MLDS Lab", x: 50, y: 32 },
  { name: "Canteen", x: 80, y: 32 },

  // Old and New Admission Blocks (close to each other)
  { name: "Old Admission Block", x: 28, y: 46 },
  { name: "New Admission Block", x: 68, y: 46 },

  // Genset and Staff Room admission blocks, about 3 minutes from Sefwi Hostel
  { name: "Admission Block (Genset)", x: 17, y: 60 },
  { name: "Admission Block (Staff Room)", x: 47, y: 60 },
  { name: "Sefwi Hostel", x: 82, y: 68 },

  // Martin-Mensah is about 2 minutes from Sefwi Hostel
  { name: "Martin-Mensah Block", x: 80, y: 80 },

  // Pool Side is at the bottom, about 4 minutes from Martin-Mensah
  { name: "Pool Side", x: 45, y: 93 },
];

const FILTERS = ["All", "Excellent", "Good", "Fair", "Poor"];

const STATUS_STYLES = {
  Excellent: { bg: "#16a34a", fg: "#ffffff" },
  Good: { bg: "#facc15", fg: "#422006" },
  Fair: { bg: "#f97316", fg: "#ffffff" },
  Poor: { bg: "#ef4444", fg: "#ffffff" },
  Untested: { bg: "#334155", fg: "#cbd5e1" },
};

function CoverageMap({ measurements, selectedLocation, onSelectLocation }) {
  const [filter, setFilter] = useState("All");

  // Newest readings are first, so the first one seen for a spot is its latest.
  const latestByLocation = new Map();
  for (const m of measurements) {
    if (!latestByLocation.has(m.location)) {
      latestByLocation.set(m.location, m);
    }
  }

  const spotNames = new Set(SPOTS.map((s) => s.name));
  const otherPoints = [...latestByLocation.values()].filter(
    (m) => !spotNames.has(m.location)
  );
  const testedCount = SPOTS.filter((s) => latestByLocation.has(s.name)).length;

  const selectedStatus = selectedLocation
    ? getSignalStatus(Number(selectedLocation.signal))
    : null;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 95px" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: "22px",
          color: "#0f172a",
          textAlign: "center",
        }}
      >
        Campus Coverage Map
      </h1>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "12px",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        {testedCount} of {SPOTS.length} spots tested • schematic layout, not to scale
      </p>

      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setFilter(name)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              border: "none",
              background: filter === name ? "#2563eb" : "#e2e8f0",
              color: filter === name ? "#ffffff" : "#334155",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          height: "520px",
          background: "linear-gradient(160deg, #0f172a, #1e3a5f)",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        {SPOTS.map((spot) => {
          const reading = latestByLocation.get(spot.name);
          const status = reading
            ? getSignalStatus(Number(reading.signal))
            : "Untested";

          // Untested spots only show under "All".
          if (filter !== "All" && status !== filter) return null;

          const style = STATUS_STYLES[status];
          const isSelected = selectedLocation?.location === spot.name;

          return (
            <button
              key={spot.name}
              type="button"
              disabled={!reading}
              onClick={() => reading && onSelectLocation(reading)}
              aria-label={`${spot.name}: ${reading ? `${reading.signal} dBm` : "not tested"}`}
              style={{
                position: "absolute",
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: "translate(-50%, -50%)",
                maxWidth: "30%",
                padding: "6px 10px",
                borderRadius: "14px",
                border: isSelected ? "3px solid #ffffff" : "2px solid transparent",
                background: style.bg,
                color: style.fg,
                fontSize: "10px",
                fontWeight: "700",
                lineHeight: 1.25,
                textAlign: "center",
                cursor: reading ? "pointer" : "default",
                opacity: reading ? 1 : 0.7,
              }}
            >
              {spot.name}
              <br />
              {reading ? `${reading.signal} dBm` : "Not tested"}
            </button>
          );
        })}

        {measurements.length === 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "10px",
              textAlign: "center",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            No readings yet. Record points in the Survey tab.
          </div>
        )}
      </div>

      {otherPoints.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>
            Other recorded points (not in the spot list)
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {otherPoints.map((m) => {
              const status = getSignalStatus(Number(m.signal));
              const style = STATUS_STYLES[status];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectLocation(m)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "999px",
                    border: "none",
                    background: style.bg,
                    color: style.fg,
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {m.location} ({m.signal} dBm)
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          background: "#ffffff",
          padding: "16px 18px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        {selectedLocation ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong style={{ fontSize: "16px", color: "#0f172a" }}>
                {selectedLocation.location}
              </strong>
              <span
                style={{
                  background: STATUS_STYLES[selectedStatus].bg,
                  color: STATUS_STYLES[selectedStatus].fg,
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {selectedStatus}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
              Signal: <strong>{selectedLocation.signal} dBm</strong>
              <br />
              Download: <strong>{selectedLocation.download} Mbps</strong> • Upload:{" "}
              <strong>{selectedLocation.upload} Mbps</strong>
              <br />
              Ping: <strong>{selectedLocation.ping} ms</strong>
              {selectedLocation.jitter ? ` • Jitter: ${selectedLocation.jitter} ms` : ""}
              {selectedLocation.ssid ? (
                <>
                  <br />
                  Network: <strong>{selectedLocation.ssid}</strong>
                </>
              ) : null}
            </div>
            {selectedLocation.notes ? (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                Note: {selectedLocation.notes}
              </div>
            ) : null}
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
              {selectedLocation.date} {selectedLocation.time} • GPS{" "}
              {selectedLocation.lat}, {selectedLocation.lng} ({selectedLocation.accuracy}) •
              Collected by {selectedLocation.collectedBy}
            </div>
          </>
        ) : (
          <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center" }}>
            Tap a coloured pin to see its details.
          </div>
        )}
      </div>
    </div>
  );
}

export default CoverageMap;