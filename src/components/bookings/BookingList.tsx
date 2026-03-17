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
  //   FileCheck,
  Link,
  Ban,
} from 'lucide-react';
import {
  STATUS_STYLES,
  STATUS_LABELS,
  SESSION_TYPE_COLORS,
} from '@/lib/booking-helpers';

interface BookingListProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onMarkDepositPaid: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onLinkShoot: (booking: Booking) => void;
}

export function BookingList({
  bookings,
  onEdit,
  onDelete,
  onMarkDepositPaid,
  onCancel,
  onLinkShoot,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className='rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-center'>
        <p className='text-sm font-medium text-foreground'>No bookings found</p>
        <p className='text-xs text-muted-foreground mt-1'>
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-border bg-card overflow-hidden'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-border bg-muted/30'>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
              Client
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell'>
              Session
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
              Date
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
              Status
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell'>
              Deposit
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell'>
              Contract
            </th>
            <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
              Total
            </th>
            <th className='px-4 py-3 w-10' />
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className={cn(
                'hover:bg-muted/30 transition-colors',
                booking.status === 'cancelled' && 'opacity-60',
              )}
            >
              {/* Client + location */}
              <td className='px-4 py-3'>
                <p className='text-sm font-medium text-foreground'>
                  {booking.clientName}
                </p>
                {booking.location && (
                  <p className='text-xs text-muted-foreground truncate max-w-40'>
                    {booking.location}
                  </p>
                )}
              </td>

              {/* Session type */}
              <td className='px-4 py-3 hidden sm:table-cell'>
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
              </td>

              {/* Date + time */}
              <td className='px-4 py-3 hidden md:table-cell'>
                <p className='text-sm text-foreground'>
                  {format(new Date(booking.date), 'MMM d, yyyy')}
                </p>
                {booking.time && (
                  <p className='text-xs text-muted-foreground'>
                    {booking.time}
                  </p>
                )}
              </td>

              {/* Status */}
              <td className='px-4 py-3 hidden md:table-cell'>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs capitalize',
                    STATUS_STYLES[booking.status],
                  )}
                >
                  {STATUS_LABELS[booking.status]}
                </Badge>
              </td>

              {/* Deposit */}
              <td className='px-4 py-3 hidden lg:table-cell'>
                <div className='flex items-center gap-1.5'>
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      booking.depositPaid ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                  />
                  <span className='text-xs text-muted-foreground'>
                    {booking.depositPaid
                      ? `$${booking.depositAmount.toLocaleString()} paid`
                      : `$${booking.depositAmount.toLocaleString()} due`}
                  </span>
                </div>
              </td>

              {/* Contract */}
              <td className='px-4 py-3 hidden lg:table-cell'>
                <div className='flex items-center gap-1.5'>
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      booking.contractSigned
                        ? 'bg-emerald-500'
                        : 'bg-amber-500',
                    )}
                  />
                  <span className='text-xs text-muted-foreground'>
                    {booking.contractSigned ? 'Signed' : 'Pending'}
                  </span>
                </div>
              </td>

              {/* Total */}
              <td className='px-4 py-3 hidden md:table-cell'>
                <span className='text-sm text-foreground'>
                  ${booking.totalAmount.toLocaleString()}
                </span>
              </td>

              {/* Actions */}
              <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-8 h-8 text-muted-foreground'
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
                      <DropdownMenuItem
                        onClick={() => onMarkDepositPaid(booking)}
                      >
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
