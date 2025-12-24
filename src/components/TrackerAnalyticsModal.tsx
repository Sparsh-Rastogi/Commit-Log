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
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Plus,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

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

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (!tracker || !open) return;

    const fetchData = async () => {
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
              <h3 className="text-sm mb-3">Activity (last year)</h3>
              <ContributionHeatmap
                data={heatmapGrid}
                interactive
                onCellClick={date =>
                  setSelectedDate(date === selectedDate ? null : date)
                }
              />

              {selectedDate && (
                <div className="mt-3 flex justify-between">
                  <span className="font-mono text-sm">{selectedDate}</span>
                  <span className="font-mono font-bold text-commit">
                    {heatmap.get(selectedDate) ?? 0}
                  </span>
                </div>
              )}
            </div>

            {/* Entries */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm mb-3">Recent Entries</h3>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries</p>
              ) : (
                entries.slice(0, 30).map(e => (
                  <div key={e.id} className="flex justify-between text-sm py-1">
                    <span className="font-mono">
                      {format(new Date(e.timestamp), "MMM d, yyyy")}
                    </span>
                    <span className="font-mono">{e.value}</span>
                  </div>
                ))
              )}
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Current Streak" value={`${streaks.current} days`} />
              <Stat label="Longest Streak" value={`${streaks.longest} days`} />
            </div>

          </div>
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
    <div className="p-3 border rounded-lg">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}
