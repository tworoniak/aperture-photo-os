import { mockRecentClients } from '@/lib/mock-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Client } from '@/types';

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

export function RecentClients() {
  return (
    <div className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-medium text-foreground'>
            Recent clients
          </h2>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Latest activity
          </p>
        </div>
        <a
          href='/clients'
          className='text-xs text-muted-foreground hover:text-foreground transition-colors'
        >
          View all
        </a>
      </div>

      <div className='flex flex-col divide-y divide-border'>
        {mockRecentClients.map((client) => (
          <div
            key={client.id}
            className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'
          >
            <Avatar className='w-8 h-8 shrink-0'>
              <AvatarFallback className='text-xs bg-muted text-muted-foreground'>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>

            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-foreground truncate'>
                {client.name}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {client.email}
              </p>
            </div>

            <div className='flex flex-col items-end gap-1 shrink-0'>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs capitalize',
                  statusStyles[client.status],
                )}
              >
                {client.status}
              </Badge>
              {client.totalRevenue > 0 && (
                <span className='text-xs text-muted-foreground'>
                  ${client.totalRevenue.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
