"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { ShoppingCart, Glasses } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LensSelectionModal } from "./LensSelectionModal";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    product: any;
    enableLensSelection?: boolean;
    selectedVariant?: string;
    btnStyle?: "rounded" | "pill" | "square";
    btnBg?: string;
    btnText?: string;
}

export function AddToCartButton({
    product,
    enableLensSelection = false,
    selectedVariant,
    btnStyle = "rounded",
    btnBg,
    btnText,
}: AddToCartButtonProps) {
    const addItem = useCart((state) => state.addItem);
    const addItemSilent = useCart((state) => state.addItemSilent);
    const [loading, setLoading] = useState(false);
    const [lensModalOpen, setLensModalOpen] = useState(false);

    const router = useRouter();

    const getCartItem = () => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0]?.url,
        slug: product.slug,
        quantity: 1,
        weight: product.weight ? Number(product.weight) : undefined,
        height: product.height ? Number(product.height) : undefined,
        width: product.width ? Number(product.width) : undefined,
        length: product.length ? Number(product.length) : undefined,
    });

    const handleAdd = () => {
        setLoading(true);
        addItem(getCartItem());

        // Simulate slight delay for effect
        setTimeout(() => {
            setLoading(false);
            toast.success("Adicionado ao carrinho!");
        }, 500);
    };

    const handleBuyNow = () => {
        setLoading(true);
        addItemSilent(getCartItem());
        router.push("/checkout");
    };

    const handleOpenLensModal = () => {
        setLensModalOpen(true);
    };

    const handleAddWithLens = (
        productData: any,
        lensData: any,
        totalPrice: number
    ) => {
        // Create a custom cart item with lens information
        const lensDescription = [
            lensData.type?.name,
            lensData.thickness?.name,
            lensData.treatment?.name,
        ]
            .filter(Boolean)
            .join(" + ");

        addItem({
            id: `${product.id}-lens-${Date.now()}`,
            name: `${product.name} (com lente)`,
            price: totalPrice,
            image: product.images?.[0]?.url,
            slug: product.slug,
            quantity: 1,
            weight: product.weight ? Number(product.weight) : undefined,
            height: product.height ? Number(product.height) : undefined,
            width: product.width ? Number(product.width) : undefined,
            length: product.length ? Number(product.length) : undefined,
            // Store lens info as metadata (will be shown in cart)
            metadata: {
                variant: selectedVariant,
                lensType: lensData.type?.name,
                lensThickness: lensData.thickness?.name,
                lensTreatment: lensData.treatment?.name,
                lensDescription,
            },
        });

        toast.success("Óculos com lente adicionado ao carrinho!");
    };

    // Button style class based on config
    const btnRoundedClass = btnStyle === "pill" ? "rounded-full" : btnStyle === "square" ? "rounded-none" : "rounded-lg";

    return (
        <>
            <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button
                    size="lg"
                    className={cn(
                        "w-full h-14 text-lg font-bold uppercase tracking-wider shadow-md animate-pulse hover:animate-none transition-all",
                        btnRoundedClass
                    )}
                    style={{
                        backgroundColor: btnBg || "#22c55e",
                        color: btnText || "#ffffff",
                    }}
                    onClick={handleBuyNow}
                    disabled={loading}
                >
                    Comprar Agora
                </Button>

                {enableLensSelection && (
                    <Button
                        size="lg"
                        className={cn(
                            "w-full h-14 gap-2 text-base font-medium uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white",
                            btnRoundedClass
                        )}
                        onClick={handleOpenLensModal}
                        disabled={loading}
                    >
                        <Glasses className="h-5 w-5" />
                        Adicionar e Escolher Lentes
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                        "w-full gap-2 text-base font-medium uppercase tracking-wider border-slate-300 text-slate-700 hover:bg-slate-50",
                        btnRoundedClass
                    )}
                    onClick={handleAdd}
                    disabled={loading}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
                </Button>
            </div>

            {enableLensSelection && (
                <LensSelectionModal
                    open={lensModalOpen}
                    onOpenChange={setLensModalOpen}
                    product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: Number(product.price),
                        image: product.images?.[0]?.url,
                        variant: selectedVariant,
                    }}
                    onAddToCart={handleAddWithLens}
                />
            )}
        </>
    );
}
