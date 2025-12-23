import { create } from 'zustand';
import { Task, TaskTimeMode } from '@/domains/models/task';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'completed'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => void;
  postponeTask: (taskId: string, newDate: Date) => void;
  removeTaskDate: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;
  
  // Selectors
  getTasksByBranch: (branchId: number | null) => Task[];
}

// TODO: Replace with real API calls
const mockTasks: Task[] = []
// const mockTasks: Task[] = [
//   { id: 't1', title: 'Review pull requests', completed: false, weight: 3, modifiers: ['priority'], branchId: 'main', timeMode: 'none' },
//   { id: 't2', title: 'Update documentation', completed: true, weight: 2, modifiers: [], branchId: 'main', timeMode: 'none' },
//   { id: 't3', title: 'Morning meditation', completed: false, weight: 1, modifiers: ['daily'], branchId: 'commit-1', timeMode: 'scheduled', scheduledDate: new Date() },
//   { id: 't4', title: 'Exercise routine', completed: true, weight: 2, modifiers: ['daily', 'streak'], branchId: 'commit-1', timeMode: 'recurring', recurringType: 'days', recurringDays: 1 },
//   { id: 't5', title: 'Deep work session', completed: false, weight: 5, modifiers: ['focus'], branchId: 'commit-2', timeMode: 'scheduled', scheduledDate: new Date(Date.now() + 86400000) },
//   { id: 't6', title: 'Code review', completed: false, weight: 3, modifiers: [], branchId: 'commit-2', timeMode: 'none' },
//   { id: 't7', title: 'Wind down routine', completed: false, weight: 1, modifiers: [], branchId: 'commit-3', timeMode: 'period', startDate: new Date(), endDate: new Date(Date.now() + 604800000) },
//   { id: 't8', title: 'No screens after 10pm', completed: true, weight: 2, modifiers: ['challenge'], branchId: 'commit-3', timeMode: 'recurring', recurringType: 'weekend' },
// ];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ tasks: mockTasks, isLoading: false });
  },

  createTask: async (taskData) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    set(state => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: async (taskId, updates) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },

  deleteTask: async (taskId) => {
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId),
    }));
  },

  toggleTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  },

  postponeTask: (taskId, newDate) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: false, timeMode: 'scheduled' as TaskTimeMode, scheduledDate: newDate }
          : task
      ),
    }));
  },

  removeTaskDate: (taskId) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, timeMode: 'none' as TaskTimeMode, scheduledDate: undefined, startDate: undefined, endDate: undefined }
          : task
      ),
    }));
  },

  setTasks: (tasks) => {
    set({ tasks });
  },

  getTasksByBranch: (branchId) => {
    return get().tasks.filter(task => task.branchId === branchId);
  },
}));
