import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { NewCommitModal } from '@/components/NewCommitModal';
import { NewTaskModal } from '@/components/NewTaskModal';
import { NewTrackerModal } from '@/components/NewTrackerModal';
import { TrackerAnalyticsModal } from '@/components/TrackerAnalyticsModal';
import { useAuthStore, useBranchStore, useTaskStore, useTrackerStore } from '@/stores';
import { Task, Tracker } from '@/types';
import { TrackerMode, TrackerDisplay } from '@/domains/models/tracker';

const Index = () => {
  // Auth store
  const { user, checkAuth } = useAuthStore();
  
  // Branch store
  const { branches, currentBranchId, selectBranch, fetchBranches, createBranch, getCurrentBranch } = useBranchStore();
  
  // Task store
  const { tasks, fetchTasks, createTask, toggleTask, postponeTask, removeTaskDate } = useTaskStore();
  
  // Tracker store
  const { 
    trackers, 
    selectedTracker, 
    fetchTrackers, 
    createTracker, 
    deleteTracker, 
    pushEntry, 
    setSelectedTracker 
  } = useTrackerStore();

  // Modal states
  const [newCommitModalOpen, setNewCommitModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTrackerModalOpen, setNewTrackerModalOpen] = useState(false);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  // Initialize state on app load
  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([
        checkAuth(),
        fetchBranches(),
        fetchTasks(),
        fetchTrackers(),
      ]);
    };
    initializeApp();
  }, [checkAuth, fetchBranches, fetchTasks, fetchTrackers]);

  const currentBranch = getCurrentBranch() || branches[0];

  const handleBranchSelect = (branchId: string) => {
    selectBranch(branchId);
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

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'completed' | 'branchId'>) => {
    await createTask({
      ...taskData,
      branchId: currentBranchId,
    });
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
    await createTracker({
      ...data,
      branchId: currentBranchId,
    });
  };

  const handleDeleteTracker = async (trackerId: string) => {
    await deleteTracker(trackerId);
  };

  // User profile for sidebar (from auth store)
  const userProfile = user ? {
    username: user.username,
    level: user.level,
    xp: user.xp,
    maxXp: user.maxXp,
  } : {
    username: 'Guest',
    level: 1,
    xp: 0,
    maxXp: 100,
  };

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
    </div>
  );
};

export default Index;
