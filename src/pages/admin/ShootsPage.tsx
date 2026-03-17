import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { mockShoots } from '@/lib/mock-shoots';
import type { Shoot } from '@/types';
import type { ShootFormValues } from '@/lib/schemas/shoot-schema';
import { ShootCard } from '@/components/shoots/ShootCard';
import { ShootDialog } from '@/components/shoots/ShootDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Search, Camera } from 'lucide-react';

type StatusFilter = 'all' | Shoot['status'];

function newId() {
  return `s${Date.now()}`;
}

export function ShootsPage() {
  const [shoots, setShoots] = useState<Shoot[]>(mockShoots);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editShoot, setEditShoot] = useState<Shoot | null>(null);
  const [deleteShoot, setDeleteShoot] = useState<Shoot | null>(null);

  const filtered = useMemo(() => {
    let list = [...shoots];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.clientName?.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    list.sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [shoots, search, statusFilter]);

  const counts = useMemo(
    () => ({
      planning: shoots.filter((s) => s.status === 'planning').length,
      ready: shoots.filter((s) => s.status === 'ready').length,
      completed: shoots.filter((s) => s.status === 'completed').length,
    }),
    [shoots],
  );

  function handleAdd(values: ShootFormValues) {
    const newShoot: Shoot = {
      ...values,
      id: newId(),
      shotList: [],
      moodBoard: [],
      gearKitIds: [],
      clientName: values.isStandalone ? undefined : values.clientName,
    };
    setShoots((prev) => [newShoot, ...prev]);
    setAddOpen(false);
    toast.success(`${values.title} created`);
  }

  function handleEdit(values: ShootFormValues) {
    if (!editShoot) return;
    setShoots((prev) =>
      prev.map((s) => (s.id === editShoot.id ? { ...s, ...values } : s)),
    );
    setEditShoot(null);
    toast.success('Shoot updated');
  }

  function handleDelete() {
    if (!deleteShoot) return;
    setShoots((prev) => prev.filter((s) => s.id !== deleteShoot.id));
    toast.success(`${deleteShoot.title} deleted`);
    setDeleteShoot(null);
  }

  return (
    <div className='flex-1 p-8 overflow-y-auto'>
      <div className='max-w-5xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              Shoots
            </h1>
            <p className='text-muted-foreground mt-1'>
              {counts.planning} planning · {counts.ready} ready ·{' '}
              {counts.completed} completed
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            New shoot
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search shoots…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All shoots</SelectItem>
              <SelectItem value='planning'>
                Planning ({counts.planning})
              </SelectItem>
              <SelectItem value='ready'>Ready ({counts.ready})</SelectItem>
              <SelectItem value='completed'>
                Completed ({counts.completed})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shoot cards */}
        {filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border'>
            <Camera className='w-8 h-8 text-muted-foreground/40 mb-3' />
            <p className='text-sm font-medium text-foreground'>
              No shoots found
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {filtered.map((shoot) => (
              <ShootCard
                key={shoot.id}
                shoot={shoot}
                onEdit={setEditShoot}
                onDelete={setDeleteShoot}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add dialog */}
      <ShootDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      <ShootDialog
        open={!!editShoot}
        onOpenChange={(open) => {
          if (!open) setEditShoot(null);
        }}
        shoot={editShoot}
        onSubmit={handleEdit}
      />

      {/* Delete dialog */}
      <Dialog
        open={!!deleteShoot}
        onOpenChange={(open) => {
          if (!open) setDeleteShoot(null);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete shoot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-medium text-foreground'>
                {deleteShoot?.title}
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setDeleteShoot(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
