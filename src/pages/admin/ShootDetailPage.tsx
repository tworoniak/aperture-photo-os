import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import { fetchShoot, updateShoot } from '@/lib/db/shoots';
import { fetchGear } from '@/lib/db/gear';
import type { Shoot, ShotItem, MoodBoardImage, GearItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  Image,
  Package,
  CloudSun,
  FileText,
  X,
} from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/gear-helpers';

const statusStyles: Record<Shoot['status'], string> = {
  planning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ready: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4'>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>{icon}</span>
        <h2 className='text-sm font-medium text-foreground'>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ShotListSection({
  items,
  onChange,
}: {
  items: ShotItem[];
  onChange: (items: ShotItem[]) => void;
}) {
  const [newShot, setNewShot] = useState('');
  const checked = items.filter((s) => s.checked).length;

  function addShot() {
    if (!newShot.trim()) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), text: newShot.trim(), checked: false },
    ]);
    setNewShot('');
  }

  return (
    <Section icon={<CheckCircle2 className='w-4 h-4' />} title='Shot list'>
      {items.length > 0 && (
        <div className='text-xs text-muted-foreground -mt-2'>
          {checked}/{items.length} completed
        </div>
      )}
      <div className='space-y-1.5'>
        {items.map((shot) => (
          <div
            key={shot.id}
            className='flex items-center gap-3 group rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors'
          >
            <button
              onClick={() =>
                onChange(
                  items.map((s) =>
                    s.id === shot.id ? { ...s, checked: !s.checked } : s,
                  ),
                )
              }
              className='shrink-0 text-muted-foreground hover:text-foreground'
            >
              {shot.checked ? (
                <CheckCircle2 className='w-4 h-4 text-emerald-500' />
              ) : (
                <Circle className='w-4 h-4' />
              )}
            </button>
            <span
              className={cn(
                'flex-1 text-sm',
                shot.checked
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground',
              )}
            >
              {shot.text}
            </span>
            <button
              onClick={() => onChange(items.filter((s) => s.id !== shot.id))}
              className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        ))}
      </div>
      <div className='flex gap-2 mt-2'>
        <Input
          placeholder='Add a shot…'
          value={newShot}
          onChange={(e) => setNewShot(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addShot();
            }
          }}
          className='text-sm'
        />
        <Button variant='outline' size='sm' onClick={addShot}>
          <Plus className='w-4 h-4' />
        </Button>
      </div>
    </Section>
  );
}

