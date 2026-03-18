import { format } from 'date-fns';
import type { Client } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react';

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

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({
  client,
  onView,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <div
      className='flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/30 transition-colors'
      onClick={() => onView(client)}
    >
      <Avatar className='w-10 h-10 shrink-0'>
        <AvatarFallback className='text-sm bg-muted text-muted-foreground'>
          {getInitials(client.name)}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <p className='text-sm font-medium text-foreground truncate'>
            {client.name}
          </p>
          <Badge
            variant='outline'
            className={cn(
              'text-xs capitalize shrink-0',
              statusStyles[client.status],
            )}
          >
            {client.status}
          </Badge>
        </div>
        <p className='text-xs text-muted-foreground truncate mt-0.5'>
          {client.email}
        </p>
        <div className='flex items-center gap-3 mt-1 text-xs text-muted-foreground'>
          {client.totalRevenue > 0 && (
            <span>${client.totalRevenue.toLocaleString()}</span>
          )}
          {client.totalShoots > 0 && (
            <span>
              {client.totalShoots} shoot{client.totalShoots !== 1 ? 's' : ''}
            </span>
          )}
          {client.lastContact && (
            <span>{format(new Date(client.lastContact), 'MMM d')}</span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='w-8 h-8 text-muted-foreground'
            >
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onView(client)}>
              <UserRound className='w-4 h-4 mr-2' />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Pencil className='w-4 h-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => onDelete(client)}
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
