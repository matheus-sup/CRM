"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, RefreshCw, Truck, Minus, Plus, ShoppingCart, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductDetailPreviewProps {
    config: any;
    product?: any;
    onSectionClick?: (section: string) => void;
}

export function ProductDetailPreview({ config, product, onSectionClick }: ProductDetailPreviewProps) {
    // Config toggles (default to true when undefined)
    const showSKU = config?.showSKU !== false;
    const showStockQuantity = config?.showStockQuantity !== false;
    const showPromoPrice = config?.showPromoPrice !== false;
    const showInstallmentsDetail = config?.showInstallmentsDetail !== false;
    const showShippingSimulator = config?.showShippingSimulator !== false;
    const showBuyInfo = config?.showBuyInfo !== false;
    const showRelatedProducts = config?.showRelatedProducts !== false;
    const showBreadcrumb = config?.productShowBreadcrumb !== false;

    // Colors from config
    const priceColor = config?.productPriceColor || config?.priceColor || "#6366f1";
    const btnBg = config?.productBtnBg || config?.themeColor || "#6366f1";
    const btnText = config?.productBtnText || "#ffffff";
    const brandColor = config?.productBrandColor || config?.themeColor || "#6366f1";
    const discountBadgeBg = config?.productDiscountBadgeBg || "#22c55e";
    const discountBadgeText = config?.productDiscountBadgeText || "#ffffff";
    const stockBadgeBg = config?.productStockBadgeBg || "#dcfce7";
    const stockBadgeText = config?.productStockBadgeText || "#16a34a";
    const infoBg = config?.productInfoBg || "#f8fafc";
    const iconColor = config?.productIconColor || config?.themeColor || "#6366f1";

    // Layout from config
    const btnStyle = config?.productBtnStyle || "rounded";
    const btnSize = config?.productBtnSize || "large";
    const galleryLayout = config?.productGalleryLayout || "bottom";

    // Button style classes
    const btnRoundedClass = btnStyle === "pill" ? "rounded-full" : btnStyle === "square" ? "rounded-none" : "rounded-lg";
    const btnSizeClass = btnSize === "small" ? "h-10 text-sm" : btnSize === "medium" ? "h-11 text-base" : "h-12 text-base";

    // Mock product data for preview - use real product if available
    const mockProduct = product ? {
        name: product.name || "Produto Exemplo",
        sku: product.sku || "SKU-12345",
        price: Number(product.price) || 199.90,
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : 299.90,
        stock: product.stock ?? 15,
        brand: product.brand || { name: "Marca Exemplo" },
        category: product.category || { name: "Categoria" },
        description: product.description || "<p>Descrição do produto.</p>",
        images: product.images?.length > 0 ? product.images : [],
        weight: product.weight ? Number(product.weight) : 0.5,
        length: product.length ? Number(product.length) : 20,
        width: product.width ? Number(product.width) : 15,
        height: product.height ? Number(product.height) : 10,
    } : {
        name: "Produto Exemplo Premium",
        sku: "SKU-12345",
        price: 199.90,
        compareAtPrice: 299.90,
        stock: 15,
        brand: { name: "Marca Exemplo" },
        category: { name: "Categoria" },
        description: "<p>Esta é uma descrição de exemplo do produto. Aqui você pode ver como a descrição aparecerá na página de detalhes do produto.</p><p>Inclui todas as informações importantes sobre o produto, características, benefícios e mais.</p>",
        images: [],
        weight: 0.5,
        length: 20,
        width: 15,
        height: 10,
    };

    // Get main image and thumbnails
    const mainImage = mockProduct.images?.[0]?.url || null;
    const thumbnails = mockProduct.images?.slice(0, 4) || [];

    const discountPercentage = mockProduct.compareAtPrice
        ? Math.round(((Number(mockProduct.compareAtPrice) - Number(mockProduct.price)) / Number(mockProduct.compareAtPrice)) * 100)
        : 0;

    return (
        <div
            className="container mx-auto px-4 pt-8 pb-12"
            data-section="products-detail"
            onClick={() => onSectionClick?.("products-detail")}
        >
            {/* Breadcrumb */}
            {showBreadcrumb && (
                <nav className="flex items-center text-sm text-slate-500 mb-8 space-x-2">
                    <span className="hover:text-primary transition-colors cursor-pointer">Início</span>
                    <span>/</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">Produtos</span>
                    <span>/</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">{mockProduct.category?.name}</span>
                    <span>/</span>
                    <span className="font-medium text-slate-900 truncate max-w-[200px]">{mockProduct.name}</span>
                </nav>
            )}

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Left Column: Gallery */}
                <div className={cn(
                    (galleryLayout === "side" || galleryLayout === "dots") ? "flex gap-4" : "space-y-4"
                )}>
                    {/* Dots Layout - Dot navigation on left */}
                    {galleryLayout === "dots" && (
                        <div className="flex flex-col items-center justify-center gap-1 py-4">
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                            <div className="flex flex-col items-center gap-2 py-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "rounded-full transition-all",
                                            i === 0 ? "w-2.5 h-2.5 bg-slate-800" : "w-1.5 h-1.5 bg-slate-300"
                                        )}
                                    />
                                ))}
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    )}

                    {/* Side Layout - Thumbnails on left */}
                    {galleryLayout === "side" && (
                        <div className="flex flex-col gap-2">
                            {(thumbnails.length > 0 ? thumbnails : [null, null, null, null]).map((img, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-16 h-16 bg-slate-100 border-2 border-transparent cursor-pointer overflow-hidden",
                                        btnRoundedClass,
                                        i === 0 && "border-slate-400"
                                    )}
                                    style={i === 0 ? { borderColor: btnBg } : undefined}
                                >
                                    {img?.url ? (
                                        <Image src={img.url} alt={`Thumbnail ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className={cn(
                        "aspect-square bg-slate-100 overflow-hidden relative",
                        btnRoundedClass,
                        (galleryLayout === "side" || galleryLayout === "dots") ? "flex-1" : ""
                    )}>
                        {mainImage ? (
                            <Image
                                src={mainImage}
                                alt={mockProduct.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <div className="text-center text-slate-400">
                                    <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">Imagem do Produto</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Layout - Thumbnails below */}
                    {galleryLayout === "bottom" && (
                        <div className="flex gap-2">
                            {(thumbnails.length > 0 ? thumbnails : [null, null, null, null]).map((img, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-20 h-20 bg-slate-100 border-2 border-transparent cursor-pointer overflow-hidden",
                                        btnRoundedClass,
                                        i === 0 && "border-slate-400"
                                    )}
                                    style={i === 0 ? { borderColor: btnBg } : undefined}
                                >
                                    {img?.url ? (
                                        <Image src={img.url} alt={`Thumbnail ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grid Layout - 4 columns */}
                    {galleryLayout === "grid" && (
                        <div className="grid grid-cols-4 gap-2">
                            {(thumbnails.length > 0 ? thumbnails : [null, null, null, null]).map((img, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "aspect-square bg-slate-100 border-2 border-transparent cursor-pointer overflow-hidden",
                                        btnRoundedClass,
                                        i === 0 && "border-slate-400"
                                    )}
                                    style={i === 0 ? { borderColor: btnBg } : undefined}
                                >
                                    {img?.url ? (
                                        <Image src={img.url} alt={`Thumbnail ${i + 1}`} width={100} height={100} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Info & Actions */}
                <div className="flex flex-col gap-6">
                    <div>
                        {mockProduct.brand && (
                            <span className="text-sm font-medium uppercase tracking-wide mb-2 block" style={{ color: brandColor }}>
                                {mockProduct.brand.name}
                            </span>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{mockProduct.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            {showSKU && (
                                <span className="text-sm text-slate-500">Cód: {mockProduct.sku}</span>
                            )}
                            {showStockQuantity && (
                                mockProduct.stock > 0 ? (
                                    <Badge
                                        variant="outline"
                                        className="border-transparent"
                                        style={{ backgroundColor: stockBadgeBg, color: stockBadgeText }}
                                    >
                                        Em Estoque ({mockProduct.stock})
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">Esgotado</Badge>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold" style={{ color: priceColor }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(mockProduct.price))}
                            </span>
                            {showPromoPrice && mockProduct.compareAtPrice && Number(mockProduct.compareAtPrice) > Number(mockProduct.price) && (
                                <span className="text-lg text-slate-400 line-through">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(mockProduct.compareAtPrice))}
                                </span>
                            )}
                        </div>
                        {showPromoPrice && discountPercentage > 0 && (
                            <span
                                className="text-sm font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded w-fit"
                                style={{ backgroundColor: discountBadgeBg, color: discountBadgeText }}
                            >
                                Economize {discountPercentage}% OFF
                            </span>
                        )}
                        {showInstallmentsDetail && (
                            <p className="text-sm text-slate-500">
                                em até 12x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(mockProduct.price) / 12)}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Quantity & Add to Cart */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("flex items-center border", btnRoundedClass)}>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">1</span>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                className={cn("flex-1 font-semibold gap-2", btnSizeClass, btnRoundedClass)}
                                style={{
                                    backgroundColor: btnBg,
                                    color: btnText
                                }}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Adicionar ao Carrinho
                            </Button>
                        </div>

                        {/* Benefits Icons */}
                        {showBuyInfo && (
                            <div
                                className="grid grid-cols-2 gap-4 text-sm text-slate-600 p-4 rounded-lg"
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

                        {/* Shipping Calculator */}
                        {showShippingSimulator && (
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Truck className="h-5 w-5" style={{ color: iconColor }} />
                                    <span className="font-medium">Calcular Frete</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Digite seu CEP"
                                        className={cn("flex-1 px-3 py-2 border text-sm", btnRoundedClass)}
                                        disabled
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={btnRoundedClass}
                                        style={{ borderColor: btnBg, color: btnBg }}
                                    >
                                        Calcular
                                    </Button>
                                </div>
                            </div>
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
                            className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base"
                            style={{ borderColor: "transparent" }}
                            data-active-style={{ borderColor: btnBg }}
                        >
                            Descrição
                        </TabsTrigger>
                        <TabsTrigger
                            value="specs"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-base"
                        >
                            Especificações
                        </TabsTrigger>
                    </TabsList>
                    <div className="mt-8">
                        <TabsContent value="desc" className="prose prose-slate max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: mockProduct.description }} />
                        </TabsContent>
                        <TabsContent value="specs">
                            <div className="max-w-xl">
                                <dl className="divide-y">
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Marca</dt>
                                        <dd className="col-span-2 text-slate-600">{mockProduct.brand?.name || "Geral"}</dd>
                                    </div>
                                    {showSKU && (
                                        <div className="grid grid-cols-3 gap-4 py-3">
                                            <dt className="font-medium text-slate-900">SKU</dt>
                                            <dd className="col-span-2 text-slate-600">{mockProduct.sku || "-"}</dd>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Código de Barras</dt>
                                        <dd className="col-span-2 text-slate-600">7891234567890</dd>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <dt className="font-medium text-slate-900">Dimensões</dt>
                                        <dd className="col-span-2 text-slate-600">
                                            {mockProduct.length}x{mockProduct.width}x{mockProduct.height}cm / {mockProduct.weight}kg
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Related Products */}
            {showRelatedProducts && (
                <>
                    <Separator className="my-16" />
                    <div>
                        <h2 className="text-2xl font-bold mb-8">Produtos Relacionados</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={cn("border p-4 hover:shadow-md transition-shadow", btnRoundedClass)}>
                                    <div className={cn("aspect-square bg-gradient-to-br from-slate-100 to-slate-200 mb-3 flex items-center justify-center text-slate-300 overflow-hidden", btnRoundedClass)}>
                                        <ImageIcon className="h-8 w-8 opacity-50" />
                                    </div>
                                    <h3 className="font-medium text-sm truncate">Produto Relacionado {i}</h3>
                                    <p className="font-bold mt-1" style={{ color: priceColor }}>
                                        R$ 99,90
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
