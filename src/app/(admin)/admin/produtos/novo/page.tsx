import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            children: {
                include: { _count: { select: { products: true } } }
            },
            _count: { select: { products: true } }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="container mx-auto max-w-5xl">
            <ProductForm categories={categories} />
        </div>
    );
}
