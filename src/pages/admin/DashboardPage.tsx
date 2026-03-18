import { useAuth } from '@/hooks/useAuth';
import { mockStats } from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { UpcomingBookings } from '@/components/dashboard/UpcomingBookings';
import { RecentClients } from '@/components/dashboard/RecentClients';
import { DollarSign, CalendarDays, Users, Receipt } from 'lucide-react';

function pctChange(current: number, previous: number) {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Revenue this month',
      value: `$${mockStats.revenueMonth.toLocaleString()}`,
      change: pctChange(mockStats.revenueMonth, mockStats.revenueLastMonth),
      icon: <DollarSign className='w-4 h-4' />,
    },
    {
      label: 'Upcoming bookings',
      value: String(mockStats.upcomingBookings),
      subValue: 'Next 30 days',
      change: pctChange(
        mockStats.upcomingBookings,
        mockStats.upcomingBookingsLastMonth,
      ),
      icon: <CalendarDays className='w-4 h-4' />,
    },
    {
      label: 'Active clients',
      value: String(mockStats.activeClients),
      change: pctChange(
        mockStats.activeClients,
        mockStats.activeClientsLastMonth,
      ),
      icon: <Users className='w-4 h-4' />,
    },
    {
      label: 'Pending invoices',
      value: String(mockStats.pendingInvoices),
      subValue: `$${mockStats.pendingInvoicesAmount.toLocaleString()} outstanding`,
      change: 0,
      icon: <Receipt className='w-4 h-4' />,
    },
  ];

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
            Good {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Here's what's happening with your business.
          </p>
        </div>

        {/* Stat cards — 2 col on mobile, 4 on xl */}
        <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Revenue chart */}
        <RevenueChart />

        {/* Bottom two panels — stack on mobile */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <UpcomingBookings />
          <RecentClients />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
