"use client";

import Link from "next/link";
import { useState } from "react";
import {
    CreditCard, Truck, Warehouse, Phone, MessageCircle, Mail,
    ShoppingCart, MessageSquare, Users, Globe, Code, Languages,
    ArrowRightLeft, FileText, Layout, File, Rss, Menu, Filter, Share2,
    Hammer, Lock, Image, ChevronDown, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SettingsSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {

    const menuGroups = [
        // Loja Online removed as migrated to main sidebar
        // ... (rest of the groups unchanged)
        {
            title: "Integração Vendas Redes Sociais",
            items: [
                { id: "canal-facebook", label: "Instagram e Facebook", icon: Share2, locked: true },
                { id: "canal-google", label: "Google Shopping", icon: Globe, locked: true },
                { id: "canal-tiktok", label: "TikTok", icon: MessageSquare, locked: true },
                { id: "apple-google-login", label: "Login Social (Apple/Google)", icon: Lock, locked: false },
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
                { id: "pagamento", label: "Meios de pagamento", icon: CreditCard, locked: false },
                { id: "envio", label: "Meios de envio", icon: Truck },
                { id: "cd", label: "Centros de distribuição", icon: Warehouse, locked: true },
            ]
        },
        {
            title: "Outros",
            items: [
                { id: "usuarios", label: "Usuários e notificações", icon: Users, locked: true },
                { id: "dominios", label: "Domínios", icon: Globe, locked: true },
                { id: "seo", label: "SEO / Códigos externos", icon: Code, locked: true },
                { id: "idiomas", label: "Idiomas e moedas", icon: Languages, locked: true },
            ]
        }
    ];

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Loja online": true,
        "Integração Vendas Redes Sociais": false,
        "Comunicação": false,
        "Pagamentos e envios": false,
        "Outros": false
    });

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <div className="w-64 bg-slate-50 border-r min-h-[calc(100vh-4rem)] p-4 space-y-4">
            {menuGroups.map((group, idx) => (
                <div key={idx}>
                    <button
                        onClick={() => toggleGroup(group.title)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 transition-colors"
                    >
                        {group.title}
                        {openGroups[group.title] ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {openGroups[group.title] && (
                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                            {group.items.map((item: any) => {
                                if (item.href) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.locked ? "#" : item.href}
                                            target={item.external ? "_blank" : undefined}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all",
                                                activeTab === item.id
                                                    ? "bg-blue-100 text-blue-700"
                                                    : item.locked
                                                        ? "text-slate-400 cursor-not-allowed opacity-60"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            )}
                                            onClick={(e) => item.locked && e.preventDefault()}
                                        >
                                            <div className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.locked && <Lock className="h-3 w-3 opacity-50" />}
                                            {item.external && !item.locked && <ArrowRightLeft className="h-3 w-3 opacity-50 rotate-45" />}
                                        </Link>
                                    );
                                }

                                return (
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
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
