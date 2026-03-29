// import { useState, useMemo } from 'react';
// import { toast } from 'sonner';
// import { mockBookings } from '@/lib/mock-bookings';
// import { mockShoots } from '@/lib/mock-shoots';
// import type { Booking } from '@/types';
// import type { BookingFormValues } from '@/lib/schemas/booking-schema';
// import { BookingDialog } from '@/components/bookings/BookingDialog';
// import { BookingCalendar } from '@/components/bookings/BookingCalendar';
// import { BookingList } from '@/components/bookings/BookingList';
// import { BookingCard } from '@/components/bookings/BookingCard';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { cn } from '@/lib/utils';
// import { Plus, Search, CalendarDays, LayoutList } from 'lucide-react';

// type StatusFilter = 'all' | Booking['status'];
// type ViewMode = 'calendar' | 'list';

// function newId() {
//   return `b${crypto.randomUUID()}`;
// }

// export function BookingsPage() {
//   const [bookings, setBookings] = useState<Booking[]>(mockBookings);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
//   const [viewMode, setViewMode] = useState<ViewMode>('list');
//   const [addOpen, setAddOpen] = useState(false);
//   const [editBooking, setEditBooking] = useState<Booking | null>(null);
//   const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
//   const [linkBooking, setLinkBooking] = useState<Booking | null>(null);

//   const filtered = useMemo(() => {
//     let list = [...bookings];
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (b) =>
//           b.clientName.toLowerCase().includes(q) ||
//           b.sessionType.toLowerCase().includes(q) ||
//           b.location?.toLowerCase().includes(q),
//       );
//     }
//     if (statusFilter !== 'all')
//       list = list.filter((b) => b.status === statusFilter);
//     list.sort((a, b) => a.date.localeCompare(b.date));
//     return list;
//   }, [bookings, search, statusFilter]);

//   const stats = useMemo(() => {
//     const upcoming = bookings.filter(
//       (b) => b.status === 'confirmed' || b.status === 'pending',
//     );
//     const pendingDeposits = bookings.filter(
//       (b) => !b.depositPaid && b.status !== 'cancelled',
//     ).length;
//     return { upcoming: upcoming.length, pendingDeposits };
//   }, [bookings]);

//   function handleAdd(values: BookingFormValues) {
//     setBookings((prev) => [{ ...values, id: newId() }, ...prev]);
//     setAddOpen(false);
//     toast.success(`Booking for ${values.clientName} added`);
//   }

//   function handleEdit(values: BookingFormValues) {
//     if (!editBooking) return;
//     setBookings((prev) =>
//       prev.map((b) => (b.id === editBooking.id ? { ...b, ...values } : b)),
//     );
//     setEditBooking(null);
//     toast.success('Booking updated');
//   }

//   function handleDelete() {
//     if (!deleteBooking) return;
//     setBookings((prev) => prev.filter((b) => b.id !== deleteBooking.id));
//     toast.success('Booking deleted');
//     setDeleteBooking(null);
//   }

//   function handleMarkDepositPaid(booking: Booking) {
//     setBookings((prev) =>
//       prev.map((b) => (b.id === booking.id ? { ...b, depositPaid: true } : b)),
//     );
//     toast.success(`Deposit marked as paid for ${booking.clientName}`);
//   }

//   function handleCancel(booking: Booking) {
//     setBookings((prev) =>
//       prev.map((b) =>
//         b.id === booking.id ? { ...b, status: 'cancelled' } : b,
//       ),
//     );
//     toast.warning(`${booking.clientName}'s booking cancelled`);
//   }

//   function handleLinkShoot(shootId: string) {
//     if (!linkBooking) return;
//     setBookings((prev) =>
//       prev.map((b) => (b.id === linkBooking.id ? { ...b, shootId } : b)),
//     );
//     const shoot = mockShoots.find((s) => s.id === shootId);
//     toast.success(`Linked to ${shoot?.title ?? 'shoot'}`);
//     setLinkBooking(null);
//   }

