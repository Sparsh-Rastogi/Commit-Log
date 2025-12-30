import { Tracker } from "@/types";
import { cn } from "@/lib/utils";
import {
  Hash,
  TrendingUp,
  TrendingDown,
  Play,
  Plus,
  BarChart3,
  Trash2,
  AlertCircle,
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
  sum: <Hash className="w-4 h-4" />,
  average: <TrendingUp className="w-4 h-4" />,
  max: <TrendingUp className="w-4 h-4" />,
  min: <TrendingDown className="w-4 h-4" />,
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
    console.log(analytics);
    return analytics.max ?? 0;
    console.log(tracker);
    if(tracker.target_type=="VALUE"){
      return analytics.max??0;
    }
    else{
      return analytics.avg??0;
    }
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
  const currentProgress = analytics?.max ?? 0;
  const target = tracker.target ?? 0;
  const progressPercent = target > 0 ? Math.min((currentProgress / target) * 100, 100) : 0;
  const isAtLimit = progressPercent >= 100;

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
        "group p-4 bg-card border border-border rounded-xl transition-all duration-200",
        "hover:border-commit/40 hover:shadow-lg hover:shadow-commit/5",
        tracker.status === "dead" && "opacity-60"
      )}
    >
      {/* Header: Name + Value */}
      <button
        onClick={onClick}
        className="w-full text-left rounded focus:outline-none focus:ring-2 focus:ring-commit/30"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-muted-foreground">
              {displayModeIcons[tracker.displayMode]}
            </span>
            <span className="text-sm font-semibold truncate">
              {tracker.name}
            </span>
            {!contributesToScore && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 text-muted-foreground border-muted-foreground/30">
                <BarChart3 className="w-2.5 h-2.5" />
                ANALYTICS
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="font-mono text-2xl font-bold text-commit">
                {displayValue}
              </span>
            )}
            <Play className="w-4 h-4 text-commit fill-commit" />
          </div>
        </div>
      </button>

      {/* Progress bar */}
      {tracker.target && (
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-muted-foreground">
              {contributesToScore ? "Progress:" : "Threshold:"} {currentProgress} / {target}
            </span>
            <span className={cn(
              "font-mono text-xs",
              isAtLimit ? "text-destructive" : "text-muted-foreground"
            )}>
              {isAtLimit ? (contributesToScore ? "100%" : "dies at limit") : `${Math.round(progressPercent)}%`}
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isAtLimit 
                  ? (contributesToScore ? "bg-commit" : "bg-destructive") 
                  : "bg-commit"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Score contribution */}
      {contributesToScore && (
        <div className="mt-2 text-xs text-muted-foreground">
          Score contribution: <span className="text-xp font-mono">{(tracker.weight / (totalWeight || 1)).toFixed(2)}</span> / {tracker.weight}
        </div>
      )}

      {/* Push entry section */}
      {tracker.status === "active" && (
        <div className="mt-4 flex items-center gap-2">
          <Input
            type="number"
            placeholder="value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8 w-20 text-sm font-mono bg-surface-2 border-border"
            onClick={e => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePush}
            className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
            Push Entry
          </Button>
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {entryCount} entries
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Footer badges */}
      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono uppercase bg-surface-2 text-muted-foreground">
          {tracker.mode}:{tracker.displayMode}
        </Badge>
        {tracker.weight > 0 && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono uppercase bg-surface-2">
            <span className="text-muted-foreground">WEIGHT:</span>
            <span className="text-xp ml-1">{tracker.weight}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
