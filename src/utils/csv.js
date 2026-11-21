// src/utils/csv.js
 
const COLUMNS = [
  ["date", "date"],
  ["time", "time"],
  ["location", "location"],
  ["buildingType", "area_category"],
  ["ssid", "wifi_ssid"],
  ["signal", "signal_dbm"],
  ["status", "signal_status"],
  ["download", "download_mbps"],
  ["upload", "upload_mbps"],
  ["ping", "ping_ms"],
  ["jitter", "jitter_ms"],
  ["lat", "latitude"],
  ["lng", "longitude"],
  ["accuracy", "gps_accuracy"],
  ["notes", "notes"],
  ["collectedBy", "collected_by"],
];
 
const escapeCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
 
export const readingsToCsv = (readings) => {
  const header = COLUMNS.map(([, label]) => label).join(",");
  const rows = readings.map((reading) =>
    COLUMNS.map(([key]) => escapeCell(reading[key])).join(",")
  );
  return [header, ...rows].join("\r\n");
};
 
export const downloadCsv = (readings, filename = "kaaf-wifi-survey.csv") => {
  // The BOM makes Excel open the file as UTF-8.
  const blob = new Blob(["\uFEFF" + readingsToCsv(readings)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
 