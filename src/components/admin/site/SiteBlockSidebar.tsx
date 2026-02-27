"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Type, Image as ImageIcon, Layout, Code, ShoppingBag, MapPin, Instagram, Megaphone, ChevronLeft, Check,
    Calendar, QrCode, Bike, ClipboardList, Utensils, MessageCircle, Award, Star, FileText, Gift, Heart,
    RefreshCw, Scissors, Percent, Monitor, Users, MessageSquare, Truck, Sparkles, Tag, Newspaper
} from "lucide-react";
import { BlockType } from "@/types/page-builder";
import { cn } from "@/lib/utils";
import { getTestUserTools } from "@/lib/actions/tools";

interface SiteBlockSidebarProps {
    onAddBlock: (type: BlockType, variant?: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

// Mapping from tool slug to block type
const TOOL_SLUG_TO_BLOCK: Record<string, BlockType> = {
    "agendamentos-online": "tool-scheduling",
    "cardapio-digital": "tool-menu",
    "delivery-proprio": "tool-delivery",
    "reservas-mesas": "tool-reservations",
    "comandas-digitais": "tool-orders",
    "gestao-salao": "tool-salon",
    "catalogo-whatsapp": "tool-whatsapp-catalog",
    "orcamentos-online": "tool-quotes",
    "gift-cards": "tool-gift-cards",
    "lista-presentes": "tool-wishlist",
    "clube-assinaturas": "tool-subscriptions",
    "programa-fidelidade": "tool-loyalty",
    "cupons-promocoes": "tool-coupons",
    "vitrine-digital": "tool-digital-showcase",
    "prova-social": "tool-social-proof",
    "chat-online": "tool-chat",
    "rastreamento-pedidos": "tool-tracking",
};

// Icon mapping for tools
const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "agendamentos-online": Calendar,
    "cardapio-digital": QrCode,
    "delivery-proprio": Bike,
    "reservas-mesas": Utensils,
    "comandas-digitais": ClipboardList,
    "gestao-salao": Scissors,
    "catalogo-whatsapp": MessageCircle,
    "orcamentos-online": FileText,
    "gift-cards": Gift,
    "lista-presentes": Heart,
    "clube-assinaturas": RefreshCw,
    "programa-fidelidade": Award,
    "avaliacoes-reviews": Star,
    "cupons-promocoes": Percent,
    "vitrine-digital": Monitor,
    "prova-social": Users,
    "chat-online": MessageSquare,
    "rastreamento-pedidos": Truck,
};

// Block type definitions
const AVAILABLE_BLOCKS = [
    { type: "hero", label: "Banner / Hero", icon: ImageIcon, description: "Banner principal com texto e botão", hasVariants: true },
    { type: "product-grid", label: "Vitrine de Produtos", icon: ShoppingBag, description: "Lista automática de produtos", hasVariants: true },
    { type: "instagram", label: "Instagram Feed", icon: Instagram, description: "Mostre suas últimas fotos", hasVariants: true },
    { type: "map", label: "Mapa / Localização", icon: MapPin, description: "Google Maps e Endereço", hasVariants: false },
    { type: "promo", label: "Painel Promocional", icon: Megaphone, description: "Avisos, Ofertas e Countdowns", hasVariants: true },
    { type: "text", label: "Texto Rico", icon: Type, description: "Parágrafos, títulos e sobre a loja", hasVariants: true },
    { type: "html", label: "HTML Personalizado", icon: Code, description: "Código livre (Scripts, Iframes)", hasVariants: false },
    { type: "columns", label: "Colunas", icon: Layout, description: "Layout flexível", hasVariants: true },
    { type: "promo-banner", label: "Banner Promocional", icon: ImageIcon, description: "Banner full-width com imagem e texto", hasVariants: false },
    { type: "brands", label: "Marcas", icon: Tag, description: "Vitrine de marcas parceiras", hasVariants: true },
    { type: "blog-posts", label: "Blog / Posts", icon: Newspaper, description: "Últimas postagens e artigos", hasVariants: false },
    { type: "testimonials", label: "Depoimentos", icon: Star, description: "Reviews e avaliações de clientes", hasVariants: false }
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
        },
        {
            id: "showcase",
            name: "Showcase",
            description: "Cards com nome grande atrás do produto",
            mockup: (
                <div className="w-full h-20 bg-white rounded p-2 flex items-center gap-1 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded h-full flex items-center justify-center relative">
                            <div className="absolute text-[10px] font-black text-slate-200 uppercase">ABC</div>
                            <div className="w-6 h-5 bg-slate-300 rounded relative z-10" />
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
    ],
    brands: [
        {
            id: "default",
            name: "Logos / Texto",
            description: "Nomes das marcas em texto elegante",
            mockup: (
                <div className="w-full h-16 bg-slate-50 rounded flex items-center justify-center gap-4 px-4">
                    <div className="w-12 h-3 bg-slate-300 rounded" />
                    <div className="w-10 h-3 bg-slate-300 rounded" />
                    <div className="w-14 h-3 bg-slate-300 rounded" />
                    <div className="w-10 h-3 bg-slate-300 rounded" />
                </div>
            )
        },
        {
            id: "lifestyle",
            name: "Lifestyle",
            description: "Fotos com nome da marca em overlay",
            mockup: (
                <div className="w-full h-20 bg-white rounded flex gap-2 p-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-black/50 to-slate-200 rounded relative">
                            <div className="absolute bottom-1 left-1 w-8 h-1.5 bg-white/80 rounded" />
                        </div>
                    ))}
                </div>
            )
        }
    ]
};

