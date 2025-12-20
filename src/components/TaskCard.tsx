import { Task } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Zap, Flame, Target, Star, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
}

const modifierIcons: Record<string, React.ReactNode> = {
  priority: <Zap className="w-3 h-3" />,
  streak: <Flame className="w-3 h-3" />,
  focus: <Target className="w-3 h-3" />,
  daily: <Clock className="w-3 h-3" />,
  challenge: <Star className="w-3 h-3" />,
  evening: <Clock className="w-3 h-3" />,
};

const modifierColors: Record<string, string> = {
  priority: 'bg-warning/20 text-warning border-warning/30',
  streak: 'bg-destructive/20 text-destructive border-destructive/30',
  focus: 'bg-accent/20 text-accent border-accent/30',
  daily: 'bg-commit/20 text-commit border-commit/30',
  challenge: 'bg-xp/20 text-xp border-xp/30',
  evening: 'bg-muted text-muted-foreground border-muted',
};

export function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <div 
      className={cn(
        "group p-4 bg-card border border-border rounded-lg transition-all duration-200",
        "hover:border-muted-foreground/30 hover:bg-card/80",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
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
          
          <div className="flex items-center gap-2 mt-2">
            {/* Weight indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-2 rounded text-[10px] font-mono text-muted-foreground">
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
      </div>
    </div>
  );
}
