import { create } from 'zustand';
import { Tracker, TrackerMode, TrackerDisplay } from '@/domains/models/tracker';
import { TrackerEntry } from '@/domains/models/entry';
import { pushEntry as pushTrackerEntry } from '@/domains/services/tracker.service';

interface TrackerState {
  trackers: Tracker[];
  isLoading: boolean;
  selectedTracker: Tracker | null;
  
  // Actions
  fetchTrackers: () => Promise<void>;
  createTracker: (data: {
    name: string;
    branchId: string;
    mode: TrackerMode;
    displayMode: TrackerDisplay;
    weight: number;
    target?: number;
    threshold?: number;
  }) => Promise<Tracker>;
  updateTracker: (trackerId: string, updates: Partial<Tracker>) => Promise<void>;
  deleteTracker: (trackerId: string) => Promise<void>;
  pushEntry: (trackerId: string, value: number) => void;
  setSelectedTracker: (tracker: Tracker | null) => void;
  setTrackers: (trackers: Tracker[]) => void;
  
  // Selectors
  getTrackersByBranch: (branchId: string) => Tracker[];
}

// Helper to generate random entries
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

// TODO: Replace with real API calls
const mockTrackers: Tracker[] = [
  { 
    id: 'tr1', 
    name: 'Commits today', 
    branchId: 'main',
    weight: 0,
    mode: 'sum',
    displayMode: 'sum',
    entries: generateEntries(45, 10),
    status: 'active',
  },
  { 
    id: 'tr2', 
    name: 'Weekly streak', 
    branchId: 'main',
    weight: 0,
    mode: 'value',
    displayMode: 'max',
    entries: generateEntries(30, 7),
    status: 'active',
  },
  { 
    id: 'tr3', 
    name: 'Morning score', 
    branchId: 'commit-1',
    weight: 3,
    mode: 'sum',
    target: 100,
    displayMode: 'average',
    entries: generateEntries(20, 15),
    status: 'active',
  },
  { 
    id: 'tr4', 
    name: 'Focus time', 
    branchId: 'commit-2',
    weight: 5,
    mode: 'sum',
    target: 480,
    displayMode: 'sum',
    entries: generateEntries(25, 60),
    status: 'active',
  },
  { 
    id: 'tr5', 
    name: 'Sleep quality', 
    branchId: 'commit-3',
    weight: 2,
    mode: 'value',
    target: 90,
    displayMode: 'average',
    entries: generateEntries(30, 100),
    status: 'active',
  },
  {
    id: 'tr6',
    name: 'Caffeine intake',
    branchId: 'commit-3',
    weight: 0,
    mode: 'sum',
    threshold: 500,
    displayMode: 'sum',
    entries: generateEntries(15, 100),
    status: 'active',
  },
];

export const useTrackerStore = create<TrackerState>((set, get) => ({
  trackers: [],
  isLoading: false,
  selectedTracker: null,

  fetchTrackers: async () => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ trackers: mockTrackers, isLoading: false });
  },

  createTracker: async (data) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTracker: Tracker = {
      id: `tracker-${Date.now()}`,
      name: data.name,
      branchId: data.branchId,
      weight: data.target ? data.weight : 0,
      mode: data.mode,
      displayMode: data.displayMode,
      target: data.target,
      threshold: data.threshold,
      entries: [],
      status: 'active',
    };
    set(state => ({ trackers: [...state.trackers, newTracker] }));
    return newTracker;
  },

  updateTracker: async (trackerId, updates) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      trackers: state.trackers.map(tracker =>
        tracker.id === trackerId ? { ...tracker, ...updates } : tracker
      ),
    }));
  },

  deleteTracker: async (trackerId) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      trackers: state.trackers.filter(tracker => tracker.id !== trackerId),
      selectedTracker: state.selectedTracker?.id === trackerId ? null : state.selectedTracker,
    }));
  },

  pushEntry: (trackerId, value) => {
    set(state => {
      const updatedTrackers = state.trackers.map(tracker =>
        tracker.id === trackerId ? pushTrackerEntry(tracker, value) : tracker
      );
      const updatedTracker = updatedTrackers.find(t => t.id === trackerId);
      return {
        trackers: updatedTrackers,
        selectedTracker: state.selectedTracker?.id === trackerId ? updatedTracker ?? null : state.selectedTracker,
      };
    });
  },

  setSelectedTracker: (tracker) => {
    set({ selectedTracker: tracker });
  },

  setTrackers: (trackers) => {
    set({ trackers });
  },

  getTrackersByBranch: (branchId) => {
    return get().trackers.filter(tracker => tracker.branchId === branchId);
  },
}));
