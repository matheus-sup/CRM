"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    createChatRule,
    updateChatRule,
    deleteChatRule,
    simulateMessage,
} from "@/lib/actions/chat";
import {
    Plus,
    Trash2,
    Edit,
    Play,
    X,
    GripVertical,
    MessageSquare,
    ArrowRight,
    User,
    Bot,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatRule {
    id: string;
    name: string;
    triggers: string[];
    matchExact: boolean;
    stage: string | null;
    action: string;
    response: string | null;
    followUp: string | null;
    nextStage: string | null;
    isActive: boolean;
    order: number;
}

interface ChatRulesEditorProps {
    rules: ChatRule[];
    config: any;
}

const STAGES = [
    { id: "inicio", name: "Inicio", icon: "green", emoji: "🟢" },
    { id: "menu", name: "Menu", icon: "blue", emoji: "📋" },
    { id: "produtos", name: "Produtos", icon: "orange", emoji: "📦" },
    { id: "orcamento", name: "Orcamento", icon: "yellow", emoji: "💰" },
    { id: "atendimento", name: "Atendimento", icon: "purple", emoji: "💬" },
    { id: "transferido", name: "Transferido", icon: "red", emoji: "👤" },
    { id: "finalizado", name: "Finalizado", icon: "gray", emoji: "✅" },
];

const ACTIONS = [
    { id: "responder", name: "Responder", icon: MessageSquare },
    { id: "transferir_humano", name: "Transferir para Atendente", icon: User },
    { id: "finalizar", name: "Encerrar Conversa", icon: X },
    { id: "salvar_nome", name: "Salvar Nome do Cliente", icon: Edit },
];

export function ChatRulesEditor({ rules: initialRules, config }: ChatRulesEditorProps) {
    const [rules, setRules] = useState<ChatRule[]>(initialRules);
    const [editingRule, setEditingRule] = useState<ChatRule | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTrigger, setNewTrigger] = useState("");

    // Simulator state
    const [simMessage, setSimMessage] = useState("");
    const [simStage, setSimStage] = useState("inicio");
    const [simResult, setSimResult] = useState<any>(null);
    const [simulating, setSimulating] = useState(false);

    const { toast } = useToast();

    const handleCreateRule = () => {
        setEditingRule({
            id: "",
            name: "Nova Regra",
            triggers: [],
            matchExact: false,
            stage: null,
            action: "responder",
            response: "",
            followUp: null,
            nextStage: null,
            isActive: true,
            order: rules.length,
        });
        setIsDialogOpen(true);
    };

    const handleEditRule = (rule: ChatRule) => {
        setEditingRule({ ...rule });
        setIsDialogOpen(true);
    };

    const handleSaveRule = async () => {
        if (!editingRule) return;

        try {
            if (editingRule.id) {
                const updated = await updateChatRule(editingRule.id, {
                    name: editingRule.name,
                    triggers: editingRule.triggers,
                    matchExact: editingRule.matchExact,
                    stage: editingRule.stage,
                    action: editingRule.action,
                    response: editingRule.response || undefined,
                    followUp: editingRule.followUp,
                    nextStage: editingRule.nextStage,
                    isActive: editingRule.isActive,
                });
                setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            } else {
                const created = await createChatRule({
                    name: editingRule.name,
                    triggers: editingRule.triggers,
                    matchExact: editingRule.matchExact,
                    stage: editingRule.stage || undefined,
                    action: editingRule.action,
                    response: editingRule.response || undefined,
                    followUp: editingRule.followUp || undefined,
                    nextStage: editingRule.nextStage || undefined,
                });
                setRules((prev) => [...prev, created]);
            }

            setIsDialogOpen(false);
            setEditingRule(null);
            toast({ title: "Regra salva com sucesso" });
        } catch (error) {
            toast({ title: "Erro ao salvar regra", variant: "destructive" });
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm("Deseja excluir esta regra?")) return;

        try {
            await deleteChatRule(id);
            setRules((prev) => prev.filter((r) => r.id !== id));
            toast({ title: "Regra excluida" });
        } catch (error) {
            toast({ title: "Erro ao excluir regra", variant: "destructive" });
        }
    };

    const handleToggleRule = async (rule: ChatRule) => {
        try {
            const updated = await updateChatRule(rule.id, { isActive: !rule.isActive });
            setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } catch (error) {
            toast({ title: "Erro ao atualizar regra", variant: "destructive" });
        }
    };

    const addTrigger = () => {
        if (!newTrigger.trim() || !editingRule) return;
        if (editingRule.triggers.includes(newTrigger.trim().toLowerCase())) return;

        setEditingRule({
            ...editingRule,
            triggers: [...editingRule.triggers, newTrigger.trim().toLowerCase()],
        });
        setNewTrigger("");
    };

    const removeTrigger = (trigger: string) => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            triggers: editingRule.triggers.filter((t) => t !== trigger),
        });
    };

    const handleSimulate = async () => {
        if (!simMessage.trim()) return;

        setSimulating(true);
        try {
            const result = await simulateMessage(simMessage, simStage);
            setSimResult(result);
            if (result.proxima_etapa && result.proxima_etapa !== simStage) {
                setSimStage(result.proxima_etapa);
            }
        } catch (error) {
            toast({ title: "Erro ao simular", variant: "destructive" });
        }
        setSimulating(false);
        setSimMessage("");
    };

    // Group rules by stage
    const rulesByStage = STAGES.reduce((acc, stage) => {
        acc[stage.id] = rules.filter((r) => r.stage === stage.id);
        return acc;
    }, {} as Record<string, ChatRule[]>);

    const globalRules = rules.filter((r) => !r.stage);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Rules List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Regras de Automacao</h2>
                        <Button onClick={handleCreateRule} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Regra
                        </Button>
                    </div>

                    {/* Global Rules */}
                    {globalRules.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    <CardTitle className="text-base">Regras Globais</CardTitle>
                                    <Badge variant="secondary">{globalRules.length}</Badge>
                                </div>
                                <CardDescription>
                                    Ativam em qualquer etapa da conversa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {globalRules.map((rule) => (
                                        <RuleItem
                                            key={rule.id}
                                            rule={rule}
                                            onEdit={() => handleEditRule(rule)}
                                            onDelete={() => handleDeleteRule(rule.id)}
                                            onToggle={() => handleToggleRule(rule)}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rules by Stage */}
                    {STAGES.map((stage) => {
                        const stageRules = rulesByStage[stage.id];
                        if (stageRules.length === 0) return null;

                        return (
                            <Card key={stage.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <span>{stage.emoji}</span>
                                        <CardTitle className="text-base">{stage.name}</CardTitle>
                                        <Badge variant="secondary">{stageRules.length}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {stageRules.map((rule) => (
                                            <RuleItem
                                                key={rule.id}
                                                rule={rule}
                                                onEdit={() => handleEditRule(rule)}
                                                onDelete={() => handleDeleteRule(rule.id)}
                                                onToggle={() => handleToggleRule(rule)}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {rules.length === 0 && (
                        <Card className="py-12">
                            <CardContent className="text-center">
                                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="font-medium mb-2">Nenhuma regra criada</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Crie regras para automatizar respostas do bot
                                </p>
                                <Button onClick={handleCreateRule}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar Primeira Regra
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Simulator */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Simulador de Bot</CardTitle>
                            <CardDescription>
                                Teste como o bot responde as mensagens
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Etapa Atual</Label>
                                <Select value={simStage} onValueChange={setSimStage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STAGES.map((stage) => (
                                            <SelectItem key={stage.id} value={stage.id}>
                                                {stage.emoji} {stage.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Mensagem do Cliente</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Digite uma mensagem..."
                                        value={simMessage}
                                        onChange={(e) => setSimMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
                                    />
                                    <Button onClick={handleSimulate} disabled={simulating}>
                                        <Play className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {simResult && (
                                <div className="p-4 rounded-lg bg-muted space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={simResult.usou_ia ? "default" : "secondary"}>
                                            {simResult.usou_ia ? "IA" : "Regra"}
                                        </Badge>
                                        {simResult.regra && (
                                            <span className="text-sm text-muted-foreground">
                                                {simResult.regra}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-3 rounded bg-green-100 dark:bg-green-900/30">
                                        <p className="text-sm">{simResult.resposta}</p>
                                    </div>

                                    {simResult.followUp && (
                                        <div className="p-3 rounded bg-blue-100 dark:bg-blue-900/30">
                                            <p className="text-xs text-muted-foreground mb-1">Follow-up:</p>
                                            <p className="text-sm">{simResult.followUp}</p>
                                        </div>
                                    )}

                                    {simResult.proxima_etapa && simResult.proxima_etapa !== simStage && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <ArrowRight className="h-4 w-4" />
                                            <span>Proxima etapa: </span>
                                            <Badge>{simResult.proxima_etapa}</Badge>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Reference */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Etapas do Fluxo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {STAGES.map((stage) => (
                                <div
                                    key={stage.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span>{stage.emoji}</span>
                                    <span className="font-medium">{stage.name}</span>
                                    <Badge variant="outline" className="ml-auto">
                                        {rulesByStage[stage.id]?.length || 0}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Rule Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRule?.id ? "Editar Regra" : "Nova Regra"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure quando e como o bot deve responder
                        </DialogDescription>
                    </DialogHeader>

                    {editingRule && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome da Regra</Label>
                                <Input
                                    value={editingRule.name}
                                    onChange={(e) =>
                                        setEditingRule({ ...editingRule, name: e.target.value })
                                    }
                                    placeholder="Ex: Menu Principal"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Palavras-chave</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editingRule.triggers.map((trigger) => (
                                        <Badge key={trigger} variant="secondary" className="gap-1">
                                            {trigger}
                                            <button
                                                onClick={() => removeTrigger(trigger)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={newTrigger}
                                        onChange={(e) => setNewTrigger(e.target.value)}
                                        placeholder="Adicionar palavra-chave..."
                                        onKeyDown={(e) => e.key === "Enter" && addTrigger()}
                                    />
                                    <Button type="button" onClick={addTrigger} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingRule.matchExact}
                                    onCheckedChange={(checked) =>
                                        setEditingRule({ ...editingRule, matchExact: checked })
                                    }
                                />
                                <Label>Correspondencia exata</Label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ativar apenas na etapa</Label>
                                    <Select
                                        value={editingRule.stage || "_any"}
                                        onValueChange={(value) =>
                                            setEditingRule({
                                                ...editingRule,
                                                stage: value === "_any" ? null : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Qualquer etapa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_any">Qualquer etapa</SelectItem>
                                            {STAGES.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id}>
                                                    {stage.emoji} {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Acao</Label>
                                    <Select
                                        value={editingRule.action}
                                        onValueChange={(value) =>
                                            setEditingRule({ ...editingRule, action: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ACTIONS.map((action) => (
                                                <SelectItem key={action.id} value={action.id}>
                                                    {action.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Resposta</Label>
                                <Textarea
                                    value={editingRule.response || ""}
                                    onChange={(e) =>
                                        setEditingRule({ ...editingRule, response: e.target.value })
                                    }
                                    placeholder="O que o bot deve responder..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Mensagem adicional (Follow-up)</Label>
                                <Input
                                    value={editingRule.followUp || ""}
                                    onChange={(e) =>
                                        setEditingRule({
                                            ...editingRule,
                                            followUp: e.target.value || null,
                                        })
                                    }
                                    placeholder="Opcional: mensagem enviada apos a resposta"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ir para etapa</Label>
                                <Select
                                    value={editingRule.nextStage || "_keep"}
                                    onValueChange={(value) =>
                                        setEditingRule({
                                            ...editingRule,
                                            nextStage: value === "_keep" ? null : value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Manter etapa atual" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_keep">Manter etapa atual</SelectItem>
                                        {STAGES.map((stage) => (
                                            <SelectItem key={stage.id} value={stage.id}>
                                                {stage.emoji} {stage.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveRule}>Salvar Regra</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RuleItem({
    rule,
    onEdit,
    onDelete,
    onToggle,
}: {
    rule: ChatRule;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const action = ACTIONS.find((a) => a.id === rule.action);

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 transition-colors",
                !rule.isActive && "opacity-50"
            )}
        >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{rule.name}</span>
                    {rule.nextStage && (
                        <Badge variant="outline" className="text-xs gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {STAGES.find((s) => s.id === rule.nextStage)?.name}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {rule.triggers.slice(0, 5).map((trigger) => (
                        <Badge key={trigger} variant="secondary" className="text-xs">
                            {trigger}
                        </Badge>
                    ))}
                    {rule.triggers.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                            +{rule.triggers.length - 5}
                        </Badge>
                    )}
                </div>
            </div>

            <Badge variant={rule.action === "transferir_humano" ? "destructive" : "default"}>
                {action?.name || rule.action}
            </Badge>

            <Switch checked={rule.isActive} onCheckedChange={onToggle} />

            <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
}
