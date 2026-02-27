"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Palette, LayoutGrid, ChevronDown, ChevronUp, Info } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";
import { cn } from "@/lib/utils";

function InfoTip({ text }: { text: string }) {
    return (
        <span className="relative group/info inline-flex ml-1.5 cursor-help">
            <Info className="h-3.5 w-3.5 text-slate-400 group-hover/info:text-blue-500 transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 text-xs text-white bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed">
                {text}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
            </span>
        </span>
    );
}

export function SiteProductDetailForm({ config, onConfigChange }: { config: any; onConfigChange?: (key: string, value: any) => void }) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        visibility: true,
        colors: false,
        layout: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const ToggleItem = ({ id, label, description, checked }: any) => (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md transition-colors ${checked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {checked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div className="space-y-0.5">
                    <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
            <Switch
                id={id}
                checked={checked !== false}
                onCheckedChange={(c: boolean) => {
                    onConfigChange?.(id, c);
                }}
            />
        </div>
    );

    const SectionHeader = ({ id, icon: Icon, title, expanded }: { id: string; icon: any; title: string; expanded: boolean }) => (
        <button
            type="button"
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-sm">{title}</span>
            </div>
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-2">
                Personalize a aparência e os elementos da página de produto. As alterações são refletidas em tempo real no preview.
            </div>

            {/* Seção: Visibilidade dos Elementos */}
            <div className="space-y-2">
                <SectionHeader id="visibility" icon={Eye} title="Visibilidade dos Elementos" expanded={expandedSections.visibility} />
                {expandedSections.visibility && (
                    <div className="space-y-2 pt-2">
                        <ToggleItem
                            id="showProductSold"
                            label="Produtos vendidos"
                            description="Mostrar contador de vendas recentes"
                            checked={config?.showProductSold}
                        />
                        <ToggleItem
                            id="showPromoPrice"
                            label="Preço promocional"
                            description="Destacar preço 'De/Por'"
                            checked={config?.showPromoPrice}
                        />
                        <ToggleItem
                            id="showDiscountPayment"
                            label="Desconto por meio de pagamento"
                            description="Ex: '5% de desconto no Pix'"
                            checked={config?.showDiscountPayment}
                        />
                        <ToggleItem
                            id="showInstallmentsDetail"
                            label="Informações das parcelas"
                            description="Tabela de parcelamento detalhada"
                            checked={config?.showInstallmentsDetail}
                        />
                        <ToggleItem
                            id="showVariations"
                            label="Variações do produto"
                            description="Seletor de cor, tamanho, etc."
                            checked={config?.showVariations}
                        />
                        <ToggleItem
                            id="showMeasurements"
                            label="Guia de medidas"
                            description="Botão para tabela de medidas"
                            checked={config?.showMeasurements}
                        />
                        <ToggleItem
                            id="showSKU"
                            label="SKU"
                            description="Código de referência do produto"
                            checked={config?.showSKU}
                        />
                        <ToggleItem
                            id="showStockQuantity"
                            label="Estoque"
                            description="Mostrar quantidade disponível"
                            checked={config?.showStockQuantity}
                        />
                        <ToggleItem
                            id="showShippingSimulator"
                            label="Formas de entrega"
                            description="Calculadora de frete na página"
                            checked={config?.showShippingSimulator}
                        />
                        <ToggleItem
                            id="showBuyInfo"
                            label="Informação de compra"
                            description="Texto sobre segurança e garantias"
                            checked={config?.showBuyInfo}
                        />
                        <ToggleItem
                            id="showRelatedProducts"
                            label="Produtos relacionados"
                            description="Carrossel 'Quem viu também comprou'"
                            checked={config?.showRelatedProducts}
                        />
                    </div>
                )}
            </div>

            {/* Seção: Cores */}
            <div className="space-y-2">
                <SectionHeader id="colors" icon={Palette} title="Cores e Estilos" expanded={expandedSections.colors} />
                {expandedSections.colors && (
                    <div className="space-y-4 pt-2 p-3 border rounded-lg">
                        <ColorPickerInput
                            id="productPriceColor"
                            label="Cor do Preço"
                            description="Cor principal do preço do produto"
                            value={config?.productPriceColor || config?.priceColor || "#6366f1"}
                            onChange={(v) => onConfigChange?.("productPriceColor", v)}
                        />
                        <ColorPickerInput
                            id="productBtnBg"
                            label="Botão - Fundo"
                            description="Cor de fundo do botão Adicionar ao Carrinho"
                            value={config?.productBtnBg || config?.themeColor || "#6366f1"}
                            onChange={(v) => onConfigChange?.("productBtnBg", v)}
                        />
                        <ColorPickerInput
                            id="productBtnText"
                            label="Botão - Texto"
                            description="Cor do texto do botão"
                            value={config?.productBtnText || "#ffffff"}
                            onChange={(v) => onConfigChange?.("productBtnText", v)}
                        />
                        <ColorPickerInput
                            id="productBrandColor"
                            label="Cor da Marca"
                            description="Cor do nome da marca do produto"
                            value={config?.productBrandColor || config?.themeColor || "#6366f1"}
                            onChange={(v) => onConfigChange?.("productBrandColor", v)}
                        />
                        <ColorPickerInput
                            id="productDiscountBadgeBg"
                            label="Badge de Desconto - Fundo"
                            description="Cor de fundo do badge de desconto"
                            value={config?.productDiscountBadgeBg || "#22c55e"}
                            onChange={(v) => onConfigChange?.("productDiscountBadgeBg", v)}
                        />
                        <ColorPickerInput
                            id="productDiscountBadgeText"
                            label="Badge de Desconto - Texto"
                            description="Cor do texto do badge de desconto"
                            value={config?.productDiscountBadgeText || "#ffffff"}
                            onChange={(v) => onConfigChange?.("productDiscountBadgeText", v)}
                        />
                        <ColorPickerInput
                            id="productStockBadgeBg"
                            label="Badge de Estoque - Fundo"
                            description="Cor de fundo do badge 'Em Estoque'"
                            value={config?.productStockBadgeBg || "#dcfce7"}
                            onChange={(v) => onConfigChange?.("productStockBadgeBg", v)}
                        />
                        <ColorPickerInput
                            id="productStockBadgeText"
                            label="Badge de Estoque - Texto"
                            description="Cor do texto do badge 'Em Estoque'"
                            value={config?.productStockBadgeText || "#16a34a"}
                            onChange={(v) => onConfigChange?.("productStockBadgeText", v)}
                        />
                        <ColorPickerInput
                            id="productInfoBg"
                            label="Informações - Fundo"
                            description="Cor de fundo da seção de informações (Compra Segura, etc)"
                            value={config?.productInfoBg || "#f8fafc"}
                            onChange={(v) => onConfigChange?.("productInfoBg", v)}
                        />
                        <ColorPickerInput
                            id="productIconColor"
                            label="Cor dos Ícones"
                            description="Cor dos ícones de informação"
                            value={config?.productIconColor || config?.themeColor || "#6366f1"}
                            onChange={(v) => onConfigChange?.("productIconColor", v)}
                        />
                    </div>
                )}
            </div>

            {/* Seção: Layout */}
            <div className="space-y-2">
                <SectionHeader id="layout" icon={LayoutGrid} title="Layout e Disposição" expanded={expandedSections.layout} />
                {expandedSections.layout && (
                    <div className="space-y-4 pt-2 p-3 border rounded-lg">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center">
                                Layout da Galeria
                                <InfoTip text="Galeria ao Lado: miniaturas à esquerda — ideal para fotos quadradas (1:1). Galeria Abaixo: miniaturas embaixo — versátil para qualquer proporção. Grid: todas as fotos visíveis — bom para poucos itens (3-6 fotos). Navegação por Pontos: visual clean e minimalista com indicadores — recomendado para óticas, joias e moda. Use fotos com fundo neutro para melhor resultado." />
                            </Label>
                            <Select
                                value={config?.productGalleryLayout || "side"}
                                onValueChange={(v) => onConfigChange?.("productGalleryLayout", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o layout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="side">Galeria ao Lado</SelectItem>
                                    <SelectItem value="bottom">Galeria Abaixo</SelectItem>
                                    <SelectItem value="grid">Galeria em Grid</SelectItem>
                                    <SelectItem value="dots">Navegação por Pontos</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Como as miniaturas são exibidas em relação à imagem principal</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center">
                                Estilo do Botão
                                <InfoTip text="Arredondado: cantos suavizados, visual equilibrado — funciona para a maioria das lojas. Pílula: cantos totalmente arredondados, visual moderno e amigável — ideal para moda, cosméticos e lifestyle. Quadrado: cantos retos, visual sóbrio e profissional — recomendado para eletrônicos, ferramentas e B2B." />
                            </Label>
                            <Select
                                value={config?.productBtnStyle || "rounded"}
                                onValueChange={(v) => onConfigChange?.("productBtnStyle", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estilo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rounded">Arredondado</SelectItem>
                                    <SelectItem value="pill">Pílula (Muito arredondado)</SelectItem>
                                    <SelectItem value="square">Quadrado</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Formato dos cantos do botão</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center">
                                Tamanho do Botão
                                <InfoTip text="Pequeno: discreto e compacto — bom quando há muitas ações na página. Médio: equilíbrio entre visibilidade e espaço — uso geral. Grande: botão chamativo e fácil de clicar — recomendado para lojas mobile-first e quando o botão de compra é a ação principal." />
                            </Label>
                            <Select
                                value={config?.productBtnSize || "large"}
                                onValueChange={(v) => onConfigChange?.("productBtnSize", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tamanho" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Pequeno</SelectItem>
                                    <SelectItem value="medium">Médio</SelectItem>
                                    <SelectItem value="large">Grande</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Altura do botão Adicionar ao Carrinho</p>
                        </div>

                        <ToggleItem
                            id="productShowBreadcrumb"
                            label="Mostrar Breadcrumb"
                            description="Exibir navegação de categorias no topo"
                            checked={config?.productShowBreadcrumb !== false}
                        />

                        <ToggleItem
                            id="productStickyCart"
                            label="Botão Fixo no Mobile"
                            description="Manter botão de compra fixo na tela em dispositivos móveis"
                            checked={config?.productStickyCart !== false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
