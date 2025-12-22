import { create } from 'zustand';
import { Branch } from '@/domains/models/branch';

export interface PullResponse {
  score: number;
  xpEarned: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
}

interface BranchState {
  branches: Branch[];
  currentBranchId: string;
  isLoading: boolean;
  isPulling: boolean;
  
  // Actions
  selectBranch: (branchId: string) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (name: string, description: string) => Promise<Branch>;
  deleteBranch: (branchId: string) => Promise<void>;
  pullBranch: (branchId: string) => Promise<PullResponse>;
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
  isPulling: false,

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

  pullBranch: async (branchId) => {
    set({ isPulling: true });
    
    // TODO: Replace with real API call to POST /api/branches/{branchId}/pull/
    // The backend will calculate the score, XP, and level changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response from backend - ALL scoring logic is on backend
    const mockResponse: PullResponse = {
      score: Math.floor(Math.random() * 30) + 70, // 70-100%
      xpEarned: Math.floor(Math.random() * 200) + 100, // 100-300 XP
      newXp: 2650, // Updated total XP from backend
      newLevel: 13, // Potentially updated level from backend
      leveledUp: Math.random() > 0.7, // 30% chance of level up for demo
    };
    
    // Remove the pulled branch and switch to main
    set(state => ({
      branches: state.branches.filter(b => b.id !== branchId),
      currentBranchId: 'main',
      isPulling: false,
    }));
    
    return mockResponse;
  },

  setBranches: (branches) => {
    set({ branches });
  },

  getCurrentBranch: () => {
    const state = get();
    return state.branches.find(b => b.id === state.currentBranchId);
  },
}));
