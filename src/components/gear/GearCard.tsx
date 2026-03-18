import { format } from 'date-fns';
import type { GearItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, Wrench } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  CONDITION_STYLES,
} from '@/lib/gear-helpers';

interface GearCardProps {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  onMarkRepair: (item: GearItem) => void;
}

export function GearCard({
  item,
  onEdit,
  onDelete,
  onMarkRepair,
}: GearCardProps) {
  return (
    <div className='flex items-start gap-3 p-4 rounded-xl border border-border bg-card'>
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-foreground truncate'>
              {item.name}
            </p>
            {item.serialNumber && (
              <p className='text-xs text-muted-foreground mt-0.5'>
                {item.serialNumber}
              </p>
            )}
          </div>
          <Badge
            variant='outline'
            className={cn('text-xs shrink-0', CONDITION_STYLES[item.condition])}
          >
            {CONDITION_LABELS[item.condition]}
          </Badge>
        </div>
        <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap'>
          <span>{CATEGORY_LABELS[item.category]}</span>
          {item.insuranceValue && (
            <span>${item.insuranceValue.toLocaleString()} insured</span>
          )}
          {item.purchaseDate && (
            <span>{format(new Date(item.purchaseDate), 'MMM yyyy')}</span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='w-8 h-8 text-muted-foreground shrink-0'
            >
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className='w-4 h-4 mr-2' />
              Edit
            </DropdownMenuItem>
            {item.condition !== 'needs-repair' && (
              <DropdownMenuItem onClick={() => onMarkRepair(item)}>
                <Wrench className='w-4 h-4 mr-2' />
                Mark as needs repair
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => onDelete(item)}
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
