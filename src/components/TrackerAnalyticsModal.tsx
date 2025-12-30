import { useEffect, useMemo, useState } from "react";
import { Tracker } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContributionHeatmap } from "./ContributionHeatmap";
import {
  BarChart3,
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Calendar,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/* ============================
   Types
============================ */
interface TrackerAnalyticsModalProps {
  tracker: Tracker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPushEntry?: (trackerId: number, value: number) => void;
}

interface Analytics {
  max: number | null;
  min: number | null;
  avg: number | null;
}

interface Entry {
  id: number;
  value: number;
  timestamp: string;
}

interface HeatmapPoint {
  day: string;
  total: number;
}

/* ============================
   Component
============================ */
export function TrackerAnalyticsModal({
  tracker,
  open,
  onOpenChange,
  onPushEntry,
}: TrackerAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [heatmap, setHeatmap] = useState<Map<string, number>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tracker || !open) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [analyticsRes, entriesRes, heatmapRes] = await Promise.all([
          apiFetch<Analytics>(`/trackers/${tracker.id}/analytics/`),
          apiFetch<Entry[]>(`/trackers/${tracker.id}/entries/`),
          apiFetch<HeatmapPoint[]>(`/trackers/${tracker.id}/heatmap/`),
        ]);

        setAnalytics(analyticsRes);
        setEntries(entriesRes);

        const map = new Map<string, number>();
        heatmapRes.forEach((d) => map.set(d.day, d.total));
        setHeatmap(map);
      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tracker?.id, open]);

  const heatmapGrid = useMemo(() => {
    if (!tracker) return [];

    const grid: number[][] = [];
    const now = new Date();

    for (let w = 51; w >= 0; w--) {
      const row: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split("T")[0];
        const value = heatmap.get(key) ?? 0;
        row.push(Math.min(Math.floor(value / 10), 4));
      }
      grid.push(row);
    }
    return grid;
  }, [tracker, heatmap]);

  const streaks = useMemo(() => {
    if (!tracker) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let temp = 0;

    const days = Array.from(heatmap.keys()).sort().reverse();
    let cursor = new Date();

    // current streak
    for (;;) {
      const key = cursor.toISOString().split("T")[0];
      if (heatmap.has(key)) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }

    // longest streak
    days.forEach((day, i) => {
      if (i === 0) temp = 1;
      else {
        const prev = new Date(days[i - 1]);
        const curr = new Date(day);
        const diff =
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) temp++;
        else {
          longest = Math.max(longest, temp);
          temp = 1;
        }
      }
    });

    longest = Math.max(longest, temp);
    return { current, longest };
  }, [tracker, heatmap]);

  if (!tracker) return null;

  /* ============================
      Render
  ============================ */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* make body scrollable within max height */}
      <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-commit/10">
                <BarChart3 className="w-5 h-5 text-commit" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{tracker.name}</h2>
                <p className="text-xs text-muted-foreground font-normal">
                  {tracker.mode} · {tracker.displayMode}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-commit hover:bg-commit/90"
              onClick={() => onPushEntry?.(tracker.id, 1)}
            >
              <Plus className="w-4 h-4" />
              Push Entry
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-commit" />
              <span className="text-sm text-muted-foreground">
                Loading analytics...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Maximum"
                  value={analytics?.max ?? 0}
                  color="text-commit"
                />
                <StatCard
                  icon={<TrendingDown className="w-4 h-4" />}
                  label="Minimum"
                  value={analytics?.min ?? 0}
                  color="text-muted-foreground"
                />
                <StatCard
                  icon={<Target className="w-4 h-4" />}
                  label="Average"
                  value={Math.round(analytics?.avg ?? 0)}
                  color="text-xp"
                />
                <StatCard
                  icon={<Calendar className="w-4 h-4" />}
                  label="Entries"
                  value={entries.length}
                  color="text-foreground"
                />
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border rounded-xl bg-gradient-to-br from-orange-500/5 to-transparent">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-medium">Current Streak</span>
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {streaks.current}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      days
                    </span>
                  </div>
                </div>
                <div className="p-4 border rounded-xl bg-gradient-to-br from-commit/5 to-transparent">
                  <div className="flex items-center gap-2 text-commit mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-medium">Longest Streak</span>
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {streaks.longest}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      days
                    </span>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="p-4 border rounded-xl">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Activity (last 52 weeks)
                </h3>
                <ContributionHeatmap
                  data={heatmapGrid}
                  interactive
                  onCellClick={(date) =>
                    setSelectedDate(date === selectedDate ? null : date)
                  }
                />

                {selectedDate && (
                  <div className="mt-4 flex justify-between items-center p-3 bg-surface-2 rounded-lg border">
                    <span className="font-mono text-sm">{selectedDate}</span>
                    <span className="font-mono font-bold text-commit">
                      {heatmap.get(selectedDate) ?? 0} total
                    </span>
                  </div>
                )}
              </div>

              {/* Recent Entries */}
              <div className="p-4 border rounded-xl">
                <h3 className="text-sm font-medium mb-3">Recent Entries</h3>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No entries yet. Push your first entry!
                  </p>
                ) : (
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {entries.slice(0, 50).map((e) => (
                      <div
                        key={e.id}
                        className="flex justify-between text-sm py-2 px-3 hover:bg-surface-2 rounded-lg transition-colors"
                      >
                        <span className="font-mono text-muted-foreground">
                          {format(
                            new Date(e.timestamp),
                            "MMM d, yyyy · HH:mm"
                          )}
                        </span>
                        <span className="font-mono font-semibold text-commit">
                          +{e.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ============================
   Helper Components
============================ */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="p-4 border rounded-xl bg-card">
      <div className={cn("flex items-center gap-2 mb-1", color)}>
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="font-mono text-xl font-bold">{value}</div>
    </div>
  );
}
