"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Settings,
    Bot,
    BarChart3,
    Zap,
    Power,
    Users,
    Clock,
    TrendingUp,
    RefreshCw,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { ChatConversationsList } from "./ChatConversationsList";
import { ChatConfigForm } from "./ChatConfigForm";
import { ChatRulesEditor } from "./ChatRulesEditor";
import { ChatConversationView } from "./ChatConversationView";
import { toggleBot, syncEvolutionChats } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useChatNotifications } from "@/hooks/use-chat-notifications";

interface ChatDashboardProps {
    config: any;
    stats: {
        totalConversations: number;
        conversationsToday: number;
        messagesToday: number;
        activeConversations: number;
    };
    conversations: any[];
    rules: any[];
}

export function ChatDashboard({ config, stats, conversations, rules }: ChatDashboardProps) {
    const [botEnabled, setBotEnabled] = useState(config.botEnabled);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ chats: number; messages: number } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    // Enable notifications
    useChatNotifications(true, () => {
        setUnreadCount((prev) => prev + 1);
        // Don't auto-refresh the whole page - it causes scroll issues
        // User can manually refresh or the list will update when they navigate
    });

    // Reset unread when viewing conversations
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "conversations") {
            setUnreadCount(0);
        }
    };

    const handleToggleBot = async () => {
        const newState = await toggleBot();
        setBotEnabled(newState);
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await syncEvolutionChats();
            setSyncResult({ chats: result.importedChats, messages: result.importedMessages });
            router.refresh();
        } catch (error) {
            console.error("Sync error:", error);
        }
        setSyncing(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chat WhatsApp</h1>
                    <p className="text-muted-foreground">
                        Gerencie conversas e configure o bot de atendimento
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Sync Button */}
                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2"
                    >
                        {syncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : syncResult ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {syncing ? "Sincronizando..." : syncResult ? `${syncResult.chats} chats, ${syncResult.messages} msgs` : "Sincronizar"}
                    </Button>

                    {/* Bot Toggle */}
                    <div className="text-right text-sm">
                        <div className="text-muted-foreground">Status do Bot</div>
                        <div className={cn("font-medium", botEnabled ? "text-green-600" : "text-red-500")}>
                            {botEnabled ? "Ativo" : "Desativado"}
                        </div>
                    </div>
                    <Button
                        variant={botEnabled ? "default" : "outline"}
                        size="lg"
                        onClick={handleToggleBot}
                        className={cn(
                            "gap-2",
                            botEnabled && "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        <Power className="h-5 w-5" />
                        {botEnabled ? "Bot Ligado" : "Bot Desligado"}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalConversations}</div>
                        <p className="text-xs text-muted-foreground">Desde o inicio</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversas Hoje</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversationsToday}</div>
                        <p className="text-xs text-muted-foreground">Novas conversas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messagesToday}</div>
                        <p className="text-xs text-muted-foreground">Enviadas e recebidas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeConversations}</div>
                        <p className="text-xs text-muted-foreground">Em andamento</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Visao Geral</span>
                    </TabsTrigger>
                    <TabsTrigger value="conversations" className="gap-2 relative">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Conversas</span>
                        {unreadCount > 0 ? (
                            <Badge variant="destructive" className="ml-1 animate-pulse">
                                {unreadCount}
                            </Badge>
                        ) : stats.activeConversations > 0 ? (
                            <Badge variant="secondary" className="ml-1">
                                {stats.activeConversations}
                            </Badge>
                        ) : null}
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="hidden sm:inline">Automacao</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Configuracoes</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Recent Conversations */}
                        <Card className="flex flex-col max-h-[500px]">
                            <CardHeader className="shrink-0">
                                <CardTitle>Conversas Recentes</CardTitle>
                                <CardDescription>
                                    Ultimas conversas ativas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Nenhuma conversa ainda</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {conversations.map((conv) => (
                                            <div
                                                key={conv.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedConversation(conv.phoneNumber);
                                                    setActiveTab("conversations");
                                                }}
                                            >
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                                                    {conv.name?.charAt(0) || conv.phoneNumber.slice(-2)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {conv.name || formatPhone(conv.phoneNumber)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {conv.lastMessage || "Sem mensagens"}
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        conv.status === "active"
                                                            ? "default"
                                                            : conv.status === "waiting_human"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                >
                                                    {conv.status === "active"
                                                        ? "Ativo"
                                                        : conv.status === "waiting_human"
                                                        ? "Aguardando"
                                                        : "Fechado"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Bot Status & Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status do Bot</CardTitle>
                                <CardDescription>
                                    Configuracoes rapidas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Bot className={cn(
                                            "h-8 w-8",
                                            botEnabled ? "text-green-600" : "text-muted-foreground"
                                        )} />
                                        <div>
                                            <div className="font-medium">Bot de Atendimento</div>
                                            <div className="text-sm text-muted-foreground">
                                                {botEnabled ? "Respondendo automaticamente" : "Desativado"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "h-3 w-3 rounded-full",
                                        botEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border text-center">
                                        <div className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</div>
                                        <div className="text-xs text-muted-foreground">Regras Ativas</div>
                                    </div>
                                    <div className="p-3 rounded-lg border text-center">
                                        <div className="text-2xl font-bold">
                                            {config.aiProvider === "gemini" ? "Gemini" : config.aiProvider === "openai" ? "OpenAI" : "Nenhuma"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">IA Configurada</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Evolution API</span>
                                        <Badge variant={config.evolutionUrl ? "default" : "secondary"}>
                                            {config.evolutionUrl ? "Configurado" : "Nao configurado"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Horario de Funcionamento</span>
                                        <Badge variant={config.hoursEnabled ? "default" : "secondary"}>
                                            {config.hoursEnabled ? `${config.hoursStart} - ${config.hoursEnd}` : "24h"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Conversations Tab */}
                <TabsContent value="conversations" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <ChatConversationsList
                                conversations={conversations}
                                selectedPhone={selectedConversation}
                                onSelect={setSelectedConversation}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            {selectedConversation ? (
                                <ChatConversationView phoneNumber={selectedConversation} />
                            ) : (
                                <Card className="h-full min-h-[500px] flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Selecione uma conversa</p>
                                        <p className="text-sm">Clique em uma conversa na lista ao lado</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Automation Tab */}
                <TabsContent value="automation" className="space-y-4">
                    <ChatRulesEditor rules={rules} config={config} />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                    <ChatConfigForm config={config} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function formatPhone(phone: string) {
    if (!phone) return "-";

    // Check if it's a LID (internal WhatsApp ID) - not a real phone number
    if (phone.length > 15 && !/^\d+$/.test(phone)) {
        return `ID: ${phone.slice(0, 8)}...`;
    }

    const clean = phone.replace(/\D/g, "");
    if (clean.length === 11) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    if (clean.length === 13) {
        return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    return phone;
}
