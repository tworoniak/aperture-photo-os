import { useState, useRef, useCallback } from 'react';
import { uploadToCloudinary, isImageFile } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  ImageIcon,
  Link,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

interface PhotoUploaderProps {
  galleryId: string;
  onUploadComplete: (photos: { url: string; thumbnailUrl: string }[]) => void;
  onCancel: () => void;
}

export function PhotoUploader({
  galleryId,
  onUploadComplete,
  onCancel,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── File handling ────────────────────────────────────────────────────────

  function addFiles(newFiles: File[]) {
    const imageFiles = newFiles.filter(isImageFile);
    const uploadFiles: UploadedFile[] = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  // ─── Drag and drop ────────────────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  // ─── Upload ───────────────────────────────────────────────────────────────

  async function handleUpload() {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    const results: { url: string; thumbnailUrl: string }[] = [];

    for (const uploadFile of pendingFiles) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f,
        ),
      );

      try {
        const result = await uploadToCloudinary(uploadFile.file, galleryId);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'done',
                  url: result.url,
                  thumbnailUrl: result.thumbnailUrl,
                }
              : f,
          ),
        );
        results.push({ url: result.url, thumbnailUrl: result.thumbnailUrl });
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: (err as Error).message }
              : f,
          ),
        );
      }
    }

    setIsUploading(false);
    if (results.length > 0) {
      onUploadComplete(results);
    }
  }

  // ─── URL add ─────────────────────────────────────────────────────────────

  function handleAddUrls() {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const photos = urls.map((url) => ({
      url,
      thumbnailUrl: url.includes('?')
        ? url.split('?')[0] + '?w=400'
        : url + '?w=400',
    }));

    if (photos.length > 0) {
      onUploadComplete(photos);
      setUrlInput('');
    }
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const doneCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className='space-y-4'>
      {/* Tab switcher */}
      <div className='flex rounded-lg border border-border overflow-hidden'>
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm transition-colors',
            activeTab === 'upload'
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Upload className='w-3.5 h-3.5' />
          Upload files
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm border-l border-border transition-colors',
            activeTab === 'url'
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Link className='w-3.5 h-3.5' />
          Add by URL
        </button>
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/80 hover:bg-muted/30',
            )}
          >
            <Upload className='w-8 h-8 text-muted-foreground mx-auto mb-3' />
            <p className='text-sm font-medium text-foreground'>
              Drag and drop photos here
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              or click to browse — JPG, PNG, WEBP supported
            </p>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {files.map((f) => (
                <div
                  key={f.id}
                  className='flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/20'
                >
                  <img
                    src={f.preview}
                    alt=''
                    className='w-10 h-10 rounded object-cover shrink-0'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium text-foreground truncate'>
                      {f.file.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {(f.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div className='shrink-0'>
                    {f.status === 'pending' && (
                      <button
                        onClick={() => removeFile(f.id)}
                        className='text-muted-foreground hover:text-destructive transition-colors'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    )}
                    {f.status === 'uploading' && (
                      <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                    )}
                    {f.status === 'done' && (
                      <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                    )}
                    {f.status === 'error' && (
                      <span title={f.error}>
                        <AlertCircle className='w-4 h-4 text-red-500' />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload status */}
          {isUploading && (
            <p className='text-xs text-muted-foreground text-center'>
              Uploading {uploadingCount} of{' '}
              {pendingCount + uploadingCount + doneCount} photos…
            </p>
          )}
          {errorCount > 0 && (
            <p className='text-xs text-red-500 text-center'>
              {errorCount} photo{errorCount !== 1 ? 's' : ''} failed to upload
            </p>
          )}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={pendingCount === 0 || isUploading}
            >
              <Upload className='w-4 h-4 mr-2' />
              Upload{' '}
              {pendingCount > 0
                ? `${pendingCount} photo${pendingCount !== 1 ? 's' : ''}`
                : ''}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* URL input */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Image URLs
              <span className='text-muted-foreground font-normal ml-1'>
                — one per line
              </span>
            </label>
            <textarea
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 min-h-32'
              placeholder={
                'https://res.cloudinary.com/...\nhttps://res.cloudinary.com/...'
              }
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddUrls} disabled={!urlInput.trim()}>
              <ImageIcon className='w-4 h-4 mr-2' />
              Add photos
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
