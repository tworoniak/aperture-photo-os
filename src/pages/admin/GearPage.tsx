import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  fetchGear,
  insertGearItem,
  updateGearItem,
  deleteGearItem,
  markGearNeedsRepair,
} from '@/lib/db/gear';
import type { GearItem } from '@/types';
import type { GearFormValues } from '@/lib/schemas/gear-schema';
import { GearDialog } from '@/components/gear/GearDialog';
import { DeleteGearDialog } from '@/components/gear/DeleteGearDialog';
import { GearCard } from '@/components/gear/GearCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  LayoutList,
  Layers,
  Package,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PAGE_SIZE } from '@/lib/constants';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CONDITION_LABELS,
  CONDITION_STYLES,
} from '@/lib/gear-helpers';
import { format } from 'date-fns';

type CategoryFilter = 'all' | GearItem['category'];
type ViewMode = 'grouped' | 'flat';

function LoadingSkeleton() {
  return (
    <div className='space-y-2'>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className='h-16 w-full rounded-xl' />
      ))}
    </div>
  );
}

function GearRow({
  item,
  onEdit,
  onDelete,
  onMarkRepair,
}: {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  onMarkRepair: (item: GearItem) => void;
}) {
  return (
    <tr className='hover:bg-muted/30 transition-colors'>
      <td className='px-4 py-3'>
        <div>
          <p className='text-sm font-medium text-foreground'>{item.name}</p>
          {item.serialNumber && (
            <p className='text-xs text-muted-foreground mt-0.5'>
              {item.serialNumber}
            </p>
          )}
        </div>
      </td>
      <td className='px-4 py-3 hidden sm:table-cell'>
        <span className='text-sm text-muted-foreground'>
          {CATEGORY_LABELS[item.category]}
        </span>
      </td>
      <td className='px-4 py-3 hidden md:table-cell'>
        <Badge
          variant='outline'
          className={cn('text-xs', CONDITION_STYLES[item.condition])}
        >
          {CONDITION_LABELS[item.condition]}
        </Badge>
      </td>
      <td className='px-4 py-3 hidden md:table-cell'>
        <span className='text-sm text-foreground'>
          {item.insuranceValue
            ? `$${item.insuranceValue.toLocaleString()}`
            : '—'}
        </span>
      </td>
      <td className='px-4 py-3 hidden lg:table-cell'>
        <span className='text-sm text-muted-foreground'>
          {item.purchaseDate
            ? format(new Date(item.purchaseDate), 'MMM d, yyyy')
            : '—'}
        </span>
      </td>
      <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
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
      </td>
    </tr>
  );
}

