"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, List, Package, FolderTree } from "lucide-react";
import Link from "next/link";
import { InventoryList } from "@/components/admin/inventory/InventoryList";
import { ProductListTable } from "./ProductListTable";
import { CategoriesList } from "./CategoriesList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"; // Ensure these exist in your UI lib
import { Label } from "@/components/ui/label"; // Ensure these exist
import { Input } from "@/components/ui/input"; // Ensure these exist
import { createCategory } from "@/lib/actions/category"; // Ensure this action exists

export function ProductsManager({ products, categories = [] }: { products: any[], categories?: any[] }) {
    const [view, setView] = useState<"list" | "inventory" | "categories">("list");
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    async function handleCreateCategory(formData: FormData) {
        setIsCreatingCategory(true);
        const res = await createCategory(formData);
        setIsCreatingCategory(false);
        if (res.success) {
            setIsCategoryDialogOpen(false);
        } else {
            alert(res.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView("list")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <List className="h-4 w-4" />
                            Lista
                        </button>
                        <button
                            onClick={() => setView("inventory")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "inventory" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Package className="h-4 w-4" />
                            Inventário
                        </button>
                        <button
                            onClick={() => setView("categories")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "categories" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <FolderTree className="h-4 w-4" />
                            Categorias
                        </button>
                    </div>
                </div>

                {view === "list" && (
                    <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white" asChild>
                        <Link href="/admin/produtos/novo">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar produto
                        </Link>
                    </Button>
                )}

                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Categoria</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreateCategory} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome da Categoria</Label>
                                <Input name="name" placeholder="Ex: Maquiagem" required />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreatingCategory}>
                                    {isCreatingCategory ? "Criando..." : "Criar Categoria"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {view === "list" && <ProductListTable products={products} />}
            {view === "inventory" && <InventoryList initialProducts={products} />}
            {view === "categories" && <CategoriesList categories={categories} onCreateClick={() => setIsCategoryDialogOpen(true)} />}
        </div>
    );
}
