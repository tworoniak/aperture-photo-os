import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  clientSchema,
  type ClientFormValues,
} from '@/lib/schemas/client-schema';
import type { Client } from '@/types';
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

interface ClientFormProps {
  defaultValues?: Partial<Client>;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      status: defaultValues?.status ?? 'lead',
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder='Sarah Mitchell' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='sarah@email.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder='816-555-0000' {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='lead'>Lead</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='past'>Past</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder='Any relevant details about this client…'
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
            {isSubmitting ? 'Saving…' : 'Save client'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