//   return (
//     <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
//       <div className='max-w-6xl mx-auto space-y-5'>
//         {/* Header */}
//         <div className='flex items-start justify-between gap-4'>
//           <div>
//             <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
//               Bookings
//             </h1>
//             <p className='text-muted-foreground mt-1 text-sm'>
//               {stats.upcoming} upcoming
//               {stats.pendingDeposits > 0 && (
//                 <span className='text-amber-500 ml-2'>
//                   · {stats.pendingDeposits} deposit
//                   {stats.pendingDeposits !== 1 ? 's' : ''} pending
//                 </span>
//               )}
//             </p>
//           </div>
//           <Button
//             onClick={() => setAddOpen(true)}
//             size='sm'
//             className='sm:size-default'
//           >
//             <Plus className='w-4 h-4 sm:mr-2' />
//             <span className='hidden sm:inline'>New booking</span>
//           </Button>
//         </div>

//         {/* Filters */}
//         <div className='flex flex-col sm:flex-row gap-3'>
//           <div className='relative flex-1'>
//             <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
//             <Input
//               placeholder='Search bookings…'
//               className='pl-9'
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <div className='flex gap-2'>
//             <Select
//               value={statusFilter}
//               onValueChange={(v) => setStatusFilter(v as StatusFilter)}
//             >
//               <SelectTrigger className='w-36'>
//                 <SelectValue placeholder='Status' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value='all'>All bookings</SelectItem>
//                 <SelectItem value='confirmed'>Confirmed</SelectItem>
//                 <SelectItem value='pending'>Pending</SelectItem>
//                 <SelectItem value='completed'>Completed</SelectItem>
//                 <SelectItem value='cancelled'>Cancelled</SelectItem>
//               </SelectContent>
//             </Select>
//             {/* View toggle — desktop only */}
//             <div className='hidden sm:flex rounded-md border border-border overflow-hidden shrink-0'>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={cn(
//                   'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
//                   viewMode === 'list'
//                     ? 'bg-accent text-accent-foreground'
//                     : 'text-muted-foreground hover:text-foreground',
//                 )}
//               >
//                 <LayoutList className='w-3.5 h-3.5' />
//                 List
//               </button>
//               <button
//                 onClick={() => setViewMode('calendar')}
//                 className={cn(
//                   'flex items-center gap-1.5 px-3 py-2 text-xs border-l border-border transition-colors',
//                   viewMode === 'calendar'
//                     ? 'bg-accent text-accent-foreground'
//                     : 'text-muted-foreground hover:text-foreground',
//                 )}
//               >
//                 <CalendarDays className='w-3.5 h-3.5' />
//                 Calendar
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile: card list (always) */}
//         <div className='sm:hidden space-y-3'>
//           {filtered.length === 0 ? (
//             <div className='rounded-xl border border-border flex flex-col items-center justify-center py-16 text-center'>
//               <p className='text-sm font-medium text-foreground'>
//                 No bookings found
//               </p>
//             </div>
//           ) : (
//             filtered.map((booking) => (
//               <BookingCard
//                 key={booking.id}
//                 booking={booking}
//                 onEdit={setEditBooking}
//                 onDelete={setDeleteBooking}
//                 onMarkDepositPaid={handleMarkDepositPaid}
//                 onCancel={handleCancel}
//                 onLinkShoot={setLinkBooking}
//               />
//             ))
//           )}
//         </div>

//         {/* Desktop: calendar or table */}
//         <div className='hidden sm:block'>
//           {viewMode === 'calendar' ? (
//             <BookingCalendar
//               bookings={filtered}
//               onBookingClick={setEditBooking}
//             />
//           ) : (
//             <BookingList
//               bookings={filtered}
//               onEdit={setEditBooking}
//               onDelete={setDeleteBooking}
//               onMarkDepositPaid={handleMarkDepositPaid}
//               onCancel={handleCancel}
//               onLinkShoot={setLinkBooking}
//             />
//           )}
//         </div>

//         {filtered.length > 0 && (
//           <p className='text-xs text-muted-foreground text-right'>
//             Showing {filtered.length} of {bookings.length} bookings
//           </p>
//         )}
//       </div>

//       <BookingDialog
//         open={addOpen}
//         onOpenChange={setAddOpen}
//         onSubmit={handleAdd}
//       />
//       <BookingDialog
//         open={!!editBooking}
//         onOpenChange={(open) => {
//           if (!open) setEditBooking(null);
//         }}
//         booking={editBooking}
//         onSubmit={handleEdit}
//       />

