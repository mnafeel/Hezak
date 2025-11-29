import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BannerEditor from '../../components/admin/BannerEditor';
import { createBanner, deleteBanner, updateBanner, uploadImage, uploadVideo, reorderBanners } from '../../lib/api';
import { useBanners } from '../../hooks/useBanners';
import { showError } from '../../lib/errorHandler';
import type { Banner, BannerFormPayload, BannerElement, BannerTextElement, BannerImageElement } from '../../types';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface BannerForm extends BannerFormPayload {
  id?: number;
}

const emptyBanner: BannerForm = {
  title: '',
  text: '',
  imageUrl: '',
  videoUrl: '',
  mediaType: 'image',
  linkUrl: '',
  order: 0,
  isActive: true,
  textPosition: 'bottom-left',
  textAlign: 'left',
  animationStyle: 'fade',
  overlayStyle: 'gradient'
};

const AdminBannersPage = () => {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading, error, refetch } = useBanners();
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTextFormOpen, setIsTextFormOpen] = useState(false);
  const [textEditingBannerId, setTextEditingBannerId] = useState<number | null>(null);
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);
  const [fullEditorBannerId, setFullEditorBannerId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editorTextElements, setEditorTextElements] = useState<BannerElement[]>([]);
  const [editorImageUrl, setEditorImageUrl] = useState('');
  const [editorMediaType, setEditorMediaType] = useState<'image' | 'video'>('image');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BannerForm>({
    defaultValues: emptyBanner
  });

  const watchedImageUrl = watch('imageUrl');
  const watchedVideoUrl = watch('videoUrl');
  const watchedMediaType = watch('mediaType') || 'image';
  const watchedTitle = watch('title');
  const watchedText = watch('text');
  const watchedTextPosition = watch('textPosition') || 'bottom-left';
  const watchedTextAlign = watch('textAlign') || 'left';
  const watchedOverlayStyle = watch('overlayStyle') || 'gradient';
  
  // Drag state for text positioning
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [customPosition, setCustomPosition] = useState<{ x: number; y: number } | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', 'active'] });
    }
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerFormPayload }) =>
      updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', 'active'] });
    }
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', 'active'] });
    }
  });

  const { mutateAsync: reorderMutation, isPending: isReordering } = useMutation({
    mutationFn: reorderBanners,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', 'active'] });
    }
  });

  const pickAndUploadImage = async (onUploaded: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          const response = await uploadImage(file);
          onUploaded(response.url);
          toast.success('Image uploaded successfully!');
        } catch (error) {
          showError(error, 'Failed to upload image.');
        }
      }
    };
    input.click();
  };

  const pickAndUploadVideo = async (onUploaded: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          const response = await uploadVideo(file);
          onUploaded(response.url);
          toast.success('Video uploaded successfully!');
        } catch (error) {
          showError(error, 'Failed to upload video.');
        }
      }
    };
    input.click();
  };

  const onSubmit = async (values: BannerForm) => {
    try {
      if (values.mediaType === 'video') {
        if (!values.videoUrl || values.videoUrl.trim().length === 0) {
          toast.error('Please upload a video for the banner');
          return;
        }
      } else {
        if (!values.imageUrl || values.imageUrl.trim().length === 0) {
          toast.error('Please upload an image for the banner');
          return;
        }
      }

      // Handle linkUrl: if empty string, convert to null; if valid URL, keep it
      let linkUrl: string | null = null;
      if (values.linkUrl && values.linkUrl.trim().length > 0) {
        const trimmed = values.linkUrl.trim();
        // Basic URL validation
        try {
          new URL(trimmed);
          linkUrl = trimmed;
        } catch {
          toast.error('Please enter a valid URL for the link');
          return;
        }
      }

      // For video banners, use videoUrl as imageUrl for compatibility, or use imageUrl directly
      const mediaUrl = values.mediaType === 'video' && values.videoUrl 
        ? values.videoUrl.trim() 
        : values.imageUrl.trim();

      const payload: BannerFormPayload = {
        title: values.title && values.title.trim().length > 0 ? values.title.trim() : null,
        text: values.text && values.text.trim().length > 0 ? values.text.trim() : null,
        imageUrl: mediaUrl, // Use video URL if mediaType is video
        videoUrl: values.videoUrl && values.videoUrl.trim().length > 0 ? values.videoUrl.trim() : null,
        mediaType: values.mediaType || 'image',
        linkUrl: linkUrl,
        order: values.order ?? 0,
        isActive: values.isActive ?? true,
        textPosition: values.textPosition || null,
        textAlign: values.textAlign || null,
        animationStyle: values.animationStyle || null,
        overlayStyle: values.overlayStyle || null
      };

      if (editingBannerId) {
        await updateMutation({ id: editingBannerId, data: payload });
        toast.success('Banner updated');
      } else {
        await createMutation(payload);
        toast.success('Banner created');
      }
      
      setEditingBannerId(null);
      reset(emptyBanner);
      setIsFormOpen(false);
    } catch (error: unknown) {
      showError(error, 'Failed to save banner. Please check all fields and try again.');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setIsFormOpen(true);
    reset({
      id: banner.id,
      title: banner.title || '',
      text: banner.text || '',
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl || '',
      mediaType: banner.mediaType || 'image',
      linkUrl: banner.linkUrl || '',
      order: banner.order,
      isActive: banner.isActive,
      textPosition: banner.textPosition || 'bottom-left',
      textAlign: banner.textAlign || 'left',
      animationStyle: banner.animationStyle || 'fade',
      overlayStyle: banner.overlayStyle || 'gradient'
    });
  };

  const handleAddText = (banner: Banner) => {
    setTextEditingBannerId(banner.id);
    setIsTextFormOpen(true);
    reset({
      id: banner.id,
      title: banner.title || '',
      text: banner.text || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      order: banner.order,
      isActive: banner.isActive,
      textPosition: banner.textPosition || 'bottom-left',
      textAlign: banner.textAlign || 'left',
      animationStyle: banner.animationStyle || 'fade',
      overlayStyle: banner.overlayStyle || 'gradient'
    });
  };

  const handleOpenFullEditor = (banner: Banner) => {
    setFullEditorBannerId(banner.id);
    setEditorMediaType(banner.mediaType || 'image');
    // Use video URL if media type is video, otherwise use image URL
    setEditorImageUrl(banner.mediaType === 'video' && banner.videoUrl ? banner.videoUrl : banner.imageUrl || '');
    
    // Parse textElements from JSON if it's a string, or use array directly
    let parsedTextElements: BannerElement[] = [];
    if (banner.textElements) {
      if (Array.isArray(banner.textElements)) {
        parsedTextElements = banner.textElements;
      } else if (typeof banner.textElements === 'string') {
        try {
          parsedTextElements = JSON.parse(banner.textElements);
        } catch (e) {
          console.error('Failed to parse textElements:', e);
          parsedTextElements = [];
        }
      }
    }
    
    setEditorTextElements(parsedTextElements);
    setIsFullEditorOpen(true);
  };

  const handleSaveFullEditor = async () => {
    if (!fullEditorBannerId) return;
    
    try {
      // Validate and ensure all elements have the type field
      const validatedElements: BannerElement[] = editorTextElements.map(el => {
        if (!el.type) {
          // Infer type from properties
          if ('imageUrl' in el && typeof el === 'object' && el !== null) {
            return { ...(el as object), type: 'image' as const } as BannerImageElement;
          } else if ('content' in el && typeof el === 'object' && el !== null) {
            return { ...(el as object), type: 'text' as const } as BannerTextElement;
          }
        }
        return el;
      }).filter((el): el is BannerElement => el.type === 'text' || el.type === 'image'); // Only keep valid elements
      
      const updateData: Partial<BannerFormPayload> & { imageUrl?: string } = {
        textElements: validatedElements
      };
      
      // Only update media if we have a URL
      if (editorImageUrl && editorImageUrl.trim().length > 0) {
        if (editorMediaType === 'video') {
          updateData.videoUrl = editorImageUrl;
          updateData.mediaType = 'video';
          // Don't send imageUrl at all if it's a video
        } else {
          updateData.imageUrl = editorImageUrl;
          updateData.mediaType = 'image';
          // Don't send videoUrl at all if it's an image
        }
      }
      
      await updateMutation({
        id: fullEditorBannerId,
        data: updateData as BannerFormPayload
      });
      toast.success('Banner updated successfully!');
      setIsFullEditorOpen(false);
      setFullEditorBannerId(null);
    } catch (error) {
      showError(error, 'Failed to update banner');
      console.error('Error saving banner:', error);
    }
  };

  const handleCloseTextForm = () => {
    setIsTextFormOpen(false);
    setTextEditingBannerId(null);
    setCustomPosition(null);
  };

  // Convert pixel coordinates to text position
  const getPositionFromCoords = (x: number, y: number, width: number, height: number): string => {
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    
    // Determine vertical position
    let vertical: string;
    if (yPercent < 33) vertical = 'top';
    else if (yPercent > 66) vertical = 'bottom';
    else vertical = 'center';
    
    // Determine horizontal position
    let horizontal: string;
    if (xPercent < 33) horizontal = 'left';
    else if (xPercent > 66) horizontal = 'right';
    else horizontal = 'center';
    
    // Special case for center-center
    if (vertical === 'center' && horizontal === 'center') return 'center';
    
    const position = `${vertical}-${horizontal}` as BannerFormPayload['textPosition'];
    return position ?? 'bottom-left';
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!watchedImageUrl || (!watchedTitle && !watchedText)) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragStart({ x, y });
      setCustomPosition({ x, y });
    }
  };

  // Handle drag
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
    if (rect) {
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      setCustomPosition({ x, y });
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
    if (rect && customPosition) {
      const newPosition = getPositionFromCoords(customPosition.x, customPosition.y, rect.width, rect.height);
      setValue('textPosition', newPosition as BannerFormPayload['textPosition']);
      setCustomPosition(null);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleTextSubmit = async (values: BannerForm) => {
    if (!textEditingBannerId) return;
    
    try {
      const payload: BannerFormPayload = {
        title: values.title && values.title.trim().length > 0 ? values.title.trim() : null,
        text: values.text && values.text.trim().length > 0 ? values.text.trim() : null,
        imageUrl: values.imageUrl.trim(),
        linkUrl: values.linkUrl && values.linkUrl.trim().length > 0 ? values.linkUrl.trim() : null,
        order: values.order ?? 0,
        isActive: values.isActive ?? true,
        textPosition: values.textPosition || null,
        textAlign: values.textAlign || null,
        animationStyle: values.animationStyle || null,
        overlayStyle: values.overlayStyle || null
      };

      await updateMutation({ id: textEditingBannerId, data: payload });
      toast.success('Banner text updated successfully!');
      handleCloseTextForm();
    } catch (error: unknown) {
      showError(error, 'Failed to update banner text. Please try again.');
    }
  };

  const handleAddNew = () => {
    setEditingBannerId(null);
    setIsFormOpen(true);
    reset(emptyBanner);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBannerId(null);
    reset(emptyBanner);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation(id);
      toast.success('Banner deleted');
      if (editingBannerId === id) {
        setEditingBannerId(null);
        reset(emptyBanner);
      }
    } catch (error) {
      showError(error, 'Failed to delete banner. Please try again.');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateMutation({
        id: banner.id,
        data: { 
          isActive: !banner.isActive,
          imageUrl: banner.imageUrl // Required field
        }
      });
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showError(error, 'Failed to update banner status.');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]];
    const reorderData = newBanners.map((banner, idx) => ({
      id: banner.id,
      order: idx
    }));
    try {
      await reorderMutation(reorderData);
      toast.success('Banner order updated');
    } catch (error) {
      showError(error, 'Failed to reorder banners.');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    const reorderData = newBanners.map((banner, idx) => ({
      id: banner.id,
      order: idx
    }));
    try {
      await reorderMutation(reorderData);
      toast.success('Banner order updated');
    } catch (error) {
      showError(error, 'Failed to reorder banners.');
    }
  };

  useEffect(() => {
    setEditingBannerId(null);
    reset(emptyBanner);
  }, [reset]);

  // Filter banners based on status
  const filteredBanners = banners.filter((banner) => {
    if (filterStatus === 'active') return banner.isActive;
    if (filterStatus === 'inactive') return !banner.isActive;
    return true; // 'all'
  });

  const activeCount = banners.filter((b) => b.isActive).length;
  const inactiveCount = banners.filter((b) => !b.isActive).length;

  return (
    <div className="space-y-8">
      <Card title="Banner Management" className="space-y-4">
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 mb-4">
          <p className="text-sm text-brand-200">
            <strong>💡 Tip:</strong> You can edit any banner (active or inactive) to add title and text content. 
            Click "Edit" on any banner below to add or update text that will display over the banner image on the homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-200 mb-2">
              {banners.length} total {banners.length === 1 ? 'banner' : 'banners'} • {activeCount} active • {inactiveCount} inactive
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  filterStatus === 'all'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  filterStatus === 'active'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('inactive')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  filterStatus === 'inactive'
                    ? 'bg-slate-500/20 text-slate-300 border border-slate-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                Inactive
              </button>
            </div>
          </div>
          <Button onClick={handleAddNew} size="lg">
            + Add Banner
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
            <p className="mt-4 text-sm text-slate-200">Loading banners...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-300 font-semibold mb-2">Failed to load banners</p>
            <p className="text-sm text-red-200 mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="secondary">
              🔄 Retry
            </Button>
          </div>
        ) : filteredBanners.length > 0 ? (
          <div className="space-y-4">
            {filteredBanners.map((banner, index) => {
              // Find the original index in the full banners array for reordering
              const originalIndex = banners.findIndex((b) => b.id === banner.id);
              return (
              <div
                key={banner.id}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:border-brand-400/50 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-6 flex-1">
                    <div className="relative flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 shadow-lg group-hover:border-brand-400/30 transition-all">
                      {banner.mediaType === 'video' && banner.videoUrl ? (
                        <video
                          src={banner.videoUrl}
                          className="h-32 w-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title || 'Banner'}
                          className="h-32 w-56 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      {banner.isActive && (
                        <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                          Live
                        </div>
                      )}
                      {banner.mediaType === 'video' && (
                        <div className="absolute top-2 left-2 rounded-full bg-purple-500/90 px-2 py-1 text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                          🎥 Video
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="text-xl font-bold text-white">
                              {banner.title || 'Untitled Banner'}
                            </h3>
                            <Badge
                              variant={banner.isActive ? 'success' : 'default'}
                              className={banner.isActive ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-slate-500/20 text-slate-300 border-slate-500/50'}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {(!banner.title || !banner.text) && (
                              <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse">
                                {!banner.title && !banner.text ? '⚠️ No Text' : !banner.title ? '⚠️ No Title' : '⚠️ No Description'}
                              </Badge>
                            )}
                          </div>
                          {banner.text ? (
                            <p className="text-sm text-slate-300 mb-3 line-clamp-2 leading-relaxed">{banner.text}</p>
                          ) : (
                            <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                              <p className="text-xs text-amber-200 font-medium">💡 No text content - Add engaging text to improve engagement</p>
                            </div>
                          )}
                          {!banner.title && (
                            <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                              <p className="text-xs text-amber-200 font-medium">💡 No title - Add a catchy title to grab attention</p>
                            </div>
                          )}
                          {banner.linkUrl && (
                            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-1.5">
                              <span className="text-xs text-brand-200">🔗</span>
                              <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-300 hover:text-brand-200 underline truncate max-w-xs">
                                {banner.linkUrl}
                              </a>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                            <span className="flex items-center gap-1">
                              <span className="text-slate-400">📅</span>
                              Created {formatDate(banner.createdAt)}
                            </span>
                            {banner.updatedAt !== banner.createdAt && (
                              <span className="flex items-center gap-1">
                                <span className="text-slate-400">🔄</span>
                                Updated {formatDate(banner.updatedAt)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <span className="text-slate-400">#</span>
                              Order: {banner.order}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(originalIndex)}
                        disabled={originalIndex === 0 || isReordering}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition shrink-0',
                          originalIndex === 0 || isReordering
                            ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                            : 'bg-white/10 text-slate-200 hover:bg-white/15'
                        )}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(originalIndex)}
                        disabled={originalIndex === banners.length - 1 || isReordering}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition shrink-0',
                          originalIndex === banners.length - 1 || isReordering
                            ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                            : 'bg-white/10 text-slate-200 hover:bg-white/15'
                        )}
                      >
                        ↓
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleActive(banner)}
                      disabled={isUpdating}
                      size="sm"
                      className="whitespace-nowrap shrink-0"
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    {(!banner.title || !banner.text) && (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleAddText(banner)}
                        size="sm"
                        className="bg-gradient-to-r from-brand-500/30 to-brand-400/20 text-brand-200 hover:from-brand-500/40 hover:to-brand-400/30 border border-brand-500/50 shadow-lg shadow-brand-500/20 font-semibold whitespace-nowrap shrink-0"
                      >
                        ✏️ Add Content
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={() => handleEdit(banner)}
                      size="sm"
                      className="hover:bg-white/10 whitespace-nowrap shrink-0"
                    >
                      ✎ Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleOpenFullEditor(banner)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-purple-200 hover:from-purple-500/40 hover:to-pink-500/30 border border-purple-500/50 whitespace-nowrap shrink-0"
                    >
                      🎨 Full Editor
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() => handleDelete(banner.id)}
                      size="sm"
                      className="whitespace-nowrap shrink-0"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-300 mb-2">
              {filterStatus === 'active' 
                ? 'No active banners. Activate a banner or create a new one.'
                : filterStatus === 'inactive'
                ? 'No inactive banners.'
                : 'No banners configured. Add your first banner to display on the homepage.'}
            </p>
            {filterStatus !== 'all' && (
              <Button variant="ghost" onClick={() => setFilterStatus('all')} className="mt-4">
                View All Banners
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Banner Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto max-w-5xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/50"
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {editingBannerId ? '✨ Edit Banner' : '✨ Create New Banner'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-200">
                    {editingBannerId ? 'Update your banner content and settings' : 'Design a stunning banner for your homepage'}
                  </p>
                </div>
                <Button variant="ghost" onClick={handleCloseForm} className="shrink-0 rounded-xl hover:bg-white/10">
                  ✕
                </Button>
              </div>
              <Card
                title=""
                className="space-y-6 border-0 bg-transparent p-0"
              >
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-2xl">📝</span>
                      <label className="block text-lg font-bold text-white">
                        Banner Text Content
                      </label>
                    </div>
                    <p className="mb-4 text-sm text-brand-200">
                      Add engaging title and description text to display over your banner. Both are optional but highly recommended for better customer engagement.
                    </p>
                    {(watchedTitle || watchedText) && watchedImageUrl && (
                      <div className="mb-4 rounded-lg border border-brand-400/30 bg-brand-500/10 p-3">
                        <p className="text-xs text-brand-200">
                          <strong>💡 Tip:</strong> Click and drag the text overlay on the preview below to reposition it. The position will update automatically.
                        </p>
                      </div>
                    )}
                    <Input
                      label="Title (Optional)"
                      placeholder="e.g., New Collection, Special Offer, Featured Product"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                    
                    <Textarea
                      label="Description Text (Optional)"
                      placeholder="e.g., Discover our latest fashion trends and exclusive designs. Shop now and get 20% off!"
                      rows={4}
                      {...register('text')}
                      error={errors.text?.message}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6">
                    <input
                      type="hidden"
                      {...register('imageUrl')}
                    />
                    <input
                      type="hidden"
                      {...register('videoUrl')}
                    />
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎬</span>
                        <label className="block text-lg font-bold text-white">
                          Banner Media <span className="text-red-400">*</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setValue('mediaType', 'image');
                            if (watchedMediaType === 'video') {
                              setValue('videoUrl', '');
                            }
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            watchedMediaType === 'image'
                              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                          )}
                        >
                          🖼️ Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setValue('mediaType', 'video');
                            if (watchedMediaType === 'image') {
                              setValue('imageUrl', '');
                            }
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            watchedMediaType === 'video'
                              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                          )}
                        >
                          🎥 Video
                        </button>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/5 shadow-xl">
                      {watchedMediaType === 'video' && watchedVideoUrl ? (
                        <div className="relative aspect-[21/9] w-full">
                          <video
                            src={watchedVideoUrl}
                            className="h-full w-full object-cover"
                            controls
                            muted
                            loop
                          />
                          {/* Live Preview of Text Overlay */}
                          {(watchedTitle || watchedText) && (
                            <div 
                              className={cn(
                                "absolute inset-0 flex",
                                !customPosition && watchedTextPosition === 'top-left' && 'items-start justify-start',
                                !customPosition && watchedTextPosition === 'top-center' && 'items-start justify-center',
                                !customPosition && watchedTextPosition === 'top-right' && 'items-start justify-end',
                                !customPosition && watchedTextPosition === 'center-left' && 'items-center justify-start',
                                !customPosition && watchedTextPosition === 'center' && 'items-center justify-center',
                                !customPosition && watchedTextPosition === 'center-right' && 'items-center justify-end',
                                !customPosition && watchedTextPosition === 'bottom-left' && 'items-end justify-start',
                                !customPosition && watchedTextPosition === 'bottom-center' && 'items-end justify-center',
                                !customPosition && watchedTextPosition === 'bottom-right' && 'items-end justify-end',
                                watchedOverlayStyle === 'gradient' && 'bg-gradient-to-t from-black/70 via-black/30 to-black/10',
                                watchedOverlayStyle === 'solid' && 'bg-black/50',
                                watchedOverlayStyle === 'blur' && 'backdrop-blur-md bg-black/30',
                                watchedOverlayStyle === 'none' && ''
                              )}
                              style={customPosition ? {
                                alignItems: 'center',
                                justifyContent: 'center'
                              } : {}}
                            >
                              {/* Grid helper lines when dragging */}
                              {isDragging && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                  <div className="absolute top-1/3 left-0 right-0 h-px bg-brand-400/30" />
                                  <div className="absolute top-2/3 left-0 right-0 h-px bg-brand-400/30" />
                                </div>
                              )}
                              <div
                                className={cn(
                                  "relative cursor-move select-none",
                                  isDragging && "z-10"
                                )}
                                onMouseDown={handleDragStart}
                                onMouseMove={handleDrag}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={() => {
                                  if (isDragging) {
                                    handleDragEnd({} as React.MouseEvent<HTMLDivElement>);
                                  }
                                }}
                              >
                                <div 
                                  className={cn(
                                    "p-6 text-white transition-all",
                                    isDragging && "scale-105 ring-2 ring-brand-400 ring-offset-2 rounded-lg",
                                    watchedTextAlign === 'left' && 'text-left',
                                    watchedTextAlign === 'center' && 'text-center',
                                    watchedTextAlign === 'right' && 'text-right'
                                  )}
                                  style={customPosition ? {
                                    position: 'absolute',
                                    left: `${customPosition.x}px`,
                                    top: `${customPosition.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '80%'
                                  } : {}}
                                >
                                  {isDragging && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-brand-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                                      🖱️ Drag to position • Release to save
                                    </div>
                                  )}
                                  {watchedTitle && (
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                      {watchedTitle}
                                    </h2>
                                  )}
                                  {watchedText && (
                                    <p className="text-base sm:text-lg text-white/95 max-w-3xl leading-relaxed drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                      {watchedText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : watchedMediaType === 'image' && watchedImageUrl ? (
                        <div className="relative aspect-[21/9] w-full">
                          <img
                            src={watchedImageUrl}
                            alt="Banner preview"
                            className="h-full w-full object-cover"
                          />
                          {/* Live Preview of Text Overlay */}
                          {(watchedTitle || watchedText) && (
                            <div 
                              className={cn(
                                "absolute inset-0 flex",
                                !customPosition && watchedTextPosition === 'top-left' && 'items-start justify-start',
                                !customPosition && watchedTextPosition === 'top-center' && 'items-start justify-center',
                                !customPosition && watchedTextPosition === 'top-right' && 'items-start justify-end',
                                !customPosition && watchedTextPosition === 'center-left' && 'items-center justify-start',
                                !customPosition && watchedTextPosition === 'center' && 'items-center justify-center',
                                !customPosition && watchedTextPosition === 'center-right' && 'items-center justify-end',
                                !customPosition && watchedTextPosition === 'bottom-left' && 'items-end justify-start',
                                !customPosition && watchedTextPosition === 'bottom-center' && 'items-end justify-center',
                                !customPosition && watchedTextPosition === 'bottom-right' && 'items-end justify-end',
                                watchedOverlayStyle === 'gradient' && 'bg-gradient-to-t from-black/70 via-black/30 to-black/10',
                                watchedOverlayStyle === 'solid' && 'bg-black/50',
                                watchedOverlayStyle === 'blur' && 'backdrop-blur-md bg-black/30',
                                watchedOverlayStyle === 'none' && ''
                              )}
                              style={customPosition ? {
                                alignItems: 'center',
                                justifyContent: 'center'
                              } : {}}
                            >
                              {/* Grid helper lines when dragging */}
                              {isDragging && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                  <div className="absolute top-1/3 left-0 right-0 h-px bg-brand-400/30" />
                                  <div className="absolute top-2/3 left-0 right-0 h-px bg-brand-400/30" />
                                </div>
                              )}
                              <div
                                className={cn(
                                  "relative cursor-move select-none",
                                  isDragging && "z-10"
                                )}
                                onMouseDown={handleDragStart}
                                onMouseMove={handleDrag}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={() => {
                                  if (isDragging) {
                                    handleDragEnd({} as React.MouseEvent<HTMLDivElement>);
                                  }
                                }}
                              >
                                <div 
                                  className={cn(
                                    "p-6 text-white transition-all",
                                    isDragging && "scale-105 ring-2 ring-brand-400 ring-offset-2 rounded-lg",
                                    watchedTextAlign === 'left' && 'text-left',
                                    watchedTextAlign === 'center' && 'text-center',
                                    watchedTextAlign === 'right' && 'text-right'
                                  )}
                                  style={customPosition ? {
                                    position: 'absolute',
                                    left: `${customPosition.x}px`,
                                    top: `${customPosition.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    maxWidth: '80%'
                                  } : {}}
                                >
                                  {isDragging && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-brand-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                                      🖱️ Drag to position • Release to save
                                    </div>
                                  )}
                                  {watchedTitle && (
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                      {watchedTitle}
                                    </h2>
                                  )}
                                  {watchedText && (
                                    <p className="text-base sm:text-lg text-white/95 max-w-3xl leading-relaxed drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                      {watchedText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-slate-200">
                          {watchedMediaType === 'video' 
                            ? 'Upload a banner video to preview it here.'
                            : 'Upload a banner image to preview it here.'}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-200">
                        {((watchedMediaType === 'image' && watchedImageUrl) || (watchedMediaType === 'video' && watchedVideoUrl)) && (watchedTitle || watchedText) 
                          ? '✓ Text overlay preview shown above - Click and drag text to reposition'
                          : (watchedMediaType === 'image' && watchedImageUrl) || (watchedMediaType === 'video' && watchedVideoUrl)
                          ? 'Add title or text above to see preview'
                          : `Upload a ${watchedMediaType} first`}
                      </p>
                      {((watchedMediaType === 'image' && watchedImageUrl) || (watchedMediaType === 'video' && watchedVideoUrl)) && (watchedTitle || watchedText) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPosition(null);
                            setValue('textPosition', 'bottom-left');
                          }}
                          className="text-xs text-brand-300 hover:text-brand-200 underline"
                        >
                          Reset Position
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex gap-3">
                      {watchedMediaType === 'image' ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              pickAndUploadImage((url) => setValue('imageUrl', url, { shouldDirty: true }))
                            }
                            className="bg-gradient-to-r from-brand-500/30 to-brand-400/20 text-brand-200 hover:from-brand-500/40 hover:to-brand-400/30 border border-brand-500/50 shadow-lg"
                          >
                            {watchedImageUrl ? '🔄 Replace Image' : '📤 Upload Image'}
                          </Button>
                          {watchedImageUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                              className="hover:bg-red-500/20 hover:text-red-300"
                            >
                              🗑️ Remove
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              pickAndUploadVideo((url) => {
                                setValue('videoUrl', url, { shouldDirty: true });
                                setValue('imageUrl', url, { shouldDirty: true }); // Use video URL as imageUrl for compatibility
                              })
                            }
                            className="bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-purple-200 hover:from-purple-500/40 hover:to-pink-500/30 border border-purple-500/50 shadow-lg"
                          >
                            {watchedVideoUrl ? '🔄 Replace Video' : '🎥 Upload Video'}
                          </Button>
                          {watchedVideoUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setValue('videoUrl', '', { shouldDirty: true });
                                setValue('imageUrl', '', { shouldDirty: true });
                              }}
                              className="hover:bg-red-500/20 hover:text-red-300"
                            >
                              🗑️ Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    {errors.imageUrl?.message && (
                      <p className="text-xs text-red-300">{errors.imageUrl.message}</p>
                    )}
                    {errors.videoUrl?.message && (
                      <p className="text-xs text-red-300">{errors.videoUrl.message}</p>
                    )}
                  </div>

                  <Input
                    label="Link URL (Optional)"
                    type="url"
                    placeholder="https://example.com"
                    {...register('linkUrl')}
                    error={errors.linkUrl?.message}
                  />

                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎨</span>
                      <h3 className="text-lg font-bold text-white">Premium Style Options</h3>
                    </div>
                    <p className="mb-4 text-sm text-purple-200">
                      Customize how your text appears on the banner with professional styling options.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Text Position
                        </label>
                        <select
                          {...register('textPosition')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="center-left">Center Left</option>
                          <option value="center">Center</option>
                          <option value="center-right">Center Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Text Alignment
                        </label>
                        <select
                          {...register('textAlign')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Animation Style
                        </label>
                        <select
                          {...register('animationStyle')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="zoom">Zoom</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Overlay Style
                        </label>
                        <select
                          {...register('overlayStyle')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="gradient">Gradient</option>
                          <option value="solid">Solid</option>
                          <option value="blur">Blur</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      type="number"
                      step="1"
                      label="Display Order"
                      {...register('order', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Order must be 0 or greater' }
                      })}
                      error={errors.order?.message}
                    />
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white">
                        Status
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <input
                          type="checkbox"
                          {...register('isActive')}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-sm text-slate-200">Active (visible on homepage)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-white/10">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isCreating || isUpdating} 
                      className="flex-1 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-white font-bold shadow-lg shadow-brand-500/30"
                    >
                      {isCreating || isUpdating
                        ? '⏳ Saving…'
                        : editingBannerId
                          ? '✨ Update Banner'
                          : '✨ Create Banner'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseForm}
                      className="shrink-0 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick Add Text Modal */}
      <AnimatePresence>
        {isTextFormOpen && textEditingBannerId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseTextForm}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto max-w-4xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/50"
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    ✏️ Add Content to Banner
                  </h2>
                  <p className="mt-1 text-sm text-slate-200">
                    Add engaging text to your existing banner design
                  </p>
                </div>
                <Button variant="ghost" onClick={handleCloseTextForm} className="shrink-0 rounded-xl hover:bg-white/10">
                  ✕
                </Button>
              </div>
              <Card
                title=""
                className="space-y-6 border-0 bg-transparent p-0"
              >
                
                {/* Banner Preview */}
                {watchedImageUrl && (
                  <div className="mb-6 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-xl">👁️</span>
                      <p className="text-base font-bold text-white">Live Banner Preview</p>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
                      <div className="relative aspect-[21/9] w-full">
                        <img
                          src={watchedImageUrl}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                        {/* Live Preview of Text Overlay */}
                        {(watchedTitle || watchedText) && (
                          <div 
                            className={cn(
                              "absolute inset-0 flex",
                              !customPosition && watchedTextPosition === 'top-left' && 'items-start justify-start',
                              !customPosition && watchedTextPosition === 'top-center' && 'items-start justify-center',
                              !customPosition && watchedTextPosition === 'top-right' && 'items-start justify-end',
                              !customPosition && watchedTextPosition === 'center-left' && 'items-center justify-start',
                              !customPosition && watchedTextPosition === 'center' && 'items-center justify-center',
                              !customPosition && watchedTextPosition === 'center-right' && 'items-center justify-end',
                              !customPosition && watchedTextPosition === 'bottom-left' && 'items-end justify-start',
                              !customPosition && watchedTextPosition === 'bottom-center' && 'items-end justify-center',
                              !customPosition && watchedTextPosition === 'bottom-right' && 'items-end justify-end',
                              watchedOverlayStyle === 'gradient' && 'bg-gradient-to-t from-black/70 via-black/30 to-black/10',
                              watchedOverlayStyle === 'solid' && 'bg-black/50',
                              watchedOverlayStyle === 'blur' && 'backdrop-blur-md bg-black/30',
                              watchedOverlayStyle === 'none' && ''
                            )}
                            style={customPosition ? {
                              alignItems: 'center',
                              justifyContent: 'center'
                            } : {}}
                          >
                            {/* Grid helper lines when dragging */}
                            {isDragging && (
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-brand-400/30" />
                                <div className="absolute top-1/3 left-0 right-0 h-px bg-brand-400/30" />
                                <div className="absolute top-2/3 left-0 right-0 h-px bg-brand-400/30" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "relative cursor-move select-none",
                                isDragging && "z-10"
                              )}
                              onMouseDown={handleDragStart}
                              onMouseMove={handleDrag}
                              onMouseUp={handleDragEnd}
                              onMouseLeave={() => {
                                if (isDragging) {
                                  handleDragEnd({} as React.MouseEvent<HTMLDivElement>);
                                }
                              }}
                            >
                              <div 
                                className={cn(
                                  "p-6 text-white transition-all",
                                  isDragging && "scale-105 ring-2 ring-brand-400 ring-offset-2 rounded-lg",
                                  watchedTextAlign === 'left' && 'text-left',
                                  watchedTextAlign === 'center' && 'text-center',
                                  watchedTextAlign === 'right' && 'text-right'
                                )}
                                style={customPosition ? {
                                  position: 'absolute',
                                  left: `${customPosition.x}px`,
                                  top: `${customPosition.y}px`,
                                  transform: 'translate(-50%, -50%)',
                                  maxWidth: '80%'
                                } : {}}
                              >
                                {isDragging && (
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-brand-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                                    🖱️ Drag to position • Release to save
                                  </div>
                                )}
                                {watchedTitle && (
                                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                    {watchedTitle}
                                  </h2>
                                )}
                                {watchedText && (
                                  <p className="text-base sm:text-lg text-white/95 max-w-3xl leading-relaxed drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                    {watchedText}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit(handleTextSubmit)}>
                  <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      <p className="text-sm font-semibold text-brand-200">
                        Quick Text Addition: Fill in the title and/or description text below. 
                        You can see a live preview as you type. Both fields are optional.
                      </p>
                    </div>
                    {watchedImageUrl && (watchedTitle || watchedText) && (
                      <div className="mb-4 rounded-lg border border-brand-400/30 bg-brand-500/10 p-3">
                        <p className="text-xs text-brand-200">
                          <strong>💡 Tip:</strong> Click and drag the text overlay on the preview above to reposition it. The position will update automatically.
                        </p>
                      </div>
                    )}
                    
                    <Input
                      label="Title (Optional)"
                      placeholder="e.g., New Collection, Special Offer, Featured Product"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                    
                    <Textarea
                      label="Description Text (Optional)"
                      placeholder="e.g., Discover our latest fashion trends and exclusive designs. Shop now and get 20% off!"
                      rows={4}
                      {...register('text')}
                      error={errors.text?.message}
                    />
                  </div>

                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎨</span>
                      <h3 className="text-lg font-bold text-white">Text Style Options</h3>
                    </div>
                    <p className="mb-4 text-sm text-purple-200">
                      Customize how your text appears on the banner.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Text Position
                        </label>
                        <select
                          {...register('textPosition')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="center-left">Center Left</option>
                          <option value="center">Center</option>
                          <option value="center-right">Center Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Text Alignment
                        </label>
                        <select
                          {...register('textAlign')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Animation Style
                        </label>
                        <select
                          {...register('animationStyle')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="zoom">Zoom</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-white">
                          Overlay Style
                        </label>
                        <select
                          {...register('overlayStyle')}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option value="gradient">Gradient</option>
                          <option value="solid">Solid</option>
                          <option value="blur">Blur</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-white/10">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isUpdating} 
                      className="flex-1 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-white font-bold shadow-lg shadow-brand-500/30"
                    >
                      {isUpdating ? '⏳ Saving…' : '✨ Save Text Content'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseTextForm}
                      className="shrink-0 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Banner Editor Modal */}
      <AnimatePresence>
        {isFullEditorOpen && fullEditorBannerId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullEditorOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-4 z-50 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/50 flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    🎨 Full Banner Editor
                  </h2>
                  <p className="mt-1 text-sm text-slate-200">
                    Drag text elements to position them, customize fonts individually
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsFullEditorOpen(false)}
                    className="shrink-0 rounded-xl hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveFullEditor}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-white font-bold shadow-lg shadow-brand-500/30"
                  >
                    {isUpdating ? '⏳ Saving…' : '✨ Save Changes'}
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <BannerEditor
                  imageUrl={editorImageUrl}
                  mediaType={editorMediaType}
                  textElements={editorTextElements}
                  onTextElementsChange={setEditorTextElements}
                  onImageChange={(url, mediaType) => {
                    setEditorImageUrl(url);
                    if (mediaType) {
                      setEditorMediaType(mediaType);
                    }
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBannersPage;

