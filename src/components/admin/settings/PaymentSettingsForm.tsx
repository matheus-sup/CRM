"use client";

import { useActionState, useState } from "react";
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
    const [state, formAction, isPending] = useActionState(updatePaymentConfig, initialState);

    // Local state for toggles to enable/disable inputs visually
    const [pagarmeEnabled, setPagarmeEnabled] = useState(config?.pagarmeEnabled || false);
    const [asaasEnabled, setAsaasEnabled] = useState(config?.asaasEnabled || false);
    const [manualPixEnabled, setManualPixEnabled] = useState(config?.manualPixEnabled || false);

    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    return (
        <form action={formAction}>
            <Tabs defaultValue="pagarme" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pagarme">Pagar.me (Stone)</TabsTrigger>
                    <TabsTrigger value="asaas">Asaas</TabsTrigger>
                    <TabsTrigger value="pix">Pix Manual</TabsTrigger>
                </TabsList>

                {/* PAGAR.ME TAB */}
                <TabsContent value="pagarme">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Integração Pagar.me
                            </CardTitle>
                            <CardDescription>Receba por Cartão de Crédito e Pix via Pagar.me.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativar Pagar.me</Label>
                                    <p className="text-sm text-slate-500">Habilitar checkout transparente na loja.</p>
                                </div>
                                <Switch
                                    checked={pagarmeEnabled}
                                    onCheckedChange={setPagarmeEnabled}
                                />
                                <BooleanInput name="pagarmeEnabled" value={pagarmeEnabled} />
                            </div>

                            <div className="space-y-4">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-800">Onde pegar as chaves?</AlertTitle>
                                    <AlertDescription className="text-blue-700 text-xs mt-1">
                                        Acesse seu painel Pagar.me &gt; Configurações &gt; Chaves de API. Use a chave secreta (começa com sk_).
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label>API Secret Key (Chave Secreta)</Label>
                                    <Input
                                        name="pagarmeApiKey"
                                        type="password"
                                        defaultValue={config?.pagarmeApiKey || ""}
                                        placeholder="sk_..."
                                        disabled={!pagarmeEnabled}
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
                                <div className="space-y-2">
                                    <Label>ID da Carteira (Wallet ID) - Opcional</Label>
                                    <Input
                                        name="asaasWalletId"
                                        defaultValue={config?.asaasWalletId || ""}
                                        placeholder="Se tiver múltiplas contas"
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
                                        placeholder="Ex: Gut Cosméticos Ltda"
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

            {/* Installments Config (Global) */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Parcelamento</CardTitle>
                    <CardDescription>Regras para cartão de crédito (aplica-se a Pagar.me e Asaas).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Máximo de Parcelas</Label>
                            <Input
                                name="maxInstallments"
                                type="number"
                                min="1"
                                max="18"
                                defaultValue={config?.maxInstallments || "12"}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor Mínimo da Parcela (R$)</Label>
                            <Input
                                name="minInstallmentValue"
                                type="text"
                                defaultValue={config?.minInstallmentValue?.toString() || "5.00"}
                                placeholder="5,00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Juros ao Mês (%)</Label>
                            <Input
                                name="interestRate"
                                type="text"
                                defaultValue={config?.interestRate?.toString() || "0.00"}
                                placeholder="0 se for sem juros"
                            />
                            <p className="text-[10px] text-muted-foreground">Deixe 0 para parcelamento sem juros.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
            </div>

            {state.message && (
                <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </form>
    );
}
