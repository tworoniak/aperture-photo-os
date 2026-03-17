import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Shoot } from '@/types';
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
import {
  MoreHorizontal,
  MapPin,
  Camera,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface ShootCardProps {
  shoot: Shoot;
  onEdit: (shoot: Shoot) => void;
  onDelete: (shoot: Shoot) => void;
}

const statusStyles: Record<Shoot['status'], string> = {
  planning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ready: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const statusLabels: Record<Shoot['status'], string> = {
  planning: 'Planning',
  ready: 'Ready',
  completed: 'Completed',
};

export function ShootCard({ shoot, onEdit, onDelete }: ShootCardProps) {
  const navigate = useNavigate();
  const checkedCount = shoot.shotList.filter((s) => s.checked).length;
  const totalCount = shoot.shotList.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div
      className='rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-border/80 transition-colors cursor-pointer'
      onClick={() => navigate(`/shoots/${shoot.id}`)}
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h3 className='text-sm font-medium text-foreground truncate'>
              {shoot.title}
            </h3>
            {shoot.isStandalone && (
              <Badge
                variant='outline'
                className='text-xs bg-muted text-muted-foreground border-border shrink-0'
              >
                Personal
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-3 mt-1 flex-wrap'>
            <span className='text-xs text-muted-foreground'>
              {format(new Date(shoot.date), 'MMM d, yyyy')}
            </span>
            {shoot.location && (
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <MapPin className='w-3 h-3' />
                {shoot.location}
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <Badge
            variant='outline'
            className={cn('text-xs capitalize', statusStyles[shoot.status])}
          >
            {statusLabels[shoot.status]}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='w-7 h-7 text-muted-foreground'
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shoots/${shoot.id}`);
                }}
              >
                <Camera className='w-4 h-4 mr-2' />
                Open planner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(shoot);
                }}
              >
                <Pencil className='w-4 h-4 mr-2' />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(shoot);
                }}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Shot list progress */}
      {totalCount > 0 && (
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
              <CheckCircle2 className='w-3.5 h-3.5' />
              Shot list
            </span>
            <span className='text-xs text-muted-foreground'>
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
            <div
              className={cn(
                'h-full rounded-full transition-all',
                shoot.status === 'completed'
                  ? 'bg-emerald-500'
                  : progress > 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between pt-1 border-t border-border'>
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <span>{shoot.moodBoard.length} mood board images</span>
          <span>·</span>
          <span>{shoot.gearKitIds.length} gear items</span>
        </div>
        {shoot.completedAt && (
          <span className='text-xs text-muted-foreground'>
            Completed {format(new Date(shoot.completedAt), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}
