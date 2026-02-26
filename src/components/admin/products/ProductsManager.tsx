"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, FolderTree, Tag } from "lucide-react";
import Link from "next/link";
import { ProductsUnifiedTable } from "./ProductsUnifiedTable";
import { CategoriesManager } from "./CategoriesManager";
import { BrandsList } from "./BrandsList";

export function ProductsManager({ products, categories = [], brands = [] }: { products: any[], categories?: any[], brands?: any[] }) {
    const [view, setView] = useState<"products" | "categories" | "brands">("products");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView("products")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "products" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Package className="h-4 w-4" />
                            Produtos
                        </button>
                        <button
                            onClick={() => setView("categories")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "categories" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <FolderTree className="h-4 w-4" />
                            Categorias
                        </button>
                        <button
                            onClick={() => setView("brands")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "brands" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Tag className="h-4 w-4" />
                            Marcas
                        </button>
                    </div>
                </div>

                {view === "products" && (
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/produtos/importar">
                                Importar/Exportar
                            </Link>
                        </Button>
                        <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white" asChild>
                            <Link href="/admin/produtos/novo">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar produto
                            </Link>
                        </Button>
                    </div>
                )}

            </div>

            {view === "products" && <ProductsUnifiedTable products={products} />}
            {view === "categories" && <CategoriesManager categories={categories} />}
            {view === "brands" && <BrandsList brands={brands} />}
        </div>
    );
}
