import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Pencil, Trash } from "lucide-react";

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
                    <div className="w-32">Status</div>
                    <div className="w-24 text-right">Ações</div>
                </div>
                {pages.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-slate-200" />
                        <p>Nenhuma página criada.</p>
                    </div>
                ) : (
                    pages.map(page => (
                        <div key={page.id} className="p-4 border-b last:border-0 flex items-center hover:bg-slate-50 transition-colors">
                            <div className="flex-1 font-medium flex items-center gap-2 text-slate-700">
                                <FileText className="h-4 w-4 text-slate-400" />
                                {page.title}
                            </div>
                            <div className="w-48 text-sm text-slate-500 truncate">/{page.slug}</div>
                            <div className="w-32">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${page.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {page.published ? 'Publicado' : 'Rascunho'}
                                </span>
                            </div>
                            <div className="w-24 flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                                    <Link href={`/admin/paginas/${page.id}`}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
