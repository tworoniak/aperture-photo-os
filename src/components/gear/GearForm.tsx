import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gearSchema, type GearFormValues } from '@/lib/schemas/gear-schema';
import type { GearItem } from '@/types';
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
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/gear-helpers';

interface GearFormProps {
  defaultValues?: Partial<GearItem>;
  onSubmit: (values: GearFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GearForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: GearFormProps) {
  const form = useForm({
    resolver: zodResolver(gearSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      category: defaultValues?.category ?? 'body',
      serialNumber: defaultValues?.serialNumber ?? '',
      purchaseDate: defaultValues?.purchaseDate ?? '',
      purchasePrice:
        defaultValues?.purchasePrice != null
          ? Number(defaultValues.purchasePrice)
          : undefined,
      insuranceValue:
        defaultValues?.insuranceValue != null
          ? Number(defaultValues.insuranceValue)
          : undefined,
      condition: defaultValues?.condition ?? 'excellent',
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
              <FormLabel>Item name</FormLabel>
              <FormControl>
                <Input placeholder='Sony A7 IV' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      Object.keys(CATEGORY_LABELS) as GearItem['category'][]
                    ).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
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
            name='condition'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Condition' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      Object.keys(CONDITION_LABELS) as GearItem['condition'][]
                    ).map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {CONDITION_LABELS[cond]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='serialNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Serial number{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder='SN-0000000' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='purchaseDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Purchase date{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='purchasePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase price{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='insuranceValue'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Insurance value{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
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
                  placeholder='Any relevant details…'
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
            {isSubmitting ? 'Saving…' : 'Save item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
