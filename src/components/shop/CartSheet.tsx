"use client";

import Link from "next/link";
import { ShoppingBasket, X, Plus, Minus } from "lucide-react"; // Using ShoppingBasket as it looks closer to 'minha cesta' icon
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store/cart";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
    const { items, removeItem, addItem, decreaseItem, isOpen, toggleCart, getCartTotal } = useCart();

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            <SheetContent showCloseButton={false} className="flex w-full flex-col sm:max-w-md p-0 gap-0 border-l-0">
                {/* Custom Header */}
                <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBasket className="h-6 w-6" />
                        <h2 className="text-lg font-bold lowercase">minha cesta</h2>
                    </div>
                    <SheetClose className="text-primary-foreground hover:bg-white/20 rounded-full p-1 transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </SheetClose>
                </div>

                {/* hidden default header to satisfy accessibility if needed, or just omit since we have custom */}
                <SheetHeader className="sr-only">
                    <SheetTitle>Carrinho de Compras</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
                            <ShoppingBasket className="h-16 w-16 opacity-20" />
                            <p>Sua cesta está vazia.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative flex gap-4">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-destructive transition-colors z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    {/* Left Column: Image (Occupies full height/left region) */}
                                    <div className="h-24 w-24 shrink-0 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center text-slate-300 w-full h-full">
                                                <span className="font-bold text-xl">{item.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Details */}
                                    <div className="flex-1 flex flex-col justify-between min-h-[6rem]">
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight pr-6 line-clamp-3">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white px-1">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                                                <button
                                                    onClick={() => addItem(item)}
                                                    className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="font-bold text-slate-900 text-sm">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 border-t space-y-4 shrink-0">
                    {items.length > 0 && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg text-slate-900">total</span>
                                    <span className="font-bold text-xl text-slate-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getCartTotal())}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <SheetClose asChild>
                                    <Link href="/loja/carrinho" className="block w-full">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base rounded-lg">
                                            continuar
                                        </Button>
                                    </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 font-bold h-12 text-base rounded-lg">
                                        continuar comprando
                                    </Button>
                                </SheetClose>
                            </div>
                        </div>
                    )}
                </div>

            </SheetContent>
        </Sheet>
    );
}
