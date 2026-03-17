import { format } from 'date-fns';
import { mockUpcomingBookings } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function UpcomingBookings() {
  return (
    <div className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-medium text-foreground'>
            Upcoming bookings
          </h2>
          <p className='text-xs text-muted-foreground mt-0.5'>Next 30 days</p>
        </div>
        <a
          href='/bookings'
          className='text-xs text-muted-foreground hover:text-foreground transition-colors'
        >
          View all
        </a>
      </div>

      <div className='flex flex-col divide-y divide-border'>
        {mockUpcomingBookings.map((booking) => (
          <div
            key={booking.id}
            className='flex items-center gap-4 py-3 first:pt-0 last:pb-0'
          >
            {/* Date block */}
            <div className='w-10 shrink-0 text-center'>
              <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                {format(new Date(booking.date), 'MMM')}
              </p>
              <p className='text-lg font-semibold leading-tight text-foreground'>
                {format(new Date(booking.date), 'd')}
              </p>
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-foreground truncate'>
                {booking.clientName}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {booking.sessionType}
                {booking.location ? ` · ${booking.location}` : ''}
              </p>
            </div>

            {/* Right side */}
            <div className='flex flex-col items-end gap-1 shrink-0'>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs capitalize',
                  statusStyles[booking.status],
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
    </div>
  );
}
