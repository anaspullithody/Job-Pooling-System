'use client';

import { useMemo } from 'react';

interface BarChartProps {
  data: Array<{ date: string; Jobs: number }>;
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.Jobs), 1),
    [data]
  );

  return (
    <div className='h-72 w-full'>
      <div className='flex h-full items-end justify-between gap-1'>
        {data.map((item, index) => {
          const heightPercent = (item.Jobs / maxValue) * 100;

          return (
            <div
              key={index}
              className='group relative flex flex-1 flex-col items-center justify-end'
            >
              {/* Tooltip */}
              <div className='bg-popover text-popover-foreground pointer-events-none absolute bottom-full mb-2 hidden rounded px-2 py-1 text-xs whitespace-nowrap shadow-md group-hover:block'>
                <div className='font-medium'>{item.date}</div>
                <div className='text-muted-foreground'>
                  {item.Jobs} job{item.Jobs !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Bar */}
              <div
                className='bg-primary hover:bg-primary/80 w-full rounded-t transition-all'
                style={{ height: `${heightPercent}%` }}
              />

              {/* Date Label */}
              {index % 5 === 0 && (
                <div className='text-muted-foreground absolute -bottom-6 text-xs'>
                  {item.date}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
