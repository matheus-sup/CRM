"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, Search, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface Addon {
    id: string;
    name: string;
    price: number;
}

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    images?: string[];
    addons?: Addon[];
}

interface ProductDetailSheetProps {
    product: Product | null;
    open: boolean;
    onClose: () => void;
    config?: any;
}

export function ProductDetailSheet({ product, open, onClose, config }: ProductDetailSheetProps) {
    const themeColor = config?.themeColor || "#3b82f6";
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
    const { addItem } = useCart();

    // Reset state when product changes
    useEffect(() => {
        if (product) {
            setQuantity(1);
            setSelectedAddons({});
        }
    }, [product?.id]);

    if (!product) return null;

    // Sample addons - in production these would come from the product
    const addons: Addon[] = product.addons || [
        { id: "catupiry", name: "Catupiry", price: 4 },
        { id: "cheddar", name: "Cheddar", price: 4 },
        { id: "bacon-extra", name: "Bacon Extra", price: 5 },
        { id: "ovo", name: "Ovo", price: 3 },
        { id: "milho", name: "Milho", price: 2 },
    ];

    const toggleAddon = (addonId: string) => {
        const currentCount = Object.values(selectedAddons).filter(Boolean).length;
        const isSelected = selectedAddons[addonId];

        // Limit to 5 addons
        if (!isSelected && currentCount >= 5) return;

        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: !prev[addonId]
        }));
    };

    const calculateTotal = () => {
        let total = product.price * quantity;
        addons.forEach(addon => {
            if (selectedAddons[addon.id]) {
                total += addon.price * quantity;
            }
        });
        return total;
    };

    const handleAddToCart = () => {
        // Create cart item with addons info
        const selectedAddonsList = addons.filter(a => selectedAddons[a.id]);
        const addonsText = selectedAddonsList.length > 0
            ? ` (+ ${selectedAddonsList.map(a => a.name).join(", ")})`
            : "";

        addItem({
            id: `${product.id}-${Date.now()}`, // Unique ID for items with different addons
            name: product.name + addonsText,
            price: calculateTotal() / quantity, // Price per unit including addons
            image: product.images?.[0] || "",
            quantity: quantity,
        });

        onClose();
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="bottom"
                className="h-[90vh] sm:h-[85vh] p-0 rounded-t-3xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <SheetHeader className="flex-shrink-0 flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <SheetTitle className="text-sm font-medium uppercase tracking-wide">
                            Detalhes do Item
                        </SheetTitle>
                    </button>
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Product Image */}
                    {product.images?.[0] && (
                        <div className="w-full h-48 sm:h-64 relative bg-gray-100">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="p-4 bg-white border-b">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {product.name}
                                </h2>
                                {product.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                        <p
                            className="text-lg font-bold mt-3"
                            style={{ color: themeColor }}
                        >
                            R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                    </div>

                    {/* Addons Section */}
                    {addons.length > 0 && (
                        <div className="bg-gray-50">
                            <div className="px-4 py-3 bg-gray-100">
                                <h3 className="font-semibold text-gray-900">Adicionais</h3>
                                <p className="text-sm text-gray-500">Escolha até 5 opções</p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {addons.map((addon) => (
                                    <div
                                        key={addon.id}
                                        className="flex items-center justify-between px-4 py-3 bg-white"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{addon.name}</p>
                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: themeColor }}
                                            >
                                                R$ {addon.price.toFixed(2).replace(".", ",")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleAddon(addon.id)}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                selectedAddons[addon.id]
                                                    ? "text-white"
                                                    : "border-2 text-gray-400 hover:border-gray-400"
                                            )}
                                            style={selectedAddons[addon.id] ? { backgroundColor: themeColor } : { borderColor: '#d1d5db' }}
                                        >
                                            {selectedAddons[addon.id] ? (
                                                <span className="text-sm font-bold">✓</span>
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spacer for bottom bar */}
                    <div className="h-24" />
                </div>

                {/* Fixed Bottom Bar */}
                <div className="flex-shrink-0 border-t bg-white p-4 safe-area-bottom">
                    <div className="flex items-center gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-lg font-bold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: themeColor }}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            className="flex-1 h-12 text-white font-bold text-base rounded-xl"
                            style={{ backgroundColor: themeColor }}
                            onClick={handleAddToCart}
                        >
                            Adicionar  R$ {calculateTotal().toFixed(2).replace(".", ",")}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