//       <Dialog
//         open={!!deleteBooking}
//         onOpenChange={(open) => {
//           if (!open) setDeleteBooking(null);
//         }}
//       >
//         <DialogContent className='sm:max-w-sm'>
//           <DialogHeader>
//             <DialogTitle>Delete booking</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete the booking for{' '}
//               <span className='font-medium text-foreground'>
//                 {deleteBooking?.clientName}
//               </span>
//               ?
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className='gap-2'>
//             <Button variant='outline' onClick={() => setDeleteBooking(null)}>
//               Cancel
//             </Button>
//             <Button variant='destructive' onClick={handleDelete}>
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog
//         open={!!linkBooking}
//         onOpenChange={(open) => {
//           if (!open) setLinkBooking(null);
//         }}
//       >
//         <DialogContent className='sm:max-w-sm'>
//           <DialogHeader>
//             <DialogTitle>Link to shoot</DialogTitle>
//             <DialogDescription>
//               Select a shoot planner to link to this booking.
//             </DialogDescription>
//           </DialogHeader>
//           <div className='space-y-2 py-2'>
//             {mockShoots
//               .filter((s) => !s.isStandalone)
//               .map((shoot) => (
//                 <button
//                   key={shoot.id}
//                   onClick={() => handleLinkShoot(shoot.id)}
//                   className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left'
//                 >
//                   <div>
//                     <p className='text-sm font-medium text-foreground'>
//                       {shoot.title}
//                     </p>
//                     <p className='text-xs text-muted-foreground'>
//                       {shoot.date}
//                     </p>
//                   </div>
//                 </button>
//               ))}
//           </div>
//           <DialogFooter>
//             <Button variant='outline' onClick={() => setLinkBooking(null)}>
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  fetchBookings,
  insertBooking,
  updateBooking,
  deleteBooking,
  markDepositPaid,
  cancelBooking,
  linkBookingToShoot,
} from '@/lib/db/bookings';
import type { Booking } from '@/types';
import type { BookingFormValues } from '@/lib/schemas/booking-schema';
import { BookingDialog } from '@/components/bookings/BookingDialog';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { BookingList } from '@/components/bookings/BookingList';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Search, CalendarDays, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/constants';

type StatusFilter = 'all' | Booking['status'];
type ViewMode = 'calendar' | 'list';

function LoadingSkeleton() {
  return (
    <div className='space-y-2'>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className='h-24 w-full rounded-xl' />
      ))}
    </div>
  );
}

