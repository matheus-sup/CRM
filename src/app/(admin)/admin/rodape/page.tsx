import { getStoreConfig } from "@/lib/actions/settings";
import { FooterBlockEditor, FooterBlock } from "@/components/admin/footer/FooterBlockEditor";
import { prisma } from "@/lib/prisma";

export default async function FooterPage() {
    const config = await getStoreConfig();

    // Fetch all menus for the block editor (with items for preview)
    const menus = await prisma.menu.findMany({
        select: { id: true, handle: true, title: true, items: { orderBy: { order: "asc" } } },
        orderBy: { title: "asc" }
    });

    // Parse footerBlocks from config
    let savedLayout: any = {};
    try {
        if ((config as any).footerBlocks) {
            const parsed = JSON.parse((config as any).footerBlocks as string);
            if (Array.isArray(parsed)) {
                savedLayout = { blocks: parsed };
            } else {
                savedLayout = parsed;
            }
        }
    } catch (e) {
        console.error("Error parsing footerBlocks:", e);
    }

    // Fetch categories for link selector
    const categories = await prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
    });

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Editor do Rodapé</h1>
                <p className="text-slate-500 text-sm">Arraste e solte para reorganizar as colunas do rodapé.</p>
            </div>

            <FooterBlockEditor
                initialData={savedLayout}
                menus={menus}
                config={config}
                categories={categories}
            />
        </div>
    );
}
