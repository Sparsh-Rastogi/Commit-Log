import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { Branch } from "@/domains/models/branch";

export interface PullResponse {
  score: number;
  xpEarned: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
}

interface BranchState {
  branches: Branch[];
  currentBranchId: number | null;
  isLoading: boolean;
  isPulling: boolean;

  // Actions
  selectBranch: (branchId: number) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (name: string, description: string) => Promise<Branch>;
  deleteBranch: (branchId: number) => Promise<void>;
  pullBranch: (branchId: number) => Promise<PullResponse>;
  setBranches: (branches: Branch[]) => void;

  // Selectors
  getCurrentBranch: () => Branch | undefined;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  currentBranchId: null,
  isLoading: false,
  isPulling: false,

  selectBranch: (branchId) => {
    // console.log("Branch selected:", branchId);
    set({ currentBranchId: branchId });
  },

  fetchBranches: async () => {
    set({ isLoading: true });
    try {
      const branches = await apiFetch<Branch[]>("/branches/");
      const { currentBranchId } = get();
      const mainBranch = branches.find(b => b.is_main);
      
      // Only set to main if no branch is currently selected OR current branch no longer exists
      const branchStillExists = branches.some(b => b.id === currentBranchId);
      const newBranchId = branchStillExists && currentBranchId 
        ? currentBranchId 
        : mainBranch?.id ?? null;

      set({
        branches,
        currentBranchId: newBranchId,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      set({ isLoading: false });
    }
  },

  createBranch: async (name, description) => {
    const newBranch = await apiFetch<Branch>("/branches/", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });

    set(state => ({
      branches: [...state.branches, newBranch],
    }));

    return newBranch;
  },

  deleteBranch: async (branchId) => {
    await apiFetch(`/branches/${branchId}/`, {
      method: "DELETE",
    });

    set(state => {
      const remaining = state.branches.filter(b => b.id !== branchId);
      const stillExists = remaining.some(b => b.id === state.currentBranchId);

      return {
        branches: remaining,
        currentBranchId: stillExists
          ? state.currentBranchId
          : remaining.find(b => b.is_main)?.id ?? null,
      };
    });
  },

  pullBranch: async (branchId) => {
    set({ isPulling: true });

    const response = await apiFetch<PullResponse>(
      `/branches/${branchId}/pull/`,
      { method: "POST" }
    );

    set(state => {
      const remaining = state.branches.filter(b => b.id !== branchId);
      const mainBranch = remaining.find(b => b.is_main);

      return {
        branches: remaining,
        currentBranchId: mainBranch ? mainBranch.id : null,
        isPulling: false,
      };
    });

    return response;
  },

  setBranches: (branches) => {
    const mainBranch = branches.find(b => b.is_main);
    set({
      branches,
      currentBranchId: mainBranch ? mainBranch.id : null,
    });
  },

  getCurrentBranch: () => {
    const { branches, currentBranchId } = get();
    if (currentBranchId === null) {
      return branches.find(b => b.is_main);
    }
    return branches.find(b => b.id === currentBranchId);
  },
}));
