import type { Booking } from '@/types';
import type { BookingFormValues } from '@/lib/schemas/booking-schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from '@/components/bookings/BookingForm';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  onSubmit: (values: BookingFormValues) => void;
  isSubmitting?: boolean;
}

export function BookingDialog({
  open,
  onOpenChange,
  booking,
  onSubmit,
  isSubmitting,
}: BookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit booking' : 'New booking'}</DialogTitle>
        </DialogHeader>
        <BookingForm
          defaultValues={booking ?? undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
