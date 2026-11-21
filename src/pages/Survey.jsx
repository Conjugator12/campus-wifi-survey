import { useState, useEffect, useCallback } from "react";
import { getSignalStatus } from "../utils/signal";
import { runFullTest } from "../services/speedTest";

// Survey spots on KAAF Main Campus. Categories are a first guess: edit them here.
const ROUTE_STOPS = [
  { name: "Main Entrance", category: "Outdoor / Walkway" },
  { name: "Sefwi Block", category: "Academic Facility" },
  { name: "NLLH", category: "Lecture Hall" },
  { name: "MLSD Lab", category: "Practical Laboratory" },
  { name: "Pharmacy Block", category: "Academic Facility" },
  { name: "Martin-Mensah Block", category: "Academic Facility" },
  { name: "Sefwi Hostel", category: "Hostel / Residence" },
  { name: "New Admission Block", category: "Administration" },
  { name: "Old Admission Block", category: "Administration" },
  { name: "Daycare", category: "Academic Facility" },
  { name: "Engineering Block", category: "Academic Facility" },
  { name: "Canteen", category: "Outdoor / Walkway" },
  { name: "Pool Side", category: "Outdoor / Walkway" },
  { name: "Admission Block (Genset)", category: "Administration" },
  { name: "Admission Block (Staff Room)", category: "Administration" },
];

