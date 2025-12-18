import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BannerElement, BannerTextElement, BannerImageElement } from '../../types';
import { cn } from '../../lib/utils';
import { uploadImage, fetchProducts } from '../../lib/api';
import type { Product } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BannerEditorProps {
  imageUrl: string;
  mediaType?: 'image' | 'video';
  textElements: BannerElement[];
  onTextElementsChange: (elements: BannerElement[]) => void;
  onImageChange: (url: string, mediaType?: 'image' | 'video') => void;
  onClose?: () => void;
}

const BannerEditor = ({ 
  imageUrl, 
  mediaType = 'image',
  textElements, 
  onTextElementsChange,
  onImageChange,
  onClose 
}: BannerEditorProps) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [mobileImageUrl, setMobileImageUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const selectedElement = textElements.find(el => el.id === selectedElementId);
  
  // Load products for product linking
  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);
  
  // Filter products based on search term
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.id.toString().includes(productSearchTerm)
  );

  const handleAddText = () => {
    const newElement: BannerTextElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
      textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
      letterSpacing: 0,
      lineHeight: 1.2,
      animation: 'fade',
      animationDelay: 0,
      animationDuration: 0.5
    };
    onTextElementsChange([...textElements, newElement]);
    setSelectedElementId(newElement.id);
    toast.success('Text element added! Click and drag to position it.');
  };

  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const response = await uploadImage(file);
          const newElement: BannerImageElement = {
            id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'image',
            imageUrl: response.url,
            productId: null,
            productUrl: null,
            x: 50,
            y: 50,
            width: 20,
            animation: 'fade',
            animationDelay: 0,
            animationDuration: 0.5
          };
          onTextElementsChange([...textElements, newElement]);
          setSelectedElementId(newElement.id);
          toast.success('Image element added! Click and drag to position it, then link to a product.');
        } catch (error) {
          toast.error('Failed to upload image');
          console.error('Failed to upload image:', error);
        }
      }
    };
    input.click();
  };

  const handleDeleteElement = (id: string) => {
    const element = textElements.find(el => el.id === id);
    const elementType = element?.type === 'image' ? 'image' : 'text';
    if (window.confirm(`Are you sure you want to delete this ${elementType} element?`)) {
      onTextElementsChange(textElements.filter(el => el.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
      toast.success(`${elementType === 'image' ? 'Image' : 'Text'} element deleted`);
    }
  };

  const handleUpdateElement = useCallback((id: string, updates: Partial<BannerElement>) => {
    onTextElementsChange(
      textElements.map(el => {
        if (el.id === id) {
          // Preserve the type when updating
          if (el.type === 'text') {
            return { ...el, ...updates } as BannerTextElement;
          } else if (el.type === 'image') {
            return { ...el, ...updates } as BannerImageElement;
          }
        }
        return el;
      })
    );
  }, [textElements, onTextElementsChange]);

  const handleLinkProduct = (elementId: string, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleUpdateElement(elementId, {
        productId: product.id,
        productUrl: `/product/${product.id}`
      });
      setShowProductSelector(false);
      toast.success(`Linked to product: ${product.name}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(elementId);
    setSelectedElementId(elementId);
    
    const element = textElements.find(el => el.id === elementId);
    if (!element || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Use mobile properties if in mobile preview mode, otherwise use desktop
    const currentX = previewMode === 'mobile' && (element.mobileX !== undefined || (element.type === 'image' && element.mobileX !== undefined)) 
      ? (element.type === 'image' ? element.mobileX : element.mobileX) || element.x
      : element.x;
    const currentY = previewMode === 'mobile' && (element.mobileY !== undefined || (element.type === 'image' && element.mobileY !== undefined))
      ? (element.type === 'image' ? element.mobileY : element.mobileY) || element.y
      : element.y;
    
    // Calculate the element's current position in pixels
    // For image elements, use width to calculate center offset
    const elementWidthPixels = element.type === 'image' 
      ? ((previewMode === 'mobile' && element.mobileWidth !== undefined ? element.mobileWidth : element.width) / 100) * rect.width 
      : 0;
    const elementXPixels = (currentX / 100) * rect.width;
    const elementYPixels = (currentY / 100) * rect.height;
    
    // Calculate offset from element center to mouse click position
    setDragOffset({
      x: mouseX - elementXPixels,
      y: mouseY - elementYPixels
    });
  };

  useEffect(() => {
    if (isDragging && dragOffset !== null && containerRef.current) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !isDragging || dragOffset === null) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position relative to container
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate new position: mouse position minus the offset, converted to percentage
        const newXPercent = Math.max(0, Math.min(100, ((mouseX - dragOffset.x) / rect.width) * 100));
        const newYPercent = Math.max(0, Math.min(100, ((mouseY - dragOffset.y) / rect.height) * 100));
        
        // Update only the dragging element - use mobile properties if in mobile preview mode
        const updatedElements = textElements.map(el => {
          if (el.id !== isDragging) return el;
          
          if (previewMode === 'mobile') {
            // Update mobile properties
            if (el.type === 'image') {
              return { ...el, mobileX: newXPercent, mobileY: newYPercent };
            } else {
              return { ...el, mobileX: newXPercent, mobileY: newYPercent };
            }
          } else {
            // Update desktop properties
            return { ...el, x: newXPercent, y: newYPercent };
          }
        });
        onTextElementsChange(updatedElements);
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(null);
        setDragOffset(null);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mouseleave', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragOffset, textElements, onTextElementsChange, previewMode]);

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Courier New', 'Roboto', 'Open Sans', 'Lato',
    'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather'
  ];

  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
  ];

  return (
    <div className="flex h-full gap-4 overflow-hidden">
      {/* Banner Canvas */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white">Banner Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,video/*';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    try {
                      if (file.type.startsWith('video/')) {
                        const { uploadVideo } = await import('../../lib/api');
                        const response = await uploadVideo(file);
                        onImageChange(response.url, 'video');
                        toast.success('Video uploaded successfully!');
                      } else {
                        const response = await uploadImage(file);
                        onImageChange(response.url, 'image');
                        toast.success('Image uploaded successfully!');
                      }
                    } catch (error) {
                      toast.error('Failed to upload file');
                      console.error('Failed to upload file:', error);
                    }
                  }
                };
                input.click();
              }}
              className="text-brand-300 hover:text-brand-200"
            >
              📤 Change Media
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddText}
              className="text-brand-300 hover:text-brand-200"
            >
              ➕ Add Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddImage}
              className="text-purple-300 hover:text-purple-200"
            >
              🖼️ Add Image
            </Button>
          </div>
        </div>
        
        {/* Preview Mode Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-slate-300">Preview Mode:</span>
          <div className="flex gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                previewMode === 'mobile'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
            >
              📱 Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                previewMode === 'desktop'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
            >
              💻 Desktop
            </button>
          </div>
        </div>

        {/* Mobile Image Upload */}
        {previewMode === 'mobile' && (
          <div className="mb-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              📱 Mobile Background Image (Optional - uses desktop image if not set)
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      try {
                        const response = await uploadImage(file);
                        setMobileImageUrl(response.url);
                        toast.success('Mobile image uploaded!');
                      } catch (error) {
                        toast.error('Failed to upload image');
                        console.error('Failed to upload file:', error);
                      }
                    }
                  };
                  input.click();
                }}
                className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              >
                {mobileImageUrl ? '🔄 Replace Mobile Image' : '📤 Upload Mobile Image'}
              </Button>
              {mobileImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileImageUrl('')}
                  className="hover:bg-red-500/20 hover:text-red-300"
                >
                  🗑️ Remove
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Desktop Preview */}
        {previewMode === 'desktop' && (
          <div
            ref={containerRef}
            className="relative flex-1 aspect-[21/9] w-full rounded-2xl border-2 border-white/20 bg-slate-900 overflow-hidden"
            onClick={(e) => {
              if (e.target === containerRef.current) {
                setSelectedElementId(null);
              }
            }}
          >
          {imageUrl ? (
            <>
              {(mediaType === 'video' || imageUrl.match(/\.(mp4|webm|ogg|mov)$/i) || imageUrl.includes('video')) ? (
                <video
                  src={imageUrl}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              )}
              {/* Text and Image Elements */}
              {textElements.map((element) => {
                const animation = element.animation || 'fade';
                const delay = element.animationDelay || 0;
                const duration = element.animationDuration || 0.5;
                
                const getAnimationProps = () => {
                  switch (animation) {
                    case 'slide':
                      return {
                        initial: { opacity: 0, x: -50 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay, duration }
                      };
                    case 'zoom':
                      return {
                        initial: { opacity: 0, scale: 0.5 },
                        animate: { opacity: 1, scale: 1 },
                        transition: { delay, duration }
                      };
                    case 'bounce':
                      return {
                        initial: { opacity: 0, y: -50 },
                        animate: { opacity: 1, y: 0 },
                        transition: { delay, duration, type: 'spring', stiffness: 200 }
                      };
                    case 'pulse':
                      return {
                        animate: { 
                          opacity: [1, 0.7, 1],
                          scale: [1, 1.05, 1]
                        },
                        transition: { delay, duration: duration * 2, repeat: Infinity }
                      };
                    case 'none':
                      return {
                        initial: { opacity: 1 },
                        animate: { opacity: 1 }
                      };
                    default: // fade
                      return {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { delay, duration }
                      };
                  }
                };

                // Render text element
                if (element.type === 'text') {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none z-10",
                        selectedElementId === element.id && "ring-2 ring-brand-400 ring-offset-2 rounded-lg z-20",
                        isDragging === element.id && "z-30"
                      )}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        fontFamily: element.fontFamily,
                        fontSize: `${element.fontSize}px`,
                        fontWeight: element.fontWeight,
                        color: element.color || '#FFFFFF',
                        textAlign: element.textAlign,
                        textShadow: element.textShadow || '2px 2px 8px rgba(0,0,0,0.8)',
                        letterSpacing: `${element.letterSpacing || 0}px`,
                        lineHeight: element.lineHeight || 1.2,
                        maxWidth: '80%',
                        padding: selectedElementId === element.id ? '8px' : '4px',
                        pointerEvents: 'auto',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMouseDown(e, element.id);
                      }}
                    >
                      <motion.span
                        {...getAnimationProps()}
                        style={{ display: 'block' }}
                      >
                        {element.content || 'Empty Text'}
                      </motion.span>
                      {selectedElementId === element.id && isDragging === element.id && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-brand-500/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-40 pointer-events-none">
                          🖱️ Dragging...
                        </div>
                      )}
                    </div>
                  );
                }

                // Render image element
                if (element.type === 'image') {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none z-10",
                        selectedElementId === element.id && "ring-2 ring-purple-400 ring-offset-2 rounded-lg z-20",
                        isDragging === element.id && "z-30",
                        element.productId && "cursor-pointer"
                      )}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: element.height ? `${element.height}%` : 'auto',
                        padding: selectedElementId === element.id ? '4px' : '2px',
                        pointerEvents: 'auto',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMouseDown(e, element.id);
                      }}
                    >
                      <motion.div
                        {...getAnimationProps()}
                        className="relative w-full h-full"
                      >
                        <img
                          src={element.imageUrl}
                          alt="Banner element"
                          className="w-full h-full object-contain rounded-lg shadow-lg"
                          style={{
                            border: selectedElementId === element.id ? '2px solid rgb(196, 181, 253)' : '2px solid transparent'
                          }}
                          draggable={false}
                        />
                        {element.productId && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-500/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-40 pointer-events-none">
                            🔗 Linked to Product
                          </div>
                        )}
                      </motion.div>
                      {selectedElementId === element.id && isDragging === element.id && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-purple-500/90 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-40 pointer-events-none">
                          🖱️ Dragging...
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
              <p className="text-lg">Upload an image or video to start editing</p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const response = await uploadImage(file);
                          onImageChange(response.url, 'image');
                          toast.success('Image uploaded successfully!');
                        } catch (error) {
                          toast.error('Failed to upload image');
                          console.error('Failed to upload image:', error);
                        }
                      }
                    };
                    input.click();
                  }}
                  className="text-brand-300 hover:text-brand-200"
                >
                  📤 Upload Image
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const { uploadVideo } = await import('../../lib/api');
                          const response = await uploadVideo(file);
                          onImageChange(response.url, 'video');
                          toast.success('Video uploaded successfully!');
                        } catch (error) {
                          toast.error('Failed to upload video');
                          console.error('Failed to upload video:', error);
                        }
                      }
                    };
                    input.click();
                  }}
                  className="text-purple-300 hover:text-purple-200"
                >
                  🎥 Upload Video
                </Button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Mobile Preview */}
        {previewMode === 'mobile' && (
          <div
            ref={mobileContainerRef}
            className="relative flex-1 aspect-[4/3] w-full max-w-md mx-auto rounded-2xl border-2 border-white/20 bg-slate-900 overflow-hidden"
            onClick={(e) => {
              if (e.target === mobileContainerRef.current) {
                setSelectedElementId(null);
              }
            }}
          >
            {(mobileImageUrl || imageUrl) ? (
              <>
                <img
                  src={mobileImageUrl || imageUrl}
                  alt="Mobile Banner"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                {/* Text and Image Elements - Same elements but in mobile aspect ratio */}
                {textElements.map((element) => {
                  const animation = element.animation || 'fade';
                  const delay = element.animationDelay || 0;
                  const duration = element.animationDuration || 0.5;
                  
                  const getAnimationProps = () => {
                    switch (animation) {
                      case 'slide':
                        return {
                          initial: { opacity: 0, x: -50 },
                          animate: { opacity: 1, x: 0 },
                          transition: { delay, duration }
                        };
                      case 'zoom':
                        return {
                          initial: { opacity: 0, scale: 0.5 },
                          animate: { opacity: 1, scale: 1 },
                          transition: { delay, duration }
                        };
                      case 'bounce':
                        return {
                          initial: { opacity: 0, y: -50 },
                          animate: { opacity: 1, y: 0 },
                          transition: { delay, duration, type: 'spring', stiffness: 200 }
                        };
                      case 'pulse':
                        return {
                          animate: { 
                            opacity: [1, 0.7, 1],
                            scale: [1, 1.05, 1]
                          },
                          transition: { delay, duration: duration * 2, repeat: Infinity }
                        };
                      case 'none':
                        return {
                          initial: { opacity: 1 },
                          animate: { opacity: 1 }
                        };
                      default: // fade
                        return {
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          transition: { delay, duration }
                        };
                    }
                  };

                  // Render text element
                  if (element.type === 'text') {
                    return (
                      <div
                        key={element.id}
                        className={cn(
                          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none z-10",
                          selectedElementId === element.id && "ring-2 ring-brand-400 ring-offset-2 rounded-lg z-20",
                          isDragging === element.id && "z-30"
                        )}
                      style={{
                        left: `${element.mobileX !== undefined ? element.mobileX : element.x}%`,
                        top: `${element.mobileY !== undefined ? element.mobileY : element.y}%`,
                        fontFamily: element.fontFamily,
                        fontSize: `${element.mobileFontSize !== undefined ? element.mobileFontSize : Math.max(12, element.fontSize * 0.7)}px`,
                        fontWeight: element.fontWeight,
                        color: element.color || '#FFFFFF',
                        textAlign: element.textAlign,
                        textShadow: element.textShadow || '2px 2px 8px rgba(0,0,0,0.8)',
                        letterSpacing: `${element.letterSpacing || 0}px`,
                        lineHeight: element.lineHeight || 1.2,
                        maxWidth: '80%',
                        padding: selectedElementId === element.id ? '8px' : '4px',
                        pointerEvents: 'auto',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMouseDown(e, element.id);
                        }}
                      >
                        <motion.span
                          {...getAnimationProps()}
                          style={{ display: 'block' }}
                        >
                          {element.content || 'Empty Text'}
                        </motion.span>
                      </div>
                    );
                  }

                  // Render image element
                  if (element.type === 'image') {
                    return (
                      <div
                        key={element.id}
                        className={cn(
                          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none z-10",
                          selectedElementId === element.id && "ring-2 ring-purple-400 ring-offset-2 rounded-lg z-20",
                          isDragging === element.id && "z-30"
                        )}
                        style={{
                          left: `${element.mobileX !== undefined ? element.mobileX : element.x}%`,
                          top: `${element.mobileY !== undefined ? element.mobileY : element.y}%`,
                          width: `${element.mobileWidth !== undefined ? element.mobileWidth : element.width}%`,
                          height: element.mobileHeight !== undefined 
                            ? `${element.mobileHeight}%` 
                            : element.height 
                            ? `${element.height}%` 
                            : 'auto',
                          padding: selectedElementId === element.id ? '4px' : '2px',
                          pointerEvents: 'auto',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMouseDown(e, element.id);
                        }}
                      >
                        <motion.div
                          {...getAnimationProps()}
                          className="relative w-full h-full"
                        >
                          <img
                            src={element.imageUrl}
                            alt="Banner element"
                            className="w-full h-full object-contain rounded-lg shadow-lg"
                            style={{
                              border: selectedElementId === element.id ? '2px solid rgb(196, 181, 253)' : '2px solid transparent'
                            }}
                            draggable={false}
                          />
                        </motion.div>
                      </div>
                    );
                  }

                  return null;
                })}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                <p className="text-lg">Upload an image to preview mobile view</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Elements List & Editor */}
      <div className="w-96 space-y-4 overflow-y-auto flex-shrink-0">
        {/* Elements List */}
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📝</span>
            Elements ({textElements.length})
          </h3>
          <div className="space-y-2">
            {textElements.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm mb-4">No elements yet</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddText}
                    className="text-brand-300 hover:text-brand-200"
                  >
                    ➕ Add Text
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddImage}
                    className="text-purple-300 hover:text-purple-200"
                  >
                    🖼️ Add Image
                  </Button>
                </div>
              </div>
            ) : (
              textElements.map((element) => (
                <div
                  key={element.id}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all",
                    selectedElementId === element.id
                      ? element.type === 'image' 
                        ? "border-purple-400 bg-purple-500/20"
                        : "border-brand-400 bg-brand-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                  onClick={() => setSelectedElementId(element.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {element.type === 'text' ? (
                        <>
                          <p className="text-sm font-semibold text-white truncate">
                            {element.content || 'Empty Text'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {element.fontSize}px • {element.fontFamily} • {element.fontWeight}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-purple-300">🖼️ Image</span>
                            {element.productId && (
                              <span className="text-xs text-green-400">🔗 Linked</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {element.width}% width
                            {element.productId && ` • Product #${element.productId}`}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title={`Delete ${element.type} element`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Element Editor */}
        {selectedElement ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 p-4 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {selectedElement.type === 'image' ? 'Edit Image Element' : 'Edit Text Element'}
              </h3>
              <button
                onClick={() => setSelectedElementId(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                title="Close editor"
              >
                ✕
              </button>
            </div>

            {selectedElement.type === 'image' ? (
              /* Image Element Editor */
              <>
                {/* Image Preview */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <img
                    src={selectedElement.imageUrl}
                    alt="Element preview"
                    className="w-full h-auto rounded-lg max-h-32 object-contain"
                  />
                </div>

                {/* Desktop Position */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 mb-3">
                  <label className="block text-sm font-semibold text-blue-200 mb-3">
                    💻 Desktop Position
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-blue-300 mb-1">
                        X Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-300 mb-1">
                        Y Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Position - Info only */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 mb-3">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">
                    📱 Mobile Position
                  </label>
                  <p className="text-xs text-purple-300 mb-2">
                    Switch to Mobile preview mode and drag the element to set mobile position. Mobile position will be saved automatically when you drag in mobile preview.
                  </p>
                  <div className="text-xs text-purple-400">
                    {selectedElement.mobileX !== undefined && selectedElement.mobileY !== undefined ? (
                      <>Mobile: X={selectedElement.mobileX.toFixed(1)}%, Y={selectedElement.mobileY.toFixed(1)}%</>
                    ) : (
                      <>Using desktop position (drag in mobile preview to set separate mobile position)</>
                    )}
                  </div>
                </div>

                {/* Desktop Size */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 mb-3">
                  <label className="block text-sm font-semibold text-blue-200 mb-3">
                    💻 Desktop Size
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-blue-300 mb-1">
                        Width (%): {selectedElement.width}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={selectedElement.width}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-300 mb-1">
                        Height (%)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="0.1"
                        value={selectedElement.height || ''}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { height: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="Auto"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Size - Info only */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 mb-3">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">
                    📱 Mobile Size
                  </label>
                  <p className="text-xs text-purple-300">
                    Mobile size uses desktop size by default. Adjust desktop size above and it will apply to mobile unless you set a separate mobile position (which scales proportionally).
                  </p>
                </div>

                {/* Product Link */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                  <label className="block text-sm font-semibold text-white mb-3">
                    🔗 Link to Product
                  </label>
                  {selectedElement.productId ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-sm text-white">
                          Product ID: {selectedElement.productId}
                        </span>
                        <button
                          onClick={() => handleUpdateElement(selectedElement.id, { productId: null, productUrl: null })}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove Link
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProductSelector(true)}
                        className="w-full text-purple-300 hover:text-purple-200"
                      >
                        🔄 Change Product
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProductSelector(true)}
                      className="w-full text-purple-300 hover:text-purple-200"
                    >
                      ➕ Link to Product
                    </Button>
                  )}
                </div>

                {/* Animation */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Animation Style
                  </label>
                  <select
                    value={selectedElement.animation || 'fade'}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { animation: e.target.value as BannerImageElement['animation'] })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                  >
                    <option value="fade">Fade In</option>
                    <option value="slide">Slide In</option>
                    <option value="zoom">Zoom In</option>
                    <option value="bounce">Bounce</option>
                    <option value="pulse">Pulse</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Animation Timing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Delay: {selectedElement.animationDelay || 0}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={selectedElement.animationDelay || 0}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { animationDelay: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Duration: {selectedElement.animationDuration || 0.5}s
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={selectedElement.animationDuration || 0.5}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { animationDuration: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Text Element Editor */
              <>
                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 resize-none"
                    rows={3}
                    placeholder="Enter text content..."
                  />
                </div>

            {/* Desktop Position */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 mb-3">
              <label className="block text-sm font-semibold text-blue-200 mb-3">
                💻 Desktop Position
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-blue-300 mb-1">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={selectedElement.x}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-blue-300 mb-1">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={selectedElement.y}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Position - Info only */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 mb-3">
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                📱 Mobile Position
              </label>
              <p className="text-xs text-purple-300 mb-2">
                Switch to Mobile preview mode and drag the element to set mobile position. Mobile position will be saved automatically when you drag in mobile preview.
              </p>
              <div className="text-xs text-purple-400">
                {selectedElement.mobileX !== undefined && selectedElement.mobileY !== undefined ? (
                  <>Mobile: X={selectedElement.mobileX.toFixed(1)}%, Y={selectedElement.mobileY.toFixed(1)}%</>
                ) : (
                  <>Using desktop position (drag in mobile preview to set separate mobile position)</>
                )}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Font Size: {selectedElement.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={selectedElement.fontSize}
                onChange={(e) => handleUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Mobile font size auto-scales to 70% of desktop size. Switch to mobile preview and drag to adjust mobile position separately.
              </p>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Font Family
              </label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => handleUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                style={{ fontFamily: selectedElement.fontFamily }}
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Font Weight
              </label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) => handleUpdateElement(selectedElement.id, { fontWeight: e.target.value as BannerTextElement['fontWeight'] })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              >
                {fontWeights.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Text Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={selectedElement.color || '#FFFFFF'}
                  onChange={(e) => {
                    handleUpdateElement(selectedElement.id, { color: e.target.value });
                  }}
                  className="w-16 h-12 rounded-xl border border-white/10 cursor-pointer"
                  style={{ 
                    backgroundColor: selectedElement.color || '#FFFFFF',
                  }}
                />
                <input
                  type="text"
                  value={selectedElement.color || '#FFFFFF'}
                  onChange={(e) => {
                    const newColor = e.target.value.trim();
                    if (newColor.match(/^#[0-9A-Fa-f]{6}$/) || 
                        newColor.match(/^rgb\(|^rgba\(/) ||
                        newColor.match(/^[a-zA-Z]+$/) ||
                        newColor === '') {
                      handleUpdateElement(selectedElement.id, { color: newColor || '#FFFFFF' });
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Use hex color (e.g., #FF0000) or RGB/RGBA
              </p>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Text Alignment
              </label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleUpdateElement(selectedElement.id, { textAlign: align })}
                    className={cn(
                      "flex-1 p-3 rounded-xl border transition-all text-sm font-semibold",
                      selectedElement.textAlign === align
                        ? "border-brand-400 bg-brand-500/20 text-brand-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {align === 'left' && '⬅️ Left'}
                    {align === 'center' && '↔️ Center'}
                    {align === 'right' && '➡️ Right'}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Letter Spacing: {selectedElement.letterSpacing || 0}px
              </label>
              <input
                type="range"
                min="-2"
                max="10"
                step="0.1"
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => handleUpdateElement(selectedElement.id, { letterSpacing: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Line Height: {selectedElement.lineHeight || 1.2}
              </label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                value={selectedElement.lineHeight || 1.2}
                onChange={(e) => handleUpdateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Animation Style */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Animation Style
              </label>
              <select
                value={selectedElement.animation || 'fade'}
                onChange={(e) => handleUpdateElement(selectedElement.id, { animation: e.target.value as BannerTextElement['animation'] })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              >
                <option value="fade">Fade In</option>
                <option value="slide">Slide In</option>
                <option value="zoom">Zoom In</option>
                <option value="bounce">Bounce</option>
                <option value="pulse">Pulse (Continuous)</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* Animation Delay */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Animation Delay: {selectedElement.animationDelay || 0}s
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={selectedElement.animationDelay || 0}
                onChange={(e) => handleUpdateElement(selectedElement.id, { animationDelay: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Animation Duration */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Animation Duration: {selectedElement.animationDuration || 0.5}s
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={selectedElement.animationDuration || 0.5}
                onChange={(e) => handleUpdateElement(selectedElement.id, { animationDuration: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Text Shadow */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Text Shadow
              </label>
              <input
                type="text"
                value={selectedElement.textShadow || '2px 2px 8px rgba(0,0,0,0.8)'}
                onChange={(e) => handleUpdateElement(selectedElement.id, { textShadow: e.target.value })}
                placeholder="2px 2px 8px rgba(0,0,0,0.8)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
              <p className="text-xs text-slate-400 mt-1">
                CSS text-shadow value (e.g., "2px 2px 8px rgba(0,0,0,0.8)")
              </p>
            </div>
              </>
            )}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-center text-slate-400">
            <p className="text-sm">Select a text element to edit</p>
          </div>
        )}
      </div>

      {/* Product Selector Modal */}
      <AnimatePresence>
        {showProductSelector && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowProductSelector(false);
                setProductSearchTerm('');
              }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-black/50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select Product to Link</h2>
                  <p className="text-sm text-slate-400 mt-1">Choose a product to link this image to</p>
                </div>
                <button
                  onClick={() => {
                    setShowProductSelector(false);
                    setProductSearchTerm('');
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-white/10">
                <Input
                  type="text"
                  placeholder="Search products by name or ID..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/10 hover:border-brand-400/50"
                        onClick={() => {
                          if (selectedElement && selectedElement.type === 'image') {
                            handleLinkProduct(selectedElement.id, product.id);
                            setProductSearchTerm('');
                          }
                        }}
                      >
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-white/10" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-white truncate">{product.name}</p>
                          <p className="text-sm text-slate-400 mt-1">ID: {product.id}</p>
                          <p className="text-sm text-brand-300 font-medium mt-1">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="text-brand-300 font-medium flex items-center gap-2">
                          <span>Select</span>
                          <span>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-lg mb-2">No products found</p>
                    {productSearchTerm && (
                      <p className="text-sm">Try a different search term</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BannerEditor;
