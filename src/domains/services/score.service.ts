import { Task } from '../models/task';
import { Tracker } from '../models/tracker';
import { trackerScore } from './tracker.service';

export function branchScore(
  tasks: Task[],
  trackers: Tracker[]
): number {
  const taskWeight = tasks.reduce((a, t) => a + t.weight, 0);
  const completedWeight = tasks
    .filter(t => t.completed)
    .reduce((a, t) => a + t.weight, 0);

  const trackerWeight = trackers.reduce((a, t) => a + t.weight, 0);
  const trackerContribution = trackers.reduce(
    (a, t) => a + trackerScore(t),
    0
  );

  const totalWeight = taskWeight + trackerWeight;
  if (totalWeight === 0) return 0;

  return (completedWeight + trackerContribution) / totalWeight;
}
