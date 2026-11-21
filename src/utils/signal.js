// src/utils/signal.js

// Readings weaker than this (in dBm) are treated as "weak" in reports.
export const WEAK_THRESHOLD_DBM = -70;

export const getSignalStatus = (dbm) => {
  if (dbm >= -60) return "Excellent";
  if (dbm >= -70) return "Good";
  if (dbm >= -80) return "Fair";
  return "Poor";
};

// Returns the weakest readings (weaker than the threshold), worst first.
// Returns an empty array when nothing is weak, so the UI can hide the section.
export const getWeakestAreas = (
  readings,
  limit = 5,
  threshold = WEAK_THRESHOLD_DBM
) =>
  [...readings]
    .filter((r) => Number.isFinite(r.signal) && r.signal < threshold)
    .sort((a, b) => a.signal - b.signal)
    .slice(0, limit);