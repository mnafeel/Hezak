import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveBanners } from '../../hooks/useBanners';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from '../../lib/utils';

const BannerSlideshow = () => {
  const { data: banners = [], isLoading } = useActiveBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useThemeColors();
  const navigate = useNavigate();

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-800/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
        </div>
      </div>
    );
  }
  
  // Get aspect ratio classes based on mobileAspectRatio setting (will be set after currentBanner is available)
  const getAspectRatioClasses = (mobileRatio?: string | null) => {
    const ratio = mobileRatio || '4/3';
    const mobileClass = ratio === '4/3' ? 'aspect-[4/3]' : ratio === '16/9' ? 'aspect-[16/9]' : 'aspect-[21/9]';
    return `${mobileClass} sm:aspect-[16/9] md:aspect-[21/9]`;
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const textPosition = currentBanner.textPosition || 'bottom-left';
  const textAlign = currentBanner.textAlign || 'left';
  const animationStyle = currentBanner.animationStyle || 'fade';
  const overlayStyle = currentBanner.overlayStyle || 'gradient';
  const mobileAspectRatio = currentBanner.mobileAspectRatio || '4/3';
  
  // Get aspect ratio classes based on mobileAspectRatio setting
  const getAspectRatioClasses = () => {
    const mobileRatio = mobileAspectRatio === '4/3' ? 'aspect-[4/3]' : mobileAspectRatio === '16/9' ? 'aspect-[16/9]' : 'aspect-[21/9]';
    return `${mobileRatio} sm:aspect-[16/9] md:aspect-[21/9]`;
  };

  const getAnimationProps = () => {
    switch (animationStyle) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 1.1 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        };
      case 'none':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
      default: // fade
        return {
          initial: { opacity: 0, scale: 1.05 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 }
        };
    }
  };

  const getOverlayClass = () => {
    switch (overlayStyle) {
      case 'solid':
        return 'bg-black/50';
      case 'blur':
        return 'backdrop-blur-md bg-black/30';
      case 'none':
        return '';
      default: // gradient
        return 'bg-gradient-to-t from-black/70 via-black/30 to-black/10';
    }
  };

  const getTextPositionClass = () => {
    const positions: Record<string, string> = {
      'top-left': 'items-start justify-start',
      'top-center': 'items-start justify-center',
      'top-right': 'items-start justify-end',
      'center-left': 'items-center justify-start',
      'center': 'items-center justify-center',
      'center-right': 'items-center justify-end',
      'bottom-left': 'items-end justify-start',
      'bottom-center': 'items-end justify-center',
      'bottom-right': 'items-end justify-end'
    };
    return positions[textPosition] || 'items-end justify-start';
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];
  const textPosition = currentBanner.textPosition || 'bottom-left';
  const textAlign = currentBanner.textAlign || 'left';
  const animationStyle = currentBanner.animationStyle || 'fade';
  const overlayStyle = currentBanner.overlayStyle || 'gradient';
  const mobileAspectRatio = currentBanner.mobileAspectRatio || '4/3';

  return (
    <div className={`relative w-full ${getAspectRatioClasses(mobileAspectRatio)} rounded-3xl overflow-hidden`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          {...getAnimationProps()}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {currentBanner.linkUrl ? (
            <Link 
              to={currentBanner.linkUrl} 
              className="block h-full w-full"
              onClick={(e) => {
                // Prevent banner link navigation if clicking on a product-linked image
                const target = e.target as HTMLElement;
                const productLink = target.closest('[data-product-link]');
                if (productLink) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }}
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                const productLink = target.closest('[data-product-link]');
                if (productLink) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {currentBanner.mediaType === 'video' && currentBanner.videoUrl ? (
                <video
                  src={currentBanner.videoUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || 'Banner'}
                  className="h-full w-full object-cover"
                />
              )}
              {/* Render textElements if available, otherwise fall back to title/text */}
              {Array.isArray(currentBanner.textElements) && currentBanner.textElements.length > 0 ? (
                <>
                  {currentBanner.textElements.map((element) => {
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
                        <motion.span
                          key={element.id}
                          {...getAnimationProps()}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            fontFamily: element.fontFamily,
                            fontSize: `${element.fontSize}px`,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            textAlign: element.textAlign,
                            textShadow: element.textShadow,
                            letterSpacing: `${element.letterSpacing || 0}px`,
                            lineHeight: element.lineHeight || 1.2,
                            maxWidth: '80%',
                          }}
                        >
                          {element.content}
                        </motion.span>
                      );
                    }

                    // Render image element with product link
                    if (element.type === 'image') {
                      const imageElement = element as any; // Type assertion for image element
                      const imageWidth = imageElement.width ?? 20; // Default to 20% if not set
                      const imageHeight = imageElement.height ?? undefined; // Optional height
                      
                      console.log('Rendering image element:', {
                        id: imageElement.id,
                        width: imageWidth,
                        height: imageHeight,
                        x: imageElement.x,
                        y: imageElement.y,
                        productId: imageElement.productId
                      });
                      
                      const imageContent = (
                        <motion.div
                          {...getAnimationProps()}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${imageElement.x}%`,
                            top: `${imageElement.y}%`,
                            width: `${imageWidth}%`,
                            height: imageHeight ? `${imageHeight}%` : 'auto',
                            pointerEvents: 'none', // Allow clicks to pass through to parent
                            minWidth: '50px', // Ensure minimum size
                            minHeight: imageHeight ? undefined : '50px',
                          }}
                        >
                          <img
                            src={imageElement.imageUrl}
                            alt="Banner element"
                            className="w-full h-full object-contain rounded-lg shadow-lg hover:scale-105 transition-transform"
                            style={{ 
                              pointerEvents: 'none',
                              width: '100%',
                              height: imageHeight ? '100%' : 'auto',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        </motion.div>
                      );

                      // Use clickable button with navigate for product links
                      if (imageElement.productId) {
                        const handleProductClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          e.preventDefault();
                          e.nativeEvent.stopImmediatePropagation();
                          const url = imageElement.productUrl || `/product/${imageElement.productId}`;
                          console.log('Product link clicked:', url, 'Product ID:', imageElement.productId);
                          // Navigate immediately
                          navigate(url);
                        };

                        return (
                          <button
                            key={imageElement.id}
                            type="button"
                            data-product-link="true"
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-[100] cursor-pointer border-none bg-transparent p-0 outline-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg"
                            style={{
                              left: `${imageElement.x}%`,
                              top: `${imageElement.y}%`,
                              width: `${imageWidth}%`,
                              height: imageHeight ? `${imageHeight}%` : 'auto',
                              pointerEvents: 'auto',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              minWidth: '50px',
                              minHeight: imageHeight ? undefined : '50px',
                            }}
                            onClick={handleProductClick}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseUp={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const url = imageElement.productUrl || `/product/${imageElement.productId}`;
                              navigate(url);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            aria-label={`View product ${imageElement.productId}`}
                          >
                            {imageContent}
                          </button>
                        );
                      }

                      return (
                        <div 
                          key={imageElement.id} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ 
                            left: `${imageElement.x}%`,
                            top: `${imageElement.y}%`,
                            width: `${imageWidth}%`, 
                            height: imageHeight ? `${imageHeight}%` : 'auto',
                            minWidth: '50px',
                            minHeight: imageHeight ? undefined : '50px',
                          }}
                        >
                          {imageContent}
                        </div>
                      );
                    }

                    return null;
                  })}
                </>
              ) : (currentBanner.title || currentBanner.text) ? (
                <div className={cn("absolute inset-0 flex", getOverlayClass(), getTextPositionClass())}>
                  <div className={cn(
                    "w-full p-6 sm:p-8 md:p-12 lg:p-16 text-white",
                    textAlign === 'left' && 'text-left',
                    textAlign === 'center' && 'text-center',
                    textAlign === 'right' && 'text-right'
                  )}>
                    {currentBanner.title && (
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 drop-shadow-2xl"
                        style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
                      >
                        {currentBanner.title}
                      </motion.h2>
                    )}
                    {currentBanner.text && (
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 max-w-4xl leading-relaxed drop-shadow-lg"
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
                      >
                        {currentBanner.text}
                      </motion.p>
                    )}
                  </div>
                </div>
              ) : null}
            </Link>
          ) : (
            <>
              {currentBanner.mediaType === 'video' && currentBanner.videoUrl ? (
                <video
                  src={currentBanner.videoUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || 'Banner'}
                  className="h-full w-full object-cover"
                />
              )}
              {/* Render textElements if available, otherwise fall back to title/text */}
              {Array.isArray(currentBanner.textElements) && currentBanner.textElements.length > 0 ? (
                <>
                  {currentBanner.textElements.map((element) => {
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
                        <motion.span
                          key={element.id}
                          {...getAnimationProps()}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            fontFamily: element.fontFamily,
                            fontSize: `${element.fontSize}px`,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            textAlign: element.textAlign,
                            textShadow: element.textShadow,
                            letterSpacing: `${element.letterSpacing || 0}px`,
                            lineHeight: element.lineHeight || 1.2,
                            maxWidth: '80%',
                          }}
                        >
                          {element.content}
                        </motion.span>
                      );
                    }

                    // Render image element with product link
                    if (element.type === 'image') {
                      const imageElement = element as any; // Type assertion for image element
                      const imageWidth = imageElement.width ?? 20; // Default to 20% if not set
                      const imageHeight = imageElement.height ?? undefined; // Optional height
                      
                      console.log('Rendering image element:', {
                        id: imageElement.id,
                        width: imageWidth,
                        height: imageHeight,
                        x: imageElement.x,
                        y: imageElement.y,
                        productId: imageElement.productId
                      });
                      
                      const imageContent = (
                        <motion.div
                          {...getAnimationProps()}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${imageElement.x}%`,
                            top: `${imageElement.y}%`,
                            width: `${imageWidth}%`,
                            height: imageHeight ? `${imageHeight}%` : 'auto',
                            pointerEvents: 'none', // Allow clicks to pass through to parent
                            minWidth: '50px', // Ensure minimum size
                            minHeight: imageHeight ? undefined : '50px',
                          }}
                        >
                          <img
                            src={imageElement.imageUrl}
                            alt="Banner element"
                            className="w-full h-full object-contain rounded-lg shadow-lg hover:scale-105 transition-transform"
                            style={{ 
                              pointerEvents: 'none',
                              width: '100%',
                              height: imageHeight ? '100%' : 'auto',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        </motion.div>
                      );

                      // Use clickable button with navigate for product links
                      if (imageElement.productId) {
                        const handleProductClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          e.preventDefault();
                          e.nativeEvent.stopImmediatePropagation();
                          const url = imageElement.productUrl || `/product/${imageElement.productId}`;
                          console.log('Product link clicked:', url, 'Product ID:', imageElement.productId);
                          // Navigate immediately
                          navigate(url);
                        };

                        return (
                          <button
                            key={imageElement.id}
                            type="button"
                            data-product-link="true"
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-[100] cursor-pointer border-none bg-transparent p-0 outline-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 rounded-lg"
                            style={{
                              left: `${imageElement.x}%`,
                              top: `${imageElement.y}%`,
                              width: `${imageWidth}%`,
                              height: imageHeight ? `${imageHeight}%` : 'auto',
                              pointerEvents: 'auto',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              minWidth: '50px',
                              minHeight: imageHeight ? undefined : '50px',
                            }}
                            onClick={handleProductClick}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseUp={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const url = imageElement.productUrl || `/product/${imageElement.productId}`;
                              navigate(url);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            aria-label={`View product ${imageElement.productId}`}
                          >
                            {imageContent}
                          </button>
                        );
                      }

                      return (
                        <div 
                          key={imageElement.id} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ 
                            left: `${imageElement.x}%`,
                            top: `${imageElement.y}%`,
                            width: `${imageWidth}%`, 
                            height: imageHeight ? `${imageHeight}%` : 'auto',
                            minWidth: '50px',
                            minHeight: imageHeight ? undefined : '50px',
                          }}
                        >
                          {imageContent}
                        </div>
                      );
                    }

                    return null;
                  })}
                </>
              ) : (currentBanner.title || currentBanner.text) ? (
                <div className={cn("absolute inset-0 flex", getOverlayClass(), getTextPositionClass())}>
                  <div className={cn(
                    "w-full p-6 sm:p-8 md:p-12 lg:p-16 text-white",
                    textAlign === 'left' && 'text-left',
                    textAlign === 'center' && 'text-center',
                    textAlign === 'right' && 'text-right'
                  )}>
                    {currentBanner.title && (
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 drop-shadow-2xl"
                        style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
                      >
                        {currentBanner.title}
                      </motion.h2>
                    )}
                    {currentBanner.text && (
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 max-w-4xl leading-relaxed drop-shadow-lg"
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
                      >
                        {currentBanner.text}
                      </motion.p>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Only show if more than one banner */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous banner"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next banner"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than one banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlideshow;

