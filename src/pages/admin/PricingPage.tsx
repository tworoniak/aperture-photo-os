import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import { fetchPackages, insertPackage, deletePackage } from '@/lib/db/pricing';
import { mockPackages } from '@/lib/mock-packages';
import type { PricingPackage, Quote } from '@/types';
import { PackageCard } from '@/components/pricing/PackageCard';
import { QuoteBuilder } from '@/components/pricing/QuoteBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, X, Plus } from 'lucide-react';

type CategoryFilter = 'all' | string;

function LoadingSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className='h-64 w-full rounded-xl' />
      ))}
    </div>
  );
}

export function PricingPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<PricingPackage | null>(null);

  // ─── Fetch packages ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    fetchPackages(supabase, user.id)
      .then(setPackages)
      .catch((err) => toast.error('Failed to load packages: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

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

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleSeedPackages() {
    if (!user?.id) return;
    setIsSeeding(true);
    try {
      const seeded = await Promise.all(
        mockPackages.map((pkg) =>
          insertPackage(
            supabase,
            {
              name: pkg.name,
              category: pkg.category,
              description: pkg.description,
              basePrice: pkg.basePrice,
              includes: pkg.includes,
              addOns: pkg.addOns,
              popular: pkg.popular,
            },
            user.id,
          ),
        ),
      );
      setPackages(seeded);
      toast.success(`${seeded.length} packages imported`);
    } catch (err: unknown) {
      toast.error('Failed to import packages: ' + (err as Error).message);
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePackage(supabase, deleteTarget.id);
      setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (selectedPkg?.id === deleteTarget.id) setSelectedPkg(null);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error('Failed to delete package: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExport(quote: Quote) {
    if (!selectedPkg) return;
    generateQuotePDF(quote, selectedPkg);
    toast.success('Quote downloaded');
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='p-4 sm:p-8'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
                Pricing
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                {isLoading
                  ? 'Loading…'
                  : `${packages.length} packages · select one to build a quote`}
              </p>
            </div>
            {!isLoading && packages.length === 0 && (
              <Button
                onClick={handleSeedPackages}
                disabled={isSeeding}
                size='sm'
              >
                <Plus className='w-4 h-4 mr-2' />
                {isSeeding ? 'Importing…' : 'Import default packages'}
              </Button>
            )}
          </div>

          {/* Filters */}
          {!isLoading && packages.length > 0 && (
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
          )}

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : packages.length === 0 ? (
            <div className='rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-sm font-medium text-foreground'>
                No packages yet
              </p>
              <p className='text-xs text-muted-foreground mt-1 mb-4'>
                Import the default packages to get started
              </p>
              <Button onClick={handleSeedPackages} disabled={isSeeding}>
                <Plus className='w-4 h-4 mr-2' />
                {isSeeding ? 'Importing…' : 'Import default packages'}
              </Button>
            </div>
          ) : (
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
          )}
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
            <Button variant='outline' onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
