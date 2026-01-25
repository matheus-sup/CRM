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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { getDistinctBrands } from "@/lib/actions/brands";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().optional(),
    price: z.string().min(1, "Preço obrigatório"),
    compareAtPrice: z.string().optional(),
    costPerItem: z.string().optional(),
    stock: z.coerce.number().min(0, "Estoque inválido"),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().optional(),
    isNewArrival: z.boolean().default(false),
    brand: z.string().optional(),
    videoUrl: z.string().optional().or(z.literal("")),
    weight: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    expiresAt: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function ProductForm({ categories = [], initialData }: { categories?: any[], initialData?: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price ? String(initialData.price) : "",
            compareAtPrice: initialData?.compareAtPrice ? String(initialData.compareAtPrice) : "",
            costPerItem: initialData?.costPerItem ? String(initialData.costPerItem) : "",
            stock: initialData?.stock !== undefined ? Number(initialData.stock) : 0,
            sku: initialData?.sku || "",
            barcode: initialData?.barcode || "",
            categoryId: initialData?.categoryId || "",
            isNewArrival: !!initialData?.isNewArrival,
            brand: initialData?.brand || "",
            videoUrl: initialData?.videoUrl || "",
            weight: initialData?.weight ? String(initialData.weight) : "",
            length: initialData?.length ? String(initialData.length) : "",
            width: initialData?.width ? String(initialData.width) : "",
            height: initialData?.height ? String(initialData.height) : "",
            seoTitle: initialData?.seoTitle || "",
            seoDescription: initialData?.seoDescription || "",
            expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split("T")[0] : "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setStatus("idle");
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                });
                await upsertProduct(formData);
                setStatus("success");
            } catch (error) {
                console.error(error);
                setStatus("error");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto pb-20">

                {/* Header Actions */}
                <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-4 border-b mb-6">
                    <h1 className="text-2xl font-bold">Novo Produto</h1>
                    <div className="flex gap-2 items-center">
                        <StatusFeedback status={status} onReset={() => setStatus("idle")} />
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <FormField
                            control={form.control}
                            name="isNewArrival"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Lançamento</FormLabel>
                                        <FormDescription>
                                            Exibir este produto na seção de Lançamentos na Home?
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Salvar Alterações" : "Criar Produto"}
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
                                        {categories.map((parent: any) => (
                                            <div key={parent.id}>
                                                <SelectItem value={parent.id} className="font-bold bg-slate-50">
                                                    {parent.name}
                                                </SelectItem>
                                                {parent.children && parent.children.map((child: any) => (
                                                    <SelectItem key={child.id} value={child.id} className="pl-6">
                                                        {child.name}
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => {
                                const [open, setOpen] = useState(false);
                                const [brands, setBrands] = useState<string[]>([]);
                                const [inputValue, setInputValue] = useState("");

                                // Fetch brands on open
                                const onOpenChange = (isOpen: boolean) => {
                                    setOpen(isOpen);
                                    if (isOpen && brands.length === 0) {
                                        getDistinctBrands().then(setBrands);
                                    }
                                };

                                return (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Marca</FormLabel>
                                        <Popover open={open} onOpenChange={onOpenChange}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className={cn(
                                                            "justify-between font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value || "Selecione ou crie..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Buscar marca..."
                                                        value={inputValue}
                                                        onValueChange={setInputValue}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            <div className="p-2">
                                                                <p className="text-sm text-muted-foreground mb-2">"{inputValue}" não encontrada.</p>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="w-full h-8 px-2"
                                                                    onClick={() => {
                                                                        field.onChange(inputValue);
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    Criar "{inputValue}"
                                                                </Button>
                                                            </div>
                                                        </CommandEmpty>
                                                        <CommandGroup heading="Marcas Existentes">
                                                            {brands.map((brand) => (
                                                                <CommandItem
                                                                    key={brand}
                                                                    value={brand}
                                                                    onSelect={(currentValue: string) => {
                                                                        field.onChange(currentValue === field.value ? "" : currentValue);
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            brand === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {brand}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

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



            </form>
        </Form>
    );
}
