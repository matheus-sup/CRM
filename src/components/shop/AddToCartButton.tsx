"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner"; // If we have sonner, otherwise alert or ignore

export function AddToCartButton({ product }: { product: any }) {
    const addItem = useCart((state) => state.addItem);
    const [loading, setLoading] = useState(false);

    const handleAdd = () => {
        setLoading(true);
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: undefined, // Add image url later
            quantity: 1
        });

        // Simulate slight delay for effect
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    return (
        <Button size="lg" className="w-full gap-2 text-lg font-bold uppercase tracking-wider md:w-auto px-8" onClick={handleAdd} disabled={loading}>
            <ShoppingCart className="h-5 w-5" />
            {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
        </Button>
    );
}
