"use client";

import { useActionState } from "react";
import { useState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MapPin, Mail, Instagram, Facebook, Youtube, Twitter, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const initialState = {
    success: false,
    message: ""
};

interface SiteContactFormProps {
    config: any;
    onConfigChange?: (key: string, value: any) => void;
    onHighlightComponent?: (component: string) => void;
}

export function SiteContactForm({ config, onConfigChange, onHighlightComponent }: SiteContactFormProps) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [hasHighlighted, setHasHighlighted] = useState(false);

    const handleFocus = () => {
        if (!hasHighlighted) {
            onHighlightComponent?.("footer");
            setHasHighlighted(true);
        }
    };

    return (
        <Card onFocus={handleFocus}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Contato e Localização
                </CardTitle>
                <CardDescription>Onde seus clientes podem te encontrar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    {state?.message && (
                        <div className={`p-4 rounded-md text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

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
                                    onChange={(e) => onConfigChange?.("whatsapp", e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ao configurar, um botão flutuante do WhatsApp aparecerá no site.
                            </p>
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
                                    onChange={(e) => onConfigChange?.("phone", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground bg-slate-50 p-3 rounded-lg border">
                        Os campos abaixo aparecem no bloco "Contato" do rodapé (se adicionado).
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                className="pl-9"
                                placeholder="contato@loja.com"
                                defaultValue={config.email || ""}
                                onChange={(e) => onConfigChange?.("email", e.target.value)}
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
                            onChange={(e) => onConfigChange?.("address", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mapUrl">Link do Mapa (Google Maps Embed)</Label>
                        <Input
                            id="mapUrl"
                            name="mapUrl"
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            defaultValue={config.mapUrl || ""}
                            onChange={(e) => onConfigChange?.("mapUrl", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Link gerado pela opção "Incorporar um mapa" do Google Maps. O mapa aparece no bloco "Contato" do rodapé.
                        </p>
                    </div>

                    {/* Social Media Section */}
                    <Collapsible defaultOpen={!!(config.instagram || config.facebook)}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors group">
                            <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-pink-500" />
                                <span className="font-medium text-sm">Redes Sociais</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4 space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Os ícones das redes sociais aparecem no rodapé da loja.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                                        <Input
                                            id="instagram"
                                            name="instagram"
                                            className="pl-9"
                                            placeholder="@sua.loja"
                                            defaultValue={config.instagram || ""}
                                            onChange={(e) => onConfigChange?.("instagram", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagramToken">Token do Instagram</Label>
                                    <Input
                                        id="instagramToken"
                                        name="instagramToken"
                                        placeholder="Token para feed (opcional)"
                                        defaultValue={config.instagramToken || ""}
                                        onChange={(e) => onConfigChange?.("instagramToken", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Permite mostrar o feed na loja.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                                        <Input
                                            id="facebook"
                                            name="facebook"
                                            className="pl-9"
                                            placeholder="https://facebook.com/..."
                                            defaultValue={config.facebook || ""}
                                            onChange={(e) => onConfigChange?.("facebook", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="youtube">YouTube</Label>
                                    <div className="relative">
                                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                                        <Input
                                            id="youtube"
                                            name="youtube"
                                            className="pl-9"
                                            placeholder="https://youtube.com/..."
                                            defaultValue={config.youtube || ""}
                                            onChange={(e) => onConfigChange?.("youtube", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tiktok">TikTok</Label>
                                    <Input
                                        id="tiktok"
                                        name="tiktok"
                                        placeholder="@usuario"
                                        defaultValue={config.tiktok || ""}
                                        onChange={(e) => onConfigChange?.("tiktok", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter / X</Label>
                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-800" />
                                        <Input
                                            id="twitter"
                                            name="twitter"
                                            className="pl-9"
                                            placeholder="@usuario"
                                            defaultValue={config.twitter || ""}
                                            onChange={(e) => onConfigChange?.("twitter", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pinterest">Pinterest</Label>
                                    <Input
                                        id="pinterest"
                                        name="pinterest"
                                        placeholder="https://pinterest.com/..."
                                        defaultValue={config.pinterest || ""}
                                        onChange={(e) => onConfigChange?.("pinterest", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pinterestTag">Tag do Pinterest</Label>
                                    <Input
                                        id="pinterestTag"
                                        name="pinterestTag"
                                        placeholder='<meta name="p:domain_verify" />'
                                        defaultValue={config.pinterestTag || ""}
                                        onChange={(e) => onConfigChange?.("pinterestTag", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Hidden fields for Identity to prevent overwrite */}
                    <input type="hidden" name="storeName" value={config.storeName || ""} />
                    <input type="hidden" name="description" value={config.description || ""} />
                    <input type="hidden" name="logoUrl" value={config.logoUrl || ""} />
                    <input type="hidden" name="themeColor" value={config.themeColor || "#000000"} />
                    <input type="hidden" name="secondaryColor" value={config.secondaryColor || "#fce7f3"} />
                    <input type="hidden" name="backgroundColor" value={config.backgroundColor || "#ffffff"} />
                    <input type="hidden" name="bannerUrl" value={config.bannerUrl || ""} />

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Contato"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
