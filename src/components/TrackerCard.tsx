import { Tracker } from '@/types';
import { cn } from '@/lib/utils';
import { Hash, TrendingUp, TrendingDown, Play, CheckCircle, Plus, BarChart3, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackerScore } from '@/domains/services/tracker.service';
import { trackerAnalytics } from '@/domains/services/analytics.service';
import { useMemo } from 'react';

interface TrackerCardProps {
  tracker: Tracker;
  onClick: () => void;
  onPushEntry?: (trackerId: number, value: number) => void;
  onDelete?: (trackerId: number) => void;
}

const displayModeIcons: Record<string, React.ReactNode> = {
  sum: <Hash className="w-3.5 h-3.5" />,
  average: <TrendingUp className="w-3.5 h-3.5" />,
  max: <TrendingUp className="w-3.5 h-3.5" />,
  min: <TrendingDown className="w-3.5 h-3.5" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <Play className="w-3 h-3" />,
  dead: <CheckCircle className="w-3 h-3" />,
};

const statusColors: Record<string, string> = {
  active: 'text-commit',
  dead: 'text-muted-foreground',
};

export function TrackerCard({ tracker, onClick, onPushEntry, onDelete }: TrackerCardProps) {
  // Calculate dynamic values from domain services
  const analytics = useMemo(() => trackerAnalytics(tracker), [tracker]);
  const score = useMemo(() => trackerScore(tracker), [tracker]);
  
  // Tracker contributes to score if it has weight > 0 and a target
  const contributesToScore = tracker.weight > 0 && tracker.target !== undefined;
  const progressPercent = tracker.target ? Math.min((analytics?.sum ?? 0) / tracker.target * 100, 100) : 0;

  // Get display value based on displayMode
  const displayValue = useMemo(() => {
    if (!analytics) return 0;
    switch (tracker.displayMode) {
      case 'sum': return analytics.sum;
      case 'max': return analytics.max;
      case 'min': return analytics.min;
      case 'average': return Math.round(analytics.average);
      default: return analytics.sum;
    }
  }, [analytics, tracker.displayMode]);

  function formatValue(value: number): string {
    if (tracker.displayMode === 'sum' && tracker.name.toLowerCase().includes('time')) {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return value.toString();
  }

  const handlePushEntry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
    const value = parseFloat(input?.value || '0');
    if (value > 0 && onPushEntry) {
      onPushEntry(tracker.id, value);
      input.value = '';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(tracker.id);
    }
  };

  return (
    <div
      className={cn(
        "w-full p-3 bg-card border border-border rounded-lg transition-all duration-200",
        "hover:border-accent/50 hover:bg-card/80",
        tracker.status === 'dead' && "opacity-60"
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
            {!contributesToScore && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-surface-3 text-muted-foreground rounded">
                <BarChart3 className="w-2.5 h-2.5" />
                analytics
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatValue(displayValue)}
            </span>
            <div className={cn("flex items-center", statusColors[tracker.status])}>
              {statusIcons[tracker.status]}
            </div>
          </div>
        </div>
      </button>

      {/* Progress bar for trackers with targets */}
      {tracker.target && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress: {analytics?.sum ?? 0} / {tracker.target}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-commit to-commit/70 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Threshold warning for threshold trackers */}
      {tracker.threshold && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-warning mb-1">
            <span>Threshold: {analytics?.sum ?? 0} / {tracker.threshold}</span>
            <span className="text-muted-foreground">dies at limit</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-warning to-destructive rounded-full transition-all duration-500"
              style={{ width: `${Math.min((analytics?.sum ?? 0) / tracker.threshold * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Score contribution indicator */}
      {contributesToScore && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono">Score contribution:</span>
          <span className="font-mono font-semibold text-commit">
            {score.toFixed(2)} / {tracker.weight}
          </span>
        </div>
      )}

      {/* Push Entry Action */}
      {tracker.status === 'active' && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="value"
              className="h-7 w-20 text-xs font-mono bg-surface-2 border-border/50 focus:border-accent"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-commit hover:bg-commit/10"
              onClick={handlePushEntry}
            >
              <Plus className="w-3.5 h-3.5" />
              Push Entry
            </Button>
            <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono">
              {tracker.entries.length} entries
            </span>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">
            {tracker.mode}:{tracker.displayMode}
          </span>
          {contributesToScore && (
            <span className="text-[10px] font-mono uppercase text-commit/70 bg-commit/10 px-1.5 py-0.5 rounded">
              weight: {tracker.weight}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
