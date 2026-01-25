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

export function SiteBrandingForm({ config, onConfigChange }: { config: any, onConfigChange?: (key: string, value: string) => void }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [logoUrl, setLogoUrl] = useState(config.logoUrl || "");

    useEffect(() => {
        setLogoUrl(config.logoUrl || "");
    }, [config.logoUrl]);

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
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Nome da Loja</Label>
                            <Input
                                id="storeName"
                                name="storeName"
                                defaultValue={config.storeName}
                                onChange={(e) => onConfigChange?.("storeName", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (Bio)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={config.description || ""}
                                onChange={(e) => onConfigChange?.("description", e.target.value)}
                                placeholder="Uma breve descrição da sua loja..."
                                className="resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Logo da Loja</Label>
                            <ImagePicker
                                value={logoUrl}
                                onChange={(url) => {
                                    setLogoUrl(url);
                                    onConfigChange?.("logoUrl", url);
                                }}
                                label="Selecionar Logo"
                            />
                            <input type="hidden" name="logoUrl" value={logoUrl} />
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
