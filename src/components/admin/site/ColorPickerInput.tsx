"use client";

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Paintbrush } from "lucide-react";

interface ColorPickerInputProps {
    id: string;
    label: string;
    value: string;
    description?: string;
    onChange?: (value: string) => void;
}

const PRESET_COLORS = [
    "#db2777", // Pink (Default)
    "#e11d48", // Rose
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#22c55e", // Green
    "#10b981", // Emerald
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#0ea5e9", // Sky
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#a855f7", // Purple
    "#d946ef", // Fuchsia
    "#ffffff", // White
    "#f1f5f9", // Slate 100
    "#94a3b8", // Slate 400
    "#475569", // Slate 600
    "#0f172a", // Slate 900
    "#000000", // Black
];

export function ColorPickerInput({ id, label, value, description, onChange }: ColorPickerInputProps) {
    // Internal state for visual feedback since we are using native form submission
    const [internalValue, setInternalValue] = useState(value);

    // Sync with prop if it changes (re-fetch etc)
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleColorChange = (newColor: string) => {
        setInternalValue(newColor);
        if (onChange) onChange(newColor);
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
                <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
                    <span
                        className="h-4 w-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: internalValue }}
                    />
                    {label}
                </Label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>

            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="w-full md:w-auto flex items-center gap-2 border rounded-md px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                            <span
                                className="h-5 w-5 rounded-full border shadow-sm shrink-0"
                                style={{ backgroundColor: internalValue }}
                            />
                            <span className="text-slate-600 font-mono">{internalValue}</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Cores Sugeridas</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={cn(
                                                "h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                internalValue === color && "ring-2 ring-primary ring-offset-2 scale-105"
                                            )}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleColorChange(color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Personalizado</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id={`${id}-hex`}
                                        className="h-9 font-mono uppercase"
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        value={internalValue}
                                    />
                                    <Input
                                        type="color"
                                        className="w-12 h-9 p-1 cursor-pointer"
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        value={internalValue}
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                {/* Visual Hidden Input for Form Submission */}
                <input
                    id={id}
                    name={id}
                    type="text"
                    value={internalValue}
                    readOnly
                    className="sr-only"
                />
            </div>
        </div>
    );
}
