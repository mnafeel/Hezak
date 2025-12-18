import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useCartStore } from '../../store/cart';
import { useFavoritesStore } from '../../store/favorites';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency, cn } from '../../lib/utils';
import type { Product, ProductColorOption, ProductSizeOption } from '../../types';

const composeKey = (productId: number, color?: ProductColorOption | null, size?: ProductSizeOption | null) => {
  const colorKey = color?.name ?? 'none';
  const sizeKey = size?.name ?? 'none';
  return `${productId}:${colorKey}:${sizeKey}`;
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading, isError: productsError, error: productsErrorDetails } = useProducts();
  const user = useUserAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { getTextColor, getGlassPanelClass, getBorderColor, getHoverEffect, getShadowClass, theme: currentTheme } = useThemeColors();

  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSizeOption | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = useMemo(() => {
    if (!id) return null;
    return products.find((p) => p.id === Number.parseInt(id, 10));
  }, [products, id]);

  // Log errors for debugging
  useEffect(() => {
    if (productsError) {
      console.error('❌ ProductDetailPage: Error fetching products:', productsErrorDetails);
    }
  }, [productsError, productsErrorDetails]);

  useEffect(() => {
    if (product) {
      const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] ?? null : null;
      const firstSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] ?? null : null;
      
      // Only update if values actually changed to prevent infinite loops
      setSelectedColor((prev) => {
        if (prev?.name === firstColor?.name && prev?.hex === firstColor?.hex) {
          return prev; // No change, return previous value
        }
        return firstColor;
      });
      
      setSelectedSize((prev) => {
        if (prev?.name === firstSize?.name) {
          return prev; // No change, return previous value
        }
        return firstSize;
      });
    }
  }, [product?.id, product?.colors, product?.sizes]); // Use specific dependencies instead of entire product object

  // Show error state
  if (productsError) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`rounded-2xl p-6 ${getGlassPanelClass()} ${getShadowClass('lg')}`}>
            <h2 className={`text-2xl font-semibold ${getTextColor('primary')} mb-2`}>Error Loading Product</h2>
            <p className={`mt-2 ${getTextColor('secondary')} mb-4`}>
              {productsErrorDetails instanceof Error ? productsErrorDetails.message : 'Failed to load product. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="mt-2">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while products are being fetched
  if (productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400 mb-4" />
          <p className={`text-lg ${getTextColor('secondary')}`}>Loading product...</p>
        </div>
      </div>
    );
  }

  // Show not found only after loading is complete
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`rounded-2xl p-6 ${getGlassPanelClass()} ${getShadowClass('lg')}`}>
            <h2 className={`text-2xl font-semibold ${getTextColor('primary')} mb-2`}>Product not found</h2>
            <p className={`mt-2 ${getTextColor('secondary')} mb-4`}>The product you're looking for doesn't exist.</p>
            <Button variant="secondary" onClick={() => navigate('/')} className="mt-4">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  // Collect all available images from the product
  const allImages = useMemo(() => {
    const images: string[] = [];
    const seenImages = new Set<string>();
    
    // Add primary image first
    if (product.imageUrl && !seenImages.has(product.imageUrl)) {
      images.push(product.imageUrl);
      seenImages.add(product.imageUrl);
    }
    
    // Add all color-specific images
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((color) => {
        if (color.imageUrl && !seenImages.has(color.imageUrl)) {
          images.push(color.imageUrl);
          seenImages.add(color.imageUrl);
        }
      });
    }
    
    // Add gallery images
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((img) => {
        if (img && !seenImages.has(img)) {
          images.push(img);
          seenImages.add(img);
        }
      });
    }
    
    // Ensure at least one placeholder image
    if (images.length === 0) {
      images.push('https://via.placeholder.com/600x600?text=No+Image');
    }
    
    return images;
  }, [product.imageUrl, product.gallery, product.colors]);

  // When color is selected, automatically switch to that color's image
  useEffect(() => {
    if (selectedColor?.imageUrl) {
      // Find the index of the selected color's image
      const colorImageIndex = allImages.findIndex((img) => img === selectedColor.imageUrl);
      if (colorImageIndex !== -1) {
        setCurrentImageIndex(colorImageIndex);
      }
    } else if (product.imageUrl) {
      // If no color selected or color has no image, show primary image
      const primaryImageIndex = allImages.findIndex((img) => img === product.imageUrl);
      if (primaryImageIndex !== -1) {
        setCurrentImageIndex(primaryImageIndex);
      }
    }
  }, [selectedColor, allImages, product.imageUrl]);

  const colorRequired = product.colors.length > 0;
  const sizeRequired = product.sizes.length > 0;
  
  // Get inventory for selected color/size combination
  const getVariantInventory = (): number => {
    // If product has inventory variants, use them
    if (product.inventoryVariants && product.inventoryVariants.length > 0) {
      if (!selectedColor || !selectedSize) {
        // If no color/size selected but variants exist, return 0 (need selection)
        return 0;
      }
      
      const variant = product.inventoryVariants.find(
        (v) => v.colorName === selectedColor.name && v.sizeName === selectedSize.name
      );
      
      return variant ? variant.quantity : 0;
    }
    
    // Fallback to general inventory if no variants
    return product.inventory;
  };
  
  // Get inventory for a specific size with selected color
  const getSizeInventory = (sizeName: string): number => {
    // If product has inventory variants, use them
    if (product.inventoryVariants && product.inventoryVariants.length > 0) {
      if (!selectedColor) {
        // If no color selected but variants exist, return 0 (need selection)
        return 0;
      }
      
      const variant = product.inventoryVariants.find(
        (v) => v.colorName === selectedColor.name && v.sizeName === sizeName
      );
      
      return variant ? variant.quantity : 0;
    }
    
    // Fallback to general inventory if no variants
    return product.inventory;
  };
  
  const variantInventory = getVariantInventory();
  const canAddToCart =
    variantInventory > 0 &&
    (!colorRequired || selectedColor) &&
    (!sizeRequired || selectedSize);

  const currentKey = useMemo(
    () => composeKey(product.id, selectedColor, selectedSize),
    [product.id, selectedColor, selectedSize]
  );

  const cartItem = useMemo(
    () => items.find((item) => item.key === currentKey),
    [items, currentKey]
  );

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!canAddToCart) {
      return;
    }

    addItem(product, {
      color: selectedColor ?? undefined,
      size: selectedSize ?? undefined
    });
    toast.success(`${product.name} added to your cart`);
  };

  const handleIncreaseQuantity = () => {
    if (cartItem && cartItem.quantity < variantInventory) {
      updateQuantity(currentKey, cartItem.quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(currentKey, cartItem.quantity - 1);
    } else if (cartItem) {
      removeItem(currentKey);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 sm:mb-4 text-sm sm:text-base">
        ← Back
      </Button>

      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className={`relative aspect-square overflow-hidden rounded-3xl ${currentTheme === 'light' ? 'bg-gray-100' : currentTheme === 'elegant' ? 'bg-[#f5f1e8]' : currentTheme === 'fashion' ? 'bg-[#f3e8ff]' : 'bg-white/5'}`}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={allImages[currentImageIndex] || allImages[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToImage(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToImage(index)}
                  className={cn(
                    'h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition',
                    index === currentImageIndex
                      ? 'border-brand-400'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-semibold ${getTextColor('primary')} break-words`}>{product.name}</h1>
                <p className="mt-2 text-xl sm:text-2xl font-semibold text-brand-400">{formatCurrency(product.price)}</p>
              </div>
              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(product);
                  if (!favorite) {
                    toast.success(`${product.name} added to favorites ❤️`);
                  } else {
                    toast.success(`${product.name} removed from favorites`);
                  }
                }}
                className={cn(
                  "shrink-0 rounded-full p-3 backdrop-blur-sm transition-all",
                  favorite
                    ? "bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600/90"
                    : `${currentTheme === 'light' ? 'bg-gray-100 text-gray-700' : currentTheme === 'elegant' ? 'bg-[#f5f1e8] text-[#3d2817]' : currentTheme === 'fashion' ? 'bg-[#f3e8ff] text-[#581c87]' : 'bg-white/10 text-slate-300'} hover:bg-white/20 hover:text-red-400`
                )}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <motion.svg
                  className="h-6 w-6"
                  fill={favorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={false}
                  animate={{ scale: favorite ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
              </button>
            </div>
            {product.itemType && (
              <p className={`mt-1 text-sm ${getTextColor('tertiary')}`}>
                Type: <span className={getTextColor('secondary')}>{product.itemType}</span>
              </p>
            )}
          </div>

          <div>
            <p className={`${getTextColor('secondary')} leading-relaxed`}>{product.description}</p>
          </div>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="space-y-3">
              <p className={`text-sm font-semibold uppercase tracking-wide ${getTextColor('tertiary')}`}>
                Color {colorRequired && <span className="text-red-400">*</span>}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      `flex items-center gap-1.5 sm:gap-2 rounded-full border-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium ${currentTheme === 'light' ? 'text-gray-700' : currentTheme === 'elegant' ? 'text-[#3d2817]' : currentTheme === 'fashion' ? 'text-[#581c87]' : 'text-slate-200'} transition`,
                      selectedColor?.name === color.name
                        ? 'border-brand-400 bg-brand-400/10 text-white'
                        : `${currentTheme === 'light' ? 'border-gray-200 bg-gray-50' : currentTheme === 'elegant' ? 'border-[#ddd4c4] bg-[#f5f1e8]' : currentTheme === 'fashion' ? 'border-[#d8b4fe] bg-[#f3e8ff]' : 'border-white/10 bg-white/5'} hover:border-brand-400/50`
                    )}
                  >
                    {color.hex && (
                      <span
                        className={`h-5 w-5 rounded-full border ${currentTheme === 'light' ? 'border-gray-300' : currentTheme === 'elegant' ? 'border-[#ddd4c4]' : currentTheme === 'fashion' ? 'border-[#d8b4fe]' : 'border-white/30'}`}
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span className={selectedColor?.name === color.name ? 'text-white' : (currentTheme === 'light' ? 'text-gray-900' : currentTheme === 'elegant' ? 'text-[#3d2817]' : currentTheme === 'fashion' ? 'text-[#581c87]' : 'text-slate-200')}>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="space-y-3">
              <p className={`text-sm font-semibold uppercase tracking-wide ${getTextColor('tertiary')}`}>
                Size {sizeRequired && <span className="text-red-400">*</span>}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.sizes.map((size) => {
                  const sizeInventory = selectedColor ? getSizeInventory(size.name) : product.inventory;
                  const isOutOfStock = sizeInventory === 0;
                  const isSelected = selectedSize?.name === size.name;
                  
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={cn(
                        'rounded-full border-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium transition relative',
                        isOutOfStock
                          ? 'border-red-500/30 bg-red-500/10 text-red-400/70 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-brand-400 bg-brand-400/10 text-white'
                          : `${currentTheme === 'light' ? 'border-gray-200 bg-gray-50' : currentTheme === 'elegant' ? 'border-[#ddd4c4] bg-[#f5f1e8]' : currentTheme === 'fashion' ? 'border-[#d8b4fe] bg-[#f3e8ff]' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} hover:border-brand-400/50`
                      )}
                    >
                      <span className={isSelected ? 'text-white' : (currentTheme === 'light' ? 'text-gray-900' : currentTheme === 'elegant' ? 'text-[#3d2817]' : currentTheme === 'fashion' ? 'text-[#581c87]' : getTextColor('secondary'))}>{size.name}</span>
                      {isOutOfStock && selectedColor && (
                        <span className={`ml-2 text-xs ${isSelected ? 'text-white/70' : 'text-red-400'}`}>(Out of Stock)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inventory Status */}
          {(selectedColor || selectedSize) && (
            <div className={`rounded-2xl p-4 ${getGlassPanelClass()} ${getShadowClass('md')}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {selectedSize && (
                    <span className={`text-sm font-medium ${getTextColor('secondary')}`}>Size: {selectedSize.name}</span>
                  )}
                  {selectedColor && (
                    <>
                      {selectedSize && <span className={`text-sm ${getTextColor('tertiary')}`}>•</span>}
                      {selectedColor.hex && (
                        <span
                          className="h-4 w-4 rounded-full border border-white/30"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                      )}
                      <span className={`text-sm font-medium ${getTextColor('secondary')}`}>Color: {selectedColor.name}</span>
                    </>
                  )}
                </div>
                {selectedColor && selectedSize ? (
                  <div className={`space-y-2 pt-2 border-t ${getBorderColor()}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${getTextColor('secondary')}`}>
                        Availability for {selectedSize.name} - {selectedColor.name}:
                      </span>
                      {variantInventory > 0 ? (
                        <span className="text-sm font-semibold text-green-400">
                          ✓ {variantInventory} pieces available
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-400">Out of stock</span>
                      )}
                    </div>
                    {variantInventory > 0 && variantInventory <= 5 && (
                      <div className="rounded-lg bg-orange-500/20 border border-orange-500/30 p-2">
                        <p className="text-xs font-semibold text-orange-300">
                          ⚠️ Low Stock: Only {variantInventory} {variantInventory === 1 ? 'piece' : 'pieces'} left!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`pt-2 border-t ${getBorderColor()}`}>
                    <p className={`text-xs ${getTextColor('tertiary')}`}>
                      {!selectedColor && "Please select a color"}
                      {!selectedSize && selectedColor && "Please select a size"}
                      {!selectedSize && !selectedColor && "Please select color and size"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart / Quantity Controls */}
          {cartItem ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${getGlassPanelClass()} ${getShadowClass('sm')}`}>
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={cartItem.quantity <= 1}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-white transition',
                      cartItem.quantity <= 1
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-white/10 active:bg-white/20'
                    )}
                  >
                    −
                  </button>
                  <span className={`min-w-[3rem] text-center text-lg font-semibold ${getTextColor('primary')}`}>
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={cartItem.quantity >= variantInventory}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-white transition',
                      cartItem.quantity >= variantInventory
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-white/10 active:bg-white/20'
                    )}
                  >
                    +
                  </button>
                </div>
                <Button variant="outline" onClick={() => removeItem(currentKey)} className="flex-1">
                  Remove from Cart
                </Button>
              </div>
              <p className={`text-sm ${getTextColor('tertiary')}`}>
                {cartItem.quantity} {cartItem.quantity === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="w-full"
            >
              {(() => {
                // Only show "Sold Out" if both color and size are selected and that variant is out of stock
                if (selectedColor && selectedSize && variantInventory === 0) {
                  return 'Sold Out';
                }
                // If color/size required but not selected, show appropriate message
                if (colorRequired && !selectedColor) {
                  return 'Select Color';
                }
                if (sizeRequired && !selectedSize) {
                  return 'Select Size';
                }
                // Otherwise show Add to Cart
                return 'Add to Cart';
              })()}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

