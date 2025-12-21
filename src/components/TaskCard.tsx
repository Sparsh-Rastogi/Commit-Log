import { useState, useMemo } from 'react';
import { Task } from '@/domains/models/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  Zap, Flame, Target, Star, Clock, CalendarIcon, CalendarRange, 
  Repeat, MoreHorizontal, ArrowRight, CalendarDays, X 
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture, addDays, startOfDay } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onPostpone?: (id: string, newDate: Date) => void;
  onRemoveDate?: (id: string) => void;
}

const modifierIcons: Record<string, React.ReactNode> = {
  priority: <Zap className="w-3 h-3" />,
  streak: <Flame className="w-3 h-3" />,
  focus: <Target className="w-3 h-3" />,
  challenge: <Star className="w-3 h-3" />,
};

const modifierColors: Record<string, string> = {
  priority: 'bg-warning/20 text-warning border-warning/30',
  streak: 'bg-destructive/20 text-destructive border-destructive/30',
  focus: 'bg-accent/20 text-accent border-accent/30',
  challenge: 'bg-xp/20 text-xp border-xp/30',
};

type TaskVisualState = 'today' | 'upcoming' | 'overdue' | 'none';

function getTaskVisualState(task: Task): TaskVisualState {
  if (task.timeMode === 'none') return 'none';
  
  const now = startOfDay(new Date());
  let targetDate: Date | undefined;
  
  if (task.timeMode === 'scheduled' && task.scheduledDate) {
    targetDate = startOfDay(new Date(task.scheduledDate));
  } else if (task.timeMode === 'period' && task.startDate) {
    targetDate = startOfDay(new Date(task.startDate));
  }
  
  if (!targetDate) return 'none';
  
  if (isToday(targetDate)) return 'today';
  if (isPast(targetDate) && !task.completed) return 'overdue';
  if (isFuture(targetDate)) return 'upcoming';
  
  return 'none';
}

function getDateLabel(task: Task): string | null {
  if (task.timeMode === 'none') return null;
  
  if (task.timeMode === 'scheduled' && task.scheduledDate) {
    const date = new Date(task.scheduledDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  }
  
  if (task.timeMode === 'period' && task.startDate && task.endDate) {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    return `${format(start, 'MMM d')} → ${format(end, 'MMM d')}`;
  }
  
  if (task.timeMode === 'recurring') {
    if (task.recurringType === 'weekend') return 'Every weekend';
    if (task.recurringDays) return `Every ${task.recurringDays} days`;
  }
  
  return null;
}

function getTimeModeIcon(task: Task): React.ReactNode {
  switch (task.timeMode) {
    case 'scheduled': return <CalendarIcon className="w-3 h-3" />;
    case 'period': return <CalendarRange className="w-3 h-3" />;
    case 'recurring': return <Repeat className="w-3 h-3" />;
    default: return null;
  }
}

const stateStyles: Record<TaskVisualState, string> = {
  today: 'border-l-2 border-l-commit bg-commit/5',
  upcoming: 'border-l-2 border-l-accent/50',
  overdue: 'border-l-2 border-l-destructive bg-destructive/5',
  none: '',
};

export function TaskCard({ task, onToggle, onPostpone, onRemoveDate }: TaskCardProps) {
  const [showPostActions, setShowPostActions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const visualState = useMemo(() => getTaskVisualState(task), [task]);
  const dateLabel = useMemo(() => getDateLabel(task), [task]);
  const timeModeIcon = useMemo(() => getTimeModeIcon(task), [task]);

  const handleToggle = () => {
    onToggle(task.id);
    if (!task.completed && task.timeMode !== 'none') {
      setShowPostActions(true);
    }
  };

  const handlePostpone = (date: Date) => {
    onPostpone?.(task.id, date);
    setShowPostActions(false);
    setShowDatePicker(false);
  };

  const getNextWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    return addDays(today, daysUntilSaturday);
  };

  return (
    <div 
      className={cn(
        "group p-4 bg-card border border-border rounded-lg transition-all duration-200",
        "hover:border-muted-foreground/30 hover:bg-card/80",
        task.completed && "opacity-60",
        stateStyles[visualState]
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className={cn(
            "mt-0.5 border-muted-foreground/50 data-[state=checked]:bg-commit data-[state=checked]:border-commit",
          )}
        />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium text-foreground transition-all",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          
          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Date/Time badge */}
            {dateLabel && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium",
                visualState === 'overdue' 
                  ? 'bg-destructive/20 text-destructive border-destructive/30'
                  : visualState === 'today'
                  ? 'bg-commit/20 text-commit border-commit/30'
                  : 'bg-surface-2 text-muted-foreground border-border'
              )}>
                {timeModeIcon}
                <span>{dateLabel}</span>
                {task.scheduledTime && (
                  <span className="opacity-70">@ {task.scheduledTime}</span>
                )}
              </div>
            )}

            {/* Weight indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-2 rounded text-[10px] font-mono text-muted-foreground border border-border/50">
              <span className="opacity-60">wt:</span>
              <span>{task.weight}</span>
            </div>

            {/* Modifiers */}
            {task.modifiers.map((mod) => (
              <div
                key={mod}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium uppercase",
                  modifierColors[mod] || 'bg-muted text-muted-foreground border-muted'
                )}
              >
                {modifierIcons[mod]}
                <span>{mod}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-completion actions */}
        {task.completed && showPostActions && task.timeMode !== 'none' && (
          <Popover open={showPostActions} onOpenChange={setShowPostActions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-medium">
                Post-completion
              </div>
              <button
                onClick={() => setShowPostActions(false)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-surface-2 rounded transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-commit/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-commit" />
                </div>
                Done
              </button>
              <button
                onClick={() => handlePostpone(addDays(new Date(), 1))}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-surface-2 rounded transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                Postpone → Tomorrow
              </button>
              <button
                onClick={() => handlePostpone(getNextWeekend())}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-surface-2 rounded transition-colors"
              >
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                Postpone → Weekend
              </button>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-surface-2 rounded transition-colors">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    Postpone → Pick date
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" side="left">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => date && handlePostpone(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <button
                onClick={() => {
                  onRemoveDate?.(task.id);
                  setShowPostActions(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-surface-2 rounded transition-colors"
              >
                <X className="w-4 h-4" />
                Remove date
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
