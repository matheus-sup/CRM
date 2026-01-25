"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash, GripVertical, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { updateMenu, addMenuItem, deleteMenuItem, deleteMenu } from "@/lib/actions/menu";

export function MenuEditor({ menu }: { menu: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- Menu Details Handlers ---
    const handleUpdateMenu = async (formData: FormData) => {
        setLoading(true);
        await updateMenu(menu.id, null, formData);
        setLoading(false);
    };

    const handleDeleteMenu = async () => {
        if (!confirm("Tem certeza que deseja excluir este menu? Isso não pode ser desfeito.")) return;
        const res = await deleteMenu(menu.id);
        if (res.success) router.push("/admin/menus");
    };

    // --- Menu Item Handlers ---
    const handleAddLink = async (formData: FormData) => {
        // We'll let the form action handle the reset by key or manual clear if needed, 
        // but simple action works for now.
        await addMenuItem(menu.id, null, formData);
        // Clear inputs manually if needed, or rely on React key reset technique
        (document.getElementById("add-link-form") as HTMLFormElement)?.reset();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/menus">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Editar Menu</h1>
                        <p className="text-slate-500 text-sm">Gerencie os links e a estrutura.</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteMenu}>
                    <Trash className="h-4 w-4 mr-2" /> Excluir Menu
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Menu Settings */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Configurações</h3>
                        <form action={handleUpdateMenu} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="title" defaultValue={menu.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Identificador (Handle)</Label>
                                <Input name="handle" defaultValue={menu.handle} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </form>
                    </div>

                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-800">
                        <p className="font-bold mb-1">Dica:</p>
                        <p>O identificador <strong>main</strong> é usado automaticamente para o cabeçalho da loja.</p>
                    </div>
                </div>

                {/* Right Col: Menu Items */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items List */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Links do Menu</h3>
                            <span className="text-xs text-slate-500">{menu.items?.length || 0} itens</span>
                        </div>

                        <div className="divide-y">
                            {menu.items && menu.items.length > 0 ? (
                                menu.items.map((item: any) => (
                                    <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 group">
                                        <div className="text-slate-300 cursor-move">
                                            <GripVertical className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800">{item.label}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <LinkIcon className="h-3 w-3" /> {item.url}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteMenuItem(item.id, menu.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    Nenhum link adicionado ainda.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-600" /> Adicionar Link
                        </h3>
                        <form id="add-link-form" action={handleAddLink} className="flex gap-3 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Nome do Link</Label>
                                <Input name="label" placeholder="ex: Promoções" required />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label>URL ou Caminho</Label>
                                <Input name="url" placeholder="ex: /promocoes" />
                            </div>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                Adicionar
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
