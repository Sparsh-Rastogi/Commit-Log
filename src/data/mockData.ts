import { Branch, Task, Tracker, UserProfile } from '@/types';

export const mockUser: UserProfile = {
  username: 'devuser',
  level: 12,
  xp: 2450,
  maxXp: 3000,
};

export const mockBranches: Branch[] = [
  {
    id: 'main',
    name: 'main',
    description: 'Unassigned tasks and trackers',
    isMain: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'commit-1',
    name: 'feature/morning-routine',
    description: 'Daily morning habits and exercises',
    isMain: false,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'commit-2',
    name: 'feature/deep-work',
    description: 'Focused coding sessions',
    isMain: false,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'commit-3',
    name: 'fix/sleep-schedule',
    description: 'Improving sleep quality',
    isMain: false,
    createdAt: new Date('2024-02-10'),
  },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Review pull requests', completed: false, weight: 3, modifiers: ['priority'], branchId: 'main' },
  { id: 't2', title: 'Update documentation', completed: true, weight: 2, modifiers: [], branchId: 'main' },
  { id: 't3', title: 'Morning meditation', completed: false, weight: 1, modifiers: ['daily'], branchId: 'commit-1' },
  { id: 't4', title: 'Exercise routine', completed: true, weight: 2, modifiers: ['daily', 'streak'], branchId: 'commit-1' },
  { id: 't5', title: 'Deep work session', completed: false, weight: 5, modifiers: ['focus'], branchId: 'commit-2' },
  { id: 't6', title: 'Code review', completed: false, weight: 3, modifiers: [], branchId: 'commit-2' },
  { id: 't7', title: 'Wind down routine', completed: false, weight: 1, modifiers: ['evening'], branchId: 'commit-3' },
  { id: 't8', title: 'No screens after 10pm', completed: true, weight: 2, modifiers: ['challenge'], branchId: 'commit-3' },
];

export const mockTrackers: Tracker[] = [
  { id: 'tr1', name: 'Commits today', value: 7, displayMode: 'counter', status: 'active', branchId: 'main' },
  { id: 'tr2', name: 'Weekly streak', value: 5, displayMode: 'counter', status: 'active', branchId: 'main' },
  { id: 'tr3', name: 'Morning score', value: 85, displayMode: 'progress', status: 'active', branchId: 'commit-1' },
  { id: 'tr4', name: 'Focus time', value: 240, displayMode: 'timer', status: 'active', branchId: 'commit-2' },
  { id: 'tr5', name: 'Sleep quality', value: 72, displayMode: 'progress', status: 'active', branchId: 'commit-3' },
];

// Mock heatmap data (52 weeks x 7 days)
export const generateHeatmapData = (): number[][] => {
  const data: number[][] = [];
  for (let week = 0; week < 52; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      // Random contribution level 0-4
      weekData.push(Math.floor(Math.random() * 5));
    }
    data.push(weekData);
  }
  return data;
};
