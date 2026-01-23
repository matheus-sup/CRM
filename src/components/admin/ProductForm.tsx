"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertProduct } from "@/lib/actions/product"; // Server Action
import { useState, useTransition } from "react";
import { Loader2, Upload, AlertCircle } from "lucide-react";

// Mock Categories - in real app, fetch these
const categories = [
    { id: "cat_cabelos", name: "Cuidados com os Cabelos" },
    { id: "cat_makeup", name: "Maquiagem" },
    { id: "cat_skin", name: "Skincare" },
    { id: "cat_perfume", name: "Perfumaria" },
];

const formSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().optional(),
    price: z.string().min(1, "Preço obrigatório"),
    compareAtPrice: z.string().optional(),
    costPerItem: z.string().optional(),
    stock: z.string().min(1, "Estoque obrigatório"),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().optional(),
    brand: z.string().optional(),
    videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    weight: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
});

export function ProductForm() {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            compareAtPrice: "",
            costPerItem: "",
            stock: "",
            sku: "",
            barcode: "",
            categoryId: "",
            brand: "",
            videoUrl: "",
            weight: "",
            length: "",
            width: "",
            height: "",
            seoTitle: "",
            seoDescription: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            await upsertProduct(formData);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto pb-20">

                {/* Header Actions */}
                <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-4 border-b mb-6">
                    <h1 className="text-2xl font-bold">Novo Produto</h1>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar alterações
                        </Button>
                    </div>
                </div>

                {/* Name & Description */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h2 className="font-bold text-lg mb-4">Nome e descrição</h2>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Batom Matte Vermelho" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Descreva seu produto..."
                                        className="min-h-[150px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs text-right">
                                    Gerar com IA (Simulado)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Images */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h2 className="font-bold text-lg mb-4">Fotos e vídeo</h2>
                    <div className="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                            <Upload className="h-6 w-6" />
                        </div>
                        <span className="text-blue-600 font-bold mb-1">Adicionar fotos</span>
                        <span className="text-xs text-muted-foreground">Arraste e solte, ou selecione fotos do produto</span>
                    </div>
                </div>

                {/* Pricing & Costs */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">Preços e Custos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço de venda *</FormLabel>
                                <FormControl><Input placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="compareAtPrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço promocional</FormLabel>
                                <FormControl><Input placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="costPerItem" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custo do item (Margem)</FormLabel>
                                <FormControl><Input placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                {/* Inventory */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">Estoque e Identificação</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="stock" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estoque *</FormLabel>
                                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl><Input placeholder="Ex: PROD-01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="barcode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código de Barras (EAN)</FormLabel>
                                <FormControl><Input placeholder="Sem GTIN/EAN" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                {/* Shipping */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">Frete e Envio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="weight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Peso (kg)</FormLabel>
                                <FormControl><Input placeholder="0.100" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="length" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Comp. (cm)</FormLabel>
                                <FormControl><Input placeholder="0" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="width" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Larg. (cm)</FormLabel>
                                <FormControl><Input placeholder="0" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="height" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alt. (cm)</FormLabel>
                                <FormControl><Input placeholder="0" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                {/* Organization & Media Extra */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">Organização e Mídia</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="categoryId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marca</FormLabel>
                                <FormControl><Input placeholder="Ex: Max Love" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="col-span-full">
                            <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vídeo do Produto (URL)</FormLabel>
                                    <FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">SEO (Google)</h2>
                    <div className="space-y-4">
                        <FormField control={form.control} name="seoTitle" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título para SEO</FormLabel>
                                <FormControl><Input placeholder="Título que aparece no Google" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="seoDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição para SEO</FormLabel>
                                <FormControl><Textarea placeholder="Descrição curta que aparece no Google" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

            </form>
        </Form>
    );
}
