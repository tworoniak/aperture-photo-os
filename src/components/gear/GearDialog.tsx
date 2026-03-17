import type { GearItem } from '@/types';
import type { GearFormValues } from '@/lib/schemas/gear-schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GearForm } from '@/components/gear/GearForm';

interface GearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: GearItem | null;
  onSubmit: (values: GearFormValues) => void;
  isSubmitting?: boolean;
}

export function GearDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting,
}: GearDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit item' : 'Add gear'}</DialogTitle>
        </DialogHeader>
        <GearForm
          defaultValues={item ?? undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
