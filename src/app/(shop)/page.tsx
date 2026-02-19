import { getProducts } from "@/lib/actions/product";
import { getActiveBanners } from "@/lib/actions/banner";
import { prisma } from "@/lib/prisma";
import { getStoreConfig } from "@/lib/actions/settings";
import { BlockRenderer } from "@/components/shop/pbuilder/BlockRenderer";
import { PageBlock } from "@/types/page-builder";
import { ModernHome } from "@/components/shop/modern/ModernHome";

export default async function HomePage() {
    const products = await getProducts();
    const banners = await getActiveBanners();
    const config = await getStoreConfig();

    // Fetch Categories for Modern/Legacy Views
    // (Legacy fetches internally in CategoryNav, but Modern needs it for the grid)
    const categories = await prisma.category.findMany({
        where: { parentId: null }, // Main categories only for home
        orderBy: { name: 'asc' },
        take: 8,
        include: { children: true }
    });

    // Fetch Brands
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
    });

    // --- PAGE BUILDER RENDERING ---
    let blocks: PageBlock[] = [];
    try {
        const parsed = JSON.parse(config.homeLayout || "[]");
        // Legacy fallback logic (same as Admin)
        if (parsed.length > 0 && "enabled" in parsed[0]) {
            return <ModernHome products={products} banners={banners} categories={categories} brands={brands} config={config} />;
        }
        blocks = parsed;
    } catch {
        return <ModernHome products={products} banners={banners} categories={categories} brands={brands} config={config} />;
    }

    // New Empty State
    if (blocks.length === 0) {
        return <ModernHome products={products} banners={banners} categories={categories} brands={brands} config={config} />;
    }

    return (
        <main className="min-h-screen">
            <BlockRenderer blocks={blocks} products={products} categories={categories} brands={brands} config={config} />
        </main>
    );
}
