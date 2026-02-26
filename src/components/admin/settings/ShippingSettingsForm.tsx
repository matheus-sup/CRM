"use client";

import { useActionState, useState } from "react";
import { updateShippingConfig, getMelhorEnvioAuthUrl, exchangeCodeForToken } from "@/lib/actions/shipping-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, KeyRound, CheckCircle2, AlertCircle, ExternalLink, Loader2, ClipboardPaste, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SafeConfig {
    melhorEnvioEnabled: boolean;
    melhorEnvioEmail: string | null;
    hasToken: boolean;
    tokenExpiresAt: string | null;
}

const initialState = { success: false, message: "" };

export function ShippingSettingsForm({ config }: { config: SafeConfig | null }) {
    const [state, formAction, isPending] = useActionState(updateShippingConfig, initialState);
    const router = useRouter();

    const [melhorEnvioEnabled, setMelhorEnvioEnabled] = useState(config?.melhorEnvioEnabled || false);

    // Fluxo OAuth manual
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [exchanging, setExchanging] = useState(false);
    const [tokenMessage, setTokenMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const hasToken = config?.hasToken || false;
    const tokenExpiry = config?.tokenExpiresAt
        ? new Date(config.tokenExpiresAt)
        : null;
    const isTokenExpired = tokenExpiry ? tokenExpiry < new Date() : false;

    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    // Passo 1: Abre a página de autorização do Melhor Envio
    const handleGenerateToken = async () => {
        const result = await getMelhorEnvioAuthUrl();
        if (result.error) {
            setTokenMessage({ type: "error", text: result.error });
            return;
        }
        if (result.url) {
            window.open(result.url, "_blank");
            setShowCodeInput(true);
            setTokenMessage(null);
        }
    };

    // Passo 2: Troca o código pelo token
    const handleExchangeCode = async () => {
        // Extrair o code da URL se o usuário colou a URL completa
        let code = authCode.trim();
        try {
            const url = new URL(code);
            const codeParam = url.searchParams.get("code");
            if (codeParam) code = codeParam;
        } catch {
            // Não é URL, usar como código direto
        }

        if (!code) {
            setTokenMessage({ type: "error", text: "Cole o código ou a URL completa." });
            return;
        }

        setExchanging(true);
        setTokenMessage(null);

        const result = await exchangeCodeForToken(code);

        if (result.success) {
            setTokenMessage({ type: "success", text: result.message });
            setShowCodeInput(false);
            setAuthCode("");
            router.refresh();
        } else {
            setTokenMessage({ type: "error", text: result.message });
        }

        setExchanging(false);
    };

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
                            {/* Token messages */}
                            {tokenMessage && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                    tokenMessage.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                    {tokenMessage.type === "success"
                                        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                        : <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    }
                                    {tokenMessage.text}
                                </div>
                            )}

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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Token (Access Token)</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md bg-slate-100 text-sm text-slate-500">
                                            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                            {hasToken
                                                ? "Token armazenado com segurança no servidor"
                                                : "Nenhum token configurado"
                                            }
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={!melhorEnvioEnabled}
                                            onClick={handleGenerateToken}
                                            className="gap-2 whitespace-nowrap"
                                        >
                                            <KeyRound className="h-4 w-4" />
                                            {hasToken ? "Renovar Token" : "Gerar Token"}
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasToken && !isTokenExpired && (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Token ativo
                                                {tokenExpiry && (
                                                    <span className="text-slate-400">
                                                        (expira em {tokenExpiry.toLocaleDateString("pt-BR")})
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        {hasToken && isTokenExpired && (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                Token expirado - clique em &quot;Renovar Token&quot; para renovar
                                            </span>
                                        )}
                                        {!hasToken && !showCodeInput && (
                                            <p className="text-xs text-muted-foreground">
                                                Clique em &quot;Gerar Token&quot; para autorizar via Melhor Envio.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Passo 2: Colar código de autorização */}
                                {showCodeInput && (
                                    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50 space-y-3">
                                        <div className="text-sm text-blue-800">
                                            <p className="font-semibold">Passo 2: Cole o código de autorização</p>
                                            <p className="text-blue-600 mt-1">
                                                Após autorizar no Melhor Envio, você será redirecionado para uma página.
                                                Copie a <strong>URL completa</strong> da barra de endereço e cole abaixo.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Cole a URL ou o código aqui..."
                                                value={authCode}
                                                onChange={(e) => setAuthCode(e.target.value)}
                                                className="flex-1 bg-white"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleExchangeCode}
                                                disabled={exchanging || !authCode.trim()}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                            >
                                                {exchanging ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ClipboardPaste className="h-4 w-4" />
                                                )}
                                                Ativar
                                            </Button>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-slate-500"
                                            onClick={() => { setShowCodeInput(false); setAuthCode(""); }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                )}

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
