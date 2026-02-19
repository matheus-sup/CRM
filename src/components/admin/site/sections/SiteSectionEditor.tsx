"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Type, Palette, Layout, List, Check } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";
import { cn } from "@/lib/utils";

interface SectionSettings {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    // Add more granular controls as needed
    paddingTop?: string;
    paddingBottom?: string;
    // Product List specific
    selectionMode?: "auto" | "manual";
    productIds?: string[];
}

interface SiteSectionEditorProps {
    sectionId: string;
    currentLabel: string;
    settings: SectionSettings;
    onSave: (newSettings: SectionSettings) => void;
    onBack: () => void;
    allProducts?: any[]; // Passed from layout
}

export function SiteSectionEditor({ sectionId, currentLabel, settings: initialSettings, onSave, onBack, allProducts = [] }: SiteSectionEditorProps) {
    const [settings, setSettings] = useState<SectionSettings>(initialSettings || {});

    const handleChange = (key: keyof SectionSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleProduct = (productId: string) => {
        const currentIds = settings.productIds || [];
        if (currentIds.includes(productId)) {
            handleChange("productIds", currentIds.filter(id => id !== productId));
        } else {
            handleChange("productIds", [...currentIds, productId]);
        }
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3 text-slate-500">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </Button>
                </div>
                <CardTitle className="text-xl">Editar {currentLabel}</CardTitle>
                <CardDescription>Personalize o visual desta seção.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">

                {/* Content Logic (Only for product lists) */}
                {(sectionId.includes("products") || sectionId === "products-list") && (
                    <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                            <List className="h-4 w-4 text-slate-500" />
                            <h3 className="font-semibold text-slate-700">Conteúdo da Lista</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>Modo de Exibição</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={settings.selectionMode || "auto"}
                                    onChange={(e) => handleChange("selectionMode", e.target.value)}
                                >
                                    <option value="auto">Automático (Padrão)</option>
                                    <option value="manual">Seleção Manual</option>
                                </select>
                            </div>

                            {settings.selectionMode === "manual" && (
                                <div className="space-y-2">
                                    <Label>Selecione os Produtos</Label>
                                    <div className="h-60 overflow-y-auto border rounded-md bg-white p-2 space-y-1">
                                        {allProducts.map((p: any) => {
                                            const isSelected = (settings.productIds || []).includes(p.id?.toString());
                                            return (
                                                <div
                                                    key={p.id}
                                                    className={cn(
                                                        "flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-slate-50",
                                                        isSelected ? "bg-blue-50 text-blue-700" : ""
                                                    )}
                                                    onClick={() => toggleProduct(p.id?.toString())}
                                                >
                                                    <div className={cn(
                                                        "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                                                        isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                                                    )}>
                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        {p.images?.[0]?.url && <img src={p.images[0].url} className="h-8 w-8 object-cover rounded" />}
                                                        <span className="truncate">{p.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {allProducts.length === 0 && (
                                            <div className="p-4 text-center text-muted-foreground text-xs">
                                                Nenhum produto cadastrado.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Clique para selecionar/deselecionar. A ordem de seleção será a ordem de exibição.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Type className="h-4 w-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-700">Textos</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Título da Seção</Label>
                            <Input
                                value={settings.title || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="Ex: Lançamentos"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Subtítulo / Descrição</Label>
                            <Input
                                value={settings.subtitle || ""}
                                onChange={(e) => handleChange("subtitle", e.target.value)}
                                placeholder="Ex: Confira as novidades"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-700">Cores desta Seção</h3>
                    </div>

                    <div className="space-y-3">
                        <ColorPickerInput
                            id="bgColor"
                            label="Cor de Fundo"
                            value={settings.backgroundColor || "#ffffff"}
                            onChange={(val) => handleChange("backgroundColor", val)}
                        />
                        <ColorPickerInput
                            id="textColor"
                            label="Cor do Texto"
                            value={settings.textColor || "#334155"}
                            onChange={(val) => handleChange("textColor", val)}
                        />
                    </div>
                </div>

                {/* Spacing / Layout (Advanced) */}
                <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Layout className="h-4 w-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-700">Espaçamento</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Espaço Superior</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range" min="0" max="20" step="1"
                                    value={parseInt(settings.paddingTop || "4")}
                                    onChange={(e) => handleChange("paddingTop", e.target.value)}
                                    className="flex-1"
                                />
                                <span className="text-xs w-8 text-center">{settings.paddingTop || "4"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Espaço Inferior</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range" min="0" max="20" step="1"
                                    value={parseInt(settings.paddingBottom || "4")}
                                    onChange={(e) => handleChange("paddingBottom", e.target.value)}
                                    className="flex-1"
                                />
                                <span className="text-xs w-8 text-center">{settings.paddingBottom || "4"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button onClick={() => onSave(settings)} className="w-full">
                    Salvar Alterações
                </Button>

            </CardContent>
        </Card>
    );
}
