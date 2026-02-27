import { formatCurrency } from "@/lib/utils";
import { Trash2, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Seller {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
}

interface PosCartProps {
    items: CartItem[];
    onRemoveItem: (index: number) => void;
    onUpdateQuantity: (index: number, delta: number) => void;
    onCheckout: () => void;
    onClearCart: () => void;
    selectedSeller?: Seller | null;
    customerName?: string;
}

export function PosCart({ items, onRemoveItem, onUpdateQuantity, onCheckout, onClearCart, selectedSeller, customerName }: PosCartProps) {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-[360px] shadow-2xl">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <ShoppingCart className="w-5 h-5" />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Carrinho</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearCart}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2 text-xs"
                        disabled={items.length === 0}
                    >
                        Limpar
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                        <p className="text-base">Carrinho vazio</p>
                        <p className="text-xs text-center max-w-[180px] opacity-60">
                            Digite o código do produto ou escaneie o código de barras
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50 group">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 overflow-hidden">
                                            <button
                                                onClick={() => onUpdateQuantity(index, -1)}
                                                className="px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-mono font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(index, 1)}
                                                className="px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 space-y-2 shrink-0">
                {/* Customer & Seller Info */}
                {(customerName || selectedSeller) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {customerName && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
                                <User className="w-3 h-3 text-green-600" />
                                <span className="font-medium text-green-700 dark:text-green-300">{customerName}</span>
                            </div>
                        )}
                        {selectedSeller && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                <User className="w-3 h-3 text-blue-600" />
                                <span className="font-medium text-blue-700 dark:text-blue-300">{selectedSeller.name}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>Desconto</span>
                        <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Total</span>
                        <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-12 shadow-lg shadow-blue-500/20"
                    disabled={items.length === 0}
                    onClick={onCheckout}
                >
                    Finalizar Venda (F9)
                </Button>
            </div>
        </div>
    );
}
