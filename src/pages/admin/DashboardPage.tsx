import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import {
  fetchDashboardStats,
  fetchRevenueChart,
  fetchUpcomingBookings,
  fetchRecentClients,
  type DashboardStats,
  type RevenueChartPoint,
  type UpcomingBooking,
  type RecentClient,
} from '@/lib/db/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DollarSign, CalendarDays, Users, Receipt } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Status styles ────────────────────────────────────────────────────────────

const bookingStatusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const clientStatusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  lead: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  past: 'bg-muted text-muted-foreground border-border',
};

// ─── Chart tooltip ────────────────────────────────────────────────────────────

interface TooltipData {
  active?: boolean;
  label?: string;
  payload?: Payload<number, string>[];
}

function CustomTooltip({ active, payload, label }: TooltipData) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-lg border border-border bg-background px-3 py-2 shadow-sm'>
      <p className='text-xs text-muted-foreground mb-0.5'>{label}</p>
      <p className='text-sm font-semibold text-foreground'>
        ${Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
}

// ─── Loading skeletons ────────────────────────────────────────────────────────

function StatsSkeletons() {
  return (
    <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className='h-32 w-full rounded-xl' />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>(
    [],
  );
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetchDashboardStats(supabase, user.id),
      fetchRevenueChart(supabase, user.id),
      fetchUpcomingBookings(supabase, user.id),
      fetchRecentClients(supabase, user.id),
    ])
      .then(([statsData, chart, bookings, clients]) => {
        setStats(statsData);
        setChartData(chart);
        setUpcomingBookings(bookings);
        setRecentClients(clients);
      })
      .catch((err) => toast.error('Failed to load dashboard: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase]);

  const statCards = stats
    ? [
        {
          label: 'Revenue this month',
          value: `$${stats.revenueMonth.toLocaleString()}`,
          change: pctChange(stats.revenueMonth, stats.revenueLastMonth),
          icon: <DollarSign className='w-4 h-4' />,
        },
        {
          label: 'Upcoming bookings',
          value: String(stats.upcomingBookings),
          subValue: 'Next 30 days',
          change: pctChange(
            stats.upcomingBookings,
            stats.upcomingBookingsLastMonth,
          ),
          icon: <CalendarDays className='w-4 h-4' />,
        },
        {
          label: 'Active clients',
          value: String(stats.activeClients),
          change: pctChange(stats.activeClients, stats.activeClientsLastMonth),
          icon: <Users className='w-4 h-4' />,
        },
        {
          label: 'Pending invoices',
          value: String(stats.pendingInvoices),
          subValue: `$${stats.pendingInvoicesAmount.toLocaleString()} outstanding`,
          change: 0,
          icon: <Receipt className='w-4 h-4' />,
        },
      ]
    : [];

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
            Good {getGreeting()},{' '}
            {user?.firstName ?? user?.fullName?.split(' ')[0] ?? 'there'}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Here's what's happening with your business.
          </p>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <StatsSkeletons />
        ) : (
          <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        )}

        {/* Revenue chart */}
        <div className='rounded-xl border border-border bg-card p-5'>
          <div className='mb-4'>
            <h2 className='text-sm font-medium text-foreground'>
              Revenue (6 months)
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Monthly completed bookings
            </p>
          </div>
          {isLoading ? (
            <Skeleton className='h-48 w-full' />
          ) : (
            <div className='h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='revenueGrad'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
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
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
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
          )}
        </div>

        {/* Bottom panels */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Upcoming bookings */}
          <div className='rounded-xl border border-border bg-card p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-sm font-medium text-foreground'>
                  Upcoming bookings
                </h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Next 30 days
                </p>
              </div>
              <a
                href='/bookings'
                className='text-xs text-muted-foreground hover:text-foreground transition-colors'
              >
                View all
              </a>
            </div>
            {isLoading ? (
              <div className='space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className='h-14 w-full' />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                No upcoming bookings
              </p>
            ) : (
              <div className='flex flex-col divide-y divide-border'>
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className='flex items-center gap-4 py-3 first:pt-0 last:pb-0'
                  >
                    <div className='w-10 shrink-0 text-center'>
                      <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                        {format(new Date(booking.date), 'MMM')}
                      </p>
                      <p className='text-lg font-semibold leading-tight text-foreground'>
                        {format(new Date(booking.date), 'd')}
                      </p>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {booking.clientName}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {booking.sessionType}
                        {booking.location ? ` · ${booking.location}` : ''}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-xs capitalize',
                          bookingStatusStyles[booking.status] ?? '',
                        )}
                      >
                        {booking.status}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        ${booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent clients */}
          <div className='rounded-xl border border-border bg-card p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-sm font-medium text-foreground'>
                  Recent clients
                </h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Latest activity
                </p>
              </div>
              <a
                href='/clients'
                className='text-xs text-muted-foreground hover:text-foreground transition-colors'
              >
                View all
              </a>
            </div>
            {isLoading ? (
              <div className='space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className='h-14 w-full' />
                ))}
              </div>
            ) : recentClients.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                No clients yet
              </p>
            ) : (
              <div className='flex flex-col divide-y divide-border'>
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'
                  >
                    <Avatar className='w-8 h-8 shrink-0'>
                      <AvatarFallback className='text-xs bg-muted text-muted-foreground'>
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {client.name}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {client.email}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-xs capitalize',
                          clientStatusStyles[client.status] ?? '',
                        )}
                      >
                        {client.status}
                      </Badge>
                      {client.totalRevenue > 0 && (
                        <span className='text-xs text-muted-foreground'>
                          ${client.totalRevenue.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
