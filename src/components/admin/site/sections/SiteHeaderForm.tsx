"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutTemplate, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";
import { Input } from "@/components/ui/input";
import { reorderMenuItems } from "@/lib/actions/menu-reorder";
import { cn } from "@/lib/utils";

const initialState = { success: false, message: "" };

interface SiteHeaderFormProps {
    config: any;
    onConfigChange?: (key: string, value: any) => void;
    menus?: any[];
    onHighlightComponent?: (component: string) => void;
    focusField?: { field: string; timestamp: number } | null;
}

export function SiteHeaderForm({ config, onConfigChange, menus = [], onHighlightComponent, focusField }: SiteHeaderFormProps) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [isReordering, startReorder] = useTransition();
    const [hasHighlighted, setHasHighlighted] = useState(false);

    // Refs for input fields to enable scroll-to-field
    const headerTextRef = useRef<HTMLInputElement>(null);
    const headerSubtextRef = useRef<HTMLInputElement>(null);
    const headerLogoWidthRef = useRef<HTMLInputElement>(null);
    const headerSearchPlaceholderRef = useRef<HTMLInputElement>(null);
    const menuLinksRef = useRef<HTMLDivElement>(null);
    const menuColorRef = useRef<HTMLDivElement>(null);
    const cartCountBgRef = useRef<HTMLDivElement>(null);

    // Scroll to and flash field when focusField changes
    useEffect(() => {
        if (!focusField?.field) return;

        console.log('[SiteHeaderForm] Focus field changed:', focusField.field, 'timestamp:', focusField.timestamp);

        const getTargetElement = (): HTMLElement | null => {
            switch (focusField.field) {
                case 'headerText': return headerTextRef.current;
                case 'headerSubtext': return headerSubtextRef.current;
                case 'headerLogoWidth': return headerLogoWidthRef.current;
                case 'headerSearchPlaceholder': return headerSearchPlaceholderRef.current;
                case 'menuLinks': return menuLinksRef.current;
                case 'menuColor': return menuColorRef.current;
                case 'cartCountBg': return cartCountBgRef.current;
                default: return null;
            }
        };

        const scrollToField = (retryCount = 0) => {
            const targetElement = getTargetElement();

            console.log('[SiteHeaderForm] Target element (attempt', retryCount + 1, '):', targetElement);

            if (!targetElement) {
                // Retry up to 5 times with increasing delays if element not found
                if (retryCount < 5) {
                    console.log('[SiteHeaderForm] Element not found, retrying...');
                    setTimeout(() => scrollToField(retryCount + 1), 100 * (retryCount + 1));
                }
                return;
            }

            // Ensure element is in view
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Flash 2 times with very visible effect using inline styles
            const flash = () => {
                targetElement.style.outline = '3px solid #3b82f6';
                targetElement.style.outlineOffset = '3px';
                targetElement.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
                targetElement.style.borderRadius = '8px';
                targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            };
            const unflash = () => {
                targetElement.style.outline = '';
                targetElement.style.outlineOffset = '';
                targetElement.style.boxShadow = '';
                targetElement.style.backgroundColor = '';
            };

            // Execute flash animation
            flash();
            setTimeout(() => {
                unflash();
                setTimeout(() => {
                    flash();
                    setTimeout(unflash, 300);
                }, 150);
            }, 300);

            // Focus input if applicable
            if ('focus' in targetElement && typeof targetElement.focus === 'function') {
                setTimeout(() => (targetElement as HTMLElement).focus(), 100);
            }
        };

        // Use requestAnimationFrame to ensure DOM is ready, then add small delay
        requestAnimationFrame(() => {
            setTimeout(() => scrollToField(0), 150);
        });
    }, [focusField]);

    const handleFocus = () => {
        if (!hasHighlighted) {
            onHighlightComponent?.("header");
            setHasHighlighted(true);
        }
    };

    // Find the header menu (usually the first one or one with handle "main")
    const headerMenu = menus.find(m => m.handle === "main" || m.handle === "header") || menus[0];

    // Local state for menu items to enable reordering
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        if (headerMenu?.items) {
            // Sort by order field if exists
            const sorted = [...headerMenu.items].sort((a, b) => (a.order || 0) - (b.order || 0));
            setMenuItems(sorted);
        }
    }, [headerMenu?.items]);

    const saveOrder = (newItems: any[]) => {
        if (!headerMenu?.id) return;

        startReorder(async () => {
            const orderedIds = newItems.map(item => item.id);
            await reorderMenuItems(headerMenu.id, orderedIds);
        });
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= menuItems.length) return;

        const newItems = [...menuItems];
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        setMenuItems(newItems);
        saveOrder(newItems);
    };

    return (
        <Card onFocus={handleFocus}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" /> Cabeçalho
                </CardTitle>
                <CardDescription>Configurações do topo do site: logo, menu, busca e carrinho.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">

                    <div className="grid grid-cols-1 gap-6 p-4 border rounded-xl bg-slate-50/50">
                        {/* Branding */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                Identidade do Cabeçalho
                            </Label>
                            <div className="grid gap-3 p-3 bg-white rounded-lg border shadow-sm">
                                <div className="flex items-center justify-between">
                                    <Label className="cursor-pointer" htmlFor="headerShowLogo">Exibir Logo (Imagem)</Label>
                                    <input
                                        id="headerShowLogo"
                                        type="checkbox"
                                        name="headerShowLogo"
                                        defaultChecked={config.headerShowLogo !== false}
                                        value="true"
                                        className="h-4 w-4"
                                        onChange={(e) => onConfigChange?.("headerShowLogo", e.target.checked)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Largura do Logo (px)</Label>
                                    <Input
                                        ref={headerLogoWidthRef}
                                        name="headerLogoWidth"
                                        type="number"
                                        min={20}
                                        max={80}
                                        value={Math.min(80, Math.max(20, config.headerLogoWidth || 55))}
                                        onChange={(e) => onConfigChange?.("headerLogoWidth", Math.min(80, Math.max(20, parseInt(e.target.value) || 55)))}
                                        className="transition-all rounded"
                                    />
                                    <input type="range" min={20} max={80} value={Math.min(80, Math.max(20, config.headerLogoWidth || 55))} onChange={(e) => onConfigChange?.("headerLogoWidth", parseInt(e.target.value))} className="w-full h-1.5 accent-blue-600 cursor-pointer" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Texto Alternativo (Se logo oculto)</Label>
                                    <Input
                                        ref={headerTextRef}
                                        name="headerText"
                                        defaultValue={config.headerText || ""}
                                        placeholder="Ex: Minha Loja"
                                        onChange={(e) => onConfigChange?.("headerText", e.target.value)}
                                        className="transition-all rounded"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Subtítulo (Abaixo do Logo/Texto)</Label>
                                    <Input
                                        ref={headerSubtextRef}
                                        name="headerSubtext"
                                        defaultValue={config.headerSubtext || ""}
                                        placeholder="Ex: Cosméticos & Makes"
                                        onChange={(e) => onConfigChange?.("headerSubtext", e.target.value)}
                                        className="transition-all rounded"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Placeholder da Busca</Label>
                                    <Input
                                        ref={headerSearchPlaceholderRef}
                                        name="headerSearchPlaceholder"
                                        defaultValue={config.headerSearchPlaceholder || ""}
                                        placeholder="Ex: O que você procura?"
                                        onChange={(e) => onConfigChange?.("headerSearchPlaceholder", e.target.value)}
                                        className="transition-all rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cores Principais */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                                Cores Principais
                            </Label>
                            <div className="grid gap-3 p-3 bg-white rounded-lg border shadow-sm">
                                <ColorPickerInput
                                    id="headerColor"
                                    label="Cor de Fundo"
                                    value={config.headerColor || "#ffffff"}
                                    onChange={(val) => onConfigChange?.("headerColor", val)}
                                />
                                <div ref={menuColorRef} className="transition-all rounded">
                                    <ColorPickerInput
                                        id="menuColor"
                                        label="Cor dos Textos / Ícones"
                                        value={config.menuColor || "#334155"}
                                        onChange={(val) => onConfigChange?.("menuColor", val)}
                                    />
                                </div>
                                <div className="border-t my-2 pt-2">
                                    <Label className="text-xs text-slate-500 mb-2 block">Links do Menu</Label>
                                    <div className="grid gap-2">
                                        <ColorPickerInput
                                            id="menuLinkColor"
                                            label="Cor do Link"
                                            value={(config as any).menuLinkColor || config.menuColor || "#334155"}
                                            onChange={(val) => onConfigChange?.("menuLinkColor", val)}
                                        />
                                        <ColorPickerInput
                                            id="menuLinkHoverColor"
                                            label="Cor do Link (Hover)"
                                            value={(config as any).menuLinkHoverColor || config.themeColor || "#db2777"}
                                            onChange={(val) => onConfigChange?.("menuLinkHoverColor", val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Links Preview & Edit */}
                        <div className="space-y-3" ref={menuLinksRef}>
                            <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                Links do Menu
                            </Label>
                            <div className="grid gap-3 p-3 bg-white rounded-lg border shadow-sm transition-all rounded">
                                {headerMenu && menuItems.length > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                                            <span>Menu atual: <span className="font-semibold">{headerMenu.title}</span></span>
                                            {isReordering && <span className="text-blue-500 animate-pulse">Salvando...</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mb-1">
                                            Use as setas para reordenar os itens
                                        </div>
                                        <div className="space-y-1 max-h-64 overflow-y-auto">
                                            {menuItems.map((item: any, index: number) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded border text-xs group hover:bg-slate-100 transition-colors"
                                                >
                                                    <span className="font-mono text-slate-400 w-5">{index + 1}.</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-slate-700 truncate">{item.label}</div>
                                                        <div className="text-slate-500 truncate">{item.url}</div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            disabled={index === 0 || isReordering}
                                                            onClick={() => moveItem(index, 'up')}
                                                        >
                                                            <ChevronUp className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            disabled={index === menuItems.length - 1 || isReordering}
                                                            onClick={() => moveItem(index, 'down')}
                                                        >
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/admin/menus/${headerMenu.id}`, "_blank")}
                                            className="w-full mt-2 gap-2"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Editar Links do Menu
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-slate-500 mb-3">
                                            Nenhum menu configurado ainda
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open("/admin/menus", "_blank")}
                                        >
                                            Criar Primeiro Menu
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar Cabeçalho"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
