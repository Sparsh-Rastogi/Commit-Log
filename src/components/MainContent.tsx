import { Branch, Task, Tracker } from '@/types';
import { TaskCard } from './TaskCard';
import { TrackerCard } from './TrackerCard';
import { GitBranch, CheckSquare, Activity, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { branchScore } from '@/domains/services/score.service';
import { Button } from '@/components/ui/button';

interface MainContentProps {
  currentBranch: Branch;
  tasks: Task[];
  trackers: Tracker[];
  onTaskToggle: (id: string) => void;
  onTrackerClick: (tracker: Tracker) => void;
  onPushEntry?: (trackerId: string, value: number) => void;
  onDeleteTracker?: (trackerId: string) => void;
  onAddTask?: () => void;
  onAddTracker?: () => void;
  onPostponeTask?: (id: string, newDate: Date) => void;
  onRemoveTaskDate?: (id: string) => void;
}

export function MainContent({ 
  currentBranch, 
  tasks, 
  trackers, 
  onTaskToggle, 
  onTrackerClick,
  onPushEntry,
  onDeleteTracker,
  onAddTask,
  onAddTracker,
  onPostponeTask,
  onRemoveTaskDate,
}: MainContentProps) {
  const branchTasks = tasks.filter(t => t.branchId === currentBranch.id);
  const branchTrackers = trackers.filter(t => t.branchId === currentBranch.id);

  // Calculate dynamic branch score using domain service
  const score = useMemo(() => {
    return branchScore(branchTasks, branchTrackers);
  }, [branchTasks, branchTrackers]);

  const scorePercent = Math.round(score * 100);

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-background scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-commit" />
              <h1 className="text-lg font-semibold font-mono text-foreground">
                {currentBranch.name}
              </h1>
              {currentBranch.isMain && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-commit/20 text-commit rounded-full">
                  default
                </span>
              )}
            </div>
            {currentBranch.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {currentBranch.description}
              </p>
            )}
          </div>

          {/* Commit Score - only for non-main branches */}
          {!currentBranch.isMain && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Commit Progress
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-commit to-xp rounded-full transition-all duration-500"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <span className="font-mono text-sm font-semibold text-commit">{scorePercent}%</span>
              </div>
              <span className="text-[9px] text-muted-foreground">
                {branchTasks.filter(t => t.completed).length}/{branchTasks.length} tasks · {branchTrackers.filter(t => t.weight > 0).length} scoring trackers
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tasks
              </h2>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-surface-2 text-muted-foreground rounded">
                {branchTasks.filter(t => t.completed).length}/{branchTasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddTask}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-commit hover:bg-commit/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>

          {branchTasks.length > 0 ? (
            <div className="grid gap-3">
              {branchTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={onTaskToggle}
                  onPostpone={onPostponeTask}
                  onRemoveDate={onRemoveTaskDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<CheckSquare className="w-8 h-8" />}
              message="No tasks in this branch"
            />
          )}
        </section>

        {/* Trackers Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Trackers
              </h2>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-surface-2 text-muted-foreground rounded">
                {branchTrackers.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddTracker}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-accent hover:bg-accent/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tracker
            </Button>
          </div>

          {branchTrackers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {branchTrackers.map((tracker) => (
                <TrackerCard 
                  key={tracker.id} 
                  tracker={tracker}
                  onClick={() => onTrackerClick(tracker)}
                  onPushEntry={onPushEntry}
                  onDelete={onDeleteTracker}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<Activity className="w-8 h-8" />}
              message="No trackers in this branch"
            />
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
      {icon}
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
