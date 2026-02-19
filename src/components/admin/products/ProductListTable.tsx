"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, MoreVertical, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { deleteProduct } from "@/lib/actions/product";

export function ProductListTable({ products }: { products: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    // Safety check for products
    const safeProducts = Array.isArray(products) ? products : [];

    const filtered = safeProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar produtos"
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 bg-white text-slate-600">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 border-b bg-slate-50/50 flex text-sm font-bold text-slate-600">
                    <div className="w-[40%]">Produto</div>
                    <div className="w-[15%]">Marca</div>
                    <div className="w-[15%]">Preço</div>
                    <div className="w-[15%]">Estoque</div>
                    <div className="w-[15%] text-right">Ações</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    <div>
                        {filtered.map((product) => (
                            <div key={product.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="w-[40%] flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 font-bold overflow-hidden relative">
                                        {/* Placeholder or Image */}
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <span>{product.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                                            <Link href={`/admin/produtos/${product.id}`}>{product.name}</Link>
                                        </span>
                                        <span className="text-xs text-slate-500">{product.sku || "Sem SKU"}</span>
                                    </div>
                                </div>
                                <div className="w-[15%] text-sm text-slate-600">
                                    {product.brand?.name || product.brandLegacy || "-"}
                                </div>
                                <div className="w-[15%] text-sm font-medium text-slate-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                </div>
                                <div className="w-[15%]">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock} un
                                    </span>
                                </div>
                                <div className="w-[15%] flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" asChild>
                                        <Link href={`/admin/produtos/${product.id}`}>
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <form action={async () => {
                                        if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                                            // Dynamic import to avoid client-side bundling issues if action not fully compatible, 
                                            // but standard request is just passed to props or imported
                                            // checks: we need to import deleteProduct
                                            await deleteProduct(product.id);
                                        }
                                    }}>
                                        <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
