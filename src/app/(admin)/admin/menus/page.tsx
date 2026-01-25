import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, List, Pencil, Trash } from "lucide-react";

export default async function MenusPage() {
    // Cast to any to avoid build errors if client is stale
    const menus = await (prisma as any).menu.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { items: true }
    }) || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Menus</h1>
                    <p className="text-slate-500 text-sm">Gerencie a navegação da loja (Menu Principal, Rodapé, etc).</p>
                </div>
                <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/menus/novo">
                        <Plus className="h-4 w-4" /> Novo Menu
                    </Link>
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-medium text-sm text-slate-500 flex">
                    <div className="flex-1">Título</div>
                    <div className="w-48">Identificador (Handle)</div>
                    <div className="w-32">Itens</div>
                    <div className="w-24 text-right">Ações</div>
                </div>
                {menus.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <List className="h-10 w-10 text-slate-200" />
                        <p>Nenhum menu criado.</p>
                    </div>
                ) : (
                    menus.map((menu: any) => (
                        <div key={menu.id} className="p-4 border-b last:border-0 flex items-center hover:bg-slate-50 transition-colors">
                            <div className="flex-1 font-medium flex items-center gap-2 text-slate-700">
                                <List className="h-4 w-4 text-slate-400" />
                                {menu.title}
                            </div>
                            <div className="w-48 text-sm text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">{menu.handle}</div>
                            <div className="w-32 text-sm text-slate-600">
                                {menu.items?.length || 0} links
                            </div>
                            <div className="w-24 flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                                    <Link href={`/admin/menus/${menu.id}`}>
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
