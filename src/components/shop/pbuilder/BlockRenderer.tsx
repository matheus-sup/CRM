"use client";

import { PageBlock } from "@/types/page-builder";
import { HtmlBlock } from "./blocks/HtmlBlock";
import { cn } from "@/lib/utils";
import { Instagram, MapPin, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import { useState, useEffect } from "react";

// =============================================================================
// HERO BLOCK - Multiple variants
// =============================================================================
const HeroBlock = ({ content, styles, variant }: { content: any, styles: any, variant?: string }) => {
    const blockVariant = variant || styles.variant || "default"; // default, minimal, split, video

    switch (blockVariant) {
        case "minimal":
            return <HeroMinimal content={content} styles={styles} />;
        case "split":
            return <HeroSplit content={content} styles={styles} />;
        case "video":
            return <HeroVideo content={content} styles={styles} />;
        case "default":
        default:
            return <HeroDefault content={content} styles={styles} />;
    }
};

// Shared hook for carousel
function useHeroCarousel(content: any) {
    const slides = content.slides || [{ id: "default", title: content.title || "Banner", subtitle: content.subtitle, buttonText: content.buttonText, buttonLink: content.buttonLink || "/produtos" }];
    const [currentSlide, setCurrentSlide] = useState(0);
    const autoplay = content.autoplay || false;
    const autoplayInterval = (content.autoplayInterval || 5) * 1000;

    useEffect(() => {
        if (!autoplay || slides.length <= 1) return;
        const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), autoplayInterval);
        return () => clearInterval(interval);
    }, [autoplay, autoplayInterval, slides.length]);

    return {
        slides,
        currentSlide,
        currentSlideData: slides[currentSlide],
        nextSlide: () => setCurrentSlide((prev) => (prev + 1) % slides.length),
        prevSlide: () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length),
        goToSlide: (i: number) => setCurrentSlide(i)
    };
}

