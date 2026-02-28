"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

// Hook: detect scroll in the nearest scrollable ancestor (for editor preview) or window
function useScrolled(threshold = 20) {
    const [scrolled, setScrolled] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Find the nearest scrollable ancestor
        let scrollTarget: Element | Window = window;
        let el = headerRef.current?.parentElement;
        while (el) {
            const style = getComputedStyle(el);
            if (style.overflow === "auto" || style.overflow === "scroll" ||
                style.overflowY === "auto" || style.overflowY === "scroll") {
                scrollTarget = el;
                break;
            }
            el = el.parentElement;
        }

        const handleScroll = () => {
            const scrollY = scrollTarget instanceof Window
                ? scrollTarget.scrollY
                : scrollTarget.scrollTop;
            setScrolled(scrollY > threshold);
        };

        scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => scrollTarget.removeEventListener("scroll", handleScroll);
    }, [threshold]);

    return { scrolled, headerRef };
}

// Helper to ensure internal links have leading slash
function normalizeUrl(url: string) {
    if (!url) return "#";
    if (url.startsWith("http") || url.startsWith("/") || url.startsWith("#")) return url;
    return `/${url}`;
}

interface HeaderProps {
    config?: any;
    categories?: any[];
    editorMode?: boolean;
    isPreview?: boolean;
    onFieldClick?: (field: string) => void;
}

export function Header({ config, categories, editorMode, isPreview, onFieldClick }: HeaderProps) {
    const headerStyle = config?.headerStyle || "classic";

    switch (headerStyle) {
        case "centered":
            return <CenteredHeader config={config} categories={categories} editorMode={editorMode} isPreview={isPreview} onFieldClick={onFieldClick} />;
        case "minimal":
            return <MinimalHeader config={config} categories={categories} editorMode={editorMode} isPreview={isPreview} onFieldClick={onFieldClick} />;
        case "restaurant":
            return <RestaurantHeader config={config} categories={categories} editorMode={editorMode} isPreview={isPreview} onFieldClick={onFieldClick} />;
        case "optica":
            return <OpticaHeader config={config} categories={categories} editorMode={editorMode} isPreview={isPreview} onFieldClick={onFieldClick} />;
        case "classic":
        default:
            return <ClassicHeader config={config} categories={categories} editorMode={editorMode} isPreview={isPreview} onFieldClick={onFieldClick} />;
    }
}