function MoodBoardSection({
  images,
  onChange,
}: {
  images: MoodBoardImage[];
  onChange: (images: MoodBoardImage[]) => void;
}) {
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  function addImage() {
    if (!newUrl.trim()) return;
    onChange([
      ...images,
      {
        id: crypto.randomUUID(),
        url: newUrl.trim(),
        caption: newCaption.trim() || undefined,
      },
    ]);
    setNewUrl('');
    setNewCaption('');
  }

  return (
    <Section icon={<Image className='w-4 h-4' />} title='Mood board'>
      {images.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
          {images.map((img) => (
            <div
              key={img.id}
              className='group relative rounded-lg overflow-hidden aspect-square bg-muted'
            >
              <img
                src={img.url}
                alt={img.caption ?? ''}
                className='w-full h-full object-cover'
              />
              {img.caption && (
                <div className='absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1'>
                  <p className='text-xs text-white truncate'>{img.caption}</p>
                </div>
              )}
              <button
                onClick={() => onChange(images.filter((i) => i.id !== img.id))}
                className='absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-black/60 rounded-full p-1 transition-all'
              >
                <X className='w-3 h-3 text-white' />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>No images yet.</p>
      )}
      <div className='space-y-2 mt-2'>
        <Input
          placeholder='Image URL…'
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className='text-sm'
        />
        <div className='flex gap-2'>
          <Input
            placeholder='Caption (optional)'
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            className='text-sm'
          />
          <Button variant='outline' size='sm' onClick={addImage}>
            <Plus className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </Section>
  );
}

function LocationSection({
  location,
  locationNotes,
  onNotesChange,
}: {
  location?: string;
  locationNotes?: string;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <Section icon={<MapPin className='w-4 h-4' />} title='Location'>
      {location && (
        <p className='text-sm font-medium text-foreground'>{location}</p>
      )}
      <Textarea
        placeholder='Location notes, parking, backup locations…'
        value={locationNotes ?? ''}
        onChange={(e) => onNotesChange(e.target.value)}
        className='resize-none text-sm'
        rows={4}
      />
    </Section>
  );
}

function WeatherSection({
  date,
  location,
}: {
  date: string;
  location?: string;
}) {
  return (
    <Section icon={<CloudSun className='w-4 h-4' />} title='Weather'>
      <div className='rounded-lg bg-muted/40 border border-border p-4 text-center space-y-1'>
        <p className='text-xs text-muted-foreground'>
          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          {location ? ` · ${location}` : ''}
        </p>
        <p className='text-sm text-muted-foreground'>
          Weather integration coming soon.
        </p>
        <a
          href='https://forecast.weather.gov/'
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-blue-500 hover:underline'
        >
          Check forecast externally
        </a>
      </div>
    </Section>
  );
}

function GearKitSection({
  gearKitIds,
  gear,
  onChange,
}: {
  gearKitIds: string[];
  gear: GearItem[];
  onChange: (ids: string[]) => void;
}) {
  function toggleGear(id: string) {
    onChange(
      gearKitIds.includes(id)
        ? gearKitIds.filter((g) => g !== id)
        : [...gearKitIds, id],
    );
  }

  const grouped = gear.reduce<Record<string, GearItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (gear.length === 0) {
    return (
      <Section icon={<Package className='w-4 h-4' />} title='Gear kit'>
        <p className='text-sm text-muted-foreground'>
          No gear in your inventory yet.
        </p>
      </Section>
    );
  }

  return (
    <Section icon={<Package className='w-4 h-4' />} title='Gear kit'>
      <p className='text-xs text-muted-foreground -mt-2'>
        {gearKitIds.length} items selected
      </p>
      <div className='space-y-4'>
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
            </p>
            <div className='space-y-1'>
              {items.map((item) => {
                const selected = gearKitIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleGear(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                      selected
                        ? 'bg-foreground/5 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    {selected ? (
                      <CheckCircle2 className='w-4 h-4 text-emerald-500 shrink-0' />
                    ) : (
                      <Circle className='w-4 h-4 shrink-0' />
                    )}
                    <span className='flex-1 truncate'>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function NotesSection({
  notes,
  onChange,
}: {
  notes?: string;
  onChange: (notes: string) => void;
}) {
  return (
    <Section icon={<FileText className='w-4 h-4' />} title='Notes'>
      <Textarea
        placeholder='Client preferences, reminders, special instructions…'
        value={notes ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className='resize-none text-sm'
        rows={4}
      />
    </Section>
  );
}

export function ShootDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const supabase = useSupabase();

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Fetch shoot + gear ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!id || !user?.id) return;
    Promise.all([fetchShoot(supabase, id), fetchGear(supabase, user.id)])
      .then(([shootData, gearData]) => {
        setShoot(shootData);
        setGear(gearData);
      })
      .catch((err) => toast.error('Failed to load shoot: ' + err.message))
      .finally(() => setIsLoading(false));
  }, [id, user?.id, supabase]);

  function update(patch: Partial<Shoot>) {
    setShoot((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function handleSave() {
    if (!shoot) return;
    setIsSaving(true);
    try {
      const saved = await updateShoot(supabase, shoot.id, {
        shotList: shoot.shotList,
        moodBoard: shoot.moodBoard,
        locationNotes: shoot.locationNotes,
        gearKitIds: shoot.gearKitIds,
        notes: shoot.notes,
        status: shoot.status,
      });
      setShoot(saved);
      toast.success('Shoot saved');
    } catch (err: unknown) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className='flex-1 p-8'>
        <div className='max-w-5xl mx-auto space-y-4'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-2 w-full' />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-48 w-full rounded-xl' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shoot) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-sm font-medium text-foreground'>Shoot not found</p>
          <Button
            variant='ghost'
            className='mt-2'
            onClick={() => navigate('/shoots')}
          >
            Back to shoots
          </Button>
        </div>
      </div>
    );
  }

  const checkedCount = shoot.shotList.filter((s) => s.checked).length;
  const totalCount = shoot.shotList.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className='flex-1 overflow-y-auto'>
      {/* Sticky header */}
      <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <Button
            variant='ghost'
            size='icon'
            className='w-8 h-8 shrink-0'
            onClick={() => navigate('/shoots')}
          >
            <ArrowLeft className='w-4 h-4' />
          </Button>
          <div className='min-w-0'>
            <h1 className='text-sm font-medium text-foreground truncate'>
              {shoot.title}
            </h1>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{format(new Date(shoot.date), 'MMM d, yyyy')}</span>
              {shoot.location && (
                <span className='hidden sm:flex items-center gap-1'>
                  · <MapPin className='w-3 h-3' />
                  {shoot.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <Badge
            variant='outline'
            className={cn(
              'text-xs capitalize hidden sm:flex',
              statusStyles[shoot.status],
            )}
          >
            {shoot.status}
          </Badge>
          <Button size='sm' onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='p-4 sm:p-8'>
        <div className='max-w-5xl mx-auto'>
          {totalCount > 0 && (
            <div className='mb-6 space-y-1.5'>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Shot list progress</span>
                <span>
                  {checkedCount}/{totalCount} shots
                </span>
              </div>
              <div className='h-2 rounded-full bg-muted overflow-hidden'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    progress === 100
                      ? 'bg-emerald-500'
                      : progress > 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Separator className='mb-6' />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <ShotListSection
                items={shoot.shotList}
                onChange={(shotList) => update({ shotList })}
              />
              <LocationSection
                location={shoot.location}
                locationNotes={shoot.locationNotes}
                onNotesChange={(locationNotes) => update({ locationNotes })}
              />
              <WeatherSection date={shoot.date} location={shoot.location} />
            </div>
            <div className='space-y-4'>
              <MoodBoardSection
                images={shoot.moodBoard}
                onChange={(moodBoard) => update({ moodBoard })}
              />
              <GearKitSection
                gearKitIds={shoot.gearKitIds}
                gear={gear}
                onChange={(gearKitIds) => update({ gearKitIds })}
              />
              <NotesSection
                notes={shoot.notes}
                onChange={(notes) => update({ notes })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
