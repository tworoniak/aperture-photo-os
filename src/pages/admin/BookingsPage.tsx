import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { mockBookings } from '@/lib/mock-bookings';
import { mockShoots } from '@/lib/mock-shoots';
import type { Booking } from '@/types';
import type { BookingFormValues } from '@/lib/schemas/booking-schema';
import { BookingDialog } from '@/components/bookings/BookingDialog';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { BookingList } from '@/components/bookings/BookingList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Search, CalendarDays, LayoutList } from 'lucide-react';

type StatusFilter = 'all' | Booking['status'];
type ViewMode = 'calendar' | 'list';

function newId() {
  return `b${Date.now()}`;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addOpen, setAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [linkBooking, setLinkBooking] = useState<Booking | null>(null);

  // ─── Derived ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          b.sessionType.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }
    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const upcoming = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'pending',
    );
    const revenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const pendingDeposits = bookings.filter(
      (b) => !b.depositPaid && b.status !== 'cancelled',
    ).length;
    return { upcoming: upcoming.length, revenue, pendingDeposits };
  }, [bookings]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleAdd(values: BookingFormValues) {
    const newBooking: Booking = { ...values, id: newId() };
    setBookings((prev) => [newBooking, ...prev]);
    setAddOpen(false);
    toast.success(`Booking for ${values.clientName} added`);
  }

  function handleEdit(values: BookingFormValues) {
    if (!editBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === editBooking.id ? { ...b, ...values } : b)),
    );
    setEditBooking(null);
    toast.success('Booking updated');
  }

  function handleDelete() {
    if (!deleteBooking) return;
    setBookings((prev) => prev.filter((b) => b.id !== deleteBooking.id));
    toast.success('Booking deleted');
    setDeleteBooking(null);
  }

  function handleMarkDepositPaid(booking: Booking) {
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, depositPaid: true } : b)),
    );
    toast.success(`Deposit marked as paid for ${booking.clientName}`);
  }

  function handleCancel(booking: Booking) {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: 'cancelled' } : b,
      ),
    );
    toast.warning(`${booking.clientName}'s booking cancelled`);
  }

  function handleLinkShoot(shootId: string) {
    if (!linkBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === linkBooking.id ? { ...b, shootId } : b)),
    );
    const shoot = mockShoots.find((s) => s.id === shootId);
    toast.success(`Linked to ${shoot?.title ?? 'shoot'}`);
    setLinkBooking(null);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              Bookings
            </h1>
            <p className='text-muted-foreground mt-1'>
              {stats.upcoming} upcoming
              {stats.pendingDeposits > 0 && (
                <span className='text-amber-500 ml-2'>
                  · {stats.pendingDeposits} deposit
                  {stats.pendingDeposits !== 1 ? 's' : ''} pending
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            New booking
          </Button>
        </div>

        {/* Filters + view toggle */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search bookings…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All bookings</SelectItem>
              <SelectItem value='confirmed'>Confirmed</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className='flex rounded-md border border-border overflow-hidden shrink-0'>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
                viewMode === 'list'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutList className='w-3.5 h-3.5' />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs border-l border-border transition-colors',
                viewMode === 'calendar'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <CalendarDays className='w-3.5 h-3.5' />
              Calendar
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <BookingCalendar
            bookings={filtered}
            onBookingClick={setEditBooking}
          />
        ) : (
          <BookingList
            bookings={filtered}
            onEdit={setEditBooking}
            onDelete={setDeleteBooking}
            onMarkDepositPaid={handleMarkDepositPaid}
            onCancel={handleCancel}
            onLinkShoot={setLinkBooking}
          />
        )}

        {viewMode === 'list' && filtered.length > 0 && (
          <p className='text-xs text-muted-foreground text-right'>
            Showing {filtered.length} of {bookings.length} bookings
          </p>
        )}
      </div>

      {/* Add dialog */}
      <BookingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      <BookingDialog
        open={!!editBooking}
        onOpenChange={(open) => {
          if (!open) setEditBooking(null);
        }}
        booking={editBooking}
        onSubmit={handleEdit}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteBooking}
        onOpenChange={(open) => {
          if (!open) setDeleteBooking(null);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the booking for{' '}
              <span className='font-medium text-foreground'>
                {deleteBooking?.clientName}
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setDeleteBooking(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to shoot dialog */}
      <Dialog
        open={!!linkBooking}
        onOpenChange={(open) => {
          if (!open) setLinkBooking(null);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Link to shoot</DialogTitle>
            <DialogDescription>
              Select a shoot planner to link to this booking.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2 py-2'>
            {mockShoots
              .filter((s) => !s.isStandalone)
              .map((shoot) => (
                <button
                  key={shoot.id}
                  onClick={() => handleLinkShoot(shoot.id)}
                  className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left'
                >
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {shoot.title}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {shoot.date}
                    </p>
                  </div>
                </button>
              ))}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setLinkBooking(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
