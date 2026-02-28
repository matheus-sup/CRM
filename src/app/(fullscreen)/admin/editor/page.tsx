
import { getDraftStoreConfig } from "@/lib/actions/settings";
import { getBanners } from "@/lib/actions/banner";
import { SiteEditorLayout } from "@/components/admin/site/SiteEditorLayout";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FullscreenEditorPage() {
    const config = await getDraftStoreConfig();
    const banners = await getBanners();
    const products = await prisma.product.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
            images: true,
            variants: { orderBy: { order: 'asc' } },
            category: true,
        }
    });
    const menus = await prisma.menu.findMany({
        include: { items: true }
    });

    // Fetch categories for preview
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: 'asc' },
        take: 8,
    });

    // Fetch brands for preview
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        take: 6,
    });

    // Fetch delivery menu categories and items for Cardápio preview
    const deliveryCategories = await prisma.deliveryCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
            items: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    // Serialize delivery data (convert Decimal to Number)
    const serializedDeliveryCategories = deliveryCategories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
            ...item,
            price: Number(item.price),
            compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
            customizations: item.customizations ? JSON.parse(item.customizations) : [],
            extras: item.extras ? JSON.parse(item.extras) : [],
            tags: item.tags ? JSON.parse(item.tags) : [],
        })),
    }));

    // Serialize Decimal types for Client Components
    const serializedConfig = {
        ...config,
        menus: menus, // Attach menus to config for Header
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    };

    return (
        <div className="h-screen w-screen bg-white overflow-hidden">
            <SiteEditorLayout
                config={serializedConfig}
                banners={banners as any}
                products={JSON.parse(JSON.stringify(products))}
                categories={categories}
                brands={brands}
                menus={menus}
                deliveryCategories={serializedDeliveryCategories}
            />
        </div>
    );
}
