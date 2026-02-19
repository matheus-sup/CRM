"use client";

import { HtmlBlockContent } from "@/types/page-builder";
import { cn } from "@/lib/utils";

interface HtmlBlockProps {
    content: HtmlBlockContent;
    className?: string;
    isAdmin?: boolean;
}

export function HtmlBlock({ content, className, isAdmin }: HtmlBlockProps) {
    if (!content?.code) return null;

    if (isAdmin) {
        return (
            <div className={cn("p-4 border border-dashed border-yellow-400 bg-yellow-50 rounded-md", className)}>
                <div className="text-xs font-bold text-yellow-700 mb-2 uppercase tracking-wide">
                    HTML Personalizado
                </div>
                <div className="text-xs font-mono bg-white p-2 border rounded overflow-hidden max-h-32 text-slate-600">
                    {content.code}
                </div>
            </div>
        );
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: content.code }}
        />
    );
}
