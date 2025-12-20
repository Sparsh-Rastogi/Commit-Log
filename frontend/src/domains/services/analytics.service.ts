import { Tracker } from '../models/tracker';

export function trackerAnalytics(
  tracker: Tracker,
  days?: number
) {
  let entries = tracker.entries;

  if (days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    entries = entries.filter(e => e.createdAt.getTime() >= cutoff);
  }

  if (!entries.length) return null;

  const values = entries.map(e => e.value);

  return {
    sum: values.reduce((a, b) => a + b, 0),
    max: Math.max(...values),
    min: Math.min(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length,
  };
}
export function trackerHeatmap(tracker: Tracker): Map<string, number> {
  const map = new Map<string, number>();

  tracker.entries.forEach(e => {
    const key = e.createdAt.toISOString().split('T')[0];
    map.set(key, (map.get(key) ?? 0) + e.value);
  });

  return map;
}
