import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GitMerge, Loader2, Star, ArrowUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullCommitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchName: string;
  isPulling: boolean;
  onConfirm: () => void;
}

export function PullCommitModal({
  open,
  onOpenChange,
  branchName,
  isPulling,
  onConfirm,
}: PullCommitModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <GitMerge className="w-5 h-5 text-commit" />
            Pull Commit
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will finalize <span className="font-mono text-foreground">{branchName}</span> and merge it into main.
            <br /><br />
            <span className="text-warning text-sm">
              ⚠️ This action cannot be undone. Your progress will be scored and XP will be awarded.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-surface-2 border-border text-foreground hover:bg-surface-3"
            disabled={isPulling}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPulling}
            className="bg-commit text-primary-foreground hover:bg-commit/90 gap-2"
          >
            {isPulling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Pulling...
              </>
            ) : (
              <>
                <GitMerge className="w-4 h-4" />
                Pull Commit
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface PullSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchName: string;
  score: number;
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
}

export function PullSuccessModal({
  open,
  onOpenChange,
  branchName,
  score,
  xpEarned,
  leveledUp,
  newLevel,
}: PullSuccessModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              leveledUp 
                ? "bg-xp/20 animate-pulse" 
                : "bg-commit/20"
            )}>
              {leveledUp ? (
                <ArrowUp className="w-8 h-8 text-xp" />
              ) : (
                <GitMerge className="w-8 h-8 text-commit" />
              )}
            </div>
            {leveledUp && (
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-warning animate-pulse" />
            )}
          </div>
          
          <AlertDialogTitle className="text-foreground text-xl">
            {leveledUp ? 'Level Up!' : 'Commit Pulled!'}
          </AlertDialogTitle>
          
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-4">
              <p>
                <span className="font-mono text-foreground">{branchName}</span> has been merged.
              </p>
              
              {/* Stats */}
              <div className="flex justify-center gap-6 py-4">
                {/* Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-commit">{score}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
                </div>
                
                {/* XP Earned */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-xp" />
                    <span className="text-2xl font-bold text-xp">+{xpEarned}</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">XP Earned</div>
                </div>
                
                {/* New Level (if leveled up) */}
                {leveledUp && newLevel && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{newLevel}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">New Level</div>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="justify-center sm:justify-center">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-commit text-primary-foreground hover:bg-commit/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
