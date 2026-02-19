"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    LogOut,
    LayoutTemplate,
    MessageSquare,
    BarChart3,
    Truck,
    CreditCard,
    Megaphone,
    Percent,
    Store,
    Smartphone,
    Instagram,
    Facebook,
    Globe,
    Grid,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    Rss,
    List,
    Filter,
    Share2,
    Hammer,
    Lock,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define types for navigation items
// Define types for navigation items
type NavItem = {
    href: string;
    label: string;
    icon: any; // Lucide icon component
    badge?: string;
    external?: boolean;
    locked?: boolean;
    subItems?: { href: string; label: string; external?: boolean; badge?: string; locked?: boolean }[];
};

type NavSection = {
    title: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        title: "",
        items: [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        ]
    },
    {
        title: "Gestão",
        items: [
            { href: "/admin/pdv", label: "PDV (Caixa)", icon: Store },
            { href: "/admin/pedidos", label: "Vendas", icon: ShoppingBag },
            {
                href: "/admin/produtos",
                label: "Produtos",
                icon: Package,
            },
            { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
            { href: "/admin/envios", label: "Envios", icon: Truck },
            { href: "/admin/chat", label: "Chat", icon: MessageSquare },
            { href: "/admin/clientes", label: "Clientes", icon: Users },
            { href: "/admin/descontos", label: "Descontos", icon: Percent },
            { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
            {
                href: "#",
                label: "Loja Online",
                icon: Globe,
                subItems: [
                    { href: "/admin/site", label: "Layout" },
                    { href: "/admin/blog", label: "Blog", locked: true },
                    { href: "/admin/filtros", label: "Filtros", locked: true },
                    { href: "/admin/manutencao", label: "Página em construção" },
                    { href: "/", label: "Ver Loja", external: true },
                ]
            },
            {
                href: "#",
                label: "Integrações",
                icon: Share2,
                subItems: [
                    { href: "/admin/configuracoes?tab=canal-facebook", label: "Instagram e Facebook", locked: true },
                    { href: "/admin/configuracoes?tab=canal-google", label: "Google Shopping", locked: true },
                    { href: "/admin/configuracoes?tab=canal-tiktok", label: "TikTok", locked: true },
                    { href: "/admin/configuracoes?tab=apple-google-login", label: "Login Social" },
                    { href: "/admin/configuracoes?tab=whatsapp", label: "Botão de WhatsApp" },
                    { href: "/admin/configuracoes?tab=emails", label: "E-mails Automáticos", locked: true },
                    { href: "/admin/configuracoes?tab=cd", label: "Centros de Distribuição", locked: true },
                    { href: "/admin/configuracoes?tab=usuarios", label: "Usuários e Notificações", locked: true },
                    { href: "/admin/configuracoes?tab=dominios", label: "Domínios", locked: true },
                    { href: "/admin/configuracoes?tab=seo", label: "SEO / Códigos", locked: true },
                    { href: "/admin/configuracoes?tab=idiomas", label: "Idiomas e Moedas", locked: true },
                ]
            }
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Initialize expanded state based on active path
    if (Object.keys(expanded).length === 0) {
        navSections.forEach(section => {
            section.items.forEach(item => {
                if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href) && sub.href !== "#")) {
                    // User preference override logic if needed
                }
            });
        });
    }

    const toggleExpand = (label: string) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white text-slate-600">
            <div className="flex h-16 items-center px-6 border-b">
                {/* Logo Placeholder - Keeping it simple/whitelabel as requested */}
                <div className="flex items-center gap-2 text-blue-600">
                    <span className="text-xl font-bold">Admin</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                {navSections.map((section, idx) => (
                    <div key={idx}>
                        {section.title && (
                            <h3 className="mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {section.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                                const isLocked = item.locked;
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isExpanded = expanded[item.label] ?? (hasSubItems && item.subItems?.some(sub => pathname.startsWith(sub.href) && sub.href !== "#"));

                                return (
                                    <div key={item.label}>
                                        <div
                                            className={cn(
                                                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 cursor-pointer",
                                                isActive ? "bg-blue-50 text-blue-600" : "text-slate-600",
                                                isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                            )}
                                            onClick={(e) => {
                                                if (isLocked) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                if (hasSubItems) {
                                                    e.preventDefault();
                                                    toggleExpand(item.label);
                                                }
                                            }}
                                        >
                                            {hasSubItems ? (
                                                <div className="flex items-center gap-3 flex-1">
                                                    <item.icon className="h-5 w-5 opacity-70" />
                                                    {item.label}
                                                </div>
                                            ) : (
                                                <Link href={item.href} className="flex items-center gap-3 flex-1">
                                                    <item.icon className="h-5 w-5 opacity-70" />
                                                    {item.label}
                                                </Link>
                                            )}

                                            {item.badge && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.locked && (
                                                <Lock className="h-3 w-3 opacity-40" />
                                            )}
                                            {item.external && !item.locked && (
                                                <ExternalLink className="h-3 w-3 opacity-40" />
                                            )}
                                            {hasSubItems && (
                                                <ChevronRight className={cn("h-4 w-4 transition-transform opacity-50", isExpanded && "rotate-90")} />
                                            )}
                                        </div>

                                        {/* SubItems Rendering */}
                                        {hasSubItems && isExpanded && (
                                            <div className="mt-1 ml-9 space-y-1 border-l-2 border-slate-100 pl-2 animate-in slide-in-from-top-1 duration-200">
                                                {item.subItems!.map(sub => (
                                                    <Link
                                                        key={sub.label}
                                                        href={sub.locked ? "#" : sub.href}
                                                        target={sub.external ? "_blank" : undefined}
                                                        className={cn(
                                                            "flex justify-between items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-blue-600",
                                                            pathname === sub.href ? "text-blue-600 font-bold" : "text-slate-500",
                                                            sub.locked && "opacity-50 cursor-not-allowed hover:text-slate-500"
                                                        )}
                                                        onClick={(e) => sub.locked && e.preventDefault()}
                                                    >
                                                        {sub.label}
                                                        <div className="flex items-center gap-2">
                                                            {sub.locked && <Lock className="h-3 w-3 opacity-40" />}
                                                            {sub.external && !sub.locked && <ExternalLink className="h-3 w-3 opacity-40" />}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

        </aside>
    );
}
