import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Survey from "./pages/Survey";
import CoverageMap from "./pages/CoverageMap";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";

const STORAGE_KEY = "kaaf_main_campus_wifi_measurements";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Starts empty on a fresh device: no demo data mixed in with real readings.
  const [measurements, setMeasurements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedLocation, setSelectedLocation] = useState(
    measurements[0] || null
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
    } catch {
      // Ignore storage quota errors
    }
  }, [measurements]);

  const handleSaveReading = (newReading) => {
    setMeasurements((prev) => [newReading, ...prev]);
    setSelectedLocation(newReading);
  };

  // Wipes every saved reading (use this once to remove old demo data).
  const handleClearData = () => {
    if (window.confirm("Delete ALL saved survey readings? This cannot be undone.")) {
      setMeasurements([]);
      setSelectedLocation(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {activeTab === "dashboard" && (
        <Dashboard
          measurements={measurements}
          onNavigate={setActiveTab}
          onSelectLocation={(loc) => {
            setSelectedLocation(loc);
            setActiveTab("map");
          }}
        />
      )}

      {activeTab === "survey" && (
        <Survey
          onSaveReading={handleSaveReading}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === "map" && (
        <CoverageMap
          measurements={measurements}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      )}

      {activeTab === "reports" && <Reports measurements={measurements} />}

      {activeTab === "settings" && <Settings onClearData={handleClearData} />}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;