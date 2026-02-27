"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface CardapioHeaderProps {
    config?: any;
    categories?: any[];
}

export function CardapioHeader({ config, categories }: CardapioHeaderProps) {
    const { toggleCart, items } = useCart();
    const [showLogin, setShowLogin] = useState(false);

    const themeColor = config?.themeColor || "#18181b";
    const storeName = config?.storeName || config?.headerText || "Cardápio";
    const logoUrl = config?.logoUrl;
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header
            className="sticky top-0 z-50 w-full"
            style={{ backgroundColor: themeColor }}
        >
            {/* Main Header */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-9 w-9 rounded-full bg-white/10 hover:bg-white/20"
                            >
                                <Menu className="h-5 w-5 text-white" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0">
                            <div className="p-5" style={{ backgroundColor: themeColor }}>
                                <span className="text-lg font-bold text-white">{storeName}</span>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Categorias</p>
                                <nav className="space-y-1">
                                    {categories?.map((cat) => (
                                        <SheetClose key={cat.id} asChild>
                                            <a
                                                href={`#category-${cat.id}`}
                                                className="block py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100"
                                            >
                                                {cat.name}
                                            </a>
                                        </SheetClose>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo / Store Name */}
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-lg">🍔</span>
                        )}
                        <span className="font-bold text-white text-sm sm:text-base truncate">
                            {storeName}
                        </span>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:flex flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Login Button */}
                        <Dialog open={showLogin} onOpenChange={setShowLogin}>
                            <DialogTrigger asChild>
                                <button className="h-8 px-3 rounded-full bg-white/15 hover:bg-white/25 flex items-center gap-1.5 transition-colors">
                                    <User className="h-4 w-4 text-white" />
                                    <span className="text-xs text-white font-medium hidden sm:inline">Entrar</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Entrar na sua conta</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">E-mail ou telefone</label>
                                        <Input
                                            type="text"
                                            placeholder="seu@email.com"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Senha</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button
                                        className="w-full text-white"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Entrar
                                    </Button>
                                    <p className="text-center text-sm text-gray-500">
                                        Não tem conta?{" "}
                                        <Link href="/loja/cadastro" className="font-medium" style={{ color: themeColor }}>
                                            Criar conta
                                        </Link>
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Cart Button */}
                        <button
                            onClick={toggleCart}
                            className="relative h-9 w-9 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                        >
                            <ShoppingBag className="h-4 w-4" style={{ color: themeColor }} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

        </header>
    );
}
