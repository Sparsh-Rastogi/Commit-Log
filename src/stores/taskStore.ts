import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { Task, TaskTimeMode } from "@/domains/models/task";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  // Actions
  fetchTasks: (branchId: number) => Promise<void>;
  createTask: (taskData: Omit<Task, "id" | "completed">) => Promise<Task>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  postponeTask: (taskId: number, newDate: Date) => Promise<void>;
  removeTaskDate: (taskId: number) => Promise<void>;
  setTasks: (tasks: Task[]) => void;

  // Selectors
  getTasksByBranch: (branchId: number | null) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  // 🔹 Fetch tasks for a branch
  fetchTasks: async (branchId) => {
    set({ isLoading: true });
    const tasks = await apiFetch<Task[]>(`/tasks/?branch=${branchId}`);
    set({ tasks, isLoading: false });
  },

  // 🔹 Create task
  createTask: async (taskData) => {
    const task = await apiFetch<Task>("/tasks/", {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    set(state => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  // 🔹 Generic update (future-proof)
  updateTask: async (taskId, updates) => {
    const updated = await apiFetch<Task>(`/tasks/${taskId}/`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    set(state => ({
      tasks: state.tasks.map(t => (t.id === taskId ? updated : t)),
    }));
  },

  // 🔹 Delete task
  deleteTask: async (taskId) => {
    await apiFetch(`/tasks/${taskId}/`, { method: "DELETE" });
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
  },

  // 🔹 Toggle completion
  toggleTask: async (taskId) => {
    const res = await apiFetch<{ completed: boolean }>(
      `/tasks/${taskId}/toggle/`,
      { method: "PATCH" }
    );

    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: res.completed }
          : task
      ),
    }));
  },

  // 🔹 Postpone / reschedule
  postponeTask: async (taskId, newDate) => {
    const updated = await apiFetch<Task>(
      `/tasks/${taskId}/reschedule/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          scheduled_at: newDate.toISOString(),
        }),
      }
    );

    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? updated : task
      ),
    }));
  },

  // 🔹 Remove date (→ NONE)
  removeTaskDate: async (taskId) => {
    const updated = await apiFetch<Task>(
      `/tasks/${taskId}/remove-date/`,
      { method: "PATCH" }
    );

    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? updated : task
      ),
    }));
  },

  setTasks: (tasks) => set({ tasks }),

  // 🔹 Selector
  getTasksByBranch: (branchId) => {
    if (!branchId) return [];
    return get().tasks.filter(task => task.branchId === branchId);
  },
}));
