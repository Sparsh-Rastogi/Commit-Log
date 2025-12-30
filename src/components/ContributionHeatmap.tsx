import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HeatmapCell {
  date: string;
  value: number;
  level: number;
}

interface ContributionHeatmapProps {
  data: number[][];
  onCellClick?: (date: string, value: number) => void;
  interactive?: boolean;
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

export function ContributionHeatmap({ data, onCellClick, interactive = false }: ContributionHeatmapProps) {
  const weeks = useMemo(() => data, [data]);

  // Generate dates for each cell
  const cellDates = useMemo(() => {
    const dates: string[][] = [];
    const now = new Date();
    
    for (let week = 51; week >= 0; week--) {
      const weekDates: string[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        weekDates.push(date.toISOString().split('T')[0]);
      }
      dates.push(weekDates);
    }
    
    return dates;
  }, []);

  return (
    <div className="space-y-1">
      {/* Month labels */}
      <div className="flex pl-6">
        <div className="flex gap-[2px] w-full">
          {monthLabels.map((month, i) => (
            <div 
              key={month} 
              className="text-[12px] text-muted-foreground"
              style={{ width: `${100 / 12}%` }}
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-[5px] pr-1">
          {dayLabels.map((day, i) => (
            <div key={i} className="h-[8px] text-[12px] text-muted-foreground flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[2px] flex-1 overflow-x-auto scrollbar-thin">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((level, dayIndex) => {
                const dateKey = cellDates[weekIndex]?.[dayIndex] || '';
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => interactive && onCellClick?.(dateKey, level)}
                    className={cn(
                      "w-[15px] h-[12px] rounded-[2px] transition-all duration-200",
                      levelColors[level] || levelColors[0],
                      interactive && "cursor-pointer hover:ring-2 hover:ring-accent hover:ring-offset-1 hover:ring-offset-background"
                    )}
                    title={`${dateKey}: ${level} contributions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-0.5 pt-1">
        <span className="text-[8px] text-muted-foreground mr-0.5">Less</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className={cn("w-[8px] h-[8px] rounded-[2px]", color)}
          />
        ))}
        <span className="text-[8px] text-muted-foreground ml-0.5">More</span>
      </div>
    </div>
  );
}
