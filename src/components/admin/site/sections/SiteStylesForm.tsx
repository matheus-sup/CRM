"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Search, ShoppingCart, User, Mail, CreditCard, MapPin, Phone } from "lucide-react";
import {
    StyleVariantPicker,
    HeaderClassicPreview,
    HeaderCenteredPreview,
    HeaderMinimalPreview,
    CardStandardPreview,
    CardCompactPreview,
    CardDetailedPreview,
    CardHorizontalPreview,
    FooterFullPreview,
    FooterMinimalPreview,
    FooterModernPreview,
    HeroDefaultPreview,
    HeroMinimalPreview,
    HeroSplitPreview,
    CategoriesGridPreview,
    CategoriesHorizontalPreview,
    CategoriesCircularPreview,
    NewsletterFullPreview,
    NewsletterCompactPreview,
    NewsletterSplitPreview
} from "../StyleVariantPicker";

interface SiteStylesFormProps {
    config: any;
    onConfigChange?: (key: string, value: any) => void;
    onHighlightComponent?: (componentType: string) => void;
}

// Default variants for each block type
const defaultVariants: Record<string, string> = {
    hero: "default",
    newsletter: "full",
    categories: "grid"
};

// Helper to get block variant from homeLayout (reads from styles.variant)
function getBlockVariant(homeLayout: string | undefined, blockType: string): string {
    try {
        const blocks = JSON.parse(homeLayout || "[]");
        const block = blocks.find((b: any) => b.type === blockType);
        return block?.styles?.variant || defaultVariants[blockType] || "default";
    } catch {
        return defaultVariants[blockType] || "default";
    }
}

// Helper to update block variant in homeLayout (updates styles.variant)
function updateBlockVariant(homeLayout: string | undefined, blockType: string, variant: string): string {
    try {
        const blocks = JSON.parse(homeLayout || "[]");
        const updatedBlocks = blocks.map((block: any) => {
            if (block.type === blockType) {
                return {
                    ...block,
                    styles: {
                        ...block.styles,
                        variant
                    }
                };
            }
            return block;
        });
        return JSON.stringify(updatedBlocks);
    } catch {
        return homeLayout || "[]";
    }
}

// Header style options
const headerOptions = [
    {
        id: "classic",
        name: "Clássico",
        description: "Logo à esquerda, busca no centro, menu abaixo do header",
        preview: <HeaderClassicPreview />
    },
    {
        id: "centered",
        name: "Centralizado",
        description: "Logo grande centralizada, menu no topo com ícones",
        preview: <HeaderCenteredPreview />
    },
    {
        id: "minimal",
        name: "Minimalista",
        description: "Compacto em linha única, menu inline, sem busca visível",
        preview: <HeaderMinimalPreview />
    }
];

// Card style options
const cardOptions = [
    {
        id: "standard",
        name: "Padrão",
        description: "Card completo com badges de desconto e botão ao hover",
        preview: <CardStandardPreview />
    },
    {
        id: "compact",
        name: "Compacto",
        description: "Limpo e minimalista, sem badges ou botões extras",
        preview: <CardCompactPreview />
    },
    {
        id: "detailed",
        name: "Detalhado",
        description: "Exibe categoria, avaliações e botão sempre visível",
        preview: <CardDetailedPreview />
    },
    {
        id: "horizontal",
        name: "Horizontal",
        description: "Layout lado a lado, ideal para listas e carrinhos",
        preview: <CardHorizontalPreview />
    }
];

// Footer style options
const footerOptions = [
    {
        id: "full",
        name: "Completo",
        description: "4 colunas com newsletter, menus e formas de pagamento",
        preview: <FooterFullPreview />
    },
    {
        id: "minimal",
        name: "Minimalista",
        description: "Linha única com logo, links básicos e redes sociais",
        preview: <FooterMinimalPreview />
    },
    {
        id: "modern",
        name: "Moderno",
        description: "2 colunas com destaque para newsletter e redes sociais",
        preview: <FooterModernPreview />
    }
];

// Hero block style options
const heroOptions = [
    {
        id: "default",
        name: "Padrão",
        description: "Banner centralizado com texto sobreposto e carrossel",
        preview: <HeroDefaultPreview />
    },
    {
        id: "minimal",
        name: "Minimalista",
        description: "Fundo clean com texto alinhado à esquerda",
        preview: <HeroMinimalPreview />
    },
    {
        id: "split",
        name: "Dividido",
        description: "Layout 50/50 com texto de um lado e imagem do outro",
        preview: <HeroSplitPreview />
    }
];

// Categories block style options
const categoriesOptions = [
    {
        id: "grid",
        name: "Grid Assimétrico",
        description: "Layout bento box com categoria destaque maior",
        preview: <CategoriesGridPreview />
    },
    {
        id: "horizontal",
        name: "Carrossel",
        description: "Scroll horizontal com cards retangulares",
        preview: <CategoriesHorizontalPreview />
    },
    {
        id: "circular",
        name: "Circular",
        description: "Ícones circulares com bordas destacadas",
        preview: <CategoriesCircularPreview />
    }
];

