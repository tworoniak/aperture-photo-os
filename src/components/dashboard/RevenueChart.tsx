import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
// import type { TooltipProps } from 'recharts';
import type {
  //   NameType,
  //   ValueType,
  Payload,
} from 'recharts/types/component/DefaultTooltipContent';
import { mockRevenueChart } from '@/lib/mock-data';

interface TooltipData {
  active?: boolean;
  label?: string;
  payload?: Payload<number, string>[];
}

function CustomTooltip({ active, payload, label }: TooltipData) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-lg border border-border bg-white dark:bg-zinc-950 px-3 py-2 shadow-sm'>
      <p className='text-xs text-muted-foreground mb-0.5'>{label}</p>
      <p className='text-sm font-semibold text-foreground'>
        ${Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
}

export function RevenueChart() {
  return (
    <div className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-medium text-foreground'>
          Revenue (6 months)
        </h2>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Monthly gross revenue
        </p>
      </div>
      <div className='h-48'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={mockRevenueChart}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id='revenueGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='hsl(var(--foreground))'
                  stopOpacity={0.1}
                />
                <stop
                  offset='95%'
                  stopColor='hsl(var(--foreground))'
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='hsl(var(--border))'
              vertical={false}
            />
            <XAxis
              dataKey='month'
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='hsl(var(--foreground))'
              strokeWidth={1.5}
              fill='url(#revenueGrad)'
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--foreground))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
