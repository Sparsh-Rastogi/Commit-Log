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
    const branches = await apiFetch<Branch[]>("/branches/");
    const mainBranch = branches.find(b => b.is_main);
    // console.log("Main branch:", mainBranch);
    console.log("Fetched branches:", branches.find(b => b.id === get().currentBranchId));
    set({
      branches,
      currentBranchId: get().currentBranchId? get().currentBranchId : mainBranch ? mainBranch.id : null,
      isLoading: false,
    });
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
    // console.log(branches);
    console.log("Getting current branch for ID:", currentBranchId);
    // if(currentBranchId === null) return branches.find(b => b.is_main);
    return branches.find(b => b.id === currentBranchId);
  },
}));
