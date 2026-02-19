"use client";

import { useEffect, useState, useTransition } from "react";
import { ProductGrid } from "@/components/admin/pdv/ProductGrid";
import { PosCart } from "@/components/admin/pdv/PosCart";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    barcode?: string | null;
    images?: string[];
}

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export function PdvManager({ initialProducts }: { initialProducts: Product[] }) {
    const [products] = useState<Product[]>(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const lower = search.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.sku?.toLowerCase().includes(lower) ||
            (p.barcode && p.barcode.includes(lower))
        );
        setFilteredProducts(filtered);
    }, [search, products]);

    const handleAddToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast({
                title: "Produto sem estoque",
                description: `O produto ${product.name} está esgotado.`,
            });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            const newQty = item.quantity + delta;

            if (newQty <= 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index] = { ...item, quantity: newQty };
            }
            return newCart;
        });
    };

    const handleRemoveItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearCart = () => {
        if (confirm("Tem certeza que deseja limpar o carrinho?")) {
            setCart([]);
        }
    };

    const handleCheckout = () => {
        toast({
            title: "Finalizar Venda",
            description: "Funcionalidade de checkout será implementada a seguir.",
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F9") {
                if (cart.length > 0) handleCheckout();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cart]);

    return (
        <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] overflow-hidden bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {/* Left Content: Product Grid and Search */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 flex gap-4 items-center">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <Input
                            placeholder="Buscar por nome, SKU ou Código de Barras... (F2)"
                            className="pl-10 h-12 text-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-pink-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ProductGrid
                        products={filteredProducts}
                        onProductClick={handleAddToCart}
                    />
                </div>
            </div>

            {/* Right Content: Sidebar Cart */}
            <PosCart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                onClearCart={handleClearCart}
            />
        </div>
    );
}
