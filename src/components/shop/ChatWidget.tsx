"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSend = () => {
        // For MVP: Redirect to WhatsApp with the message
        const phoneNumber = "5511999999999";
        const message = "Olá! Gostaria de falar com um atendente.";
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={handleOpen}
                    className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                >
                    <MessageCircle className="h-8 w-8 text-white" />
                    <span className="sr-only">Abrir Chat</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 md:px-0">
            <Card className="shadow-2xl border-primary/20">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        <CardTitle className="text-base">Chat Online</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="text-primary-foreground hover:bg-primary/80 h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4 bg-white/95 backdrop-blur">
                    <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                        Olá! 👋 <br />
                        Como podemos te ajudar hoje?
                    </div>

                    <Textarea placeholder="Digite sua mensagem..." className="resize-none" />

                    <Button onClick={handleSend} className="w-full gap-2 font-bold">
                        <Send className="h-4 w-4" />
                        Iniciar Conversa no WhatsApp
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                        Powered by Bkaiser Solution
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
