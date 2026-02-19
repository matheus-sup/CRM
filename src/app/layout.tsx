import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn, serializeForClient } from "@/lib/utils";
import { ThemeInjector } from "@/components/theme-injector";
import { getStoreConfig } from "@/lib/actions/settings";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartSync } from "@/components/shop/CartSync";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AnalyticsScripts } from "@/components/shop/AnalyticsScripts";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();

  return {
    title: config.storeName || "Minha Loja",
    description: config.description || "Sua loja de cosméticos favorita",
    icons: {
      icon: (config.faviconUrl || "/favicon.ico") + "?v=" + Date.now(),
      shortcut: (config.faviconUrl || "/favicon.ico") + "?v=" + Date.now(),
      apple: (config.faviconUrl || "/favicon.ico") + "?v=" + Date.now(),
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
          <AnalyticsScripts />
          {children}
          <WhatsAppButton />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
