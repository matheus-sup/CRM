"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { togglePagePublished, deletePage } from "@/lib/actions/page";
import { useRouter } from "next/navigation";

interface Page {
    id: string;
    title: string;
    slug: string;
    published: boolean;
}

export function PageListItem({ page }: { page: Page }) {
    const [published, setPublished] = useState(page.published);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleTogglePublished = () => {
        startTransition(async () => {
            const result = await togglePagePublished(page.id);
            if (result.success) {
                setPublished(result.published!);
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir a página "${page.title}"?`)) return;

        setIsDeleting(true);
        const result = await deletePage(page.id);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.message || "Erro ao excluir página.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 border-b last:border-0 flex items-center hover:bg-slate-50 transition-colors">
            <div className="flex-1 font-medium flex items-center gap-2 text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                {page.title}
            </div>
            <div className="w-48 text-sm text-slate-500 truncate">/{page.slug}</div>
            <div className="w-32 flex justify-center">
                <Button
                    size="sm"
                    variant={published ? "default" : "outline"}
                    className={`h-7 text-xs gap-1.5 min-w-[100px] ${
                        published
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                    onClick={handleTogglePublished}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : published ? (
                        <>
                            <Eye className="h-3 w-3" />
                            Publicado
                        </>
                    ) : (
                        <>
                            <EyeOff className="h-3 w-3" />
                            Oculto
                        </>
                    )}
                </Button>
            </div>
            <div className="w-24 flex justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                    <Link href={`/admin/paginas/${page.id}`}>
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
