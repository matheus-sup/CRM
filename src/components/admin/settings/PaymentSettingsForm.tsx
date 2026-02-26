"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePaymentConfig } from "@/lib/actions/payment-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode, Building2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState = { success: false, message: "" };

export function PaymentSettingsForm({ config }: { config: any }) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(updatePaymentConfig, initialState);

    // Refresh após salvar com sucesso
    useEffect(() => {
        if (state.success) {
            router.refresh();
        }
    }, [state.success, router]);

    // Local state for toggles to enable/disable inputs visually
    const [mercadoPagoEnabled, setMercadoPagoEnabled] = useState(config?.mercadoPagoEnabled || false);
    const [asaasEnabled, setAsaasEnabled] = useState(config?.asaasEnabled || false);
    const [manualPixEnabled, setManualPixEnabled] = useState(config?.manualPixEnabled || false);

    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    return (
        <form action={formAction}>
            <Tabs defaultValue="mercado_pago" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="mercado_pago">Mercado Pago</TabsTrigger>
                    <TabsTrigger value="asaas">Asaas</TabsTrigger>
                    <TabsTrigger value="pix">Pix Manual</TabsTrigger>
                </TabsList>

                {/* MERCADO PAGO TAB */}
                <TabsContent value="mercado_pago">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Integração Mercado Pago
                            </CardTitle>
                            <CardDescription>Receba por Cartão, Pix e Boleto via Mercado Pago (Checkout Transparente).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativar Mercado Pago</Label>
                                    <p className="text-sm text-slate-500">Habilitar checkout transparente na loja.</p>
                                </div>
                                <Switch
                                    checked={mercadoPagoEnabled}
                                    onCheckedChange={setMercadoPagoEnabled}
                                />
                                <BooleanInput name="mercadoPagoEnabled" value={mercadoPagoEnabled} />
                            </div>

                            <div className="space-y-4">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-800">Onde pegar as credenciais?</AlertTitle>
                                    <AlertDescription className="text-blue-700 text-xs mt-1">
                                        Acesse o Mercado Pago Developers &gt; Suas Integrações &gt; Criar Aplicação. Use as credenciais de Produção.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label>Access Token (Produção)</Label>
                                    <Input
                                        name="mercadoPagoAccessToken"
                                        type="password"
                                        defaultValue={config?.mercadoPagoAccessToken || ""}
                                        placeholder="APP_USR-..."
                                        disabled={!mercadoPagoEnabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Public Key (Produção) - Opcional</Label>
                                    <Input
                                        name="mercadoPagoPublicKey"
                                        type="text"
                                        defaultValue={config?.mercadoPagoPublicKey || ""}
                                        placeholder="APP_USR-..."
                                        disabled={!mercadoPagoEnabled}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ASAAS TAB */}
                <TabsContent value="asaas">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" /> Integração Asaas
                            </CardTitle>
                            <CardDescription>Receba via Boleto, Pix e Cartão pelo Asaas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativar Asaas</Label>
                                    <p className="text-sm text-slate-500">Utilizar Asaas no checkout.</p>
                                </div>
                                <Switch
                                    checked={asaasEnabled}
                                    onCheckedChange={setAsaasEnabled}
                                />
                                <BooleanInput name="asaasEnabled" value={asaasEnabled} />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Key (Chave de API)</Label>
                                    <Input
                                        name="asaasApiKey"
                                        type="password"
                                        defaultValue={config?.asaasApiKey || ""}
                                        placeholder="$aact_..."
                                        disabled={!asaasEnabled}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PIX MANUAL TAB */}
                <TabsContent value="pix">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" /> Pix Manual (Copiar e Colar)
                            </CardTitle>
                            <CardDescription>O cliente copia sua chave e paga no banco dele. Você aprova o pedido manualmente.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativar Pix Manual</Label>
                                    <p className="text-sm text-slate-500">Exibir opção de Pix "conta a conta".</p>
                                </div>
                                <Switch
                                    checked={manualPixEnabled}
                                    onCheckedChange={setManualPixEnabled}
                                />
                                <BooleanInput name="manualPixEnabled" value={manualPixEnabled} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Chave Pix (CPF, CNPJ, Email ou Aleatória)</Label>
                                    <Input
                                        name="pixKey"
                                        defaultValue={config?.pixKey || ""}
                                        placeholder="Ex: 12.345.678/0001-90"
                                        disabled={!manualPixEnabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nome do Titular</Label>
                                    <Input
                                        name="pixHolder"
                                        defaultValue={config?.pixHolder || ""}
                                        placeholder="Ex: Minha Empresa Ltda"
                                        disabled={!manualPixEnabled}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Nome do Banco (Opcional)</Label>
                                    <Input
                                        name="pixBank"
                                        defaultValue={config?.pixBank || ""}
                                        placeholder="Ex: Nubank, Inter, Itaú"
                                        disabled={!manualPixEnabled}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
            </div>

            {
                state.message && (
                    <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                        {state.message}
                    </p>
                )
            }
        </form >
    );
}
