import { notFound } from "next/navigation";
import { getTemplateById } from "@/lib/templates";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { BlockRenderer } from "@/components/shop/pbuilder/BlockRenderer";
import { ThemeInjector } from "@/components/theme-injector";
import { RestaurantHome, CardapioHome, CardapioHeader } from "@/components/shop/restaurant";
import { PageBlock } from "@/types/page-builder";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/actions/product";
import { CartSheet } from "@/components/shop/CartSheet";

export const dynamic = "force-dynamic";

export default async function TemplatePreviewPage({
    params,
}: {
    params: Promise<{ templateId: string }>;
}) {
    const { templateId } = await params;
    const template = getTemplateById(templateId);

    if (!template) {
        notFound();
    }

    const config = {
        ...template.config,
        minPurchaseValue: template.config.minPurchaseValue ? Number(template.config.minPurchaseValue) : 0,
    };

    // Fetch real data from DB
    const [products, categories, brands, menus] = await Promise.all([
        getProducts(),
        prisma.category.findMany({
            where: { parentId: null },
            orderBy: { name: "asc" },
            take: 8,
            include: { children: true },
        }),
        prisma.brand.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { products: true } } },
        }),
        prisma.menu.findMany({
            include: { items: { orderBy: { order: "asc" } } },
        }),
    ]);

    // Generate CSS variables from template config
    const cssVariables = `
        :root {
            --primary: ${config.themeColor || "#db2777"};
            --brand-accent: ${config.accentColor || config.themeColor || "#db2777"};
            --price-color: ${config.priceColor || config.accentColor || config.themeColor || "#db2777"};
            --secondary: ${config.secondaryColor || "#fce7f3"};
            --background: ${config.backgroundColor || "#ffffff"};

            --header-bg: ${config.headerColor || config.backgroundColor || "#ffffff"};
            --footer-bg: ${config.footerBg || "#171717"};
            --footer-text: ${config.footerText || "#a3a3a3"};

            --color-menu: ${config.menuColor || "#334155"};
            --font-menu: ${config.menuFont || "inherit"};

            --color-heading: ${config.headingColor || "#111827"};
            --color-section-title: ${config.sectionTitleColor || config.headingColor || "#111827"};
            --color-hero-text: ${config.bannerTextColor || config.headingColor || "#111827"};

            --btn-header-bg: ${config.headerBtnBg || config.themeColor || "#db2777"};
            --btn-header-text: ${config.headerBtnText || "#ffffff"};

            --btn-product-bg: ${config.productBtnBg || config.themeColor || "#db2777"};
            --btn-product-text: ${config.productBtnText || "#ffffff"};

            --font-heading: ${config.headingFont || "inherit"};

            --color-body: ${config.bodyColor || "#334155"};
            --font-body: ${config.bodyFont || "inherit"};
            --font-sans: ${config.bodyFont || "inherit"};

            --color-search-bg: ${config.searchBtnBg || config.themeColor || "#db2777"};
            --color-search-icon: ${config.searchIconColor || "#ffffff"};
            --color-cart-bg: ${config.cartCountBg || "#22c55e"};
            --color-cart-text: ${config.cartCountText || "#ffffff"};

            --ring: ${config.themeColor || "#db2777"};
            --foreground: ${config.bodyColor || "#334155"};
        }
    `;

    const isRestaurant = config.siteType === "restaurant";
    const isCardapio = config.siteType === "cardapio";

    // Serialize products for client components (Restaurant/Cardapio)
    const serializedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: (p as any).description || "",
        price: Number(p.price),
        images: p.images?.map((img: any) => img.url) || [],
        categoryId: (p as any).categoryId,
        category: p.category ? {
            id: p.category.id,
            name: p.category.name,
            slug: (p.category as any).slug
        } : null
    }));

    const serializedCategories = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.imageUrl
    }));

    // --- CARDAPIO MODE ---
    if (isCardapio) {
        return (
            <div className="flex min-h-screen flex-col bg-white">
                <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
                <ThemeInjector config={config} />

                <CardapioHeader config={config} categories={categories} />
                <main className="flex-1">
                    <CardapioHome config={config} />
                </main>
                <CartSheet />
            </div>
        );
    }

    // --- RESTAURANT MODE ---
    if (isRestaurant) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
                <ThemeInjector config={config} />

                <Header config={config} categories={categories} />
                <main className="flex-1">
                    <RestaurantHome
                        products={serializedProducts}
                        categories={serializedCategories}
                        config={config}
                    />
                </main>
                <CartSheet />
            </div>
        );
    }

    // --- STANDARD SHOP MODE (Page Builder) ---
    let blocks: PageBlock[] = [];
    try {
        blocks = JSON.parse(config.homeLayout || "[]");
    } catch {
        blocks = [];
    }

    return (
        <div className="flex min-h-screen flex-col">
            <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
            <ThemeInjector config={config} />

            <Header config={config} categories={categories} />

            <main className="flex-1">
                {blocks.length > 0 ? (
                    <BlockRenderer
                        blocks={blocks}
                        products={products}
                        categories={categories}
                        brands={brands}
                        config={config}
                    />
                ) : (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                        <p>Este template não possui blocos na home.</p>
                    </div>
                )}
            </main>

            <Footer config={config} menus={menus} />
        </div>
    );
}
