"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header({ config }: { config?: any }) {
    const { toggleCart, items } = useCart();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Default config if not provided or missing values
    const storeName = config?.storeName || "GUT";
    const logoUrl = config?.logoUrl;

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "shadow-md py-0 border-b border-primary/10 bg-background/95 backdrop-blur-md"
                    : "shadow-none py-2 border-transparent bg-transparent"
            )}
            style={{
                backgroundColor: (config?.headerColor || "var(--header-bg, var(--background))"),
                // Ensure text colors update too if passed
                "--color-menu": config?.menuColor || "var(--color-menu)"
            } as React.CSSProperties}
        >
            <div className="container mx-auto">
                <div className="flex h-32 items-center gap-4 px-4 md:gap-8">

                    {/* Mobile Menu Trigger */}
                    <MobileMenu config={config} storeName={storeName} />

                    {/* Left: Logo/Brand */}
                    <div className="shrink-0">
                        <Link href="/" className="flex flex-col items-start gap-1">
                            {logoUrl ? (
                                <img src={logoUrl} alt={storeName} className="h-20 object-contain" />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl md:text-5xl font-black tracking-tighter text-primary uppercase">{storeName}</span>
                                    </div>
                                    <span className="text-xs tracking-[0.4em] font-bold text-muted-foreground uppercase">Cosméticos • Makes</span>
                                </>
                            )}
                        </Link>
                    </div>


                    {/* Center: Search Bar (Grows to fill space) */}
                    <div className="hidden flex-1 md:block max-w-3xl mx-auto">
                        <div className="relative flex shadow-sm rounded-full border border-border bg-muted/30 hover:bg-background transition-colors">
                            <Input
                                type="search"
                                placeholder="O que você está buscando?"
                                className="h-14 w-full rounded-l-full border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base pl-8"
                            />
                            <Button
                                variant="ghost"
                                className="h-14 w-16 rounded-r-full hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: "var(--btn-header-bg, var(--primary))",
                                    color: "var(--btn-header-text, var(--primary-foreground))"
                                }}
                            >
                                <Search className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex shrink-0 items-center justify-end gap-3 md:gap-4">
                        <Button variant="ghost" className="rounded-full h-14 w-14 p-0 hover:bg-black/5" title="Minha Conta">
                            <User className="h-10! w-10! stroke-[1.5]" style={{ color: config?.menuColor || "var(--color-menu)" }} />
                        </Button>

                        <div className="relative">
                            <Button variant="ghost" className="rounded-full h-14 w-14 p-0 hover:bg-black/5" onClick={toggleCart} title="Carrinho">
                                <ShoppingBag className="h-10! w-10! stroke-[1.5]" style={{ color: config?.menuColor || "var(--color-menu)" }} />
                                {items.length > 0 && (
                                    <span
                                        className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white"
                                        style={{ backgroundColor: config?.cartCountBg || "var(--primary)", color: config?.cartCountText || "white" }}
                                    >
                                        {items.length}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Navbar Links (Sub-header) */}
                <div className="px-4 pb-0 pt-2 hidden md:block">
                    <nav className="flex items-center justify-center gap-12 text-sm font-bold tracking-wider uppercase font-menu">
                        {config?.menus?.find((m: any) => m.handle === 'main')?.items?.length > 0 ? (
                            config.menus.find((m: any) => m.handle === 'main').items
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((item: any) => (
                                    <Link key={item.id} href={item.url || "#"} className="hover:text-primary transition-colors">
                                        {item.label}
                                    </Link>
                                ))
                        ) : (
                            /* Fallback Defaults if no menu configured */
                            <>
                                <Link href="/" className="hover:text-primary transition-colors">INÍCIO</Link>
                                <Link href="/produtos" className="hover:text-primary transition-colors">PRODUTOS</Link>
                                <Link href="/contato" className="hover:text-primary transition-colors">CONTATO</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ config, storeName }: { config: any, storeName: string }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" style={{ color: config?.menuColor || "var(--color-menu)" }} />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
                <div className="p-6 border-b">
                    <span className="text-xl font-black uppercase text-primary">{storeName}</span>
                </div>
                <div className="p-4 space-y-6">
                    {/* Search in Menu for Mobile */}
                    <div className="relative">
                        <Input
                            placeholder="Buscar produtos..."
                            className="pl-9 bg-slate-50"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>

                    <nav className="flex flex-col space-y-4">
                        {config?.menus?.find((m: any) => m.handle === 'main')?.items?.length > 0 ? (
                            config.menus.find((m: any) => m.handle === 'main').items
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((item: any) => (
                                    <Link
                                        key={item.id}
                                        href={item.url || "#"}
                                        className="text-lg font-medium text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))
                        ) : (
                            <>
                                <Link href="/" className="text-lg font-medium text-slate-600 hover:text-primary">INÍCIO</Link>
                                <Link href="/produtos" className="text-lg font-medium text-slate-600 hover:text-primary">PRODUTOS</Link>
                                <Link href="/contato" className="text-lg font-medium text-slate-600 hover:text-primary">CONTATO</Link>
                            </>
                        )}
                    </nav>

                    <div className="pt-6 border-t space-y-3">
                        <Link href="/conta" className="flex items-center gap-3 text-slate-600">
                            <User className="h-5 w-5" />
                            Minha Conta
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
