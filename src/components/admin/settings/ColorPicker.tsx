"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

const PRESET_COLORS = [
    "#db2777", // Pink 600 (Current Theme)
    "#e11d48", // Rose 600
    "#dc2626", // Red 600
    "#ea580c", // Orange 600
    "#d97706", // Amber 600
    "#ca8a04", // Yellow 600
    "#65a30d", // Lime 600
    "#16a34a", // Green 600
    "#059669", // Emerald 600
    "#0d9488", // Teal 600
    "#0891b2", // Cyan 600
    "#0284c7", // Sky 600
    "#2563eb", // Blue 600
    "#4f46e5", // Indigo 600
    "#7c3aed", // Violet 600
    "#9333ea", // Purple 600
    "#c026d3", // Fuchsia 600
    "#000000", // Black
    "#334155", // Slate 700
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    const [color, setColor] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setColor(value);
    }, [value]);

    const handleSelect = (newColor: string) => {
        setColor(newColor);
        onChange(newColor);
        // Don't close immediately so user can see selection, or maybe close?
        // User asked for "confirm button" logic implied or just better UI. 
        // We'll keep it open or let user click out. Popover closes on click out.
    };

    const handleConfirm = () => {
        onChange(color);
        setIsOpen(false);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal px-3", !value && "text-muted-foreground")}
                >
                    <div className="w-5 h-5 rounded-md mr-2 border shadow-sm" style={{ backgroundColor: color }} />
                    <span className="flex-1">{color}</span>
                    <Paintbrush className="h-4 w-4 opacity-50 ml-auto" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="font-medium text-sm leading-none">Cores Sugeridas</h4>
                        <p className="text-xs text-muted-foreground">Escolha uma das nossas cores padrão.</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((preset) => (
                            <button
                                key={preset}
                                className={cn(
                                    "w-8 h-8 rounded-full border border-slate-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black",
                                    color === preset && "ring-2 ring-offset-1 ring-blue-500 scale-110"
                                )}
                                style={{ backgroundColor: preset }}
                                onClick={() => handleSelect(preset)}
                            >
                                <span className="sr-only">{preset}</span>
                            </button>
                        ))}
                    </div>
                    <div className="pt-2 border-t mt-2">
                        <h4 className="font-medium text-sm mb-2">Personalizado</h4>
                        <div className="flex gap-2">
                            <Input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                maxLength={7}
                                className="h-9"
                            />
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => handleSelect(e.target.value)}
                                className="w-9 h-9 p-0.5"
                            />
                        </div>
                    </div>
                    <Button onClick={handleConfirm} size="sm" className="w-full mt-2">Confirmar Cor</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
