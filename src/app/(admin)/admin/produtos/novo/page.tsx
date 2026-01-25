import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { children: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="container mx-auto max-w-5xl">
            <ProductForm categories={categories} />
        </div>
    );
}
