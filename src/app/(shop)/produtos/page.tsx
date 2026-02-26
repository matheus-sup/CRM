
import { prisma } from "@/lib/prisma";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";
import { getStoreConfig } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Requirements for Next.js 15: await params
    const resolvedParams = await searchParams;
    // 1. Get Categories for sidebar
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Get Available Brands (from Brand entity)
    const brands = await prisma.brand.findMany({
        where: { products: { some: {} } }, // Only brands with products? Or all? Let's show all for now or filters.
        orderBy: { name: 'asc' }
    });
    const allBrands = brands.map(b => b.name);

    // 3. Parse Filter Params
    const categoryIds = typeof resolvedParams.category === 'string'
        ? [resolvedParams.category]
        : Array.isArray(resolvedParams.category)
            ? resolvedParams.category
            : [];

    const selectedBrands = typeof resolvedParams.brand === 'string'
        ? [resolvedParams.brand]
        : Array.isArray(resolvedParams.brand)
            ? resolvedParams.brand
            : [];

    const minPrice = Number(resolvedParams.minPrice) || 0;
    const maxPriceParam = Number(resolvedParams.maxPrice) || 10000;

    // 4. Build Product Query
    const where: any = {};

    if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
    }

    if (selectedBrands.length > 0) {
        // Filter by brand name via relation
        where.brand = { name: { in: selectedBrands } };
    }

    where.price = {
        gte: minPrice,
        lte: maxPriceParam
    };

    // 5. Fetch Products
    const products = await prisma.product.findMany({
        where,
        include: {
            category: true,
            images: true,
            brand: true // Make sure to fetch the relation
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // 6. Calculate Max Price dynamically for the slider (Global max, not filtered max)
    const priceAggr = await prisma.product.aggregate({
        _max: { price: true }
    });
    const globalMaxPrice = Number(priceAggr._max.price) || 1000;

    // 7. Get Store Config for component styles
    const config = await getStoreConfig();

    return (
        <div className="container mx-auto px-4 pt-32 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Nossos Produtos</h1>
                    <p className="text-slate-500 mt-2">
                        {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                    </p>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 md:hidden w-full md:w-auto">
                            <SlidersHorizontal className="h-4 w-4" /> Filtros
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[540px]">
                        <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                            <SheetDescription>
                                Refine sua busca para encontrar o produto ideal.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8">
                            <ProductFilters
                                categories={categories}
                                brands={allBrands}
                                maxPrice={globalMaxPrice}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex gap-8 items-start">
                {/* Sidebar Filter - Desktop */}
                <aside className="hidden md:block w-64 shrink-0 space-y-8 sticky top-24">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <ProductFilters
                            categories={categories}
                            brands={allBrands}
                            maxPrice={globalMaxPrice}
                        />
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {products.length > 0 ? (
                        <div className={cn(
                            "grid gap-6",
                            config?.mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2",
                            config?.desktopColumns === 3 ? "md:grid-cols-2 lg:grid-cols-3" :
                            config?.desktopColumns === 5 ? "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" :
                            "md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                        )}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} config={config} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Filter className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">Nenhum produto encontrado</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Tente ajustar os filtros ou buscar por outra categoria.
                            </p>
                            <Button variant="link" className="text-primary" asChild>
                                <a href="/produtos">Limpar Filtros</a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
