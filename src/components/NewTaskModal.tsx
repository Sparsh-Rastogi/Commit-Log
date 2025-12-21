import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, CalendarRange, Repeat, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, TaskTimeMode, RecurringType } from '@/domains/models/task';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'completed' | 'branchId'>) => void;
  editTask?: Task | null;
}

const AVAILABLE_MODIFIERS = [
  { id: 'priority', label: 'Priority', description: 'High importance task' },
  { id: 'streak', label: 'Streak', description: 'Maintain consistency' },
  { id: 'focus', label: 'Focus', description: 'Requires deep work' },
  { id: 'challenge', label: 'Challenge', description: 'Stretch goal' },
];

const TIME_MODES: { value: TaskTimeMode; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'none', label: 'No Date', icon: <X className="w-4 h-4" />, description: 'Always visible' },
  { value: 'scheduled', label: 'Scheduled', icon: <CalendarIcon className="w-4 h-4" />, description: 'Single date/time' },
  { value: 'period', label: 'Time Period', icon: <CalendarRange className="w-4 h-4" />, description: 'Start → End range' },
  { value: 'recurring', label: 'Recurring', icon: <Repeat className="w-4 h-4" />, description: 'Repeat schedule' },
];

export function NewTaskModal({ open, onOpenChange, onCreateTask, editTask }: NewTaskModalProps) {
  const [title, setTitle] = useState(editTask?.title ?? '');
  const [weight, setWeight] = useState(editTask?.weight ?? 1);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>(editTask?.modifiers ?? []);
  const [timeMode, setTimeMode] = useState<TaskTimeMode>(editTask?.timeMode ?? 'none');
  
  // Scheduled mode
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(editTask?.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(editTask?.scheduledTime ?? '');
  
  // Period mode
  const [startDate, setStartDate] = useState<Date | undefined>(editTask?.startDate);
  const [startTime, setStartTime] = useState(editTask?.startTime ?? '');
  const [endDate, setEndDate] = useState<Date | undefined>(editTask?.endDate);
  const [endTime, setEndTime] = useState(editTask?.endTime ?? '');
  
  // Recurring mode
  const [recurringType, setRecurringType] = useState<RecurringType>(editTask?.recurringType ?? 'days');
  const [recurringDays, setRecurringDays] = useState(editTask?.recurringDays ?? 1);

  const resetForm = () => {
    setTitle('');
    setWeight(1);
    setSelectedModifiers([]);
    setTimeMode('none');
    setScheduledDate(undefined);
    setScheduledTime('');
    setStartDate(undefined);
    setStartTime('');
    setEndDate(undefined);
    setEndTime('');
    setRecurringType('days');
    setRecurringDays(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask({
        title: title.trim(),
        weight,
        modifiers: selectedModifiers,
        timeMode,
        scheduledDate: timeMode === 'scheduled' ? scheduledDate : undefined,
        scheduledTime: timeMode === 'scheduled' ? scheduledTime : undefined,
        startDate: timeMode === 'period' ? startDate : undefined,
        startTime: timeMode === 'period' ? startTime : undefined,
        endDate: timeMode === 'period' ? endDate : undefined,
        endTime: timeMode === 'period' ? endTime : undefined,
        recurringType: timeMode === 'recurring' ? recurringType : undefined,
        recurringDays: timeMode === 'recurring' && recurringType === 'days' ? recurringDays : undefined,
      });
      resetForm();
      onOpenChange(false);
    }
  };

  const toggleModifier = (modifierId: string) => {
    setSelectedModifiers(prev =>
      prev.includes(modifierId)
        ? prev.filter(m => m !== modifierId)
        : [...prev, modifierId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a task that contributes to commit progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="bg-surface-2 border-border focus:border-accent"
              autoFocus
            />
          </div>

          {/* Time Mode Selector */}
          <div className="space-y-2">
            <Label className="text-foreground">Time Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setTimeMode(mode.value)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                    timeMode === mode.value
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-surface-2 text-muted-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded",
                    timeMode === mode.value ? "bg-accent/20 text-accent" : "bg-surface-1"
                  )}>
                    {mode.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{mode.label}</div>
                    <div className="text-[10px] text-muted-foreground">{mode.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Time Fields */}
          {timeMode === 'scheduled' && (
            <div className="space-y-3 p-3 bg-surface-1 rounded-lg border border-border">
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-surface-2 border-border",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs text-muted-foreground">Time (optional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="pl-9 bg-surface-2 border-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {timeMode === 'period' && (
            <div className="space-y-3 p-3 bg-surface-1 rounded-lg border border-border">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Start</Label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal bg-surface-2 border-border",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="relative w-28">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-9 bg-surface-2 border-border"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">End</Label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal bg-surface-2 border-border",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="relative w-28">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-9 bg-surface-2 border-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {timeMode === 'recurring' && (
            <div className="space-y-3 p-3 bg-surface-1 rounded-lg border border-border">
              <Select value={recurringType} onValueChange={(v) => setRecurringType(v as RecurringType)}>
                <SelectTrigger className="bg-surface-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Every N days</SelectItem>
                  <SelectItem value="weekend">Every weekend</SelectItem>
                </SelectContent>
              </Select>
              
              {recurringType === 'days' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Every</span>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={recurringDays}
                    onChange={(e) => setRecurringDays(parseInt(e.target.value) || 1)}
                    className="w-20 bg-surface-2 border-border"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              )}
            </div>
          )}

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-foreground">Weight</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
              className="bg-surface-2 border-border focus:border-accent w-24"
            />
            <p className="text-xs text-muted-foreground">
              Higher weight = greater contribution to progress (1-10)
            </p>
          </div>

          {/* Modifiers */}
          <div className="space-y-2">
            <Label className="text-foreground">Modifiers</Label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODIFIERS.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center gap-2 p-2 bg-surface-2 rounded border border-border/50 hover:border-accent/50 transition-colors"
                >
                  <Checkbox
                    id={mod.id}
                    checked={selectedModifiers.includes(mod.id)}
                    onCheckedChange={() => toggleModifier(mod.id)}
                    className="border-muted-foreground/50 data-[state=checked]:bg-commit data-[state=checked]:border-commit"
                  />
                  <label htmlFor={mod.id} className="text-xs cursor-pointer">
                    <span className="font-medium text-foreground">{mod.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-commit hover:bg-commit/90 text-background"
            >
              {editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
