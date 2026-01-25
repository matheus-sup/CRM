"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: any; // Using any for now to avoid strict type issues with Prismal, typically Product with inclusions
}

export function ProductCard({ product }: ProductCardProps) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
    const image = product.images?.[0]?.url || "/assets/placeholder-product.png";

    return (
        <Link href={`/produto/${product.slug}`} className="group relative block h-full">
            <div className="flex h-full flex-col gap-4 rounded-xl bg-card p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-primary/10">
                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {discount > 0 && (
                            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground border-none px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                                -{discount}%
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-wider font-bold">
                            Novo
                        </Badge>
                    </div>

                    {/* Quick Add Button (Visible on Hover) */}
                    <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button size="icon" className="h-10 w-10 rounded-full bg-card text-primary shadow-md hover:bg-primary hover:text-primary-foreground transition-colors">
                            <ShoppingBag className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 gap-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    <div className="mt-auto flex flex-col gap-1">
                        {compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compareAtPrice)}
                            </span>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold" style={{ color: "var(--price-color)" }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                6x sem juros
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
