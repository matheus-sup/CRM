
import { prisma } from "@/lib/prisma";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";
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
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 1. Get Categories for sidebar
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Get Distinct Brands
    const brandResults = await prisma.product.groupBy({
        by: ['brand'],
        where: {
            brand: { not: null }
        },
        orderBy: { brand: 'asc' }
    });
    // Filter out nulls explicitly if needed, though query handles it mostly. 
    // groupBy returns objects { brand: "Name" }, map it to string[].
    const allBrands = brandResults.map(b => b.brand).filter((b): b is string => b !== null);


    // 3. Parse Filter Params
    const categoryIds = typeof searchParams.category === 'string'
        ? [searchParams.category]
        : Array.isArray(searchParams.category)
            ? searchParams.category
            : [];

    const selectedBrands = typeof searchParams.brand === 'string'
        ? [searchParams.brand]
        : Array.isArray(searchParams.brand)
            ? searchParams.brand
            : [];

    const minPrice = Number(searchParams.minPrice) || 0;
    const maxPriceParam = Number(searchParams.maxPrice) || 10000;

    // 4. Build Product Query
    const where: any = {};

    if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
    }

    if (selectedBrands.length > 0) {
        where.brand = { in: selectedBrands };
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
            images: true
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

    return (
        <div className="container mx-auto px-4 py-8">
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
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
