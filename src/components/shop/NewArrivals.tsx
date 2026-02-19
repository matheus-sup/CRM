"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NewArrivals({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {
    if (!products) return null;

    return (
        <section className="container mx-auto px-4 py-8 relative group/section rounded-xl">
            {/* Optional Edit Trigger for Admin could go here */}
            <div className="mb-8 flex items-end justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title || "Lançamentos"}</h2>
                    {subtitle ? (
                        <p className="text-gray-500">{subtitle}</p>
                    ) : (
                        !title && <p className="text-gray-500">Confira as novidades que acabaram de chegar</p>
                    )}
                </div>
                <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50" asChild>
                    <Link href="/lancamentos">Ver todos &rarr;</Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {products.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg dashed border-2 border-gray-200">
                        <p className="text-gray-400">Nenhum produto cadastrado ainda.</p>
                        <Button variant="link" className="text-pink-600" asChild>
                            <Link href="/admin/produtos/novo">Cadastrar Produto</Link>
                        </Button>
                    </div>
                ) : (
                    products.map((product: any) => (
                        <Link key={product.id} href={`/produto/${product.slug}`} className="group block h-full">
                            <div className="rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col group-hover:border-pink-200">
                                <div className="mb-4 aspect-4/5 rounded-lg bg-gray-100 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-300">
                                        {product.name.charAt(0)}
                                    </div>
                                    {/* Badge */}
                                    {product.compareAtPrice && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            OFERTA
                                        </div>
                                    )}
                                </div>
                                <h3 className="line-clamp-2 text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors h-10">{product.name}</h3>
                                <div className="mt-auto pt-4 flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                    </span>
                                    {product.compareAtPrice && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}
                                        </span>
                                    )}
                                </div>
                                <Button className="mt-4 w-full rounded-lg bg-gray-900 text-white hover:bg-pink-600 transition-colors" size="sm">
                                    Adicionar
                                </Button>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
}
