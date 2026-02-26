"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConversations } from "@/lib/actions/chat";

interface Conversation {
    id: string;
    phoneNumber: string;
    name: string | null;
    status: string;
    stage: string;
    messageCount: number;
    lastMessage: string | null;
    updatedAt: string;
}

interface ChatConversationsListProps {
    conversations: Conversation[];
    selectedPhone: string | null;
    onSelect: (phone: string) => void;
}

export function ChatConversationsList({
    conversations: initialConversations,
    selectedPhone,
    onSelect,
}: ChatConversationsListProps) {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState(initialConversations);
    const [refreshing, setRefreshing] = useState(false);

    // Auto-refresh conversations every 3 seconds
    const refreshConversations = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const updated = await getConversations();
            setConversations(updated);
        } catch (error) {
            console.error("Error refreshing conversations:", error);
        }
        if (showSpinner) setRefreshing(false);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => refreshConversations(false), 3000);
        return () => clearInterval(interval);
    }, [refreshConversations]);

    const filteredConversations = conversations.filter((conv) => {
        const searchLower = search.toLowerCase();
        return (
            conv.phoneNumber.includes(searchLower) ||
            conv.name?.toLowerCase().includes(searchLower) ||
            conv.lastMessage?.toLowerCase().includes(searchLower)
        );
    });

    const handleRefresh = () => {
        refreshConversations(true);
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Conversas</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar conversa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground px-4">
                            <p>Nenhuma conversa encontrada</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={cn(
                                        "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                                        selectedPhone === conv.phoneNumber && "bg-muted"
                                    )}
                                    onClick={() => onSelect(conv.phoneNumber)}
                                >
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium shrink-0">
                                        {conv.name?.charAt(0).toUpperCase() || conv.phoneNumber.slice(-2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium truncate">
                                                {conv.name || formatPhone(conv.phoneNumber)}
                                            </span>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {formatTime(conv.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <span className="text-sm text-muted-foreground truncate">
                                                {conv.lastMessage || "Sem mensagens"}
                                            </span>
                                            <Badge
                                                variant={
                                                    conv.status === "active"
                                                        ? "default"
                                                        : conv.status === "waiting_human"
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                                className="shrink-0 text-xs"
                                            >
                                                {conv.status === "active"
                                                    ? conv.stage
                                                    : conv.status === "waiting_human"
                                                    ? "Aguardando"
                                                    : "Fechado"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function formatPhone(phone: string) {
    if (!phone) return "-";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 11) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    if (clean.length === 13) {
        return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    return phone;
}

function formatTime(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