function GearTable({
  items,
  onEdit,
  onDelete,
  onMarkRepair,
}: {
  items: GearItem[];
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
  onMarkRepair: (item: GearItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <table className='w-full'>
      <thead>
        <tr className='border-b border-border bg-muted/30'>
          <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
            Item
          </th>
          <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell'>
            Category
          </th>
          <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
            Condition
          </th>
          <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
            Insurance value
          </th>
          <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell'>
            Purchase date
          </th>
          <th className='px-4 py-3 w-10' />
        </tr>
      </thead>
      <tbody className='divide-y divide-border'>
        {items.map((item) => (
          <GearRow
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkRepair={onMarkRepair}
          />
        ))}
      </tbody>
    </table>
  );
}

export function GearPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [gear, setGear] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<GearItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GearItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetchGear(supabase, user.id, page)
      .then(({ data, count }) => {
        setGear(data);
        setTotalCount(count);
      })
      .catch((err) => toast.error('Failed to load gear: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase, page]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...gear];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.serialNumber?.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== 'all')
      list = list.filter((g) => g.category === categoryFilter);
    return list;
  }, [gear, search, categoryFilter]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.reduce<Record<string, GearItem[]>>((acc, cat) => {
      const items = filtered.filter((g) => g.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});
  }, [filtered]);

  const totalInsurance = useMemo(
    () => gear.reduce((sum, g) => sum + (g.insuranceValue ?? 0), 0),
    [gear],
  );

  const needsRepairCount = useMemo(
    () => gear.filter((g) => g.condition === 'needs-repair').length,
    [gear],
  );

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleAdd(values: GearFormValues) {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const newItem = await insertGearItem(supabase, values, user.id);
      setGear((prev) => [newItem, ...prev]);
      setAddOpen(false);
      toast.success(`${values.name} added`);
    } catch (err: unknown) {
      toast.error('Failed to add item: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(values: GearFormValues) {
    if (!editItem) return;
    setIsSubmitting(true);
    try {
      const updated = await updateGearItem(supabase, editItem.id, values);
      setGear((prev) => prev.map((g) => (g.id === editItem.id ? updated : g)));
      setEditItem(null);
      toast.success('Item updated');
    } catch (err: unknown) {
      toast.error('Failed to update item: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await deleteGearItem(supabase, deleteItem.id);
      setGear((prev) => prev.filter((g) => g.id !== deleteItem.id));
      toast.success(`${deleteItem.name} deleted`);
      setDeleteItem(null);
    } catch (err: unknown) {
      toast.error('Failed to delete item: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMarkRepair(item: GearItem) {
    try {
      await markGearNeedsRepair(supabase, item.id);
      setGear((prev) =>
        prev.map((g) =>
          g.id === item.id ? { ...g, condition: 'needs-repair' } : g,
        ),
      );
      toast.warning(`${item.name} marked as needs repair`);
    } catch (err: unknown) {
      toast.error('Failed to update item: ' + (err as Error).message);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
              Gear
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isLoading ? (
                'Loading…'
              ) : (
                <>
                  {totalCount} items · ${totalInsurance.toLocaleString()}{' '}
                  insured
                  {needsRepairCount > 0 && (
                    <span className='text-red-500 ml-2'>
                      · {needsRepairCount} needs repair
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} size='sm'>
            <Plus className='w-4 h-4 sm:mr-2' />
            <span className='hidden sm:inline'>Add gear</span>
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search by name or serial number…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All categories</SelectItem>
                {CATEGORY_ORDER.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='hidden sm:flex rounded-md border border-border overflow-hidden shrink-0'>
              <button
                onClick={() => setViewMode('grouped')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
                  viewMode === 'grouped'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Layers className='w-3.5 h-3.5' />
                Grouped
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs border-l border-border transition-colors',
                  viewMode === 'flat'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutList className='w-3.5 h-3.5' />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div className='rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-center'>
            <Package className='w-8 h-8 text-muted-foreground/40 mb-3' />
            <p className='text-sm font-medium text-foreground'>
              {gear.length === 0 ? 'No gear yet' : 'No gear found'}
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              {gear.length === 0
                ? 'Add your first item to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className='sm:hidden space-y-2'>
              {filtered.map((item) => (
                <GearCard
                  key={item.id}
                  item={item}
                  onEdit={setEditItem}
                  onDelete={setDeleteItem}
                  onMarkRepair={handleMarkRepair}
                />
              ))}
            </div>

            {/* Desktop table / grouped */}
            <div className='hidden sm:block'>
              {viewMode === 'flat' ? (
                <div className='rounded-xl border border-border bg-card overflow-hidden'>
                  <GearTable
                    items={filtered}
                    onEdit={setEditItem}
                    onDelete={setDeleteItem}
                    onMarkRepair={handleMarkRepair}
                  />
                </div>
              ) : (
                <div className='space-y-4'>
                  {Object.entries(grouped).map(([cat, items]) => (
                    <div
                      key={cat}
                      className='rounded-xl border border-border bg-card overflow-hidden'
                    >
                      <div className='px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between'>
                        <h2 className='text-sm font-medium text-foreground'>
                          {CATEGORY_LABELS[cat as GearItem['category']]}
                        </h2>
                        <span className='text-xs text-muted-foreground'>
                          {items.length} item{items.length !== 1 ? 's' : ''} · $
                          {items
                            .reduce((s, g) => s + (g.insuranceValue ?? 0), 0)
                            .toLocaleString()}{' '}
                          insured
                        </span>
                      </div>
                      <GearTable
                        items={items}
                        onEdit={setEditItem}
                        onDelete={setDeleteItem}
                        onMarkRepair={handleMarkRepair}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!isLoading && totalCount > 0 && (
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              {filtered.length < gear.length ? ` (${filtered.length} shown)` : ''}
            </span>
            {totalCount > PAGE_SIZE && (
              <div className='flex gap-1.5'>
                <Button size='sm' variant='outline' className='h-7 px-2' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className='w-3.5 h-3.5 mr-1' />Prev
                </Button>
                <Button size='sm' variant='outline' className='h-7 px-2' disabled={(page + 1) * PAGE_SIZE >= totalCount} onClick={() => setPage((p) => p + 1)}>
                  Next<ChevronRight className='w-3.5 h-3.5 ml-1' />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <GearDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        isSubmitting={isSubmitting}
      />
      <GearDialog
        open={!!editItem}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
        item={editItem}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />
      <DeleteGearDialog
        item={deleteItem}
        open={!!deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
