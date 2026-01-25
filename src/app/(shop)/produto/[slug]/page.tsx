import { getProductBySlug } from "@/lib/actions/product";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {/* Gallery Section */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white border shadow-md">
                    {/* TODO: Real Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                        {product.name.charAt(0)}
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-sm text-muted-foreground mt-2">Cód: {product.sku || 'N/A'}</p>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold" style={{ color: "var(--price-color)" }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                        </span>
                        {product.compareAtPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-sm text-gray-600">
                        <p>{product.description || "Sem descrição disponível."}</p>
                    </div>

                    <div className="mt-8">
                        <AddToCartButton product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}
