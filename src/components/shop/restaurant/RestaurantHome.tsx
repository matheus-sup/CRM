"use client";

import { RestaurantStoreInfo } from "./StoreInfo";
import { RestaurantMenuList } from "./MenuList";
import { RestaurantBottomNav } from "./BottomNav";
import { FloatingCart } from "./FloatingCart";

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    images?: string[];
    category?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    categoryId?: string | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
}

interface RestaurantHomeProps {
    products: Product[];
    categories: Category[];
    config: any;
}

export function RestaurantHome({ products, categories, config }: RestaurantHomeProps) {
    // Group products by category
    const categoriesWithProducts = categories
        .map((cat) => ({
            ...cat,
            products: products.filter((p) => p.categoryId === cat.id || p.category?.id === cat.id)
        }))
        .filter((cat) => cat.products.length > 0);

    // Add uncategorized products
    const uncategorizedProducts = products.filter(
        (p) => !p.categoryId && !p.category
    );

    if (uncategorizedProducts.length > 0) {
        categoriesWithProducts.push({
            id: "outros",
            name: "Outros",
            slug: "outros",
            image: null,
            products: uncategorizedProducts
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
            {/* Store Info Header */}
            <RestaurantStoreInfo config={config} />

            {/* Menu List */}
            <div className="bg-white">
                <RestaurantMenuList categories={categoriesWithProducts} config={config} />
            </div>

            {/* Floating Cart Button */}
            <FloatingCart config={config} />

            {/* Bottom Navigation (Mobile Only) */}
            <RestaurantBottomNav config={config} />
        </div>
    );
}
