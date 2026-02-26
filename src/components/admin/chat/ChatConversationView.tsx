"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Play, MoreVertical, Phone, Smile, Image as ImageIcon, X } from "lucide-react";
import { getConversation, sendWhatsAppMessage, sendWhatsAppImage, resumeBot } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ChatConversationViewProps {
    phoneNumber: string;
}

interface Message {
    id: string;
    messageId: string | null;
    content: string;
    direction: string;
    isAiGenerated: boolean;
    ruleName: string | null;
    mediaType: string | null;
    mediaUrl: string | null;
    createdAt: string | Date;
}

interface Conversation {
    id: string;
    phoneNumber: string;
    name: string | null;
    status: string;
    stage: string;
    messages: Message[];
}

// Emojis comuns organizados por categoria
const EMOJI_CATEGORIES = {
    "Mais usados": ["😊", "👍", "❤️", "😂", "🙏", "😍", "🔥", "✅", "👋", "💪", "🎉", "😁"],
    "Rostos": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝"],
    "Gestos": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏"],
    "Objetos": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "⭐", "🌟", "✨", "💫", "🔥", "💯", "✅", "❌"],
};

export function ChatConversationView({ phoneNumber }: ChatConversationViewProps) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevMessagesLengthRef = useRef<number>(0);

    useEffect(() => {
        loadConversation(true); // Show loading on first load
        // Auto-refresh conversation every 2 seconds for real-time updates
        const interval = setInterval(() => loadConversation(false), 2000);
        return () => clearInterval(interval);
    }, [phoneNumber]);

    useEffect(() => {
        // Only scroll if there are new messages (not on re-render)
        const currentLength = conversation?.messages?.length || 0;
        if (currentLength > prevMessagesLengthRef.current) {
            scrollToBottom();
        }
        prevMessagesLengthRef.current = currentLength;
    }, [conversation?.messages?.length]);

    const loadConversation = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const data = await getConversation(phoneNumber);
            setConversation(data);
        } catch (error) {
            console.error("Error loading conversation:", error);
        }
        if (showLoading) setLoading(false);
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const handleSendMessage = async () => {
        if (sending) return;

        // Se tem imagem selecionada, envia a imagem
        if (selectedImage) {
            await handleSendImage();
            return;
        }

        if (!message.trim()) return;

        setSending(true);
        try {
            await sendWhatsAppMessage(phoneNumber, message);
            setMessage("");
            await loadConversation();
        } catch (error: any) {
            console.error("Error sending message:", error);
            alert(error.message || "Erro ao enviar mensagem");
        }
        setSending(false);
    };

    const handleSendImage = async () => {
        if (!selectedImage) return;

        setSending(true);
        try {
            // Comprimir e converter imagem para base64
            const base64 = await compressAndConvertToBase64(selectedImage);
            await sendWhatsAppImage(phoneNumber, base64, message || undefined);
            setMessage("");
            setSelectedImage(null);
            setImagePreview(null);
            await loadConversation();
        } catch (error: any) {
            console.error("Error sending image:", error);
            alert(error.message || "Erro ao enviar imagem");
        }
        setSending(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 16 * 1024 * 1024) {
                alert("Imagem muito grande. Máximo 16MB.");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setShowEmoji(false);
    };

    const handleResumeBot = async () => {
        try {
            await resumeBot(phoneNumber);
            await loadConversation();
        } catch (error) {
            console.error("Error resuming bot:", error);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (loading) {
        return (
            <Card className="h-full min-h-[500px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </Card>
        );
    }

    if (!conversation) {
        return (
            <Card className="h-full min-h-[500px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p>Conversa não encontrada</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full min-h-[500px] flex flex-col">
            {/* Header */}
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                            {conversation.name?.charAt(0).toUpperCase() || conversation.phoneNumber.slice(-2)}
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {conversation.name || formatPhone(conversation.phoneNumber)}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatPhone(conversation.phoneNumber)}</span>
                                <Badge
                                    variant={
                                        conversation.status === "active"
                                            ? "default"
                                            : conversation.status === "waiting_human"
                                            ? "destructive"
                                            : "secondary"
                                    }
                                >
                                    {conversation.status === "active"
                                        ? `Etapa: ${conversation.stage}`
                                        : conversation.status === "waiting_human"
                                        ? "Aguardando atendente"
                                        : "Fechado"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {conversation.status === "waiting_human" && (
                            <Button variant="outline" size="sm" onClick={handleResumeBot} className="gap-2">
                                <Play className="h-4 w-4" />
                                Retomar Bot
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Ligar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            {/* Messages */}
            <CardContent
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-350px)]"
            >
                {conversation.messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Nenhuma mensagem ainda</p>
                    </div>
                ) : (
                    conversation.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2",
                                msg.direction === "out" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.direction === "in" && (
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-slate-600" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[70%] rounded-2xl px-4 py-2",
                                    msg.direction === "out"
                                        ? "bg-green-600 text-white rounded-br-sm"
                                        : "bg-slate-100 text-slate-900 rounded-bl-sm"
                                )}
                            >
                                {/* Renderizar imagem */}
                                {msg.mediaType === "image" && msg.mediaUrl && (
                                    <div className="mb-2">
                                        <img
                                            src={msg.mediaUrl}
                                            alt="Imagem"
                                            className="rounded-lg max-w-full max-h-64 cursor-pointer"
                                            onClick={() => window.open(msg.mediaUrl!, "_blank")}
                                        />
                                    </div>
                                )}

                                {/* Renderizar áudio */}
                                {msg.mediaType === "audio" && (
                                    <AudioPlayer messageId={msg.messageId} />
                                )}

                                {/* Renderizar vídeo */}
                                {msg.mediaType === "video" && msg.mediaUrl && (
                                    <div className="mb-2">
                                        <video
                                            controls
                                            className="rounded-lg max-w-full max-h-64"
                                        >
                                            <source src={msg.mediaUrl} type="video/mp4" />
                                            Seu navegador não suporta vídeo.
                                        </video>
                                    </div>
                                )}

                                {/* Renderizar documento */}
                                {msg.mediaType === "document" && msg.mediaUrl && (
                                    <div className="mb-2">
                                        <a
                                            href={msg.mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "flex items-center gap-2 underline",
                                                msg.direction === "out" ? "text-white" : "text-blue-600"
                                            )}
                                        >
                                            📎 Baixar documento
                                        </a>
                                    </div>
                                )}

                                {/* Texto da mensagem */}
                                {msg.content && !msg.content.startsWith("[") && (
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                )}
                                <div
                                    className={cn(
                                        "flex items-center gap-2 mt-1 text-xs",
                                        msg.direction === "out" ? "text-green-100" : "text-slate-500"
                                    )}
                                >
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {msg.isAiGenerated && (
                                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                            IA
                                        </Badge>
                                    )}
                                    {msg.ruleName && (
                                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                            {msg.ruleName}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {msg.direction === "out" && (
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            {/* Image Preview */}
            {imagePreview && (
                <div className="px-4 pb-2">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 rounded-lg border"
                        />
                        <button
                            onClick={clearSelectedImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex gap-2 items-center">
                    {/* Emoji Picker */}
                    <Popover open={showEmoji} onOpenChange={setShowEmoji}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <Smile className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2" align="start">
                            <div className="space-y-3">
                                {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                                    <div key={category}>
                                        <p className="text-xs text-muted-foreground mb-1">{category}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {emojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleEmojiSelect(emoji)}
                                                    className="text-xl hover:bg-muted p-1 rounded transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Image Upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>

                    {/* Message Input */}
                    <Input
                        placeholder={selectedImage ? "Adicione uma legenda..." : "Digite sua mensagem..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        disabled={sending}
                        className="flex-1"
                    />

                    {/* Send Button */}
                    <Button
                        onClick={handleSendMessage}
                        disabled={sending || (!message.trim() && !selectedImage)}
                        className="shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Componente para reproduzir áudio
function AudioPlayer({ messageId }: { messageId: string | null }) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const loadAudio = async () => {
        if (!messageId || loading || audioUrl) return;

        setLoading(true);
        setError(false);

        try {
            const response = await fetch(`/api/chat/media/${messageId}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } else {
                setError(true);
            }
        } catch (e) {
            console.error("Error loading audio:", e);
            setError(true);
        }
        setLoading(false);
    };

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm opacity-70">
                <span>🎵</span>
                <span>Áudio não disponível</span>
            </div>
        );
    }

    if (!audioUrl) {
        return (
            <button
                onClick={loadAudio}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
                {loading ? (
                    <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Carregando...</span>
                    </>
                ) : (
                    <>
                        <span>▶️</span>
                        <span>Reproduzir áudio</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <audio controls className="max-w-full" style={{ minWidth: "200px" }}>
            <source src={audioUrl} type="audio/ogg" />
            <source src={audioUrl} type="audio/mpeg" />
            Seu navegador não suporta áudio.
        </audio>
    );
}

function compressAndConvertToBase64(file: File, maxWidth = 3840, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Redimensionar se necessário (4K max = 3840px)
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Não foi possível processar a imagem"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Converter para base64 com boa qualidade
                const dataUrl = canvas.toDataURL("image/jpeg", quality);
                const base64 = dataUrl.split(",")[1];
                resolve(base64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
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

function formatTime(dateStr: string | Date) {
    if (!dateStr) return "-";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
