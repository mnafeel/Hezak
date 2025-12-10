import { Prisma } from '../generated/prisma/client';

export type ProductWithCategories = Prisma.ProductGetPayload<{
  include: {
    categories: {
      include: {
        category: true;
      };
    };
  };
}>;

export type CategoryPayload = Prisma.CategoryGetPayload<{
  include: {
    _count?: { select: { products: true } };
    products?: {
      select: {
        id: true;
        name: true;
        itemType: true;
      };
    };
  };
}>;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;

export const serializeMoney = (value: number | null | undefined): number =>
  Number(((value ?? 0) / 100).toFixed(2));

export const serializeProduct = (product: ProductWithCategories | any) => {
  // Safely extract categories from the nested structure
  let categories: Array<{ id: number; name: string; slug: string }> = [];
  
  try {
    if (product.categories && Array.isArray(product.categories)) {
      categories = product.categories
        .map((pc) => {
          try {
            // Handle Prisma structure: { category: {...} }
            if (pc && typeof pc === 'object' && 'category' in pc && pc.category) {
              const cat = pc.category as { id: number | string; name: string; slug: string };
              return {
                id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                name: cat.name,
                slug: cat.slug
              };
            }
            // Handle Firestore structure: { id, name, slug, categoryId, category: {...} }
            if (pc && typeof pc === 'object' && 'category' in pc && pc.category && typeof pc.category === 'object') {
              const cat = pc.category as { id: number | string; name: string; slug: string };
              return {
                id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                name: cat.name,
                slug: cat.slug
              };
            }
            // Handle direct category object (Firestore fallback)
            if (pc && typeof pc === 'object' && 'id' in pc && 'name' in pc && 'slug' in pc) {
              const cat = pc as { id: number | string; name: string; slug: string };
              return {
                id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                name: cat.name,
                slug: cat.slug
              };
            }
            return null;
          } catch (err) {
            console.error('Error mapping category:', err, pc);
            return null;
          }
        })
        .filter((cat): cat is { id: number; name: string; slug: string } => cat !== null && cat.id > 0);
    }
  } catch (error) {
    console.error('Error extracting categories from product:', error, product.id);
    categories = [];
  }
  
  // For backward compatibility, use the first category as the primary category
  // Also handle if product.category is already an object (Firestore case)
  let primaryCategory: { id: number; name: string; slug: string } | null = null;
  
  if (product.category && typeof product.category === 'object' && 'id' in product.category) {
    // Product already has a category object (Firestore case)
    const cat = product.category as { id: number | string; name: string; slug: string };
    primaryCategory = {
      id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
      name: cat.name,
      slug: cat.slug
    };
  } else if (categories.length > 0) {
    // Use first category from categories array
    primaryCategory = categories[0]!;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: serializeMoney(product.priceCents),
    imageUrl: product.imageUrl,
    gallery: (() => {
      try {
        if (Array.isArray(product.gallery)) {
          return (product.gallery as unknown[]).filter((item): item is string => typeof item === 'string');
        }
        // Try to parse if it's a string
        if (typeof product.gallery === 'string') {
          const parsed = JSON.parse(product.gallery);
          return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
        }
        return [];
      } catch {
        return [];
      }
    })(),
    colors: (() => {
      try {
        if (Array.isArray(product.colors)) {
          return (product.colors as Array<Record<string, unknown>>).map((color) => ({
            name: typeof color.name === 'string' ? color.name : '',
            hex: typeof color.hex === 'string' ? color.hex : undefined,
            imageUrl: typeof color.imageUrl === 'string' ? color.imageUrl : undefined
          }));
        }
        if (typeof product.colors === 'string' && product.colors.trim()) {
          const parsed = JSON.parse(product.colors);
          return Array.isArray(parsed) ? parsed.map((color: Record<string, unknown>) => ({
            name: typeof color.name === 'string' ? color.name : '',
            hex: typeof color.hex === 'string' ? color.hex : undefined,
            imageUrl: typeof color.imageUrl === 'string' ? color.imageUrl : undefined
          })) : [];
        }
        return [];
      } catch {
        return [];
      }
    })(),
    sizes: (() => {
      try {
        if (Array.isArray(product.sizes)) {
          return (product.sizes as Array<Record<string, unknown>>).map((size) => ({
            name: typeof size.name === 'string' ? size.name : ''
          }));
        }
        if (typeof product.sizes === 'string' && product.sizes.trim()) {
          const parsed = JSON.parse(product.sizes);
          return Array.isArray(parsed) ? parsed.map((size: Record<string, unknown>) => ({
            name: typeof size.name === 'string' ? size.name : ''
          })) : [];
        }
        return [];
      } catch {
        return [];
      }
    })(),
    itemType: typeof product.itemType === 'string' ? product.itemType : '',
    inventory: product.inventory,
    inventoryVariants: (() => {
      try {
        if (Array.isArray(product.inventoryVariants)) {
          return (product.inventoryVariants as Array<Record<string, unknown>>).map((variant) => ({
            colorName: typeof variant.colorName === 'string' ? variant.colorName : '',
            sizeName: typeof variant.sizeName === 'string' ? variant.sizeName : '',
            quantity: typeof variant.quantity === 'number' ? variant.quantity : 0
          }));
        }
        if (typeof product.inventoryVariants === 'string' && product.inventoryVariants.trim()) {
          const parsed = JSON.parse(product.inventoryVariants);
          return Array.isArray(parsed) ? parsed.map((variant: Record<string, unknown>) => ({
            colorName: typeof variant.colorName === 'string' ? variant.colorName : '',
            sizeName: typeof variant.sizeName === 'string' ? variant.sizeName : '',
            quantity: typeof variant.quantity === 'number' ? variant.quantity : 0
          })) : [];
        }
        return [];
      } catch {
        return [];
      }
    })(),
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: primaryCategory
      ? {
          id: primaryCategory.id,
          name: primaryCategory.name,
          slug: primaryCategory.slug
        }
      : null,
    categories
  };
};