function Survey({ onSaveReading, onNavigate }) {
  const [location, setLocation] = useState("Main Entrance");
  const [buildingType, setBuildingType] = useState("Outdoor / Walkway");
  const [notes, setNotes] = useState("");

  const [coords, setCoords] = useState({
    lat: "5.512500",
    lng: "-0.493200",
    accuracy: "Fallback",
  });
  const geoSupported =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const [gpsStatus, setGpsStatus] = useState(
    geoSupported
      ? "Acquiring GPS coordinates..."
      : "Geolocation unsupported — using Main Campus fallback"
  );

  const [signalInput, setSignalInput] = useState("");
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadInput, setUploadInput] = useState("0");
  const [pingMs, setPingMs] = useState(0);
  const [testStatus, setTestStatus] = useState("Ready to test");
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [jitterMs, setJitterMs] = useState(0);
  const [ssid, setSsid] = useState("");
  const [collector, setCollector] = useState("Mintah");
  const [showManualSpeed, setShowManualSpeed] = useState(false);
  const [formError, setFormError] = useState("");

  // Only updates state inside the geolocation callbacks (async), so it is
  // safe to call from an effect.
  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: `±${Math.round(position.coords.accuracy)}m`,
        });
        setGpsStatus(`GPS locked (±${Math.round(position.coords.accuracy)}m)`);
      },
      (err) => {
        setGpsStatus(`GPS fallback active (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestGps();
  }, [requestGps]);

  // Called from the Refresh GPS button (an event handler), so setState is fine here.
  const fetchGpsLocation = () => {
    if (!geoSupported) {
      setGpsStatus("Geolocation unsupported — using Main Campus fallback");
      return;
    }
    setGpsStatus("Acquiring GPS coordinates...");
    requestGps();
  };

  const runNetworkTest = async () => {
    setTesting(true);
    setFormError("");
    setTestStatus("Starting test...");

    try {
      const result = await runFullTest((message) => setTestStatus(message));

      setPingMs(result.ping);
      setJitterMs(result.jitter);
      setDownloadSpeed(result.download);

      if (result.upload !== null) {
        setUploadInput(String(result.upload));
        setShowManualSpeed(false);
        setTestStatus(
          `${result.download} Mbps down • ${result.upload} Mbps up • ${result.ping} ms ping (median of several runs)`
        );
      } else {
        setShowManualSpeed(true);
        setTestStatus(
          `${result.download} Mbps down • ${result.ping} ms ping. Upload test was blocked, so enter upload manually.`
        );
      }
    } catch (error) {
      setShowManualSpeed(true);
      setTestStatus(`Test failed: ${error.message}. Enter speeds manually.`);
    } finally {
      setTesting(false);
    }
  };

  const handleRecord = (e) => {
    e.preventDefault();
    setFormError("");

    const validSignal = Number(signalInput);
    if (
      signalInput.trim() === "" ||
      !Number.isFinite(validSignal) ||
      validSignal > -10 ||
      validSignal < -110
    ) {
      setFormError(
        "Enter a signal strength between -110 and -10 dBm (read it from a Wi-Fi analyzer app)."
      );
      return;
    }

    const validDownload = Number(downloadSpeed);
    if (!Number.isFinite(validDownload) || validDownload <= 0) {
      setFormError("No download speed yet. Run the network test or enter it manually.");
      return;
    }

    const validUpload = Number.isFinite(Number(uploadInput))
      ? Number(uploadInput)
      : 0;

    const now = new Date();
    const newReading = {
      id: Date.now(),
      location: location.trim() || "Unlabeled Spot",
      buildingType,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      signal: validSignal,
      status: getSignalStatus(validSignal),
      ssid: ssid.trim(),
      gpsFixed: coords.accuracy !== "Fallback",
      download: validDownload,
      upload: validUpload,
      ping: Number(pingMs) || 0,
      jitter: Number(jitterMs) || 0,
      source: "Browser multi-sample test (median) + manual signal",
      notes: notes.trim(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      collectedBy: collector.trim() || "Unknown",
    };

    onSaveReading(newReading);
    setSaved(true);
  };

  if (saved) {
    const summarySignal = Number(signalInput) || -75;
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "24px 20px 95px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#dcfce7",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 12px",
          }}
        >
          ✓
        </div>
        <h2 style={{ margin: 0, color: "#0f172a" }}>Survey Point Recorded</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
          <strong>{location}</strong> • {summarySignal} dBm (
          {getSignalStatus(summarySignal)}) • {downloadSpeed} Mbps down
        </p>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
          GPS: {coords.lat}, {coords.lng} ({coords.accuracy})
        </p>

        <button
          type="button"
          onClick={() => {
            setNotes("");
            setSignalInput("");
            setDownloadSpeed(0);
            setUploadInput("0");
            setPingMs(0);
            setJitterMs(0);
            setShowManualSpeed(false);
            setFormError("");
            setTestStatus("Ready to test");
            setSaved(false);
          }}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Record Next Stop →
        </button>

        <button
          type="button"
          onClick={() => onNavigate("reports")}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "13px",
            borderRadius: "12px",
            border: "1px solid #2563eb",
            background: "#ffffff",
            color: "#2563eb",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Go to Management Report
        </button>
      </div>
    );
  }

  const numericSignal = Number(signalInput) || -75;

  return (
    <form
      onSubmit={handleRecord}
      style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 95px" }}
    >
      <h1 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a" }}>
        KAAF Main Campus Survey
      </h1>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
        Pick a spot below, then record its reading ({ROUTE_STOPS.length} spots)
      </p>

      {/* Location & GPS Card */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <label
            htmlFor="spot-name"
            style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}
          >
            Quick Route Stops
          </label>
          <button
            type="button"
            onClick={fetchGpsLocation}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Refresh GPS
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {ROUTE_STOPS.map((stop) => (
            <button
              key={stop.name}
              type="button"
              onClick={() => {
                setLocation(stop.name);
                setBuildingType(stop.category);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid #cbd5e1",
                background: location === stop.name ? "#2563eb" : "#f8fafc",
                color: location === stop.name ? "#ffffff" : "#334155",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {stop.name}
            </button>
          ))}
        </div>

        <label
          htmlFor="spot-name"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Location Name
        </label>
        <input
          id="spot-name"
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Pool Side"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            fontWeight: "600",
            boxSizing: "border-box",
            marginBottom: "10px",
          }}
        />

        <label
          htmlFor="building-type"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Area Category
        </label>
        <select
          id="building-type"
          value={buildingType}
          onChange={(e) => setBuildingType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "13px",
            background: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <option value="Outdoor / Walkway">Outdoor / Walkway</option>
          <option value="Academic Facility">Academic Facility</option>
          <option value="Lecture Hall">Lecture Hall</option>
          <option value="Computer Laboratory">Computer Laboratory</option>
          <option value="Practical Laboratory">Practical Laboratory</option>
          <option value="Library">Library</option>
          <option value="Administration">Administration</option>
          <option value="Hostel / Residence">Hostel / Residence</option>
        </select>

        <label
          htmlFor="wifi-ssid"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            display: "block",
            margin: "10px 0 6px",
          }}
        >
          Wi-Fi Network (SSID)
        </label>
        <input
          id="wifi-ssid"
          type="text"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          placeholder="Network name the phone is connected to"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />

        <label
          htmlFor="collector"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            display: "block",
            margin: "10px 0 6px",
          }}
        >
          Collected By
        </label>
        <input
          id="collector"
          type="text"
          value={collector}
          onChange={(e) => setCollector(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ fontSize: "12px", color: "#334155", marginTop: "10px" }}>
          GPS:{" "}
          <strong>
            {coords.lat}, {coords.lng}
          </strong>{" "}
          ({coords.accuracy})
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
          {gpsStatus}
        </div>
      </div>

      {/* Signal & Throughput Card */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
            Signal & Throughput
          </span>
          <span
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {getSignalStatus(numericSignal)}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label
              htmlFor="signal-dbm"
              style={{
                fontSize: "11px",
                color: "#64748b",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Signal Strength (dBm)
            </label>
            <input
              id="signal-dbm"
              type="number"
              required
              placeholder="e.g. -65"
              min="-110"
              max="-10"
              value={signalInput}
              onChange={(e) => setSignalInput(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "700",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="upload-mbps"
              style={{
                fontSize: "11px",
                color: "#64748b",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Upload Speed (Mbps)
            </label>
            <input
              id="upload-mbps"
              type="number"
              step="0.1"
              min="0"
              value={uploadInput}
              onChange={(e) => setUploadInput(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "700",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              background: "#eff6ff",
              padding: "10px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "700", fontSize: "16px", color: "#1d4ed8" }}>
              {downloadSpeed} Mbps
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Download (Measured)
            </div>
          </div>
          <div
            style={{
              background: "#f1f5f9",
              padding: "10px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>
              {pingMs} ms
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Ping • jitter {jitterMs} ms
            </div>
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
          {testStatus}
        </div>

        {showManualSpeed && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div>
              <label
                htmlFor="manual-download"
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Download (Mbps)
              </label>
              <input
                id="manual-download"
                type="number"
                step="0.1"
                min="0"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "700",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="manual-ping"
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Ping (ms)
              </label>
              <input
                id="manual-ping"
                type="number"
                min="0"
                value={pingMs}
                onChange={(e) => setPingMs(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: "700",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={runNetworkTest}
          disabled={testing}
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "12px",
            border: "1px solid #2563eb",
            background: "#ffffff",
            color: "#2563eb",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {testing ? "Testing, please wait..." : "Run Network Test (uses ~15 MB)"}
        </button>
      </div>

      {/* Field Notes */}
      <div
        style={{
          background: "#ffffff",
          padding: "14px 16px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: "16px",
        }}
      >
        <label
          htmlFor="field-notes"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#475569",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Observation Notes (for Management Report)
        </label>
        <input
          id="field-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Signal drops near pool perimeter"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {formError && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "10px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={testing}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Record Reading
      </button>
    </form>
  );
}

export default Survey;