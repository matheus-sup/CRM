import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600 animate-in fade-in zoom-in"
            aria-label="Fale conosco no WhatsApp"
        >
            <MessageCircle className="h-7 w-7" />
        </a>
    );
}
