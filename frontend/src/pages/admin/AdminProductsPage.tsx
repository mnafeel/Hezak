import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { createProduct, deleteProduct, updateProduct, uploadImage } from '../../lib/api';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { showError } from '../../lib/errorHandler';
import type {
  Product,
  ProductColorOption,
  ProductFormPayload,
  ProductSizeOption,
  InventoryVariant
} from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ProductForm extends ProductFormPayload {
  gallery: string[];
  colors: ProductColorOption[];
  sizes: ProductSizeOption[];
  inventoryVariants: InventoryVariant[];
}

const emptyProduct: ProductForm = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  gallery: [],
  colors: [],
  sizes: [],
  itemType: '',
  inventory: 0,
  inventoryVariants: [],
  categoryIds: []
};

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const { data: products = [] } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<ProductForm>({
    defaultValues: emptyProduct
  });
  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor
  } = useFieldArray({
    control,
    name: 'colors'
  });
  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize
  } = useFieldArray({
    control,
    name: 'sizes'
  });
  const watchedColors = watch('colors');
  const watchedGallery = watch('gallery');
  const primaryImageUrl = watch('imageUrl');
  const addGalleryImage = (url = '') => {
    const next = [...(watchedGallery ?? [])];
    next.push(url);
    setValue('gallery', next, { shouldDirty: true });
  };

  const updateGalleryImage = (index: number, value: string) => {
    const next = [...(watchedGallery ?? [])];
    next[index] = value;
    setValue('gallery', next, { shouldDirty: true });
  };

  const removeGalleryImage = (index: number) => {
    const next = [...(watchedGallery ?? [])];
    next.splice(index, 1);
    setValue('gallery', next, { shouldDirty: true });
  };

  const pickAndUploadImage = async (onUploaded: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      try {
        const result = await uploadImage(file);
        onUploaded(result.url);
        toast.success('Image uploaded');
      } catch (error) {
        showError(error, 'Failed to upload image. Please try again or check the file size (max 15MB).');
      }
    };

    input.click();
  };

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    }
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductForm> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    }
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    }
  });

  const onSubmit = async (values: ProductForm) => {
    try {
      // Validate that primary image is uploaded
      if (!values.imageUrl || values.imageUrl.trim().length === 0) {
        toast.error('Please upload a primary image for the product');
        return;
      }

      // Validate imageUrl is a valid URL
      try {
        new URL(values.imageUrl);
      } catch {
        toast.error('Primary image URL is invalid. Please upload the image again.');
        return;
      }

      const sanitizedColors =
        values.colors
          ?.map((color) => {
            const trimmedName = color?.name?.trim() ?? '';
            const trimmedHex = color?.hex?.trim();
            const trimmedImageUrl = color?.imageUrl?.trim();
            
            // Only include color if name is provided
            if (!trimmedName || trimmedName.length === 0) {
              return null;
            }
            
            return {
              name: trimmedName,
              hex: trimmedHex && trimmedHex.length > 0 && trimmedHex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/i) ? trimmedHex : undefined,
              imageUrl: trimmedImageUrl && trimmedImageUrl.length > 0 ? trimmedImageUrl : undefined
            };
          })
          .filter((color): color is NonNullable<typeof color> => color !== null) ?? [];

      const sanitizedSizes =
        values.sizes
          ?.map((size) => ({
            name: size?.name?.trim() ?? ''
          }))
          .filter((size) => size.name.length > 0) ?? [];

      // Validate and sanitize gallery images
      const sanitizedGallery =
        values.gallery
          ?.map((image) => image?.trim())
          .filter((image): image is string => {
            if (!image || image.length === 0) return false;
            try {
              new URL(image);
              return true;
            } catch {
              return false;
            }
          }) ?? [];

      // Filter out inventory variants with empty color or size names
      const validInventoryVariants = (values.inventoryVariants ?? []).filter(
        (variant) => 
          variant.colorName && 
          variant.colorName.trim().length > 0 && 
          variant.sizeName && 
          variant.sizeName.trim().length > 0
      );

      const payload: ProductForm = {
        ...values,
        itemType: values.itemType?.trim() || '',
        categoryIds: values.categoryIds ?? [],
        price: Number(values.price),
        inventory: 0, // Not used - inventory is managed by inventoryVariants
        inventoryVariants: validInventoryVariants,
        colors: sanitizedColors,
        sizes: sanitizedSizes,
        gallery: sanitizedGallery
      };

      if (editingProductId) {
        await updateMutation({ id: editingProductId, data: payload });
        toast.success('Product updated');
      } else {
        await createMutation(payload);
        toast.success('Product created');
      }
      setEditingProductId(null);
      reset(emptyProduct);
    } catch (error: unknown) {
      showError(error, 'Failed to save product. Please check all fields and try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setIsFormOpen(true);
    // Get category IDs from categories array or fallback to single category
    const categoryIds = product.categories && product.categories.length > 0
      ? product.categories.map((cat) => cat.id)
      : product.category
      ? [product.category.id]
      : [];
    
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      gallery: product.gallery ?? [],
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
      itemType: product.itemType ?? '',
      inventory: 0, // Not used - inventory is managed by inventoryVariants
      inventoryVariants: product.inventoryVariants ?? [],
      categoryIds
    });
  };

  const handleAddNew = () => {
    setEditingProductId(null);
    setIsFormOpen(true);
    reset(emptyProduct);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProductId(null);
    reset(emptyProduct);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation(id);
      toast.success('Product deleted');
      if (editingProductId === id) {
        setEditingProductId(null);
        reset(emptyProduct);
      }
    } catch (error) {
      showError(error, 'Failed to delete product. Please try again.');
    }
  };

  useEffect(() => {
    setEditingProductId(null);
    reset(emptyProduct);
  }, [reset]);

  return (
    <div className="space-y-8">
      <Card title="Product catalogue" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} in catalogue
          </p>
          <Button onClick={handleAddNew} size="lg">
            + Add Product
          </Button>
        </div>
        <div className="space-y-4">
          {products.length ? (
            products.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-brand-400/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                        {(product.categories && product.categories.length > 0
                          ? product.categories
                          : product.category
                          ? [product.category]
                          : []
                        ).map((cat) => (
                          <Badge key={cat.id} className="bg-brand-500/20 text-brand-200 border border-brand-400/30">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-300">{product.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span>
                          {(product.categories && product.categories.length > 0
                            ? product.categories.map((cat) => cat.name).join(', ')
                            : product.category?.name ?? 'Uncategorised'
                          )}
                        </span>
                        {product.itemType && <span>{product.itemType}</span>}
                        <span>{formatCurrency(product.price)}</span>
                        <span>Added {formatDate(product.createdAt)}</span>
                      </div>
                      {/* Color and Size Variants with Quantities */}
                      {product.inventoryVariants && product.inventoryVariants.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                            Inventory by Color & Size:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {product.inventoryVariants.map((variant, idx) => {
                              const color = product.colors.find((c) => c.name === variant.colorName);
                              const size = product.sizes.find((s) => s.name === variant.sizeName);
                              if (!color || !size) return null;
                              
                              return (
                                <div
                                  key={`${variant.colorName}-${variant.sizeName}-${idx}`}
                                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                                >
                                  {color.hex && (
                                    <span
                                      className="h-4 w-4 shrink-0 rounded-full border border-white/30"
                                      style={{ backgroundColor: color.hex }}
                                      title={color.name}
                                    />
                                  )}
                                  <span className="text-xs text-slate-300 font-medium">
                                    {color.name}
                                  </span>
                                  <span className="text-xs text-slate-400">-</span>
                                  <span className="text-xs text-slate-300 font-medium">
                                    {size.name}
                                  </span>
                                  <span className="ml-auto text-xs font-semibold text-brand-400">
                                    {variant.quantity} pcs
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (product.colors.length > 0 || product.sizes.length > 0) ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                          {product.colors.length > 0 && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                              Colors:
                              <span className="flex items-center gap-1">
                                {product.colors.slice(0, 4).map((color) => (
                                  <span
                                    key={color.name}
                                    className="h-3 w-3 rounded-full border border-white/40"
                                    title={color.name}
                                    style={{ backgroundColor: color.hex ?? '#fff' }}
                                  />
                                ))}
                                {product.colors.length > 4 && (
                                  <span>+{product.colors.length - 4}</span>
                                )}
                              </span>
                            </span>
                          )}
                          {product.sizes.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                              Sizes:
                              <span className="flex gap-1">
                                {product.sizes.slice(0, 4).map((size) => (
                                  <span key={size.name}>{size.name}</span>
                                ))}
                                {product.sizes.length > 4 && (
                                  <span>+{product.sizes.length - 4}</span>
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-300">
              Start enriching your catalogue by adding premium items.
            </p>
          )}
        </div>
      </Card>

      {/* Product Form Modal */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <Card
                title={editingProductId ? 'Update product' : 'Add new product'}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <Button variant="ghost" onClick={handleCloseForm} className="shrink-0">
                    ✕ Close
                  </Button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Product name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Item type"
            placeholder="e.g. Top Selling, Luxury Handbag, Baby Dress"
            {...register('itemType', { 
              required: 'Item type is required',
              minLength: { value: 1, message: 'Item type must be at least 1 character' }
            })}
            error={errors.itemType?.message}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Categories <span className="text-slate-300">(Select multiple)</span>
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3">
              {categories.length > 0 ? (
                categories.map((category) => {
                  const categoryIds = watch('categoryIds') ?? [];
                  const isSelected = categoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200 transition hover:bg-white/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = watch('categoryIds') ?? [];
                          if (e.target.checked) {
                            setValue('categoryIds', [...currentIds, category.id], { shouldDirty: true });
                          } else {
                            setValue('categoryIds', currentIds.filter((id) => id !== category.id), { shouldDirty: true });
                          }
                        }}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-white">{category.name}</span>
                        {category.isTopSelling && (
                          <span className="ml-2 text-xs text-brand-300">🔥 Top Selling</span>
                        )}
                        {category.isFeatured && (
                          <span className="ml-2 text-xs text-purple-300">⭐ Featured</span>
                        )}
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-xs text-slate-300">No categories available. Create categories first.</p>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Products can belong to multiple categories. Select all categories this product should appear in.
            </p>
          </div>
          
          <Textarea
            label="Description"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />
          <div className="space-y-2">
            <input
              type="hidden"
              {...register('imageUrl', { required: 'Primary image is required' })}
            />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt="Primary product"
                  className="h-48 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-slate-200">
                  Upload a primary image to showcase this product.
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  pickAndUploadImage((url) => setValue('imageUrl', url, { shouldDirty: true }))
                }
              >
                {primaryImageUrl ? 'Replace image' : 'Upload image'}
              </Button>
              {primaryImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                >
                  Remove
                </Button>
              )}
            </div>
            {errors.imageUrl?.message && (
              <p className="text-xs text-red-300">{errors.imageUrl?.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Gallery images</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => pickAndUploadImage((url) => addGalleryImage(url))}
                >
                  Upload image
                </Button>
              </div>
            </div>
            {(watchedGallery?.length ?? 0) === 0 && (
              <p className="text-xs text-slate-300">
                Optional gallery used for variants or detail views.
              </p>
            )}
            <div className="space-y-3">
              {(watchedGallery ?? []).map((value, index) => (
                <div key={`${index}-${value}`} className="flex items-center gap-3">
                  <img
                    src={value}
                    alt={`Gallery ${index + 1}`}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      pickAndUploadImage((url) => updateGalleryImage(index, url))
                    }
                  >
                    Replace
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => removeGalleryImage(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              step="0.01"
              label="Price"
              {...register('price', {
                required: 'Price is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Price must be positive' }
              })}
              error={errors.price?.message}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Color options</p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => appendColor({ name: '', hex: '', imageUrl: '' })}
              >
                Add color
              </Button>
            </div>
            {colorFields.length === 0 && (
              <p className="text-xs text-slate-300">
                Add colors to showcase swatches and allow shoppers to select variants.
              </p>
            )}
            <div className="space-y-4">
              {colorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Color {index + 1}</p>
                    <Button type="button" variant="ghost" onClick={() => removeColor(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Name"
                        {...register(`colors.${index}.name` as const, {
                          required: 'Color name is required'
                        })}
                        error={errors.colors?.[index]?.name?.message}
                      />
                      <Input
                        label="Hex code"
                        placeholder="#FFFFFF"
                        {...register(`colors.${index}.hex` as const)}
                        error={errors.colors?.[index]?.hex?.message}
                      />
                    </div>
                    <input
                      type="hidden"
                      {...register(`colors.${index}.imageUrl` as const)}
                    />
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-300">
                        Select Image for {watchedColors?.[index]?.name || 'this color'}
                      </label>
                      {(() => {
                        // Get all available images: primary + gallery
                        const allImages = [
                          primaryImageUrl,
                          ...(watchedGallery ?? [])
                        ].filter(Boolean) as string[];
                        const selectedImageUrl = watchedColors?.[index]?.imageUrl;
                        
                        if (allImages.length === 0) {
                          return (
                            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center">
                              <p className="text-xs text-slate-400 mb-2">
                                Upload primary image or gallery images first
                              </p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  pickAndUploadImage((url) => {
                                    setValue('imageUrl', url, { shouldDirty: true });
                                  })
                                }
                              >
                                Upload Primary Image
                              </Button>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {allImages.map((imageUrl, imgIndex) => {
                                const isSelected = selectedImageUrl === imageUrl;
                                return (
                                  <button
                                    key={imgIndex}
                                    type="button"
                                    onClick={() =>
                                      setValue(`colors.${index}.imageUrl` as const, imageUrl, {
                                        shouldDirty: true
                                      })
                                    }
                                    className={`
                                      relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                                      ${isSelected 
                                        ? 'border-brand-400 ring-2 ring-brand-400/50 shadow-lg shadow-brand-400/30' 
                                        : 'border-white/10 hover:border-white/30 hover:scale-105'
                                      }
                                    `}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Image ${imgIndex + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-brand-400/20 flex items-center justify-center">
                                        <div className="rounded-full bg-brand-400 p-1.5">
                                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedImageUrl ? (
                              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={selectedImageUrl}
                                    alt="Selected"
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                  <span className="text-xs text-slate-300">
                                    Selected for {watchedColors?.[index]?.name || 'this color'}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setValue(`colors.${index}.imageUrl` as const, '', {
                                      shouldDirty: true
                                    })
                                  }
                                >
                                  Clear
                                </Button>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 text-center py-2">
                                Click an image above to assign it to this color
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Preview:</span>
                    <span
                      className="h-6 w-6 rounded-full border border-white/20"
                      style={{
                        backgroundColor:
                          watchedColors?.[index]?.hex && watchedColors[index]?.hex !== ''
                            ? watchedColors[index]!.hex
                            : '#1f2937'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Size options</p>
              <Button type="button" variant="ghost" onClick={() => appendSize({ name: '' })}>
                Add size
              </Button>
            </div>
            {sizeFields.length === 0 && (
              <p className="text-xs text-slate-300">
                Add available sizes (e.g., S, M, L) for shopper selection.
              </p>
            )}
            <div className="space-y-3">
              {sizeFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label={`Size ${index + 1}`}
                      {...register(`sizes.${index}.name` as const, {
                        required: 'Size name is required'
                      })}
                      error={errors.sizes?.[index]?.name?.message}
                    />
                  </div>
                  <Button type="button" variant="ghost" onClick={() => removeSize(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Variants Management */}
          {(watchedColors && watchedColors.length > 0) || (sizeFields.length > 0) ? (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Inventory by Color & Size</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Set quantity for each color and size combination (e.g., Red - M: 10 pieces)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const colors = watch('colors') ?? [];
                    const sizes = watch('sizes') ?? [];
                    const currentVariants = watch('inventoryVariants') ?? [];
                    
                    // Generate all combinations - filter out empty names
                    const allCombinations: InventoryVariant[] = [];
                    colors.forEach((color) => {
                      sizes.forEach((size) => {
                        // Only add if both color and size have valid names
                        if (color.name && color.name.trim() && size.name && size.name.trim()) {
                          const existing = currentVariants.find(
                            (v) => v.colorName === color.name && v.sizeName === size.name
                          );
                          if (!existing) {
                            allCombinations.push({
                              colorName: color.name.trim(),
                              sizeName: size.name.trim(),
                              quantity: 0
                            });
                          }
                        }
                      });
                    });
                    
                    setValue('inventoryVariants', [...currentVariants, ...allCombinations], {
                      shouldDirty: true
                    });
                  }}
                >
                  Generate All Combinations
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(watch('inventoryVariants') ?? [])
                  .filter((variant) => 
                    variant.colorName && 
                    variant.colorName.trim() && 
                    variant.sizeName && 
                    variant.sizeName.trim()
                  )
                  .map((variant, index) => {
                    const colors = watch('colors') ?? [];
                    const sizes = watch('sizes') ?? [];
                    const color = colors.find((c) => c.name === variant.colorName);
                    const size = sizes.find((s) => s.name === variant.sizeName);
                    
                    if (!color || !size) return null;
                    
                    // Find the actual index in the full array for form registration
                    const fullVariants = watch('inventoryVariants') ?? [];
                    const actualIndex = fullVariants.findIndex(
                      (v) => v.colorName === variant.colorName && v.sizeName === variant.sizeName
                    );
                    
                    if (actualIndex === -1) return null;
                  
                  return (
                    <div
                      key={`${variant.colorName}-${variant.sizeName}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {color.hex && (
                          <span
                            className="h-6 w-6 rounded-full border border-white/30"
                            style={{ backgroundColor: color.hex }}
                          />
                        )}
                        <span className="text-sm font-medium text-white">{color.name}</span>
                        <span className="text-sm text-slate-400">-</span>
                        <span className="text-sm font-medium text-white">{size.name}</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        className="w-24"
                        {...register(`inventoryVariants.${actualIndex}.quantity` as const, {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Must be 0 or more' }
                        })}
                        placeholder="Qty"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const current = watch('inventoryVariants') ?? [];
                          const updated = current.filter(
                            (_, i) => i !== actualIndex
                          );
                          setValue('inventoryVariants', updated, { shouldDirty: true });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
                
                {(watch('inventoryVariants') ?? []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Click "Generate All Combinations" to create inventory entries for all color/size combinations.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400 text-center">
                Add colors and sizes first to manage inventory by variant.
              </p>
            </div>
          )}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" size="lg" disabled={isCreating || isUpdating} className="flex-1">
                      {isCreating || isUpdating
                        ? 'Saving…'
                        : editingProductId
                          ? 'Update product'
                          : 'Create product'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseForm}
                      className="shrink-0"
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
    </div>
  );
};

export default AdminProductsPage;

