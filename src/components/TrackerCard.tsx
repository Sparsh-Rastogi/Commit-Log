import { Tracker } from '@/types';
import { cn } from '@/lib/utils';
import { Hash, TrendingUp, Timer, Play, Pause, CheckCircle, Plus, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TrackerCardProps {
  tracker: Tracker;
  onClick: () => void;
}

const displayModeIcons: Record<string, React.ReactNode> = {
  counter: <Hash className="w-3.5 h-3.5" />,
  progress: <TrendingUp className="w-3.5 h-3.5" />,
  timer: <Timer className="w-3.5 h-3.5" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <Play className="w-3 h-3" />,
  paused: <Pause className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
};

const statusColors: Record<string, string> = {
  active: 'text-commit',
  paused: 'text-warning',
  completed: 'text-muted-foreground',
};

function formatValue(value: number, displayMode: string): string {
  if (displayMode === 'timer') {
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  if (displayMode === 'progress') {
    return `${value}%`;
  }
  return value.toString();
}

export function TrackerCard({ tracker, onClick }: TrackerCardProps) {
  // Determine if this tracker contributes to score or is analytics-only
  const isAnalyticsOnly = tracker.displayMode === 'timer';

  return (
    <div
      className={cn(
        "w-full p-3 bg-card border border-border rounded-lg transition-all duration-200",
        "hover:border-accent/50 hover:bg-card/80"
      )}
    >
      {/* Header row - clickable for analytics */}
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-background rounded"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded bg-surface-2 text-muted-foreground">
              {displayModeIcons[tracker.displayMode]}
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {tracker.name}
            </span>
            {isAnalyticsOnly && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-surface-3 text-muted-foreground rounded">
                <BarChart3 className="w-2.5 h-2.5" />
                analytics
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatValue(tracker.value, tracker.displayMode)}
            </span>
            <div className={cn("flex items-center", statusColors[tracker.status])}>
              {statusIcons[tracker.status]}
            </div>
          </div>
        </div>
      </button>

      {/* Progress bar for progress type */}
      {tracker.displayMode === 'progress' && (
        <div className="mt-2 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-commit to-commit/70 rounded-full transition-all duration-500"
            style={{ width: `${tracker.value}%` }}
          />
        </div>
      )}

      {/* Push Entry Action */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={tracker.displayMode === 'timer' ? 'mins' : 'value'}
            className="h-7 w-20 text-xs font-mono bg-surface-2 border-border/50 focus:border-accent"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-commit hover:bg-commit/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus className="w-3.5 h-3.5" />
            Push Entry
          </Button>
          <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono">
            append-only
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">
          {tracker.displayMode}
        </span>
        {!isAnalyticsOnly && (
          <span className="text-[10px] font-mono uppercase text-commit/70 bg-commit/10 px-1.5 py-0.5 rounded">
            scores
          </span>
        )}
      </div>
    </div>
  );
}
