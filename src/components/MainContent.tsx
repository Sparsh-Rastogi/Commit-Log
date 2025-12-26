import { Branch, Task, Tracker } from "@/types";
import { TaskCard } from "./TaskCard";
import { TrackerCard } from "./TrackerCard";
import {
  GitBranch,
  CheckSquare,
  Activity,
  Plus,
  GitMerge,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ======================================================
   Branch Score Calculation (mirrors backend logic)
====================================================== */
function calculateBranchScore(tasks: Task[], trackers: Tracker[]) {
  let earned = 0;
  let total = 0;

  // Tasks
  for (const task of tasks) {
    total += task.weight;
    if (task.completed) {
      earned += task.weight;
    }
  }

  // Trackers
  for (const tracker of trackers) {
    if (!tracker.weight || tracker.target == null) continue;

    total += tracker.weight;

    // const sum = tracker.entries.reduce((acc, e) => acc + e.value, 0);
    const sum = tracker.entries
      ? tracker.entries.reduce((acc, e) => acc + e.value, 0)
      : 0;

    let contribution = 0;

    if (tracker.threshold != null) {
      // Threshold trackers contribute fully until they die
      if (sum < tracker.threshold) {
        contribution = tracker.weight;
      }
    } else {
      contribution = Math.min(
        (sum / tracker.target) * tracker.weight,
        tracker.weight
      );
    }

    earned += Math.max(0, contribution);
  }

  return {
    percent: total === 0 ? 0 : earned / total,
    completedTasks: tasks.filter(t => t.completed).length,
    totalTasks: tasks.length,
    scoringTrackers: trackers.filter(t => t.weight > 0).length,
  };
}

/* ======================================================
   Component
====================================================== */
interface MainContentProps {
  currentBranch: Branch;
  tasks: Task[];
  trackers: Tracker[];
  totalTrackerWeight: number;
  onTaskToggle: (id: number) => void;
  onTrackerClick: (tracker: Tracker) => void;
  onPushEntry?: (trackerId: number, value: number) => void;
  onDeleteTracker?: (trackerId: number) => void;
  onAddTask?: () => void;
  onAddTracker?: () => void;
  onPostponeTask?: (id: number, newDate: Date) => void;
  onRemoveTaskDate?: (id: number) => void;
  onPullCommit?: () => void;
  isPulling?: boolean;
  isLoading?: boolean;
}

export function MainContent({
  currentBranch,
  tasks,
  trackers,
  totalTrackerWeight,
  onTaskToggle,
  onTrackerClick,
  onPushEntry,
  onDeleteTracker,
  onAddTask,
  onAddTracker,
  onPostponeTask,
  onRemoveTaskDate,
  onPullCommit,
  isPulling = false,
  isLoading = false,
}: MainContentProps) {
  /* =========================
     Branch-scoped data
  ========================= */
  const branchTasks = tasks.filter(t => t.branchId === currentBranch.id);
  const branchTrackers = trackers.filter(t => t.branchId === currentBranch.id);

  const scoreData = useMemo(
    () => calculateBranchScore(branchTasks, branchTrackers),
    [branchTasks, branchTrackers]
  );

  const scorePercent = Math.round(scoreData.percent * 100);

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-background">
      {/* ================= Header ================= */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-commit" />
              <h1 className="font-mono text-lg font-semibold">
                {currentBranch.name}
              </h1>
              {currentBranch.is_main && (
                <span className="px-2 py-0.5 text-[10px] bg-commit/20 text-commit rounded">
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

          {!currentBranch.is_main && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase text-muted-foreground">
                  Commit Progress
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-surface-3 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-commit to-xp transition-all"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm text-commit">
                    {scorePercent}%
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {scoreData.completedTasks}/{scoreData.totalTasks} tasks ·{" "}
                  {scoreData.scoringTrackers} scoring trackers
                </span>
              </div>

              <Button
                onClick={onPullCommit}
                disabled={isPulling}
                className="bg-commit gap-2"
              >
                {isPulling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pulling…
                  </>
                ) : (
                  <>
                    <GitMerge className="w-4 h-4" />
                    Pull Commit
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ================= Content ================= */}
      <div className="p-6 space-y-8">
        {/* -------- Tasks -------- */}
        <Section
          title="Tasks"
          count={`${scoreData.completedTasks}/${scoreData.totalTasks}`}
          icon={<CheckSquare className="w-4 h-4" />}
          onAdd={onAddTask}
        >
          {branchTasks.length ? (
            <div className="grid gap-3">
              {branchTasks.map(task => (
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
            <EmptyState icon={<CheckSquare />} message="No tasks in this branch" />
          )}
        </Section>

        {/* -------- Trackers -------- */}
        <Section
          title="Trackers"
          count={branchTrackers.length}
          icon={<Activity className="w-4 h-4" />}
          onAdd={onAddTracker}
        >
          {branchTrackers.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {branchTrackers.map(tracker => (
                <TrackerCard
                  key={tracker.id}
                  tracker={tracker}
                  totalWeight={totalTrackerWeight}
                  onClick={() => onTrackerClick(tracker)}
                  onPushEntry={onPushEntry}
                  onDelete={onDeleteTracker}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Activity />}
              message="No trackers in this branch"
            />
          )}
        </Section>
      </div>
    </main>
  );
}

/* ======================================================
   Helpers
====================================================== */
function Section({
  title,
  count,
  icon,
  onAdd,
  children,
}: {
  title: string;
  count: React.ReactNode;
  icon: React.ReactNode;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <h2 className="text-sm uppercase font-semibold">{title}</h2>
          <span className="text-[10px] font-mono bg-surface-2 px-1.5 rounded">
            {count}
          </span>
        </div>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-muted-foreground/50">
      {icon}
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
