import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GitCommit } from 'lucide-react';

interface NewCommitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCommit: (name: string, description: string) => void;
}

export function NewCommitModal({ open, onOpenChange, onCreateCommit }: NewCommitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateCommit(name.trim(), description.trim());
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <GitCommit className="w-5 h-5 text-commit" />
            New Commit
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new commitment branch to organize your tasks and trackers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="commit-name" className="text-sm text-foreground">
              Branch Name
            </Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm font-mono mr-1">feature/</span>
              <Input
                id="commit-name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="my-commitment"
                className="flex-1 bg-input border-border font-mono text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commit-description" className="text-sm text-foreground">
              Description
            </Label>
            <Textarea
              id="commit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you committing to?"
              className="bg-input border-border resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="commit"
              disabled={!name.trim()}
            >
              <GitCommit className="w-4 h-4" />
              Create Commit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
