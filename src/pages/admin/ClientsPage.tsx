import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  fetchClients,
  insertClient,
  updateClient,
  deleteClient,
} from '@/lib/db/clients';
import type { Client } from '@/types';
import type { ClientFormValues } from '@/lib/schemas/client-schema';
import { ClientDialog } from '@/components/crm/ClientDialog';
import { ClientProfileSheet } from '@/components/crm/ClientProfileSheet';
import { DeleteClientDialog } from '@/components/crm/DeleteClientDialog';
import { ClientCard } from '@/components/crm/ClientCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PAGE_SIZE } from '@/lib/constants';

type StatusFilter = 'all' | Client['status'];
type SortKey = 'name' | 'revenue' | 'lastContact' | 'createdAt';

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

function LoadingSkeleton() {
  return (
    <div className='space-y-2'>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className='h-16 w-full rounded-xl' />
      ))}
    </div>
  );
}

export function ClientsPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient_, setDeleteClient] = useState<Client | null>(null);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // ─── Fetch clients ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetchClients(supabase, user.id, page)
      .then(({ data, count }) => {
        setClients(data);
        setTotalCount(count);
      })
      .catch((err) => toast.error('Failed to load clients: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase, page]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...clients];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all')
      list = list.filter((c) => c.status === statusFilter);
    list.sort((a, b) => {
      switch (sortKey) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'lastContact':
          return (b.lastContact ?? '').localeCompare(a.lastContact ?? '');
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return list;
  }, [clients, search, statusFilter, sortKey]);

  const counts = useMemo(
    () => ({
      all: clients.length,
      lead: clients.filter((c) => c.status === 'lead').length,
      active: clients.filter((c) => c.status === 'active').length,
      past: clients.filter((c) => c.status === 'past').length,
    }),
    [clients],
  );

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleAdd(values: ClientFormValues) {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const newClient = await insertClient(
        supabase,
        {
          ...values,
          lastContact: new Date().toISOString().split('T')[0],
          totalShoots: 0,
          totalRevenue: 0,
        },
        user.id,
      );
      setClients((prev) => [newClient, ...prev]);
      setAddOpen(false);
      toast.success(`${values.name} added`);
    } catch (err: unknown) {
      toast.error('Failed to add client: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(values: ClientFormValues) {
    if (!editClient) return;
    setIsSubmitting(true);
    try {
      const updated = await updateClient(supabase, editClient.id, values);
      setClients((prev) =>
        prev.map((c) => (c.id === editClient.id ? updated : c)),
      );
      setEditClient(null);
      toast.success('Client updated');
    } catch (err: unknown) {
      toast.error('Failed to update client: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteClient_) return;
    setIsDeleting(true);
    try {
      await deleteClient(supabase, deleteClient_.id);
      setClients((prev) => prev.filter((c) => c.id !== deleteClient_.id));
      toast.success(`${deleteClient_.name} deleted`);
      setDeleteClient(null);
    } catch (err: unknown) {
      toast.error('Failed to delete client: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  function openProfile(client: Client) {
    setProfileClient(client);
    setProfileOpen(true);
  }

  function openEdit(client: Client) {
    setProfileOpen(false);
    setEditClient(client);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-5'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
              Clients
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isLoading ? 'Loading…' : `${totalCount} clients`}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} size='sm'>
            <Plus className='w-4 h-4 sm:mr-2' />
            <span className='hidden sm:inline'>Add client</span>
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search by name or email…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All ({counts.all})</SelectItem>
                <SelectItem value='active'>Active ({counts.active})</SelectItem>
                <SelectItem value='lead'>Lead ({counts.lead})</SelectItem>
                <SelectItem value='past'>Past ({counts.past})</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='createdAt'>Newest first</SelectItem>
                <SelectItem value='revenue'>Highest revenue</SelectItem>
                <SelectItem value='lastContact'>Last contact</SelectItem>
                <SelectItem value='name'>Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Mobile: card list */}
            <div className='md:hidden space-y-2'>
              {filtered.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border'>
                  <UserRound className='w-8 h-8 text-muted-foreground/40 mb-3' />
                  <p className='text-sm font-medium text-foreground'>
                    No clients yet
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Add your first client to get started
                  </p>
                </div>
              ) : (
                filtered.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onView={openProfile}
                    onEdit={openEdit}
                    onDelete={setDeleteClient}
                  />
                ))
              )}
            </div>

            {/* Desktop: table */}
            <div className='hidden md:block rounded-xl border border-border bg-card overflow-hidden'>
              {filtered.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <UserRound className='w-8 h-8 text-muted-foreground/40 mb-3' />
                  <p className='text-sm font-medium text-foreground'>
                    No clients yet
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Add your first client to get started
                  </p>
                </div>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-border bg-muted/30'>
                      <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
                        Client
                      </th>
                      <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
                        Status
                      </th>
                      <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell'>
                        Shoots
                      </th>
                      <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
                        Revenue
                      </th>
                      <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell'>
                        Last contact
                      </th>
                      <th className='px-4 py-3 w-10' />
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {filtered.map((client) => (
                      <tr
                        key={client.id}
                        className='hover:bg-muted/30 transition-colors cursor-pointer'
                        onClick={() => openProfile(client)}
                      >
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='w-8 h-8 shrink-0'>
                              <AvatarFallback className='text-xs bg-muted text-muted-foreground'>
                                {getInitials(client.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-foreground truncate'>
                                {client.name}
                              </p>
                              <p className='text-xs text-muted-foreground truncate'>
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-xs capitalize',
                              statusStyles[client.status],
                            )}
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className='px-4 py-3 hidden lg:table-cell'>
                          <span className='text-sm text-foreground'>
                            {client.totalShoots}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='text-sm text-foreground'>
                            {client.totalRevenue > 0
                              ? `$${client.totalRevenue.toLocaleString()}`
                              : '—'}
                          </span>
                        </td>
                        <td className='px-4 py-3 hidden xl:table-cell'>
                          <span className='text-sm text-muted-foreground'>
                            {client.lastContact
                              ? format(
                                  new Date(client.lastContact),
                                  'MMM d, yyyy',
                                )
                              : '—'}
                          </span>
                        </td>
                        <td
                          className='px-4 py-3'
                          onClick={(e) => e.stopPropagation()}
                        >
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
                              <DropdownMenuItem
                                onClick={() => openProfile(client)}
                              >
                                <UserRound className='w-4 h-4 mr-2' />
                                View profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(client)}
                              >
                                <Pencil className='w-4 h-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={() => setDeleteClient(client)}
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalCount > 0 && (
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                  {filtered.length < clients.length ? ` (${filtered.length} shown)` : ''}
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
          </>
        )}
      </div>

      <ClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        isSubmitting={isSubmitting}
      />
      <ClientDialog
        open={!!editClient}
        onOpenChange={(open) => {
          if (!open) setEditClient(null);
        }}
        client={editClient}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />
      <DeleteClientDialog
        client={deleteClient_}
        open={!!deleteClient_}
        onOpenChange={(open) => {
          if (!open) setDeleteClient(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
      <ClientProfileSheet
        client={profileClient}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onEdit={openEdit}
      />
    </div>
  );
}
