"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CartConfig {
    minPurchaseValue: number;
    showShippingCalculator: boolean;
}

export function CartPageClient({ config }: { config: CartConfig }) {
    const { items, addItem, decreaseItem, removeItem, getCartTotal } = useCart();
    const [cep, setCep] = useState("");

    const total = getCartTotal();
    const shippingCost = 0;
    const belowMinimum = config.minPurchaseValue > 0 && total < config.minPurchaseValue;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-6">
                    <ShoppingBag className="h-12 w-12 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Seu carrinho está vazio</h1>
                <p className="text-slate-500 mb-8 max-w-md">
                    Parece que você ainda não adicionou nenhum item. Explore nossa loja para encontrar os melhores produtos.
                </p>
                <Link href="/loja/produtos">
                    <Button size="lg" className="gap-2">
                        Começar a Comprar <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-32 pb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Carrinho de Compras</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="hidden md:grid grid-cols-[1fr_110px_130px_130px_90px] gap-4 p-4 border-b bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <div className="">Produto</div>
                            <div className="text-center">Preço</div>
                            <div className="text-center">Qtd</div>
                            <div className="text-center">Total</div>
                            <div className="text-center">Excluir</div>
                        </div>

                        <div className="divide-y">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_110px_130px_130px_90px] gap-4 p-4 items-center group">
                                    {/* Product Info */}
                                    <div className="col-span-1 md:col-span-1 flex gap-4 items-center">
                                        <div className="h-20 w-20 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <ShoppingBag className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Link href={`/loja/produto/${item.slug}`} className="font-medium text-slate-900 hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 md:hidden"
                                            >
                                                <Trash2 className="h-3 w-3" /> Remover
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-1 md:col-span-1 md:text-center text-sm font-medium text-slate-600">
                                        <span className="md:hidden text-slate-400 font-normal mr-2">Preço:</span>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-1 md:col-span-1 flex justify-start md:justify-center items-center">
                                        <span className="md:hidden text-slate-400 font-normal mr-4 text-sm">Qtd:</span>
                                        <div className="flex items-center border rounded-lg bg-white">
                                            <button
                                                onClick={() => decreaseItem(item.id)}
                                                className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => addItem(item)}
                                                className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total Line */}
                                    <div className="col-span-1 md:col-span-1 flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-slate-400 font-normal text-sm">Subtotal:</span>
                                        <span className="font-bold text-slate-900 text-lg">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="hidden md:flex col-span-1 justify-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                            title="Remover item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link href="/loja/produtos" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
                        <ChevronLeftIcon className="h-4 w-4 mr-1" /> Continuar Comprando
                    </Link>
                </div>

                {/* Summary Sidebar */}
                <div className="w-full lg:w-96 shrink-0 space-y-6">
                    {/* Shipping Calculator */}
                    {config.showShippingCalculator && (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-800">Cálculo de Frete</h3>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Seu CEP"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value)}
                                    maxLength={9}
                                />
                                <Button variant="outline">Calcular</Button>
                            </div>
                            <p className="text-xs text-slate-400">Insira seu CEP para ver opções de entrega.</p>
                        </div>
                    )}

                    {/* Order Totals */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-800 border-b pb-3">Resumo do Pedido</h3>

                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>{shippingCost === 0 ? 'A calcular' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost)}</span>
                            </div>
                        </div>

                        {/* Minimum purchase warning */}
                        {belowMinimum && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    Valor mínimo de compra: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(config.minPurchaseValue)}.
                                    Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(config.minPurchaseValue - total)}.
                                </span>
                            </div>
                        )}

                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="font-bold text-lg text-slate-800">Total</span>
                            <span className="font-bold text-xl text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total + shippingCost)}
                            </span>
                        </div>

                        <Link href={belowMinimum ? "#" : "/loja/checkout"} className="block w-full">
                            <Button
                                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
                                size="lg"
                                disabled={belowMinimum}
                            >
                                Finalizar Compra
                            </Button>
                        </Link>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Compra Segura</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronLeftIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    )
}
