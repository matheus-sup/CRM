"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Trash2, Save, ScanBarcode, Calendar } from "lucide-react";
import { getProducts } from "@/lib/actions/product"; // We'll need a better search action
import { addStockBatch } from "@/lib/actions/inventory"; // We need to create this
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock types for now, will replace with real Prisma types
type Product = {
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    stock: number;
    price: any;
    image?: string;
};

type StockEntryItem = {
    productId: string;
    productName: string;
    productSku: string;
    quantityToAdd: number;
    expiresAt: string; // ISO Date "YYYY-MM-DD"
};

export default function StockEntryPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Entry Form State
    const [quantity, setQuantity] = useState<string>("");
    const [expiresAt, setExpiresAt] = useState<string>("");

    // Queue
    const [itemsQueue, setItemsQueue] = useState<StockEntryItem[]>([]);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const quantityInputRef = useRef<HTMLInputElement>(null);

    // Initial Load - Fetch all for client-side fuzzy search (optimization needed for large catalogs)
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    useEffect(() => {
        // TODO: Replace with server action for search
        getProducts().then((data: any) => setAllProducts(data));
    }, []);

    // Search Logic
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.sku?.toLowerCase().includes(lowerQuery) ||
            p.barcode?.includes(lowerQuery)
        );

        // Auto-select if exact match on barcode
        const exactMatch = filtered.find(p => p.barcode === lowerQuery || p.sku?.toLowerCase() === lowerQuery);
        if (exactMatch) {
            handleSelectProduct(exactMatch);
            setSearchQuery(""); // Clear search
        } else {
            setSearchResults(filtered.slice(0, 5));
        }
    }, [searchQuery, allProducts]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchResults([]);
        setSearchQuery("");
        // Focus quantity next
        setTimeout(() => quantityInputRef.current?.focus(), 100);
    };

    const handleAddItem = () => {
        if (!selectedProduct || !quantity) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast({ title: "Quantidade inválida" });
            return;
        }

        const newItem: StockEntryItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productSku: selectedProduct.sku || "N/A",
            quantityToAdd: qty,
            expiresAt: expiresAt
        };

        setItemsQueue([...itemsQueue, newItem]);

        // Reset Form
        setSelectedProduct(null);
        setQuantity("");
        setExpiresAt("");

        // Refocus Search for next scan
        searchInputRef.current?.focus();
    };

    const handleRemoveItem = (index: number) => {
        const newQueue = [...itemsQueue];
        newQueue.splice(index, 1);
        setItemsQueue(newQueue);
    };

    const handleSaveBatch = () => {
        if (itemsQueue.length === 0) return;

        startTransition(async () => {
            try {
                await addStockBatch(itemsQueue);
                toast({ title: "Estoque atualizado com sucesso!" });
                setItemsQueue([]);
            } catch (error) {
                console.error(error);
                toast({ title: "Erro ao salvar estoque", variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Entrada de Estoque</h1>
                <Button disabled={itemsQueue.length === 0 || isPending} onClick={handleSaveBatch} className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    {isPending ? "Salvando..." : "Confirmar Entrada"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Right Column: Search & Add (On mobile this might need to be top) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ScanBarcode className="h-5 w-5" />
                                Adicionar Produto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Scan Código de Barras / Nome..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-12 text-lg"
                                    autoFocus
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-b-lg z-50 max-h-[300px] overflow-auto">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleSelectProduct(p)}
                                                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0 flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-semibold">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {p.sku} | EAN: {p.barcode}</div>
                                                </div>
                                                <Badge variant="outline">Stock: {p.stock}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Product Form */}
                            {selectedProduct ? (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <div className="font-bold text-blue-900">{selectedProduct.name}</div>
                                        <div className="text-xs text-blue-700">Atual: {selectedProduct.stock} unidades</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-blue-800">Qtd a Adicionar</label>
                                            <Input
                                                ref={quantityInputRef}
                                                type="number"
                                                placeholder="0"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="bg-white"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleAddItem();
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs flex items-center gap-1 font-semibold text-blue-800 mb-1">
                                            <Calendar className="h-3 w-3" />
                                            Validade (Opcional)
                                        </label>
                                        <Input
                                            type="date"
                                            value={expiresAt}
                                            onChange={(e) => setExpiresAt(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="ghost" className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setSelectedProduct(null)}>
                                            Cancelar
                                        </Button>
                                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddItem}>
                                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    Mire o leitor ou digite para buscar
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Left Column: List (Queue) */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Itens para entrada ({itemsQueue.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsQueue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-gray-50 rounded-lg">
                                    <ScanBarcode className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Nenhum item na lista.</p>
                                    <p className="text-sm">Adicione produtos usando o painel ao lado.</p>
                                </div>
                            ) : (
                                <div className="overflow-auto max-h-[600px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="py-3 px-4 text-left font-medium text-gray-500">Produto</th>
                                                <th className="py-3 px-4 text-left font-medium text-gray-500">Validade</th>
                                                <th className="py-3 px-4 text-center font-medium text-gray-500">Qtd</th>
                                                <th className="py-3 px-4 text-right font-medium text-gray-500">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {itemsQueue.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium">{item.productName}</div>
                                                        <div className="text-xs text-muted-foreground">{item.productSku}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "-"}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-green-600">
                                                        +{item.quantityToAdd}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(idx)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
