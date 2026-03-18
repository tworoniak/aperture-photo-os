import { useState } from 'react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import { mockGalleries } from '@/lib/mock-galleries';
import type { Gallery, ProofPhoto } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onCreate: (gallery: Omit<Gallery, 'id' | 'photos'>) => void;
}

function NewGalleryDialog({
  open,
  onOpenChange,
  onCreate,
}: NewGalleryDialogProps) {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  function handleCreate() {
    if (!title.trim()) return;
    const token =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);
    onCreate({
      clientId: clientId || 'unknown',
      shootId: '',
      title: title.trim(),
      publicToken: token,
      expiresAt: expiresAt || undefined,
    });
    setTitle('');
    setClientId('');
    setExpiresAt('');
    onOpenChange(false);
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
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Create gallery
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
  onAdd: (galleryId: string, urls: string[]) => void;
}

function AddPhotosDialog({
  gallery,
  open,
  onOpenChange,
  onAdd,
}: AddPhotosDialogProps) {
  const [urls, setUrls] = useState('');

  function handleAdd() {
    if (!gallery) return;
    const parsed = urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
    onAdd(gallery.id, parsed);
    setUrls('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
          <DialogDescription>
            Paste image URLs — one per line.
          </DialogDescription>
        </DialogHeader>
        <textarea
          className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 min-h-32'
          placeholder={
            'https://images.unsplash.com/...\nhttps://images.unsplash.com/...'
          }
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!urls.trim()}>
            Add photos
          </Button>
        </DialogFooter>
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
    <div className='rounded-xl border border-border bg-card p-5 flex flex-col gap-4 card-hover'>
      {/* Header */}
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
            <div className='w-16 h-16 shrink-0 rounded-md bg-muted flex items-center justify-center'>
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

      {/* Copy link button */}
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
  const [galleries, setGalleries] = useState<Gallery[]>(mockGalleries);
  const [newOpen, setNewOpen] = useState(false);
  const [addPhotosTarget, setAddPhotosTarget] = useState<Gallery | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null);

  function handleCreate(data: Omit<Gallery, 'id' | 'photos'>) {
    const newGallery: Gallery = {
      ...data,
      id: `gal${crypto.randomUUID()}`,
      photos: [],
    };
    setGalleries((prev) => [newGallery, ...prev]);
    toast.success(`${data.title} created`);
  }

  function handleAddPhotos(galleryId: string, urls: string[]) {
    const newPhotos: ProofPhoto[] = urls.map((url) => ({
      id: crypto.randomUUID(),
      url,
      thumbnailUrl: url.includes('?')
        ? url.split('?')[0] + '?w=400'
        : url + '?w=400',
      status: 'unreviewed',
    }));
    setGalleries((prev) =>
      prev.map((g) =>
        g.id === galleryId ? { ...g, photos: [...g.photos, ...newPhotos] } : g,
      ),
    );
    toast.success(`${urls.length} photo${urls.length !== 1 ? 's' : ''} added`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setGalleries((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    toast.success('Gallery deleted');
    setDeleteTarget(null);
  }

  function handleCopyLink(gallery: Gallery) {
    const url = `${window.location.origin}/gallery/${gallery.publicToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Client link copied to clipboard');
  }

  return (
    <div className='flex-1 p-8 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              Galleries
            </h1>
            <p className='text-muted-foreground mt-1'>
              {galleries.length} proofing galleries
            </p>
          </div>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            New gallery
          </Button>
        </div>

        {/* Gallery grid */}
        {galleries.length === 0 ? (
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
      />

      <AddPhotosDialog
        gallery={addPhotosTarget}
        open={!!addPhotosTarget}
        onOpenChange={(open) => {
          if (!open) setAddPhotosTarget(null);
        }}
        onAdd={handleAddPhotos}
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
