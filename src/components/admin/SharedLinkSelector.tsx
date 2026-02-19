"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SharedLinkSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    onSelectLabel?: (label: string) => void;
    categories: { id: string; name: string }[];
    className?: string; // Add className support
}

export function SharedLinkSelector({ value = "", onChange, onSelectLabel, categories, className }: SharedLinkSelectorProps) {
    const [customUrl, setCustomUrl] = useState(value);

    // Determine initial tab based on value
    const getInitialTab = () => {
        if (!value) return "pages";
        if (value.startsWith("/produtos?category=")) return "categories";
        if (value.startsWith("/") && !value.includes("?")) return "pages";
        return "custom";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Update custom input when value changes externally
    useEffect(() => {
        setCustomUrl(value);
    }, [value]);

    const staticPages = [
        { label: "Página Inicial", value: "/" },
        { label: "Todos os Produtos", value: "/produtos" },
        { label: "Minha Conta", value: "/minha-conta" },
        { label: "Carrinho", value: "/carrinho" },
        { label: "Contato", value: "/contato" },
        { label: "Quem Somos / Sobre", value: "/sobre" },
        { label: "Política de Privacidade", value: "/politica-privacidade" },
        { label: "Termos de Uso", value: "/termos" },
    ];

    const handlePageChange = (val: string) => {
        onChange(val);
        const label = staticPages.find(p => p.value === val)?.label;
        if (label && onSelectLabel) onSelectLabel(label);
    };

    const handleCategoryChange = (val: string) => {
        onChange(val);
        // Find category ID from URL or just match the generated value
        const cat = categories.find(c => `/produtos?category=${c.id}` === val);
        if (cat && onSelectLabel) onSelectLabel(cat.name);
    };

    return (
        <div className={className}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="pages" className="text-xs px-1">Páginas</TabsTrigger>
                    <TabsTrigger value="categories" className="text-xs px-1">Categorias</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs px-1">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="pages" className="pt-2">
                    <Select value={value} onValueChange={handlePageChange}>
                        <SelectTrigger className="h-8 text-xs bg-white text-black">
                            <SelectValue placeholder="Selecione uma página..." />
                        </SelectTrigger>
                        <SelectContent>
                            {staticPages.map((page) => (
                                <SelectItem key={page.value} value={page.value}>
                                    {page.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TabsContent>

                <TabsContent value="categories" className="pt-2">
                    <Select value={value} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="h-8 text-xs bg-white text-black">
                            <SelectValue placeholder="Selecione uma categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={`/produtos?category=${cat.id}`}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TabsContent>

                <TabsContent value="custom" className="pt-2 space-y-2">
                    <Input
                        placeholder="https://... ou /slug"
                        value={customUrl}
                        onChange={(e) => {
                            setCustomUrl(e.target.value);
                            onChange(e.target.value);
                        }}
                        className="h-8 text-xs bg-white text-black"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
