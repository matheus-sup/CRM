"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface FloatingCartProps {
    config?: any;
}

export function FloatingCart({ config }: FloatingCartProps) {
    const { items, toggleCart } = useCart();
    const themeColor = config?.themeColor || "#ef4444";

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalItems === 0) return null;

    return (
        <button
            onClick={toggleCart}
            className="fixed bottom-20 left-4 right-4 z-40 flex items-center justify-between p-4 rounded-xl shadow-xl text-white transition-transform hover:scale-[1.02] active:scale-[0.98] md:bottom-6 md:left-auto md:right-6 md:w-auto md:min-w-[280px]"
            style={{ backgroundColor: themeColor }}
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-xs font-bold flex items-center justify-center"
                        style={{ color: themeColor }}
                    >
                        {totalItems}
                    </span>
                </div>
                <span className="font-semibold">Ver sacola</span>
            </div>

            <span className="font-bold text-lg">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
        </button>
    );
}
