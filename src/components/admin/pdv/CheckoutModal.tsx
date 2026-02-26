"use client";

import { useState, useEffect, useTransition } from "react";
import { X, CreditCard, Banknote, Smartphone, QrCode, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { createPdvOrder } from "@/lib/actions/pdv";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface Seller {
    id: string;
    name: string;
}

type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    seller: Seller;
    onSuccess: () => void;
    customerName?: string;
    customerCpf?: string;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: "PIX", label: "PIX", icon: <QrCode className="w-6 h-6" /> },
    { value: "CREDIT_CARD", label: "Crédito", icon: <CreditCard className="w-6 h-6" /> },
    { value: "DEBIT_CARD", label: "Débito", icon: <Smartphone className="w-6 h-6" /> },
    { value: "CASH", label: "Dinheiro", icon: <Banknote className="w-6 h-6" /> },
];

export function CheckoutModal({ isOpen, onClose, items, seller, onSuccess, customerName: initialCustomerName, customerCpf: initialCustomerCpf }: CheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
    const [discount, setDiscount] = useState<string>("0");
    const [amountReceived, setAmountReceived] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>(initialCustomerName || "");
    const [isPending, startTransition] = useTransition();
    const [orderResult, setOrderResult] = useState<{
        code: number;
        total: number;
        change: number;
        sellerName: string;
    } | null>(null);
    const { toast } = useToast();

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountValue = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal - discountValue);
    const amountReceivedValue = parseFloat(amountReceived) || 0;
    const change = paymentMethod === "CASH" ? Math.max(0, amountReceivedValue - total) : 0;

    useEffect(() => {
        if (isOpen) {
            setPaymentMethod("PIX");
            setDiscount("0");
            setAmountReceived("");
            setCustomerName(initialCustomerName || "");
            setOrderResult(null);
        }
    }, [isOpen, initialCustomerName]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "Escape") {
                if (orderResult) {
                    onSuccess();
                } else {
                    onClose();
                }
            }

            if (e.key === "Enter" && !isPending && !orderResult) {
                if (paymentMethod !== "CASH" || amountReceivedValue >= total) {
                    handleCheckout();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, orderResult, isPending, paymentMethod, amountReceivedValue, total]);

    const handleCheckout = () => {
        if (paymentMethod === "CASH" && amountReceivedValue < total) {
            toast({
                title: "Valor insuficiente",
                description: "O valor recebido deve ser maior ou igual ao total.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const result = await createPdvOrder({
                items,
                sellerId: seller.id,
                paymentMethod,
                discount: discountValue,
                customerName: customerName || undefined,
                customerCpf: initialCustomerCpf || undefined,
                amountReceived: paymentMethod === "CASH" ? amountReceivedValue : undefined,
            });

            if (result.success && result.order) {
                setOrderResult({
                    code: result.order.code,
                    total: result.order.total,
                    change: result.order.change,
                    sellerName: result.order.sellerName || seller.name,
                });
            } else {
                toast({
                    title: "Erro",
                    description: result.error || "Erro ao finalizar venda.",
                    variant: "destructive",
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={orderResult ? onSuccess : onClose} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {orderResult ? (
                    // Success Screen
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                            Venda Finalizada!
                        </h2>
                        <p className="text-zinc-500 mb-6">Pedido #{orderResult.code}</p>

                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6 mb-6 space-y-3">
                            <div className="flex justify-between text-lg">
                                <span className="text-zinc-500">Total</span>
                                <span className="font-bold text-zinc-900 dark:text-white">
                                    {formatCurrency(orderResult.total)}
                                </span>
                            </div>
                            {orderResult.change > 0 && (
                                <div className="flex justify-between text-lg border-t border-zinc-200 dark:border-zinc-700 pt-3">
                                    <span className="text-zinc-500">Troco</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(orderResult.change)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm border-t border-zinc-200 dark:border-zinc-700 pt-3">
                                <span className="text-zinc-500">Vendedor</span>
                                <span className="text-zinc-700 dark:text-zinc-300">{orderResult.sellerName}</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold h-14"
                            onClick={onSuccess}
                        >
                            Nova Venda (ESC)
                        </Button>
                    </div>
                ) : (
                    // Checkout Form
                    <>
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Finalizar Venda
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Payment Method Selection */}
                            <div>
                                <Label className="text-sm font-medium mb-3 block">Forma de Pagamento</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.value}
                                            onClick={() => setPaymentMethod(method.value)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                paymentMethod === method.value
                                                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600"
                                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                                            }`}
                                        >
                                            {method.icon}
                                            <span className="text-xs font-medium mt-2">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Info (if provided) */}
                            {(customerName || initialCustomerCpf) && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <span className="font-medium">Cliente:</span> {customerName || "Não informado"}
                                        {initialCustomerCpf && <span className="ml-2">• CPF: {initialCustomerCpf}</span>}
                                    </p>
                                </div>
                            )}

                            {/* Discount */}
                            <div>
                                <Label htmlFor="discount" className="text-sm font-medium">
                                    Desconto (R$)
                                </Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            {/* Amount Received (Cash only) */}
                            {paymentMethod === "CASH" && (
                                <div>
                                    <Label htmlFor="amountReceived" className="text-sm font-medium">
                                        Valor Recebido (R$)
                                    </Label>
                                    <Input
                                        id="amountReceived"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        placeholder={total.toFixed(2)}
                                        className="mt-2 text-lg font-mono"
                                        autoFocus
                                    />
                                    {amountReceivedValue > 0 && amountReceivedValue >= total && (
                                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="flex justify-between">
                                                <span className="text-green-700 dark:text-green-300">Troco:</span>
                                                <span className="font-bold text-green-700 dark:text-green-300">
                                                    {formatCurrency(change)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Totals */}
                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {discountValue > 0 && (
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>Desconto</span>
                                        <span>-{formatCurrency(discountValue)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                    <span>Total</span>
                                    <span className="text-pink-600">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <Button
                                size="lg"
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold h-14"
                                onClick={handleCheckout}
                                disabled={isPending || (paymentMethod === "CASH" && amountReceivedValue < total)}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    `Confirmar Venda (Enter)`
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
