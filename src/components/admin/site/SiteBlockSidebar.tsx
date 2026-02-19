"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Layout, Code, ShoppingBag, MapPin, Instagram, Megaphone, ChevronLeft, Check } from "lucide-react";
import { BlockType } from "@/types/page-builder";
import { cn } from "@/lib/utils";

interface SiteBlockSidebarProps {
    onAddBlock: (type: BlockType, variant?: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

// Block type definitions
const AVAILABLE_BLOCKS = [
    { type: "hero", label: "Banner / Hero", icon: ImageIcon, description: "Banner principal com texto e botão", hasVariants: true },
    { type: "product-grid", label: "Vitrine de Produtos", icon: ShoppingBag, description: "Lista automática de produtos", hasVariants: true },
    { type: "instagram", label: "Instagram Feed", icon: Instagram, description: "Mostre suas últimas fotos", hasVariants: true },
    { type: "map", label: "Mapa / Localização", icon: MapPin, description: "Google Maps e Endereço", hasVariants: false },
    { type: "promo", label: "Painel Promocional", icon: Megaphone, description: "Avisos, Ofertas e Countdowns", hasVariants: true },
    { type: "text", label: "Texto Rico", icon: Type, description: "Parágrafos, títulos e sobre a loja", hasVariants: true },
    { type: "html", label: "HTML Personalizado", icon: Code, description: "Código livre (Scripts, Iframes)", hasVariants: false },
    { type: "columns", label: "Colunas", icon: Layout, description: "Layout flexível", hasVariants: true }
] as const;

// Block variants with visual mockups
const BLOCK_VARIANTS: Record<string, { id: string; name: string; description: string; mockup: React.ReactNode }[]> = {
    hero: [
        {
            id: "default",
            name: "Padrão",
            description: "Texto centralizado sobre imagem",
            mockup: (
                <div className="w-full h-20 bg-gradient-to-r from-slate-300 to-slate-400 rounded relative flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-2 bg-white/80 rounded mx-auto mb-1" />
                        <div className="w-10 h-1.5 bg-white/60 rounded mx-auto mb-2" />
                        <div className="w-8 h-2 bg-blue-500 rounded mx-auto" />
                    </div>
                </div>
            )
        },
        {
            id: "minimal",
            name: "Minimalista",
            description: "Fundo sólido, texto limpo",
            mockup: (
                <div className="w-full h-20 bg-slate-100 rounded relative flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-2.5 bg-slate-700 rounded mx-auto mb-1" />
                        <div className="w-14 h-1.5 bg-slate-400 rounded mx-auto" />
                    </div>
                </div>
            )
        },
        {
            id: "split",
            name: "Dividido",
            description: "Imagem de um lado, texto do outro",
            mockup: (
                <div className="w-full h-20 bg-white rounded flex overflow-hidden border">
                    <div className="w-1/2 p-2 flex flex-col justify-center">
                        <div className="w-full h-2 bg-slate-700 rounded mb-1" />
                        <div className="w-3/4 h-1.5 bg-slate-400 rounded mb-2" />
                        <div className="w-1/2 h-2 bg-blue-500 rounded" />
                    </div>
                    <div className="w-1/2 bg-gradient-to-br from-slate-200 to-slate-300" />
                </div>
            )
        },
        {
            id: "video",
            name: "Com Vídeo",
            description: "Vídeo de fundo em loop",
            mockup: (
                <div className="w-full h-20 bg-slate-800 rounded relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-0.5" />
                        </div>
                    </div>
                    <div className="text-center z-10">
                        <div className="w-16 h-2 bg-white/90 rounded mx-auto mb-1" />
                        <div className="w-10 h-1.5 bg-white/60 rounded mx-auto" />
                    </div>
                </div>
            )
        }
    ],
    "product-grid": [
        {
            id: "grid",
            name: "Grade",
            description: "Cards em grade tradicional",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 grid grid-cols-4 gap-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded flex flex-col">
                            <div className="flex-1 bg-slate-200 rounded-t" />
                            <div className="h-2 p-0.5">
                                <div className="w-full h-full bg-slate-300 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "carousel",
            name: "Carrossel",
            description: "Produtos deslizantes",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex items-center gap-1 overflow-hidden">
                    <div className="w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <ChevronLeft className="w-2 h-2 text-slate-400" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded h-full flex flex-col">
                            <div className="flex-1 bg-slate-200 rounded-t" />
                            <div className="h-2 p-0.5">
                                <div className="w-full h-full bg-slate-300 rounded" />
                            </div>
                        </div>
                    ))}
                    <div className="w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center shrink-0 rotate-180">
                        <ChevronLeft className="w-2 h-2 text-slate-400" />
                    </div>
                </div>
            )
        },
        {
            id: "list",
            name: "Lista",
            description: "Produtos em linha horizontal",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 space-y-1">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-1 h-7">
                            <div className="w-7 h-7 bg-slate-200 rounded shrink-0" />
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="w-3/4 h-1.5 bg-slate-300 rounded mb-0.5" />
                                <div className="w-1/2 h-1 bg-slate-200 rounded" />
                            </div>
                            <div className="w-6 h-3 bg-blue-500 rounded self-center" />
                        </div>
                    ))}
                </div>
            )
        }
    ],
    instagram: [
        {
            id: "grid",
            name: "Grade 3x3",
            description: "Fotos em grade quadrada",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 grid grid-cols-3 gap-0.5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-sm aspect-square" />
                    ))}
                </div>
            )
        },
        {
            id: "carousel",
            name: "Carrossel",
            description: "Fotos deslizantes",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-14 h-full bg-gradient-to-br from-pink-200 to-purple-200 rounded shrink-0" />
                    ))}
                </div>
            )
        },
        {
            id: "masonry",
            name: "Mosaico",
            description: "Layout variado dinâmico",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-0.5">
                    <div className="w-1/3 bg-gradient-to-br from-pink-200 to-purple-200 rounded-sm" />
                    <div className="w-1/3 flex flex-col gap-0.5">
                        <div className="flex-1 bg-gradient-to-br from-purple-200 to-pink-200 rounded-sm" />
                        <div className="flex-1 bg-gradient-to-br from-pink-300 to-purple-300 rounded-sm" />
                    </div>
                    <div className="w-1/3 flex flex-col gap-0.5">
                        <div className="h-1/3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-sm" />
                        <div className="flex-1 bg-gradient-to-br from-pink-200 to-purple-200 rounded-sm" />
                    </div>
                </div>
            )
        }
    ],
    promo: [
        {
            id: "banner",
            name: "Banner",
            description: "Faixa promocional simples",
            mockup: (
                <div className="w-full h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-2 bg-white/90 rounded mx-auto mb-1" />
                        <div className="w-12 h-1.5 bg-white/60 rounded mx-auto" />
                    </div>
                </div>
            )
        },
        {
            id: "countdown",
            name: "Countdown",
            description: "Com contador regressivo",
            mockup: (
                <div className="w-full h-20 bg-slate-900 rounded flex items-center justify-center gap-2 p-2">
                    <div className="text-center flex-1">
                        <div className="w-full h-2 bg-white/90 rounded mb-1" />
                        <div className="w-3/4 h-1 bg-white/50 rounded mx-auto" />
                    </div>
                    <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-5 h-7 bg-white/20 rounded flex items-center justify-center">
                                <div className="w-3 h-2 bg-white/80 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "cards",
            name: "Cards",
            description: "Múltiplas ofertas em cards",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-b from-amber-100 to-amber-200 rounded p-1 flex flex-col items-center justify-center">
                            <div className="w-full h-1.5 bg-amber-600/60 rounded mb-0.5" />
                            <div className="w-2/3 h-1 bg-amber-500/40 rounded" />
                        </div>
                    ))}
                </div>
            )
        }
    ],
    text: [
        {
            id: "default",
            name: "Padrão",
            description: "Texto centralizado",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-3 flex flex-col items-center justify-center">
                    <div className="w-1/2 h-2.5 bg-slate-700 rounded mb-2" />
                    <div className="w-full h-1.5 bg-slate-300 rounded mb-1" />
                    <div className="w-5/6 h-1.5 bg-slate-300 rounded mb-1" />
                    <div className="w-4/6 h-1.5 bg-slate-300 rounded" />
                </div>
            )
        },
        {
            id: "with-image",
            name: "Com Imagem",
            description: "Texto ao lado de imagem",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-2">
                    <div className="w-1/3 bg-slate-200 rounded" />
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="w-3/4 h-2 bg-slate-700 rounded mb-1.5" />
                        <div className="w-full h-1 bg-slate-300 rounded mb-0.5" />
                        <div className="w-5/6 h-1 bg-slate-300 rounded mb-0.5" />
                        <div className="w-4/6 h-1 bg-slate-300 rounded" />
                    </div>
                </div>
            )
        },
        {
            id: "quote",
            name: "Citação",
            description: "Destaque para depoimento",
            mockup: (
                <div className="w-full h-20 bg-slate-50 rounded p-3 flex flex-col items-center justify-center border-l-4 border-blue-500">
                    <div className="w-4 h-3 bg-blue-200 rounded mb-1 self-start" />
                    <div className="w-full h-1.5 bg-slate-400 rounded mb-1 italic" />
                    <div className="w-5/6 h-1.5 bg-slate-400 rounded mb-2" />
                    <div className="w-1/3 h-1 bg-slate-300 rounded self-end" />
                </div>
            )
        }
    ],
    columns: [
        {
            id: "2-cols",
            name: "2 Colunas",
            description: "Layout em duas colunas",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-2">
                    <div className="flex-1 bg-slate-100 rounded p-1">
                        <div className="w-full h-2 bg-slate-300 rounded mb-1" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded" />
                    </div>
                    <div className="flex-1 bg-slate-100 rounded p-1">
                        <div className="w-full h-2 bg-slate-300 rounded mb-1" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded" />
                    </div>
                </div>
            )
        },
        {
            id: "3-cols",
            name: "3 Colunas",
            description: "Layout em três colunas",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded p-1">
                            <div className="w-full h-2 bg-slate-300 rounded mb-1" />
                            <div className="w-3/4 h-1 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "4-cols",
            name: "4 Colunas",
            description: "Layout em quatro colunas",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded p-0.5">
                            <div className="w-full h-1.5 bg-slate-300 rounded mb-0.5" />
                            <div className="w-3/4 h-1 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "sidebar",
            name: "Com Sidebar",
            description: "Conteúdo principal + lateral",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex gap-2">
                    <div className="flex-1 bg-slate-100 rounded p-1">
                        <div className="w-full h-2 bg-slate-300 rounded mb-1" />
                        <div className="w-full h-1 bg-slate-200 rounded mb-0.5" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded" />
                    </div>
                    <div className="w-1/4 bg-slate-200 rounded p-1">
                        <div className="w-full h-1.5 bg-slate-400 rounded mb-1" />
                        <div className="w-full h-1 bg-slate-300 rounded" />
                    </div>
                </div>
            )
        }
    ]
};

