"use client";

import { useActionState, useState } from "react";
import { updateShippingConfig } from "@/lib/actions/shipping-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package } from "lucide-react";

const initialState = { success: false, message: "" };

export function ShippingSettingsForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateShippingConfig, initialState);

    const [melhorEnvioEnabled, setMelhorEnvioEnabled] = useState(config?.melhorEnvioEnabled || false);
    const [melhorEnvioSandbox, setMelhorEnvioSandbox] = useState(config?.melhorEnvioSandbox || false);

    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    return (
        <form action={formAction}>
            <Tabs defaultValue="melhor_envio" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="melhor_envio">Melhor Envio</TabsTrigger>
                </TabsList>

                <TabsContent value="melhor_envio">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" /> Integração Melhor Envio
                            </CardTitle>
                            <CardDescription>Calcule fretes de Correios, Jadlog, Latam e azul via Melhor Envio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativar Melhor Envio</Label>
                                    <p className="text-sm text-slate-500">Exibir cálculo de frete no carrinho.</p>
                                </div>
                                <Switch
                                    checked={melhorEnvioEnabled}
                                    onCheckedChange={setMelhorEnvioEnabled}
                                />
                                <BooleanInput name="melhorEnvioEnabled" value={melhorEnvioEnabled} />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Modo Sandbox (Teste)</Label>
                                    <p className="text-sm text-slate-500">Usar ambiente de testes do Melhor Envio.</p>
                                </div>
                                <Switch
                                    checked={melhorEnvioSandbox}
                                    onCheckedChange={setMelhorEnvioSandbox}
                                />
                                <BooleanInput name="melhorEnvioSandbox" value={melhorEnvioSandbox} />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Token (Access Token)</Label>
                                    <Input
                                        name="melhorEnvioToken"
                                        type="password"
                                        defaultValue={config?.melhorEnvioToken || ""}
                                        placeholder="Insira seu token de acesso..."
                                        disabled={!melhorEnvioEnabled}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Gere um token no painel do Melhor Envio (Integrações).</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Client ID (Opcional)</Label>
                                        <Input
                                            name="melhorEnvioClientId"
                                            defaultValue={config?.melhorEnvioClientId || ""}
                                            placeholder="Client ID da aplicação"
                                            disabled={!melhorEnvioEnabled}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-mail de Cadastro</Label>
                                        <Input
                                            name="melhorEnvioEmail"
                                            defaultValue={config?.melhorEnvioEmail || ""}
                                            placeholder="seu@email.com"
                                            disabled={!melhorEnvioEnabled}
                                        />
                                    </div>
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

            {state.message && (
                <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </form>
    );
}
