import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { updateCartDB } from '@/lib/actions/cart';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    slug?: string;
    quantity: number;
    // Dimensões para cálculo de frete
    weight?: number;  // kg
    height?: number;  // cm
    width?: number;   // cm
    length?: number;  // cm
    // Metadata para informações adicionais (lentes, variantes, etc)
    metadata?: {
        variant?: string;
        lensType?: string;
        lensThickness?: string;
        lensTreatment?: string;
        lensDescription?: string;
        [key: string]: unknown;
    };
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    addItemSilent: (item: CartItem) => void;
    removeItem: (id: string) => void;
    decreaseItem: (id: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    closeCart: () => void;
    getCartTotal: () => number;
    syncWithUser: () => Promise<void>;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                let newItems;
                if (existingItem) {
                    newItems = currentItems.map((i) =>
                        i.id === item.id ? { ...i, ...item, quantity: i.quantity + 1 } : i
                    );
                } else {
                    newItems = [...currentItems, { ...item, quantity: 1 }];
                }

                set({ items: newItems, isOpen: true });
                updateCartDB(newItems);
            },
            addItemSilent: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                let newItems;
                if (existingItem) {
                    newItems = currentItems.map((i) =>
                        i.id === item.id ? { ...i, ...item, quantity: i.quantity + 1 } : i
                    );
                } else {
                    newItems = [...currentItems, { ...item, quantity: 1 }];
                }

                set({ items: newItems });
                updateCartDB(newItems);
            },
            removeItem: (id) => {
                const newItems = get().items.filter((i) => i.id !== id);
                set({ items: newItems });
                updateCartDB(newItems);
            },
            decreaseItem: (id) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === id);

                let newItems;
                if (existingItem && existingItem.quantity > 1) {
                    newItems = currentItems.map((i) =>
                        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                    );
                } else {
                    newItems = currentItems.filter((i) => i.id !== id);
                }

                set({ items: newItems });
                updateCartDB(newItems);
            },
            clearCart: () => {
                set({ items: [] });
                updateCartDB([]);
            },
            toggleCart: () => set({ isOpen: !get().isOpen }),
            closeCart: () => set({ isOpen: false }),
            getCartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
            syncWithUser: async () => {
                const { syncCart } = await import("@/lib/actions/cart");
                const currentItems = get().items;
                const res = await syncCart(currentItems);
                if (res.success) {
                    set({ items: res.items });
                }
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