// Newsletter block style options
const newsletterOptions = [
    {
        id: "full",
        name: "Completo",
        description: "Centralizado com ícone, título e descrição",
        preview: <NewsletterFullPreview />
    },
    {
        id: "compact",
        name: "Compacto",
        description: "Uma linha com texto à esquerda e campo à direita",
        preview: <NewsletterCompactPreview />
    },
    {
        id: "split",
        name: "Dividido",
        description: "Layout 50/50 com texto e formulário separados",
        preview: <NewsletterSplitPreview />
    }
];

// Toggle item component
function VisibilityToggle({
    icon: Icon,
    label,
    description,
    checked,
    onChange
}: {
    icon: any;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                    <div className="font-medium text-sm text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

export function SiteStylesForm({ config, onConfigChange, onHighlightComponent }: SiteStylesFormProps) {
    const handleChange = (key: string, value: string, componentType: string) => {
        onConfigChange?.(key, value);
        onHighlightComponent?.(componentType);
    };

    const handleVisibilityChange = (key: string, value: boolean, componentType?: string) => {
        onConfigChange?.(key, value);
        if (componentType) {
            onHighlightComponent?.(componentType);
        }
    };

    const handleBlockVariantChange = (blockType: string, variant: string) => {
        const updatedLayout = updateBlockVariant(config?.homeLayout, blockType, variant);
        onConfigChange?.("homeLayout", updatedLayout);
        onHighlightComponent?.(blockType);
    };

    // Check if blocks exist in homeLayout
    const hasBlock = (blockType: string): boolean => {
        try {
            const blocks = JSON.parse(config?.homeLayout || "[]");
            return blocks.some((b: any) => b.type === blockType);
        } catch {
            return false;
        }
    };

    // Helper to get boolean value with default true
    const isVisible = (key: string, defaultValue = true): boolean => {
        if (config?.[key] === undefined || config?.[key] === null) return defaultValue;
        return config[key] === true || config[key] === "true";
    };

    return (
        <div className="space-y-10">
            {/* Intro */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-semibold text-slate-800 mb-1">Personalize os Componentes</h3>
                <p className="text-sm text-slate-600">
                    Escolha o estilo visual e visibilidade de cada parte do seu site. As mudanças aparecem instantaneamente no preview.
                </p>
            </div>

            {/* ========== VISIBILITY SECTION ========== */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="h-5 w-5" /> Visibilidade
                </h3>
                <p className="text-sm text-slate-500">Escolha quais elementos exibir ou ocultar no seu site</p>
            </div>

            {/* Header Visibility */}
            <section className="space-y-3">
                <Label className="text-base font-semibold text-slate-800">Cabeçalho</Label>
                <div className="space-y-2">
                    <VisibilityToggle
                        icon={Search}
                        label="Barra de Pesquisa"
                        description="Campo de busca de produtos no header"
                        checked={isVisible("showHeaderSearch")}
                        onChange={(v) => handleVisibilityChange("showHeaderSearch", v, "header")}
                    />
                    <VisibilityToggle
                        icon={ShoppingCart}
                        label="Ícone do Carrinho"
                        description="Ícone do carrinho com contador de itens"
                        checked={isVisible("showHeaderCart")}
                        onChange={(v) => handleVisibilityChange("showHeaderCart", v, "header")}
                    />
                    <VisibilityToggle
                        icon={User}
                        label="Ícone de Conta"
                        description="Ícone de login/minha conta"
                        checked={isVisible("showHeaderAccount")}
                        onChange={(v) => handleVisibilityChange("showHeaderAccount", v, "header")}
                    />
                </div>
            </section>

            {/* Footer Visibility */}
            <section className="space-y-3">
                <Label className="text-base font-semibold text-slate-800">Rodapé</Label>
                <div className="space-y-2">
                    <VisibilityToggle
                        icon={Mail}
                        label="Newsletter no Rodapé"
                        description="Seção de inscrição na newsletter"
                        checked={isVisible("showFooterNewsletter")}
                        onChange={(v) => handleVisibilityChange("showFooterNewsletter", v, "footer")}
                    />
                    <VisibilityToggle
                        icon={CreditCard}
                        label="Formas de Pagamento"
                        description="Ícones de cartões e métodos de pagamento"
                        checked={isVisible("showFooterPayments")}
                        onChange={(v) => handleVisibilityChange("showFooterPayments", v, "footer")}
                    />
                    <VisibilityToggle
                        icon={Phone}
                        label="Informações de Contato"
                        description="Telefone, email e endereço no rodapé"
                        checked={isVisible("showFooterContact")}
                        onChange={(v) => handleVisibilityChange("showFooterContact", v, "footer")}
                    />
                    <VisibilityToggle
                        icon={MapPin}
                        label="Redes Sociais"
                        description="Links para redes sociais"
                        checked={isVisible("showFooterSocial")}
                        onChange={(v) => handleVisibilityChange("showFooterSocial", v, "footer")}
                    />
                </div>
            </section>

            <div className="border-t pt-6" />

            {/* ========== GLOBAL STYLES ========== */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Estilos Globais</h3>
                <p className="text-sm text-slate-500">Estes estilos são aplicados em todas as páginas do site</p>
            </div>

            {/* Header Style */}
            <section className="space-y-4">
                <div>
                    <Label className="text-base font-semibold text-slate-800">Estilo do Cabeçalho</Label>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Define a aparência do header em todas as páginas
                    </p>
                </div>
                <StyleVariantPicker
                    options={headerOptions}
                    value={config?.headerStyle || "classic"}
                    onChange={(value) => handleChange("headerStyle", value, "header")}
                    columns={3}
                />
            </section>

            {/* Card Style */}
            <section className="space-y-4">
                <div>
                    <Label className="text-base font-semibold text-slate-800">Estilo do Card de Produto</Label>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Define como os produtos são exibidos nas grades e vitrines
                    </p>
                </div>
                <StyleVariantPicker
                    options={cardOptions}
                    value={config?.cardStyle || "standard"}
                    onChange={(value) => handleChange("cardStyle", value, "product-grid")}
                    columns={4}
                />
            </section>

            {/* Footer Style */}
            <section className="space-y-4">
                <div>
                    <Label className="text-base font-semibold text-slate-800">Estilo do Rodapé</Label>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Define a aparência do footer em todas as páginas
                    </p>
                </div>
                <StyleVariantPicker
                    options={footerOptions}
                    value={config?.footerStyle || "full"}
                    onChange={(value) => handleChange("footerStyle", value, "footer")}
                    columns={3}
                />
            </section>

            {/* ========== BLOCK STYLES ========== */}
            <div className="pt-6 border-t">
                <div className="space-y-1 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Estilos dos Blocos da Home</h3>
                    <p className="text-sm text-slate-500">Personalize a variante de cada bloco presente na página inicial</p>
                </div>
            </div>

            {/* Hero Block Style */}
            {hasBlock("hero") && (
                <section className="space-y-4">
                    <div>
                        <Label className="text-base font-semibold text-slate-800">Banner Hero</Label>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Define o layout do banner principal da home
                        </p>
                    </div>
                    <StyleVariantPicker
                        options={heroOptions}
                        value={getBlockVariant(config?.homeLayout, "hero")}
                        onChange={(value) => handleBlockVariantChange("hero", value)}
                        columns={3}
                    />
                </section>
            )}

            {/* Categories Block Style */}
            {hasBlock("categories") && (
                <section className="space-y-4">
                    <div>
                        <Label className="text-base font-semibold text-slate-800">Categorias</Label>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Define como as categorias são exibidas na home
                        </p>
                    </div>
                    <StyleVariantPicker
                        options={categoriesOptions}
                        value={getBlockVariant(config?.homeLayout, "categories")}
                        onChange={(value) => handleBlockVariantChange("categories", value)}
                        columns={3}
                    />
                </section>
            )}

            {/* Newsletter Block Style */}
            {hasBlock("newsletter") && (
                <section className="space-y-4">
                    <div>
                        <Label className="text-base font-semibold text-slate-800">Newsletter</Label>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Define o layout da seção de newsletter
                        </p>
                    </div>
                    <StyleVariantPicker
                        options={newsletterOptions}
                        value={getBlockVariant(config?.homeLayout, "newsletter")}
                        onChange={(value) => handleBlockVariantChange("newsletter", value)}
                        columns={3}
                    />
                </section>
            )}

            {/* Message when no blocks */}
            {!hasBlock("hero") && !hasBlock("categories") && !hasBlock("newsletter") && (
                <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300 text-center">
                    <p className="text-slate-500 text-sm">
                        Nenhum bloco personalizável encontrado na home. Adicione blocos de Hero, Categorias ou Newsletter na seção "Home" para personalizar seus estilos.
                    </p>
                </div>
            )}

            {/* Tips */}
            <div className="bg-slate-50 rounded-xl p-4 border">
                <h4 className="font-medium text-slate-700 mb-2">Dicas de Combinação</h4>
                <ul className="text-sm text-slate-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>Look Premium:</strong> Header Centralizado + Card Detalhado + Footer Completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>Look Moderno:</strong> Header Minimalista + Card Compacto + Footer Minimalista</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span><strong>Look Equilibrado:</strong> Header Clássico + Card Padrão + Footer Moderno</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
