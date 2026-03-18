import type { SupabaseClient } from '@supabase/supabase-js';
import type { Gallery, ProofPhoto } from '@/types';

// ─── Type mapping ─────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): Gallery {
  const photos =
    typeof row.photos === 'string'
      ? JSON.parse(row.photos)
      : ((row.photos as ProofPhoto[]) ?? []);

  return {
    id: row.id as string,
    clientId: row.client_id as string | undefined,
    shootId: row.shoot_id as string | undefined,
    title: row.title as string,
    publicToken: row.public_token as string,
    expiresAt: row.expires_at as string | undefined,
    photos,
  };
}

function toRow(gallery: Partial<Gallery>, userId: string) {
  return {
    user_id: userId,
    client_id: gallery.clientId || null,
    shoot_id: gallery.shootId || null,
    title: gallery.title,
    public_token: gallery.publicToken,
    expires_at: gallery.expiresAt ?? null,
    photos: JSON.stringify(gallery.photos ?? []),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchGalleries(
  supabase: SupabaseClient,
  userId: string,
): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function fetchGalleryByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<Gallery | null> {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('public_token', token)
    .single();

  if (error) return null;
  return fromRow(data);
}

export async function insertGallery(
  supabase: SupabaseClient,
  gallery: Omit<Gallery, 'id' | 'photos'>,
  userId: string,
): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .insert(toRow({ ...gallery, photos: [] }, userId))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function updateGalleryPhotos(
  supabase: SupabaseClient,
  id: string,
  photos: ProofPhoto[],
): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .update({ photos: JSON.stringify(photos) })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function deleteGallery(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('galleries').delete().eq('id', id);

  if (error) throw error;
}
