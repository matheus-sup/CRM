"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from "lucide-react";

interface ColorVariant {
    id: string;
    name: string;
    colorHex: string | null;
    colorImage?: string | null;
    images: string[];
    price?: number | null;
    stock?: number;
    isDefault?: boolean;
}

interface ProductGalleryProps {
    images: { url: string; alt: string | null }[];
    productName: string;
    layout?: "side" | "bottom" | "grid" | "dots";
    variants?: ColorVariant[];
    priceColor?: string;
}

export function ProductGallery({ images, productName, layout = "bottom", variants, priceColor }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeVariantId, setActiveVariantId] = useState<string | null>(() => {
        const defaultVariant = variants?.find(v => v.isDefault && (v.colorHex || v.colorImage));
        return defaultVariant?.id || null;
    });

    // Color variants with color hex or color image
    const colorVariants = useMemo(() =>
        (variants || []).filter(v => v.colorHex || v.colorImage),
        [variants]
    );

    // Determine which images to display (filter out empty/invalid URLs)
    const displayImages = useMemo(() => {
        let imgs: { url: string; alt: string | null }[];
        if (activeVariantId) {
            const variant = colorVariants.find(v => v.id === activeVariantId);
            if (variant && variant.images.length > 0) {
                imgs = variant.images.map(url => ({ url, alt: `${productName} - ${variant.name}` }));
            } else {
                imgs = images;
            }
        } else {
            imgs = images;
        }
        return imgs.filter(img => img.url && img.url.trim() !== "");
    }, [activeVariantId, colorVariants, images, productName]);

    const handleVariantClick = (variantId: string) => {
        if (activeVariantId === variantId) {
            setActiveVariantId(null); // Deselect
        } else {
            setActiveVariantId(variantId);
        }
        setSelectedImage(0); // Reset to first image on variant change
    };

    // Placeholder if no images
    if (!displayImages || displayImages.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                <span className="text-4xl font-bold">{productName.charAt(0)}</span>
            </div>
        );
    }

    // Ensure selectedImage is within bounds
    const safeSelectedImage = Math.min(selectedImage, displayImages.length - 1);

    const ThumbnailButton = ({ index, image }: { index: number; image: { url: string; alt: string | null } }) => (
        <button
            onClick={() => setSelectedImage(index)}
            className={cn(
                "relative w-full aspect-square overflow-hidden rounded-md border-2 bg-white transition-all flex-shrink-0",
                safeSelectedImage === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-slate-200 hover:border-primary/50 opacity-70 hover:opacity-100"
            )}
        >
            <Image
                src={image.url}
                alt={image.alt || `Preview ${index}`}
                fill
                sizes="80px"
                className="object-contain p-1"
                loading="lazy"
            />
        </button>
    );

    // Color variant swatches component
    const ColorSwatches = () => {
        if (colorVariants.length === 0) return null;
        const activeVariant = colorVariants.find(v => v.id === activeVariantId);
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Cor:</span>
                    {activeVariant && (
                        <span className="text-sm text-slate-500">{activeVariant.name}</span>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {colorVariants.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => handleVariantClick(v.id)}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all duration-200 relative overflow-hidden",
                                activeVariantId === v.id
                                    ? "border-slate-800 ring-2 ring-offset-1 ring-slate-300 scale-110"
                                    : "border-slate-300 hover:border-slate-500 hover:scale-105"
                            )}
                            style={!v.colorImage ? { backgroundColor: v.colorHex || "#ccc" } : undefined}
                            title={v.name}
                        >
                            {v.colorImage && (
                                <img
                                    src={v.colorImage}
                                    alt={v.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            {activeVariantId === v.id && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M4 8l3 3 5-5" stroke={v.colorImage ? "#fff" : (isLightColor(v.colorHex || "#ccc") ? "#000" : "#fff")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const ModalContent = () => (
        <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0 bg-white border-none shadow-2xl flex overflow-hidden rounded-lg gap-0 focus:outline-none">
            {/* Left Side: Thumbnails */}
            {displayImages.length > 1 && (
                <div className="hidden md:flex w-24 flex-col gap-2 p-3 border-r bg-slate-50 overflow-y-auto">
                    {displayImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                                "relative aspect-square w-full overflow-hidden rounded-md border-2 bg-white transition-all flex-shrink-0",
                                safeSelectedImage === index
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-slate-200 hover:border-primary/50 opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={image.url}
                                alt={image.alt || `Preview ${index}`}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Right Side: Main Image & Content */}
            <div className="flex-1 flex flex-col relative bg-white min-w-0">
                <div className="w-full h-full relative flex items-center justify-center p-1 bg-white overflow-hidden">
                    <DialogClose className="absolute top-3 right-3 rounded-full p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-lg z-30 border border-slate-200">
                        <X className="h-5 w-5" />
                    </DialogClose>
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg z-20 transition-all border border-slate-200"
                            >
                                <ChevronLeft className="h-7 w-7" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg z-20 transition-all border border-slate-200"
                            >
                                <ChevronRight className="h-7 w-7" />
                            </button>
                        </>
                    )}
                    <Image
                        src={displayImages[safeSelectedImage].url}
                        alt={displayImages[safeSelectedImage].alt || productName}
                        fill
                        sizes="80vw"
                        className="object-contain select-none"
                    />
                </div>
            </div>
        </DialogContent>
    );

    // Layout: Dots - Vertical dot navigation on the left
    if (layout === "dots") {
        const goUp = () => setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
        const goDown = () => setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));

        return (
            <div className="space-y-4">
                <div className="flex gap-4 md:gap-6">
                    {/* Dot Navigation Column */}
                    {displayImages.length > 1 && (
                        <div className="hidden md:flex flex-col items-center justify-center gap-1 py-4">
                            <button
                                onClick={goUp}
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <ChevronUp className="h-5 w-5" />
                            </button>
                            <div className="flex flex-col items-center gap-2.5 py-2">
                                {displayImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            safeSelectedImage === index
                                                ? "w-3 h-3 bg-slate-800"
                                                : "w-2 h-2 bg-slate-300 hover:bg-slate-500"
                                        )}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={goDown}
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="flex-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative aspect-square max-h-[600px] overflow-hidden bg-white cursor-zoom-in group">
                                    <Image
                                        src={displayImages[safeSelectedImage].url}
                                        alt={displayImages[safeSelectedImage].alt || productName}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                                        priority
                                    />
                                </div>
                            </DialogTrigger>
                            <ModalContent />
                        </Dialog>

                        {/* Mobile: horizontal dots below image */}
                        {displayImages.length > 1 && (
                            <div className="flex md:hidden items-center justify-center gap-2 mt-4">
                                {displayImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            safeSelectedImage === index
                                                ? "w-3 h-3 bg-slate-800"
                                                : "w-2 h-2 bg-slate-300 hover:bg-slate-500"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <ColorSwatches />
            </div>
        );
    }

    // Layout: Side - Thumbnails on the left
    if (layout === "side") {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    {/* Thumbnails Column */}
                    {displayImages.length > 1 && (
                        <div className="hidden md:flex flex-col gap-2 w-20">
                            {displayImages.slice(0, 5).map((image, index) => (
                                <ThumbnailButton key={index} index={index} image={image} />
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="flex-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm cursor-zoom-in group">
                                    <Image
                                        src={displayImages[safeSelectedImage].url}
                                        alt={displayImages[safeSelectedImage].alt || productName}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                        priority
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10">
                                        <span className="bg-white/90 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                            Ampliar
                                        </span>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <ModalContent />
                        </Dialog>

                        {/* Mobile Thumbnails (below main image) */}
                        {displayImages.length > 1 && (
                            <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2">
                                {displayImages.map((image, index) => (
                                    <div key={index} className="w-16 flex-shrink-0">
                                        <ThumbnailButton index={index} image={image} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <ColorSwatches />
            </div>
        );
    }

    // Layout: Grid - All images in a grid
    if (layout === "grid") {
        return (
            <div className="space-y-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm cursor-zoom-in group">
                            <Image
                                src={displayImages[safeSelectedImage].url}
                                alt={displayImages[safeSelectedImage].alt || productName}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10">
                                <span className="bg-white/90 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                    Ampliar
                                </span>
                            </div>
                        </div>
                    </DialogTrigger>
                    <ModalContent />
                </Dialog>

                {/* Grid of thumbnails */}
                {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {displayImages.map((image, index) => (
                            <ThumbnailButton key={index} index={index} image={image} />
                        ))}
                    </div>
                )}

                <ColorSwatches />
            </div>
        );
    }

    // Layout: Bottom (default) - Thumbnails below
    return (
        <div className="space-y-4">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm cursor-zoom-in group">
                        <Image
                            src={displayImages[safeSelectedImage].url}
                            alt={displayImages[safeSelectedImage].alt || productName}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10">
                            <span className="bg-white/90 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                Ampliar
                            </span>
                        </div>
                    </div>
                </DialogTrigger>
                <ModalContent />
            </Dialog>

            {/* Thumbnails Row */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {displayImages.map((image, index) => (
                        <div key={index} className="w-20 flex-shrink-0">
                            <ThumbnailButton index={index} image={image} />
                        </div>
                    ))}
                </div>
            )}

            <ColorSwatches />
        </div>
    );
}

// Helper to determine if a hex color is light (for contrast checkmark)
function isLightColor(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}
