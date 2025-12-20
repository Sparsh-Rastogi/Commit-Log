import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { NewCommitModal } from '@/components/NewCommitModal';
import { NewTaskModal } from '@/components/NewTaskModal';
import { NewTrackerModal } from '@/components/NewTrackerModal';
import { TrackerAnalyticsModal } from '@/components/TrackerAnalyticsModal';
import { mockUser, mockBranches, mockTasks, mockTrackers } from '@/data/mockData';
import { Branch, Task, Tracker } from '@/types';
import { pushEntry } from '@/domains/services/tracker.service';
import { TrackerMode, TrackerDisplay } from '@/domains/models/tracker';

const Index = () => {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [trackers, setTrackers] = useState<Tracker[]>(mockTrackers);
  const [currentBranchId, setCurrentBranchId] = useState('main');
  const [newCommitModalOpen, setNewCommitModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTrackerModalOpen, setNewTrackerModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

  const handleBranchSelect = (branchId: string) => {
    setCurrentBranchId(branchId);
  };

  const handleNewCommit = (name: string, description: string) => {
    const newBranch: Branch = {
      id: `commit-${Date.now()}`,
      name: `feature/${name}`,
      description,
      isMain: false,
      createdAt: new Date(),
    };
    setBranches([...branches, newBranch]);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleTrackerClick = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setTrackerModalOpen(true);
  };

  const handlePushEntry = useCallback((trackerId: string, value: number) => {
    setTrackers(prev => prev.map(tracker => 
      tracker.id === trackerId 
        ? pushEntry(tracker, value)
        : tracker
    ));
    
    // Update selected tracker if it's currently open
    setSelectedTracker(prev => 
      prev?.id === trackerId 
        ? trackers.find(t => t.id === trackerId) ?? prev
        : prev
    );
  }, [trackers]);

  const handleCreateTask = (title: string, weight: number, modifiers: string[]) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      weight,
      modifiers,
      branchId: currentBranchId,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleCreateTracker = (data: {
    name: string;
    mode: TrackerMode;
    displayMode: TrackerDisplay;
    weight: number;
    target?: number;
    threshold?: number;
  }) => {
    const newTracker: Tracker = {
      id: `tracker-${Date.now()}`,
      name: data.name,
      branchId: currentBranchId,
      weight: data.target ? data.weight : 0,
      mode: data.mode,
      displayMode: data.displayMode,
      target: data.target,
      threshold: data.threshold,
      entries: [],
      status: 'active',
    };
    setTrackers(prev => [...prev, newTracker]);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={mockUser}
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
        onAddTask={() => setNewTaskModalOpen(true)}
        onAddTracker={() => setNewTrackerModalOpen(true)}
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
