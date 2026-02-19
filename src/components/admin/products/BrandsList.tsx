"use client";

import { Tag, Search, Trash2, Plus, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteBrand, createBrand, updateBrand } from "@/lib/actions/brands-management";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

export function BrandsList({ brands: initialBrands }: { brands: any[] }) {
    const router = useRouter();
    const [localBrands, setLocalBrands] = useState(initialBrands);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<{ id: string, name: string } | null>(null);
    const [brandName, setBrandName] = useState("");

    // Sync state with props
    useEffect(() => {
        setLocalBrands(initialBrands);
    }, [initialBrands]);

    const filtered = localBrands.filter((b: any) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    function openCreate() {
        setEditingBrand(null);
        setBrandName("");
        setIsDialogOpen(true);
    }

    function openEdit(brand: any) {
        setEditingBrand(brand);
        setBrandName(brand.name);
        setIsDialogOpen(true);
    }

    async function handleDelete(id: string, count: number) {
        if (count > 0) {
            if (!confirm(`Esta marca possui ${count} produtos associados. Eles ficarão sem marca. Deseja continuar?`)) return;
        } else {
            if (!confirm("Tem certeza que deseja excluir esta marca?")) return;
        }

        // Optimistic delete
        const previous = localBrands;
        setLocalBrands(prev => prev.filter((b: any) => b.id !== id));

        const res = await deleteBrand(id);
        if (!res.success) {
            alert(res.message);
            setLocalBrands(previous); // Revert on failure
            return;
        }
        router.refresh();
    }

    async function handleSave() {
        if (!brandName.trim()) return;
        const name = brandName.trim();

        if (editingBrand) {
            // Update
            const res = await updateBrand(editingBrand.id, name);
            if (res.success && res.brand) {
                // Optimistic update
                setLocalBrands(prev => prev.map((b: any) => b.id === editingBrand.id ? { ...b, ...res.brand } : b));
                setIsDialogOpen(false);
                setBrandName("");
                setEditingBrand(null);
                router.refresh();
            } else {
                alert(res.message);
            }
        } else {
            // Create
            const res = await createBrand(name);
            if (res.success && res.brand) {
                const newB = { ...res.brand, _count: { products: 0 } };
                setLocalBrands(prev => [...prev, newB].sort((a: any, b: any) => a.name.localeCompare(b.name)));
                setIsDialogOpen(false);
                setBrandName("");
                router.refresh();
            } else {
                alert(res.message);
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Gerenciar Marcas</h2>
                    <p className="text-sm text-slate-600">
                        Crie, edite e exclua marcas.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar marcas..."
                            className="pl-10 w-[300px] bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4" /> Nova Marca
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filtered.map((brand) => (
                    <div key={brand.id} className="bg-white p-4 rounded-lg border flex flex-col gap-3 hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-medium text-slate-700 truncate" title={brand.name}>{brand.name}</span>
                                <span className="text-xs text-slate-400">{brand._count?.products || 0} produtos</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-1 pt-2 border-t mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => openEdit(brand)}
                                title="Editar marca"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(brand.id, brand._count?.products || 0)}
                                title="Excluir marca"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        Nenhuma marca encontrada.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBrand ? "Editar Marca" : "Nova Marca"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Marca</Label>
                            <Input
                                placeholder="Ex: Nike, Samsung..."
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>{editingBrand ? "Salvar" : "Criar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
