"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: any;
    config?: any;
}

export function ProductCard({ product, config }: ProductCardProps) {
    const cardStyle = config?.cardStyle || "standard";

    switch (cardStyle) {
        case "compact":
            return <CompactCard product={product} config={config} />;
        case "detailed":
            return <DetailedCard product={product} config={config} />;
        case "horizontal":
            return <HorizontalCard product={product} config={config} />;
        case "standard":
        default:
            return <StandardCard product={product} config={config} />;
    }
}

// Helper for formatting price
function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// =============================================================================
// STANDARD CARD - Full featured with badges and hover effects
// =============================================================================
function StandardCard({ product, config }: ProductCardProps) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

    return (
        <Link href={`/produto/${product.slug}`} className="group relative block h-full">
            <div className="flex h-full flex-col gap-4 rounded-xl bg-card p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-primary/10">
                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {discount > 0 && (
                            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground border-none px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                                -{discount}%
                            </Badge>
                        )}
                        {product.isNewArrival && (
                            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-wider font-bold">
                                Novo
                            </Badge>
                        )}
                    </div>

                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full shadow-md transition-colors"
                            style={{
                                backgroundColor: config?.productBtnBg || config?.themeColor || "var(--primary)",
                                color: config?.productBtnText || "white"
                            }}
                        >
                            <ShoppingBag className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 gap-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    <div className="mt-auto flex flex-col gap-1">
                        {compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(compareAtPrice)}
                            </span>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                {formatPrice(price)}
                            </span>
                            {config?.showInstallments !== false && (
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    6x sem juros
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// =============================================================================
// COMPACT CARD - Minimal, clean, no badges
// =============================================================================
function CompactCard({ product, config }: ProductCardProps) {
    const price = Number(product.price);
    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

    return (
        <Link href={`/produto/${product.slug}`} className="group block h-full">
            <div className="flex h-full flex-col">
                {/* Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-90"
                    />
                </div>

                {/* Minimal Info */}
                <div className="py-3 text-center">
                    <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                        {product.name}
                    </h3>
                    <span className="text-sm font-semibold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                        {formatPrice(price)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// =============================================================================
// DETAILED CARD - More info, always visible button, ratings placeholder
// =============================================================================
function DetailedCard({ product, config }: ProductCardProps) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

    return (
        <Link href={`/produto/${product.slug}`} className="group block h-full">
            <div className="flex h-full flex-col rounded-lg border bg-card overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                {/* Image with overlay actions */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Discount badge */}
                    {discount > 0 && (
                        <div
                            className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white"
                            style={{ backgroundColor: config?.themeColor || "var(--primary)" }}
                        >
                            -{discount}%
                        </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full">
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Detailed Info */}
                <div className="flex flex-col flex-1 p-4">
                    {/* Category/Brand */}
                    {product.category?.name && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            {product.category.name}
                        </span>
                    )}

                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating placeholder */}
                    <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-xs">★</span>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">(12)</span>
                    </div>

                    {/* Price and button */}
                    <div className="mt-auto">
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-bold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                {formatPrice(price)}
                            </span>
                            {compareAtPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(compareAtPrice)}
                                </span>
                            )}
                        </div>

                        <Button
                            className="w-full gap-2"
                            style={{
                                backgroundColor: config?.productBtnBg || config?.themeColor || "var(--primary)",
                                color: config?.productBtnText || "white"
                            }}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// =============================================================================
// HORIZONTAL CARD - Side by side layout
// =============================================================================
function HorizontalCard({ product, config }: ProductCardProps) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

    return (
        <Link href={`/produto/${product.slug}`} className="group block">
            <div className="flex gap-4 p-3 rounded-lg border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20">
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                    />
                    {discount > 0 && (
                        <Badge
                            className="absolute top-1 left-1 text-[8px] px-1.5 py-0.5"
                            style={{ backgroundColor: config?.themeColor || "var(--primary)" }}
                        >
                            -{discount}%
                        </Badge>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {product.category?.name && (
                        <span className="text-xs text-muted-foreground mt-1">
                            {product.category.name}
                        </span>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                {formatPrice(price)}
                            </span>
                            {compareAtPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(compareAtPrice)}
                                </span>
                            )}
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full"
                            style={{ color: config?.themeColor || "var(--primary)" }}
                        >
                            <ShoppingBag className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