// DEFAULT - Classic centered/aligned hero with carousel support
function HeroDefault({ content, styles }: any) {
    const { slides, currentSlide, currentSlideData, nextSlide, prevSlide, goToSlide } = useHeroCarousel(content);
    const alignClass = styles.textAlign === 'left' ? 'items-start text-left' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center';

    return (
        <div className="w-full relative">
            <div className={cn("w-full flex flex-col justify-center pt-24 md:pt-32 pb-12 transition-all duration-500", alignClass)}>
                <h1
                    data-field="title"
                    className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: styles.titleColor || styles.textColor || "#000000" }}
                >
                    {currentSlideData.title}
                </h1>
                {currentSlideData.subtitle && (
                    <p
                        data-field="subtitle"
                        className="text-lg md:text-xl opacity-90 max-w-2xl font-medium cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: styles.textColor || "#000000" }}
                    >
                        {currentSlideData.subtitle}
                    </p>
                )}
                {currentSlideData.buttonText && (
                    <Link href={currentSlideData.buttonLink || "/produtos"}>
                        <button
                            data-field="buttonText"
                            className="mt-8 px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 shadow-lg cursor-pointer"
                            style={{ backgroundColor: styles.buttonColor || "#ffffff", color: styles.buttonTextColor || "#000000" }}
                        >
                            {currentSlideData.buttonText}
                        </button>
                    </Link>
                )}
            </div>
            {slides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-lg z-10"><ChevronLeft className="h-6 w-6" /></button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-lg z-10"><ChevronRight className="h-6 w-6" /></button>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {slides.map((_: any, i: number) => (
                            <button key={i} onClick={() => goToSlide(i)} className={cn("h-2 rounded-full transition-all", i === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50")} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// MINIMAL - Compact, typography-focused, no carousel controls visible
function HeroMinimal({ content, styles }: any) {
    const { currentSlideData } = useHeroCarousel(content);

    return (
        <div className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                    <h1
                        data-field="title"
                        className="text-3xl md:text-5xl font-light tracking-tight mb-4 leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: styles.titleColor || "#000000" }}
                    >
                        {currentSlideData.title}
                    </h1>
                    {currentSlideData.subtitle && (
                        <p
                            data-field="subtitle"
                            className="text-base md:text-lg opacity-70 mb-6 max-w-xl cursor-pointer hover:opacity-50 transition-opacity"
                            style={{ color: styles.textColor || "#666666" }}
                        >
                            {currentSlideData.subtitle}
                        </p>
                    )}
                    {currentSlideData.buttonText && (
                        <Link href={currentSlideData.buttonLink || "/produtos"}>
                            <button
                                data-field="buttonText"
                                className="px-6 py-2.5 text-sm font-medium rounded border transition-colors hover:opacity-80 cursor-pointer"
                                style={{ borderColor: styles.buttonColor || "#000000", backgroundColor: styles.buttonColor || "#000000", color: styles.buttonTextColor || "#ffffff" }}
                            >
                                {currentSlideData.buttonText}
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// SPLIT - Two columns: text left, image/gradient right
function HeroSplit({ content, styles }: any) {
    const { slides, currentSlide, currentSlideData, nextSlide, prevSlide } = useHeroCarousel(content);

    return (
        <div className="w-full min-h-[70vh] grid md:grid-cols-2">
            {/* Text Side */}
            <div className="flex flex-col justify-center p-8 md:p-16 order-2 md:order-1" style={{ backgroundColor: styles.backgroundColor || "#ffffff" }}>
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
            </div>
            {/* Image/Color Side */}
            <div className="min-h-[300px] md:min-h-full order-1 md:order-2" style={{ background: styles.background || styles.accentColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                {currentSlideData.imageUrl && (
                    <img src={currentSlideData.imageUrl} alt={currentSlideData.title} className="w-full h-full object-cover" />
                )}
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

const ProductGridBlock = ({ content, products, isAdmin, config }: { content: any, products: any[], isAdmin?: boolean, config?: any }) => {
    // Manual selection mode: use selectedProductIds
    // Auto selection mode: filter by collectionType
    let filteredProducts: any[] = [];

    if (content.selectionMode === "manual") {
        // Manual mode: get products by IDs in the order they were selected
        const selectedIds = content.selectedProductIds || [];
        filteredProducts = selectedIds
            .map((id: string) => products.find(p => p.id === id))
            .filter(Boolean) // Remove undefined (in case product was deleted)
            .slice(0, content.limit || 50);
    } else {
        // Auto mode: filter by criteria with fallback
        const limit = content.limit || 8;

        if (content.collectionType === "category" && content.categoryId) {
            filteredProducts = products.filter(p => p.categoryId === content.categoryId).slice(0, limit);
        } else if (content.collectionType === "new") {
            // Try to get new arrivals, fallback to most recent products
            const newArrivals = products.filter(p => p.isNewArrival);
            filteredProducts = newArrivals.length > 0
                ? newArrivals.slice(0, limit)
                : products.slice(0, limit); // Fallback: most recent
        } else if (content.collectionType === "featured") {
            // Try to get featured, fallback to most recent products
            const featured = products.filter(p => p.isFeatured);
            filteredProducts = featured.length > 0
                ? featured.slice(0, limit)
                : products.slice(0, limit); // Fallback: most recent
        } else {
            // "all" - show all products
            filteredProducts = products.slice(0, limit);
        }
    }

    if (filteredProducts.length === 0) {
        if (!isAdmin) return null; // Hide on live site if empty
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

    return (
        <div className="py-8">
            {content.title && (
                <h2
                    data-field="title"
                    className="text-3xl font-bold text-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {content.title}
                </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} config={config} />
                ))}
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
        <div className="w-full text-center flex flex-col items-center justify-center py-24" style={{ backgroundColor: styles.backgroundColor || '#0f172a' }}>
            <div className="max-w-4xl mx-auto px-4">
                <svg className="h-12 w-12 mx-auto mb-6 opacity-80" style={{ color: styles.iconColor || '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2
                    data-field="title"
                    className="text-4xl font-bold mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: styles.titleColor || '#ffffff' }}
                >
                    {content.title || "Entre para o Clube"}
                </h2>
                <p
                    data-field="description"
                    className="max-w-md mx-auto mb-8 opacity-90 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: styles.textColor || '#ffffff' }}
                >
                    {content.description || "Receba novidades e ofertas exclusivas."}
                </p>
                <div className="max-w-md mx-auto flex gap-2">
                    <input
                        data-field="placeholder"
                        type="email"
                        placeholder={content.placeholder || "Seu e-mail"}
                        className="flex-1 bg-white/10 border border-white/20 rounded-full h-12 px-6 cursor-pointer"
                        style={{ color: styles.inputTextColor || '#ffffff' }}
                        readOnly
                    />
                    <button
                        data-field="buttonText"
                        className="rounded-full h-12 px-8 font-bold cursor-pointer hover:opacity-80 transition-opacity"
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span
                            data-field="title"
                            className="text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ color: styles.titleColor || '#ffffff' }}
                        >
                            {content.title || "Newsletter"}
                        </span>
                        <span
                            data-field="description"
                            className="text-sm opacity-70 hidden md:inline cursor-pointer hover:opacity-50 transition-opacity"
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

const BrandsBlock = ({ content, brands, styles }: { content: any, brands: any[], styles: any }) => {
    // Determine which brands to show
    let displayBrands: any[] = [];

    if (content.selectionMode === "manual" && content.selectedBrandIds?.length > 0) {
        // Manual mode: show selected brands in order
        displayBrands = content.selectedBrandIds
            .map((id: string) => brands.find(b => b.id === id))
            .filter(Boolean);
    } else {
        // Auto mode: show all brands with limit
        const limit = content.limit || 6;
        displayBrands = brands.slice(0, limit);
    }

    if (displayBrands.length === 0) return null;

    const brandsData = content.brandsData || {};

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
                        const content = (
                            <div className="text-xl font-bold font-serif" style={{ color: styles.headingColor || '#111827' }}>
                                {brand.name}
                            </div>
                        );

                        return brandInfo.link ? (
                            <Link key={brand.id} href={brandInfo.link}>
                                {content}
                            </Link>
                        ) : (
                            <div key={brand.id}>{content}</div>
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

// GRID - Bento style with featured first item
function CategoriesGrid({ content, categories, categoriesData, styles }: any) {
    return (
        <div className="py-20 w-full">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-10">
                    <h2
                        data-field="title"
                        className="text-3xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: styles.headingColor || '#111827' }}
                    >
                        {content.title || "Categorias em Destaque"}
                    </h2>
                    <Link href={content.viewAllLink || "/categorias"} className="text-sm font-medium hover:underline flex items-center gap-1 opacity-70">
                        Ver todas →
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[400px]">
                    {categories.map((cat: any, index: number) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;
                        const isLarge = index === 0;
                        const gridClass = isLarge ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square";

                        return (
                            <Link href={displayLink} key={cat.id} className={`relative group rounded-2xl overflow-hidden bg-gray-100 ${gridClass}`}>
                                {displayImage ? (
                                    <img src={displayImage} alt={displayName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-slate-400 font-bold text-lg">
                                        {displayName.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className={`font-bold block ${isLarge ? "text-2xl" : "text-lg"}`} style={{ color: styles.cardTextColor || '#ffffff' }}>
                                        {displayName}
                                    </span>
                                    {isLarge && <span className="text-sm mt-1 inline-block opacity-80" style={{ color: styles.cardTextColor || '#ffffff' }}>Explorar →</span>}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// HORIZONTAL - Scrolling cards in a row
function CategoriesHorizontal({ content, categories, categoriesData, styles }: any) {
    return (
        <div className="py-12 w-full">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2
                        data-field="title"
                        className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: styles.headingColor || '#111827' }}
                    >
                        {content.title || "Categorias"}
                    </h2>
                    <Link href={content.viewAllLink || "/categorias"} className="text-sm font-medium hover:underline opacity-70">
                        Ver todas →
                    </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                    {categories.map((cat: any) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;

                        return (
                            <Link href={displayLink} key={cat.id} className="flex-shrink-0 w-40 group">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                                    {displayImage ? (
                                        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-center truncate" style={{ color: styles.headingColor || '#111827' }}>
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

// CIRCULAR - Round avatars in a centered row
function CategoriesCircular({ content, categories, categoriesData, styles }: any) {
    return (
        <div className="py-16 w-full">
            <div className="container mx-auto px-4 text-center">
                <h2
                    data-field="title"
                    className="text-2xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: styles.headingColor || '#111827' }}
                >
                    {content.title || "Explore por Categoria"}
                </h2>
                <p className="text-sm text-slate-500 mb-10">Encontre o que você procura</p>
                <div className="flex flex-wrap justify-center gap-8">
                    {categories.map((cat: any) => {
                        const catData = categoriesData[cat.id] || {};
                        const displayName = catData.name || cat.name;
                        const displayImage = catData.imageUrl || cat.imageUrl;
                        const displayLink = catData.link || `/search?category=${cat.slug}`;

                        return (
                            <Link href={displayLink} key={cat.id} className="group flex flex-col items-center gap-3 w-24">
                                <div
                                    className="w-20 h-20 rounded-full overflow-hidden border-2 group-hover:border-4 transition-all duration-300"
                                    style={{ borderColor: styles.accentColor || '#000' }}
                                >
                                    {displayImage ? (
                                        <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-center leading-tight" style={{ color: styles.headingColor || '#111827' }}>
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

interface BlockRendererProps {
    blocks: PageBlock[];
    isAdmin?: boolean; // If true, shows hover effects/edit controls (future)
    onSelectBlock?: (blockId: string) => void;
    products?: any[];
    categories?: any[];
    brands?: any[];
    config?: any; // Store config for component styles
}

export function BlockRenderer({ blocks, isAdmin, onSelectBlock, products = [], categories = [], brands = [], config }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="flex flex-col w-full">
            {blocks.map((block) => {
                const { styles } = block;

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
                            {block.type === "product-grid" && <ProductGridBlock content={block.content} products={products} config={config} />}
                            {block.type === "brands" && <BrandsBlock content={block.content} brands={brands} styles={styles} />}
                            {block.type === "categories" && <CategoriesBlock content={block.content} categories={categories} styles={styles} />}
                            {block.type === "newsletter" && <NewsletterBlock content={block.content} styles={styles} />}
                            {block.type === "instagram" && <InstagramBlock content={block.content} />}
                            {block.type === "map" && <MapBlock content={block.content} />}
                            {block.type === "promo" && <PromoBlock content={block.content} styles={styles} />}
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
