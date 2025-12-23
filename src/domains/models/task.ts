export type TaskTimeMode = 'none' | 'scheduled' | 'period' | 'recurring';

export type RecurringType = 'days' | 'weekend';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  weight: number;
  modifiers: string[];
  branchId: number | null;
  
  // Time mode fields
  timeMode: TaskTimeMode;
  scheduledDate?: Date;
  scheduledTime?: string; // HH:mm format
  startDate?: Date;
  startTime?: string;
  endDate?: Date;
  endTime?: string;
  recurringType?: RecurringType;
  recurringDays?: number; // every N days
}
