import { Tracker } from "@/types";
import { cn } from "@/lib/utils";
import {
  Hash,
  TrendingUp,
  TrendingDown,
  Play,
  CheckCircle,
  Plus,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface TrackerCardProps {
  tracker: Tracker;
  onClick: () => void;
  onPushEntry?: (trackerId: number, value: number) => void;
  onDelete?: (trackerId: number) => void;
}

interface Analytics {
  max: number | null;
  min: number | null;
  avg: number | null;
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
  active: "text-commit",
  dead: "text-muted-foreground",
};

export function TrackerCard({
  tracker,
  onClick,
  onPushEntry,
  onDelete,
}: TrackerCardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  /* =========================
  Fetch analytics from backend
  ========================= */
  useEffect(() => {
    let mounted = true;
    
    const fetchAnalytics = async () => {
      const [a, entries] = await Promise.all([
        apiFetch<Analytics>(`/trackers/${tracker.id}/analytics/`),
        apiFetch<any[]>(`/trackers/${tracker.id}/entries/`),
      ]);
      
      if (!mounted) return;
      setAnalytics(a);
      setEntryCount(entries.length);
    };
    
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [tracker.id]);
  
  console.log(analytics?? "No analytics", tracker.name);
  const displayValue = (() => {
    if (!analytics) return 0;
    switch (tracker.displayMode) {
      case "sum":
        return analytics.max ?? 0; // backend handles SUM logic
      case "max":
        return analytics.max ?? 0;
      case "min":
        return analytics.min ?? 0;
      case "average":
        return Math.round(analytics.avg ?? 0);
      default:
        return 0;
    }
  })();

  const contributesToScore =
    tracker.weight > 0 && tracker.target !== undefined;

  const progressPercent =
    tracker.target && analytics
      ? Math.min((analytics.max ?? 0) / tracker.target * 100, 100)
      : 0;

  const handlePush = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = e.currentTarget
      .parentElement?.querySelector("input") as HTMLInputElement;
    const value = Number(input?.value || 0);
    if (value > 0) {
      onPushEntry?.(tracker.id, value);
      input.value = "";
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(tracker.id);
  };
  console.log(tracker);
  return (
    <div
      className={cn(
        "p-3 bg-card border rounded-lg transition-all",
        "hover:border-accent/50 hover:bg-card/80",
        tracker.status === "dead" && "opacity-60"
      )}
    >
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full text-left rounded focus:outline-none"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-surface-2">
              {displayModeIcons[tracker.displayMode]}
            </div>
            <span className="text-sm font-medium truncate">
              {tracker.name}
            </span>
            {!contributesToScore && (
              <span className="text-[9px] uppercase bg-surface-3 px-1.5 rounded">
                <BarChart3 className="w-2.5 h-2.5 inline" /> analytics
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">
              {displayValue}
            </span>
            <div className={statusColors[tracker.status]}>
              {statusIcons[tracker.status]}
            </div>
          </div>
        </div>
      </button>

      {/* Target progress */}
      {tracker.target && analytics && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              Progress: {analytics.max ?? 0} / {tracker.target}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded">
            <div
              className="h-full bg-commit rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Push entry */}
      {tracker.status === "active" && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="value"
              className="h-7 w-20 text-xs font-mono"
              onClick={e => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePush}
              className="gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Push
            </Button>
            <span className="ml-auto text-[10px] font-mono">
              {entryCount} entries
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase text-muted-foreground">
          {tracker.mode}:{tracker.displayMode}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-6 w-6 p-0 hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
