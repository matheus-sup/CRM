"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutTemplate } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";

const initialState = { success: false, message: "" };

export function SiteHeaderForm({ config, onConfigChange }: { config: any, onConfigChange?: (key: string, value: string) => void }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" /> Cabeçalho
                </CardTitle>
                <CardDescription>Cores e estilo do topo do site.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">

                    <div className="grid grid-cols-1 gap-6 p-4 border rounded-xl bg-slate-50/50">

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
                                <ColorPickerInput
                                    id="menuColor"
                                    label="Cor dos Textos / Ícones"
                                    value={config.menuColor || "#334155"}
                                    onChange={(val) => onConfigChange?.("menuColor", val)}
                                />
                            </div>
                        </div>

                        {/* Cores Secundárias */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-pink-500" />
                                Elementos (Busca & Carrinho)
                            </Label>
                            <div className="grid gap-3 p-3 bg-white rounded-lg border shadow-sm">
                                <ColorPickerInput
                                    id="cartCountBg"
                                    label="Fundo Badge Carrinho"
                                    value={config.cartCountBg || "#22c55e"}
                                    onChange={(val) => onConfigChange?.("cartCountBg", val)}
                                />
                                <ColorPickerInput
                                    id="cartCountText"
                                    label="Texto Badge Carrinho"
                                    value={config.cartCountText || "#ffffff"}
                                    onChange={(val) => onConfigChange?.("cartCountText", val)}
                                />
                                <ColorPickerInput
                                    id="searchBtnBg"
                                    label="Fundo Botão Pesquisa"
                                    value={config.searchBtnBg || "#db2777"}
                                    onChange={(val) => onConfigChange?.("searchBtnBg", val)}
                                />
                                <ColorPickerInput
                                    id="searchIconColor"
                                    label="Ícone Botão Pesquisa"
                                    value={config.searchIconColor || "#ffffff"}
                                    onChange={(val) => onConfigChange?.("searchIconColor", val)}
                                />
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
