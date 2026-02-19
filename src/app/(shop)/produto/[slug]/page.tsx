import { getProductBySlug } from "@/lib/actions/product";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGallery } from "@/components/shop/product/ProductGallery";
import { ShippingCalculator } from "@/components/shop/product/ShippingCalculator";
import { RelatedProducts } from "@/components/shop/product/RelatedProducts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Check, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

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

    const discountPercentage = product.compareAtPrice
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className="container mx-auto px-4 pt-32 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-slate-500 mb-8 space-x-2">
                <Link href="/" className="hover:text-primary transition-colors">Início</Link>
                <span>/</span>
                <Link href="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
                <span>/</span>
                {product.category && (
                    <>
                        <Link href={`/produtos?category=${product.category.id}`} className="hover:text-primary transition-colors">
                            {product.category.name}
                        </Link>
                        <span>/</span>
                    </>
                )}
                <span className="font-medium text-slate-900 truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Left Column: Gallery */}
                <div>
                    <ProductGallery images={product.images} productName={product.name} />
                </div>

                {/* Right Column: Info & Actions */}
                <div className="flex flex-col gap-6">
                    <div>
                        {product.brand && (
                            <Link href={`/produtos?brand=${product.brand.id}`} className="text-sm font-medium text-primary uppercase tracking-wide mb-2 block">
                                {product.brand.name}
                            </Link>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-slate-500">Cód: {product.sku || 'N/A'}</span>
                            {product.stock > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                    Em Estoque
                                </Badge>
                            ) : (
                                <Badge variant="destructive">Esgotado</Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold" style={{ color: "var(--price-color)" }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                            </span>
                            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                                <span className="text-lg text-slate-400 line-through">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}
                                </span>
                            )}
                        </div>
                        {discountPercentage > 0 && (
                            <span className="text-sm font-semibold text-green-600">
                                Economize {discountPercentage}% OFF
                            </span>
                        )}
                        <p className="text-sm text-slate-500">
                            em até {12}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price) / 12)}
                        </p>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-6">
                        <AddToCartButton product={product} />

                        {/* Benefits Icons */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <span>Compra Segura</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-primary" />
                                <span>7 dias para troca</span>
                            </div>
                        </div>

                        {/* Shipping */}
                        <ShippingCalculator
                            productId={product.id}
                            weight={Number(product.weight)}
                            length={Number(product.length)}
                            width={Number(product.width)}
                            height={Number(product.height)}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Tabs & details */}
            <div className="mt-16">
                <Tabs defaultValue="desc">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                            value="desc"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base"
                        >
                            Descrição
                        </TabsTrigger>
                        <TabsTrigger
                            value="specs"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base"
                        >
                            Especificações
                        </TabsTrigger>
                    </TabsList>
                    <div className="mt-8">
                        <TabsContent value="desc" className="prose prose-slate max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: product.description || "<p>Sem descrição.</p>" }} />
                        </TabsContent>
                        <TabsContent value="specs">
                            <div className="max-w-xl">
                                <dl className="divide-y">
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Marca</dt>
                                        <dd className="col-span-2 text-slate-600">{product.brand?.name || "Geral"}</dd>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">SKU</dt>
                                        <dd className="col-span-2 text-slate-600">{product.sku || "-"}</dd>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Código de Barras</dt>
                                        <dd className="col-span-2 text-slate-600">{product.barcode || "-"}</dd>
                                    </div>
                                    {(product.weight || product.length) && (
                                        <div className="grid grid-cols-3 gap-4 py-3">
                                            <dt className="font-medium text-slate-900">Dimensões</dt>
                                            <dd className="col-span-2 text-slate-600">
                                                {product.length}x{product.width}x{product.height}cm / {product.weight}kg
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <Separator className="my-16" />

            <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
        </div>
    );
}
