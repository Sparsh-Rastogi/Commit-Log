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
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  /* ---------- State (ALWAYS declared) ---------- */
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [heatmap, setHeatmap] = useState<Map<string, number>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Effects ---------- */
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
        heatmapRes.forEach(d => map.set(d.day, d.total));
        setHeatmap(map);
      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tracker?.id, open]);

  /* ---------- Derived data ---------- */
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

  /* ---------- Guard AFTER hooks ---------- */
  if (!tracker) return null;

  /* ============================
     Render
  ============================ */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              {tracker.name} Analytics
            </div>
            <Button
              size="sm"
              className="gap-1 bg-commit text-background"
              onClick={() => onPushEntry?.(tracker.id, 1)}
            >
              <Plus className="w-4 h-4" />
              Push Entry
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-commit" />
              <span className="text-sm text-muted-foreground">Loading analytics...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <Stat label="Max" value={analytics?.max ?? 0} />
                <Stat label="Min" value={analytics?.min ?? 0} />
                <Stat label="Avg" value={Math.round(analytics?.avg ?? 0)} />
                <Stat label="Entries" value={entries.length} />
              </div>

              {/* Heatmap */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium mb-3">Activity (last year)</h3>
                <ContributionHeatmap
                  data={heatmapGrid}
                  interactive
                  onCellClick={date =>
                    setSelectedDate(date === selectedDate ? null : date)
                  }
                />

                {selectedDate && (
                  <div className="mt-3 flex justify-between items-center p-2 bg-surface-2 rounded">
                    <span className="font-mono text-sm">{selectedDate}</span>
                    <span className="font-mono font-bold text-commit">
                      {heatmap.get(selectedDate) ?? 0} total
                    </span>
                  </div>
                )}
              </div>

              {/* Entries */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium mb-3">Recent Entries</h3>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No entries yet. Push your first entry!
                  </p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                    {entries.slice(0, 30).map(e => (
                      <div key={e.id} className="flex justify-between text-sm py-1.5 px-2 hover:bg-surface-2 rounded">
                        <span className="font-mono text-muted-foreground">
                          {format(new Date(e.timestamp), "MMM d, yyyy HH:mm")}
                        </span>
                        <span className="font-mono font-medium">{e.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Current Streak" value={`${streaks.current} days`} />
                <Stat label="Longest Streak" value={`${streaks.longest} days`} />
              </div>

            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ============================
   Helper
============================ */
function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-3 border rounded-lg bg-surface-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-medium">{value}</div>
    </div>
  );
}
