"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Edit2, Trash2, History, Package, X, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { deleteProduct } from "@/lib/actions/product";
import { StockHistoryDialog } from "./StockHistoryDialog";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { useRouter } from "next/navigation";

interface ProductVariant {
    id: string;
    name: string;
    colorHex: string | null;
    colorImage: string | null;
}

interface Product {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    costPerItem?: number | null;
    stock: number;
    expiresAt: Date | string | null;
    isPerishable?: boolean;
    nextBatchExpiry?: Date | string | null;
    images: { url: string }[];
    brand?: { name: string } | null;
    brandLegacy?: string | null;
    category?: { id: string; name: string } | null;
    variants?: ProductVariant[];
}

const ITEMS_PER_PAGE = 50;

// Memoized product row component
const ProductRow = memo(function ProductRow({
    product,
    showCostColumn,
    onHistoryClick,
    onAdjustClick,
    onDelete
}: {
    product: Product;
    showCostColumn: boolean;
    onHistoryClick: () => void;
    onAdjustClick: () => void;
    onDelete: () => void;
}) {
    const brandName = product.brand?.name || product.brandLegacy || "-";

    const variants = product.variants || [];
    const maxSwatches = 5;
    const visibleVariants = variants.slice(0, maxSwatches);
    const extraCount = variants.length - maxSwatches;

    return (
        <div className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
            {/* Product Info */}
            <div className={`${showCostColumn ? "w-[24%]" : "w-[30%]"} flex items-center gap-4`}>
                <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold overflow-hidden shrink-0">
                    {product.images?.[0]?.url ? (
                        <img
                            src={product.images[0].url}
                            alt=""
                            className="object-cover w-full h-full"
                            loading="lazy"
                        />
                    ) : (
                        product.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="min-w-0">
                    <Link
                        href={`/admin/produtos/${product.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline block truncate"
                    >
                        {product.name}
                    </Link>
                    <span className="text-xs text-slate-400">
                        {product.sku || "Sem SKU"}
                    </span>
                </div>
            </div>

            {/* Brand */}
            <div className={`${showCostColumn ? "w-[10%]" : "w-[12%]"} text-sm text-slate-600 truncate`}>
                {brandName}
            </div>

            {/* Price */}
            <div className={`${showCostColumn ? "w-[10%]" : "w-[12%]"} text-sm font-medium text-slate-700`}>
                R$ {product.price.toFixed(2).replace(".", ",")}
            </div>

            {/* Cost */}
            {showCostColumn && (
                <div className="w-[10%] text-sm text-slate-500">
                    {product.costPerItem ? `R$ ${product.costPerItem.toFixed(2).replace(".", ",")}` : "-"}
                </div>
            )}

            {/* Stock */}
            <div className={`${showCostColumn ? "w-[8%]" : "w-[10%]"}`}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                    {product.stock} un
                </span>
            </div>

            {/* Color Variants */}
            <div className="w-[14%]">
                {variants.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                        {visibleVariants.map((v) => (
                            v.colorImage ? (
                                <img
                                    key={v.id}
                                    src={v.colorImage}
                                    alt={v.name}
                                    title={v.name}
                                    className="h-5 w-5 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                            ) : (
                                <span
                                    key={v.id}
                                    title={v.name}
                                    className="h-5 w-5 rounded-full border border-slate-200 shrink-0"
                                    style={{ backgroundColor: v.colorHex || "#ccc" }}
                                />
                            )
                        ))}
                        {extraCount > 0 && (
                            <span className="text-xs text-slate-400 ml-0.5">+{extraCount}</span>
                        )}
                    </div>
                ) : (
                    <span className="text-sm text-slate-400">-</span>
                )}
            </div>

            {/* Actions */}
            <div className="w-[22%] flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onHistoryClick}>
                    <History className="h-4 w-4 text-slate-400 hover:text-purple-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdjustClick}>
                    <Package className="h-4 w-4 text-slate-400 hover:text-green-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/admin/produtos/${product.id}`}>
                        <Edit2 className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                </Button>
            </div>
        </div>
    );
});

export function ProductsUnifiedTable({ products }: { products: Product[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [showAdjustDialog, setShowAdjustDialog] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showCostColumn, setShowCostColumn] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterStockMin, setFilterStockMin] = useState<string>("");
    const [filterStockMax, setFilterStockMax] = useState<string>("");
    const [filterPriceMin, setFilterPriceMin] = useState<string>("");
    const [filterPriceMax, setFilterPriceMax] = useState<string>("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterCategory, filterStockMin, filterStockMax, filterPriceMin, filterPriceMax]);

    const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

    // Extract categories once
    const categories = useMemo(() => {
        const cats = new Map<string, string>();
        safeProducts.forEach((p) => {
            if (p.category) cats.set(p.category.id, p.category.name);
        });
        return Array.from(cats, ([id, name]) => ({ id, name }));
    }, [safeProducts]);

    const hasActiveFilters = filterCategory || filterStockMin || filterStockMax || filterPriceMin || filterPriceMax;

    // Memoized filtering
    const filtered = useMemo(() => {
        const search = debouncedSearch.toLowerCase();
        const stockMin = filterStockMin ? parseInt(filterStockMin) : null;
        const stockMax = filterStockMax ? parseInt(filterStockMax) : null;
        const priceMin = filterPriceMin ? parseFloat(filterPriceMin) : null;
        const priceMax = filterPriceMax ? parseFloat(filterPriceMax) : null;

        return safeProducts.filter((p) => {
            if (search && !p.name.toLowerCase().includes(search) && !(p.sku?.toLowerCase().includes(search))) {
                return false;
            }
            if (filterCategory && p.category?.id !== filterCategory) return false;
            if (stockMin !== null && p.stock < stockMin) return false;
            if (stockMax !== null && p.stock > stockMax) return false;
            if (priceMin !== null && p.price < priceMin) return false;
            if (priceMax !== null && p.price > priceMax) return false;
            return true;
        });
    }, [safeProducts, debouncedSearch, filterCategory, filterStockMin, filterStockMax, filterPriceMin, filterPriceMax]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const clearFilters = useCallback(() => {
        setFilterCategory("");
        setFilterStockMin("");
        setFilterStockMax("");
        setFilterPriceMin("");
        setFilterPriceMax("");
    }, []);

    const handleDelete = useCallback(async (product: Product) => {
        if (confirm(`Excluir "${product.name}"?`)) {
            await deleteProduct(product.id);
            router.refresh();
        }
    }, [router]);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou SKU..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 bg-white ${showCostColumn ? "border-green-500 text-green-600" : ""}`}
                    onClick={() => setShowCostColumn(!showCostColumn)}
                >
                    {showCostColumn ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Custo
                </Button>
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={`gap-2 bg-white ${hasActiveFilters ? "border-blue-500 text-blue-600" : ""}`}>
                            <Filter className="h-4 w-4" />
                            Filtrar
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Filtros</h4>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={clearFilters}>
                                        <X className="h-3 w-3 mr-1" />
                                        Limpar
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Categoria</Label>
                                <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}>
                                    <SelectTrigger className="h-8"><SelectValue placeholder="Todas" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Estoque</Label>
                                <div className="flex gap-2">
                                    <Input type="number" placeholder="Min" className="h-8" value={filterStockMin} onChange={(e) => setFilterStockMin(e.target.value)} />
                                    <Input type="number" placeholder="Max" className="h-8" value={filterStockMax} onChange={(e) => setFilterStockMax(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Preço (R$)</Label>
                                <div className="flex gap-2">
                                    <Input type="number" placeholder="Min" className="h-8" value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} />
                                    <Input type="number" placeholder="Max" className="h-8" value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-3 border-b bg-slate-50 flex text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <div className={showCostColumn ? "w-[24%]" : "w-[30%]"}>Produto</div>
                    <div className={showCostColumn ? "w-[10%]" : "w-[12%]"}>Marca</div>
                    <div className={showCostColumn ? "w-[10%]" : "w-[12%]"}>Preço</div>
                    {showCostColumn && <div className="w-[10%]">Custo</div>}
                    <div className={showCostColumn ? "w-[8%]" : "w-[10%]"}>Estoque</div>
                    <div className="w-[14%]">Cor</div>
                    <div className="w-[22%] text-right">Ações</div>
                </div>

                {/* Body */}
                {paginatedProducts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p>Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div>
                        {paginatedProducts.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                showCostColumn={showCostColumn}
                                onHistoryClick={() => { setSelectedProduct(product); setShowHistoryDialog(true); }}
                                onAdjustClick={() => { setSelectedProduct(product); setShowAdjustDialog(true); }}
                                onDelete={() => handleDelete(product)}
                            />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="p-3 border-t bg-slate-50 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-slate-600">{currentPage} / {totalPages}</span>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            {selectedProduct && (
                <>
                    <StockHistoryDialog
                        open={showHistoryDialog}
                        onOpenChange={setShowHistoryDialog}
                        productId={selectedProduct.id}
                        productName={selectedProduct.name}
                    />
                    <StockAdjustmentDialog
                        open={showAdjustDialog}
                        onOpenChange={setShowAdjustDialog}
                        product={{ id: selectedProduct.id, name: selectedProduct.name, stock: selectedProduct.stock }}
                        onSuccess={() => router.refresh()}
                    />
                </>
            )}
        </div>
    );
}
