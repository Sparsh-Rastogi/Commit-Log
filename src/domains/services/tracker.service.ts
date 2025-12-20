import { Tracker} from '../models/tracker';
import { TrackerEntry } from '../models/entry';

export function pushEntry(tracker: Tracker, value: number): Tracker {
  if (tracker.status === 'dead') return tracker;

  const entry: TrackerEntry = { value, createdAt: new Date() };

  const entries = [...tracker.entries, entry];

  // Threshold logic
  if (tracker.threshold !== undefined) {
    const total = entries.reduce((a, e) => a + e.value, 0);
    if (total >= tracker.threshold) {
      return { ...tracker, entries, status: 'dead', weight: 0 };
    }
  }

  return { ...tracker, entries };
}
export function trackerScore(tracker: Tracker): number {
  if (!tracker.target || tracker.weight === 0) return 0;

  const total =
    tracker.mode === 'sum'
      ? tracker.entries.reduce((a, e) => a + e.value, 0)
      : tracker.entries.at(-1)?.value ?? 0;

  const ratio = Math.min(total / tracker.target, 1);
  return ratio * tracker.weight;
}
