
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { getProductById } from "@/lib/actions/product";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params;

    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

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
            <ProductForm categories={categories} initialData={product} />
        </div>
    );
}
