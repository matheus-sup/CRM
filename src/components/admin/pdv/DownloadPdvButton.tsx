"use client";

import { useEffect, useState } from "react";
import { Download, Check, Lock } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface DownloadPdvButtonProps {
    isProfessional?: boolean;
}

export function DownloadPdvButton({ isProfessional = false }: DownloadPdvButtonProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => {
            setInstalled(true);
            setDeferredPrompt(null);
        });

        if (window.matchMedia("(display-mode: standalone)").matches) {
            setInstalled(true);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    async function handleInstall() {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setInstalled(true);
            }
            setDeferredPrompt(null);
        } else {
            window.open("/pdv", "_blank");
        }
    }

    if (!isProfessional) {
        return (
            <span
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-lg text-sm font-medium cursor-not-allowed"
                title="Disponível apenas no plano Profissional"
            >
                <Lock className="h-4 w-4" />
                Download PDV
            </span>
        );
    }

    if (installed) {
        return (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                <Check className="h-4 w-4" />
                PDV Instalado
            </span>
        );
    }

    return (
        <button
            onClick={handleInstall}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
            <Download className="h-4 w-4" />
            Download PDV
        </button>
    );
}
