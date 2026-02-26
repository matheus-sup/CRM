import { getChatConfig, getChatStats, getConversations, getChatRules } from "@/lib/actions/chat";
import { ChatDashboard } from "@/components/admin/chat/ChatDashboard";
import { isToolEnabled } from "@/lib/actions/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
    // Check if tool is enabled
    const toolEnabled = await isToolEnabled("chat-whatsapp");

    if (!toolEnabled) {
        return (
            <div className="flex-1 p-8 bg-slate-50 min-h-screen">
                <div className="max-w-2xl mx-auto mt-20">
                    <Card className="border-2 border-dashed border-slate-300">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto p-4 bg-blue-100 rounded-full w-fit mb-4">
                                <MessageSquare className="w-12 h-12 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">Chat WhatsApp</CardTitle>
                            <CardDescription className="text-base">
                                Central de atendimento via WhatsApp com inteligência artificial
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg py-3 px-4">
                                <Lock className="w-5 h-5" />
                                <span className="font-medium">Esta ferramenta não está ativada</span>
                            </div>

                            <div className="text-sm text-slate-600 space-y-2">
                                <p>Com o Chat WhatsApp você pode:</p>
                                <ul className="text-left max-w-sm mx-auto space-y-1">
                                    <li className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Automatizar respostas com IA
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Gerenciar todas as conversas em um só lugar
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Criar regras de resposta automática
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Receber notificações em tempo real
                                    </li>
                                </ul>
                            </div>

                            <Link href="/admin/ferramentas">
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Ativar na Loja de Ferramentas
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const [config, stats, conversations, rules] = await Promise.all([
        getChatConfig(),
        getChatStats(),
        getConversations(),
        getChatRules(),
    ]);

    return (
        <ChatDashboard
            config={config}
            stats={stats}
            conversations={conversations}
            rules={rules}
        />
    );
}
