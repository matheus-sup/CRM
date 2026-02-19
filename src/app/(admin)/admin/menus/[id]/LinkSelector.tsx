"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LinkSelectorProps {
    value: string;
    onChange: (value: string) => void;
    onSelectLabel?: (label: string) => void;
    categories: { id: string; name: string }[];
}

export function LinkSelector({ value, onChange, onSelectLabel, categories }: LinkSelectorProps) {
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
    ];

    const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
        const label = staticPages.find(p => p.value === selectedValue)?.label;
        if (label && onSelectLabel) onSelectLabel(label);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
        // Find category ID from URL or just match the generated value
        const cat = categories.find(c => `/produtos?category=${c.id}` === selectedValue);
        if (cat && onSelectLabel) onSelectLabel(cat.name);
    };

    return (
        <div className="space-y-3">
            <Label>Destino do Link</Label>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pages">Páginas</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="custom">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="pages" className="pt-2">
                    <select
                        className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                        value={value}
                        onChange={handlePageChange}
                    >
                        <option value="" disabled>Selecione uma página...</option>
                        {staticPages.map((page) => (
                            <option key={page.value} value={page.value}>
                                {page.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                        Páginas padrão da loja.
                    </p>
                </TabsContent>

                <TabsContent value="categories" className="pt-2">
                    <select
                        className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                        value={value}
                        onChange={handleCategoryChange}
                    >
                        <option value="" disabled>Selecione uma categoria...</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={`/produtos?category=${cat.id}`}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                        Direciona para a lista de produtos filtrada por esta categoria.
                    </p>
                </TabsContent>

                <TabsContent value="custom" className="pt-2">
                    <Input
                        placeholder="https://... ou /minha-pagina"
                        value={customUrl}
                        onChange={(e) => {
                            setCustomUrl(e.target.value);
                            onChange(e.target.value);
                        }}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Cole um link externo ou digite um caminho interno.
                    </p>
                </TabsContent>
            </Tabs>

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name="url" value={value} />
        </div>
    );
}
