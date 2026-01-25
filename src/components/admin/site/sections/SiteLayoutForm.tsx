"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Lock } from "lucide-react";
import Link from "next/link";

export function SiteLayoutForm({ config, onEdit }: { config: any, onEdit: () => void }) {
    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="space-y-8">
                {/* Current Layout Card - Wide Version */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    {/* Preview Image Area */}
                    <div className="bg-slate-100 rounded-lg aspect-3/1 mb-6 flex items-center justify-center relative overflow-hidden ring-1 ring-slate-900/5">
                        {/* Abstract Wireframe Representation */}
                        <div className="w-[80%] h-[80%] bg-white rounded shadow-sm opacity-80 flex flex-col">
                            {/* Header */}
                            <div className="h-4 border-b flex items-center justify-between px-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full"></div>
                                <div className="flex gap-1">
                                    <div className="w-4 h-2 bg-slate-200 rounded-full"></div>
                                    <div className="w-4 h-2 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex flex-1">
                                {/* Sidebar/Content */}
                                <div className="w-1/3 border-r p-2 space-y-2">
                                    <div className="w-full h-8 bg-slate-800 rounded mb-2"></div>
                                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                                    <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                                    <div className="w-12 h-2 bg-blue-500 rounded mt-2"></div>
                                </div>
                                <div className="flex-1 bg-slate-50"></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-xl text-slate-900">{config.themeName || "Layout Personalizado"}</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-2.5 py-0.5">
                                    Layout atual
                                </Badge>
                            </div>
                            <span className="text-sm text-slate-500 mt-1">Última edição: 24/01/2026 às 10:33</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
                                Personalizar Home
                            </Button>
                            <Button variant="outline" size="icon" className="h-10 w-10">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Note: "Draft" (Rascunho) block was removed as per request */}

            {/* More Themes Banner */}
            <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-100">
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">Mais de 60 temas disponíveis</h3>
                    <p className="text-slate-600 text-base max-w-lg leading-relaxed">
                        Explore nossa galeria de temas para dar uma nova cara à sua loja.
                        Novos temas são adicionados mensalmente.
                    </p>
                    <Badge variant="secondary" className="bg-white/80 text-purple-700 backdrop-blur-sm border-purple-200">
                        Em breve
                    </Badge>
                </div>
                <div>
                    <Button variant="outline" className="gap-2 text-slate-600 border-slate-200 bg-white hover:bg-slate-50 h-10 px-6 shadow-sm" disabled>
                        <Lock className="h-4 w-4" />
                        Ver galeria de temas
                    </Button>
                </div>
            </div>
        </div>
    );
}
