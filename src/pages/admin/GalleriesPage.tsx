import { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  fetchGalleries,
  insertGallery,
  updateGalleryPhotos,
  deleteGallery,
} from '@/lib/db/galleries';
import type { Gallery, ProofPhoto } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PhotoUploader } from '@/components/gallery/PhotoUploader';

import { cn } from '@/lib/utils';
import {
  Plus,
  MoreHorizontal,
  Link,
  Trash2,
  ImageIcon,
  CheckCircle2,
  Heart,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

// ─── New gallery dialog ───────────────────────────────────────────────────────

interface NewGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { title: string; expiresAt?: string }) => void;
  isCreating?: boolean;
}

function NewGalleryDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: NewGalleryDialogProps) {
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  function handleCreate() {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), expiresAt: expiresAt || undefined });
    setTitle('');
    setExpiresAt('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>New gallery</DialogTitle>
          <DialogDescription>
            Create a proofing gallery and share the link with your client.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-foreground'>
              Gallery title
            </label>
            <Input
              placeholder='Sarah Mitchell — Wedding'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-foreground'>
              Expiry date{' '}
              <span className='text-muted-foreground font-normal'>
                (optional)
              </span>
            </label>
            <Input
              type='date'
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isCreating}>
            {isCreating ? 'Creating…' : 'Create gallery'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add photos dialog ────────────────────────────────────────────────────────

interface AddPhotosDialogProps {
  gallery: Gallery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    galleryId: string,
    photos: { url: string; thumbnailUrl: string }[],
  ) => void;
}

