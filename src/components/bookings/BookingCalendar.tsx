import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import type { Booking } from '@/types';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { STATUS_STYLES, SESSION_TYPE_COLORS } from '@/lib/booking-helpers';
import { SESSION_TYPE_COLORS } from '@/lib/booking-helpers';

interface BookingCalendarProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export function BookingCalendar({
  bookings,
  onBookingClick,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getBookingsForDay(day: Date) {
    return bookings.filter((b) => isSameDay(new Date(b.date), day));
  }

  return (
    <div className='rounded-xl border border-border bg-card overflow-hidden'>
      {/* Calendar header */}
      <div className='flex items-center justify-between px-5 py-4 border-b border-border'>
        <h2 className='text-sm font-medium text-foreground'>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='w-7 h-7'
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs h-7 px-2'
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='w-7 h-7'
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className='grid grid-cols-7 border-b border-border'>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className='px-2 py-2 text-center text-xs font-medium text-muted-foreground'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className='grid grid-cols-7'>
        {days.map((day, idx) => {
          const dayBookings = getBookingsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                'min-h-24 p-1.5 border-b border-r border-border/50 flex flex-col gap-1',
                !isCurrentMonth && 'bg-muted/20',
                idx % 7 === 6 && 'border-r-0',
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  'text-xs w-6 h-6 flex items-center justify-center rounded-full self-start font-medium',
                  isTodayDate
                    ? 'bg-foreground text-background'
                    : isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/40',
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Bookings for this day */}
              <div className='flex flex-col gap-0.5'>
                {dayBookings.slice(0, 2).map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => onBookingClick(booking)}
                    className={cn(
                      'text-left text-xs px-1.5 py-0.5 rounded truncate w-full border transition-opacity hover:opacity-80',
                      SESSION_TYPE_COLORS[booking.sessionType] ??
                        SESSION_TYPE_COLORS['Other'],
                    )}
                  >
                    {booking.clientName.split(' ')[0]}
                    {booking.time && ` · ${booking.time}`}
                  </button>
                ))}
                {dayBookings.length > 2 && (
                  <span className='text-xs text-muted-foreground px-1'>
                    +{dayBookings.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
