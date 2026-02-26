"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateChatConfig, diagnoseWhatsAppConnection } from "@/lib/actions/chat";
import { Save, Eye, EyeOff, Loader2, Stethoscope, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ChatConfigFormProps {
    config: any;
}

export function ChatConfigForm({ config }: ChatConfigFormProps) {
    const [formData, setFormData] = useState({
        // Evolution API
        evolutionUrl: config.evolutionUrl || "",
        evolutionApiKey: config.evolutionApiKey || "",
        evolutionInstance: config.evolutionInstance || "",

        // AI Config
        aiProvider: config.aiProvider || "gemini",
        geminiApiKey: config.geminiApiKey || "",
        openaiApiKey: config.openaiApiKey || "",
        openaiModel: config.openaiModel || "gpt-4o-mini",
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 500,

        // Company Info
        companyName: config.companyName || "",
        companyPhone: config.companyPhone || "",
        companyEmail: config.companyEmail || "",

        // Prompts
        systemPrompt: config.systemPrompt || "",
        instructions: config.instructions || "",
        knowledgeBase: config.knowledgeBase || "",

        // Messages
        welcomeMessage: config.welcomeMessage || "",
        offHoursMessage: config.offHoursMessage || "",
        transferMessage: config.transferMessage || "",
        fallbackMessage: config.fallbackMessage || "",
        errorMessage: config.errorMessage || "",
        goodbyeMessage: config.goodbyeMessage || "",

        // Hours
        hoursEnabled: config.hoursEnabled || false,
        hoursStart: config.hoursStart || "08:00",
        hoursEnd: config.hoursEnd || "18:00",
        workingDays: JSON.parse(config.workingDays || '["seg","ter","qua","qui","sex"]'),

        // Limits
        messagesPerMinute: config.messagesPerMinute || 20,
        conversationTimeout: config.conversationTimeout || 30,
        maxAiMessages: config.maxAiMessages || 10,
    });

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [diagnosing, setDiagnosing] = useState(false);
    const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
    const { toast } = useToast();

    const handleDiagnose = async () => {
        setDiagnosing(true);
        setDiagnosisResult(null);
        try {
            const result = await diagnoseWhatsAppConnection();
            setDiagnosisResult(result);
        } catch (error: any) {
            setDiagnosisResult({ error: error.message });
        }
        setDiagnosing(false);
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleDay = (day: string) => {
        const days = formData.workingDays.includes(day)
            ? formData.workingDays.filter((d: string) => d !== day)
            : [...formData.workingDays, day];
        handleChange("workingDays", days);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateChatConfig(formData);
            toast({
                title: "Configuracoes salvas",
                description: "As configuracoes foram atualizadas com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Nao foi possivel salvar as configuracoes.",
                variant: "destructive",
            });
        }
        setSaving(false);
    };

    const daysOfWeek = [
        { id: "dom", label: "Dom" },
        { id: "seg", label: "Seg" },
        { id: "ter", label: "Ter" },
        { id: "qua", label: "Qua" },
        { id: "qui", label: "Qui" },
        { id: "sex", label: "Sex" },
        { id: "sab", label: "Sab" },
    ];

    return (
        <div className="space-y-6">
            <Tabs defaultValue="api" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="ai">IA</TabsTrigger>
                    <TabsTrigger value="messages">Mensagens</TabsTrigger>
                    <TabsTrigger value="hours">Horarios</TabsTrigger>
                    <TabsTrigger value="limits">Limites</TabsTrigger>
                </TabsList>

                {/* API Configuration */}
                <TabsContent value="api" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolution API</CardTitle>
                            <CardDescription>
                                Configure a conexao com a Evolution API para enviar e receber mensagens do WhatsApp
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>URL da API</Label>
                                <Input
                                    placeholder="https://api.evolution.com.br"
                                    value={formData.evolutionUrl}
                                    onChange={(e) => handleChange("evolutionUrl", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type={showKeys.evolutionApiKey ? "text" : "password"}
                                        placeholder="Sua API Key"
                                        value={formData.evolutionApiKey}
                                        onChange={(e) => handleChange("evolutionApiKey", e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowKeys((prev) => ({
                                                ...prev,
                                                evolutionApiKey: !prev.evolutionApiKey,
                                            }))
                                        }
                                    >
                                        {showKeys.evolutionApiKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Instancia</Label>
                                <Input
                                    placeholder="Nome da instancia"
                                    value={formData.evolutionInstance}
                                    onChange={(e) => handleChange("evolutionInstance", e.target.value)}
                                />
                            </div>

                            {/* Diagnosis Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDiagnose}
                                    disabled={diagnosing}
                                    className="gap-2"
                                >
                                    {diagnosing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Stethoscope className="h-4 w-4" />
                                    )}
                                    Testar Conexao
                                </Button>

                                {diagnosisResult && (
                                    <Alert
                                        variant={diagnosisResult.success ? "default" : "destructive"}
                                        className="mt-4"
                                    >
                                        {diagnosisResult.success ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : diagnosisResult.configured === false ? (
                                            <AlertCircle className="h-4 w-4" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        <AlertTitle>
                                            {diagnosisResult.success
                                                ? "Conexao OK!"
                                                : diagnosisResult.configured === false
                                                ? "API nao configurada"
                                                : "Problema na conexao"}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {diagnosisResult.success && (
                                                <span className="text-green-600">
                                                    {diagnosisResult.message}
                                                </span>
                                            )}
                                            {diagnosisResult.error && (
                                                <span>{diagnosisResult.error}</span>
                                            )}
                                            {diagnosisResult.connectionStatus && !diagnosisResult.success && (
                                                <div className="mt-2 text-sm">
                                                    <strong>Status:</strong> {diagnosisResult.connectionStatus.state || "desconhecido"}
                                                    {diagnosisResult.connectionStatus.error && (
                                                        <span> - {diagnosisResult.connectionStatus.error}</span>
                                                    )}
                                                </div>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informacoes da Empresa</CardTitle>
                            <CardDescription>
                                Dados que serao usados nas respostas automaticas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Nome da Empresa</Label>
                                    <Input
                                        placeholder="Minha Empresa"
                                        value={formData.companyName}
                                        onChange={(e) => handleChange("companyName", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input
                                        placeholder="(11) 99999-9999"
                                        value={formData.companyPhone}
                                        onChange={(e) => handleChange("companyPhone", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-mail</Label>
                                    <Input
                                        type="email"
                                        placeholder="contato@empresa.com"
                                        value={formData.companyEmail}
                                        onChange={(e) => handleChange("companyEmail", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Configuration */}
                <TabsContent value="ai" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Provedor de IA</CardTitle>
                            <CardDescription>
                                Configure a inteligencia artificial que respondera as mensagens
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Provedor</Label>
                                <Select
                                    value={formData.aiProvider}
                                    onValueChange={(value) => handleChange("aiProvider", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gemini">Google Gemini</SelectItem>
                                        <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.aiProvider === "gemini" && (
                                <div className="space-y-2">
                                    <Label>Gemini API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type={showKeys.geminiApiKey ? "text" : "password"}
                                            placeholder="Sua API Key do Gemini"
                                            value={formData.geminiApiKey}
                                            onChange={(e) => handleChange("geminiApiKey", e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setShowKeys((prev) => ({
                                                    ...prev,
                                                    geminiApiKey: !prev.geminiApiKey,
                                                }))
                                            }
                                        >
                                            {showKeys.geminiApiKey ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {formData.aiProvider === "openai" && (
                                <>
                                    <div className="space-y-2">
                                        <Label>OpenAI API Key</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type={showKeys.openaiApiKey ? "text" : "password"}
                                                placeholder="Sua API Key da OpenAI"
                                                value={formData.openaiApiKey}
                                                onChange={(e) => handleChange("openaiApiKey", e.target.value)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setShowKeys((prev) => ({
                                                        ...prev,
                                                        openaiApiKey: !prev.openaiApiKey,
                                                    }))
                                                }
                                            >
                                                {showKeys.openaiApiKey ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Modelo</Label>
                                        <Select
                                            value={formData.openaiModel}
                                            onValueChange={(value) => handleChange("openaiModel", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rapido)</SelectItem>
                                                <SelectItem value="gpt-4o">GPT-4o (Avancado)</SelectItem>
                                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Temperatura ({formData.temperature})</Label>
                                    <Input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Menor = respostas mais precisas, Maior = mais criativas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Max Tokens</Label>
                                    <Input
                                        type="number"
                                        min="100"
                                        max="2000"
                                        value={formData.maxTokens}
                                        onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tamanho maximo da resposta
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Prompt do Sistema</CardTitle>
                            <CardDescription>
                                Configure como a IA deve se comportar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Prompt Principal</Label>
                                <Textarea
                                    placeholder="Voce e um assistente virtual da empresa..."
                                    value={formData.systemPrompt}
                                    onChange={(e) => handleChange("systemPrompt", e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Instrucoes Adicionais</Label>
                                <Textarea
                                    placeholder="Seja educado e objetivo..."
                                    value={formData.instructions}
                                    onChange={(e) => handleChange("instructions", e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Base de Conhecimento</Label>
                                <Textarea
                                    placeholder="Informacoes sobre produtos, servicos, FAQ..."
                                    value={formData.knowledgeBase}
                                    onChange={(e) => handleChange("knowledgeBase", e.target.value)}
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Adicione informacoes que a IA deve saber sobre sua empresa
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Messages Configuration */}
                <TabsContent value="messages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mensagens Automaticas</CardTitle>
                            <CardDescription>
                                Configure as mensagens padrao do bot
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Mensagem de Boas-vindas</Label>
                                <Textarea
                                    placeholder="Ola! Bem-vindo a nossa empresa. Como posso ajudar?"
                                    value={formData.welcomeMessage}
                                    onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fora do Horario</Label>
                                <Textarea
                                    placeholder="Nosso horario de atendimento e de 08h as 18h. Retornaremos assim que possivel."
                                    value={formData.offHoursMessage}
                                    onChange={(e) => handleChange("offHoursMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Transferencia para Atendente</Label>
                                <Textarea
                                    placeholder="Um momento, estou transferindo voce para um atendente humano."
                                    value={formData.transferMessage}
                                    onChange={(e) => handleChange("transferMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fallback (nao entendeu)</Label>
                                <Textarea
                                    placeholder="Desculpe, nao entendi. Poderia reformular sua pergunta?"
                                    value={formData.fallbackMessage}
                                    onChange={(e) => handleChange("fallbackMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Erro Tecnico</Label>
                                <Textarea
                                    placeholder="Desculpe, estamos com dificuldades tecnicas. Um atendente entrara em contato."
                                    value={formData.errorMessage}
                                    onChange={(e) => handleChange("errorMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Despedida</Label>
                                <Textarea
                                    placeholder="Obrigado pelo contato! Ate a proxima!"
                                    value={formData.goodbyeMessage}
                                    onChange={(e) => handleChange("goodbyeMessage", e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Operating Hours */}
                <TabsContent value="hours" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horario de Funcionamento</CardTitle>
                            <CardDescription>
                                Configure quando o bot deve responder automaticamente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Ativar restricao de horario</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Fora do horario, o bot enviara mensagem de fora do horario
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.hoursEnabled}
                                    onCheckedChange={(checked) => handleChange("hoursEnabled", checked)}
                                />
                            </div>

                            {formData.hoursEnabled && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Inicio</Label>
                                            <Input
                                                type="time"
                                                value={formData.hoursStart}
                                                onChange={(e) => handleChange("hoursStart", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fim</Label>
                                            <Input
                                                type="time"
                                                value={formData.hoursEnd}
                                                onChange={(e) => handleChange("hoursEnd", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dias de funcionamento</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {daysOfWeek.map((day) => (
                                                <Button
                                                    key={day.id}
                                                    type="button"
                                                    variant={formData.workingDays.includes(day.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleDay(day.id)}
                                                >
                                                    {day.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Limits */}
                <TabsContent value="limits" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Limites e Controles</CardTitle>
                            <CardDescription>
                                Configure limites para evitar abusos e custos excessivos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Mensagens por Minuto</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.messagesPerMinute}
                                        onChange={(e) =>
                                            handleChange("messagesPerMinute", parseInt(e.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Limite de rate-limiting
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Timeout de Conversa (min)</Label>
                                    <Input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={formData.conversationTimeout}
                                        onChange={(e) =>
                                            handleChange("conversationTimeout", parseInt(e.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tempo de inatividade para fechar
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Max Mensagens IA por Conversa</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.maxAiMessages}
                                        onChange={(e) =>
                                            handleChange("maxAiMessages", parseInt(e.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Apos isso, transfere para humano
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Salvar Configuracoes
                </Button>
            </div>
        </div>
    );
}
