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
                    <p className="text-sm text-slate-600 mt-1">
                        Organize seus produtos em categorias para o menu da loja.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="#" className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        Mais sobre criar e organizar as categorias
                    </Link>
                    <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar categoria
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, idx) => (
                    <div key={idx} className="group relative bg-white border hover:border-blue-300 hover:shadow-md rounded-xl p-6 transition-all flex flex-col items-center justify-between min-h-[160px]">

                        {/* Actions Top Right */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Drag Handle Top Left */}
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-move text-slate-300 hover:text-slate-500">
                            <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 pt-2">
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {cat.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800 text-center text-lg">{cat}</span>
                            <span className="text-xs text-slate-400 font-medium">0 produtos</span>
                        </div>
                    </div>
                ))}


            </div>
        </div>
    );
}
