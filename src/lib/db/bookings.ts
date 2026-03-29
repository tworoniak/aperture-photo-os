import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking } from '@/types';
import { PAGE_SIZE } from '@/lib/constants';

// ─── Type mapping ─────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    clientId: row.client_id as string | undefined,
    clientName: row.client_name as string,
    sessionType: row.session_type as string,
    date: row.date as string,
    time: row.time as string | undefined,
    location: row.location as string | undefined,
    status: row.status as Booking['status'],
    totalAmount: row.total_amount as number,
    depositAmount: row.deposit_amount as number,
    depositPaid: row.deposit_paid as boolean,
    contractSigned: row.contract_signed as boolean,
    shootId: row.shoot_id as string | undefined,
    notes: row.notes as string | undefined,
  };
}

function toRow(booking: Partial<Booking>, userId: string) {
  return {
    user_id: userId,
    client_id: booking.clientId || null,
    client_name: booking.clientName,
    session_type: booking.sessionType,
    date: booking.date,
    time: booking.time ?? null,
    location: booking.location ?? null,
    status: booking.status,
    total_amount: booking.totalAmount ?? 0,
    deposit_amount: booking.depositAmount ?? 0,
    deposit_paid: booking.depositPaid ?? false,
    contract_signed: booking.contractSigned ?? false,
    shoot_id: booking.shootId ?? null,
    notes: booking.notes ?? null,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchBookings(
  supabase: SupabaseClient,
  userId: string,
  page = 0,
): Promise<{ data: Booking[]; count: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []).map(fromRow), count: count ?? 0 };
}

export async function insertBooking(
  supabase: SupabaseClient,
  booking: Partial<Booking>,
  userId: string,
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(toRow(booking, userId))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateBooking(
  supabase: SupabaseClient,
  id: string,
  booking: Partial<Booking>,
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      client_name: booking.clientName,
      session_type: booking.sessionType,
      date: booking.date,
      time: booking.time ?? null,
      location: booking.location ?? null,
      status: booking.status,
      total_amount: booking.totalAmount,
      deposit_amount: booking.depositAmount,
      deposit_paid: booking.depositPaid,
      contract_signed: booking.contractSigned,
      shoot_id: booking.shootId ?? null,
      notes: booking.notes ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteBooking(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) throw error;
}

export async function markDepositPaid(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ deposit_paid: true })
    .eq('id', id);

  if (error) throw error;
}

export async function cancelBooking(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw error;
}

export async function linkBookingToShoot(
  supabase: SupabaseClient,
  bookingId: string,
  shootId: string,
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ shoot_id: shootId })
    .eq('id', bookingId);

  if (error) throw error;
}
