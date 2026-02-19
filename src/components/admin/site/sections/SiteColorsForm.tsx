"use client";

import { useActionState, useState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";

const initialState = { success: false, message: "" };

interface SiteColorsFormProps {
    config: any;
    onConfigChange?: (key: string, value: string) => void;
    onHighlightComponent?: (component: string) => void;
}

export function SiteColorsForm({ config, onConfigChange, onHighlightComponent }: SiteColorsFormProps) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [highlightedArea, setHighlightedArea] = useState<string | null>(null);

    const handleFocus = (target: string) => {
        if (highlightedArea !== target) {
            onHighlightComponent?.(target);
            setHighlightedArea(target);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" /> Cores da sua marca
                </CardTitle>
                <CardDescription>Defina as cores globais da loja.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">

                    <div className="space-y-4 border-b pb-4" onFocus={() => handleFocus("home")}>
                        <div>
                            <Label className="text-base font-semibold">Cores Base</Label>
                            <p className="text-xs text-muted-foreground mt-1">Aplicadas em todo o site (fundo, textos gerais, títulos).</p>
                        </div>
                        <div className="grid gap-4">
                            <ColorPickerInput
                                id="backgroundColor"
                                label="Cor de Fundo (Global)"
                                value={config.backgroundColor || "#ffffff"}
                                onChange={(val) => onConfigChange?.("backgroundColor", val)}
                            />
                            <ColorPickerInput
                                id="bodyColor"
                                label="Cor dos Textos (Padrão)"
                                value={config.bodyColor || "#334155"}
                                onChange={(val) => onConfigChange?.("bodyColor", val)}
                            />
                            <ColorPickerInput
                                id="headingColor"
                                label="Cor dos Títulos"
                                value={config.headingColor || "#1e293b"}
                                onChange={(val) => onConfigChange?.("headingColor", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-b pb-4" onFocus={() => handleFocus("product-grid")}>
                        <div>
                            <Label className="text-base font-semibold">Destaques & Botões</Label>
                            <p className="text-xs text-muted-foreground mt-1">Aplicadas em botões, links, ícones e preços.</p>
                        </div>
                        <div className="grid gap-4">
                            <ColorPickerInput
                                id="themeColor"
                                label="Cor Principal (Botões e Ações)"
                                value={config.themeColor || "#db2777"}
                                onChange={(val) => onConfigChange?.("themeColor", val)}
                            />
                            <ColorPickerInput
                                id="accentColor"
                                label="Cor de Destaque (Faixas, Ícones, Detalhes)"
                                value={(config as any).accentColor || config.themeColor || "#db2777"}
                                onChange={(val) => onConfigChange?.("accentColor", val)}
                            />
                            <ColorPickerInput
                                id="priceColor"
                                label="Cor do Preço (Produtos)"
                                value={(config as any).priceColor || (config as any).accentColor || config.themeColor || "#db2777"}
                                onChange={(val) => onConfigChange?.("priceColor", val)}
                            />
                            <ColorPickerInput
                                id="secondaryColor"
                                label="Cor Secundária (Detalhes)"
                                value={config.secondaryColor || "#fce7f3"}
                                onChange={(val) => onConfigChange?.("secondaryColor", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-b pb-4" onFocus={() => handleFocus("hero")}>
                        <div>
                            <Label className="text-base font-semibold">Cores Específicas (Avançado)</Label>
                            <p className="text-xs text-muted-foreground mt-1">Personalize áreas específicas do site.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-1">
                            <ColorPickerInput
                                id="bannerTextColor"
                                label="Texto do Banner (Hero)"
                                value={(config as any).bannerTextColor || config.headingColor || "#111827"}
                                onChange={(val) => onConfigChange?.("bannerTextColor", val)}
                            />

                            <ColorPickerInput
                                id="productBtnBg"
                                label="Botão Produtos (Fundo)"
                                value={(config as any).productBtnBg || config.themeColor || "#db2777"}
                                onChange={(val) => onConfigChange?.("productBtnBg", val)}
                            />
                            <ColorPickerInput
                                id="productBtnText"
                                label="Botão Produtos (Texto)"
                                value={(config as any).productBtnText || "#ffffff"}
                                onChange={(val) => onConfigChange?.("productBtnText", val)}
                            />

                            <ColorPickerInput
                                id="sectionTitleColor"
                                label="Títulos das Seções"
                                value={(config as any).sectionTitleColor || config.headingColor || "#111827"}
                                onChange={(val) => onConfigChange?.("sectionTitleColor", val)}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar Cores"}
                    </Button>
                </form>
            </CardContent>
        </Card >
    );
}
