import { Branch } from '@/types';
import { GitBranch, GitCommit, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchListProps {
  branches: Branch[];
  currentBranchId: string;
  onBranchSelect: (branchId: string) => void;
}

export function BranchList({ branches, currentBranchId, onBranchSelect }: BranchListProps) {
  const mainBranch = branches.find(b => b.isMain);
  const commitBranches = branches.filter(b => !b.isMain);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
      {/* Main Branch */}
      {mainBranch && (
        <div className="px-2 mb-2">
          <button
            onClick={() => onBranchSelect(mainBranch.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
              currentBranchId === mainBranch.id
                ? "bg-secondary border border-commit/40 text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <GitBranch className={cn(
              "w-4 h-4 flex-shrink-0",
              currentBranchId === mainBranch.id ? "text-commit" : ""
            )} />
            <span className="font-mono font-medium truncate">{mainBranch.name}</span>
            {currentBranchId === mainBranch.id && (
              <ChevronRight className="w-4 h-4 ml-auto text-commit" />
            )}
          </button>
        </div>
      )}

      {/* Commits Section */}
      {commitBranches.length > 0 && (
        <div className="px-2">
          <div className="px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Commits
            </span>
          </div>
          <div className="space-y-0.5">
            {commitBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => onBranchSelect(branch.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 group",
                  currentBranchId === branch.id
                    ? "bg-secondary border border-commit/40 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <GitCommit className={cn(
                  "w-4 h-4 flex-shrink-0",
                  currentBranchId === branch.id ? "text-commit" : "group-hover:text-commit/70"
                )} />
                <span className="font-mono text-xs truncate">{branch.name}</span>
                {currentBranchId === branch.id && (
                  <ChevronRight className="w-4 h-4 ml-auto text-commit" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
