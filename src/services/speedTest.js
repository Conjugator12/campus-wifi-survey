// src/services/speedTest.js
// Multi-sample network test against Cloudflare's public speed endpoints.
// Every metric is the median of several runs, which is far steadier than a
// single download. Note: this measures the whole path (Wi-Fi + campus uplink
// + internet), not the Wi-Fi radio alone.

const BASE = "https://speed.cloudflare.com";

const bust = () => `cb=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const round1 = (n) => Number(n.toFixed(1));

// Round-trip time of tiny HTTPS requests. Includes a little server time, so it
// reads slightly higher than a raw ICMP ping.
export async function measureLatency(samples = 6) {
  // Warm-up so DNS and TLS setup are not counted.
  const warm = await fetch(`${BASE}/__down?bytes=0&${bust()}`, {
    cache: "no-store",
  });
  await warm.arrayBuffer();

  const times = [];
  for (let i = 0; i < samples; i += 1) {
    const start = performance.now();
    const res = await fetch(`${BASE}/__down?bytes=0&${bust()}`, {
      cache: "no-store",
    });
    await res.arrayBuffer();
    times.push(performance.now() - start);
  }

  let jitterTotal = 0;
  for (let i = 1; i < times.length; i += 1) {
    jitterTotal += Math.abs(times[i] - times[i - 1]);
  }

  return {
    ping: Math.max(1, Math.round(median(times))),
    jitter: Math.round(jitterTotal / (times.length - 1)),
  };
}

export async function measureDownload(runs = 3, bytes = 4_000_000) {
  const speeds = [];
  for (let i = 0; i < runs; i += 1) {
    const response = await fetch(`${BASE}/__down?bytes=${bytes}&${bust()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const firstByte = performance.now();
    const blob = await response.blob();
    const seconds = Math.max((performance.now() - firstByte) / 1000, 0.01);
    speeds.push((blob.size * 8) / seconds / 1_000_000);
  }
  return round1(median(speeds));
}

export async function measureUpload(runs = 2, bytes = 2_000_000) {
  const payload = new Blob([new Uint8Array(bytes)]);
  const speeds = [];
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    const response = await fetch(`${BASE}/__up?${bust()}`, {
      method: "POST",
      body: payload,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    await response.text();
    const seconds = Math.max((performance.now() - start) / 1000, 0.01);
    speeds.push((bytes * 8) / seconds / 1_000_000);
  }
  return round1(median(speeds));
}

// Runs ping, download and upload in order. If only the upload step fails
// (for example it is blocked), upload is returned as null so the UI can ask
// for a manual value instead of failing the whole test.
export async function runFullTest(onProgress = () => {}) {
  onProgress("1/3 Measuring latency...");
  const { ping, jitter } = await measureLatency();

  onProgress("2/3 Measuring download (3 runs)...");
  const download = await measureDownload();

  onProgress("3/3 Measuring upload (2 runs)...");
  const upload = await measureUpload().catch(() => null);

  return { ping, jitter, download, upload };
}