// =============================================================================
// CLASSIC HEADER - Logo left, search center, icons right, menu below
// =============================================================================
function ClassicHeader({ config, categories, editorMode, isPreview, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, isPreview?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const { scrolled, headerRef } = useScrolled();

    const storeName = config?.storeName || "Loja";
    const logoUrl = config?.logoUrl;

    // Visibility settings with defaults
    const showSearch = config?.showHeaderSearch !== false && config?.showHeaderSearch !== "false";
    const showCart = config?.showHeaderCart !== false && config?.showHeaderCart !== "false";
    const showAccount = config?.showHeaderAccount !== false && config?.showHeaderAccount !== "false";

    // Editor mode click handler
    const handleFieldClick = (field: string) => (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick(field);
        }
    };

    // Editor mode classes for hover effect
    const editorClass = editorMode ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded transition-all" : "";

    return (
        <header
            ref={headerRef}
            data-section="header"
            data-style="classic"
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "shadow-md py-0 border-b border-primary/10 bg-background/95 backdrop-blur-md"
                    : "shadow-none py-2 border-transparent bg-transparent"
            )}
            style={{ backgroundColor: config?.headerColor || "var(--background)" }}
        >
            <div className="container mx-auto">
                <div className="flex h-24 items-center gap-4 px-4 md:gap-8">
                    <MobileMenu config={config} storeName={storeName} />

                    {/* Left: Logo */}
                    <div className="shrink-0">
                        <Link href={editorMode ? "#" : "/loja"} className="flex flex-col items-start gap-1" onClick={editorMode ? handleFieldClick("headerText") : undefined}>
                            {(config?.headerShowLogo !== false && logoUrl) ? (
                                <img
                                    src={logoUrl}
                                    alt={storeName}
                                    className={cn("object-contain transition-all duration-300", editorClass)}
                                    style={{ width: `${Math.min(80, Math.max(20, config?.headerLogoWidth || 55))}px`, height: 'auto' }}
                                    data-field="headerLogoWidth"
                                />
                            ) : (
                                <div className="flex flex-col">
                                    <span
                                        className={cn("text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none", editorClass)}
                                        style={{ color: config?.themeColor || "var(--primary)" }}
                                        data-field="headerText"
                                    >
                                        {config?.headerText || storeName}
                                    </span>
                                    {config?.headerSubtext && (
                                        <span
                                            className={cn("text-[10px] tracking-[0.2em] font-medium text-muted-foreground uppercase mt-1", editorClass)}
                                            data-field="headerSubtext"
                                            onClick={handleFieldClick("headerSubtext")}
                                        >
                                            {config.headerSubtext}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Center: Search */}
                    {showSearch && (
                        <div
                            className={cn("hidden flex-1 md:block max-w-2xl mx-auto", editorClass)}
                            onClick={handleFieldClick("headerSearchPlaceholder")}
                            data-field="headerSearchPlaceholder"
                        >
                            <div
                                className="relative flex shadow-sm rounded-full overflow-hidden transition-colors border-2"
                                style={{ borderColor: config?.searchBtnBg || config?.themeColor || "var(--primary)" }}
                            >
                                <Input
                                    type="search"
                                    placeholder={config?.headerSearchPlaceholder || "O que você está buscando?"}
                                    className="h-12 w-full rounded-l-full border-0 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm pl-6"
                                    readOnly={editorMode}
                                />
                                <Button
                                    variant="ghost"
                                    className="h-12 w-14 rounded-r-full hover:opacity-90 transition-opacity"
                                    style={{
                                        backgroundColor: config?.searchBtnBg || config?.themeColor || "var(--primary)",
                                        color: config?.searchIconColor || "white"
                                    }}
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Right: Actions */}
                    <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3">
                        {showAccount && (
                            <Button
                                variant="ghost"
                                className={cn("rounded-full h-11 w-11 p-0 hover:bg-black/5", editorClass)}
                                onClick={editorMode ? handleFieldClick("menuColor") : undefined}
                                data-field="menuColor"
                                asChild={!editorMode}
                            >
                                {editorMode ? (
                                    <User className="h-6 w-6" style={{ color: config?.menuColor || "var(--foreground)" }} />
                                ) : (
                                    <Link href="/loja/minha-conta">
                                        <User className="h-6 w-6" style={{ color: config?.menuColor || "var(--foreground)" }} />
                                    </Link>
                                )}
                            </Button>
                        )}
                        {showCart && (
                            <div
                                className={cn("relative", editorClass)}
                                onClick={editorMode ? handleFieldClick("cartCountBg") : undefined}
                                data-field="cartCountBg"
                            >
                                <Button variant="ghost" className="rounded-full h-11 w-11 p-0 hover:bg-black/5" onClick={editorMode ? undefined : toggleCart}>
                                    <ShoppingBag className="h-6 w-6" style={{ color: config?.menuColor || "var(--foreground)" }} />
                                    {items.length > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white"
                                            style={{ backgroundColor: config?.cartCountBg || config?.themeColor, color: config?.cartCountText || "white" }}
                                        >
                                            {items.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu below */}
                <NavMenu config={config} className="px-4 pb-2 hidden md:block" editorMode={editorMode} onFieldClick={onFieldClick} />
            </div>
        </header>
    );
}

// =============================================================================
// CENTERED HEADER - Logo centered, menu above, search and icons on sides
// =============================================================================
function CenteredHeader({ config, categories, editorMode, isPreview, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, isPreview?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const { scrolled, headerRef } = useScrolled();
    const [searchOpen, setSearchOpen] = useState(false);

    const storeName = config?.storeName || "Loja";
    const logoUrl = config?.logoUrl;

    // Visibility settings with defaults
    const showSearch = config?.showHeaderSearch !== false && config?.showHeaderSearch !== "false";
    const showCart = config?.showHeaderCart !== false && config?.showHeaderCart !== "false";
    const showAccount = config?.showHeaderAccount !== false && config?.showHeaderAccount !== "false";

    // Editor mode click handler
    const handleFieldClick = (field: string) => (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick(field);
        }
    };

    const editorClass = editorMode ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded transition-all" : "";

    return (
        <header
            ref={headerRef}
            data-section="header"
            data-style="centered"
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled ? "shadow-md bg-background/95 backdrop-blur-md" : "bg-transparent"
            )}
            style={{ backgroundColor: config?.headerColor || "var(--background)" }}
        >
            <div className="container mx-auto px-4">
                {/* Top bar with search and icons */}
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <MobileMenu config={config} storeName={storeName} />

                    {/* Left: Search toggle */}
                    {showSearch && (
                        <div className="hidden md:flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-sm"
                                onClick={() => setSearchOpen(!searchOpen)}
                                style={{ color: config?.menuColor || "var(--foreground)" }}
                            >
                                <Search className="h-4 w-4" />
                                Buscar
                            </Button>
                        </div>
                    )}

                    {/* Center: Nav Menu */}
                    <NavMenu config={config} className="hidden md:flex justify-center gap-8" inline editorMode={editorMode} onFieldClick={onFieldClick} />

                    {/* Right: Icons */}
                    <div className="flex items-center gap-2">
                        {showAccount && (
                            <Button variant="ghost" size="sm" className="gap-2 text-sm hidden md:flex" asChild>
                                <Link href="/loja/minha-conta" style={{ color: config?.menuColor || "var(--foreground)" }}>
                                    <User className="h-4 w-4" />
                                    Conta
                                </Link>
                            </Button>
                        )}
                        {showCart && (
                            <div className="relative">
                                <Button variant="ghost" size="sm" className="gap-2 text-sm" onClick={toggleCart} style={{ color: config?.menuColor || "var(--foreground)" }}>
                                    <ShoppingBag className="h-4 w-4" />
                                    <span className="hidden md:inline">Carrinho</span>
                                    {items.length > 0 && (
                                        <span
                                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                                            style={{ backgroundColor: config?.cartCountBg || config?.themeColor, color: config?.cartCountText || "white" }}
                                        >
                                            {items.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search bar expandable */}
                {showSearch && searchOpen && (
                    <div className="py-3 border-b border-border/50 hidden md:block">
                        <div
                            className="max-w-xl mx-auto relative rounded-full overflow-hidden shadow-sm border-2"
                            style={{ borderColor: config?.searchBtnBg || config?.themeColor || "var(--primary)" }}
                        >
                            <Input
                                type="search"
                                placeholder={config?.headerSearchPlaceholder || "O que você está buscando?"}
                                className="h-10 pr-10 border-0 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => setSearchOpen(false)}
                                style={{ color: config?.searchBtnBg || config?.themeColor || "var(--primary)" }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Center: Logo */}
                <div className="flex justify-center py-4">
                    <Link href="/loja" className="flex flex-col items-center gap-1">
                        {(config?.headerShowLogo !== false && logoUrl) ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="object-contain"
                                style={{ width: `${Math.min(80, Math.max(20, config?.headerLogoWidth || 55))}px`, height: 'auto' }}
                            />
                        ) : (
                            <div className="text-center">
                                <span className="text-3xl md:text-4xl font-black tracking-tight uppercase" style={{ color: config?.themeColor || "var(--primary)" }}>
                                    {config?.headerText || storeName}
                                </span>
                                {config?.headerSubtext && (
                                    <p className="text-xs tracking-[0.3em] font-medium text-muted-foreground uppercase mt-1">
                                        {config.headerSubtext}
                                    </p>
                                )}
                            </div>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}

// =============================================================================
// MINIMAL HEADER - Compact, logo left, no visible search, icons right
// =============================================================================
function MinimalHeader({ config, categories, editorMode, isPreview, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, isPreview?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const { scrolled, headerRef } = useScrolled();
    const [searchOpen, setSearchOpen] = useState(false);

    const storeName = config?.storeName || "Loja";
    const logoUrl = config?.logoUrl;

    // Visibility settings with defaults
    const showSearch = config?.showHeaderSearch !== false && config?.showHeaderSearch !== "false";
    const showCart = config?.showHeaderCart !== false && config?.showHeaderCart !== "false";
    const showAccount = config?.showHeaderAccount !== false && config?.showHeaderAccount !== "false";

    // Editor mode click handler
    const handleFieldClick = (field: string) => (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick(field);
        }
    };

    const editorClass = editorMode ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded transition-all" : "";

    return (
        <header
            ref={headerRef}
            data-section="header"
            data-style="minimal"
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled ? "shadow-sm bg-background/98 backdrop-blur-sm" : "bg-transparent"
            )}
            style={{ backgroundColor: config?.headerColor || "var(--background)" }}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <MobileMenu config={config} storeName={storeName} />

                    {/* Left: Logo */}
                    <Link href="/loja" className="flex flex-col items-start gap-0">
                        {(config?.headerShowLogo !== false && logoUrl) ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="object-contain"
                                style={{ width: `${Math.min(80, Math.max(20, config?.headerLogoWidth || 55))}px`, height: 'auto' }}
                            />
                        ) : (
                            <>
                                <span className="text-xl font-bold tracking-tight uppercase" style={{ color: config?.themeColor || "var(--primary)" }}>
                                    {config?.headerText || storeName}
                                </span>
                                {config?.headerSubtext && (
                                    <span className="text-[10px] tracking-[0.15em] font-medium text-muted-foreground uppercase">
                                        {config.headerSubtext}
                                    </span>
                                )}
                            </>
                        )}
                    </Link>

                    {/* Center: Minimal Nav */}
                    <NavMenu config={config} className="hidden md:flex gap-8" inline minimal editorMode={editorMode} onFieldClick={onFieldClick} />

                    {/* Right: Minimal Icons */}
                    <div className="flex items-center gap-1">
                        {showSearch && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setSearchOpen(!searchOpen)}
                            >
                                <Search className="h-4 w-4" style={{ color: config?.menuColor || "var(--foreground)" }} />
                            </Button>
                        )}
                        {showAccount && (
                            <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex" asChild>
                                <Link href="/loja/minha-conta">
                                    <User className="h-4 w-4" style={{ color: config?.menuColor || "var(--foreground)" }} />
                                </Link>
                            </Button>
                        )}
                        {showCart && (
                            <div className="relative">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleCart}>
                                    <ShoppingBag className="h-4 w-4" style={{ color: config?.menuColor || "var(--foreground)" }} />
                                    {items.length > 0 && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                                            style={{ backgroundColor: config?.cartCountBg || config?.themeColor, color: config?.cartCountText || "white" }}
                                        >
                                            {items.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expandable Search */}
                {showSearch && searchOpen && (
                    <div className="pb-3">
                        <div
                            className="relative rounded-full overflow-hidden shadow-sm border-2"
                            style={{ borderColor: config?.searchBtnBg || config?.themeColor || "var(--primary)" }}
                        >
                            <Input
                                type="search"
                                placeholder={config?.headerSearchPlaceholder || "Buscar..."}
                                className="h-9 text-sm pr-9 border-0 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-9 w-9"
                                onClick={() => setSearchOpen(false)}
                                style={{ color: config?.searchBtnBg || config?.themeColor || "var(--primary)" }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

// =============================================================================
// OPTICA HEADER - Text logo with slash, centered nav, minimal icons (like NOVA/YORK)
// =============================================================================
function OpticaHeader({ config, categories, editorMode, isPreview, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, isPreview?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const { scrolled, headerRef } = useScrolled();
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    // Only use transparent mode on home page (where hero exists) or in editor preview
    const isHomePage = pathname === "/" || pathname.startsWith("/preview/") || isPreview;
    const useTransparent = isHomePage && !scrolled;

    const storeName = config?.storeName || "Loja";
    const logoUrl = config?.logoUrl;

    const showSearch = config?.showHeaderSearch !== false && config?.showHeaderSearch !== "false";
    const showCart = config?.showHeaderCart !== false && config?.showHeaderCart !== "false";
    const showAccount = config?.showHeaderAccount !== false && config?.showHeaderAccount !== "false";

    const handleFieldClick = (field: string) => (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick(field);
        }
    };

    const editorClass = editorMode ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded transition-all" : "";

    return (
        <header
            ref={headerRef}
            data-section="header"
            data-style="optica"
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
                !useTransparent ? "shadow-md backdrop-blur-md" : ""
            )}
            style={{
                backgroundColor: useTransparent
                    ? "transparent"
                    : (config?.headerColor || "var(--background)")
            }}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    <MobileMenu config={config} storeName={storeName} />

                    {/* Left: Text Logo */}
                    <div className="shrink-0">
                        <Link href={editorMode ? "#" : "/loja"} className="flex items-baseline" onClick={editorMode ? handleFieldClick("headerText") : undefined}>
                            {(config?.headerShowLogo !== false && logoUrl) ? (
                                <img
                                    src={logoUrl}
                                    alt={storeName}
                                    className={cn("object-contain transition-all duration-300", editorClass)}
                                    style={{ width: `${Math.min(120, Math.max(30, config?.headerLogoWidth || 55))}px`, height: 'auto' }}
                                    data-field="headerLogoWidth"
                                />
                            ) : (
                                <span
                                    className={cn("text-xl md:text-2xl tracking-tight leading-none transition-colors duration-500", editorClass)}
                                    style={{ color: useTransparent ? "#ffffff" : (config?.menuColor || "var(--foreground)") }}
                                    data-field="headerText"
                                >
                                    <span className="font-bold">{(config?.headerText || storeName).split("/")[0]}</span>
                                    {(config?.headerText || storeName).includes("/") && (
                                        <span className="font-light">/{(config?.headerText || storeName).split("/").slice(1).join("/")}</span>
                                    )}
                                    {!(config?.headerText || storeName).includes("/") && !logoUrl && (
                                        <span className="font-light"> {config?.headerSubtext || ""}</span>
                                    )}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <NavMenu config={config} className="hidden md:flex justify-center gap-6 lg:gap-8" inline editorMode={editorMode} onFieldClick={onFieldClick} style={{ color: useTransparent ? "#ffffff" : undefined }} />

                    {/* Right: Minimal Icons */}
                    <div className="flex items-center gap-3">
                        {showSearch && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full hover:bg-white/10"
                                onClick={() => setSearchOpen(!searchOpen)}
                            >
                                <Search className="h-6 w-6 transition-colors duration-500" style={{ color: useTransparent ? "#ffffff" : (config?.menuColor || "var(--foreground)") }} />
                            </Button>
                        )}
                        {showAccount && (
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10 hidden md:flex" asChild>
                                <Link href="/loja/minha-conta">
                                    <User className="h-6 w-6 transition-colors duration-500" style={{ color: useTransparent ? "#ffffff" : (config?.menuColor || "var(--foreground)") }} />
                                </Link>
                            </Button>
                        )}
                        {showCart && (
                            <div className="relative">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10" onClick={editorMode ? undefined : toggleCart}>
                                    <ShoppingBag className="h-6 w-6 transition-colors duration-500" style={{ color: useTransparent ? "#ffffff" : (config?.menuColor || "var(--foreground)") }} />
                                    {items.length > 0 && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                                            style={{ backgroundColor: config?.cartCountBg || config?.themeColor || "#000", color: config?.cartCountText || "white" }}
                                        >
                                            {items.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expandable Search */}
                {showSearch && searchOpen && (
                    <div className="pb-4">
                        <div
                            className="relative rounded-full overflow-hidden shadow-sm border"
                            style={{ borderColor: config?.themeColor || "#000" }}
                        >
                            <Input
                                type="search"
                                placeholder={config?.headerSearchPlaceholder || "O que você está buscando?"}
                                className="h-11 text-sm pr-10 border-0 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-0 pl-5"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-11 w-11"
                                onClick={() => setSearchOpen(false)}
                                style={{ color: config?.themeColor || "#000" }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function NavMenu({ config, className, inline, minimal, editorMode, onFieldClick, style }: { config: any; className?: string; inline?: boolean; minimal?: boolean; editorMode?: boolean; onFieldClick?: (field: string) => void; style?: React.CSSProperties }) {
    const menuItems = config?.menus?.find((m: any) => m.handle === 'main')?.items || [];

    const linkClass = cn(
        "transition-colors duration-500 outline-none focus-visible:outline-none",
        minimal ? "text-sm font-medium" : "text-sm font-semibold tracking-wider uppercase",
        editorMode && "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 rounded px-2 py-1"
    );

    const handleMenuClick = (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick("menuLinks");
        }
    };

    const linkColor = style?.color || config?.menuLinkColor || config?.menuColor || "var(--foreground)";
    const hoverColor = config?.menuLinkHoverColor || config?.themeColor || "var(--primary)";

    const content = menuItems.length > 0 ? (
        menuItems
            .sort((a: any, b: any) => a.order - b.order)
            .map((item: any) => (
                <Link
                    key={item.id}
                    href={editorMode ? "#" : normalizeUrl(item.url)}
                    className={linkClass}
                    style={{ color: linkColor, ["--menu-hover" as any]: hoverColor }}
                    onClick={handleMenuClick}
                    data-field="menuLinks"
                    onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
                >
                    {item.label}
                </Link>
            ))
    ) : (
        <>
            <Link href={editorMode ? "#" : "/loja"} className={linkClass} style={{ color: linkColor }} onClick={handleMenuClick} data-field="menuLinks" onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}>INÍCIO</Link>
            <Link href={editorMode ? "#" : "/produtos"} className={linkClass} style={{ color: linkColor }} onClick={handleMenuClick} data-field="menuLinks" onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}>PRODUTOS</Link>
            <Link href={editorMode ? "#" : "/contato"} className={linkClass} style={{ color: linkColor }} onClick={handleMenuClick} data-field="menuLinks" onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)} onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}>CONTATO</Link>
        </>
    );

    if (inline) {
        return <nav className={className}>{content}</nav>;
    }

    return (
        <div className={className}>
            <nav className="flex items-center justify-center gap-10">
                {content}
            </nav>
        </div>
    );
}

// =============================================================================
// RESTAURANT HEADER - Food delivery style with status, time, and floating cart
// =============================================================================
function RestaurantHeader({ config, categories, editorMode, isPreview, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, isPreview?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const { scrolled, headerRef } = useScrolled();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const storeName = config?.storeName || "Restaurante";
    const logoUrl = config?.logoUrl;
    const themeColor = config?.themeColor || config?.headerColor || "#ef4444";
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Simulated delivery info - could come from config
    const deliveryTime = config?.deliveryTime || "30-45 min";
    const isOpen = config?.isOpen !== false;

    const handleFieldClick = (field: string) => (e: React.MouseEvent) => {
        if (editorMode && onFieldClick) {
            e.preventDefault();
            e.stopPropagation();
            onFieldClick(field);
        }
    };

    return (
        <header
            ref={headerRef}
            data-section="header"
            data-style="restaurant"
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled ? "shadow-lg" : ""
            )}
            style={{ backgroundColor: themeColor }}
        >
            {/* Main Header Row */}
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <RestaurantMobileMenu config={config} storeName={storeName} categories={categories} />
                    </div>

                    {/* Logo + Store Info */}
                    <Link href={editorMode ? "#" : "/loja"} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-none" onClick={editorMode ? handleFieldClick("headerText") : undefined}>
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-white/20 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm sm:text-lg">🍔</span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <span className="font-bold text-white text-sm sm:text-base block truncate">
                                {config?.headerText || storeName}
                            </span>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/80">
                                <span className={cn(
                                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0",
                                    isOpen ? "bg-green-400" : "bg-red-400"
                                )} />
                                <span className="truncate">{isOpen ? "Aberto" : "Fechado"}</span>
                                <span className="hidden xs:inline">•</span>
                                <span className="hidden xs:inline">{deliveryTime}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Input
                                type="search"
                                placeholder="Buscar no cardápio..."
                                className="h-10 w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-10 pr-4 focus:bg-white/20"
                                readOnly={editorMode}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {/* Mobile Search */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/20"
                        >
                            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </Button>

                        {/* Cart Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white hover:bg-white/90"
                            onClick={editorMode ? undefined : toggleCart}
                            style={{ color: themeColor }}
                        >
                            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-green-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            {categories && categories.length > 0 && (
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-2 sm:px-4">
                        <div className="flex gap-1.5 sm:gap-2 py-2 overflow-x-auto scrollbar-hide">
                            {categories.slice(0, 8).map((cat, i) => (
                                <Link
                                    key={cat.id || i}
                                    href={editorMode ? "#" : `/produtos?category=${cat.slug || cat.id}`}
                                    className={cn(
                                        "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                                        activeCategory === cat.id
                                            ? "bg-white text-current"
                                            : "bg-white/15 text-white hover:bg-white/25"
                                    )}
                                    style={activeCategory === cat.id ? { color: themeColor } : undefined}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

// Restaurant Mobile Menu
function RestaurantMobileMenu({ config, storeName, categories }: { config: any; storeName: string; categories?: any[] }) {
    const themeColor = config?.themeColor || config?.headerColor || "#ef4444";

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/20">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <div className="p-4 sm:p-5" style={{ backgroundColor: themeColor }}>
                    <span className="text-base sm:text-lg font-bold text-white">
                        {storeName}
                    </span>
                    <p className="text-xs sm:text-sm text-white/70 mt-1">Faça seu pedido</p>
                </div>

                {/* Search */}
                <div className="p-3 sm:p-4 border-b">
                    <div className="relative">
                        <Input placeholder="Buscar no cardápio..." className="pl-9 h-9 sm:h-10 text-sm" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Categories */}
                {categories && categories.length > 0 && (
                    <div className="p-3 sm:p-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 sm:mb-3">Categorias</h3>
                        <nav className="flex flex-col space-y-1">
                            {categories.map((cat, i) => (
                                <SheetClose key={cat.id || i} asChild>
                                    <Link
                                        href={`/produtos?category=${cat.slug || cat.id}`}
                                        className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-sm sm:text-base font-medium hover:bg-muted transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                </SheetClose>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Quick Links */}
                <div className="p-3 sm:p-4 border-t mt-auto">
                    <nav className="flex flex-col space-y-1">
                        <SheetClose asChild>
                            <Link href="/cardapio" className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-lg text-sm font-medium hover:bg-muted">
                                Ver Cardápio Completo
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/loja/minha-conta" className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted">
                                <User className="h-4 w-4" />
                                Minha Conta
                            </Link>
                        </SheetClose>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function MobileMenu({ config, storeName }: { config: any; storeName: string }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                    <Menu className="h-5 w-5" style={{ color: config?.menuColor || "var(--foreground)" }} />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <div className="p-5 border-b">
                    <span className="text-lg font-bold uppercase" style={{ color: config?.themeColor || "var(--primary)" }}>
                        {storeName}
                    </span>
                </div>
                <div className="p-4 space-y-5">
                    <div className="relative">
                        <Input placeholder="Buscar..." className="pl-9 h-10 text-sm" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>

                    <nav className="flex flex-col space-y-3">
                        {config?.menus?.find((m: any) => m.handle === 'main')?.items?.length > 0 ? (
                            config.menus.find((m: any) => m.handle === 'main').items
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((item: any) => (
                                    <SheetClose key={item.id} asChild>
                                        <Link
                                            href={normalizeUrl(item.url)}
                                            className="text-base font-medium"
                                            style={{ color: config?.menuColor || "var(--foreground)" }}
                                        >
                                            {item.label}
                                        </Link>
                                    </SheetClose>
                                ))
                        ) : (
                            <>
                                <SheetClose asChild><Link href="/" className="text-base font-medium">Início</Link></SheetClose>
                                <SheetClose asChild><Link href="/produtos" className="text-base font-medium">Produtos</Link></SheetClose>
                                <SheetClose asChild><Link href="/contato" className="text-base font-medium">Contato</Link></SheetClose>
                            </>
                        )}
                    </nav>

                    <div className="pt-4 border-t">
                        <SheetClose asChild>
                            <Link href="/loja/minha-conta" className="flex items-center gap-3 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                Minha Conta
                            </Link>
                        </SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
