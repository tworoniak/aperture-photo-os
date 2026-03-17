import { format } from 'date-fns';
import type { Client } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Mail, Phone, FileText, Pencil } from 'lucide-react';

interface ClientProfileSheetProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (client: Client) => void;
}

const statusStyles: Record<Client['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  lead: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  past: 'bg-muted text-muted-foreground border-border',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-muted/40 p-3 flex flex-col gap-0.5'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-base font-semibold text-foreground'>{value}</span>
    </div>
  );
}

export function ClientProfileSheet({
  client,
  open,
  onOpenChange,
  onEdit,
}: ClientProfileSheetProps) {
  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader className='mb-6'>
          <SheetTitle className='sr-only'>Client profile</SheetTitle>
        </SheetHeader>

        {/* Profile header */}
        <div className='flex items-start gap-4 mb-6'>
          <Avatar className='w-12 h-12 shrink-0'>
            <AvatarFallback className='text-sm bg-muted'>
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <h2 className='text-base font-semibold text-foreground truncate'>
              {client.name}
            </h2>
            <p className='text-sm text-muted-foreground'>
              Client since {format(new Date(client.createdAt), 'MMM yyyy')}
            </p>
          </div>
          <Badge
            variant='outline'
            className={cn('capitalize shrink-0', statusStyles[client.status])}
          >
            {client.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-2 mb-6'>
          <StatPill
            label='Revenue'
            value={`$${client.totalRevenue.toLocaleString()}`}
          />
          <StatPill label='Shoots' value={String(client.totalShoots)} />
          <StatPill
            label='Last contact'
            value={
              client.lastContact
                ? format(new Date(client.lastContact), 'MMM d')
                : '—'
            }
          />
        </div>

        <Separator className='mb-6' />

        {/* Contact info */}
        <div className='space-y-3 mb-6'>
          <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
            Contact
          </h3>
          <div className='flex items-center gap-3'>
            <Mail className='w-4 h-4 text-muted-foreground shrink-0' />
            <a
              href={`mailto:${client.email}`}
              className='text-sm text-foreground hover:underline truncate'
            >
              {client.email}
            </a>
          </div>
          {client.phone && (
            <div className='flex items-center gap-3'>
              <Phone className='w-4 h-4 text-muted-foreground shrink-0' />
              <a
                href={`tel:${client.phone}`}
                className='text-sm text-foreground hover:underline'
              >
                {client.phone}
              </a>
            </div>
          )}
        </div>

        {/* Notes */}
        {client.notes && (
          <>
            <Separator className='mb-6' />
            <div className='space-y-2 mb-6'>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5'>
                <FileText className='w-3.5 h-3.5' />
                Notes
              </h3>
              <p className='text-sm text-foreground leading-relaxed'>
                {client.notes}
              </p>
            </div>
          </>
        )}

        <Separator className='mb-6' />

        {/* Actions */}
        <Button
          className='w-full'
          variant='outline'
          onClick={() => onEdit(client)}
        >
          <Pencil className='w-4 h-4 mr-2' />
          Edit client
        </Button>
      </SheetContent>
    </Sheet>
  );
}
