// Re-export domain models for app usage
export type { Branch } from '@/domains/models/branch';
export type { Task } from '@/domains/models/task';
export type { Tracker, TrackerMode, TrackerDisplay } from '@/domains/models/tracker';
export type { TrackerEntry } from '@/domains/models/entry';

export interface UserProfile {
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  maxXp: number;
}
