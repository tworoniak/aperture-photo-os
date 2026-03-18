import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { fetchGalleryByToken, updateGalleryPhotos } from '@/lib/db/galleries';
import type { Gallery, ProofPhoto, PhotoStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Heart,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MessageSquare,
  Filter,
} from 'lucide-react';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PhotoStatus, string> = {
  approved: 'bg-emerald-500/90 text-white',
  rejected: 'bg-red-500/90 text-white',
  favourite: 'bg-pink-500/90 text-white',
  unreviewed: 'bg-black/40 text-white',
};

const STATUS_ICONS: Record<PhotoStatus, React.ReactNode> = {
  approved: <Check className='w-3 h-3' />,
  rejected: <X className='w-3 h-3' />,
  favourite: <Heart className='w-3 h-3 fill-current' />,
  unreviewed: null,
};

// ─── Photo actions ────────────────────────────────────────────────────────────

interface PhotoActionsProps {
  status: PhotoStatus;
  onApprove: () => void;
  onReject: () => void;
  onFavourite: () => void;
}

function PhotoActions({
  status,
  onApprove,
  onReject,
  onFavourite,
}: PhotoActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={onApprove}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          status === 'approved'
            ? 'bg-emerald-500 text-white'
            : 'bg-white/20 text-white hover:bg-emerald-500/80',
        )}
      >
        <Check className='w-3.5 h-3.5' />
        Approve
      </button>
      <button
        onClick={onFavourite}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          status === 'favourite'
            ? 'bg-pink-500 text-white'
            : 'bg-white/20 text-white hover:bg-pink-500/80',
        )}
      >
        <Heart
          className={cn(
            'w-3.5 h-3.5',
            status === 'favourite' && 'fill-current',
          )}
        />
        Favourite
      </button>
      <button
        onClick={onReject}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          status === 'rejected'
            ? 'bg-red-500 text-white'
            : 'bg-white/20 text-white hover:bg-red-500/80',
        )}
      >
        <X className='w-3.5 h-3.5' />
        Reject
      </button>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  photos: ProofPhoto[];
  initialIndex: number;
  onClose: () => void;
  onUpdatePhoto: (id: string, patch: Partial<ProofPhoto>) => void;
}

