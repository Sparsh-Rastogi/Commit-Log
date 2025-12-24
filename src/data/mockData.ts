import { Branch, Task, Tracker, UserProfile, TrackerEntry } from '@/types';

export const mockUser: UserProfile = {
  username: 'devuser',
  level: 12,
  xp: 2450,
};

export const mockBranches: Branch[] = [
  {
    id: 1,
    name: 'main',
    description: 'Unassigned tasks and trackers',
    is_main: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'feature/morning-routine',
    description: 'Daily morning habits and exercises',
    is_main: false,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 3,
    name: 'feature/deep-work',
    description: 'Focused coding sessions',
    is_main: false,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 4,
    name: 'fix/sleep-schedule',
    description: 'Improving sleep quality',
    is_main: false,
    createdAt: new Date('2024-02-10'),
  },
];

export const mockTasks: Task[] = [
  { id: 1, title: 'Review pull requests', completed: false, weight: 3, modifiers: ['priority'], branchId: 1, timeMode: 'none' },
  { id: 2, title: 'Update documentation', completed: true, weight: 2, modifiers: [], branchId: 1, timeMode: 'none' },
  { id: 3, title: 'Morning meditation', completed: false, weight: 1, modifiers: ['daily'], branchId: 2, timeMode: 'scheduled', scheduledDate: new Date() },
  { id: 4, title: 'Exercise routine', completed: true, weight: 2, modifiers: ['daily', 'streak'], branchId: 2, timeMode: 'recurring', recurringType: 'days', recurringDays: 1 },
  { id: 5, title: 'Deep work session', completed: false, weight: 5, modifiers: ['focus'], branchId: 3, timeMode: 'scheduled', scheduledDate: new Date(Date.now() + 86400000) },
  { id: 6, title: 'Code review', completed: false, weight: 3, modifiers: [], branchId: 3, timeMode: 'none' },
  { id: 7, title: 'Wind down routine', completed: false, weight: 1, modifiers: [], branchId: 4, timeMode: 'period', startDate: new Date(), endDate: new Date(Date.now() + 604800000) },
  { id: 8, title: 'No screens after 10pm', completed: true, weight: 2, modifiers: ['challenge'], branchId: 4, timeMode: 'recurring', recurringType: 'weekend' },
];

// Helper to generate random entries over past days
function generateEntries(count: number, maxValue: number, daysBack: number = 90): TrackerEntry[] {
  const entries: TrackerEntry[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    entries.push({
      value: Math.floor(Math.random() * maxValue) + 1,
      createdAt: date,
    });
  }
  
  return entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export const mockTrackers: Tracker[] = [
  { 
    id: 1, 
    name: 'Commits today', 
    branchId: 1,
    weight: 0, // analytics-only, no score contribution
    mode: 'sum',
    displayMode: 'sum',
    entries: generateEntries(45, 10),
    status: 'active',
  },
  { 
    id: 2, 
    name: 'Weekly streak', 
    branchId: 1,
    weight: 0, // analytics-only
    mode: 'value',
    displayMode: 'max',
    entries: generateEntries(30, 7),
    status: 'active',
  },
  { 
    id: 3, 
    name: 'Morning score', 
    branchId: 2,
    weight: 3,
    mode: 'sum',
    target: 100,
    displayMode: 'average',
    entries: generateEntries(20, 15),
    status: 'active',
  },
  { 
    id: 4, 
    name: 'Focus time', 
    branchId: 3,
    weight: 5,
    mode: 'sum',
    target: 480, // 8 hours in minutes
    displayMode: 'sum',
    entries: generateEntries(25, 60),
    status: 'active',
  },
  { 
    id: 5, 
    name: 'Sleep quality', 
    branchId: 4,
    weight: 2,
    mode: 'value',
    target: 90,
    displayMode: 'average',
    entries: generateEntries(30, 100),
    status: 'active',
  },
  {
    id: 6,
    name: 'Caffeine intake',
    branchId: 4,
    weight: 0, // analytics only
    mode: 'sum',
    threshold: 500, // mg limit - when hit, tracker dies
    displayMode: 'sum',
    entries: generateEntries(15, 100),
    status: 'active',
  },
];

// Generate heatmap data from tracker entries
export function generateHeatmapData(): number[][] {
  const data: number[][] = [];
  for (let week = 0; week < 52; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      weekData.push(Math.floor(Math.random() * 5));
    }
    data.push(weekData);
  }
  return data;
}
