import { Branch, UserProfile } from '@/types';
import { ProfileSection } from './ProfileSection';
import { BranchList } from './BranchList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SidebarProps {
  user: UserProfile;
  branches: Branch[];
  currentBranchId: string;
  onBranchSelect: (branchId: string) => void;
  onNewCommit: () => void;
}

export function Sidebar({ 
  user, 
  branches, 
  currentBranchId, 
  onBranchSelect, 
  onNewCommit 
}: SidebarProps) {
  return (
    <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      <ProfileSection user={user} />
      
      <BranchList 
        branches={branches}
        currentBranchId={currentBranchId}
        onBranchSelect={onBranchSelect}
      />

      <div className="p-3 border-t border-sidebar-border">
        <Button 
          variant="commit" 
          className="w-full"
          onClick={onNewCommit}
        >
          <Plus className="w-4 h-4" />
          New Commit
        </Button>
      </div>
    </aside>
  );
}
