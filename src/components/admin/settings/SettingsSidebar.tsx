"use client";

import {
    CreditCard, Truck, Warehouse, Phone, MessageCircle, Mail,
    ShoppingCart, MessageSquare, Users, Globe, Code, Languages,
    ArrowRightLeft, FileText, Layout, File, Rss, Menu, Filter, Share2,
    Hammer, Lock, Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SettingsSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {

    const menuGroups = [
        {
            title: "Loja online",
            items: [
                { id: "layout", label: "Layout", icon: Layout }, // Requested lock
                { id: "paginas", label: "Páginas", icon: File },
                { id: "blog", label: "Blog", icon: Rss, badge: "Novo", locked: true },
                { id: "menus", label: "Menus", icon: Menu },
                { id: "filtros", label: "Filtros", icon: Filter, locked: true },
                { id: "redes-sociais", label: "Links de redes sociais", icon: Share2 },
                { id: "em-construcao", label: "Página em construção", icon: Hammer },
            ]
        },
        {
            title: "Integração Vendas Redes Sociais",
            items: [
                { id: "canal-facebook", label: "Instagram e Facebook", icon: Share2, locked: true },
                { id: "canal-google", label: "Google Shopping", icon: Globe, locked: true },
                { id: "canal-tiktok", label: "TikTok", icon: MessageSquare, locked: true },
            ]
        },
        {
            title: "Comunicação",
            items: [
                { id: "contato", label: "Informação de contato", icon: Phone },
                { id: "whatsapp", label: "Botão de WhatsApp", icon: MessageCircle },
                { id: "emails", label: "E-mails automáticos", icon: Mail, locked: true },
            ]
        },
        {
            title: "Pagamentos e envios",
            items: [
                { id: "pagamento", label: "Meios de pagamento", icon: CreditCard, locked: true },
                { id: "envio", label: "Meios de envio", icon: Truck, locked: true },
                { id: "cd", label: "Centros de distribuição", icon: Warehouse, locked: true },
            ]
        },
        {
            title: "Outros",
            items: [
                { id: "identidade", label: "Marca e Cores (Visual)", icon: Layout }, // Kept existing
                { id: "usuarios", label: "Usuários e notificações", icon: Users, locked: true },
                { id: "dominios", label: "Domínios", icon: Globe, locked: true },
                { id: "seo", label: "SEO / Códigos externos", icon: Code, locked: true },
                { id: "idiomas", label: "Idiomas e moedas", icon: Languages, locked: true },
            ]
        }
    ];

    return (
        <div className="w-64 bg-slate-50 border-r min-h-[calc(100vh-4rem)] p-4 space-y-8">
            {menuGroups.map((group, idx) => (
                <div key={idx}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                        {group.title}
                    </h3>
                    <div className="space-y-1">
                        {group.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => !item.locked && onTabChange(item.id)}
                                disabled={item.locked}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all",
                                    activeTab === item.id
                                        ? "bg-blue-100 text-blue-700"
                                        : item.locked
                                            ? "text-slate-400 cursor-not-allowed opacity-60"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </div>
                                {item.locked && <Lock className="h-3 w-3 opacity-50" />}
                                {item.badge && !item.locked && (
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 rounded-full">{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
