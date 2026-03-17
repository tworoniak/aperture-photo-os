import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shootSchema, type ShootFormValues } from '@/lib/schemas/shoot-schema';
import type { Shoot } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoot?: Shoot | null;
  onSubmit: (values: ShootFormValues) => void;
  isSubmitting?: boolean;
}

export function ShootDialog({
  open,
  onOpenChange,
  shoot,
  onSubmit,
  isSubmitting,
}: ShootDialogProps) {
  const form = useForm({
    resolver: zodResolver(shootSchema),
    defaultValues: {
      title: shoot?.title ?? '',
      isStandalone: shoot?.isStandalone ?? false,
      clientName: shoot?.clientName ?? '',
      bookingId: shoot?.bookingId ?? '',
      date: shoot?.date ?? '',
      location: shoot?.location ?? '',
      locationNotes: shoot?.locationNotes ?? '',
      status: shoot?.status ?? 'planning',
      notes: shoot?.notes ?? '',
    },
  });

  const isStandalone = form.watch('isStandalone');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{shoot ? 'Edit shoot' : 'New shoot'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Sarah Mitchell — Wedding' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Standalone toggle */}
            <FormField
              control={form.control}
              name='isStandalone'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border border-border p-3'>
                  <div>
                    <FormLabel className='text-sm font-medium'>
                      Personal / standalone shoot
                    </FormLabel>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Not linked to a client booking
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Client name — only shown when not standalone */}
            {!isStandalone && (
              <FormField
                control={form.control}
                name='clientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Client name{' '}
                      <span className='text-muted-foreground font-normal'>
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Sarah Mitchell' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoot date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
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
                        <SelectItem value='planning'>Planning</SelectItem>
                        <SelectItem value='ready'>Ready</SelectItem>
                        <SelectItem value='completed'>Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
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
                      placeholder='Any notes about this shoot…'
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
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save shoot'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
