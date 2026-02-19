"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddToCartButton({ product }: { product: any }) {
    const addItem = useCart((state) => state.addItem);
    const addItemSilent = useCart((state) => state.addItemSilent);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleAdd = () => {
        setLoading(true);
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0]?.url,
            slug: product.slug,
            quantity: 1
        });

        // Simulate slight delay for effect
        setTimeout(() => {
            setLoading(false);
            toast.success("Adicionado ao carrinho!");
        }, 500);
    };

    const handleBuyNow = () => {
        setLoading(true);
        addItemSilent({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0]?.url,
            slug: product.slug,
            quantity: 1
        });
        router.push("/checkout");
    };

    return (
        <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button
                size="lg"
                className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white shadow-md animate-pulse hover:animate-none transition-all"
                onClick={handleBuyNow}
                disabled={loading}
            >
                Comprar Agora
            </Button>
            <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 text-base font-medium uppercase tracking-wider border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={handleAdd}
                disabled={loading}
            >
                <ShoppingCart className="h-5 w-5" />
                {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
            </Button>
        </div>
    );
}
