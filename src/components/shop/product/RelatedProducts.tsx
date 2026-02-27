import { getProducts } from "@/lib/actions/product";
import Link from "next/link";
import Image from "next/image";

export async function RelatedProducts({ categoryId, currentProductId }: { categoryId?: string, currentProductId: string }) {
    const { prisma } = await import("@/lib/prisma");

    const related = await prisma.product.findMany({
        where: {
            id: { not: currentProductId },
            categoryId: categoryId || undefined
        },
        take: 4,
        include: { images: true }
    });

    if (related.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((prod) => (
                    <Link key={prod.id} href={`/loja/produto/${prod.slug}`} className="group block space-y-3">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 border">
                            {prod.images[0] ? (
                                <Image
                                    src={prod.images[0].url}
                                    alt={prod.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                    className="object-contain transition-transform group-hover:scale-105 p-2"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-300 font-bold text-2xl">
                                    {prod.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 group-hover:underline truncate">{prod.name}</h3>
                            <p className="font-bold text-lg" style={{ color: "var(--price-color)" }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(prod.price))}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
