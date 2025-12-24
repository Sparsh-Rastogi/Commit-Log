import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { Tracker, TrackerMode, TrackerDisplay } from "@/domains/models/tracker";
import { TrackerEntry } from "@/domains/models/entry";

function adaptTrackerData(data: any): Tracker {
  return {
    ...data,
    status: data.is_active ? "active" : "dead",
    target: data.target_value,
    branchId: data.branch,
    branch: undefined,
  };
}

interface TrackerState {
  trackers: Tracker[];
  isLoading: boolean;
  selectedTracker: Tracker | null;

  // Actions
  fetchTrackers: (branchId: number) => Promise<void>;
  createTracker: (data: {
    name: string;
    branchId: number;
    mode: TrackerMode;
    displayMode: TrackerDisplay;
    weight: number;
    target?: number;
    threshold?: number;
  }) => Promise<Tracker>;
  updateTracker: (trackerId: number, updates: Partial<Tracker>) => Promise<void>;
  deleteTracker: (trackerId: number) => Promise<void>;
  pushEntry: (trackerId: number, value: number) => Promise<void>;
  fetchEntries: (trackerId: number) => Promise<void>;
  setSelectedTracker: (tracker: Tracker | null) => void;

  // Selectors
  getTrackersByBranch: (branchId: number | null) => Tracker[];
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  trackers: [],
  isLoading: false,
  selectedTracker: null,

  /* =========================
     Fetch trackers for branch
  ========================= */
  fetchTrackers: async (branchId) => {
    if(!branchId) return;
    set({ isLoading: true });
    console.log("Fetching trackers for branch:", branchId);
    const trackers = await apiFetch<Tracker[]>(
      `/trackers/?branch=${branchId}`
    );
    console.log("trackers before fetch:", trackers);

    set({ trackers: trackers.map(adaptTrackerData), isLoading: false });
  },

  /* =========================
     Create tracker
  ========================= */
  createTracker: async (data) => {
    const tracker = await apiFetch<Tracker>("/trackers/", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        branch: data.branchId,
        // tracker_type: data.mode,
        target_type: data.target
          ? data.threshold
            ? "THRESHOLD"
            : "VALUE"
          : "NONE",
        target_value: data.target ?? null,
        weight: data.weight,
      }),
    });

    set(state => ({ trackers: [...state.trackers, tracker] }));
    return tracker;
  },

  /* =========================
     Update tracker (future use)
  ========================= */
  updateTracker: async (trackerId, updates) => {
    const updated = await apiFetch<Tracker>(
      `/trackers/${trackerId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );

    set(state => ({
      trackers: state.trackers.map(t =>
        t.id === trackerId ? updated : t
      ),
    }));
  },

  /* =========================
     Delete tracker
  ========================= */
  deleteTracker: async (trackerId) => {
    await apiFetch(`/trackers/${trackerId}/`, {
      method: "DELETE",
    });

    set(state => ({
      trackers: state.trackers.filter(t => t.id !== trackerId),
      selectedTracker:
        state.selectedTracker?.id === trackerId
          ? null
          : state.selectedTracker,
    }));
  },

  /* =========================
     Push entry (NO frontend logic)
  ========================= */
  pushEntry: async (trackerId, value) => {
    await apiFetch(`/trackers/${trackerId}/push/`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });

    // Re-fetch trackers to stay backend-authoritative
    const branchId = get().selectedTracker?.branchId;
    if (branchId) {
      await get().fetchTrackers(branchId);
    }

    // Refresh selected tracker reference
    const updated = get().trackers.find(t => t.id === trackerId);
    console.log("Updated tracker after pushEntry:", updated);
    set({ selectedTracker: updated ?? null });
  },
  fetchEntries: async (trackerId: number) => {
    const data = await apiFetch<any[]>(`/trackers/${trackerId}/entries/`);

    const entries = data.map(e => ({
      id: e.id,
      value: e.value,
      createdAt: new Date(e.timestamp),
    }));

    set(state => ({
      trackers: state.trackers.map(t =>
        t.id === trackerId ? { ...t, entries } : t
      ),
      selectedTracker:
        state.selectedTracker?.id === trackerId
          ? { ...state.selectedTracker, entries }
          : state.selectedTracker,
    }));
  },


  setSelectedTracker: (tracker) => {
    set({ selectedTracker: tracker });
  },

  /* =========================
     Selector
  ========================= */
  getTrackersByBranch: (branchId) => {
    if (!branchId) return [];
    return get().trackers.filter(t => t.branchId === branchId);
  },
}));
