import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change: number; // percentage change vs last period
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  change,
  icon,
  className,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 flex flex-col gap-4',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>{label}</span>
        <span className='text-muted-foreground/60'>{icon}</span>
      </div>

      <div>
        <p className='text-2xl font-semibold tracking-tight text-foreground'>
          {value}
        </p>
        {subValue && (
          <p className='text-sm text-muted-foreground mt-0.5'>{subValue}</p>
        )}
      </div>

      <div className='flex items-center gap-1.5'>
        {isPositive ? (
          <TrendingUp className='w-3.5 h-3.5 text-emerald-500' />
        ) : (
          <TrendingDown className='w-3.5 h-3.5 text-red-500' />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            isPositive ? 'text-emerald-500' : 'text-red-500',
          )}
        >
          {isPositive ? '+' : ''}
          {change}%
        </span>
        <span className='text-xs text-muted-foreground'>vs last month</span>
      </div>
    </div>
  );
}
