"use client";

import { useActionState, useState, useEffect } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutTemplate, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/components/admin/media/ImagePicker";

const initialState = { success: false, message: "" };

interface SiteBrandingFormProps {
    config: any;
    onConfigChange?: (key: string, value: string) => void;
    onHighlightComponent?: (component: string) => void;
}

export function SiteBrandingForm({ config, onConfigChange, onHighlightComponent }: SiteBrandingFormProps) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [logoUrl, setLogoUrl] = useState(config.logoUrl || "");
    const [hasHighlighted, setHasHighlighted] = useState(false);

    useEffect(() => {
        setLogoUrl(config.logoUrl || "");
    }, [config.logoUrl]);

    const handleFocus = (target: "header" | "footer") => {
        if (!hasHighlighted) {
            onHighlightComponent?.(target);
            setHasHighlighted(true);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" /> Imagem da sua marca
                </CardTitle>
                <CardDescription>Logo e informações básicas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2" onFocus={() => handleFocus("header")}>
                            <Label htmlFor="storeName">Nome da Loja</Label>
                            <Input
                                id="storeName"
                                name="storeName"
                                defaultValue={config.storeName}
                                onChange={(e) => onConfigChange?.("storeName", e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Aparece no cabeçalho (se não tiver logo), rodapé e título da página.
                            </p>
                        </div>

                        <div className="space-y-2" onFocus={() => handleFocus("footer")}>
                            <Label htmlFor="description">Descrição (Bio)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={config.description || ""}
                                onChange={(e) => onConfigChange?.("description", e.target.value)}
                                placeholder="Uma breve descrição da sua loja..."
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Aparece no bloco "Sobre a Loja" do rodapé e na descrição SEO do site.
                            </p>
                        </div>

                        <div className="space-y-2" onFocus={() => handleFocus("header")}>
                            <Label>Logo da Loja</Label>
                            <ImagePicker
                                value={logoUrl}
                                onChange={(url) => {
                                    setLogoUrl(url);
                                    onConfigChange?.("logoUrl", url);
                                    handleFocus("header");
                                }}
                                label="Selecionar Logo"
                            />
                            <input type="hidden" name="logoUrl" value={logoUrl} />
                            <p className="text-xs text-muted-foreground">
                                Aparece no cabeçalho do site. Substitui o nome da loja quando configurado.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Favicon (Ícone da Aba)</Label>
                            <ImagePicker
                                value={config.faviconUrl || ""}
                                onChange={(url) => {
                                    onConfigChange?.("faviconUrl", url);
                                }}
                                label="Selecionar Favicon"
                            />
                            <input type="hidden" name="faviconUrl" value={config.faviconUrl || ""} />
                            <p className="text-xs text-muted-foreground">
                                Aparece na aba do navegador. Recomendado: imagem quadrada (32x32px).
                            </p>
                        </div>
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
