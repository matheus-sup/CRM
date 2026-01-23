"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";

export function Header() {
    const { toggleCart, items } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md transition-all">
            <div className="container mx-auto">
                <div className="flex h-24 items-center justify-between gap-8 px-4">

                    {/* Logo */}
                    <Link href="/" className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-black tracking-tighter text-white">GUT</span>
                        </div>
                        <span className="text-[10px] tracking-[0.3em] font-medium text-white/90 uppercase">Cosméticos • Makes</span>
                    </Link>

                    {/* Search Bar (Centered & Wide) */}
                    <div className="hidden max-w-2xl flex-1 md:block">
                        <div className="relative flex">
                            <Input
                                type="search"
                                placeholder="O que você está buscando?"
                                className="h-10 w-full rounded-l-md border-0 bg-white/20 text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:bg-white/30"
                            />
                            <Button className="h-10 rounded-l-none rounded-r-md bg-white/30 hover:bg-white/40 text-white">
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                            <User className="h-6 w-6" />
                        </Button>

                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10 relative" onClick={toggleCart}>
                            <ShoppingCart className="h-6 w-6" />
                            {items.length > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-sm border border-orange-500">
                                    {items.length}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Navbar Links */}
                <div className="px-4 pb-4">
                    <nav className="flex items-center gap-8 text-sm font-bold text-white/90">
                        <Button variant="ghost" className="h-auto p-0 text-white hover:text-white hover:bg-transparent font-bold flex items-center gap-1">
                            CATEGORIAS <span className="text-[10px]">▼</span>
                        </Button>
                        <Link href="/" className="hover:opacity-80 transition-opacity">INÍCIO</Link>
                        <Link href="/produtos" className="hover:opacity-80 transition-opacity">PRODUTOS</Link>
                        <Link href="/contato" className="hover:opacity-80 transition-opacity">CONTATO</Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