export function SiteBlockSidebar({ onAddBlock, isOpen, onClose }: SiteBlockSidebarProps) {
    const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleBlockClick = (blockType: string, hasVariants: boolean) => {
        if (hasVariants && BLOCK_VARIANTS[blockType]) {
            setSelectedBlockType(blockType);
            setSelectedVariant(BLOCK_VARIANTS[blockType][0].id); // Default to first variant
        } else {
            // No variants, add directly
            onAddBlock(blockType as BlockType);
            onClose();
        }
    };

    const handleAddBlock = () => {
        if (selectedBlockType) {
            onAddBlock(selectedBlockType as BlockType, selectedVariant || undefined);
            setSelectedBlockType(null);
            setSelectedVariant(null);
            onClose();
        }
    };

    const handleBack = () => {
        setSelectedBlockType(null);
        setSelectedVariant(null);
    };

    const variants = selectedBlockType ? BLOCK_VARIANTS[selectedBlockType] : [];
    const currentBlock = AVAILABLE_BLOCKS.find(b => b.type === selectedBlockType);

    return (
        <div className="absolute inset-y-0 left-0 w-[300px] bg-white shadow-2xl z-50 border-r flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                {selectedBlockType ? (
                    <>
                        <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="font-bold text-slate-800">{currentBlock?.label}</span>
                        </button>
                    </>
                ) : (
                    <h3 className="font-bold text-slate-800">Adicionar Bloco</h3>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    &times;
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {selectedBlockType ? (
                    // Variant Picker
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 mb-4">Escolha um estilo para o bloco:</p>
                        {variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant.id)}
                                className={cn(
                                    "w-full p-3 rounded-xl border-2 transition-all text-left",
                                    selectedVariant === variant.id
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                {/* Visual Mockup */}
                                <div className="mb-2 relative">
                                    {variant.mockup}
                                    {selectedVariant === variant.id && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                {/* Label */}
                                <div className="font-semibold text-slate-800 text-sm">{variant.name}</div>
                                <div className="text-xs text-slate-500">{variant.description}</div>
                            </button>
                        ))}
                    </div>
                ) : (
                    // Block List
                    <div className="space-y-3">
                        {AVAILABLE_BLOCKS.map((block) => (
                            <button
                                key={block.type}
                                onClick={() => handleBlockClick(block.type, block.hasVariants)}
                                className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-200 group-hover:text-blue-700 text-slate-500">
                                    <block.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-800 text-sm">{block.label}</div>
                                    <div className="text-xs text-slate-500 leading-snug mt-1">{block.description}</div>
                                </div>
                                {block.hasVariants && (
                                    <div className="text-xs text-blue-500 self-center">
                                        {BLOCK_VARIANTS[block.type]?.length || 0} estilos
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Only show when variant is selected */}
            {selectedBlockType && (
                <div className="p-4 border-t bg-slate-50">
                    <Button onClick={handleAddBlock} className="w-full">
                        Adicionar Bloco
                    </Button>
                </div>
            )}
        </div>
    );
}
