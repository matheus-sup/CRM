"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
        case "optica":
            return <OpticaCard product={product} config={config} />;
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
    const defaultImage = product.images?.[0]?.url || "/assets/placeholder-product.png";
    const secondImage = product.images?.[1]?.url;

    // Config toggles
    const showQuickBuy = config?.enableQuickBuy !== false && config?.enableQuickBuy !== "false";
    const showHoverImage = config?.showHoverImage !== false && config?.showHoverImage !== "false";
    const showLowStock = config?.showLowStockWarning !== false && config?.showLowStockWarning !== "false";
    const showInstallments = config?.showInstallments !== false && config?.showInstallments !== "false";

    const [hovered, setHovered] = useState(false);
    const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);
    const isLowStock = showLowStock && product.stock > 0 && product.stock <= 5;

    // Color variants
    const colorVariants = (product.variants || []).filter((v: any) => v.colorHex || v.colorImage);

    const getDisplayImage = () => {
        if (activeVariantIdx !== null && colorVariants[activeVariantIdx]) {
            const v = colorVariants[activeVariantIdx];
            const imgs = typeof v.images === "string" ? (() => { try { return JSON.parse(v.images); } catch { return []; } })() : (v.images || []);
            if (imgs.length > 0) return imgs[0];
        }
        if (showHoverImage && secondImage && hovered && activeVariantIdx === null) return secondImage;
        return defaultImage;
    };

    return (
        <Link href={`/loja/produto/${product.slug}`} className="group relative block h-full">
            <div className="flex h-full flex-col gap-2 sm:gap-4 rounded-xl p-2 sm:p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-primary/10">
                {/* Image Container */}
                <div
                    className="relative aspect-square w-full overflow-hidden rounded-lg bg-transparent"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => { setHovered(false); setActiveVariantIdx(null); }}
                >
                    <Image
                        src={getDisplayImage()}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        quality={90}
                        className="object-contain object-center transition-all duration-500 group-hover:scale-105 p-2"
                        loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
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
                        {isLowStock && (
                            <Badge variant="destructive" className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                                Últimas unidades
                            </Badge>
                        )}
                    </div>

                    {/* Quick Add Button */}
                    {showQuickBuy && (
                        <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
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
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 gap-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {/* Color swatches */}
                    {colorVariants.length > 0 && (
                        <div className="flex gap-1.5 mt-0.5">
                            {colorVariants.slice(0, 5).map((v: any, idx: number) => (
                                <button
                                    key={v.id || idx}
                                    type="button"
                                    onMouseEnter={(e) => { e.preventDefault(); setActiveVariantIdx(idx); }}
                                    onMouseLeave={() => setActiveVariantIdx(null)}
                                    onClick={(e) => e.preventDefault()}
                                    className={cn(
                                        "w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 relative overflow-hidden",
                                        activeVariantIdx === idx
                                            ? "border-gray-800 scale-125"
                                            : "border-gray-300 hover:border-gray-500"
                                    )}
                                    style={!v.colorImage ? { backgroundColor: v.colorHex } : undefined}
                                    title={v.name}
                                >
                                    {v.colorImage && (
                                        <img src={v.colorImage} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                            {colorVariants.length > 5 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                    +{colorVariants.length - 5}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mt-auto flex flex-col gap-1">
                        {compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(compareAtPrice)}
                            </span>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-lg font-bold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                {formatPrice(price)}
                            </span>
                            {showInstallments && (
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
        <Link href={`/loja/produto/${product.slug}`} className="group block h-full">
            <div className="flex h-full flex-col">
                {/* Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent">
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        quality={90}
                        className="object-contain object-center transition-opacity duration-300 group-hover:opacity-90 p-2"
                        loading="lazy"
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
        <Link href={`/loja/produto/${product.slug}`} className="group block h-full">
            <div className="flex h-full flex-col rounded-lg border bg-card overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                {/* Image with overlay actions */}
                <div className="relative aspect-square w-full overflow-hidden bg-transparent">
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        quality={90}
                        className="object-contain object-center transition-transform duration-500 group-hover:scale-110 p-2"
                        loading="lazy"
                    />

                    {/* Discount badge */}
                    {discount > 0 && (
                        <div
                            className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white z-10"
                            style={{ backgroundColor: config?.themeColor || "var(--primary)" }}
                        >
                            -{discount}%
                        </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
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
        <Link href={`/loja/produto/${product.slug}`} className="group block">
            <div className="flex gap-2.5 sm:gap-4 p-2 sm:p-3 rounded-lg border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20">
                {/* Image - Responsive sizing */}
                <div className="relative w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 400px) 64px, (max-width: 640px) 80px, 96px"
                        className="object-contain object-center p-1"
                        loading="lazy"
                    />
                    {discount > 0 && (
                        <Badge
                            className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 z-10"
                            style={{ backgroundColor: config?.themeColor || "var(--primary)" }}
                        >
                            -{discount}%
                        </Badge>
                    )}
                </div>

                {/* Info - Responsive text */}
                <div className="flex flex-col flex-1 min-w-0 py-0.5">
                    <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {product.category?.name && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                            {product.category.name}
                        </span>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex flex-col xs:flex-row xs:items-baseline xs:gap-2 min-w-0">
                            <span className="text-sm sm:text-base font-bold truncate" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                {formatPrice(price)}
                            </span>
                            {compareAtPrice && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                                    {formatPrice(compareAtPrice)}
                                </span>
                            )}
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full flex-shrink-0"
                            style={{ color: config?.themeColor || "var(--primary)" }}
                        >
                            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// =============================================================================
// OPTICA CARD - Clean card with color swatches, sizes, "Adicionar à sacola" overlay
// =============================================================================
function OpticaCard({ product, config }: ProductCardProps) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const defaultImage = product.images?.[0]?.url || "/assets/placeholder-product.png";
    const secondImage = product.images?.[1]?.url;
    const [hovered, setHovered] = useState(false);
    const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);

    const showHoverImage = config?.showHoverImage !== false && config?.showHoverImage !== "false";
    const showInstallments = config?.showInstallments !== false && config?.showInstallments !== "false";

    // Color variants from new system
    const colorVariants = (product.variants || []).filter((v: any) => v.colorHex || v.colorImage);

    // Determine displayed image based on active variant
    const getDisplayImage = () => {
        if (activeVariantIdx !== null && colorVariants[activeVariantIdx]) {
            const v = colorVariants[activeVariantIdx];
            // images can be a JSON string or already parsed array
            const imgs = typeof v.images === "string" ? (() => { try { return JSON.parse(v.images); } catch { return []; } })() : (v.images || []);
            if (imgs.length > 0) return imgs[0];
        }
        if (showHoverImage && secondImage && hovered && activeVariantIdx === null) return secondImage;
        return defaultImage;
    };

    return (
        <Link href={`/loja/produto/${product.slug}`} className="group block h-full">
            <div className="flex h-full flex-col">
                {/* Image Container with hover overlay */}
                <div
                    className="relative aspect-square w-full overflow-hidden bg-[#f5f5f5] rounded-sm"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => { setHovered(false); setActiveVariantIdx(null); }}
                >
                    <Image
                        src={getDisplayImage()}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        quality={90}
                        className="object-contain object-center transition-all duration-500 p-4"
                        loading="lazy"
                    />

                    {/* "Adicionar à sacola" overlay button */}
                    <div className="absolute bottom-0 left-0 right-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 px-3 pb-3">
                        <Button
                            className="w-full h-10 text-xs font-medium tracking-wide uppercase rounded-sm"
                            style={{
                                backgroundColor: config?.productBtnBg || config?.themeColor || "#1a1a1a",
                                color: config?.productBtnText || "white"
                            }}
                        >
                            Adicionar à sacola
                        </Button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-1 pt-3 text-center">
                    <h3 className="text-sm font-normal text-foreground line-clamp-1">
                        {product.name}
                    </h3>

                    <span className="text-sm font-medium" style={{ color: config?.priceColor || "#1a1a1a" }}>
                        {formatPrice(price)}
                    </span>

                    {showInstallments && (
                        <span className="text-[11px] text-muted-foreground">
                            12x de {formatPrice(price / 12)}
                        </span>
                    )}

                    {compareAtPrice && (
                        <span className="text-[11px] text-muted-foreground">
                            {formatPrice(compareAtPrice * 0.95)} no boleto (-5%)
                        </span>
                    )}

                    {/* Color swatches */}
                    {colorVariants.length > 0 && (
                        <div className="flex justify-center gap-1.5 mt-1">
                            {colorVariants.slice(0, 5).map((v: any, idx: number) => (
                                <button
                                    key={v.id || idx}
                                    type="button"
                                    onMouseEnter={(e) => { e.preventDefault(); setActiveVariantIdx(idx); }}
                                    onMouseLeave={() => setActiveVariantIdx(null)}
                                    onClick={(e) => e.preventDefault()}
                                    className={cn(
                                        "w-4 h-4 rounded-full border-2 transition-all duration-200 relative overflow-hidden",
                                        activeVariantIdx === idx
                                            ? "border-gray-800 scale-125"
                                            : "border-gray-300 hover:border-gray-500"
                                    )}
                                    style={!v.colorImage ? { backgroundColor: v.colorHex } : undefined}
                                    title={v.name}
                                >
                                    {v.colorImage && (
                                        <img src={v.colorImage} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                            {colorVariants.length > 5 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                    +{colorVariants.length - 5}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
