import { getProductBySlug } from "@/lib/actions/product";
import { getStoreConfig } from "@/lib/actions/settings";
import { isToolEnabled } from "@/lib/actions/tools";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGallery } from "@/components/shop/product/ProductGallery";
import { ShippingCalculator } from "@/components/shop/product/ShippingCalculator";
import { RelatedProducts } from "@/components/shop/product/RelatedProducts";
import { MeasurementsGuide } from "@/components/shop/product/MeasurementsGuide";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const [product, config, lensToolEnabled] = await Promise.all([
        getProductBySlug(slug),
        getStoreConfig(),
        isToolEnabled("venda-lentes-oticas")
    ]);

    if (!product) {
        notFound();
    }

    // Config toggles (default to true when undefined)
    const showSKU = config?.showSKU !== false;
    const showStockQuantity = config?.showStockQuantity !== false;
    const showPromoPrice = config?.showPromoPrice !== false;
    const showInstallmentsDetail = config?.showInstallmentsDetail !== false;
    const showShippingSimulator = config?.showShippingSimulator !== false;
    const showBuyInfo = config?.showBuyInfo !== false;
    const showRelatedProducts = config?.showRelatedProducts !== false;
    const showBreadcrumb = config?.productShowBreadcrumb !== false;
    const showProductSold = config?.showProductSold !== false;
    const showDiscountPayment = config?.showDiscountPayment !== false;
    const showVariations = config?.showVariations !== false;
    const showMeasurements = config?.showMeasurements !== false;

    // Colors from config
    const priceColor = config?.productPriceColor || config?.priceColor || config?.themeColor || "#6366f1";
    const brandColor = config?.productBrandColor || config?.themeColor || "#6366f1";
    const discountBadgeBg = config?.productDiscountBadgeBg || "#22c55e";
    const discountBadgeText = config?.productDiscountBadgeText || "#ffffff";
    const stockBadgeBg = config?.productStockBadgeBg || "#dcfce7";
    const stockBadgeText = config?.productStockBadgeText || "#16a34a";
    const infoBg = config?.productInfoBg || "#f8fafc";
    const iconColor = config?.productIconColor || config?.themeColor || "#6366f1";

    // Layout from config
    const btnStyle = config?.productBtnStyle || "rounded";
    const btnRoundedClass = btnStyle === "pill" ? "rounded-full" : btnStyle === "square" ? "rounded-none" : "rounded-lg";
    const galleryLayout = config?.productGalleryLayout || "bottom";

    const discountPercentage = product.compareAtPrice
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    // Serializar produto para Client Component (Decimal -> number)
    const serializedProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        images: product.images,
        weight: product.weight ? Number(product.weight) : null,
        height: product.height ? Number(product.height) : null,
        width: product.width ? Number(product.width) : null,
        length: product.length ? Number(product.length) : null,
    };

    return (
        <div className="container mx-auto px-4 pt-32 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            {showBreadcrumb && (
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
            )}

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Left Column: Gallery */}
                <div>
                    <ProductGallery images={product.images} productName={product.name} layout={galleryLayout} />
                </div>

                {/* Right Column: Info & Actions */}
                <div className="flex flex-col gap-6">
                    <div>
                        {product.brand && (
                            <Link
                                href={`/produtos?brand=${product.brand.id}`}
                                className="text-sm font-medium uppercase tracking-wide mb-2 block"
                                style={{ color: brandColor }}
                            >
                                {product.brand.name}
                            </Link>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {showSKU && (
                                <span className="text-sm text-slate-500">Cód: {product.sku || 'N/A'}</span>
                            )}
                            {showStockQuantity && (
                                product.stock > 0 ? (
                                    <Badge
                                        variant="outline"
                                        className="border-transparent"
                                        style={{ backgroundColor: stockBadgeBg, color: stockBadgeText }}
                                    >
                                        Em Estoque ({product.stock})
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">Esgotado</Badge>
                                )
                            )}
                            {showProductSold && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-transparent">
                                    +50 vendidos
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold" style={{ color: priceColor }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                            </span>
                            {showPromoPrice && product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                                <span className="text-lg text-slate-400 line-through">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}
                                </span>
                            )}
                        </div>
                        {showPromoPrice && discountPercentage > 0 && (
                            <span
                                className={cn("text-sm font-semibold inline-flex items-center gap-1 px-2 py-0.5 w-fit", btnRoundedClass)}
                                style={{ backgroundColor: discountBadgeBg, color: discountBadgeText }}
                            >
                                Economize {discountPercentage}% OFF
                            </span>
                        )}
                        {showInstallmentsDetail && (
                            <p className="text-sm text-slate-500">
                                em até {12}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price) / 12)}
                            </p>
                        )}
                        {showDiscountPayment && (
                            <p className="text-sm font-medium text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price) * 0.95)} no Pix (5% off)
                            </p>
                        )}
                    </div>

                    {/* Guia de Medidas */}
                    {showMeasurements && product.measurements && (
                        <MeasurementsGuide measurements={product.measurements} />
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-6">
                        <AddToCartButton
                            product={serializedProduct}
                            enableLensSelection={lensToolEnabled}
                            btnStyle={btnStyle}
                            btnBg={config?.productBtnBg || config?.themeColor}
                            btnText={config?.productBtnText}
                        />

                        {/* Benefits Icons */}
                        {showBuyInfo && (
                            <div
                                className={cn("grid grid-cols-2 gap-4 text-sm text-slate-600 p-4", btnRoundedClass)}
                                style={{ backgroundColor: infoBg }}
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5" style={{ color: iconColor }} />
                                    <span>Compra Segura</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5" style={{ color: iconColor }} />
                                    <span>7 dias para troca</span>
                                </div>
                            </div>
                        )}

                        {/* Shipping */}
                        {showShippingSimulator && (
                            <ShippingCalculator
                                productId={product.id}
                                weight={Number(product.weight)}
                                length={Number(product.length)}
                                width={Number(product.width)}
                                height={Number(product.height)}
                                btnStyle={btnStyle}
                                iconColor={iconColor}
                            />
                        )}
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
                                    {showSKU && (
                                        <div className="grid grid-cols-3 gap-4 py-3">
                                            <dt className="font-medium text-slate-900">SKU</dt>
                                            <dd className="col-span-2 text-slate-600">{product.sku || "-"}</dd>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Código de Barras</dt>
                                        <dd className="col-span-2 text-slate-600">{product.barcode || "-"}</dd>
                                    </div>
                                    {(product.weight || product.length) && (
                                        <div className="grid grid-cols-3 gap-4 py-3">
                                            <dt className="font-medium text-slate-900">Dimensões</dt>
                                            <dd className="col-span-2 text-slate-600">
                                                {Number(product.length)}x{Number(product.width)}x{Number(product.height)}cm / {Number(product.weight)}kg
                                            </dd>
                                        </div>
                                    )}
                                    {/* Medidas da Peça */}
                                    {product.measurements && (() => {
                                        try {
                                            const measurements = JSON.parse(product.measurements);
                                            if (Array.isArray(measurements) && measurements.length > 0) {
                                                return measurements.map((m: { id: string; title: string; value: string; unit: string }) => (
                                                    <div key={m.id} className="grid grid-cols-3 gap-4 py-3">
                                                        <dt className="font-medium text-slate-900">{m.title}</dt>
                                                        <dd className="col-span-2 text-slate-600">{m.value} {m.unit}</dd>
                                                    </div>
                                                ));
                                            }
                                            return null;
                                        } catch {
                                            return null;
                                        }
                                    })()}
                                </dl>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {showRelatedProducts && (
                <>
                    <Separator className="my-16" />
                    <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
                </>
            )}
        </div>
    );
}
