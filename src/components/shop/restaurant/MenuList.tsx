"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { ProductDetailSheet } from "./ProductDetailSheet";

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    images?: string[];
    category?: {
        id: string;
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
    products: Product[];
}

interface MenuListProps {
    categories: Category[];
    config?: any;
}

export function RestaurantMenuList({ categories, config }: MenuListProps) {
    const themeColor = config?.themeColor || "#ef4444";
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const { addItem } = useCart();

    const quickAdd = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
            quantity: 1,
        });
    };

    return (
        <>
            <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                    <section key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                        {/* Category Header */}
                        <div className="sticky top-14 sm:top-16 z-10 bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                        </div>

                        {/* Products List */}
                        <div className="divide-y divide-gray-100">
                            {category.products.map((product) => (
                                <article
                                    key={product.id}
                                    className="flex items-start gap-3 p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                        <p
                                            className="font-bold mt-2 text-sm sm:text-base"
                                            style={{ color: themeColor }}
                                        >
                                            R$ {product.price.toFixed(2).replace(".", ",")}
                                        </p>
                                    </div>

                                    {/* Product Image */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Quick Add Button */}
                                        <button
                                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
                                            style={{ backgroundColor: themeColor }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                quickAdd(product);
                                            }}
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Product Detail Sheet */}
            <ProductDetailSheet
                product={selectedProduct}
                open={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                config={config}
            />
        </>
    );
}
