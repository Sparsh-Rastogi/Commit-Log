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
import { useNavigate } from "react-router-dom";
import { Task, Tracker } from "@/types";
import { TrackerMode, TrackerDisplay } from "@/domains/models/tracker";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  /* =======================
     Auth Store
  ======================= */
  const user = useAuthStore(state => state.user);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const logout = useAuthStore(state => state.logout);
  const isAuthLoading = useAuthStore(state => state.isLoading);

  /* =======================
     Branch Store
  ======================= */
  const branches = useBranchStore(state => state.branches);
  const currentBranchId = useBranchStore(state => state.currentBranchId);
  const selectBranch = useBranchStore(state => state.selectBranch);
  const fetchBranches = useBranchStore(state => state.fetchBranches);
  const createBranch = useBranchStore(state => state.createBranch);
  const getCurrentBranch = useBranchStore(state => state.getCurrentBranch);
  const pullBranch = useBranchStore(state => state.pullBranch);
  const isPulling = useBranchStore(state => state.isPulling);
  const isBranchLoading = useBranchStore(state => state.isLoading);

  /* =======================
     Task Store
  ======================= */
  const tasks = useTaskStore(state => state.tasks);
  const fetchTasks = useTaskStore(state => state.fetchTasks);
  const createTask = useTaskStore(state => state.createTask);
  const toggleTask = useTaskStore(state => state.toggleTask);
  const postponeTask = useTaskStore(state => state.postponeTask);
  const removeTaskDate = useTaskStore(state => state.removeTaskDate);
  const isTaskLoading = useTaskStore(state => state.isLoading);

  /* =======================
     Tracker Store
  ======================= */
  const trackers = useTrackerStore(state => state.trackers);
  const fetchTrackers = useTrackerStore(state => state.fetchTrackers);
  const selectedTracker = useTrackerStore(state => state.selectedTracker);
  const setSelectedTracker = useTrackerStore(state => state.setSelectedTracker);
  const createTracker = useTrackerStore(state => state.createTracker);
  const deleteTracker = useTrackerStore(state => state.deleteTracker);
  const pushEntry = useTrackerStore(state => state.pushEntry);
  const isTrackerLoading = useTrackerStore(state => state.isLoading);

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
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchBranches();
    }
  }, [isAuthLoading, fetchBranches]);

  useEffect(() => {
    if (currentBranchId) {
      fetchTasks(currentBranchId);
      fetchTrackers(currentBranchId);
    }
  }, [currentBranchId, fetchTasks, fetchTrackers]);

  const currentBranch = getCurrentBranch();

  const isInitialLoading = isAuthLoading || isBranchLoading || !currentBranch;

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-commit" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
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

  const handleTaskToggle = (taskId: number) => {
    toggleTask(taskId);
  };

  const handleTrackerClick = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setTrackerModalOpen(true);
  };

  const handlePushEntry = async (trackerId: number, value: number) => {
    await pushEntry(trackerId, value);
    if (currentBranchId) await fetchTrackers(currentBranchId); // ⬅ re-fetch trackers
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "completed" | "branchId">
  ) => {
    if (!currentBranchId) return;
    await createTask({ ...taskData, branchId: currentBranchId });
    await fetchTasks(currentBranchId); // ⬅ re-fetch tasks
  };

  const handlePostponeTask = (taskId: number, newDate: Date) => {
    postponeTask(taskId, newDate);
  };

  const handleRemoveTaskDate = (taskId: number) => {
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
    await fetchTrackers(currentBranchId); // ⬅ re-fetch trackers after creation
  };

  const handleDeleteTracker = async (trackerId: number) => {
    await deleteTracker(trackerId);
    if (currentBranchId) await fetchTrackers(currentBranchId); // maintain state sync
  };

  /* =======================
     Pull Commit Flow
  ======================= */
  const handlePullCommitClick = () => {
    if (currentBranch.is_main) {
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
      await checkAuth();

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
     Logout Handler
  ======================= */
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  /* =======================
     Sidebar User
  ======================= */
  const userProfile = user
    ? { username: user.username, level: user.level, xp: user.xp }
    : { username: "Guest", level: 1, xp: 0 };

  const totalTrackerWeight = trackers.reduce(
    (sum, t) => sum + (t.weight || 0),
    0
  );

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
        onLogout={handleLogout}
      />

      <MainContent
        currentBranch={currentBranch}
        tasks={tasks}
        trackers={trackers}
        totalTrackerWeight={totalTrackerWeight}
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
        isLoading={isTaskLoading || isTrackerLoading}
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
        onPushEntry={handlePushEntry}
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
