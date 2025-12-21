import { Tracker } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContributionHeatmap } from './ContributionHeatmap';
import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Plus, X } from 'lucide-react';
import { trackerAnalytics, trackerHeatmap } from '@/domains/services/analytics.service';
import { trackerScore } from '@/domains/services/tracker.service';
import { format } from 'date-fns';

interface TrackerAnalyticsModalProps {
  tracker: Tracker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPushEntry?: (trackerId: string, value: number) => void;
}

export function TrackerAnalyticsModal({ tracker, open, onOpenChange, onPushEntry }: TrackerAnalyticsModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calculate real analytics from domain service
  const analytics = useMemo(() => tracker ? trackerAnalytics(tracker) : null, [tracker]);
  const analytics7d = useMemo(() => tracker ? trackerAnalytics(tracker, 7) : null, [tracker]);
  const analytics30d = useMemo(() => tracker ? trackerAnalytics(tracker, 30) : null, [tracker]);
  const score = useMemo(() => tracker ? trackerScore(tracker) : 0, [tracker]);
  
  // Get raw heatmap data (date → value)
  const rawHeatmap = useMemo(() => tracker ? trackerHeatmap(tracker) : new Map<string, number>(), [tracker]);
  
  // Generate heatmap from actual entries
  const heatmapData = useMemo(() => {
    if (!tracker) return [];
    const heatmap = rawHeatmap;
    
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
  }, [tracker, rawHeatmap]);

  // Entries list sorted by date
  const entriesList = useMemo(() => {
    if (!tracker) return [];
    const entries = Array.from(rawHeatmap.entries())
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 50); // Limit to last 50 entries
    return entries;
  }, [tracker, rawHeatmap]);

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

  const handleCellClick = (date: string, value: number) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  if (!tracker) return null;

  const contributesToScore = tracker.weight > 0 && tracker.target !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              {tracker.name} Analytics
            </div>
            <Button
              onClick={() => onPushEntry?.(tracker.id, 1)}
              className="bg-commit hover:bg-commit/90 text-background gap-1"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Push Entry
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
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
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  (click a cell to view details)
                </span>
              </h3>
              <ContributionHeatmap 
                data={heatmapData} 
                onCellClick={handleCellClick}
                interactive
              />
              
              {/* Selected date detail */}
              {selectedDate && (
                <div className="mt-4 p-3 bg-surface-2 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Selected: </span>
                    <span className="font-mono text-sm text-foreground">{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-commit">
                      {rawHeatmap.get(selectedDate) ?? 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Entries List */}
            <div className="p-4 bg-surface-1 rounded-lg border border-border">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Recent Entries
              </h3>
              {entriesList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {entriesList.map(([date, value]) => (
                    <div 
                      key={date}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-2 transition-colors"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {format(new Date(date), 'MMM d, yyyy')}
                      </span>
                      <span className="font-mono text-sm font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
        </ScrollArea>
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
