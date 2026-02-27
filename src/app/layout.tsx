import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Inter } from "next/font/google";
import { cn, serializeForClient } from "@/lib/utils";
import { ThemeInjector } from "@/components/theme-injector";
import { getStoreConfig } from "@/lib/actions/settings";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartSync } from "@/components/shop/CartSync";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AnalyticsScripts } from "@/components/shop/AnalyticsScripts";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  const v = Date.now();

  return {
    title: config.storeName || "NeoAutomation",
    description: config.description || "Sua loja de cosméticos favorita",
    icons: {
      icon: [
        { url: (config.faviconUrl || "/favicon.png") + "?v=" + v, sizes: "32x32", type: "image/png" },
        { url: (config.faviconUrl || "/favicon-16.png") + "?v=" + v, sizes: "16x16", type: "image/png" },
        { url: (config.faviconUrl || "/icon-192.png") + "?v=" + v, sizes: "192x192", type: "image/png" },
      ],
      shortcut: (config.faviconUrl || "/favicon.png") + "?v=" + v,
      apple: (config.faviconUrl || "/apple-touch-icon.png") + "?v=" + v,
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getStoreConfig();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >

          <CartSync />
          <Suspense fallback={null}>
            <AnalyticsScripts />
          </Suspense>
          {children}
          <WhatsAppButton />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
