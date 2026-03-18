import type { SupabaseClient } from '@supabase/supabase-js';
import type { Shoot, ShotItem, MoodBoardImage } from '@/types';

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
    shotList:
      typeof row.shot_list === 'string'
        ? JSON.parse(row.shot_list)
        : ((row.shot_list as ShotItem[]) ?? []),
    moodBoard:
      typeof row.mood_board === 'string'
        ? JSON.parse(row.mood_board)
        : ((row.mood_board as MoodBoardImage[]) ?? []),
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
): Promise<Shoot[]> {
  const { data, error } = await supabase
    .from('shoots')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromRow);
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

  // console.log('Updating shoot:', id);
  // console.log('Payload:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabase
    .from('shoots')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  console.log('Response:', JSON.stringify(data, null, 2));
  return fromRow(data);
}

export async function deleteShoot(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('shoots').delete().eq('id', id);

  if (error) throw error;
}
