import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"; // Using Inter as standard font
import { cn } from "@/lib/utils";
import { ThemeInjector } from "@/components/theme-injector";
import { getStoreConfig } from "@/lib/actions/settings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gut Cosméticos & Makes",
  description: "Sua loja de cosméticos favorita",
};

import { WhatsAppButton } from "@/components/whatsapp-button";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getStoreConfig();

  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
