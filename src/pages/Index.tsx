import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { NewCommitModal } from "@/components/NewCommitModal";
import { NewTaskModal } from "@/components/NewTaskModal";
import { NewTrackerModal } from "@/components/NewTrackerModal";
import { TrackerAnalyticsModal } from "@/components/TrackerAnalyticsModal";
import { PullCommitModal, PullSuccessModal } from "@/components/PullCommitModal";

import {
  useAuthStore,
  useBranchStore,
  useTaskStore,
  useTrackerStore,
} from "@/stores";

import { Task, Tracker } from "@/types";
import { TrackerMode, TrackerDisplay } from "@/domains/models/tracker";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  /* =======================
     Auth Store
  ======================= */
  const { user, checkAuth } = useAuthStore();

  /* =======================
     Branch Store
  ======================= */
  const {
    branches,
    currentBranchId,
    selectBranch,
    fetchBranches,
    createBranch,
    getCurrentBranch,
    pullBranch,
    isPulling,
  } = useBranchStore();

  /* =======================
     Task Store
  ======================= */
  const {
    tasks,
    fetchTasks,
    createTask,
    toggleTask,
    postponeTask,
    removeTaskDate,
  } = useTaskStore();

  /* =======================
     Tracker Store
  ======================= */
  const {
    trackers,
    selectedTracker,
    fetchTrackers,
    createTracker,
    deleteTracker,
    pushEntry,
    setSelectedTracker,
  } = useTrackerStore();

  /* =======================
     Modal State
  ======================= */
  const [newCommitModalOpen, setNewCommitModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTrackerModalOpen, setNewTrackerModalOpen] = useState(false);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  const [pullConfirmModalOpen, setPullConfirmModalOpen] = useState(false);
  const [pullSuccessModalOpen, setPullSuccessModalOpen] = useState(false);
  const [pullResult, setPullResult] = useState<{
    branchName: string;
    score: number;
    xpEarned: number;
    leveledUp: boolean;
    newLevel: number;
  } | null>(null);

  /* =======================
     App Initialization
  ======================= */
  useEffect(() => {
    const initialize = async () => {
      await checkAuth();      // must complete first
      await fetchBranches();
      await fetchTasks();
      await fetchTrackers();
    };
    initialize();
  }, []);

  const currentBranch = getCurrentBranch();

  if (!currentBranch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  /* =======================
     Handlers
  ======================= */
  const handleBranchSelect = (branchId: number | null) => {
    if (branchId) selectBranch(branchId);
  };

  const handleNewCommit = async (name: string, description: string) => {
    await createBranch(name, description);
  };

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleTrackerClick = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setTrackerModalOpen(true);
  };

  const handlePushEntry = (trackerId: string, value: number) => {
    pushEntry(trackerId, value);
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "completed" | "branchId">
  ) => {
    if (!currentBranchId) return;
    await createTask({ ...taskData, branchId: currentBranchId });
  };

  const handlePostponeTask = (taskId: string, newDate: Date) => {
    postponeTask(taskId, newDate);
  };

  const handleRemoveTaskDate = (taskId: string) => {
    removeTaskDate(taskId);
  };

  const handleCreateTracker = async (data: {
    name: string;
    mode: TrackerMode;
    displayMode: TrackerDisplay;
    weight: number;
    target?: number;
    threshold?: number;
  }) => {
    if (!currentBranchId) return;
    await createTracker({ ...data, branchId: currentBranchId });
  };

  const handleDeleteTracker = async (trackerId: string) => {
    await deleteTracker(trackerId);
  };

  /* =======================
     Pull Commit Flow
  ======================= */
  const handlePullCommitClick = () => {
    if (currentBranch.isMain) {
      toast({
        title: "Cannot pull main branch",
        description: "Main branch cannot be finalized",
        variant: "destructive",
      });
      return;
    }
    setPullConfirmModalOpen(true);
  };

  const handlePullCommitConfirm = async () => {
    if (!currentBranchId) return;

    try {
      const response = await pullBranch(currentBranchId);

      await checkAuth(); // re-sync user from backend

      setPullConfirmModalOpen(false);
      setPullResult({
        branchName: currentBranch.name,
        score: response.score,
        xpEarned: response.xpEarned,
        leveledUp: response.leveledUp,
        newLevel: response.newLevel,
      });
      setPullSuccessModalOpen(true);

      toast({
        title: response.leveledUp ? "🎉 Level Up!" : "✓ Commit Pulled!",
        description: `Earned ${response.xpEarned} XP with ${response.score}% score`,
      });
    } catch {
      setPullConfirmModalOpen(false);
      toast({
        title: "Failed to pull commit",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  /* =======================
     Sidebar User
  ======================= */
  const userProfile = user
    ? { username: user.username, level: user.level, xp: user.xp }
    : { username: "Guest", level: 1, xp: 0 };

  /* =======================
     Render
  ======================= */
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={userProfile}
        branches={branches}
        currentBranchId={currentBranchId}
        onBranchSelect={handleBranchSelect}
        onNewCommit={() => setNewCommitModalOpen(true)}
      />

      <MainContent
        currentBranch={currentBranch}
        tasks={tasks}
        trackers={trackers}
        onTaskToggle={handleTaskToggle}
        onTrackerClick={handleTrackerClick}
        onPushEntry={handlePushEntry}
        onDeleteTracker={handleDeleteTracker}
        onAddTask={() => setNewTaskModalOpen(true)}
        onAddTracker={() => setNewTrackerModalOpen(true)}
        onPostponeTask={handlePostponeTask}
        onRemoveTaskDate={handleRemoveTaskDate}
        onPullCommit={handlePullCommitClick}
        isPulling={isPulling}
      />

      <NewCommitModal
        open={newCommitModalOpen}
        onOpenChange={setNewCommitModalOpen}
        onCreateCommit={handleNewCommit}
      />

      <NewTaskModal
        open={newTaskModalOpen}
        onOpenChange={setNewTaskModalOpen}
        onCreateTask={handleCreateTask}
      />

      <NewTrackerModal
        open={newTrackerModalOpen}
        onOpenChange={setNewTrackerModalOpen}
        onCreateTracker={handleCreateTracker}
      />

      <TrackerAnalyticsModal
        tracker={selectedTracker}
        open={trackerModalOpen}
        onOpenChange={setTrackerModalOpen}
      />

      <PullCommitModal
        open={pullConfirmModalOpen}
        onOpenChange={setPullConfirmModalOpen}
        branchName={currentBranch.name}
        isPulling={isPulling}
        onConfirm={handlePullCommitConfirm}
      />

      {pullResult && (
        <PullSuccessModal
          open={pullSuccessModalOpen}
          onOpenChange={setPullSuccessModalOpen}
          branchName={pullResult.branchName}
          score={pullResult.score}
          xpEarned={pullResult.xpEarned}
          leveledUp={pullResult.leveledUp}
          newLevel={pullResult.newLevel}
        />
      )}
    </div>
  );
};

export default Index;