function Lightbox({
  photos,
  initialIndex,
  onClose,
  onUpdatePhoto,
}: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const photo = photos[index];
  const [commentInput, setCommentInput] = useState(photo.clientComment ?? '');

  const prev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)),
    [photos.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
      if (e.key === 'a')
        onUpdatePhoto(photo.id, {
          status: photo.status === 'approved' ? 'unreviewed' : 'approved',
        });
      if (e.key === 'f')
        onUpdatePhoto(photo.id, {
          status: photo.status === 'favourite' ? 'unreviewed' : 'favourite',
        });
      if (e.key === 'r')
        onUpdatePhoto(photo.id, {
          status: photo.status === 'rejected' ? 'unreviewed' : 'rejected',
        });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photo.id, photo.status, prev, next, onClose, onUpdatePhoto]);

  useEffect(() => {
    if (!isSlideshow) return;
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [isSlideshow, next]);

  function submitComment() {
    if (!commentInput.trim()) return;
    onUpdatePhoto(photo.id, { clientComment: commentInput.trim() });
    setShowComment(false);
  }

  return (
    <div
      className='fixed inset-0 z-50 bg-black/95 flex flex-col'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className='flex items-center justify-between px-6 py-4 shrink-0'>
        <span className='text-white/60 text-sm'>
          {index + 1} / {photos.length}
        </span>
        <div className='flex items-center gap-3'>
          <PhotoActions
            status={photo.status}
            onApprove={() =>
              onUpdatePhoto(photo.id, {
                status: photo.status === 'approved' ? 'unreviewed' : 'approved',
              })
            }
            onReject={() =>
              onUpdatePhoto(photo.id, {
                status: photo.status === 'rejected' ? 'unreviewed' : 'rejected',
              })
            }
            onFavourite={() =>
              onUpdatePhoto(photo.id, {
                status:
                  photo.status === 'favourite' ? 'unreviewed' : 'favourite',
              })
            }
          />
          <button
            onClick={() => setShowComment((v) => !v)}
            className={cn(
              'p-2 rounded-full transition-colors',
              showComment ? 'bg-white/20' : 'hover:bg-white/10',
            )}
          >
            <MessageSquare className='w-4 h-4 text-white' />
          </button>
          <button
            onClick={() => setIsSlideshow((v) => !v)}
            className='p-2 rounded-full hover:bg-white/10 transition-colors'
          >
            {isSlideshow ? (
              <Pause className='w-4 h-4 text-white' />
            ) : (
              <Play className='w-4 h-4 text-white' />
            )}
          </button>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-white/10 transition-colors'
          >
            <X className='w-4 h-4 text-white' />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className='flex-1 flex items-center justify-center px-16 min-h-0 relative'>
        <button
          onClick={prev}
          className='absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
        >
          <ChevronLeft className='w-6 h-6 text-white' />
        </button>
        <img
          key={photo.id}
          src={photo.url}
          alt=''
          className='max-w-full max-h-full object-contain rounded-lg'
        />
        <button
          onClick={next}
          className='absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
        >
          <ChevronRight className='w-6 h-6 text-white' />
        </button>
      </div>

      {/* Comment panel */}
      {showComment && (
        <div
          key={photo.id}
          className='px-6 py-4 border-t border-white/10 shrink-0'
        >
          <div className='max-w-lg mx-auto space-y-2'>
            {photo.clientComment && (
              <p className='text-sm text-white/70 italic'>
                "{photo.clientComment}"
              </p>
            )}
            <div className='flex gap-2'>
              <input
                className='flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30'
                placeholder='Add a comment…'
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitComment();
                }}
                autoFocus
              />
              <Button
                size='sm'
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10'
                onClick={submitComment}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filmstrip */}
      <div className='flex gap-2 px-6 py-4 overflow-x-auto shrink-0 border-t border-white/10'>
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            className={cn(
              'w-14 h-14 shrink-0 rounded-md overflow-hidden ring-2 transition-all',
              i === index
                ? 'ring-white'
                : 'ring-transparent opacity-50 hover:opacity-80',
            )}
          >
            <img
              src={p.thumbnailUrl}
              alt=''
              className='w-full h-full object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main public gallery page ─────────────────────────────────────────────────

type FilterMode = 'all' | PhotoStatus;

export function PublicGalleryPage() {
  const { token } = useParams();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchGalleryByToken(supabase, token)
      .then(setGallery)
      .catch(() => setGallery(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  const isExpired = gallery?.expiresAt
    ? isPast(new Date(gallery.expiresAt))
    : false;

  const filteredPhotos =
    gallery?.photos.filter((p) =>
      filterMode === 'all' ? true : p.status === filterMode,
    ) ?? [];

  async function updatePhoto(id: string, patch: Partial<ProofPhoto>) {
    if (!gallery) return;
    const updatedPhotos = gallery.photos.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    setGallery((prev) => (prev ? { ...prev, photos: updatedPhotos } : prev));
    try {
      await updateGalleryPhotos(supabase, gallery.id, updatedPhotos);
    } catch {
      // Silently fail — local state is already updated
    }
  }

  async function downloadSelected() {
    const toDownload =
      gallery?.photos.filter(
        (p) => p.status === 'approved' || p.status === 'favourite',
      ) ?? [];

    if (toDownload.length === 0) return;

    const cloudinaryPhotos = toDownload.filter((p) =>
      p.url.includes('cloudinary.com'),
    );

    if (cloudinaryPhotos.length === 0) {
      toast.error('No photos to download');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    for (let i = 0; i < cloudinaryPhotos.length; i++) {
      const photo = cloudinaryPhotos[i];
      const downloadUrl = photo.url.replace(
        '/upload/',
        '/upload/fl_attachment/',
      );

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `photo-${i + 1}.jpg`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDownloadProgress(i + 1);
          resolve();
        }, i * 1500);
      });
    }

    setIsDownloading(false);
    setDownloadProgress(0);
    toast.success(
      `${cloudinaryPhotos.length} photo${cloudinaryPhotos.length !== 1 ? 's' : ''} downloaded`,
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background p-8'>
        <div className='max-w-6xl mx-auto space-y-6'>
          <Skeleton className='h-16 w-full' />
          <div className='gallery-masonry'>
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className='w-full aspect-square rounded-lg mb-3'
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-2'>
          <h1 className='text-lg font-semibold text-foreground'>
            Gallery not found
          </h1>
          <p className='text-sm text-muted-foreground'>
            This link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-2'>
          <h1 className='text-lg font-semibold text-foreground'>
            Gallery expired
          </h1>
          <p className='text-sm text-muted-foreground'>
            This gallery link expired on{' '}
            {format(new Date(gallery.expiresAt!), 'MMMM d, yyyy')}.
          </p>
          <p className='text-sm text-muted-foreground'>
            Please contact your photographer for a new link.
          </p>
        </div>
      </div>
    );
  }

  const approved = gallery.photos.filter((p) => p.status === 'approved').length;
  const favourited = gallery.photos.filter(
    (p) => p.status === 'favourite',
  ).length;
  const unreviewed = gallery.photos.filter(
    (p) => p.status === 'unreviewed',
  ).length;

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b border-border px-6 py-5'>
        <div className='max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap'>
          <div>
            <h1 className='text-xl font-semibold text-foreground'>
              {gallery.title}
            </h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              {gallery.photos.length} photos
              {gallery.expiresAt && (
                <span className='ml-2'>
                  · Link expires{' '}
                  {format(new Date(gallery.expiresAt), 'MMM d, yyyy')}
                </span>
              )}
            </p>
          </div>
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center gap-2'>
              {approved > 0 && (
                <Badge
                  variant='outline'
                  className='text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                >
                  <Check className='w-3 h-3 mr-1' />
                  {approved} approved
                </Badge>
              )}
              {favourited > 0 && (
                <Badge
                  variant='outline'
                  className='text-xs bg-pink-500/10 text-pink-600 border-pink-500/20'
                >
                  <Heart className='w-3 h-3 mr-1 fill-current' />
                  {favourited} favourites
                </Badge>
              )}
              {unreviewed > 0 && (
                <Badge
                  variant='outline'
                  className='text-xs text-muted-foreground'
                >
                  {unreviewed} to review
                </Badge>
              )}
            </div>
            {approved + favourited > 0 && (
              <Button
                size='sm'
                variant='outline'
                onClick={downloadSelected}
                disabled={isDownloading}
              >
                <Download className='w-3.5 h-3.5 mr-2' />
                {isDownloading
                  ? `Downloading ${downloadProgress}/${approved + favourited}…`
                  : 'Download approved'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className='border-b border-border px-6 py-3'>
        <div className='max-w-6xl mx-auto flex items-center gap-2 flex-wrap'>
          <Filter className='w-3.5 h-3.5 text-muted-foreground' />
          {(
            ['all', 'unreviewed', 'approved', 'favourite', 'rejected'] as const
          ).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                'px-3 py-1 rounded-full text-xs capitalize transition-colors',
                filterMode === mode
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode === 'all'
                ? `All (${gallery.photos.length})`
                : mode === 'favourite'
                  ? `Favourites (${gallery.photos.filter((p) => p.status === mode).length})`
                  : `${mode.charAt(0).toUpperCase() + mode.slice(1)} (${gallery.photos.filter((p) => p.status === mode).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className='px-6 py-3 bg-muted/30 border-b border-border'>
        <p className='text-xs text-muted-foreground max-w-6xl mx-auto'>
          Click any photo to open the full view. Use{' '}
          <kbd className='px-1.5 py-0.5 rounded border border-border bg-background text-foreground font-mono'>
            A
          </kbd>{' '}
          to approve,{' '}
          <kbd className='px-1.5 py-0.5 rounded border border-border bg-background text-foreground font-mono'>
            F
          </kbd>{' '}
          to favourite,{' '}
          <kbd className='px-1.5 py-0.5 rounded border border-border bg-background text-foreground font-mono'>
            R
          </kbd>{' '}
          to reject, or use the buttons on hover.
        </p>
      </div>

      {/* Photo grid */}
      <div className='px-6 py-6'>
        <div className='max-w-6xl mx-auto'>
          {filteredPhotos.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-sm font-medium text-foreground'>
                No photos in this view
              </p>
            </div>
          ) : (
            <div className='gallery-masonry'>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className='photo-card group cursor-pointer'
                  onClick={() =>
                    setLightboxIndex(
                      gallery.photos.findIndex((p) => p.id === photo.id),
                    )
                  }
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt=''
                    loading='lazy'
                    className='w-full block rounded-lg'
                  />
                  {photo.status !== 'unreviewed' && (
                    <div
                      className={cn(
                        'absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        STATUS_STYLES[photo.status],
                      )}
                    >
                      {STATUS_ICONS[photo.status]}
                      <span className='capitalize'>{photo.status}</span>
                    </div>
                  )}
                  {photo.clientComment && (
                    <div className='absolute top-2 right-2 bg-black/60 rounded-full p-1'>
                      <MessageSquare className='w-3 h-3 text-white' />
                    </div>
                  )}
                  <div className='photo-overlay'>
                    <div
                      className='flex items-center gap-1.5'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          updatePhoto(photo.id, {
                            status:
                              photo.status === 'approved'
                                ? 'unreviewed'
                                : 'approved',
                          })
                        }
                        className={cn(
                          'p-1.5 rounded-full transition-colors',
                          photo.status === 'approved'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/20 text-white hover:bg-emerald-500',
                        )}
                      >
                        <Check className='w-3.5 h-3.5' />
                      </button>
                      <button
                        onClick={() =>
                          updatePhoto(photo.id, {
                            status:
                              photo.status === 'favourite'
                                ? 'unreviewed'
                                : 'favourite',
                          })
                        }
                        className={cn(
                          'p-1.5 rounded-full transition-colors',
                          photo.status === 'favourite'
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/20 text-white hover:bg-pink-500',
                        )}
                      >
                        <Heart
                          className={cn(
                            'w-3.5 h-3.5',
                            photo.status === 'favourite' && 'fill-current',
                          )}
                        />
                      </button>
                      <button
                        onClick={() =>
                          updatePhoto(photo.id, {
                            status:
                              photo.status === 'rejected'
                                ? 'unreviewed'
                                : 'rejected',
                          })
                        }
                        className={cn(
                          'p-1.5 rounded-full transition-colors',
                          photo.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-red-500',
                        )}
                      >
                        <X className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={gallery.photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onUpdatePhoto={updatePhoto}
        />
      )}
    </div>
  );
}
