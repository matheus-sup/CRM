"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, History, Edit2 } from "lucide-react";

// Mock data based on screenshot
const inventoryItems = [
    { id: 1, name: "XUXINHAS 2 UNIDADES", hasImage: false, stock: 3, sku: "Sem SKU", variations: "" },
    { id: 2, name: "XUXINHA POMPOM", hasImage: false, stock: 0, sku: "Sem SKU", variations: "" },
    { id: 3, name: "XUXINHA MEIA", hasImage: false, stock: 44, sku: "Sem SKU", variations: "" },
];

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Inventário</h1>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar produtos por nome, SKU ou tags" className="pl-10 bg-white" />
                </div>
                <Button variant="outline" className="gap-2 bg-white text-slate-600">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 border-b bg-slate-50/50 flex text-sm font-bold text-slate-600">
                    <div className="w-[40%]">Produto</div>
                    <div className="w-[15%]">Estoque</div>
                    <div className="w-[15%]">Variações</div>
                    <div className="w-[15%]">SKU</div>
                    <div className="w-[15%] text-right">Histórico</div>
                </div>
                <div>
                    {inventoryItems.map((item) => (
                        <div key={item.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="w-[40%] flex items-center gap-4">
                                <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                </div>
                                <span className="text-sm font-bold text-blue-600">{item.name}</span>
                            </div>
                            <div className="w-[15%] flex items-center gap-2">
                                <Input
                                    className={`w-20 h-9 font-medium ${item.stock === 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-orange-200 bg-orange-50 text-orange-700'}`}
                                    defaultValue={item.stock}
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="w-[15%] text-sm text-slate-500">
                                {item.variations || "—"}
                            </div>
                            <div className="w-[15%] text-sm font-medium text-slate-700">
                                {item.sku}
                            </div>
                            <div className="w-[15%] flex justify-end">
                                <Button variant="ghost" size="icon" className="rounded-full border text-slate-500 hover:bg-slate-100">
                                    <History className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 text-xs text-slate-500 border-t">
                    {inventoryItems.length} produtos
                </div>
            </div>
        </div>
    );
}
