'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  resultCount?: number;
  totalCount?: number;
  debounceMs?: number;
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  resultCount,
  totalCount,
  debounceMs = 300
}: TableSearchProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <Input
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className='pr-8 pl-8'
        />
        {localValue && (
          <Button
            variant='ghost'
            size='sm'
            className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'
            onClick={handleClear}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>
      {resultCount !== undefined && totalCount !== undefined && (
        <div className='text-muted-foreground text-sm whitespace-nowrap'>
          {localValue
            ? `${resultCount} of ${totalCount} results`
            : `${totalCount} total`}
        </div>
      )}
    </div>
  );
}
