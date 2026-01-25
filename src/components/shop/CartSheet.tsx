"use client";

import { ShoppingCart, Trash, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store/cart";
import { Separator } from "@/components/ui/separator";
import { useState } from "react"; // Correct import
import { createOrder } from "@/lib/actions/order";

export function CartSheet() {
    const { items, removeItem, clearCart, isOpen, toggleCart, getCartTotal } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const handleCheckout = async () => {
        if (!customerName || !customerPhone) {
            alert("Por favor, preencha seu nome e telefone/WhatsApp para continuar.");
            return;
        }

        setIsCheckingOut(true);

        try {
            // 1. Create Order in Backend with Customer Data
            const total = getCartTotal();
            const result = await createOrder(items, total, { name: customerName, phone: customerPhone });

            if (!result.success) {
                alert("Erro ao criar pedido. Tente novamente.");
                setIsCheckingOut(false);
                return;
            }

            // 2. Prepare WhatsApp Message
            const phoneNumber = "5511999999999"; // TODO: Use settings
            const orderId = result.orderId;
            const orderText = items.map(i => `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
            const message = `*Novo Pedido #${orderId}*\n👤 Cliente: ${customerName}\n📞 Contato: ${customerPhone}\n\n${orderText}\n\n*Total: R$ ${total.toFixed(2)}*`;

            // 3. Clear Cart and Redirect
            clearCart();
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
            toggleCart();

        } catch (error) {
            console.error("Checkout error", error);
            alert("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
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
                            {/* Customer Inputs */}
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-bold text-sm text-slate-700">Seus Dados</h4>
                                <input
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Seu Nome"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <input
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="WhatsApp (com DDD)"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                />
                            </div>

                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center text-muted-foreground/30 font-bold">
                                        {/* Placeholder for no image */}
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
                        <Button
                            className="w-full gap-2 font-bold uppercase tracking-wider"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                                </>
                            ) : (
                                <>
                                    Finalizar Compra <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

            </SheetContent>
        </Sheet>
    );
}
