import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/actions/product";
import { ProductsManager } from "@/components/admin/products/ProductsManager";

export default async function ProductsPage() {
    const products = await getProducts();
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            _count: {
                select: { products: true }
            },
            children: true
        },
        orderBy: { name: 'asc' }
    });

    return (
        <ProductsManager products={products} categories={categories} />
    );
}
