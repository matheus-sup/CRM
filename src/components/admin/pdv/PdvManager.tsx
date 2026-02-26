"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PosCart } from "@/components/admin/pdv/PosCart";
import { CheckoutModal } from "@/components/admin/pdv/CheckoutModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, User, AlertCircle, Package, UserPlus, Barcode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    barcode?: string | null;
    images?: string[];
}

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface Seller {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
}

interface PdvManagerProps {
    initialProducts: Product[];
    sellers?: Seller[];
}

export function PdvManager({ initialProducts, sellers = [] }: PdvManagerProps) {
    const [products] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>("");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const barcodeBufferRef = useRef<string>("");
    const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    // Customer quick registration
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerCpf, setCustomerCpf] = useState("");

    // Last added product for feedback
    const [lastAdded, setLastAdded] = useState<{ name: string; price: number } | null>(null);

    // Last search error for feedback
    const [lastError, setLastError] = useState<string | null>(null);

    // Find product by code (SKU or barcode)
    const findProductByCode = useCallback((code: string): Product | undefined => {
        const normalizedCode = code.trim().toLowerCase();
        return products.find(p =>
            p.sku?.toLowerCase() === normalizedCode ||
            p.barcode?.toLowerCase() === normalizedCode
        );
    }, [products]);

    // Add product to cart
    const handleAddToCart = useCallback((product: Product) => {
        if (product.stock <= 0) {
            toast({
                title: "Produto sem estoque",
                description: `O produto ${product.name} está esgotado.`,
                variant: "destructive",
            });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }];
        });

        setLastAdded({ name: product.name, price: product.price });
        setTimeout(() => setLastAdded(null), 3000);
    }, [toast]);

    // Handle search/barcode input
    const handleSearchSubmit = useCallback(() => {
        if (!search.trim()) return;

        const product = findProductByCode(search);
        if (product) {
            handleAddToCart(product);
            setSearch("");
            setLastError(null);
            searchInputRef.current?.focus();
        } else {
            setLastError(`Produto não encontrado: ${search}`);
            setSearch("");
            toast({
                title: "Produto não encontrado",
                description: `Código "${search}" não existe no sistema.`,
                variant: "destructive",
            });
            setTimeout(() => setLastError(null), 5000);
        }
    }, [search, findProductByCode, handleAddToCart, toast]);

    const handleUpdateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            const newQty = item.quantity + delta;

            if (newQty <= 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index] = { ...item, quantity: newQty };
            }
            return newCart;
        });
    };

    const handleRemoveItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearCart = () => {
        if (confirm("Tem certeza que deseja limpar o carrinho?")) {
            setCart([]);
            setCustomerName("");
            setCustomerPhone("");
            setCustomerCpf("");
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast({
                title: "Carrinho vazio",
                description: "Adicione produtos ao carrinho para finalizar a venda.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedSellerId) {
            toast({
                title: "Vendedor obrigatório",
                description: sellers.length === 0
                    ? "Cadastre um vendedor em Pedidos > Vendedores."
                    : "Selecione um vendedor para finalizar a venda.",
                variant: "destructive",
            });
            return;
        }

        setIsCheckoutOpen(true);
    };

    const handleCheckoutSuccess = () => {
        setCart([]);
        setIsCheckoutOpen(false);
        setSearch("");
        setCustomerName("");
        setCustomerPhone("");
        setCustomerCpf("");
        searchInputRef.current?.focus();
    };

    // Keyboard shortcuts & Barcode scanner detection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

            // F2 - Focus search
            if (e.key === "F2") {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            // F4 - Clear cart
            if (e.key === "F4") {
                e.preventDefault();
                if (cart.length > 0) {
                    handleClearCart();
                }
                return;
            }

            // F9 - Checkout
            if (e.key === "F9") {
                e.preventDefault();
                handleCheckout();
                return;
            }

            // Barcode scanner detection on search input
            if (isInputField && target === searchInputRef.current) {
                if (barcodeTimeoutRef.current) {
                    clearTimeout(barcodeTimeoutRef.current);
                }

                if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                    barcodeBufferRef.current = "";
                    return;
                }

                if (e.key.length === 1 && /[\dA-Za-z]/.test(e.key)) {
                    barcodeBufferRef.current += e.key;
                    barcodeTimeoutRef.current = setTimeout(() => {
                        barcodeBufferRef.current = "";
                    }, 100);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (barcodeTimeoutRef.current) {
                clearTimeout(barcodeTimeoutRef.current);
            }
        };
    }, [cart, products, selectedSellerId, handleSearchSubmit]);

    const selectedSeller = sellers.find(s => s.id === selectedSellerId);

    return (
        <>
            <div className="flex h-[calc(100vh-6rem)] overflow-hidden bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* Left Content: Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex gap-4 items-center">
                            {/* Barcode Input */}
                            <div className="relative flex-1">
                                <Barcode className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 ${lastError ? "text-red-500" : "text-primary"}`} />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Digite o código ou escaneie o código de barras..."
                                    className={`pl-12 h-14 text-xl font-mono bg-zinc-50 dark:bg-zinc-800 ${
                                        lastError
                                            ? "border-red-300 dark:border-red-700 focus-visible:ring-red-500"
                                            : "border-zinc-200 dark:border-zinc-700 focus-visible:ring-pink-500"
                                    }`}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        if (lastError) setLastError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearchSubmit();
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>

                            {/* Seller Select */}
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-black dark:text-white" />
                                {sellers.length > 0 ? (
                                    <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
                                        <SelectTrigger className={`w-[180px] h-14 bg-zinc-50 dark:bg-zinc-800 ${
                                            !selectedSellerId
                                                ? "border-red-300 dark:border-red-700 ring-1 ring-red-200"
                                                : "border-zinc-200 dark:border-zinc-700"
                                        }`}>
                                            <SelectValue placeholder="Vendedor *" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sellers.map((seller) => (
                                                <SelectItem key={seller.id} value={seller.id}>
                                                    {seller.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <a
                                        href="/admin/pedidos"
                                        className="px-4 py-3 h-14 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        Cadastrar vendedor
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 overflow-auto">
                        {/* Last Added Feedback */}
                        {lastAdded && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-pulse">
                                <Package className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">Produto adicionado!</p>
                                    <p className="text-green-700 dark:text-green-300">{lastAdded.name} - R$ {lastAdded.price.toFixed(2)}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Feedback */}
                        {lastError && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">{lastError}</p>
                                    <p className="text-sm text-red-600 dark:text-red-300">Verifique se o SKU ou código de barras está correto.</p>
                                </div>
                            </div>
                        )}

                        {/* Seller Warning */}
                        {!selectedSellerId && (
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                                <span className="text-amber-700 dark:text-amber-300">
                                    {sellers.length === 0
                                        ? "Nenhum vendedor cadastrado. Acesse Pedidos > Vendedores para cadastrar."
                                        : "Selecione um vendedor para habilitar a finalização da venda"}
                                </span>
                            </div>
                        )}

                        {/* Customer Quick Registration */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <UserPlus className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Dados do Cliente</h2>
                                    <p className="text-sm text-zinc-500">Opcional - para nota fiscal ou cadastro</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName" className="text-sm font-medium">Nome</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Nome do cliente"
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone" className="text-sm font-medium">Telefone</Label>
                                    <Input
                                        id="customerPhone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerCpf" className="text-sm font-medium">CPF</Label>
                                    <Input
                                        id="customerCpf"
                                        value={customerCpf}
                                        onChange={(e) => setCustomerCpf(e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                            <div className="text-center">
                                <Barcode className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                                    Escaneie ou digite o código do produto
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-md mx-auto">
                                    Use o leitor de código de barras ou digite o SKU/código de barras do produto e pressione Enter para adicionar ao carrinho.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="p-3 bg-zinc-800 text-zinc-400 text-sm flex justify-center gap-8">
                        <span><kbd className="bg-zinc-700 px-2 py-1 rounded text-zinc-300 font-mono">F2</kbd> Buscar</span>
                        <span><kbd className="bg-zinc-700 px-2 py-1 rounded text-zinc-300 font-mono">F4</kbd> Limpar</span>
                        <span><kbd className="bg-zinc-700 px-2 py-1 rounded text-zinc-300 font-mono">F9</kbd> Finalizar</span>
                        <span><kbd className="bg-zinc-700 px-2 py-1 rounded text-zinc-300 font-mono">Enter</kbd> Adicionar</span>
                    </div>
                </div>

                {/* Right Content: Sidebar Cart */}
                <PosCart
                    items={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                    onClearCart={handleClearCart}
                    selectedSeller={selectedSeller || null}
                    customerName={customerName}
                />
            </div>

            {/* Checkout Modal */}
            {selectedSeller && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    items={cart}
                    seller={selectedSeller}
                    onSuccess={handleCheckoutSuccess}
                    customerName={customerName}
                    customerCpf={customerCpf}
                />
            )}
        </>
    );
}
