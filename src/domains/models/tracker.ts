export type TrackerMode = 'value' | 'sum';
export type TrackerDisplay = 'sum' | 'max' | 'min' | 'average';
import { TrackerEntry } from './entry';
export interface Tracker {
  id: number;
  name: string;
  branchId: number | null;

  weight: number;              // 0 if no target/threshold
  mode: TrackerMode;           // value | sum
  target?: number;
  threshold?: number;
  target_type: string;
  entries: TrackerEntry[];
  displayMode: TrackerDisplay;
  status: 'active' | 'dead';
}
