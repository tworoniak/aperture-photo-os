import type { PricingPackage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Pencil, Trash2 } from 'lucide-react';

interface PackageCardProps {
  pkg: PricingPackage;
  onSelect: (pkg: PricingPackage) => void;
  onEdit: (pkg: PricingPackage) => void;
  onDelete: (pkg: PricingPackage) => void;
  selected?: boolean;
}

export function PackageCard({
  pkg,
  onSelect,
  onEdit,
  onDelete,
  selected,
}: PackageCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 flex flex-col gap-4 transition-all cursor-pointer relative',
        selected
          ? 'border-foreground ring-1 ring-foreground'
          : 'border-border hover:border-border/80',
      )}
      onClick={() => onSelect(pkg)}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <div className='absolute top-0 left-1/2 -translate-x-1/2'>
          <Badge className='bg-foreground text-background text-xs px-3'>
            Most popular
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div>
          <Badge variant='outline' className='text-xs mb-2'>
            {pkg.category}
          </Badge>
          <h3 className='text-base font-semibold text-foreground'>
            {pkg.name}
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {pkg.description}
          </p>
        </div>
        <div
          className='flex gap-1 shrink-0'
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant='ghost'
            size='icon'
            className='w-7 h-7 text-muted-foreground'
            onClick={() => onEdit(pkg)}
          >
            <Pencil className='w-3.5 h-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='w-7 h-7 text-muted-foreground hover:text-destructive'
            onClick={() => onDelete(pkg)}
          >
            <Trash2 className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>

      {/* Price */}
      <div>
        <span className='text-2xl font-bold text-foreground'>
          ${pkg.basePrice.toLocaleString()}
        </span>
        <span className='text-sm text-muted-foreground ml-1'>starting</span>
      </div>

      {/* Includes */}
      <ul className='space-y-1.5 flex-1'>
        {pkg.includes.map((item, i) => (
          <li
            key={i}
            className='flex items-start gap-2 text-xs text-muted-foreground'
          >
            <Check className='w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5' />
            {item}
          </li>
        ))}
      </ul>

      {/* Select button */}
      <Button
        variant={selected ? 'default' : 'outline'}
        size='sm'
        className='w-full mt-auto'
        onClick={(e) => {
          e.stopPropagation();
          onSelect(pkg);
        }}
      >
        {selected ? 'Selected' : 'Build quote'}
      </Button>
    </div>
  );
}
