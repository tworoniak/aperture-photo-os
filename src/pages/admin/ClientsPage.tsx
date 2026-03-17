import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { mockClients } from '@/lib/mock-clients';
import type { Client } from '@/types';
import type { ClientFormValues } from '@/lib/schemas/client-schema';
import { ClientDialog } from '@/components/crm/ClientDialog';
import { ClientProfileSheet } from '@/components/crm/ClientProfileSheet';
import { DeleteClientDialog } from '@/components/crm/DeleteClientDialog';
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
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | Client['status'];
type SortKey = 'name' | 'revenue' | 'lastContact' | 'createdAt';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function newId() {
  return `c${Date.now()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);

  // Search / filter / sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');

  // Dialog / sheet state
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // ─── Derived list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'lastContact':
          return (b.lastContact ?? '').localeCompare(a.lastContact ?? '');
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return list;
  }, [clients, search, statusFilter, sortKey]);

  // ─── Summary counts ────────────────────────────────────────────────────────

  const counts = useMemo(
    () => ({
      all: clients.length,
      lead: clients.filter((c) => c.status === 'lead').length,
      active: clients.filter((c) => c.status === 'active').length,
      past: clients.filter((c) => c.status === 'past').length,
    }),
    [clients],
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleAdd(values: ClientFormValues) {
    const newClient: Client = {
      ...values,
      id: newId(),
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
      totalShoots: 0,
      totalRevenue: 0,
    };
    setClients((prev) => [newClient, ...prev]);
    setAddOpen(false);
    toast.success(`${values.name} added`);
  }

  function handleEdit(values: ClientFormValues) {
    if (!editClient) return;
    setClients((prev) =>
      prev.map((c) => (c.id === editClient.id ? { ...c, ...values } : c)),
    );
    setEditClient(null);
    toast.success('Client updated');
  }

  function handleDelete() {
    if (!deleteClient) return;
    setClients((prev) => prev.filter((c) => c.id !== deleteClient.id));
    toast.success(`${deleteClient.name} deleted`);
    setDeleteClient(null);
  }

  function openProfile(client: Client) {
    setProfileClient(client);
    setProfileOpen(true);
  }

  function openEdit(client: Client) {
    setProfileOpen(false);
    setEditClient(client);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              Clients
            </h1>
            <p className='text-muted-foreground mt-1'>
              {counts.active} active · {counts.lead} leads · {counts.past} past
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Add client
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Search by name or email…'
              className='pl-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
            <SelectTrigger className='w-44'>
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

        {/* Table */}
        <div className='rounded-xl border border-border bg-card overflow-hidden'>
          {filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <UserRound className='w-8 h-8 text-muted-foreground/40 mb-3' />
              <p className='text-sm font-medium text-foreground'>
                No clients found
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='border-b border-border bg-muted/30'>
                  <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3'>
                    Client
                  </th>
                  <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell'>
                    Status
                  </th>
                  <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
                    Shoots
                  </th>
                  <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell'>
                    Revenue
                  </th>
                  <th className='text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell'>
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
                    {/* Client name + email */}
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

                    {/* Status */}
                    <td className='px-4 py-3 hidden sm:table-cell'>
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

                    {/* Shoots */}
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <span className='text-sm text-foreground'>
                        {client.totalShoots}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <span className='text-sm text-foreground'>
                        {client.totalRevenue > 0
                          ? `$${client.totalRevenue.toLocaleString()}`
                          : '—'}
                      </span>
                    </td>

                    {/* Last contact */}
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <span className='text-sm text-muted-foreground'>
                        {client.lastContact
                          ? format(new Date(client.lastContact), 'MMM d, yyyy')
                          : '—'}
                      </span>
                    </td>

                    {/* Actions menu */}
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
                          <DropdownMenuItem onClick={() => openProfile(client)}>
                            <UserRound className='w-4 h-4 mr-2' />
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(client)}>
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

        {filtered.length > 0 && (
          <p className='text-xs text-muted-foreground text-right'>
            Showing {filtered.length} of {clients.length} clients
          </p>
        )}
      </div>

      {/* Dialogs & sheets */}
      <ClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />

      <ClientDialog
        open={!!editClient}
        onOpenChange={(open) => {
          if (!open) setEditClient(null);
        }}
        client={editClient}
        onSubmit={handleEdit}
      />

      <DeleteClientDialog
        client={deleteClient}
        open={!!deleteClient}
        onOpenChange={(open) => {
          if (!open) setDeleteClient(null);
        }}
        onConfirm={handleDelete}
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
