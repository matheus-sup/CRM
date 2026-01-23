"use client";

import { Button } from "@/components/ui/button";
import { Plus, GripVertical, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";

// Mock data
const categories = [
    "Higiene Pessoal",
    "Cuidados com os Cabelos",
    "Cuidados com a Pele",
    "Maquiagem",
    "Perfumaria",
    "Acessórios de Beleza"
];

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
                </div>
                <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar categoria
                </Button>
            </div>

            <p className="text-sm text-slate-600">
                Para organizar seus produtos, crie categorias e subcategorias que aparecerão no menu da loja.
            </p>

            <div className="rounded-lg border bg-white shadow-sm divide-y">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 group">
                        <div className="flex items-center gap-3">
                            <GripVertical className="h-5 w-5 text-slate-300 cursor-move" />
                            <span className="text-sm font-medium text-slate-700">{cat}</span>
                        </div>
                        <div>
                            <Button variant="ghost" size="icon" className="rounded-full border text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                <ExternalLink className="h-4 w-4" />
                Mais sobre criar e organizar as categorias
            </div>
        </div>
    );
}
