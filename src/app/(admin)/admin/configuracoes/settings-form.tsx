"use client";

import { useActionState, useState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Store, Instagram, Facebook, Twitter, Linkedin, Youtube, Image as ImageIcon, CreditCard, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { ColorPicker } from "@/components/admin/settings/ColorPicker";
import { MediaPickerWrapper } from "@/components/admin/settings/MediaPickerWrapper";

const initialState = {
    success: false,
    message: ""
};

import { Footer } from "@/components/shop/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuEditor } from "@/app/(admin)/admin/menus/[id]/MenuEditor";

// ... existing imports

function ColorPickerWrapper({ defaultValue, name, onChange }: { defaultValue: string, name: string, onChange?: (val: string) => void }) {
    const [color, setColor] = useState(defaultValue);

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        if (onChange) onChange(newColor);
    };

    return (
        <>
            <input type="hidden" name={name} value={color} />
            <ColorPicker value={color} onChange={handleColorChange} />
        </>
    );
}

export function SettingsForm({ config, menu, footerPopulares, categories = [] }: { config: any, menu?: any, footerPopulares?: any, categories?: any[] }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    // Live Preview State
    const [previewConfig, setPreviewConfig] = useState(config);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPreviewConfig((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (name: string) => (color: string) => {
        setPreviewConfig((prev: any) => ({ ...prev, [name]: color }));
    };

    // Config for preview needs a menu mostly, if null it uses defaults which is fine.
    // We can try to mock the menu or just let defaults show.
    // If the user hasn't edited the footer menu, it might be empty or default.
    // Ideally we would fetch the menu here but this is a client component.
    // For now we accept that the Menu part of the preview might be static/default 
    // unless we pass the menu prop to SettingsForm (which comes from SettingsManager).

    return (
        <Tabs defaultValue="identity" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="identity">Identidade Visual</TabsTrigger>
                <TabsTrigger value="links">Links do Rodapé</TabsTrigger>
                <TabsTrigger value="populares">Links Populares</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Column */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" /> Identidade da Loja
                            </CardTitle>
                            <CardDescription>Edite as informações e veja em tempo real.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={formAction} className="space-y-3">
                                {state?.message && (
                                    <div className={`p-4 rounded-md text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {state.message}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="storeName">Nome da Loja</Label>
                                        <Input
                                            id="storeName"
                                            name="storeName"
                                            defaultValue={config.storeName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="description">Descrição (Bio)</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            defaultValue={config.description || ""}
                                            onChange={handleChange}
                                            placeholder="Uma breve descrição da sua loja..."
                                            className="resize-none h-16"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="whatsapp">WhatsApp</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="whatsapp"
                                                name="whatsapp"
                                                className="pl-9"
                                                placeholder="5511999999999"
                                                defaultValue={config.whatsapp || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Somente números (com DDD).</p>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="phone">Telefone Fixo</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                className="pl-9"
                                                placeholder="(11) 3333-4444"
                                                defaultValue={config.phone || ""}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email">E-mail de Contato</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="contato@minhaloja.com.br"
                                            defaultValue={config.email || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="address">Endereço Completo</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder="Rua das Flores, 123 - Centro..."
                                        defaultValue={config.address || ""}
                                        onChange={handleChange}
                                        className="resize-none h-14"
                                    />
                                </div>

                                {/* ... (MapUrl and Socials skipped for brevity updates, assuming they work similarly or user focused on text) ... */}
                                {/* Leaving MapUrl and Instagram untouched but should update onChange if needed. Adding generic logic below if possible or just explicit */}

                                <div className="space-y-1">
                                    <Label htmlFor="mapUrl">Link do Mapa (Google Maps Embed)</Label>
                                    <Input
                                        id="mapUrl"
                                        name="mapUrl"
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                        defaultValue={config.mapUrl || ""}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="instagram"
                                            name="instagram"
                                            className="pl-9"
                                            placeholder="https://instagram.com/sua_loja"
                                            defaultValue={config.instagram || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>


                                <div className="grid gap-2">
                                    <Label htmlFor="themeColor">Cor Principal</Label>
                                    <div className="p-3 border rounded-lg bg-slate-50 space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Escolha a cor que será usada em botões, destaques e links.
                                        </div>
                                        <ColorPickerWrapper
                                            defaultValue={config.themeColor}
                                            name="themeColor"
                                            onChange={handleColorChange("themeColor")}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full h-11" disabled={isPending}>
                                        {isPending ? "Salvando..." : "Salvar Configurações"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview Column - Takes 2/3 of space */}
                    <div className="lg:col-span-2 lg:sticky lg:top-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-800">Pré-visualização do Rodapé</h3>
                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Modo Desktop</div>
                        </div>

                        {/* Preview Container */}
                        <div className="border-4 border-slate-200 rounded-xl overflow-hidden shadow-xl">
                            <div
                                className="pointer-events-none select-none"
                            >
                                <Footer config={previewConfig} menu={menu} popularMenu={footerPopulares} />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 text-center">
                            *Preencha os campos ao lado para ver as mudanças em tempo real.
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="links">
                {menu ? (
                    <MenuEditor menu={menu} categories={categories} />
                ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        Menu de rodapé não encontrado. Tente recarregar a página.
                    </div>
                )}
            </TabsContent>
            <TabsContent value="populares">
                {footerPopulares ? (
                    <MenuEditor menu={footerPopulares} categories={categories} />
                ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        Menu de populares não encontrado.
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
