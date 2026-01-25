import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/products/CategoriesManager";

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
            <CategoriesManager categories={categories} />
        </div>
    );
}
