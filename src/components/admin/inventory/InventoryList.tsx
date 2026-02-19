"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, History, Edit2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    stock: number;
    sku: string | null;
    images: string[];
    variants: any[];
}

export function InventoryList({ initialProducts }: { initialProducts: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState(initialProducts);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar produtos por nome, SKU ou tags"
                        className="pl-10 bg-card"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 bg-card text-muted-foreground">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-4 border-b bg-muted/50 flex text-sm font-bold text-muted-foreground">
                    <div className="w-[40%]">Produto</div>
                    <div className="w-[15%]">Estoque</div>
                    <div className="w-[15%]">Variações</div>
                    <div className="w-[15%]">SKU</div>
                    <div className="w-[15%] text-right">Histórico</div>
                </div>
                <div>
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum produto encontrado.
                        </div>
                    ) : (
                        filtered.map((item) => {
                            // Calculate images safely
                            const firstImage = item.images && item.images[0];
                            const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || null;

                            return (
                                <div key={item.id} className="flex items-center p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <div className="w-[40%] flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground relative overflow-hidden border">
                                            {imageUrl ? (
                                                <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 opacity-50" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-primary truncate pr-4">{item.name}</span>
                                    </div>
                                    <div className="w-[15%] flex items-center gap-2">
                                        <Input
                                            className={`w-20 h-9 font-medium ${item.stock === 0 ? 'border-destructive/20 bg-destructive/10 text-destructive' : 'border-primary/20 bg-primary/10 text-primary'}`}
                                            defaultValue={item.stock}
                                            type="number"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="w-[15%] text-sm text-muted-foreground">
                                        {item.variants && item.variants.length > 0
                                            ? `${item.variants.length} variações`
                                            : "—"
                                        }
                                    </div>
                                    <div className="w-[15%] text-sm font-medium text-foreground">
                                        {item.sku || "Sem SKU"}
                                    </div>
                                    <div className="w-[15%] flex justify-end">
                                        <Button variant="ghost" size="icon" className="rounded-full border text-muted-foreground hover:bg-muted">
                                            <History className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-4 text-xs text-slate-500 border-t">
                    {filtered.length} produtos
                </div>
            </div>
        </div>
    );
}
