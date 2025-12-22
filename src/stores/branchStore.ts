import { create } from 'zustand';
import { Branch } from '@/domains/models/branch';

interface BranchState {
  branches: Branch[];
  currentBranchId: string;
  isLoading: boolean;
  
  // Actions
  selectBranch: (branchId: string) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (name: string, description: string) => Promise<Branch>;
  deleteBranch: (branchId: string) => Promise<void>;
  setBranches: (branches: Branch[]) => void;
  
  // Selectors
  getCurrentBranch: () => Branch | undefined;
}

// TODO: Replace with real API calls
const mockBranches: Branch[] = [
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

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  currentBranchId: 'main',
  isLoading: false,

  selectBranch: (branchId) => {
    set({ currentBranchId: branchId });
  },

  fetchBranches: async () => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ branches: mockBranches, isLoading: false });
  },

  createBranch: async (name, description) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const newBranch: Branch = {
      id: `commit-${Date.now()}`,
      name: `feature/${name}`,
      description,
      isMain: false,
      createdAt: new Date(),
    };
    set(state => ({ branches: [...state.branches, newBranch] }));
    return newBranch;
  },

  deleteBranch: async (branchId) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      branches: state.branches.filter(b => b.id !== branchId),
      currentBranchId: state.currentBranchId === branchId ? 'main' : state.currentBranchId,
    }));
  },

  setBranches: (branches) => {
    set({ branches });
  },

  getCurrentBranch: () => {
    const state = get();
    return state.branches.find(b => b.id === state.currentBranchId);
  },
}));
