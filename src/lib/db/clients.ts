import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '@/types';

// ─── Type mapping ─────────────────────────────────────────────────────────────
// Maps between our app's camelCase types and Supabase's snake_case columns

function fromRow(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    status: row.status as Client['status'],
    notes: row.notes as string | undefined,
    lastContact: row.last_contact as string | undefined,
    totalShoots: row.total_shoots as number,
    totalRevenue: row.total_revenue as number,
    createdAt: row.created_at as string,
  };
}

function toRow(client: Partial<Client>, userId: string) {
  return {
    user_id: userId,
    name: client.name,
    email: client.email,
    phone: client.phone ?? null,
    status: client.status,
    notes: client.notes ?? null,
    last_contact: client.lastContact ?? null,
    total_shoots: client.totalShoots ?? 0,
    total_revenue: client.totalRevenue ?? 0,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchClients(
  supabase: SupabaseClient,
  userId: string,
): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function insertClient(
  supabase: SupabaseClient,
  client: Partial<Client>,
  userId: string,
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(toRow(client, userId))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  client: Partial<Client>,
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: client.name,
      email: client.email,
      phone: client.phone ?? null,
      status: client.status,
      notes: client.notes ?? null,
      last_contact: client.lastContact ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteClient(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) throw error;
}
