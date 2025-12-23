import { Branch } from '../domains/models/branch';
import { GitBranch, GitCommit, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchListProps {
  branches: Branch[];
  currentBranchId: number | null;
  onBranchSelect: (branchId: number | null) => void;

  /** Optional: precomputed branch scores (0–1) */
  branchScores?: Record<number, number>;
}

export function BranchList({
  branches,
  currentBranchId,
  onBranchSelect,
  branchScores = {},
}: BranchListProps) {
  const mainBranch = branches.find(b => b.isMain);
  const commitBranches = branches.filter(b => !b.isMain);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-2">

      {/* Main Branch */}
      {mainBranch && mainBranch.id !== null && (
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
            <GitBranch
              className={cn(
                "w-4 h-4",
                currentBranchId === mainBranch.id && "text-commit"
              )}
            />

            <span className="font-mono font-medium truncate">
              {mainBranch.name}
            </span>

            {mainBranch.id !== null && branchScores[mainBranch.id] !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">
                {(branchScores[mainBranch.id] * 100).toFixed(0)}%
              </span>
            )}

            {currentBranchId === mainBranch.id && (
              <ChevronRight className="w-4 h-4 text-commit" />
            )}
          </button>
        </div>
      )}

      {/* Commits */}
      {commitBranches.length > 0 && (
        <div className="px-2">
          <div className="px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Commits
            </span>
          </div>

          <div className="space-y-0.5">
            {commitBranches.filter(b => b.id !== null).map(branch => (
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
                <GitCommit
                  className={cn(
                    "w-4 h-4",
                    currentBranchId === branch.id
                      ? "text-commit"
                      : "group-hover:text-commit/70"
                  )}
                />

                <span className="font-mono text-xs truncate">
                  {branch.name}
                </span>

                {branch.id !== null && branchScores[branch.id] !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {(branchScores[branch.id] * 100).toFixed(0)}%
                  </span>
                )}

                {currentBranchId === branch.id && (
                  <ChevronRight className="w-4 h-4 text-commit" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
