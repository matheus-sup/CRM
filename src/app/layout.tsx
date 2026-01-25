import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeInjector } from "@/components/theme-injector";
import { getStoreConfig } from "@/lib/actions/settings";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartSync } from "@/components/shop/CartSync";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { AnalyticsScripts } from "@/components/shop/AnalyticsScripts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gut Cosméticos & Makes",
  description: "Sua loja de cosméticos favorita",
};

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
          <ThemeInjector config={config} />
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
