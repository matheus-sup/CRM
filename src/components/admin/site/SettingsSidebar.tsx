"use client";

import { LucideIcon, Palette, Type, LayoutTemplate, Home, ShoppingBag, Phone, Grid, Tag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
    id: string;
    label: string;
    icon: LucideIcon;
    subSections?: Section[];
}

export const SETTINGS_SECTIONS: Section[] = [
    { id: "layout", label: "Layout", icon: LayoutTemplate },
    { id: "branding", label: "Imagem da sua marca", icon: LayoutTemplate },
    { id: "colors", label: "Cores da sua marca", icon: Palette },
    { id: "typography", label: "Tipo de Letra", icon: Type },
    { id: "header", label: "Cabeçalho", icon: LayoutTemplate },
    { id: "home", label: "Página inicial", icon: Home },
    { id: "products-list", label: "Lista de produtos", icon: Grid },
    { id: "products-detail", label: "Detalhe do produto", icon: Tag },
    { id: "cart", label: "Carrinho de compras", icon: ShoppingCart },
    { id: "footer", label: "Rodapé da página", icon: LayoutTemplate },
    { id: "contact", label: "Dados de contato", icon: Phone },
];

export function SettingsSidebar({ activeSection, onSelect, iconOnly }: { activeSection: string, onSelect: (id: string) => void, iconOnly?: boolean }) {
    return (
        <div className="w-full h-full overflow-y-auto bg-slate-50">
            <div className={cn("py-4", iconOnly ? "px-2" : "px-4")}>
                {!iconOnly && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Configurações</h2>}
                <nav className="space-y-1">
                    {SETTINGS_SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => onSelect(section.id)}
                            title={iconOnly ? section.label : undefined}
                            className={cn(
                                "flex items-center gap-3 w-full py-2 text-sm font-medium rounded-md transition-colors",
                                iconOnly ? "justify-center px-0 h-10 w-10 mx-auto" : "px-3",
                                activeSection === section.id
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                            )}
                        >
                            <section.icon className="h-5 w-5" />
                            {!iconOnly && section.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
