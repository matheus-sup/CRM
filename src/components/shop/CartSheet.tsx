"use client";

import { ShoppingCart, Trash, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store/cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
    const { items, removeItem, clearCart, isOpen, toggleCart, getCartTotal } = useCart();

    const handleCheckout = () => {
        // WhatsApp Checkout MVP
        const phoneNumber = "5511999999999";
        const orderText = items.map(i => `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
        const total = getCartTotal().toFixed(2);
        const message = `*Novo Pedido:*\n\n${orderText}\n\n*Total: R$ ${total}*`;

        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            {/* Trigger only invisible, controlled by store globally or manual buttons */}
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Seu Carrinho ({items.length})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
                            <ShoppingCart className="h-16 w-16 opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center text-muted-foreground/30 font-bold">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                                            <p className="text-sm font-bold text-primary mt-1">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-4 pt-6">
                        <Separator />
                        <div className="flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getCartTotal())}</span>
                        </div>
                        <Button className="w-full gap-2 font-bold uppercase tracking-wider" size="lg" onClick={handleCheckout}>
                            Finalizar Compra <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

            </SheetContent>
        </Sheet>
    );
}
