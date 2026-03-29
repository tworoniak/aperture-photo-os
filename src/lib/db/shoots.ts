import type { SupabaseClient } from '@supabase/supabase-js';
import type { Shoot, ShotItem, MoodBoardImage } from '@/types';
import { PAGE_SIZE } from '@/lib/constants';

// ─── Type mapping ─────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): Shoot {
  return {
    id: row.id as string,
    title: row.title as string,
    clientName: row.client_name as string | undefined,
    bookingId: row.booking_id as string | undefined,
    date: row.date as string,
    location: row.location as string | undefined,
    locationNotes: row.location_notes as string | undefined,
    status: row.status as Shoot['status'],
    completedAt: row.completed_at as string | undefined,
    shotList: (() => {
      try {
        return typeof row.shot_list === 'string'
          ? JSON.parse(row.shot_list)
          : ((row.shot_list as ShotItem[]) ?? []);
      } catch {
        return [];
      }
    })(),
    moodBoard: (() => {
      try {
        return typeof row.mood_board === 'string'
          ? JSON.parse(row.mood_board)
          : ((row.mood_board as MoodBoardImage[]) ?? []);
      } catch {
        return [];
      }
    })(),
    gearKitIds: (row.gear_kit_ids as string[]) ?? [],
    isStandalone: row.is_standalone as boolean,
    notes: row.notes as string | undefined,
  };
}

function toRow(shoot: Partial<Shoot>, userId: string) {
  return {
    user_id: userId,
    title: shoot.title,
    client_name: shoot.clientName ?? null,
    booking_id: shoot.bookingId || null,
    date: shoot.date,
    location: shoot.location ?? null,
    location_notes: shoot.locationNotes ?? null,
    status: shoot.status ?? 'planning',
    completed_at: shoot.completedAt ?? null,
    shot_list: shoot.shotList ?? [],
    mood_board: shoot.moodBoard ?? [],
    gear_kit_ids: shoot.gearKitIds ?? [],
    is_standalone: shoot.isStandalone ?? false,
    notes: shoot.notes ?? null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchShoots(
  supabase: SupabaseClient,
  userId: string,
  page = 0,
): Promise<{ data: Shoot[]; count: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('shoots')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []).map(fromRow), count: count ?? 0 };
}

export async function fetchShoot(
  supabase: SupabaseClient,
  id: string,
): Promise<Shoot> {
  const { data, error } = await supabase
    .from('shoots')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function insertShoot(
  supabase: SupabaseClient,
  shoot: Partial<Shoot>,
  userId: string,
): Promise<Shoot> {
  const { data, error } = await supabase
    .from('shoots')
    .insert(toRow(shoot, userId))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateShoot(
  supabase: SupabaseClient,
  id: string,
  shoot: Partial<Shoot>,
): Promise<Shoot> {
  const payload = {
    title: shoot.title,
    client_name: shoot.clientName ?? null,
    booking_id: shoot.bookingId || null,
    date: shoot.date,
    location: shoot.location ?? null,
    location_notes: shoot.locationNotes ?? null,
    status: shoot.status,
    completed_at: shoot.completedAt ?? null,
    shot_list: JSON.stringify(shoot.shotList ?? []),
    mood_board: JSON.stringify(shoot.moodBoard ?? []),
    gear_kit_ids: shoot.gearKitIds ?? [],
    is_standalone: shoot.isStandalone,
    notes: shoot.notes ?? null,
  };

  const { data, error } = await supabase
    .from('shoots')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteShoot(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('shoots').delete().eq('id', id);

  if (error) throw error;
}
