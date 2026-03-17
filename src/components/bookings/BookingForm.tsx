import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bookingSchema,
  type BookingFormValues,
  SESSION_TYPES,
} from '@/lib/schemas/booking-schema';
import type { Booking } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BookingFormProps {
  defaultValues?: Partial<Booking>;
  onSubmit: (values: BookingFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BookingForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BookingFormProps) {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: defaultValues?.clientName ?? '',
      clientId: defaultValues?.clientId ?? '',
      sessionType: defaultValues?.sessionType ?? '',
      date: defaultValues?.date ?? '',
      time: defaultValues?.time ?? '',
      location: defaultValues?.location ?? '',
      status: defaultValues?.status ?? 'pending',
      totalAmount: defaultValues?.totalAmount ?? 0,
      depositAmount: defaultValues?.depositAmount ?? 0,
      depositPaid: defaultValues?.depositPaid ?? false,
      contractSigned: defaultValues?.contractSigned ?? false,
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='clientName'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Client name</FormLabel>
                <FormControl>
                  <Input placeholder='Sarah Mitchell' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sessionType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SESSION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='confirmed'>Confirmed</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Time{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>
                  Location{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Loose Park, Kansas City' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='totalAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total amount ($)</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='0' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='depositAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deposit amount ($)</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='0' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Toggles */}
        <div className='space-y-3'>
          <FormField
            control={form.control}
            name='depositPaid'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border border-border p-3'>
                <FormLabel className='text-sm font-medium cursor-pointer'>
                  Deposit paid
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contractSigned'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border border-border p-3'>
                <FormLabel className='text-sm font-medium cursor-pointer'>
                  Contract signed
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Any notes about this booking…'
                  className='resize-none'
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save booking'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
