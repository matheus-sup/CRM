"use client";

import { Button } from "@/components/ui/button";
import { Plus, GripVertical, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";

export function CategoriesList({ categories, onCreateClick }: { categories: any[], onCreateClick: () => void }) {

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Gerenciar Categorias</h2>
                    <p className="text-sm text-slate-600">
                        Organize seus produtos em categorias para o menu da loja.
                    </p>
                </div>
                <Link href="#" className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    Mais sobre criar e organizar as categorias
                </Link>
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
                                {cat.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800 text-center text-lg">{cat.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{cat._count?.products || 0} produtos</span>
                        </div>
                    </div>
                ))}

                {/* Create New Block - Always Visible */}
                <button
                    onClick={onCreateClick}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all group"
                >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Criar nova categoria</span>
                </button>
            </div>
        </div>
    );
}
