import { Tracker } from '@/frontend/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContributionHeatmap } from './ContributionHeatmap';
import { generateHeatmapData } from '@/frontend/data/mockData';
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface TrackerAnalyticsModalProps {
  tracker: Tracker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackerAnalyticsModal({ tracker, open, onOpenChange }: TrackerAnalyticsModalProps) {
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  if (!tracker) return null;

  // Mock stats
  const stats = {
    max: Math.round(tracker.value * 1.4),
    min: Math.round(tracker.value * 0.3),
    avg: Math.round(tracker.value * 0.85),
    trend: 12, // percentage
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-accent" />
            {tracker.name} Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Maximum" value={stats.max} />
            <StatCard label="Minimum" value={stats.min} />
            <StatCard label="Average" value={stats.avg} />
            <StatCard 
              label="Trend" 
              value={`${stats.trend > 0 ? '+' : ''}${stats.trend}%`}
              icon={
                stats.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-commit" />
                ) : stats.trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )
              }
            />
          </div>

          {/* Contribution Graph */}
          <div className="p-4 bg-surface-1 rounded-lg border border-border overflow-hidden">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Activity over the last year
            </h3>
            <div className="overflow-x-auto">
              <ContributionHeatmap data={heatmapData} />
            </div>
          </div>

          {/* Additional placeholder stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Current Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-mono">7</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div className="p-4 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Longest Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-mono">23</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-surface-1 rounded-lg border border-border">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xl font-bold text-foreground font-mono">
          {value}
        </span>
        {icon}
      </div>
    </div>
  );
}
