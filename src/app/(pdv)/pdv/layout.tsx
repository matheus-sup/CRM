import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "PDV - Frente de Caixa",
    description: "Sistema de Ponto de Venda - Frente de Caixa",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon.png", sizes: "32x32", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        shortcut: "/favicon.png",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "PDV",
    },
    applicationName: "PDV",
};

export const viewport: Viewport = {
    themeColor: "#1e293b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function PdvLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
