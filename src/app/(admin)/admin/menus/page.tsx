import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil, LayoutTemplate, RectangleHorizontal, PanelLeft } from "lucide-react";
import { createMenu } from "@/lib/actions/menu";
import { redirect } from "next/navigation";

export default async function MenusPage() {
    // Fetch all menus to distribute them in columns
    const menus = await (prisma as any).menu.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { items: true }
    }) || [];

    const mainMenu = menus.find((m: any) => m.handle === 'main');
    const footerMenu = menus.find((m: any) => m.handle === 'footer');
    const sidebarMenu = menus.find((m: any) => m.handle === 'sidebar');

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Menus e Navegacao</h1>
                <p className="text-slate-500 text-sm">Organize os links exibidos na loja.</p>
            </div>

            {/* Vertical Layout */}
            <div className="flex flex-col gap-6 max-w-2xl">
                {/* Principal */}
                <MenuColumn
                    title="Principal"
                    description="Menu do cabecalho da loja"
                    menu={mainMenu}
                    handle="main"
                    defaultTitle="Menu Principal"
                    icon={<LayoutTemplate className="h-6 w-6" />}
                    color="blue"
                />

                {/* Rodape */}
                <MenuColumn
                    title="Rodape"
                    description="Links no rodape da loja"
                    menu={footerMenu}
                    handle="footer"
                    defaultTitle="Links do Rodape"
                    icon={<RectangleHorizontal className="h-6 w-6" />}
                    color="purple"
                />

                {/* Lateral */}
                <MenuColumn
                    title="Lateral"
                    description="Menu mobile e lateral"
                    menu={sidebarMenu}
                    handle="sidebar"
                    defaultTitle="Menu Lateral"
                    icon={<PanelLeft className="h-6 w-6" />}
                    color="green"
                />
            </div>
        </div>
    );
}

function MenuColumn({
    title,
    description,
    menu,
    handle,
    defaultTitle,
    icon,
    color
}: {
    title: string;
    description: string;
    menu: any;
    handle: string;
    defaultTitle: string;
    icon: React.ReactNode;
    color: "blue" | "purple" | "green";
}) {
    const colorClasses = {
        blue: {
            bg: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-200",
            headerBg: "bg-blue-500",
        },
        purple: {
            bg: "bg-purple-50",
            text: "text-purple-600",
            border: "border-purple-200",
            headerBg: "bg-purple-500",
        },
        green: {
            bg: "bg-green-50",
            text: "text-green-600",
            border: "border-green-200",
            headerBg: "bg-green-500",
        },
    };

    const colors = colorClasses[color];

    return (
        <div className={`rounded-xl border ${colors.border} bg-white shadow-sm overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className={`${colors.headerBg} text-white px-4 py-3 flex items-center gap-3`}>
                {icon}
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-xs opacity-80">{description}</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                {menu ? (
                    <div className="space-y-4">
                        {/* Menu Info */}
                        <div className={`${colors.bg} rounded-lg p-4`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-white ${colors.text}`}>
                                    {icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{menu.title}</h4>
                                    <p className="text-sm text-slate-500">
                                        {menu.items?.length || 0} links ativos
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Links Preview */}
                        {menu.items && menu.items.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Links</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {menu.items.slice(0, 5).map((item: any) => (
                                        <div key={item.id} className="text-sm text-slate-600 flex items-center gap-2 py-1 px-2 bg-slate-50 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    ))}
                                    {menu.items.length > 5 && (
                                        <p className="text-xs text-slate-400 pl-2">
                                            +{menu.items.length - 5} mais...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Edit Button */}
                        <Button asChild className="w-full" variant="outline">
                            <Link href={`/admin/menus/${menu.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar Menu
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <EmptyState handle={handle} defaultTitle={defaultTitle} colors={colors} />
                )}
            </div>
        </div>
    );
}

function EmptyState({
    handle,
    defaultTitle,
    colors
}: {
    handle: string;
    defaultTitle: string;
    colors: { bg: string; text: string };
}) {
    return (
        <div className={`${colors.bg} rounded-lg p-6 text-center space-y-3 h-full flex flex-col items-center justify-center`}>
            <div className={`p-3 rounded-full bg-white ${colors.text}`}>
                <Plus className="h-6 w-6" />
            </div>
            <div>
                <p className="font-medium text-slate-700">Menu nao criado</p>
                <p className="text-xs text-slate-500">Clique para criar</p>
            </div>
            <form action={async () => {
                "use server";
                const fd = new FormData();
                fd.append("title", defaultTitle);
                fd.append("handle", handle);
                await createMenu(fd);
                redirect("/admin/menus");
            }}>
                <Button type="submit" size="sm" variant="outline">
                    <Plus className="mr-1 h-3 w-3" /> Criar Menu
                </Button>
            </form>
        </div>
    );
}
