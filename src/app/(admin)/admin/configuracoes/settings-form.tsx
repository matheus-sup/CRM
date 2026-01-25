"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Palette, Store, Instagram, Type, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { ColorPicker } from "@/components/admin/settings/ColorPicker";
import { useState } from "react";

const initialState = {
    success: false,
    message: ""
};

function ColorPickerWrapper({ defaultValue, name }: { defaultValue: string, name: string }) {
    const [color, setColor] = useState(defaultValue);
    return (
        <>
            <input type="hidden" name={name} value={color} />
            <ColorPicker value={color} onChange={setColor} />
        </>
    );
}

export function SettingsForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" /> Identidade da Loja
                </CardTitle>
                <CardDescription>Nome e informações básicas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    {state?.message && (
                        <div className={`p-4 rounded-md text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Nome da Loja</Label>
                            <Input id="storeName" name="storeName" defaultValue={config.storeName} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (Bio)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={config.description || ""}
                                placeholder="Uma breve descrição da sua loja..."
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="whatsapp"
                                    name="whatsapp"
                                    className="pl-9"
                                    placeholder="5511999999999"
                                    defaultValue={config.whatsapp || ""}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Somente números (com DDD).</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone Fixo</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    className="pl-9"
                                    placeholder="(11) 3333-4444"
                                    defaultValue={config.phone || ""}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail de Contato</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="contato@gutcosmeticos.com.br"
                                defaultValue={config.email || ""}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço Completo</Label>
                        <Textarea
                            id="address"
                            name="address"
                            placeholder="Rua das Flores, 123 - Centro..."
                            defaultValue={config.address || ""}
                            className="resize-none h-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mapUrl">Link do Mapa (Google Maps Embed)</Label>
                        <Input
                            id="mapUrl"
                            name="mapUrl"
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            defaultValue={config.mapUrl || ""}
                        />
                        <p className="text-xs text-muted-foreground">
                            Vá no Google Maps - Compartilhar - Incorporar um mapa - Copie o link dentro de `src="..."`.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="instagram"
                                name="instagram"
                                className="pl-9"
                                placeholder="https://instagram.com/sua_loja"
                                defaultValue={config.instagram || ""}
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">URL do Logo</Label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="logoUrl"
                                    name="logoUrl"
                                    className="pl-9"
                                    placeholder="https://..."
                                    defaultValue={config.logoUrl || ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bannerUrl">URL do Banner</Label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="bannerUrl"
                                    name="bannerUrl"
                                    className="pl-9"
                                    placeholder="https://..."
                                    defaultValue={config.bannerUrl || ""}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="themeColor">Cor Principal</Label>
                        <div className="flex gap-4 items-center p-4 border rounded-lg bg-slate-50">
                            <ColorPickerWrapper defaultValue={config.themeColor} name="themeColor" />
                            <div className="text-sm text-muted-foreground">
                                Escolha a cor que será usada em botões, destaques e links.
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-11" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Configurações"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
