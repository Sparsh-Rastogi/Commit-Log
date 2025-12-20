import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { NewCommitModal } from '@/components/NewCommitModal';
import { TrackerAnalyticsModal } from '@/components/TrackerAnalyticsModal';
import { mockUser, mockBranches, mockTasks, mockTrackers } from '@/data/mockData';
import { Branch, Task, Tracker } from '@/types';
import { pushEntry } from '@/domains/services/tracker.service';

const Index = () => {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [trackers, setTrackers] = useState<Tracker[]>(mockTrackers);
  const [currentBranchId, setCurrentBranchId] = useState('main');
  const [newCommitModalOpen, setNewCommitModalOpen] = useState(false);
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
      />

      <NewCommitModal
        open={newCommitModalOpen}
        onOpenChange={setNewCommitModalOpen}
        onCreateCommit={handleNewCommit}
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
