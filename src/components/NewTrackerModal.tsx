import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrackerMode, TrackerDisplay } from '@/domains/models/tracker';

interface NewTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTracker: (data: {
    name: string;
    mode: TrackerMode;
    displayMode: TrackerDisplay;
    weight: number;
    target?: number;
    threshold?: number;
  }) => void;
}

export function NewTrackerModal({ open, onOpenChange, onCreateTracker }: NewTrackerModalProps) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<TrackerMode>('sum');
  const [displayMode, setDisplayMode] = useState<TrackerDisplay>('sum');
  const [weight, setWeight] = useState(0);
  const [target, setTarget] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateTracker({
        name: name.trim(),
        mode,
        displayMode,
        weight,
        target: target ? parseInt(target) : undefined,
        threshold: threshold ? parseInt(threshold) : undefined,
      });
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName('');
    setMode('sum');
    setDisplayMode('sum');
    setWeight(0);
    setTarget('');
    setThreshold('');
  };

  const hasTarget = target && parseInt(target) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Tracker</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a tracker to monitor values over time. Set a target to contribute to commit progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Focus Time, Code Lines, Exercise"
              className="bg-surface-2 border-border focus:border-accent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as TrackerMode)}>
                <SelectTrigger className="bg-surface-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="sum">Sum (accumulate)</SelectItem>
                  <SelectItem value="value">Value (latest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Display</Label>
              <Select value={displayMode} onValueChange={(v) => setDisplayMode(v as TrackerDisplay)}>
                <SelectTrigger className="bg-surface-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="max">Max</SelectItem>
                  <SelectItem value="min">Min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target" className="text-foreground">Target (optional)</Label>
              <Input
                id="target"
                type="number"
                min={0}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 100"
                className="bg-surface-2 border-border focus:border-accent"
              />
              <p className="text-[10px] text-muted-foreground">
                Reach this to contribute to progress
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-foreground">Threshold (optional)</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g., 50"
                className="bg-surface-2 border-border focus:border-accent"
              />
              <p className="text-[10px] text-muted-foreground">
                Tracker dies when reached
              </p>
            </div>
          </div>

          {hasTarget && (
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground">Weight</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                max={10}
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                className="bg-surface-2 border-border focus:border-accent w-24"
              />
              <p className="text-xs text-muted-foreground">
                Contribution weight when target is reached (0-10)
              </p>
            </div>
          )}

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
              disabled={!name.trim()}
              className="bg-commit hover:bg-commit/90 text-background"
            >
              Create Tracker
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
