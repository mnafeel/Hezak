import { create } from 'zustand';
import type { Product, ProductColorOption, ProductSizeOption } from '../types';

export interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  selectedColor?: ProductColorOption | null;
  selectedSize?: ProductSizeOption | null;
}

interface CartState {
  items: CartItem[];
  shouldOpenCart: boolean;
  addItem: (
    product: Product,
    options?: {
      color?: ProductColorOption | null;
      size?: ProductSizeOption | null;
    },
    quantity?: number
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  setShouldOpenCart: (open: boolean) => void;
}

const composeKey = (productId: number, color?: ProductColorOption | null, size?: ProductSizeOption | null) => {
  const colorKey = color?.name ?? 'none';
  const sizeKey = size?.name ?? 'none';
  return `${productId}:${colorKey}:${sizeKey}`;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  shouldOpenCart: false,
  addItem: (product, options = {}, quantity = 1) => {
    const { color = null, size = null } = options;
    const key = composeKey(product.id, color, size);

    // Get inventory for this specific variant
    const getVariantInventory = (): number => {
      if (!color || !size || !product.inventoryVariants) {
        return product.inventory; // Fallback to general inventory
      }
      
      const variant = product.inventoryVariants.find(
        (v) => v.colorName === color.name && v.sizeName === size.name
      );
      
      return variant ? variant.quantity : 0;
    };

    const variantInventory = getVariantInventory();

    set((state) => {
      const existing = state.items.find((item) => item.key === key);

      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, variantInventory);
        return {
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity: newQuantity } : item
          ),
          shouldOpenCart: true
        };
      }

      return {
        items: [
          ...state.items,
          {
            key,
            product,
            selectedColor: color,
            selectedSize: size,
            quantity: Math.min(quantity, variantInventory)
          }
        ],
        shouldOpenCart: true
      };
    });
  },
  removeItem: (key) =>
    set((state) => ({
      items: state.items.filter((item) => item.key !== key)
    })),
  updateQuantity: (key, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.key === key);
      if (!item) return state;

      // Get inventory for this specific variant
      const getVariantInventory = (): number => {
        const { product, selectedColor, selectedSize } = item;
        if (!selectedColor || !selectedSize || !product.inventoryVariants) {
          return product.inventory; // Fallback to general inventory
        }
        
        const variant = product.inventoryVariants.find(
          (v) => v.colorName === selectedColor.name && v.sizeName === selectedSize.name
        );
        
        return variant ? variant.quantity : 0;
      };

      const variantInventory = getVariantInventory();

      return {
        items: state.items.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(1, Math.min(quantity, variantInventory)) }
            : item
        )
      };
    }),
  clear: () => set({ items: [], shouldOpenCart: false }),
  total: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  setShouldOpenCart: (open: boolean) => set({ shouldOpenCart: open })
}));

