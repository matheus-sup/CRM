"use client";

import { useActionState, useState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Image as ImageIcon, Menu, Mail, Phone, CreditCard, ChevronRight } from "lucide-react";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";

const initialState = { success: false, message: "" };

export function SiteFooterForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

    // Helper to render the boolean hidden inputs
    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    // Sub-forms content
    const renderSubSection = () => {
        if (activeSubSection === "colors") {
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveSubSection(null)} className="mr-2 px-1">← Voltar</Button>
                        Cores
                    </h3>
                    <div className="grid gap-4 p-4 border rounded-lg bg-slate-50">
                        <ColorPickerInput id="footerBg" label="Cor de Fundo" value={config.footerBg || "#171717"} />
                        <ColorPickerInput id="footerText" label="Cor do Texto" value={config.footerText || "#a3a3a3"} />
                    </div>
                </div>
            );
        }

        if (activeSubSection === "branding") {
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveSubSection(null)} className="mr-2 px-1">← Voltar</Button>
                        Logo e Mensagem
                    </h3>
                    <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="footerLogo_switch">Mostrar Logo no Rodapé</Label>
                            <Switch
                                id="footerLogo_switch"
                                defaultChecked={config.footerLogo}
                                onCheckedChange={(c) => {
                                    const input = document.getElementById("footerLogo") as HTMLInputElement;
                                    if (input) input.value = c.toString();
                                }}
                            />
                            <BooleanInput name="footerLogo" value={config.footerLogo} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            O rodapé usará automaticamente a logo principal da loja e a descrição definida em "Imagem da Marca".
                        </p>

                        <div className="pt-4 border-t space-y-3">
                            <Label>Dados Legais (Opicional)</Label>
                            <Input name="legalName" placeholder="Razão Social (Ex: Gut Comércio Ltda)" defaultValue={config.legalName} />
                            <Input name="cnpj" placeholder="CNPJ (Ex: 00.000.000/0001-00)" defaultValue={config.cnpj} />
                            <p className="text-xs text-muted-foreground">Esses dados aparecerão no final do rodapé.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeSubSection === "newsletter") {
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveSubSection(null)} className="mr-2 px-1">← Voltar</Button>
                        Inscrição para Newsletter
                    </h3>
                    <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="newsletter_switch">Habilitar Newsletter</Label>
                            <Switch
                                id="newsletter_switch"
                                defaultChecked={config.newsletterEnabled}
                                onCheckedChange={(c) => {
                                    const input = document.getElementById("newsletterEnabled") as HTMLInputElement;
                                    if (input) input.value = c.toString();
                                }}
                            />
                            <BooleanInput name="newsletterEnabled" value={config.newsletterEnabled} />
                        </div>
                    </div>
                </div>
            );
        }

        if (activeSubSection === "payment") {
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveSubSection(null)} className="mr-2 px-1">← Voltar</Button>
                        Envio e Pagamento
                    </h3>
                    <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Mostrar Ícones de Pagamento</Label>
                            <Switch
                                defaultChecked={config.showPaymentMethods}
                                onCheckedChange={(c) => {
                                    const input = document.getElementById("showPaymentMethods") as HTMLInputElement;
                                    if (input) input.value = c.toString();
                                }}
                            />
                            <BooleanInput name="showPaymentMethods" value={config.showPaymentMethods} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Mostrar Redes Sociais</Label>
                            <Switch
                                defaultChecked={config.showSocialIcons}
                                onCheckedChange={(c) => {
                                    const input = document.getElementById("showSocialIcons") as HTMLInputElement;
                                    if (input) input.value = c.toString();
                                }}
                            />
                            <BooleanInput name="showSocialIcons" value={config.showSocialIcons} />
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Main Menu List
    const MENU_ITEMS = [
        { id: "colors", label: "Cores", icon: Palette },
        { id: "branding", label: "Logo e mensagem institucional", icon: ImageIcon },
        { id: "newsletter", label: "Inscrição para newsletter", icon: Mail },
        { id: "payment", label: "Meios de envio e pagamento", icon: CreditCard },
        // { id: "contact", label: "Dados de contato", icon: Phone }, // Covered in Contact tab? Or link there?
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rodapé da Página</CardTitle>
                <CardDescription>Configure o visual e conteúdo do rodapé.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    {activeSubSection ? (
                        renderSubSection()
                    ) : (
                        <div className="divide-y border rounded-lg bg-white overflow-hidden">
                            {MENU_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveSubSection(item.id)}
                                    className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 text-slate-500" />
                                        <span className="font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="pt-6">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Rodapé"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
