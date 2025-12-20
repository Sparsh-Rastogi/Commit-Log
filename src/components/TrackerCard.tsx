import { Tracker } from '@/types';
import { cn } from '@/lib/utils';
import { Hash, TrendingUp, Timer, Play, Pause, CheckCircle } from 'lucide-react';

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
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 bg-card border border-border rounded-lg transition-all duration-200 text-left",
        "hover:border-accent/50 hover:bg-card/80 hover:shadow-md hover:shadow-accent/5",
        "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-background"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded bg-surface-2 text-muted-foreground">
            {displayModeIcons[tracker.displayMode]}
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {tracker.name}
          </span>
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

      {/* Progress bar for progress type */}
      {tracker.displayMode === 'progress' && (
        <div className="mt-2 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-commit to-commit/70 rounded-full transition-all duration-500"
            style={{ width: `${tracker.value}%` }}
          />
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">
          {tracker.displayMode}
        </span>
      </div>
    </button>
  );
}
