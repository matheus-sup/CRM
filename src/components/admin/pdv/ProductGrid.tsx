import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku?: string;
    images?: string[];
    // Add other fields as necessary
}

interface ProductGridProps {
    products: Product[];
    onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 overflow-y-auto h-full">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className="group relative flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-pink-500 transition-all duration-200"
                >
                    <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
                        {product.images && product.images.length > 0 ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-400">
                                <span className="text-4xl">📷</span>
                            </div>
                        )}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-sm">
                                    Sem Estoque
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-3">
                        <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5em] leading-tight mb-1">
                            {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500 font-mono">{product.sku}</span>
                                <span className="font-bold text-lg text-pink-600">
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 0
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {product.stock} un
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
