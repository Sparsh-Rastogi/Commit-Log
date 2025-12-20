import { Tracker } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContributionHeatmap } from './ContributionHeatmap';
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { trackerAnalytics, trackerHeatmap } from '@/domains/services/analytics.service';
import { trackerScore } from '@/domains/services/tracker.service';

interface TrackerAnalyticsModalProps {
  tracker: Tracker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackerAnalyticsModal({ tracker, open, onOpenChange }: TrackerAnalyticsModalProps) {
  // Calculate real analytics from domain service
  const analytics = useMemo(() => tracker ? trackerAnalytics(tracker) : null, [tracker]);
  const analytics7d = useMemo(() => tracker ? trackerAnalytics(tracker, 7) : null, [tracker]);
  const analytics30d = useMemo(() => tracker ? trackerAnalytics(tracker, 30) : null, [tracker]);
  const score = useMemo(() => tracker ? trackerScore(tracker) : 0, [tracker]);
  
  // Generate heatmap from actual entries
  const heatmapData = useMemo(() => {
    if (!tracker) return [];
    const heatmap = trackerHeatmap(tracker);
    
    // Convert Map to 52x7 grid for display
    const data: number[][] = [];
    const now = new Date();
    
    for (let week = 51; week >= 0; week--) {
      const weekData: number[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        const key = date.toISOString().split('T')[0];
        const value = heatmap.get(key) ?? 0;
        // Normalize to 0-4 scale for display
        const normalized = Math.min(Math.floor(value / 10), 4);
        weekData.push(normalized);
      }
      data.push(weekData);
    }
    
    return data;
  }, [tracker]);

  // Calculate trend (compare last 7 days to previous 7 days)
  const trend = useMemo(() => {
    if (!tracker) return 0;
    const recent = trackerAnalytics(tracker, 7);
    const previous = trackerAnalytics(tracker, 14);
    
    if (!recent || !previous) return 0;
    
    const recentAvg = recent.average;
    const previousAvg = previous.average;
    
    if (previousAvg === 0) return recentAvg > 0 ? 100 : 0;
    return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  }, [tracker]);

  // Calculate streaks
  const streaks = useMemo(() => {
    if (!tracker) return { current: 0, longest: 0 };
    
    const heatmap = trackerHeatmap(tracker);
    const dates = Array.from(heatmap.keys()).sort().reverse();
    
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    
    // Count current streak
    for (let i = 0; i < 365; i++) {
      const key = checkDate.toISOString().split('T')[0];
      if (heatmap.has(key)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Find longest streak
    dates.forEach((date, i) => {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(date);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      }
    });
    longest = Math.max(longest, tempStreak);
    
    return { current, longest };
  }, [tracker]);

  if (!tracker) return null;

  const contributesToScore = tracker.weight > 0 && tracker.target !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-accent" />
            {tracker.name} Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Maximum" value={analytics?.max ?? 0} />
            <StatCard label="Minimum" value={analytics?.min ?? 0} />
            <StatCard label="Average" value={Math.round(analytics?.average ?? 0)} />
            <StatCard 
              label="Trend (7d)" 
              value={`${trend > 0 ? '+' : ''}${trend}%`}
              icon={
                trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-commit" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )
              }
            />
          </div>

          {/* Score contribution (if applicable) */}
          {contributesToScore && (
            <div className="p-4 bg-commit/10 rounded-lg border border-commit/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Score Contribution
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-commit font-mono">
                      {score.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {tracker.weight} (weight)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Target Progress</div>
                  <div className="font-mono text-lg text-foreground">
                    {analytics?.sum ?? 0} / {tracker.target}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time-based analytics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Last 7 Days
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground font-mono">
                  {analytics7d?.sum ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                avg: {Math.round(analytics7d?.average ?? 0)}
              </div>
            </div>
            <div className="p-3 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Last 30 Days
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground font-mono">
                  {analytics30d?.sum ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                avg: {Math.round(analytics30d?.average ?? 0)}
              </div>
            </div>
            <div className="p-3 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                All Time
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground font-mono">
                  {analytics?.sum ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {tracker.entries.length} entries
              </div>
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="p-4 bg-surface-1 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Activity over the last year
            </h3>
            <ContributionHeatmap data={heatmapData} />
          </div>

          {/* Streak stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Current Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-mono">{streaks.current}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div className="p-4 bg-surface-1 rounded-lg border border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Longest Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-mono">{streaks.longest}</span>
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
