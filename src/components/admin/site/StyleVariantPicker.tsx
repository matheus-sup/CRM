"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StyleOption {
    id: string;
    name: string;
    description: string;
    preview: React.ReactNode;
}

interface StyleVariantPickerProps {
    options: StyleOption[];
    value: string;
    onChange: (value: string) => void;
    columns?: 2 | 3 | 4;
}

export function StyleVariantPicker({ options, value, onChange, columns = 3 }: StyleVariantPickerProps) {
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4"
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns])}>
            {options.map((option) => {
                const isSelected = value === option.id;

                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 text-left",
                            isSelected
                                ? "border-green-400 bg-green-50/50 ring-2 ring-green-200 shadow-md"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
                        )}
                    >
                        {/* Selection Badge */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
                                <Check className="h-3 w-3" />
                            </div>
                        )}

                        {/* Preview Mockup */}
                        <div className="w-full aspect-[4/3] bg-slate-50 border-b overflow-hidden">
                            {option.preview}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <h4 className={cn(
                                "font-semibold text-sm",
                                isSelected ? "text-green-700" : "text-slate-800"
                            )}>
                                {option.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {option.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// ============================================================================
// HEADER STYLE PREVIEWS
// ============================================================================

export function HeaderClassicPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 scale-90">
            {/* Main Header */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b">
                {/* Logo */}
                <div className="w-12 h-4 bg-slate-800 rounded" />
                {/* Search */}
                <div className="flex-1 mx-3 h-5 bg-slate-100 rounded-full border" />
                {/* Icons */}
                <div className="flex gap-1.5">
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                </div>
            </div>
            {/* Menu Bar */}
            <div className="flex items-center justify-center gap-3 py-1.5 bg-slate-50">
                <div className="w-8 h-1.5 bg-slate-300 rounded" />
                <div className="w-10 h-1.5 bg-slate-300 rounded" />
                <div className="w-8 h-1.5 bg-slate-300 rounded" />
                <div className="w-12 h-1.5 bg-slate-300 rounded" />
            </div>
        </div>
    );
}

export function HeaderCenteredPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 scale-90">
            {/* Top Bar with Menu */}
            <div className="flex items-center justify-between px-2 py-1">
                <div className="w-4 h-4 bg-slate-200 rounded" />
                <div className="flex gap-2">
                    <div className="w-6 h-1.5 bg-slate-300 rounded" />
                    <div className="w-8 h-1.5 bg-slate-300 rounded" />
                    <div className="w-6 h-1.5 bg-slate-300 rounded" />
                </div>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                </div>
            </div>
            {/* Centered Logo */}
            <div className="flex-1 flex items-center justify-center py-2">
                <div className="w-20 h-6 bg-slate-800 rounded" />
            </div>
        </div>
    );
}

export function HeaderMinimalPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 scale-90">
            {/* Single Row Header */}
            <div className="flex items-center justify-between px-2 py-2 border-b">
                {/* Logo */}
                <div className="w-10 h-4 bg-slate-800 rounded" />
                {/* Inline Menu */}
                <div className="flex gap-2">
                    <div className="w-6 h-1.5 bg-slate-300 rounded" />
                    <div className="w-8 h-1.5 bg-slate-300 rounded" />
                    <div className="w-6 h-1.5 bg-slate-300 rounded" />
                </div>
                {/* Icons */}
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function HeaderOpticaPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 scale-90">
            <div className="flex items-center justify-between px-2 py-2 border-b">
                {/* Text logo with slash */}
                <div className="flex items-baseline gap-0">
                    <div className="w-8 h-3 bg-slate-800 rounded" />
                    <span className="text-[6px] text-slate-400 mx-0.5">/</span>
                    <div className="w-6 h-3 bg-slate-300 rounded" />
                </div>
                {/* Center nav links */}
                <div className="flex gap-2">
                    <div className="w-10 h-1.5 bg-slate-300 rounded" />
                    <div className="w-10 h-1.5 bg-slate-300 rounded" />
                    <div className="w-8 h-1.5 bg-slate-300 rounded" />
                </div>
                {/* Right icons */}
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// CARD STYLE PREVIEWS
// ============================================================================

