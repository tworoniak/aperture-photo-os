import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { mockPackages } from '@/lib/mock-packages';
import type { PricingPackage, Quote } from '@/types';
import { PackageCard } from '@/components/pricing/PackageCard';
import { QuoteBuilder } from '@/components/pricing/QuoteBuilder';
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
import { generateQuotePDF } from '@/lib/generate-quote-pdf';
import { Search, X } from 'lucide-react';

type CategoryFilter = 'all' | string;

export function PricingPage() {
  const [packages, setPackages] = useState<PricingPackage[]>(mockPackages);
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<PricingPackage | null>(null);

  // ─── Derived ────────────────────────────────────────────────────────────────

  const categories = useMemo(() => {
    const cats = [...new Set(packages.map((p) => p.category))];
    return cats.sort();
  }, [packages]);

  const filtered = useMemo(() => {
    let list = [...packages];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }
    return list;
  }, [packages, search, categoryFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!deleteTarget) return;
    setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    if (selectedPkg?.id === deleteTarget.id) setSelectedPkg(null);
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function handleExport(quote: Quote) {
    if (!selectedPkg) return;
    generateQuotePDF(quote, selectedPkg);
    toast.success('Quote downloaded');
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='p-8'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                Pricing
              </h1>
              <p className='text-muted-foreground mt-1'>
                {packages.length} packages · select one to build a quote
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
              <Input
                placeholder='Search packages…'
                className='pl-9'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Two-column layout: packages + quote builder */}
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Packages grid */}
            <div className='xl:col-span-2 space-y-4'>
              {filtered.length === 0 ? (
                <div className='rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    No packages found
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {filtered.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      selected={selectedPkg?.id === pkg.id}
                      onSelect={setSelectedPkg}
                      onEdit={() => toast.info('Package editor coming soon')}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quote builder */}
            <div className='xl:col-span-1'>
              {selectedPkg ? (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-sm font-medium text-foreground'>
                      Quote builder
                    </h2>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-7 h-7 text-muted-foreground'
                      onClick={() => setSelectedPkg(null)}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                  <QuoteBuilder pkg={selectedPkg} onExport={handleExport} />
                </div>
              ) : (
                <div className='rounded-xl border border-dashed border-border h-64 flex flex-col items-center justify-center text-center p-6'>
                  <p className='text-sm font-medium text-foreground'>
                    No package selected
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Click "Build quote" on any package to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-medium text-foreground'>
                {deleteTarget?.name}
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
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
