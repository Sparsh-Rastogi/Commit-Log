import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (title: string, weight: number, modifiers: string[]) => void;
}

const AVAILABLE_MODIFIERS = [
  { id: 'priority', label: 'Priority', description: 'High importance task' },
  { id: 'streak', label: 'Streak', description: 'Maintain consistency' },
  { id: 'focus', label: 'Focus', description: 'Requires deep work' },
  { id: 'daily', label: 'Daily', description: 'Recurring daily task' },
  { id: 'challenge', label: 'Challenge', description: 'Stretch goal' },
];

export function NewTaskModal({ open, onOpenChange, onCreateTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim(), weight, selectedModifiers);
      setTitle('');
      setWeight(1);
      setSelectedModifiers([]);
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a task that contributes to commit progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
