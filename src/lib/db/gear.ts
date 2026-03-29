import type { SupabaseClient } from '@supabase/supabase-js';
import type { GearItem } from '@/types';
import { PAGE_SIZE } from '@/lib/constants';

// ─── Type mapping ─────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): GearItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as GearItem['category'],
    serialNumber: row.serial_number as string | undefined,
    purchaseDate: row.purchase_date as string | undefined,
    purchasePrice: row.purchase_price as number | undefined,
    insuranceValue: row.insurance_value as number | undefined,
    condition: row.condition as GearItem['condition'],
    notes: row.notes as string | undefined,
  };
}

function toRow(item: Partial<GearItem>, userId: string) {
  return {
    user_id: userId,
    name: item.name,
    category: item.category,
    serial_number: item.serialNumber ?? null,
    purchase_date: item.purchaseDate ?? null,
    purchase_price: item.purchasePrice ?? null,
    insurance_value: item.insuranceValue ?? null,
    condition: item.condition,
    notes: item.notes ?? null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchGear(
  supabase: SupabaseClient,
  userId: string,
  page = 0,
): Promise<{ data: GearItem[]; count: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('gear')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []).map(fromRow), count: count ?? 0 };
}

export async function insertGearItem(
  supabase: SupabaseClient,
  item: Partial<GearItem>,
  userId: string,
): Promise<GearItem> {
  const { data, error } = await supabase
    .from('gear')
    .insert(toRow(item, userId))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateGearItem(
  supabase: SupabaseClient,
  id: string,
  item: Partial<GearItem>,
): Promise<GearItem> {
  const { data, error } = await supabase
    .from('gear')
    .update({
      name: item.name,
      category: item.category,
      serial_number: item.serialNumber ?? null,
      purchase_date: item.purchaseDate ?? null,
      purchase_price: item.purchasePrice ?? null,
      insurance_value: item.insuranceValue ?? null,
      condition: item.condition,
      notes: item.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteGearItem(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('gear').delete().eq('id', id);

  if (error) throw error;
}

export async function markGearNeedsRepair(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('gear')
    .update({ condition: 'needs-repair' })
    .eq('id', id);

  if (error) throw error;
}
