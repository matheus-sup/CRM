"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MapPin, Mail, Instagram } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
    success: false,
    message: ""
};

export function SiteContactForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    return (
        <Card>
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
                                />
                            </div>
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
                            Link gerado pela opção "Incorporar um mapa" do Google Maps.
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
