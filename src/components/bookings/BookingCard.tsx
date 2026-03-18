import { format } from 'date-fns';
import type { Booking } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  DollarSign,
  Ban,
  Link,
  MapPin,
} from 'lucide-react';
import {
  STATUS_STYLES,
  STATUS_LABELS,
  SESSION_TYPE_COLORS,
} from '@/lib/booking-helpers';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onMarkDepositPaid: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onLinkShoot: (booking: Booking) => void;
}

export function BookingCard({
  booking,
  onEdit,
  onDelete,
  onMarkDepositPaid,
  onCancel,
  onLinkShoot,
}: BookingCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-border bg-card space-y-3',
        booking.status === 'cancelled' && 'opacity-60',
      )}
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-foreground truncate'>
            {booking.clientName}
          </p>
          <div className='flex items-center gap-2 mt-1 flex-wrap'>
            <Badge
              variant='outline'
              className={cn(
                'text-xs',
                SESSION_TYPE_COLORS[booking.sessionType] ??
                  SESSION_TYPE_COLORS['Other'],
              )}
            >
              {booking.sessionType}
            </Badge>
            <Badge
              variant='outline'
              className={cn(
                'text-xs capitalize',
                STATUS_STYLES[booking.status],
              )}
            >
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='w-8 h-8 text-muted-foreground shrink-0'
              >
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(booking)}>
                <Pencil className='w-4 h-4 mr-2' />
                Edit
              </DropdownMenuItem>
              {!booking.depositPaid && booking.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => onMarkDepositPaid(booking)}>
                  <DollarSign className='w-4 h-4 mr-2' />
                  Mark deposit paid
                </DropdownMenuItem>
              )}
              {!booking.shootId && booking.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => onLinkShoot(booking)}>
                  <Link className='w-4 h-4 mr-2' />
                  Link to shoot
                </DropdownMenuItem>
              )}
              {booking.status !== 'cancelled' &&
                booking.status !== 'completed' && (
                  <DropdownMenuItem
                    className='text-amber-600 focus:text-amber-600'
                    onClick={() => onCancel(booking)}
                  >
                    <Ban className='w-4 h-4 mr-2' />
                    Cancel booking
                  </DropdownMenuItem>
                )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => onDelete(booking)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Details */}
      <div className='flex items-center gap-4 text-xs text-muted-foreground flex-wrap'>
        <span>
          {format(new Date(booking.date), 'MMM d, yyyy')}
          {booking.time && ` · ${booking.time}`}
        </span>
        {booking.location && (
          <span className='flex items-center gap-1'>
            <MapPin className='w-3 h-3' />
            {booking.location}
          </span>
        )}
      </div>

      {/* Financial row */}
      <div className='flex items-center justify-between pt-2 border-t border-border'>
        <div className='flex items-center gap-3 text-xs'>
          <div className='flex items-center gap-1.5'>
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                booking.depositPaid ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            <span className='text-muted-foreground'>
              Deposit {booking.depositPaid ? 'paid' : 'due'}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                booking.contractSigned ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            <span className='text-muted-foreground'>
              Contract {booking.contractSigned ? 'signed' : 'pending'}
            </span>
          </div>
        </div>
        <span className='text-sm font-medium text-foreground'>
          ${booking.totalAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
