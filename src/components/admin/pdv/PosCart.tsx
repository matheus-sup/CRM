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
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-[400px] shadow-2xl">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                        <ShoppingCart className="w-6 h-6" />
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Carrinho</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearCart}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={items.length === 0}
                    >
                        Limpar
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-4 mt-20">
                        <ShoppingCart className="w-16 h-16 opacity-20" />
                        <p className="text-lg">Carrinho vazio</p>
                        <p className="text-sm text-center max-w-[200px] opacity-60">
                            Digite o código do produto ou escaneie o código de barras
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 group">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 overflow-hidden">
                                            <button
                                                onClick={() => onUpdateQuantity(index, -1)}
                                                className="px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-mono font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(index, 1)}
                                                className="px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 space-y-3">
                {/* Customer Name */}
                {customerName && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Cliente: {customerName}
                        </span>
                    </div>
                )}

                {/* Selected Seller */}
                {selectedSeller && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Vendedor: {selectedSeller.name}
                        </span>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                        <span>Desconto</span>
                        <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-3xl font-bold text-zinc-900 dark:text-white mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <Button
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14"
                        disabled={items.length === 0}
                        onClick={onCheckout}
                    >
                        Finalizar Venda (F9)
                    </Button>
                </div>
            </div>
        </div>
    );
}
