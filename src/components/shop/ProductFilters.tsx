"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    _count?: { products: number };
    children?: Category[];
}

interface ProductFiltersProps {
    categories: Category[];
    brands: string[];
    maxPrice: number;
}

export function ProductFilters({ categories, brands, maxPrice }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State initialization
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.getAll("category")
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        searchParams.getAll("brand")
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || maxPrice,
    ]);

    // Update URL when filters change
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");

        params.delete("category");
        selectedCategories.forEach((c) => params.append("category", c));

        params.delete("brand");
        selectedBrands.forEach((b) => params.append("brand", b));

        params.set("minPrice", priceRange[0].toString());
        params.set("maxPrice", priceRange[1].toString());

        router.push(`/produtos?${params.toString()}`, { scroll: false });
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand)
                ? prev.filter((b) => b !== brand)
                : [...prev, brand]
        );
    };

    useEffect(() => {
        const timeout = setTimeout(applyFilters, 500);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategories, selectedBrands, priceRange]);

    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, maxPrice]);
        router.push("/produtos");
    };

    // Recursive Category Renderer
    const renderCategory = (category: Category, level = 0) => {
        const isSelected = selectedCategories.includes(category.id);
        const hasChildren = category.children && category.children.length > 0;

        return (
            <div key={category.id} className="space-y-1">
                <div className={cn("flex items-center space-x-2 rounded-md hover:bg-slate-50 p-1", level > 0 && "ml-4 border-l pl-2")}>
                    <Checkbox
                        id={`cat-${category.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal cursor-pointer flex-1 flex justify-between select-none">
                        <span>{category.name}</span>
                        {category._count && <Badge variant="secondary" className="text-[10px] h-5">{category._count.products}</Badge>}
                    </Label>
                </div>
                {hasChildren && (
                    <div className="pl-2">
                        {category.children!.map(child => renderCategory(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filtros</h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs">
                        Limpar <X className="ml-1 h-3 w-3" />
                    </Button>
                )}
            </div>

            <Accordion type="multiple" defaultValue={["categories", "price", "brands"]} className="w-full">
                {/* Categories */}
                <AccordionItem value="categories">
                    <AccordionTrigger>Categorias</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1 pt-1">
                            {categories.map((category) => renderCategory(category))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger>Faixa de Preço</AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-4 px-2 space-y-4">
                            <Slider
                                defaultValue={[0, maxPrice]}
                                value={priceRange}
                                max={maxPrice}
                                step={1}
                                min={0}
                                onValueChange={(val) => setPriceRange(val as [number, number])}
                                className="my-4"
                            />
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>R$ {priceRange[0].toFixed(2)}</span>
                                <span>R$ {priceRange[1].toFixed(2)}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Brands */}
                {brands.length > 0 && (
                    <AccordionItem value="brands">
                        <AccordionTrigger>Marcas</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pt-1">
                                {brands.map((brand) => (
                                    <div key={brand} className="flex items-center space-x-2 hover:bg-slate-50 p-1 rounded-md">
                                        <Checkbox
                                            id={`brand-${brand}`}
                                            checked={selectedBrands.includes(brand)}
                                            onCheckedChange={() => toggleBrand(brand)}
                                        />
                                        <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer flex-1">
                                            {brand}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}
