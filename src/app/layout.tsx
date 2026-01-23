import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"; // Using Inter as standard font
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gut Cosméticos & Makes",
  description: "Sua loja de cosméticos favorita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
      </body>
    </html>
  );
}