export function BookingsPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [addOpen, setAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [deleteBooking_, setDeleteBooking] = useState<Booking | null>(null);
  const [linkBooking, setLinkBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [shoots, setShoots] = useState<
    { id: string; title: string; date: string }[]
  >([]);

  // ─── Fetch bookings ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetchBookings(supabase, user.id, page)
      .then(({ data, count }) => {
        setBookings(data);
        setTotalCount(count);
      })
      .catch((err) => toast.error('Failed to load bookings: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase, page]);

  // ─── Fetch shoots for link dialog ─────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('shoots')
      .select('id, title, date')
      .eq('user_id', user.id)
      .eq('is_standalone', false)
      .order('date', { ascending: true })
      .then(({ data }) => setShoots(data ?? []));
  }, [user?.id, supabase]);

  // ─── Derived ──────────────────────────────────────────────────────────────────

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
    if (statusFilter !== 'all')
      list = list.filter((b) => b.status === statusFilter);
    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const upcoming = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'pending',
    );
    const pendingDeposits = bookings.filter(
      (b) => !b.depositPaid && b.status !== 'cancelled',
    ).length;
    return { upcoming: upcoming.length, pendingDeposits };
  }, [bookings]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleAdd(values: BookingFormValues) {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const newBooking = await insertBooking(supabase, values, user.id);
      setBookings((prev) =>
        [...prev, newBooking].sort((a, b) => a.date.localeCompare(b.date)),
      );
      setAddOpen(false);
      toast.success(`Booking for ${values.clientName} added`);
    } catch (err: unknown) {
      toast.error('Failed to add booking: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(values: BookingFormValues) {
    if (!editBooking) return;
    setIsSubmitting(true);
    try {
      const updated = await updateBooking(supabase, editBooking.id, values);
      setBookings((prev) =>
        prev.map((b) => (b.id === editBooking.id ? updated : b)),
      );
      setEditBooking(null);
      toast.success('Booking updated');
    } catch (err: unknown) {
      toast.error('Failed to update booking: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteBooking_) return;
    setIsDeleting(true);
    try {
      await deleteBooking(supabase, deleteBooking_.id);
      setBookings((prev) => prev.filter((b) => b.id !== deleteBooking_.id));
      toast.success('Booking deleted');
      setDeleteBooking(null);
    } catch (err: unknown) {
      toast.error('Failed to delete booking: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMarkDepositPaid(booking: Booking) {
    try {
      await markDepositPaid(supabase, booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, depositPaid: true } : b,
        ),
      );
      toast.success(`Deposit marked as paid for ${booking.clientName}`);
    } catch (err: unknown) {
      toast.error('Failed to update booking: ' + (err as Error).message);
    }
  }

  async function handleCancel(booking: Booking) {
    try {
      await cancelBooking(supabase, booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: 'cancelled' } : b,
        ),
      );
      toast.warning(`${booking.clientName}'s booking cancelled`);
    } catch (err: unknown) {
      toast.error('Failed to cancel booking: ' + (err as Error).message);
    }
  }

  async function handleLinkShoot(shootId: string) {
    if (!linkBooking) return;
    try {
      await linkBookingToShoot(supabase, linkBooking.id, shootId);
      setBookings((prev) =>
        prev.map((b) => (b.id === linkBooking.id ? { ...b, shootId } : b)),
      );
      const shoot = shoots.find((s) => s.id === shootId);
      toast.success(`Linked to ${shoot?.title ?? 'shoot'}`);
      setLinkBooking(null);
    } catch (err: unknown) {
      toast.error('Failed to link shoot: ' + (err as Error).message);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
              Bookings
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isLoading ? (
                'Loading…'
              ) : (
                <>
                  {stats.upcoming} upcoming
                  {stats.pendingDeposits > 0 && (
                    <span className='text-amber-500 ml-2'>
                      · {stats.pendingDeposits} deposit
                      {stats.pendingDeposits !== 1 ? 's' : ''} pending
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} size='sm'>
            <Plus className='w-4 h-4 sm:mr-2' />
            <span className='hidden sm:inline'>New booking</span>
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search bookings…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className='w-36'>
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
            <div className='hidden sm:flex rounded-md border border-border overflow-hidden shrink-0'>
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
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Mobile cards */}
            <div className='sm:hidden space-y-3'>
              {filtered.length === 0 ? (
                <div className='rounded-xl border border-border flex flex-col items-center justify-center py-16 text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    {bookings.length === 0
                      ? 'No bookings yet'
                      : 'No bookings found'}
                  </p>
                </div>
              ) : (
                filtered.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={setEditBooking}
                    onDelete={setDeleteBooking}
                    onMarkDepositPaid={handleMarkDepositPaid}
                    onCancel={handleCancel}
                    onLinkShoot={setLinkBooking}
                  />
                ))
              )}
            </div>

            {/* Desktop */}
            <div className='hidden sm:block'>
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
            </div>

            {totalCount > 0 && (
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                  {filtered.length < bookings.length ? ` (${filtered.length} shown)` : ''}
                </span>
                {totalCount > PAGE_SIZE && (
                  <div className='flex gap-1.5'>
                    <Button size='sm' variant='outline' className='h-7 px-2' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className='w-3.5 h-3.5 mr-1' />Prev
                    </Button>
                    <Button size='sm' variant='outline' className='h-7 px-2' disabled={(page + 1) * PAGE_SIZE >= totalCount} onClick={() => setPage((p) => p + 1)}>
                      Next<ChevronRight className='w-3.5 h-3.5 ml-1' />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BookingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        isSubmitting={isSubmitting}
      />
      <BookingDialog
        open={!!editBooking}
        onOpenChange={(open) => {
          if (!open) setEditBooking(null);
        }}
        booking={editBooking}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />

      <Dialog
        open={!!deleteBooking_}
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
                {deleteBooking_?.clientName}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setDeleteBooking(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {shoots.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No shoots available to link
              </p>
            ) : (
              shoots.map((shoot) => (
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
              ))
            )}
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