export function CardOpticaPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 scale-90">
            <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="w-full aspect-square bg-[#f5f5f5] rounded-sm mb-1" />
                        <div className="w-3/4 h-1.5 bg-slate-200 rounded mb-0.5" />
                        <div className="w-1/2 h-1 bg-slate-300 rounded mb-0.5" />
                        <div className="text-[5px] text-slate-400 mb-0.5">12x de R$331</div>
                        <div className="flex gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardStandardPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2 w-full">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="aspect-square bg-slate-100 relative">
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-[6px] rounded">-20%</div>
                        </div>
                        <div className="p-1.5">
                            <div className="w-full h-1.5 bg-slate-200 rounded mb-1" />
                            <div className="w-8 h-2 bg-slate-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardCompactPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2 w-full">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white">
                        <div className="aspect-[4/5] bg-slate-100" />
                        <div className="py-1.5 text-center">
                            <div className="w-10 h-1.5 bg-slate-200 rounded mx-auto mb-1" />
                            <div className="w-6 h-2 bg-slate-800 rounded mx-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardDetailedPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2 w-full">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="aspect-square bg-slate-100" />
                        <div className="p-1.5">
                            <div className="w-6 h-1 bg-slate-300 rounded mb-1" />
                            <div className="w-full h-1.5 bg-slate-200 rounded mb-1" />
                            <div className="flex gap-0.5 mb-1">
                                {[1,2,3,4,5].map(s => <div key={s} className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />)}
                            </div>
                            <div className="w-full h-3 bg-slate-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardHorizontalPreview() {
    return (
        <div className="w-full h-full flex flex-col justify-center bg-slate-50 p-3 gap-2">
            {[1, 2].map((i) => (
                <div key={i} className="flex gap-2 bg-white rounded-lg shadow-sm border p-1.5">
                    <div className="w-8 h-8 bg-slate-100 rounded flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="w-full h-1.5 bg-slate-200 rounded mb-1" />
                        <div className="w-8 h-2 bg-slate-800 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// FOOTER STYLE PREVIEWS
// ============================================================================

export function FooterFullPreview() {
    return (
        <div className="w-full h-full flex flex-col justify-end bg-slate-50">
            {/* Newsletter */}
            <div className="bg-slate-700 px-2 py-1.5">
                <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-3 bg-slate-500 rounded" />
                    <div className="w-8 h-3 bg-pink-500 rounded" />
                </div>
            </div>
            {/* 4 Columns */}
            <div className="bg-slate-900 px-2 py-2 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                        <div className="w-6 h-1.5 bg-slate-600 rounded mb-1" />
                        <div className="w-8 h-1 bg-slate-700 rounded" />
                        <div className="w-6 h-1 bg-slate-700 rounded" />
                        <div className="w-7 h-1 bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
            {/* Bottom */}
            <div className="bg-slate-950 px-2 py-1 flex justify-between">
                <div className="flex gap-1">
                    <div className="w-4 h-2 bg-slate-700 rounded" />
                    <div className="w-4 h-2 bg-slate-700 rounded" />
                </div>
                <div className="w-12 h-1.5 bg-slate-700 rounded" />
            </div>
        </div>
    );
}

export function FooterMinimalPreview() {
    return (
        <div className="w-full h-full flex flex-col justify-end bg-slate-50">
            {/* Single Row */}
            <div className="bg-slate-900 px-3 py-2 flex items-center justify-between">
                <div className="w-10 h-4 bg-slate-700 rounded" />
                <div className="flex gap-2">
                    <div className="w-6 h-1.5 bg-slate-600 rounded" />
                    <div className="w-6 h-1.5 bg-slate-600 rounded" />
                </div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-700 rounded-full" />
                    <div className="w-3 h-3 bg-slate-700 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function FooterModernPreview() {
    return (
        <div className="w-full h-full flex flex-col justify-end bg-slate-50">
            {/* 2 Columns */}
            <div className="bg-slate-800 px-2 py-2 grid grid-cols-2 gap-3">
                {/* Left - Brand + Social */}
                <div className="flex flex-col gap-1">
                    <div className="w-10 h-3 bg-slate-600 rounded" />
                    <div className="w-full h-1 bg-slate-700 rounded" />
                    <div className="flex gap-1 mt-1">
                        <div className="w-4 h-4 bg-pink-500/30 rounded-full" />
                        <div className="w-4 h-4 bg-pink-500/30 rounded-full" />
                    </div>
                </div>
                {/* Right - Newsletter + Links */}
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        <div className="flex-1 h-3 bg-slate-700 rounded" />
                        <div className="w-4 h-3 bg-pink-500 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        <div className="w-8 h-1 bg-slate-700 rounded" />
                        <div className="w-6 h-1 bg-slate-700 rounded" />
                    </div>
                </div>
            </div>
            {/* Bottom */}
            <div className="bg-slate-900 px-2 py-1">
                <div className="w-16 h-1 bg-slate-700 rounded mx-auto" />
            </div>
        </div>
    );
}

// ============================================================================
// HERO BLOCK PREVIEWS
// ============================================================================

export function HeroDefaultPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-pink-500 to-purple-600 p-3">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-4 bg-white/90 rounded mb-2" />
                <div className="w-16 h-2 bg-white/60 rounded mb-3" />
                <div className="w-14 h-4 bg-white rounded-full" />
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1 pb-1">
                <div className="w-4 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white/50 rounded-full" />
                <div className="w-1 h-1 bg-white/50 rounded-full" />
            </div>
        </div>
    );
}

export function HeroMinimalPreview() {
    return (
        <div className="w-full h-full flex flex-col bg-slate-100 p-3">
            <div className="flex-1 flex flex-col justify-center">
                <div className="w-20 h-3 bg-slate-800 rounded mb-2" />
                <div className="w-28 h-2 bg-slate-400 rounded mb-3" />
                <div className="w-12 h-4 bg-slate-800 rounded" />
            </div>
        </div>
    );
}

export function HeroSplitPreview() {
    return (
        <div className="w-full h-full grid grid-cols-2 bg-white">
            {/* Text Side */}
            <div className="flex flex-col justify-center p-3">
                <div className="w-14 h-3 bg-slate-800 rounded mb-2" />
                <div className="w-full h-2 bg-slate-300 rounded mb-3" />
                <div className="flex gap-1">
                    <div className="w-10 h-4 bg-pink-500 rounded" />
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                </div>
            </div>
            {/* Image Side */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600" />
        </div>
    );
}

// ============================================================================
// CATEGORIES BLOCK PREVIEWS
// ============================================================================

export function CategoriesGridPreview() {
    return (
        <div className="w-full h-full bg-white p-2">
            <div className="flex justify-between items-center mb-2">
                <div className="w-12 h-2 bg-slate-800 rounded" />
                <div className="w-6 h-1.5 bg-slate-300 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-1 h-[calc(100%-20px)]">
                {/* Large first item */}
                <div className="col-span-2 row-span-2 bg-slate-200 rounded relative">
                    <div className="absolute bottom-1 left-1 w-8 h-2 bg-slate-800/80 rounded" />
                </div>
                <div className="bg-slate-100 rounded relative">
                    <div className="absolute bottom-0.5 left-0.5 w-6 h-1.5 bg-slate-800/80 rounded text-[6px]" />
                </div>
                <div className="bg-slate-100 rounded relative">
                    <div className="absolute bottom-0.5 left-0.5 w-6 h-1.5 bg-slate-800/80 rounded" />
                </div>
            </div>
        </div>
    );
}

export function CategoriesHorizontalPreview() {
    return (
        <div className="w-full h-full bg-white p-2">
            <div className="flex justify-between items-center mb-2">
                <div className="w-10 h-2 bg-slate-800 rounded" />
                <div className="w-6 h-1.5 bg-slate-300 rounded" />
            </div>
            <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-10">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-1" />
                        <div className="w-8 h-1.5 bg-slate-300 rounded mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CategoriesCircularPreview() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="w-14 h-2 bg-slate-800 rounded mb-1" />
            <div className="w-10 h-1.5 bg-slate-300 rounded mb-3" />
            <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-slate-100 rounded-full border-2 border-pink-400" />
                        <div className="w-5 h-1 bg-slate-300 rounded mt-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// NEWSLETTER BLOCK PREVIEWS
// ============================================================================

export function NewsletterFullPreview() {
    return (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-3">
            <div className="w-4 h-4 bg-indigo-500/50 rounded mb-2" />
            <div className="w-16 h-3 bg-white rounded mb-1" />
            <div className="w-20 h-1.5 bg-slate-500 rounded mb-3" />
            <div className="flex gap-1">
                <div className="w-20 h-4 bg-slate-700 rounded-full" />
                <div className="w-10 h-4 bg-indigo-500 rounded-full" />
            </div>
        </div>
    );
}

export function NewsletterCompactPreview() {
    return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
                <div className="w-10 h-2 bg-white rounded" />
                <div className="w-12 h-1.5 bg-slate-500 rounded" />
            </div>
            <div className="flex gap-1">
                <div className="w-14 h-4 bg-slate-700 rounded" />
                <div className="w-6 h-4 bg-white rounded" />
            </div>
        </div>
    );
}

export function NewsletterSplitPreview() {
    return (
        <div className="w-full h-full bg-slate-100 grid grid-cols-2 gap-3 p-3">
            {/* Text Side */}
            <div className="flex flex-col justify-center">
                <div className="w-14 h-3 bg-slate-800 rounded mb-1" />
                <div className="w-full h-2 bg-slate-400 rounded" />
            </div>
            {/* Form Side */}
            <div className="flex flex-col justify-center gap-1">
                <div className="w-full h-4 bg-white border rounded" />
                <div className="w-full h-4 bg-slate-800 rounded" />
            </div>
        </div>
    );
}
