// Utility functions

export function normalizeData(data) {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const centered = data.map(val => val - mean);
  const stdDev = Math.sqrt(centered.reduce((acc, val) => acc + val * val, 0) / data.length);
  return centered.map(val => val / stdDev);
}

export function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}