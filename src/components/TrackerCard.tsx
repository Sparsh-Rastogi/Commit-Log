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
  Loader2,
  AlertCircle,
  Target,
  Percent,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TrackerCardProps {
  tracker: Tracker;
  totalWeight: number;
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

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  active: { 
    icon: <Play className="w-3 h-3" />, 
    color: "text-commit",
    bg: "bg-commit/10"
  },
  dead: { 
    icon: <CheckCircle className="w-3 h-3" />, 
    color: "text-muted-foreground",
    bg: "bg-muted/20"
  },
};

export function TrackerCard({
  tracker,
  totalWeight,
  onClick,
  onPushEntry,
  onDelete,
}: TrackerCardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  /* =========================
  Fetch analytics from backend
  ========================= */
  useEffect(() => {
    let mounted = true;
    
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [a, entries] = await Promise.all([
          apiFetch<Analytics>(`/trackers/${tracker.id}/analytics/`),
          apiFetch<any[]>(`/trackers/${tracker.id}/entries/`),
        ]);
        
        if (!mounted) return;
        setAnalytics(a);
        setEntryCount(entries.length);
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [tracker.id]);

  const displayValue = (() => {
    if (!analytics) return 0;
    switch (tracker.displayMode) {
      case "sum":
        return analytics.max ?? 0;
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

  const contributesToScore = tracker.weight > 0 && tracker.target !== undefined;
  const weightPercent = totalWeight > 0 ? Math.round((tracker.weight / totalWeight) * 100) : 0;

  const progressPercent =
    tracker.target && analytics
      ? Math.min((analytics.max ?? 0) / tracker.target * 100, 100)
      : 0;

  const handlePush = (e: React.MouseEvent) => {
    e.stopPropagation();
    const value = Number(inputValue || 0);
    if (value > 0) {
      onPushEntry?.(tracker.id, value);
      setInputValue("");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(tracker.id);
  };

  const status = statusConfig[tracker.status] || statusConfig.active;

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-card border border-destructive/30 rounded-xl">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{tracker.name}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group p-4 bg-card border rounded-xl transition-all duration-200",
        "hover:border-commit/40 hover:shadow-lg hover:shadow-commit/5",
        tracker.status === "dead" && "opacity-60"
      )}
    >
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full text-left rounded focus:outline-none focus:ring-2 focus:ring-commit/30"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              status.bg
            )}>
              {displayModeIcons[tracker.displayMode]}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold truncate block">
                {tracker.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", status.color)}>
                  {status.icon}
                  <span className="ml-1">{tracker.status}</span>
                </Badge>
                {contributesToScore && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                    <Percent className="w-2.5 h-2.5" />
                    {weightPercent}% weight
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="font-mono text-xl font-bold text-commit">
                {displayValue}
              </div>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">
              {entryCount} entries
            </span>
          </div>
        </div>
      </button>

      {/* Target progress */}
      {tracker.target && analytics && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Target: {tracker.target}
            </span>
            <span className={cn(
              "font-mono font-medium",
              progressPercent >= 100 ? "text-commit" : "text-foreground"
            )}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercent >= 100 
                  ? "bg-gradient-to-r from-commit to-xp" 
                  : "bg-commit/70"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Push entry */}
      {tracker.status === "active" && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-8 w-20 text-sm font-mono text-center"
              onClick={e => e.stopPropagation()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePush}
              className="gap-1.5 h-8 text-xs hover:bg-commit hover:text-background hover:border-commit"
            >
              <Plus className="w-3.5 h-3.5" />
              Push
            </Button>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer mode label */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-muted-foreground/70">
          {tracker.mode} · {tracker.displayMode}
        </span>
        {!contributesToScore && (
          <span className="text-[9px] uppercase bg-surface-2 px-2 py-0.5 rounded flex items-center gap-1">
            <BarChart3 className="w-2.5 h-2.5" />
            analytics only
          </span>
        )}
      </div>
    </div>
  );
}