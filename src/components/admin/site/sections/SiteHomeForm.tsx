"use client";

import { useActionState, useState, useEffect } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = { success: false, message: "" };

interface HomeSection {
    id: string;
    label: string;
    enabled: boolean;
}

const DEFAULT_SECTIONS: HomeSection[] = [
    { id: "hero", label: "Banners (Topo)", enabled: true },
    { id: "categories-main", label: "Categorias Principais", enabled: true },
    { id: "products-new", label: "Lançamentos", enabled: true },
    { id: "banners-categories", label: "Banners (Categorias)", enabled: true },
    { id: "products-featured", label: "Em Destaque", enabled: true },
    { id: "brands", label: "Marcas", enabled: true },
    { id: "products-offers", label: "Ofertas", enabled: true },
    { id: "instagram", label: "Instagram", enabled: true },
    { id: "info-shipping", label: "Barra de Info", enabled: true },
    { id: "newsletter", label: "Newsletter", enabled: true },
    { id: "banners-promo", label: "Banners Promo", enabled: true },
    { id: "testimonials", label: "Depoimentos", enabled: true },
];

interface SiteHomeFormProps {
    config: any;
    onEdit?: (sectionId: string) => void;
}

export function SiteHomeForm({ config, onEdit }: SiteHomeFormProps) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    // Parse initial layout or use default
    // Parse initial layout or use default
    const [sections, setSections] = useState<HomeSection[]>(() => {
        try {
            if (config.homeLayout) {
                const parsed = JSON.parse(config.homeLayout);
                // Merge saved state with latest DEFAULT labels
                // We map over the SAVED layout to keep order, but look up the DEFAULT label
                let merged = parsed.map((savedItem: HomeSection) => {
                    const defaultItem = DEFAULT_SECTIONS.find(d => d.id === savedItem.id);
                    return {
                        ...savedItem,
                        label: defaultItem ? defaultItem.label : savedItem.label // Prefer new label
                    };
                });

                // Add any new default sections that might be missing from saved config
                DEFAULT_SECTIONS.forEach(def => {
                    if (!merged.find((s: HomeSection) => s.id === def.id)) {
                        merged.push(def);
                    }
                });
                return merged;
            }
        } catch (e) {
            console.error("Error parsing homeLayout", e);
        }
        return DEFAULT_SECTIONS;
    });

    // Update hidden input when state changes
    useEffect(() => {
        const input = document.getElementById("homeLayout-input") as HTMLInputElement;
        if (input) input.value = JSON.stringify(sections);
    }, [sections]);

    const toggleSection = (index: number) => {
        const newSections = [...sections];
        newSections[index].enabled = !newSections[index].enabled;
        setSections(newSections);
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newSections[targetIndex];
        newSections[targetIndex] = newSections[index];
        newSections[index] = temp;
        setSections(newSections);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" /> Organização da Página Inicial
                </CardTitle>
                <CardDescription>Arraste para reordenar ou oculte seções.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">

                    <div className="space-y-2">
                        {sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={cn(
                                    "flex items-center gap-2 p-2 border rounded-lg bg-white transition-all",
                                    !section.enabled && "opacity-60 bg-slate-50 border-dashed"
                                )}
                            >
                                {/* Left: Grip + Label */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700 text-xs leading-tight">
                                        {section.label}
                                    </span>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                    {/* Edit Button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={() => onEdit && onEdit(section.id)}
                                        title="Editar Conteúdo"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-400"
                                        disabled={index === 0}
                                        onClick={() => moveSection(index, 'up')}
                                        title="Mover para cima"
                                    >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-400"
                                        disabled={index === sections.length - 1}
                                        onClick={() => moveSection(index, 'down')}
                                        title="Mover para baixo"
                                    >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-7 w-7", section.enabled ? "text-slate-600" : "text-slate-400")}
                                        onClick={() => toggleSection(index)}
                                        title={section.enabled ? "Ocultar" : "Mostrar"}
                                    >
                                        {section.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <input type="hidden" id="homeLayout-input" name="homeLayout" defaultValue={JSON.stringify(sections)} />

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Salvando..." : "Salvar Organização"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
