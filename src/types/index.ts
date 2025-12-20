export interface Branch {
  id: string;
  name: string;
  description?: string;
  isMain: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  weight: number;
  modifiers: string[];
  branchId: string;
}

export interface Tracker {
  id: string;
  name: string;
  value: number;
  displayMode: 'counter' | 'progress' | 'timer';
  status: 'active' | 'paused' | 'completed';
  branchId: string;
}

export interface UserProfile {
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  maxXp: number;
}
