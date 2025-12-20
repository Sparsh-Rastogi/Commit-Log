export interface Task {
  id: string;
  title: string;
  completed: boolean;
  weight: number;
  modifiers: string[];
  branchId: string;
}
