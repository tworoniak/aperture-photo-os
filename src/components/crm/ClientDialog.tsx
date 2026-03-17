import type { Client } from '@/types';
import type { ClientFormValues } from '@/lib/schemas/client-schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientForm } from '@/components/crm/ClientForm';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (values: ClientFormValues) => void;
  isSubmitting?: boolean;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
  isSubmitting,
}: ClientDialogProps) {
  const isEditing = !!client;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit client' : 'Add new client'}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          defaultValues={client ?? undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
