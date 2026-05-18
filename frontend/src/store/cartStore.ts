import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { calculateCartVat, getProductUnitPrice } from '@/utils/formatters';

interface StoredCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  addedAt: number;
}

interface CartStore {
  items: StoredCartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getVatTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const maxQty = Math.max(0, product.stockQuantity);
        if (maxQty < 1) return;

        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, maxQty);
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: nextQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                productId: product.id,
                quantity: Math.min(quantity, maxQty),
                product,
                addedAt: Date.now(),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        const item = get().items.find((i) => i.productId === productId);
        const capped = item ? Math.min(quantity, Math.max(1, item.product.stockQuantity)) : quantity;
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity: capped } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + getProductUnitPrice(item.product) * item.quantity;
        }, 0);
      },

      getVatTotal: () => calculateCartVat(get().items),

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: 'agt-cart' }
  )
);
