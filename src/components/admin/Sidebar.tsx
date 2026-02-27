"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
    ChevronRight,
    Puzzle,
    Calendar,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getTestUserTools } from "@/lib/actions/tools";

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
            { href: "/admin/clientes", label: "Clientes", icon: Users },
            { href: "/admin/descontos", label: "Descontos", icon: Percent },
            { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
            {
                href: "#",
                label: "Loja Online",
                icon: Globe,
                subItems: [
                    { href: "/admin/site", label: "Layout" },
                    { href: "/admin/blog", label: "Blog" },
                    { href: "/admin/filtros", label: "Filtros", locked: true },
                    { href: "/admin/manutencao", label: "Página em construção" },
                    { href: "/", label: "Ver Site", external: true },
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
            },
            {
                href: "#",
                label: "Loja de Ferramentas",
                icon: Puzzle,
                badge: "NOVO",
                subItems: [
                    { href: "/admin/ferramentas", label: "Ver Todas" },
                ]
            },
        ]
    }
];

// Mapeamento de slugs de ferramentas para rotas
const toolRouteMap: Record<string, string> = {
    "agendamentos-online": "/admin/agendamentos",
    "cardapio-digital": "/admin/cardapio",
    "delivery-proprio": "/admin/delivery",
    "comandas-digitais": "/admin/comandas",
    "reservas-mesas": "/admin/reservas",
    "catalogo-whatsapp": "/admin/catalogo-whatsapp",
    "programa-fidelidade": "/admin/fidelidade",
    "avaliacoes-reviews": "/admin/avaliacoes",
    "orcamentos-online": "/admin/orcamentos",
    "gift-cards": "/admin/gift-cards",
    "lista-presentes": "/admin/lista-presentes",
    "clube-assinaturas": "/admin/assinaturas",
    "chat-whatsapp": "/admin/chat",
    "venda-lentes-oticas": "/admin/ferramentas/lentes",
    "calculadoras-solar": "/admin/ferramentas/solar",
};

type ActiveTool = {
    id: string;
    slug: string;
    name: string;
};

export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [activeTools, setActiveTools] = useState<ActiveTool[]>([]);
    const [initialized, setInitialized] = useState(false);

    // Carregar ferramentas ativas do usuário
    const loadActiveTools = async () => {
        try {
            const userTools = await getTestUserTools();
            // Filtrar apenas ferramentas habilitadas (isEnabled === true)
            const tools = userTools
                .filter((ut: any) => ut.isEnabled === true)
                .map((ut: any) => ({
                    id: ut.tool.id,
                    slug: ut.tool.slug,
                    name: ut.tool.name,
                }));
            setActiveTools(tools);
        } catch (error) {
            console.error("Erro ao carregar ferramentas ativas:", error);
        }
    };

    // Carregar ao montar e quando pathname muda
    useEffect(() => {
        loadActiveTools();
    }, [pathname]);

    // Escutar evento customizado de atualização de ferramentas
    useEffect(() => {
        const handleToolsUpdate = () => {
            loadActiveTools();
        };
        window.addEventListener('tools-updated', handleToolsUpdate);
        return () => window.removeEventListener('tools-updated', handleToolsUpdate);
    }, []);

    // Initialize expanded state based on active path (only once)
    useEffect(() => {
        if (!initialized) {
            const initialExpanded: Record<string, boolean> = {};
            navSections.forEach(section => {
                section.items.forEach(item => {
                    if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href) && sub.href !== "#" && sub.href !== "/")) {
                        initialExpanded[item.label] = true;
                    }
                });
            });
            setExpanded(initialExpanded);
            setInitialized(true);
        }
    }, [pathname, initialized]);

    const toggleExpand = (label: string) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Gerar subitens dinâmicos para Loja de Ferramentas
    const getToolsSubItems = () => {
        const baseItems = [{ href: "/admin/ferramentas", label: "Ver Todas", badge: "NOVO" }];
        const toolItems = activeTools.map(tool => ({
            href: toolRouteMap[tool.slug] || `/admin/ferramentas/${tool.slug}`,
            label: tool.name,
        }));
        return [...baseItems, ...toolItems];
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white text-slate-600 z-20 relative">
            <div className="flex h-16 items-center justify-between px-6 border-b">
                <div className="flex items-center gap-2 text-blue-600">
                    <span className="text-xl font-bold">Admin</span>
                </div>
                <Link href="/" target="_blank" className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    Ver Site <ExternalLink className="h-3 w-3" />
                </Link>
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
                                // Para "Loja de Ferramentas", usar subitens dinâmicos
                                const dynamicSubItems = item.label === "Loja de Ferramentas" ? getToolsSubItems() : item.subItems;
                                const hasSubItems = dynamicSubItems && dynamicSubItems.length > 0;
                                const isExpanded = expanded[item.label] || false;

                                return (
                                    <div key={item.label}>
                                        {hasSubItems ? (
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
                                                    e.preventDefault();
                                                    toggleExpand(item.label);
                                                }}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <item.icon className="h-5 w-5 opacity-70" />
                                                    {item.label}
                                                </div>
                                                {item.badge && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight className={cn("h-4 w-4 transition-transform opacity-50", isExpanded && "rotate-90")} />
                                            </div>
                                        ) : (
                                            <Link
                                                href={isLocked ? "#" : item.href}
                                                className={cn(
                                                    "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                                                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-600",
                                                    isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent pointer-events-none"
                                                )}
                                                onClick={(e) => isLocked && e.preventDefault()}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
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
                                        )}

                                        {/* SubItems Rendering */}
                                        {hasSubItems && isExpanded && (
                                            <div className="mt-1 ml-9 space-y-1 border-l-2 border-slate-100 pl-2 animate-in slide-in-from-top-1 duration-200">
                                                {dynamicSubItems!.map(sub => (
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
                                                            {sub.badge && (
                                                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-200">
                                                                    {sub.badge}
                                                                </span>
                                                            )}
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
