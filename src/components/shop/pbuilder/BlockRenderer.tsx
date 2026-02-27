"use client";

import { PageBlock } from "@/types/page-builder";
import { HtmlBlock } from "./blocks/HtmlBlock";
import { SchedulingBlock } from "./blocks/SchedulingBlock";
import { cn } from "@/lib/utils";
import { Instagram, MapPin, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

// =============================================================================
// HERO BLOCK - Multiple variants
// =============================================================================
const HeroBlock = ({ content, styles, variant }: { content: any, styles: any, variant?: string }) => {
    const blockVariant = variant || styles.variant || "default";

    switch (blockVariant) {
        case "minimal":
            return <HeroMinimal content={content} styles={styles} />;
        case "split":
            return <HeroSplit content={content} styles={styles} />;
        case "restaurant":
            return <HeroRestaurant content={content} styles={styles} />;
        case "default":
        default:
            return <HeroDefault content={content} styles={styles} />;
    }
};

// Shared hook for carousel with smooth transitions
function useHeroCarousel(content: any) {
    const slides = content.slides || [{ id: "default", title: content.title || "Banner", subtitle: content.subtitle, buttonText: content.buttonText, buttonLink: content.buttonLink || "/produtos" }];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
    const autoplay = content.autoplay || false;
    const autoplayInterval = (content.autoplayInterval || 5) * 1000;
    const transition = content.transition || "fade";
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const goToSlide = useCallback((i: number, direction?: "next" | "prev") => {
        if (isTransitioning || i === currentSlide) return;
        setSlideDirection(direction || (i > currentSlide ? "next" : "prev"));
        setIsTransitioning(true);
        timeoutRef.current = setTimeout(() => {
            setCurrentSlide(i);
            setTimeout(() => setIsTransitioning(false), 50);
        }, transition === "none" ? 0 : 300);
    }, [currentSlide, isTransitioning, transition]);

    const nextSlide = useCallback(() => {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next, "next");
    }, [currentSlide, slides.length, goToSlide]);

    const prevSlide = useCallback(() => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev, "prev");
    }, [currentSlide, slides.length, goToSlide]);

    useEffect(() => {
        if (!autoplay || slides.length <= 1) return;
        const interval = setInterval(nextSlide, autoplayInterval);
        return () => clearInterval(interval);
    }, [autoplay, autoplayInterval, slides.length, nextSlide]);

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    return {
        slides,
        currentSlide,
        currentSlideData: slides[currentSlide],
        nextSlide,
        prevSlide,
        goToSlide: (i: number) => goToSlide(i),
        isTransitioning,
        slideDirection,
        transition,
    };
}

// Transition wrapper component
function SlideTransition({ isTransitioning, transition, slideDirection, children }: { isTransitioning: boolean; transition: string; slideDirection: string; children: React.ReactNode }) {
    if (transition === "none") return <>{children}</>;

    if (transition === "slide") {
        const transform = isTransitioning
            ? (slideDirection === "next" ? "translateX(-30px)" : "translateX(30px)")
            : "translateX(0)";
        return (
            <div style={{
                opacity: isTransitioning ? 0 : 1,
                transform,
                transition: "opacity 0.4s ease, transform 0.4s ease",
            }}>
                {children}
            </div>
        );
    }

    // Default: fade
    return (
        <div style={{
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.5s ease",
        }}>
            {children}
        </div>
    );
}