type ActivatedTool = {
    id: string;
    toolId: string;
    isEnabled: boolean;
    tool: {
        id: string;
        slug: string;
        name: string;
        description: string;
        icon: string;
    };
};

export function SiteBlockSidebar({ onAddBlock, isOpen, onClose }: SiteBlockSidebarProps) {
    const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [activatedTools, setActivatedTools] = useState<ActivatedTool[]>([]);
    const [loadingTools, setLoadingTools] = useState(true);

    // Fetch activated tools
    useEffect(() => {
        async function loadActivatedTools() {
            try {
                const userTools = await getTestUserTools();
                setActivatedTools(userTools.filter(t => t.isEnabled));
            } catch (error) {
                console.error("Error loading tools:", error);
            } finally {
                setLoadingTools(false);
            }
        }
        loadActivatedTools();
    }, []);

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

                        {/* Ferramentas Section */}
                        {activatedTools.length > 0 && (
                            <>
                                <div className="pt-4 pb-2 border-t mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                        <span className="font-bold text-slate-800 text-sm">Ferramentas</span>
                                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                                            {activatedTools.length}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Ferramentas ativadas na sua loja
                                    </p>
                                </div>
                                {activatedTools.map((userTool) => {
                                    const blockType = TOOL_SLUG_TO_BLOCK[userTool.tool.slug];
                                    const IconComponent = TOOL_ICONS[userTool.tool.slug] || Sparkles;

                                    if (!blockType) return null;

                                    return (
                                        <button
                                            key={userTool.id}
                                            onClick={() => {
                                                onAddBlock(blockType);
                                                onClose();
                                            }}
                                            className="w-full flex items-start gap-4 p-4 rounded-xl border border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group bg-gradient-to-r from-purple-50/50 to-blue-50/50"
                                        >
                                            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 text-purple-600">
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-800 text-sm">{userTool.tool.name}</div>
                                                <div className="text-xs text-slate-500 leading-snug mt-1 line-clamp-2">{userTool.tool.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {loadingTools && (
                            <div className="pt-4 border-t mt-4 text-center text-slate-400 text-sm">
                                Carregando ferramentas...
                            </div>
                        )}
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
