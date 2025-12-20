export type TrackerMode = 'value' | 'sum';
export type TrackerDisplay = 'sum' | 'max' | 'min' | 'average';
import { TrackerEntry } from './entry';
export interface Tracker {
  id: string;
  name: string;
  branchId: string;

  weight: number;              // 0 if no target/threshold
  mode: TrackerMode;           // value | sum
  target?: number;
  threshold?: number;

  entries: TrackerEntry[];
  displayMode: TrackerDisplay;
  status: 'active' | 'dead';
}