// DEFAULT - Classic centered/aligned hero with carousel support
function HeroDefault({ content, styles }: any) {
    const { slides, currentSlide, currentSlideData, nextSlide, prevSlide, goToSlide, isTransitioning, slideDirection, transition } = useHeroCarousel(content);
    const alignClass = styles.textAlign === 'left' ? 'items-start text-left' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center';
    const hasImage = !!currentSlideData.imageUrl;

    return (
        <div
            className="w-full relative overflow-hidden"
            style={{
                background: styles.background || undefined,
                backgroundColor: !styles.background ? (styles.backgroundColor || undefined) : undefined,
                minHeight: styles.minHeight || undefined
            }}
        >
            {/* Background Image */}
            {hasImage && (
                <Image
                    src={currentSlideData.imageUrl}
                    alt={currentSlideData.title || "Banner"}
                    fill
                    sizes="100vw"
                    className={cn(
                        "object-cover transition-opacity duration-500",
                        isTransitioning ? "opacity-0" : "opacity-100"
                    )}
                    priority
                />
            )}

            <SlideTransition isTransitioning={isTransitioning} transition={transition} slideDirection={slideDirection}>
                <div
                    className={cn(
                        "w-full flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 pt-16 sm:pt-20 md:pt-32 pb-10 sm:pb-12 relative z-[1]",
                        alignClass,
                        hasImage && "min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
                    )}
                    style={{ minHeight: !hasImage && styles.minHeight ? styles.minHeight : undefined }}
                >
                    <h1
                        data-field="title"
                        className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-4 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: styles.titleColor || styles.textColor || (hasImage ? "#ffffff" : "#000000") }}
                    >
                        {currentSlideData.title}
                    </h1>
                    {currentSlideData.subtitle && (
                        <p
                            data-field="subtitle"
                            className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 max-w-2xl font-medium cursor-pointer hover:opacity-70 transition-opacity px-2"
                            style={{ color: styles.textColor || (hasImage ? "#ffffff" : "#000000") }}
                        >
                            {currentSlideData.subtitle}
                        </p>
                    )}
                    {currentSlideData.buttonText && (
                        <Link href={currentSlideData.buttonLink || "/produtos"}>
                            {styles.buttonColor === "transparent" ? (
                                <button
                                    data-field="buttonText"
                                    className="mt-4 sm:mt-6 md:mt-8 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all hover:bg-white/10 cursor-pointer border"
                                    style={{ borderColor: (styles.buttonTextColor || "#ffffff") + "99", color: styles.buttonTextColor || "#ffffff", backgroundColor: "transparent" }}
                                >
                                    {currentSlideData.buttonText}
                                </button>
                            ) : (
                                <button
                                    data-field="buttonText"
                                    className="mt-4 sm:mt-6 md:mt-8 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base transition-transform hover:scale-105 shadow-lg cursor-pointer"
                                    style={{ backgroundColor: styles.buttonColor || "#ffffff", color: styles.buttonTextColor || "#000000" }}
                                >
                                    {currentSlideData.buttonText}
                                </button>
                            )}
                        </Link>
                    )}
                </div>
            </SlideTransition>
            {slides.length > 1 && (
                <>
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                        {slides.map((_: any, i: number) => (
                            <button key={i} onClick={() => goToSlide(i)} className={cn("h-1.5 sm:h-2 rounded-full transition-all", i === currentSlide ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/50")} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// MINIMAL - Compact, typography-focused
function HeroMinimal({ content, styles }: any) {
    const { slides, currentSlide, currentSlideData, goToSlide, isTransitioning, slideDirection, transition } = useHeroCarousel(content || {});
    const slide = currentSlideData || { title: "Banner", subtitle: "", buttonText: "", buttonLink: "/produtos" };
    const hasImage = !!slide.imageUrl;

    return (
        <div className="w-full relative">
            {hasImage ? (
                /* Com imagem: altura fixa 840px, width 100% */
                <div className="relative w-full overflow-hidden" style={{ height: 840 }}>
                    {/* Background image */}
                    <div className="absolute inset-0 z-0" style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.5s ease" }}>
                        <Image src={slide.imageUrl} alt={slide.title} fill sizes="100vw" className="object-cover" priority />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-0 z-10 flex items-center">
                        <div className="container mx-auto px-4">
                            <SlideTransition isTransitioning={isTransitioning} transition={transition} slideDirection={slideDirection}>
                                <div className="max-w-3xl">
                                    <h1
                                        data-field="title"
                                        className="text-3xl md:text-5xl font-light tracking-tight mb-4 leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{ color: "#ffffff" }}
                                    >
                                        {slide.title}
                                    </h1>
                                    {slide.subtitle && (
                                        <p
                                            data-field="subtitle"
                                            className="text-base md:text-lg opacity-80 mb-6 max-w-xl cursor-pointer hover:opacity-50 transition-opacity"
                                            style={{ color: "#ffffff" }}
                                        >
                                            {slide.subtitle}
                                        </p>
                                    )}
                                    {slide.buttonText && (
                                        <Link href={slide.buttonLink || "/produtos"}>
                                            <button
                                                data-field="buttonText"
                                                className="px-6 py-2.5 text-sm font-medium rounded border transition-colors hover:opacity-80 cursor-pointer"
                                                style={{
                                                    borderColor: styles.buttonColor || "#ffffff",
                                                    backgroundColor: styles.buttonColor || "#ffffff",
                                                    color: styles.buttonTextColor || "#000000"
                                                }}
                                            >
                                                {slide.buttonText}
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </SlideTransition>
                            {slides.length > 1 && (
                                <div className="flex gap-2 mt-6">
                                    {slides.map((_: any, i: number) => (
                                        <button key={i} onClick={() => goToSlide(i)} className={cn(
                                            "h-3 w-3 rounded-full transition-all border",
                                            i === currentSlide ? "bg-white border-white" : "bg-transparent border-white/60 hover:border-white"
                                        )} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Sem imagem: mesma altura fixa, conteúdo centralizado */
                <div className="flex items-center" style={{ height: 840 }}>
                <div className="container mx-auto px-4">
                    <SlideTransition isTransitioning={isTransitioning} transition={transition} slideDirection={slideDirection}>
                        <div className="max-w-3xl">
                            <h1
                                data-field="title"
                                className="text-3xl md:text-5xl font-light tracking-tight mb-4 leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ color: styles.titleColor || "#000000" }}
                            >
                                {slide.title}
                            </h1>
                            {slide.subtitle && (
                                <p
                                    data-field="subtitle"
                                    className="text-base md:text-lg opacity-80 mb-6 max-w-xl cursor-pointer hover:opacity-50 transition-opacity"
                                    style={{ color: styles.textColor || "#666666" }}
                                >
                                    {slide.subtitle}
                                </p>
                            )}
                            {slide.buttonText && (
                                <Link href={slide.buttonLink || "/produtos"}>
                                    <button
                                        data-field="buttonText"
                                        className="px-6 py-2.5 text-sm font-medium rounded border transition-colors hover:opacity-80 cursor-pointer"
                                        style={{
                                            borderColor: styles.buttonColor || "#000000",
                                            backgroundColor: styles.buttonColor || "#000000",
                                            color: styles.buttonTextColor || "#ffffff"
                                        }}
                                    >
                                        {slide.buttonText}
                                    </button>
                                </Link>
                            )}
                        </div>
                    </SlideTransition>
                    {slides.length > 1 && (
                        <div className="flex gap-2 mt-8">
                            {slides.map((_: any, i: number) => (
                                <button key={i} onClick={() => goToSlide(i)} className={cn(
                                    "h-3 w-3 rounded-full transition-all border",
                                    i === currentSlide ? "bg-slate-800 border-slate-800" : "bg-transparent border-slate-400 hover:border-slate-600"
                                )} />
                            ))}
                        </div>
                    )}
                </div>
                </div>
            )}
        </div>
    );
}

// SPLIT - Two columns: text left, image/gradient right
function HeroSplit({ content, styles }: any) {
    const { slides, currentSlide, currentSlideData, nextSlide, prevSlide, isTransitioning, slideDirection, transition } = useHeroCarousel(content);

    return (
        <div className="w-full min-h-[70vh] grid md:grid-cols-2 overflow-hidden">
            {/* Text Side */}
            <div className="flex flex-col justify-center p-8 md:p-16 order-2 md:order-1" style={{ backgroundColor: styles.backgroundColor || "#ffffff" }}>
                <SlideTransition isTransitioning={isTransitioning} transition={transition} slideDirection={slideDirection}>
                    <h1
                        data-field="title"
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: styles.titleColor || "#111827" }}
                    >
                        {currentSlideData.title}
                    </h1>
                    {currentSlideData.subtitle && (
                        <p
                            data-field="subtitle"
                            className="text-lg opacity-80 mb-8 max-w-md cursor-pointer hover:opacity-60 transition-opacity"
                            style={{ color: styles.textColor || "#6b7280" }}
                        >
                            {currentSlideData.subtitle}
                        </p>
                    )}
                    <div className="flex items-center gap-4">
                        {currentSlideData.buttonText && (
                            <Link href={currentSlideData.buttonLink || "/produtos"}>
                                <button
                                    data-field="buttonText"
                                    className="px-8 py-3 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
                                    style={{ backgroundColor: styles.buttonColor || "#111827", color: styles.buttonTextColor || "#ffffff" }}
                                >
                                    {currentSlideData.buttonText}
                                </button>
                            </Link>
                        )}
                        {slides.length > 1 && (
                            <div className="flex gap-2">
                                <button onClick={prevSlide} className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /></button>
                                <button onClick={nextSlide} className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-slate-50"><ChevronRight className="h-5 w-5" /></button>
                            </div>
                        )}
                    </div>
                </SlideTransition>
            </div>
            {/* Image/Color Side */}
            <div className="min-h-[300px] md:min-h-full order-1 md:order-2" style={{ background: styles.background || styles.accentColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <SlideTransition isTransitioning={isTransitioning} transition={transition} slideDirection={slideDirection}>
                    {currentSlideData.imageUrl && (
                        <div className="relative w-full h-full">
                            <Image src={currentSlideData.imageUrl} alt={currentSlideData.title} fill sizes="50vw" className="object-cover" priority />
                        </div>
                    )}
                </SlideTransition>
            </div>
        </div>
    );
}

// Restaurant Hero - Clean, food-focused design
function HeroRestaurant({ content, styles }: any) {
    const { slides, currentSlideData } = useHeroCarousel(content);

    return (
        <div
            className="relative w-full min-h-[40vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden"
            style={{ background: styles.background || "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
        >
            {/* Background Image if provided */}
            {currentSlideData.imageUrl && (
                <div className="absolute inset-0">
                    <Image src={currentSlideData.imageUrl} alt={currentSlideData.title || ""} fill sizes="100vw" className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 max-w-3xl mx-auto">
                <h1
                    data-field="title"
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: styles.titleColor || "#ffffff" }}
                >
                    {currentSlideData.title}
                </h1>
                {currentSlideData.subtitle && (
                    <p
                        data-field="subtitle"
                        className="text-sm sm:text-base md:text-lg opacity-90 mb-4 sm:mb-6 md:mb-8 max-w-xl mx-auto cursor-pointer hover:opacity-60 transition-opacity"
                        style={{ color: styles.textColor || "#ffffff" }}
                    >
                        {currentSlideData.subtitle}
                    </p>
                )}
                {currentSlideData.buttonText && (
                    <Link href={currentSlideData.buttonLink || "/cardapio"}>
                        <button
                            data-field="buttonText"
                            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-transform hover:scale-105 cursor-pointer shadow-lg"
                            style={{ backgroundColor: styles.buttonColor || "#ffffff", color: styles.buttonTextColor || "#ef4444" }}
                        >
                            {currentSlideData.buttonText}
                        </button>
                    </Link>
                )}
            </div>

            {/* Decorative wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                    <path d="M0 30L60 25C120 20 240 10 360 10C480 10 600 20 720 30C840 40 960 50 1080 50C1200 50 1320 40 1380 35L1440 30V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V30Z" fill="white" fillOpacity="0.1"/>
                </svg>
            </div>
        </div>
    );
}

const TextBlock = ({ content, styles }: any) => {
    // Try to get title/description from structured content or parse from HTML
    let title = content.title;
    let description = content.description;
    const titleSize = content.titleSize || '2.5rem';
    const alignment = styles?.textAlign || 'center';

    // If no structured content, try to parse from HTML
    if (title === undefined && description === undefined && content.html) {
        const html = content.html || "";
        const h2Match = html.match(/<h2[^>]*>([^<]*)<\/h2>/i);
        const pMatch = html.match(/<p[^>]*>([^<]*)<\/p>/i);
        title = h2Match ? h2Match[1] : "";
        description = pMatch ? pMatch[1] : "";
    }

    // If we have title or description (from structured or parsed), render them separately
    if (title || description) {
        return (
            <div
                className="prose max-w-none"
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    textAlign: alignment as any,
                    padding: '2rem 1rem'
                }}
            >
                {title && (
                    <h2
                        data-field="title"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                            fontSize: titleSize,
                            fontWeight: 300,
                            marginBottom: '1rem',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {title}
                    </h2>
                )}
                {description && (
                    <p
                        data-field="description"
                        className="cursor-pointer hover:opacity-70 transition-opacity"
                        style={{
                            fontSize: '1.125rem',
                            color: '#666',
                            lineHeight: 1.8
                        }}
                    >
                        {description}
                    </p>
                )}
            </div>
        );
    }

    // Ultimate fallback: render raw HTML (should rarely happen now)
    return (
        <div
            data-field="title"
            className="prose max-w-none cursor-pointer hover:opacity-90 transition-opacity"
            dangerouslySetInnerHTML={{ __html: content.html }}
        />
    );
};

const ProductGridBlock = ({ content, products, isAdmin, config, variant, styles }: { content: any, products: any[], isAdmin?: boolean, config?: any, variant?: string, styles?: any }) => {
    // Merge styles.cardVariant with config for ProductCard
    const mergedConfig = {
        ...config,
        cardStyle: styles?.cardVariant || config?.cardStyle || "standard"
    };

    // Manual selection mode: use selectedProductIds
    // Auto selection mode: filter by collectionType
    let filteredProducts: any[] = [];

    if (content.selectionMode === "manual") {
        const selectedIds = content.selectedProductIds || [];
        filteredProducts = selectedIds
            .map((id: string) => products.find(p => p.id === id))
            .filter(Boolean)
            .slice(0, content.limit || 50);
    } else {
        const limit = content.limit || 8;

        if (content.collectionType === "category" && content.categoryId) {
            filteredProducts = products.filter(p => p.categoryId === content.categoryId).slice(0, limit);
        } else if (content.collectionType === "new") {
            const newArrivals = products.filter(p => p.isNewArrival);
            filteredProducts = newArrivals.length > 0
                ? newArrivals.slice(0, limit)
                : products.slice(0, limit);
        } else if (content.collectionType === "featured") {
            const featured = products.filter(p => p.isFeatured);
            filteredProducts = featured.length > 0
                ? featured.slice(0, limit)
                : products.slice(0, limit);
        } else {
            filteredProducts = products.slice(0, limit);
        }
    }

    if (filteredProducts.length === 0) {
        if (!isAdmin) return null;
        return (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center text-slate-400 min-h-[200px] flex flex-col items-center justify-center">
                <div className="font-semibold mb-2">Vitrine de Produtos</div>
                <div className="text-sm">
                    {content.selectionMode === "manual"
                        ? "Nenhum produto selecionado. Edite o bloco para escolher produtos."
                        : "Nenhum produto encontrado. (Visível apenas pro Admin)"
                    }
                </div>
            </div>
        );
    }

    const title = content.title ? (
        <h2
            data-field="title"
            className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 cursor-pointer hover:opacity-80 transition-opacity px-2"
        >
            {content.title}
        </h2>
    ) : null;

    const cardSize = content.cardSize || 200;
    const resolvedVariant = variant || styles?.variant || "grid";

    // ── CAROUSEL VARIANT ──
    if (resolvedVariant === "carousel") {
        return (
            <ProductCarouselLayout
                products={filteredProducts}
                config={mergedConfig}
                title={title}
                autoScroll={content.autoScroll}
                autoScrollInterval={content.autoScrollInterval}
                cardSize={cardSize}
            />
        );
    }

    // ── LIST VARIANT ──
    if (resolvedVariant === "list") {
        return (
            <ProductListLayout products={filteredProducts} config={mergedConfig} title={title} cardSize={cardSize} />
        );
    }

    // ── SHOWCASE VARIANT (ZF Vision style: big name behind product) ──
    if (resolvedVariant === "showcase") {
        return (
            <ProductShowcaseLayout
                products={filteredProducts}
                config={mergedConfig}
                title={title}
            />
        );
    }

    // For horizontal cards, use a different grid layout
    const isHorizontalCards = mergedConfig.cardStyle === "horizontal";

    // ── GRID VARIANT (default) ──
    return (
        <div className="py-4 sm:py-6 md:py-8 px-2 sm:px-4">
            {title}
            <div
                className={cn(
                    "gap-2 sm:gap-3 md:gap-4",
                    isHorizontalCards
                        ? "flex flex-col max-w-2xl mx-auto"
                        : "grid justify-center"
                )}
                style={isHorizontalCards ? undefined : {
                    gridTemplateColumns: `repeat(auto-fit, minmax(min(${cardSize}px, 45vw), ${cardSize}px))`
                }}
            >
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} config={mergedConfig} />
                ))}
            </div>
        </div>
    );
};

// ── PRODUCT CAROUSEL LAYOUT ──
function formatPriceBlock(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const ProductCarouselLayout = ({ products, config, title, autoScroll, autoScrollInterval, cardSize = 200 }: {
    products: any[], config?: any, title: React.ReactNode, autoScroll?: boolean, autoScrollInterval?: number, cardSize?: number
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);
    const gap = 16;

    // Calculate how many full cards fit in the container
    useEffect(() => {
        const calculate = () => {
            const el = containerRef.current;
            if (!el) return;
            const containerWidth = el.clientWidth;
            const count = Math.max(1, Math.floor((containerWidth + gap) / (cardSize + gap)));
            setVisibleCount(count);
        };
        calculate();
        window.addEventListener("resize", calculate);
        return () => window.removeEventListener("resize", calculate);
    }, [cardSize]);

    // Infinite index: wrap around
    const getProduct = (index: number) => {
        const i = ((index % products.length) + products.length) % products.length;
        return products[i];
    };

    const next = useCallback(() => {
        setCurrentIndex(prev => prev + 1);
    }, []);

    const prev = useCallback(() => {
        setCurrentIndex(prev => prev - 1);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (!autoScroll) return;
        const interval = setInterval(next, (autoScrollInterval || 3) * 1000);
        return () => clearInterval(interval);
    }, [autoScroll, autoScrollInterval, next]);

    // Build the visible cards array
    const visibleProducts = [];
    for (let i = 0; i < visibleCount; i++) {
        visibleProducts.push({
            product: getProduct(currentIndex + i),
            key: `${currentIndex + i}`
        });
    }

    return (
        <div className="py-8">
            {title}
            <div className="relative group/carousel px-12" ref={containerRef}>
                {/* Left Arrow */}
                <button
                    onClick={prev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                    <ChevronLeft className="h-5 w-5 text-slate-700" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={next}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                    <ChevronRight className="h-5 w-5 text-slate-700" />
                </button>

                {/* Cards Grid - Only shows full cards */}
                <div
                    className="grid transition-opacity duration-300"
                    style={{
                        gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
                        gap: `${gap}px`
                    }}
                >
                    {visibleProducts.map(({ product, key }) => (
                        <div key={key} className="min-w-0">
                            <ProductCard product={product} config={config} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── PRODUCT SHOWCASE LAYOUT (ZF Vision style) ──
const ProductShowcaseLayout = ({ products, config, title }: {
    products: any[], config?: any, title: React.ReactNode
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
    }, [checkScroll]);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    };

    return (
        <div className="py-8 sm:py-10">
            {title}
            <div className="relative group/showcase">
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 pb-2 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", justifyContent: "safe center" }}
                >
                    {products.map((product) => {
                        const img = product.images?.[0]?.url || product.images?.[0] || "";
                        const name = product.name || "";
                        const slug = product.slug || product.id;
                        return (
                            <Link
                                key={product.id}
                                href={`/produto/${slug}`}
                                className="group flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px]"
                            >
                                <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-end justify-center">
                                    {/* Big name text behind product */}
                                    <span className="absolute inset-0 flex items-center justify-center text-[3rem] sm:text-[4rem] md:text-[4.5rem] font-black uppercase leading-none text-gray-200/80 select-none pointer-events-none tracking-tight text-center px-2">
                                        {name.split(" ")[0]}
                                    </span>
                                    {/* Product image */}
                                    {img ? (
                                        <div className="relative z-10 w-[75%] h-[65%] mb-4 transition-transform duration-300 group-hover:scale-105">
                                            <Image
                                                src={img}
                                                alt={name}
                                                fill
                                                sizes="260px"
                                                className="object-contain drop-shadow-lg"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative z-10 w-[75%] h-[65%] mb-4 bg-gray-200 rounded" />
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-2 top-[45%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover/showcase:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-2 top-[45%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover/showcase:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ── PRODUCT LIST LAYOUT ──
const ProductListLayout = ({ products, config, title, cardSize = 200 }: {
    products: any[], config?: any, title: React.ReactNode, cardSize?: number
}) => {
    const imgSize = Math.max(48, Math.round(cardSize * 0.4));
    return (
        <div className="py-8">
            {title}
            <div className="flex flex-col gap-3">
                {products.map((product) => {
                    const price = Number(product.price);
                    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
                    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

                    return (
                        <Link
                            key={product.id}
                            href={`/produto/${product.slug}`}
                            className="group flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-md hover:border-primary/20 transition-all"
                        >
                            {/* Image */}
                            <div className="relative flex-shrink-0 overflow-hidden rounded-md bg-muted" style={{ width: `${imgSize}px`, height: `${imgSize}px` }}>
                                <Image
                                    src={image}
                                    alt={product.name}
                                    fill
                                    sizes={`${imgSize}px`}
                                    className="object-contain p-1"
                                    loading="lazy"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                {product.category?.name && (
                                    <span className="text-xs text-muted-foreground">
                                        {product.category.name}
                                    </span>
                                )}
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="font-bold" style={{ color: config?.priceColor || config?.themeColor || "var(--primary)" }}>
                                        {formatPriceBlock(price)}
                                    </span>
                                    {compareAtPrice && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            {formatPriceBlock(compareAtPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div
                                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: config?.productBtnBg || config?.themeColor || "var(--primary)",
                                    color: config?.productBtnText || "white"
                                }}
                            >
                                Ver
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

const InstagramBlock = ({ content, isAdmin }: any) => {
    if (!isAdmin) return null; // Completely hide Instagram mock for now as it's not real

    return (
        <div className="py-10 bg-slate-50">
            <div className="container mx-auto px-4 text-center">
                <div
                    data-field="username"
                    className="flex items-center justify-center gap-2 mb-6 text-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <Instagram className="h-6 w-6" />
                    <span className="font-bold text-xl">@{content.username || "clique para configurar"}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 opacity-50">
                    {/* Mock Images - Admin Only */}
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-slate-200 flex items-center justify-center rounded-lg">
                            <span className="text-xs text-slate-400">Preview {i}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-4">Mockup do Instagram (Visível apenas para Admin)</p>
            </div>
        </div>
    );
};

const MapBlock = ({ content, isAdmin }: any) => {
    if (!content.embedUrl) {
        if (!isAdmin) return null;
        return (
            <div
                data-field="embedUrl"
                className="min-h-[300px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
                <MapPin className="h-8 w-8" />
                <span>Clique para configurar o mapa</span>
            </div>
        );
    }

    return (
        <div className="min-h-[300px] bg-transparent flex items-center justify-center text-slate-500">
            <iframe
                src={content.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
};

const PromoBlock = ({ content, styles, isAdmin }: any) => {
    if (!content.title && !content.subtitle && !isAdmin) return null;

    return (
        <div
            className="w-full text-center flex flex-col items-center justify-center min-h-[200px]"
        >
            <Megaphone className="h-8 w-8 mb-4 opacity-80" />
            <h2
                data-field="title"
                className="text-3xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
                {content.title || (isAdmin ? "Título da Promoção (clique para editar)" : "")}
            </h2>
            <p
                data-field="subtitle"
                className="text-lg opacity-90 mb-4 cursor-pointer hover:opacity-70 transition-opacity"
            >
                {content.subtitle || (isAdmin ? "Subtítulo da promoção (clique para editar)" : "")}
            </p>

            {content.buttonLink && (content.buttonText || isAdmin) && (
                <Link href={content.buttonLink}>
                    <button
                        data-field="buttonText"
                        className="px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        {content.buttonText || "Ver Promoção"}
                    </button>
                </Link>
            )}
        </div>
    );
};

// =============================================================================
// TOOL BLOCKS - Placeholder components for activated tools
// =============================================================================

// Tool metadata for display
const TOOL_METADATA: Record<string, { name: string; description: string; icon: string; color: string }> = {
    "tool-scheduling": { name: "Agendamentos Online", description: "Sistema de agendamentos para clientes", icon: "📅", color: "from-blue-500 to-cyan-500" },
    "tool-menu": { name: "Cardápio Digital", description: "Cardápio interativo com QR Code", icon: "🍽️", color: "from-orange-500 to-red-500" },
    "tool-delivery": { name: "Delivery Próprio", description: "Sistema de delivery integrado", icon: "🚴", color: "from-green-500 to-emerald-500" },
    "tool-reservations": { name: "Reservas de Mesas", description: "Sistema de reservas para restaurantes", icon: "🪑", color: "from-amber-500 to-yellow-500" },
    "tool-orders": { name: "Comandas Digitais", description: "Comandas eletrônicas para atendimento", icon: "📋", color: "from-violet-500 to-purple-500" },
    "tool-salon": { name: "Gestão de Salão", description: "Gestão para salões e barbearias", icon: "✂️", color: "from-pink-500 to-rose-500" },
    "tool-whatsapp-catalog": { name: "Catálogo WhatsApp", description: "Catálogo integrado ao WhatsApp", icon: "💬", color: "from-green-500 to-lime-500" },
    "tool-quotes": { name: "Orçamentos Online", description: "Sistema de orçamentos e propostas", icon: "📝", color: "from-slate-500 to-gray-500" },
    "tool-gift-cards": { name: "Gift Cards", description: "Vales-presente digitais", icon: "🎁", color: "from-red-500 to-pink-500" },
    "tool-wishlist": { name: "Lista de Presentes", description: "Listas para ocasiões especiais", icon: "💝", color: "from-rose-500 to-red-500" },
    "tool-subscriptions": { name: "Clube de Assinaturas", description: "Assinaturas recorrentes", icon: "🔄", color: "from-indigo-500 to-blue-500" },
    "tool-loyalty": { name: "Programa de Fidelidade", description: "Pontos e recompensas", icon: "🏆", color: "from-amber-500 to-orange-500" },
    "tool-reviews": { name: "Avaliações", description: "Reviews e depoimentos de clientes", icon: "⭐", color: "from-yellow-500 to-amber-500" },
    "tool-coupons": { name: "Cupons e Promoções", description: "Sistema de cupons de desconto", icon: "🏷️", color: "from-emerald-500 to-teal-500" },
    "tool-digital-showcase": { name: "Vitrine Digital", description: "Vitrine interativa de produtos", icon: "🖥️", color: "from-cyan-500 to-blue-500" },
    "tool-social-proof": { name: "Prova Social", description: "Notificações de compras recentes", icon: "👥", color: "from-purple-500 to-violet-500" },
    "tool-chat": { name: "Chat Online", description: "Atendimento em tempo real", icon: "💬", color: "from-blue-500 to-indigo-500" },
    "tool-tracking": { name: "Rastreamento de Pedidos", description: "Acompanhamento de entregas", icon: "🚚", color: "from-teal-500 to-cyan-500" },
};

const ToolBlock = ({ type, content, styles, isAdmin }: { type: string; content: any; styles: any; isAdmin?: boolean }) => {
    const metadata = TOOL_METADATA[type] || { name: "Ferramenta", description: "Ferramenta ativa", icon: "🔧", color: "from-slate-500 to-gray-500" };

    return (
        <div className={cn(
            "w-full min-h-[200px] rounded-xl p-8 flex flex-col items-center justify-center text-white",
            `bg-gradient-to-br ${metadata.color}`
        )}>
            <span className="text-5xl mb-4">{metadata.icon}</span>
            <h3 className="text-2xl font-bold mb-2">{content.title || metadata.name}</h3>
            <p className="text-white/80 text-center max-w-md">
                {content.subtitle || metadata.description}
            </p>
            {content.buttonText && (
                <button className="mt-6 px-6 py-2 bg-white text-slate-900 font-semibold rounded-full hover:bg-white/90 transition-colors">
                    {content.buttonText}
                </button>
            )}
            {isAdmin && (
                <p className="mt-4 text-xs text-white/60">
                    ⚙️ Configure esta ferramenta nas configurações
                </p>
            )}
        </div>
    );
};

// =============================================================================
// COLUMNS BLOCK - Side-by-side content/images
// =============================================================================
const ColumnsBlock = ({ content, styles }: { content: any, styles: any }) => {
    const columns = content.columns || [];
    if (columns.length === 0) return null;

    const colCount = columns.length;

    return (
        <div className="w-full">
            <div className="container mx-auto px-3 sm:px-4">
                <div className={cn(
                    "grid gap-2 sm:gap-3 md:gap-4",
                    colCount === 2 ? "grid-cols-1 sm:grid-cols-2" : colCount === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                )}>
                    {columns.map((col: any) => (
                        <div key={col.id} className="relative group overflow-hidden rounded-lg sm:rounded-xl">
                            {col.image ? (
                                <Link href={col.link || "#"}>
                                    <div className="relative aspect-[16/9] sm:aspect-[4/3]">
                                        <Image
                                            src={col.image}
                                            alt={col.content || "Banner"}
                                            fill
                                            sizes={colCount === 2 ? "(max-width: 640px) 100vw, 50vw" : "33vw"}
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {col.content && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 sm:p-6">
                                                <span className="text-white font-bold text-sm sm:text-base md:text-lg">{col.content}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <div className="aspect-[16/9] sm:aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                    {col.content ? (
                                        <div className="p-4 sm:p-6 text-center">
                                            <span className="text-slate-500 font-medium text-sm sm:text-base">{col.content}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm">Banner</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// NEWSLETTER BLOCK - Multiple variants
// =============================================================================
const NewsletterBlock = ({ content, styles }: { content: any, styles: any }) => {
    const variant = styles.variant || "full"; // full, compact, split

    switch (variant) {
        case "compact":
            return <NewsletterCompact content={content} styles={styles} />;
        case "split":
            return <NewsletterSplit content={content} styles={styles} />;
        case "full":
        default:
            return <NewsletterFull content={content} styles={styles} />;
    }
};

// FULL - Centered with icon, large padding
function NewsletterFull({ content, styles }: any) {
    return (
        <div className="w-full text-center flex flex-col items-center justify-center py-12 sm:py-16 md:py-24" style={{ backgroundColor: styles.backgroundColor || '#0f172a' }}>
            <div className="max-w-4xl mx-auto px-4">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-4 sm:mb-6 opacity-80" style={{ color: styles.iconColor || '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2
                    data-field="title"
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: styles.titleColor || '#ffffff' }}
                >
                    {content.title || "Entre para o Clube"}
                </h2>
                <p
                    data-field="description"
                    className="max-w-md mx-auto mb-6 sm:mb-8 opacity-90 cursor-pointer hover:opacity-70 transition-opacity text-sm sm:text-base"
                    style={{ color: styles.textColor || '#ffffff' }}
                >
                    {content.description || "Receba novidades e ofertas exclusivas."}
                </p>
                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <input
                        data-field="placeholder"
                        type="email"
                        placeholder={content.placeholder || "Seu e-mail"}
                        className="flex-1 bg-white/10 border border-white/20 rounded-full h-11 sm:h-12 px-4 sm:px-6 cursor-pointer text-sm sm:text-base"
                        style={{ color: styles.inputTextColor || '#ffffff' }}
                        readOnly
                    />
                    <button
                        data-field="buttonText"
                        className="rounded-full h-11 sm:h-12 px-6 sm:px-8 font-bold cursor-pointer hover:opacity-80 transition-opacity text-sm sm:text-base whitespace-nowrap"
                        style={{ backgroundColor: styles.buttonColor || '#6366f1', color: styles.buttonTextColor || '#ffffff' }}
                    >
                        {content.buttonText || "Inscrever"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// COMPACT - Minimal, single line
function NewsletterCompact({ content, styles }: any) {
    return (
        <div className="w-full py-8" style={{ backgroundColor: styles.backgroundColor || '#000000' }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span
                            data-field="title"
                            className="text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                            style={{ color: styles.titleColor || '#ffffff' }}
                        >
                            {content.title || "Newsletter"}
                        </span>
                        <span
                            data-field="description"
                            className="text-sm opacity-70 hidden md:inline cursor-pointer hover:opacity-50 transition-opacity whitespace-nowrap"
                            style={{ color: styles.textColor || '#ffffff' }}
                        >
                            {content.description || "Receba novidades"}
                        </span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            data-field="placeholder"
                            type="email"
                            placeholder={content.placeholder || "seu@email.com"}
                            className="flex-1 md:w-64 h-10 px-4 rounded border bg-white/5 border-white/20 text-sm cursor-pointer"
                            style={{ color: styles.inputTextColor || '#ffffff' }}
                            readOnly
                        />
                        <button
                            data-field="buttonText"
                            className="h-10 px-6 rounded font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: styles.buttonColor || '#ffffff', color: styles.buttonTextColor || '#000000' }}
                        >
                            {content.buttonText || "→"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// SPLIT - Two columns, text left, form right
function NewsletterSplit({ content, styles }: any) {
    return (
        <div className="w-full py-20" style={{ backgroundColor: styles.backgroundColor || '#f8fafc' }}>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
                    <div>
                        <h2
                            data-field="title"
                            className="text-3xl font-bold mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ color: styles.titleColor || '#111827' }}
                        >
                            {content.title || "Fique por Dentro"}
                        </h2>
                        <p
                            data-field="description"
                            className="text-lg opacity-80 cursor-pointer hover:opacity-60 transition-opacity"
                            style={{ color: styles.textColor || '#6b7280' }}
                        >
                            {content.description || "Inscreva-se para receber ofertas exclusivas e novidades em primeira mão."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input
                            data-field="placeholder"
                            type="email"
                            placeholder={content.placeholder || "Digite seu e-mail"}
                            className="w-full h-14 px-5 rounded-lg border text-base cursor-pointer"
                            style={{ borderColor: styles.buttonColor || '#e5e7eb', color: styles.inputTextColor || '#111827' }}
                            readOnly
                        />
                        <button
                            data-field="buttonText"
                            className="w-full h-14 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: styles.buttonColor || '#111827', color: styles.buttonTextColor || '#ffffff' }}
                        >
                            {content.buttonText || "Quero Receber"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// PROMO BANNER BLOCK - Full-width image banner with text overlay (mid-page CTA)
// =============================================================================
const PromoBannerBlock = ({ content, styles }: { content: any, styles: any }) => {
    const title = content.title || "";
    const subtitle = content.subtitle || "";
    const buttonText = content.buttonText || "";
    const buttonLink = content.buttonLink || "";
    const image = content.image || styles.backgroundImage || "";
    const textAlign = styles.textAlign || "center";
    const textColor = styles.textColor || "#ffffff";
    const overlayOpacity = content.overlayOpacity ?? 0.4;
    const minHeight = styles.minHeight || "400px";

    return (
        <div className="w-full relative overflow-hidden" style={{ minHeight }}>
            {image ? (
                <Image
                    src={image}
                    alt={title || "Banner"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
            )}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
            />
            <div
                className={cn(
                    "relative z-10 flex flex-col justify-center h-full container mx-auto px-6 py-16",
                    textAlign === "left" && "items-start text-left",
                    textAlign === "center" && "items-center text-center",
                    textAlign === "right" && "items-end text-right"
                )}
                style={{ minHeight }}
            >
                {title && (
                    <h2
                        data-field="title"
                        className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-xl"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p
                        data-field="subtitle"
                        className="mt-3 text-base sm:text-lg md:text-xl max-w-lg opacity-90"
                        style={{ color: textColor }}
                    >
                        {subtitle}
                    </p>
                )}
                {buttonText && (
                    <Link
                        href={buttonLink || "#"}
                        className="mt-6 inline-block px-8 py-3 text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-80 rounded"
                        style={{
                            backgroundColor: styles.buttonColor || "transparent",
                            color: styles.buttonTextColor || textColor,
                            border: styles.buttonColor === "transparent" || !styles.buttonColor
                                ? `1px solid ${(styles.buttonTextColor || textColor)}99`
                                : "none"
                        }}
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    );
};

const BrandsLifestyle = ({ content, displayBrands, brandsData, styles }: { content: any, displayBrands: any[], brandsData: any, styles: any }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
    }, [checkScroll]);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = 320;
        el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <div className="py-10 w-full">
            {content.title && (
                <div className="container mx-auto px-4">
                    <h2
                        data-field="title"
                        className="text-xl md:text-2xl font-medium mb-6 text-center"
                        style={{ color: styles.headingColor || '#111827' }}
                    >
                        {content.title}
                    </h2>
                </div>
            )}
            <div className="relative group/brands">
                <div
                    ref={scrollRef}
                    data-brands-scroll=""
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", justifyContent: "safe center" }}
                >
                    {displayBrands.map((brand) => {
                        const brandInfo = brandsData[brand.id] || {};
                        const brandImage = brandInfo.image || brand.imageUrl;
                        const inner = (
                            <div className="relative snap-start flex-shrink-0 w-[260px] md:w-[300px] aspect-[4/5] rounded-lg overflow-hidden group cursor-pointer">
                                {brandImage ? (
                                    <Image src={brandImage} alt={brand.name} fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className="text-white text-lg md:text-xl font-bold tracking-wide uppercase drop-shadow-lg">
                                        {brand.name}
                                    </span>
                                </div>
                            </div>
                        );
                        return brandInfo.link ? (
                            <Link key={brand.id} href={brandInfo.link}>{inner}</Link>
                        ) : (
                            <div key={brand.id}>{inner}</div>
                        );
                    })}
                </div>
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover/brands:opacity-100"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover/brands:opacity-100"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>
        </div>
    );
};

const BrandsBlock = ({ content, brands, styles }: { content: any, brands: any[], styles: any }) => {
    const variant = styles.variant || "default";

    // Determine which brands to show
    let displayBrands: any[] = [];

    if (content.selectionMode === "manual" && content.selectedBrandIds?.length > 0) {
        displayBrands = content.selectedBrandIds
            .map((id: string) => brands.find(b => b.id === id))
            .filter(Boolean);
    } else {
        const limit = content.limit || 6;
        displayBrands = brands.slice(0, limit);
    }

    if (displayBrands.length === 0) return null;

    const brandsData = content.brandsData || {};

    // Lifestyle variant: large cards with images and brand name overlay (like NOVA/YORK)
    if (variant === "lifestyle") {
        return <BrandsLifestyle content={content} displayBrands={displayBrands} brandsData={brandsData} styles={styles} />;
    }

    // Default variant: text-based brand names
    return (
        <div className="py-10 border-b bg-slate-50/50 w-full">
            <div className="container mx-auto px-4 text-center">
                <p
                    data-field="title"
                    className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {content.title || "Nossas Marcas Parceiras"}
                </p>
                {content.subtitle && (
                    <p
                        data-field="subtitle"
                        className="text-sm text-slate-500 mb-4 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                        {content.subtitle}
                    </p>
                )}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {displayBrands.map((brand) => {
                        const brandInfo = brandsData[brand.id] || {};
                        const brandContent = (
                            <div className="text-xl font-bold font-serif" style={{ color: styles.headingColor || '#111827' }}>
                                {brand.name}
                            </div>
                        );

                        return brandInfo.link ? (
                            <Link key={brand.id} href={brandInfo.link}>
                                {brandContent}
                            </Link>
                        ) : (
                            <div key={brand.id}>{brandContent}</div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// CATEGORIES BLOCK - Multiple variants
// =============================================================================
const CategoriesBlock = ({ content, categories, styles }: { content: any, categories: any[], styles: any }) => {
    const variant = styles.variant || "grid"; // grid, horizontal, circular

    let displayCategories: any[] = [];
    if (content.selectionMode === "manual" && content.selectedCategoryIds?.length > 0) {
        displayCategories = content.selectedCategoryIds
            .map((id: string) => categories.find(c => c.id === id))
            .filter(Boolean);
    } else {
        const limit = content.limit || 8;
        displayCategories = categories.slice(0, limit);
    }

    if (displayCategories.length === 0) return null;
    const categoriesData = content.categoriesData || {};

    switch (variant) {
        case "horizontal":
            return <CategoriesHorizontal content={content} categories={displayCategories} categoriesData={categoriesData} styles={styles} />;
        case "circular":
            return <CategoriesCircular content={content} categories={displayCategories} categoriesData={categoriesData} styles={styles} />;
        case "grid":
        default:
            return <CategoriesGrid content={content} categories={displayCategories} categoriesData={categoriesData} styles={styles} />;
    }
};

// GRID - Bento style with featured first item, or equal columns for small counts
function CategoriesGrid({ content, categories, categoriesData, styles }: any) {
    const titleContent = content.title ? (
        <h2
            data-field="title"
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: styles.headingColor || '#111827' }}
        >
            {content.title}
        </h2>
    ) : null;

    // Equal-column layout for 2-3 items (like NOVA/YORK style large cards)
    const useEqualLayout = categories.length <= 3;

    return (
        <div className={cn("w-full", titleContent ? "py-10 sm:py-14 md:py-20" : "py-2 sm:py-3")}>
            <div className="container mx-auto px-3 sm:px-4">
                {titleContent && (
                    <div className="flex items-center justify-center text-center mb-6 sm:mb-8 md:mb-10 gap-4">
                        {content.viewAllLink ? (
                            <Link href={content.viewAllLink}>{titleContent}</Link>
                        ) : titleContent}
                    </div>
                )}
                <div className={cn(
                    "grid gap-2 sm:gap-3 md:gap-4",
                    useEqualLayout
                        ? categories.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                )}>
                    {categories.map((cat: any, index: number) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;
                        const isLarge = !useEqualLayout && index === 0;

                        return (
                            <Link
                                href={displayLink}
                                key={cat.id}
                                className={cn(
                                    "relative group overflow-hidden bg-gray-100",
                                    useEqualLayout
                                        ? "rounded-lg sm:rounded-xl aspect-[4/3] sm:aspect-[3/4]"
                                        : cn("rounded-xl sm:rounded-2xl aspect-square", isLarge && "col-span-2 row-span-2")
                                )}
                            >
                                {displayImage ? (
                                    <Image src={displayImage} alt={displayName} fill sizes={useEqualLayout ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 50vw, 25vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-white/60 font-bold text-4xl sm:text-5xl">
                                        {displayName.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6 text-center">
                                    <span className={cn(
                                        "font-bold block",
                                        useEqualLayout ? "text-lg sm:text-xl md:text-2xl" : isLarge ? "text-lg sm:text-xl md:text-2xl" : "text-sm sm:text-base md:text-lg"
                                    )} style={{ color: styles.cardTextColor || '#ffffff' }}>
                                        {displayName}
                                    </span>
                                    {(isLarge || useEqualLayout) && (
                                        <span className="text-xs sm:text-sm mt-1 inline-block opacity-80" style={{ color: styles.cardTextColor || '#ffffff' }}>
                                            Explorar →
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// HORIZONTAL - Scrolling cards in a row (always centered)
function CategoriesHorizontal({ content, categories, categoriesData, styles }: any) {
    const titleContent = (
        <h2
            data-field="title"
            className="text-lg sm:text-xl md:text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: styles.headingColor || '#111827' }}
        >
            {content.title || "Categorias"}
        </h2>
    );

    return (
        <div className="py-8 sm:py-10 md:py-12 w-full">
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-center text-center mb-4 sm:mb-6 gap-4">
                    {content.viewAllLink ? (
                        <Link href={content.viewAllLink}>{titleContent}</Link>
                    ) : titleContent}
                </div>
                <div className="flex gap-3 sm:gap-6 md:gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4 snap-x">
                    {categories.map((cat: any) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;

                        return (
                            <Link href={displayLink} key={cat.id} className="flex-shrink-0 group w-32 sm:w-48 md:w-64 snap-start">
                                <div className="rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 mb-2 relative aspect-[4/5]">
                                    {displayImage ? (
                                        <Image src={displayImage} alt={displayName} fill sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 256px" className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl sm:text-4xl md:text-5xl font-bold">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm md:text-base font-medium truncate text-center" style={{ color: styles.headingColor || '#111827' }}>
                                    {displayName}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// CIRCULAR - Round avatars in a centered row (always centered)
function CategoriesCircular({ content, categories, categoriesData, styles }: any) {
    const titleContent = (
        <h2
            data-field="title"
            className="text-2xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: styles.headingColor || '#111827' }}
        >
            {content.title || "Explore por Categoria"}
        </h2>
    );

    return (
        <div className="py-16 w-full">
            <div className="container mx-auto px-4 text-center">
                {content.viewAllLink ? (
                    <Link href={content.viewAllLink}>{titleContent}</Link>
                ) : titleContent}
                <p className="text-sm text-slate-500 mb-10">Encontre o que você procura</p>
                <div className="flex flex-wrap gap-12 justify-center">
                    {categories.map((cat: any) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;

                        return (
                            <Link href={displayLink} key={cat.id} className="group flex flex-col items-center gap-4" style={{ width: 240 }}>
                                <div
                                    className="rounded-full overflow-hidden border-2 group-hover:border-4 transition-all duration-300"
                                    style={{ width: 220, height: 220, borderColor: styles.accentColor || '#000' }}
                                >
                                    {displayImage ? (
                                        <div className="relative w-full h-full">
                                            <Image src={displayImage} alt={displayName} fill sizes="220px" className="object-cover" loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-bold">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium leading-tight text-center w-full" style={{ color: styles.headingColor || '#111827' }}>
                                    {displayName}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// BLOG POSTS BLOCK - Show blog/content posts (like "Últimas do blog")
// =============================================================================
const BlogPostsBlock = ({ content, styles }: { content: any, styles: any }) => {
    const posts = content.posts || [];
    const columns = content.columns || 2;

    if (posts.length === 0) {
        // Placeholder for admin preview
        return (
            <div className="py-10 w-full">
                <div className="container mx-auto px-4">
                    {content.title && (
                        <div className="mb-6">
                            <h2 className="text-xl md:text-2xl font-medium text-center" style={{ color: styles.headingColor || '#111827' }}>
                                {content.title}
                            </h2>
                        </div>
                    )}
                    <div className={cn("grid gap-6", columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
                        {[1, 2].map((i) => (
                            <div key={i} className="group">
                                <div className="aspect-[16/10] bg-slate-100 rounded-lg mb-3" />
                                <p className="text-sm text-slate-400">Adicione posts no editor</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-10 w-full">
            <div className="container mx-auto px-4">
                {content.title && (
                    <div className="mb-6">
                        <h2
                            data-field="title"
                            className="text-xl md:text-2xl font-medium text-center"
                            style={{ color: styles.headingColor || '#111827' }}
                        >
                            {content.title}
                        </h2>
                        {content.linkText && content.linkUrl && (
                            <div className="flex justify-center mt-2">
                                <Link
                                    href={content.linkUrl}
                                    className="text-sm flex items-center gap-1 hover:underline"
                                    style={{ color: styles.textColor || '#6b7280' }}
                                >
                                    {content.linkText} <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                <div className={cn("grid gap-6", columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
                    {posts.slice(0, content.limit || 4).map((post: any) => (
                        <div key={post.id} className="group">
                            {post.url ? (
                                <Link href={post.url} className="block">
                                    {post.image && (
                                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <h3
                                        className="text-sm md:text-base font-medium group-hover:underline"
                                        style={{ color: styles.headingColor || '#111827' }}
                                    >
                                        {post.title}
                                    </h3>
                                </Link>
                            ) : (
                                <>
                                    {post.image && (
                                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <h3
                                        className="text-sm md:text-base font-medium"
                                        style={{ color: styles.headingColor || '#111827' }}
                                    >
                                        {post.title}
                                    </h3>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface BlockRendererProps {
    blocks: PageBlock[];
    isAdmin?: boolean;
    onSelectBlock?: (blockId: string) => void;
    products?: any[];
    categories?: any[];
    brands?: any[];
    config?: any;
}

export function BlockRenderer({ blocks, isAdmin, onSelectBlock, products = [], categories = [], brands = [], config }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="flex flex-col w-full">
            {blocks.map((block) => {
                const styles = block.styles || {} as any;

                // Construct inline styles from block settings
                const containerStyle: React.CSSProperties = {
                    background: styles.background, // Support gradients and complex backgrounds
                    backgroundColor: styles.backgroundColor,
                    backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: styles.minHeight, // Support minHeight for hero sections
                    paddingTop: styles.paddingTop,
                    paddingBottom: styles.paddingBottom,
                    paddingLeft: styles.paddingLeft,
                    paddingRight: styles.paddingRight,
                    marginTop: styles.marginTop,
                    marginBottom: styles.marginBottom,
                    textAlign: styles.textAlign,
                    color: styles.textColor,
                    // Use borderRadius if provided, else default to none for sections usually
                    borderRadius: styles.borderRadius
                };

                return (
                    <section
                        key={block.id}
                        id={block.id}
                        data-block-id={block.id}
                        onClick={(e) => {
                            if (isAdmin && onSelectBlock) {
                                e.stopPropagation(); // Prevent parent clicks
                                onSelectBlock(block.id);
                            }
                        }}
                        className={cn(
                            "relative w-full transition-all flex flex-col justify-center", // Added flex-col to ensure inner content height behavior
                            isAdmin && "hover:ring-2 ring-blue-500 ring-inset group cursor-pointer"
                        )}
                        style={containerStyle}
                    >
                        {/* Admin Overlay (Future: Click to Edit) */}
                        {isAdmin && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {block.label || block.type}
                            </div>
                        )}

                        <div className={cn(
                            "w-full",
                            !styles.fullWidth && "container mx-auto px-4"
                        )}>
                            {/* Block Content Switch */}
                            {block.type === "html" && <HtmlBlock content={block.content} isAdmin={isAdmin} />}
                            {block.type === "hero" && <HeroBlock content={block.content} styles={styles} />}
                            {block.type === "text" && <TextBlock content={block.content} styles={styles} />}
                            {block.type === "product-grid" && <ProductGridBlock content={block.content} products={products} config={config} variant={block.variant} styles={styles} />}
                            {block.type === "brands" && <BrandsBlock content={block.content} brands={brands} styles={styles} />}
                            {block.type === "categories" && <CategoriesBlock content={block.content} categories={categories} styles={styles} />}
                            {block.type === "blog-posts" && <BlogPostsBlock content={block.content} styles={styles} />}
                            {block.type === "columns" && <ColumnsBlock content={block.content} styles={styles} />}
                            {block.type === "newsletter" && <NewsletterBlock content={block.content} styles={styles} />}
                            {block.type === "instagram" && <InstagramBlock content={block.content} />}
                            {block.type === "map" && <MapBlock content={block.content} />}
                            {block.type === "promo" && <PromoBlock content={block.content} styles={styles} />}
                            {block.type === "promo-banner" && <PromoBannerBlock content={block.content} styles={styles} />}

                            {/* Tool Blocks */}
                            {(block.type === "tool-scheduling" || block.type === "tool-salon") && (
                                <SchedulingBlock content={block.content} styles={styles} isAdmin={isAdmin} />
                            )}
                            {block.type.startsWith("tool-") && block.type !== "tool-scheduling" && block.type !== "tool-salon" && (
                                <ToolBlock type={block.type} content={block.content} styles={styles} isAdmin={isAdmin} />
                            )}
                        </div>

                        {/* Custom CSS Injection (Advanced) */}
                        {styles.customCss && (
                            <style dangerouslySetInnerHTML={{ __html: `#${block.id} { ${styles.customCss} }` }} />
                        )}
                    </section>
                );
            })}
        </div>
    );
}