export const serializeCategory = (category: CategoryPayload) => {
  // Extract products from ProductCategory join table
  let products: Array<{ id: number; name: string; itemType: string }> | undefined = undefined;
  
  if (category.products && Array.isArray(category.products)) {
    // Products come through ProductCategory, so we need to extract the product from each
    products = category.products
      .map((pc: unknown) => {
        // Check if it's the new structure (with product nested) or old structure (direct product)
        if (pc && typeof pc === 'object' && 'product' in pc && pc.product) {
          const product = pc.product as { id: number; name: string; itemType?: string };
          return {
            id: product.id,
            name: product.name,
            itemType: product.itemType ?? ''
          };
        }
        // Fallback for direct product structure (shouldn't happen with new schema, but just in case)
        if (pc && typeof pc === 'object' && 'id' in pc && 'name' in pc) {
          const prod = pc as { id: number; name: string; itemType?: string };
          return {
            id: prod.id,
            name: prod.name,
            itemType: prod.itemType ?? ''
          };
        }
        return null;
      })
      .filter((p): p is { id: number; name: string; itemType: string } => p !== null);
    
    // Remove duplicates by id
    const seen = new Set<number>();
    products = products.filter((p) => {
      if (seen.has(p.id)) {
        return false;
      }
      seen.add(p.id);
      return true;
    });
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isTopSelling: category.isTopSelling ?? false,
    isFeatured: category.isFeatured ?? false,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    productCount:
      category._count?.products ??
      (products ? products.length : 0),
    products
  };
};

export const serializeOrder = (order: OrderWithRelations) => ({
  id: order.id,
  status: order.status,
  total: serializeMoney(order.totalCents),
  trackingId: order.trackingId ?? null,
  courierCompany: order.courierCompany ?? null,
  trackingLink: order.trackingLink ?? null,
  orderSource: order.orderSource ?? 'WEBSITE',
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  user: {
    id: order.user.id,
    name: order.user.name,
    email: order.user.email,
    phone: order.user.phone,
    addressLine1: order.user.addressLine1,
    addressLine2: order.user.addressLine2,
    city: order.user.city,
    state: order.user.state,
    postalCode: order.user.postalCode,
    country: order.user.country
  },
  items: order.orderItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: serializeMoney(item.unitPriceCents),
    selectedColor: item.selectedColor
      ? {
          name: item.selectedColor,
          hex: item.selectedColorHex ?? undefined,
          imageUrl: item.selectedColorImage ?? undefined
        }
      : null,
    selectedSize: item.selectedSize ?? null,
    product: {
      id: item.product.id,
      name: item.product.name,
      imageUrl: item.product.imageUrl
    }
  }))
});

