"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define types for navigation items
type NavItem = {
    href: string;
    label: string;
    icon: any; // Lucide icon component
    badge?: string;
    external?: boolean;
    locked?: boolean;
    subItems?: { href: string; label: string }[];
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
            { href: "/admin/chat", label: "Chat", icon: MessageSquare, badge: "Novo" },
            { href: "/admin/clientes", label: "Clientes", icon: Users },
            { href: "/admin/descontos", label: "Descontos", icon: Percent },
            { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
        ]
    },
    {
        title: "Loja Online",
        items: [
            { href: "/admin/site", label: "Layout", icon: LayoutTemplate },
            { href: "/admin/paginas", label: "Páginas", icon: FileText },
            { href: "/admin/blog", label: "Blog", icon: Rss, locked: true },
            { href: "/admin/menus", label: "Menus", icon: List },
            { href: "/admin/filtros", label: "Filtros", icon: Filter, locked: true },
            { href: "/admin/manutencao", label: "Página em construção", icon: Hammer },
            { href: "/", label: "Ver Loja", icon: ExternalLink, external: true },
        ]
    },
    {
        title: "Configurações",
        items: [
            { href: "/admin/configuracoes", label: "Geral", icon: Settings },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();

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

                                return (
                                    <div key={item.href}>
                                        <Link
                                            href={isLocked ? "#" : item.href}
                                            className={cn(
                                                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                                                isActive ? "bg-blue-50 text-blue-600" : "text-slate-600",
                                                isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                            )}
                                            onClick={(e) => isLocked && e.preventDefault()}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="h-5 w-5 opacity-70" />
                                                {item.label}
                                            </div>
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
                                        </Link>

                                        {/* SubItems Rendering */}
                                        {item.subItems && (isActive || item.subItems.some(sub => pathname.startsWith(sub.href))) && (
                                            <div className="mt-1 ml-9 space-y-1 border-l-2 border-slate-100 pl-2">
                                                {item.subItems.map(sub => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "block rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-blue-600",
                                                            pathname === sub.href ? "text-blue-600 font-bold" : "text-slate-500"
                                                        )}
                                                    >
                                                        {sub.label}
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
