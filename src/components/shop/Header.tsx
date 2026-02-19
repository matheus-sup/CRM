"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

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
    onFieldClick?: (field: string) => void;
}

export function Header({ config, categories, editorMode, onFieldClick }: HeaderProps) {
    const headerStyle = config?.headerStyle || "classic";

    switch (headerStyle) {
        case "centered":
            return <CenteredHeader config={config} categories={categories} editorMode={editorMode} onFieldClick={onFieldClick} />;
        case "minimal":
            return <MinimalHeader config={config} categories={categories} editorMode={editorMode} onFieldClick={onFieldClick} />;
        case "classic":
        default:
            return <ClassicHeader config={config} categories={categories} editorMode={editorMode} onFieldClick={onFieldClick} />;
    }
}

// =============================================================================
// CLASSIC HEADER - Logo left, search center, icons right, menu below
// =============================================================================
function ClassicHeader({ config, categories, editorMode, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                        <Link href={editorMode ? "#" : "/"} className="flex flex-col items-start gap-1" onClick={editorMode ? handleFieldClick("headerText") : undefined}>
                            {(config?.headerShowLogo !== false && logoUrl) ? (
                                <img
                                    src={logoUrl}
                                    alt={storeName}
                                    className={cn("object-contain transition-all duration-300", editorClass)}
                                    style={{ height: 'auto', width: `${config.headerLogoWidth || 120}px`, maxHeight: '70px' }}
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
                            <div className="relative flex shadow-sm rounded-full border border-border bg-muted/30 hover:bg-background transition-colors">
                                <Input
                                    type="search"
                                    placeholder={config?.headerSearchPlaceholder || "O que você está buscando?"}
                                    className="h-12 w-full rounded-l-full border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm pl-6"
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
                                    <Link href="/minha-conta">
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
function CenteredHeader({ config, categories, editorMode, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                                <Link href="/minha-conta" style={{ color: config?.menuColor || "var(--foreground)" }}>
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
                        <div className="max-w-xl mx-auto relative">
                            <Input
                                type="search"
                                placeholder={config?.headerSearchPlaceholder || "O que você está buscando?"}
                                className="h-10 pr-10"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => setSearchOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Center: Logo */}
                <div className="flex justify-center py-4">
                    <Link href="/" className="flex flex-col items-center gap-1">
                        {(config?.headerShowLogo !== false && logoUrl) ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="object-contain"
                                style={{ height: 'auto', width: `${config.headerLogoWidth || 150}px`, maxHeight: '80px' }}
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
function MinimalHeader({ config, categories, editorMode, onFieldClick }: { config?: any, categories?: any[], editorMode?: boolean, onFieldClick?: (field: string) => void }) {
    const { toggleCart, items } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <Link href="/" className="flex flex-col items-start gap-0">
                        {(config?.headerShowLogo !== false && logoUrl) ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="object-contain"
                                style={{ height: '40px', width: 'auto' }}
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
                                <Link href="/minha-conta">
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
                        <div className="relative">
                            <Input
                                type="search"
                                placeholder={config?.headerSearchPlaceholder || "Buscar..."}
                                className="h-9 text-sm pr-9"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-9 w-9"
                                onClick={() => setSearchOpen(false)}
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

function NavMenu({ config, className, inline, minimal, editorMode, onFieldClick }: { config: any; className?: string; inline?: boolean; minimal?: boolean; editorMode?: boolean; onFieldClick?: (field: string) => void }) {
    const menuItems = config?.menus?.find((m: any) => m.handle === 'main')?.items || [];

    const linkClass = cn(
        "transition-colors",
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

    const content = menuItems.length > 0 ? (
        menuItems
            .sort((a: any, b: any) => a.order - b.order)
            .map((item: any) => (
                <Link
                    key={item.id}
                    href={editorMode ? "#" : normalizeUrl(item.url)}
                    className={linkClass}
                    style={{ color: config?.menuLinkColor || config?.menuColor || "var(--foreground)" }}
                    onClick={handleMenuClick}
                    data-field="menuLinks"
                >
                    {item.label}
                </Link>
            ))
    ) : (
        <>
            <Link href={editorMode ? "#" : "/"} className={linkClass} style={{ color: config?.menuLinkColor || config?.menuColor }} onClick={handleMenuClick} data-field="menuLinks">INÍCIO</Link>
            <Link href={editorMode ? "#" : "/produtos"} className={linkClass} style={{ color: config?.menuLinkColor || config?.menuColor }} onClick={handleMenuClick} data-field="menuLinks">PRODUTOS</Link>
            <Link href={editorMode ? "#" : "/contato"} className={linkClass} style={{ color: config?.menuLinkColor || config?.menuColor }} onClick={handleMenuClick} data-field="menuLinks">CONTATO</Link>
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
                            <Link href="/minha-conta" className="flex items-center gap-3 text-sm text-muted-foreground">
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
