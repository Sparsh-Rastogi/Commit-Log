import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ContributionHeatmapProps {
  data: number[][];
}

const levelColors = [
  'bg-surface-2',
  'bg-commit-dim/50',
  'bg-commit-dim',
  'bg-commit/70',
  'bg-commit',
];

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const weeks = useMemo(() => data, [data]);

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex pl-8">
        <div className="flex gap-[3px] w-full">
          {monthLabels.map((month, i) => (
            <div 
              key={month} 
              className="text-[10px] text-muted-foreground"
              style={{ width: `${100 / 12}%` }}
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-2">
          {dayLabels.map((day, i) => (
            <div key={i} className="h-[10px] text-[9px] text-muted-foreground flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((level, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "w-[10px] h-[10px] rounded-sm transition-colors duration-200",
                    levelColors[level] || levelColors[0]
                  )}
                  title={`${level} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 pt-2">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className={cn("w-[10px] h-[10px] rounded-sm", color)}
          />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}