function AddPhotosDialog({
  gallery,
  open,
  onOpenChange,
  onAdd,
}: AddPhotosDialogProps) {
  if (!gallery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
          <DialogDescription>
            Upload from your computer or add by URL.
          </DialogDescription>
        </DialogHeader>
        <PhotoUploader
          galleryId={gallery.id}
          onUploadComplete={(photos) => {
            onAdd(gallery.id, photos);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Gallery card ─────────────────────────────────────────────────────────────

interface GalleryCardProps {
  gallery: Gallery;
  onAddPhotos: (gallery: Gallery) => void;
  onDelete: (gallery: Gallery) => void;
  onCopyLink: (gallery: Gallery) => void;
}

function GalleryCard({
  gallery,
  onAddPhotos,
  onDelete,
  onCopyLink,
}: GalleryCardProps) {
  const approved = gallery.photos.filter((p) => p.status === 'approved').length;
  const favourited = gallery.photos.filter(
    (p) => p.status === 'favourite',
  ).length;
  const rejected = gallery.photos.filter((p) => p.status === 'rejected').length;
  const unreviewed = gallery.photos.filter(
    (p) => p.status === 'unreviewed',
  ).length;
  const isExpired = gallery.expiresAt
    ? isPast(new Date(gallery.expiresAt))
    : false;

  return (
    <div className='rounded-xl border border-border bg-card p-5 flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-sm font-medium text-foreground truncate'>
            {gallery.title}
          </h3>
          <div className='flex items-center gap-2 mt-1 flex-wrap'>
            {gallery.expiresAt && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isExpired ? 'text-red-500' : 'text-muted-foreground',
                )}
              >
                <Clock className='w-3 h-3' />
                {isExpired
                  ? 'Expired'
                  : `Expires ${format(new Date(gallery.expiresAt), 'MMM d, yyyy')}`}
              </span>
            )}
            {isExpired && (
              <Badge
                variant='outline'
                className='text-xs bg-red-500/10 text-red-600 border-red-500/20'
              >
                Expired
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='w-8 h-8 shrink-0 text-muted-foreground'
            >
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onCopyLink(gallery)}>
              <Link className='w-4 h-4 mr-2' />
              Copy client link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(`/gallery/${gallery.publicToken}`, '_blank')
              }
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              Preview as client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddPhotos(gallery)}>
              <ImageIcon className='w-4 h-4 mr-2' />
              Add photos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => onDelete(gallery)}
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete gallery
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Photo preview strip */}
      {gallery.photos.length > 0 ? (
        <div className='flex gap-1.5 overflow-hidden rounded-lg'>
          {gallery.photos.slice(0, 4).map((photo) => (
            <div
              key={photo.id}
              className='w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted'
            >
              <img
                src={photo.thumbnailUrl}
                alt=''
                className='w-full h-full object-cover'
              />
            </div>
          ))}
          {gallery.photos.length > 4 && (
            <div className='w-16 h-16 rounded-md bg-muted flex items-center justify-center'>
              <span className='text-xs text-muted-foreground font-medium'>
                +{gallery.photos.length - 4}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className='rounded-lg border border-dashed border-border h-16 flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors'
          onClick={() => onAddPhotos(gallery)}
        >
          <p className='text-xs text-muted-foreground'>Click to add photos</p>
        </div>
      )}

      {/* Stats */}
      <div className='grid grid-cols-4 gap-2'>
        {[
          {
            icon: CheckCircle2,
            label: 'Approved',
            count: approved,
            color: 'text-emerald-500',
          },
          {
            icon: Heart,
            label: 'Favourites',
            count: favourited,
            color: 'text-pink-500',
          },
          {
            icon: XCircle,
            label: 'Rejected',
            count: rejected,
            color: 'text-red-500',
          },
          {
            icon: Clock,
            label: 'Pending',
            count: unreviewed,
            color: 'text-muted-foreground',
          },
        ].map(({ icon: Icon, label, count, color }) => (
          <div
            key={label}
            className='flex flex-col items-center gap-1 rounded-lg bg-muted/30 py-2'
          >
            <Icon className={cn('w-3.5 h-3.5', color)} />
            <span className='text-sm font-semibold text-foreground'>
              {count}
            </span>
            <span className='text-xs text-muted-foreground'>{label}</span>
          </div>
        ))}
      </div>

      <Button
        variant='outline'
        size='sm'
        className='w-full'
        onClick={() => onCopyLink(gallery)}
      >
        <Link className='w-3.5 h-3.5 mr-2' />
        Copy client link
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function GalleriesPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  // const [isAdding, setIsAdding] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [addPhotosTarget, setAddPhotosTarget] = useState<Gallery | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    fetchGalleries(supabase, user.id)
      .then(setGalleries)
      .catch((err) => toast.error('Failed to load galleries: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [user?.id, supabase]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreate(data: { title: string; expiresAt?: string }) {
    if (!user?.id) return;
    setIsCreating(true);
    try {
      const token =
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
        '-' +
        Date.now().toString(36);

      const newGallery = await insertGallery(
        supabase,
        {
          clientId: undefined,
          shootId: undefined,
          title: data.title,
          publicToken: token,
          expiresAt: data.expiresAt,
          // photos: [],
        },
        user.id,
      );

      setGalleries((prev) => [newGallery, ...prev]);
      setNewOpen(false);
      toast.success(`${data.title} created`);
    } catch (err: unknown) {
      toast.error('Failed to create gallery: ' + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddPhotos(
    galleryId: string,
    photos: { url: string; thumbnailUrl: string }[],
  ) {
    const gallery = galleries.find((g) => g.id === galleryId);
    if (!gallery) return;
    try {
      const newPhotos: ProofPhoto[] = photos.map((photo) => ({
        id: crypto.randomUUID(),
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        status: 'unreviewed',
      }));
      const updatedPhotos = [...gallery.photos, ...newPhotos];
      const updated = await updateGalleryPhotos(
        supabase,
        galleryId,
        updatedPhotos,
      );
      setGalleries((prev) =>
        prev.map((g) => (g.id === galleryId ? updated : g)),
      );
      toast.success(
        `${photos.length} photo${photos.length !== 1 ? 's' : ''} added`,
      );
    } catch (err: unknown) {
      toast.error('Failed to add photos: ' + (err as Error).message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGallery(supabase, deleteTarget.id);
      setGalleries((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      toast.success('Gallery deleted');
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error('Failed to delete gallery: ' + (err as Error).message);
    }
  }

  function handleCopyLink(gallery: Gallery) {
    const url = `${window.location.origin}/gallery/${gallery.publicToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Client link copied to clipboard');
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='flex-1 p-4 sm:p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold tracking-tight text-foreground'>
              Galleries
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isLoading
                ? 'Loading…'
                : `${galleries.length} proofing galleries`}
            </p>
          </div>
          <Button onClick={() => setNewOpen(true)} size='sm'>
            <Plus className='w-4 h-4 sm:mr-2' />
            <span className='hidden sm:inline'>New gallery</span>
          </Button>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-64 w-full rounded-xl' />
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center'>
            <ImageIcon className='w-8 h-8 text-muted-foreground/40 mb-3' />
            <p className='text-sm font-medium text-foreground'>
              No galleries yet
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Create a gallery to share photos with your clients
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onAddPhotos={setAddPhotosTarget}
                onDelete={setDeleteTarget}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </div>

      <NewGalleryDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={handleCreate}
        isCreating={isCreating}
      />

      <AddPhotosDialog
        gallery={addPhotosTarget}
        open={!!addPhotosTarget}
        onOpenChange={(open) => {
          if (!open) setAddPhotosTarget(null);
        }}
        onAdd={handleAddPhotos}
        // isAdding={isAdding}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete gallery</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-medium text-foreground'>
                {deleteTarget?.title}
              </span>
              ? The client link will stop working immediately.
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
