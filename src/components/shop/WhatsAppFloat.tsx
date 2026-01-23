"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppFloat() {
    const phoneNumber = "5511999999999"; // Replace with real number from config
    const message = "Olá! Gostaria de tirar uma dúvida sobre os produtos da Gut Cosméticos.";

    const openWhatsApp = () => {
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={openWhatsApp}
                className="h-14 w-14 rounded-full bg-green-500 shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
            >
                <MessageCircle className="h-8 w-8 text-white" />
            </Button>
            {/* Optional: EvolutionAPI Chat Widget could be embedded here instead */}
        </div>
    );
}
