import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    decreaseItem: (id: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    getCartTotal: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                        isOpen: true,
                    });
                } else {
                    set({ items: [...currentItems, { ...item, quantity: 1 }], isOpen: true });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            decreaseItem: (id) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === id);

                if (existingItem && existingItem.quantity > 1) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                        ),
                    });
                } else {
                    // If quantity is 1, remove it
                    set({ items: currentItems.filter((i) => i.id !== id) });
                }
            },
            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),
            getCartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
