import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { PageListItem } from "./PageListItem";

export default async function PagesPage() {
    const pages = await prisma.page.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Páginas</h1>
                    <p className="text-slate-500 text-sm">Gerencie o conteúdo institucional da loja.</p>
                </div>
                <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/paginas/novo">
                        <Plus className="h-4 w-4" /> Nova Página
                    </Link>
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-medium text-sm text-slate-500 flex">
                    <div className="flex-1">Título</div>
                    <div className="w-48">URL (Slug)</div>
                    <div className="w-32 text-center">Status</div>
                    <div className="w-24 text-right">Ações</div>
                </div>
                {pages.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-slate-200" />
                        <p>Nenhuma página criada.</p>
                    </div>
                ) : (
                    pages.map(page => (
                        <PageListItem key={page.id} page={page} />
                    ))
                )}
            </div>
        </div>
    );
}
