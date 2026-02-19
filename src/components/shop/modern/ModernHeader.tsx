"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function ModernHeader({ config, categories }: { config?: any, categories?: any[] }) {
    const pathname = usePathname();
    const { toggleCart, items } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const storeName = config?.storeName || "Loja";
    const logoUrl = config?.logoUrl;

    // Modern Header indicates transparency at top, solid when scrolled
    // Text colors might need to invert if on top of dark hero image
    // For V2, let's assume valid contrast or smart detection?
    // Safer to stick to black text on white header, or white text on transparent header (if hero is dark).
    // Let's go with: Transparent (White Text) -> Scrolled (White BG, Black Text)
    // This requires the standard Hero to be dark/image-heavy.

    const isHomePage = pathname === "/";
    const isTransparent = isHomePage && !scrolled && !searchOpen;

    return (
        <header
            data-section="header"
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                !isTransparent
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b py-2"
                    : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Left: Mobile Menu & Search Trigger */}
                    <div className="flex items-center gap-2 flex-1">
                        <MobileMenu config={config} storeName={storeName} categories={categories} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("hidden md:flex", isTransparent ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5")}
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            {searchOpen ? <X /> : <Search />}
                        </Button>
                    </div>

                    {/* Center: Logo */}
                    <Link href="/" className="flex-1 flex justify-center text-center">
                        {(config?.headerShowLogo !== false && logoUrl) ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="h-10 md:h-12 w-auto object-contain transition-all"
                            />
                        ) : (
                            <span className={cn(
                                "text-2xl md:text-3xl font-black tracking-tighter uppercase transition-colors",
                                isTransparent ? "text-white" : "text-black"
                            )}>
                                {config?.headerText || storeName}
                            </span>
                        )}
                    </Link>

                    {/* Right: Cart & User */}
                    <div className="flex items-center justify-end gap-2 flex-1">
                        <Button variant="ghost" size="icon" asChild className={cn("hidden md:flex", isTransparent ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5")}>
                            <Link href="/minha-conta">
                                <User className="w-5 h-5" />
                            </Link>
                        </Button>

                        <div className="relative">
                            <Button variant="ghost" size="icon" asChild className={cn(isTransparent ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5")}>
                                <Link href="/carrinho">
                                    <ShoppingBag className="w-5 h-5" />
                                    {items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sub-Header Navigation (Desktop Only) - Only visible when NOT searching */}
                {!searchOpen && (
                    <div className={cn(
                        "hidden md:flex justify-center transition-all duration-300 overflow-hidden",
                        "h-10 opacity-100"
                    )}>
                        <nav className={cn(
                            "flex items-center gap-8 text-sm font-bold tracking-widest uppercase",
                            isTransparent ? "text-white/90" : "text-black/80"
                        )}>
                            {config?.menus?.find((m: any) => m.handle === 'main')?.items?.length > 0 ? (
                                config.menus.find((m: any) => m.handle === 'main').items
                                    .sort((a: any, b: any) => a.order - b.order)
                                    .map((item: any) => (
                                        <Link key={item.id} href={normalizeUrl(item.url)} className="hover:underline underline-offset-4 decoration-2">
                                            {item.label}
                                        </Link>
                                    ))
                            ) : (
                                <>
                                    <Link href="/" className="hover:underline underline-offset-4 decoration-2">Início</Link>
                                    {categories?.slice(0, 5).map((cat) => (
                                        <Link key={cat.id} href={`/produtos?category=${cat.id}`} className="hover:underline underline-offset-4 decoration-2 uppercase">
                                            {cat.name}
                                        </Link>
                                    ))}
                                    <Link href="/contato" className="hover:underline underline-offset-4 decoration-2">Contato</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}

                {/* Full Width Search Overlay */}
                {searchOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 absolute inset-x-0 top-full bg-white border-t p-4 shadow-lg">
                        <div className="container mx-auto max-w-3xl relative">
                            <Input
                                autoFocus
                                placeholder="Busque por produtos, marcas, categorias..."
                                className="h-12 pl-12 text-lg border-none bg-slate-50 focus-visible:ring-0"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

function MobileMenu({ config, storeName, categories }: { config: any, storeName: string, categories?: any[] }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-inherit">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                <div className="flex flex-col h-full bg-white">
                    <div className="p-6 border-b flex items-center justify-between">
                        <span className="text-xl font-black uppercase tracking-tighter">{storeName}</span>
                        {/* Close button is auto-added by SheetContent usually, but we can add custom if needed */}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Search in Menu */}
                        <div className="relative">
                            <Input placeholder="O que você procura?" className="pl-10 h-11 bg-slate-50 border-transparent rounded-lg" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        <nav className="flex flex-col space-y-4">
                            {config?.menus?.find((m: any) => m.handle === 'main')?.items?.length > 0 ? (
                                config.menus.find((m: any) => m.handle === 'main').items
                                    .sort((a: any, b: any) => a.order - b.order)
                                    .map((item: any) => (
                                        <SheetClose key={item.id} asChild>
                                            <Link
                                                href={normalizeUrl(item.url)}
                                                className="text-lg font-bold text-slate-800 hover:text-primary transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))
                            ) : (
                                <>
                                    <SheetClose asChild>
                                        <Link href="/" className="text-lg font-bold text-slate-800 hover:text-primary">Início</Link>
                                    </SheetClose>

                                    <div className="h-px bg-gray-100 my-2" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categorias</span>

                                    {categories?.map((cat) => (
                                        <SheetClose key={cat.id} asChild>
                                            <Link href={`/produtos?category=${cat.id}`} className="text-gray-600 hover:text-primary capitalize">
                                                {cat.name.toLowerCase()}
                                            </Link>
                                        </SheetClose>
                                    ))}

                                    <div className="h-px bg-gray-100 my-2" />

                                    <SheetClose asChild>
                                        <Link href="/contato" className="text-gray-600 hover:text-primary">Contato</Link>
                                    </SheetClose>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="p-6 border-t bg-slate-50">
                        <SheetClose asChild>
                            <Link href="/minha-conta">
                                <Button className="w-full rounded-full font-bold">Minha Conta</Button>
                            </Link>
                        </SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
