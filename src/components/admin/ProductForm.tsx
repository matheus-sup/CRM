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
import { upsertProduct, deleteProduct } from "@/lib/actions/product"; // Server Action
import React, { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, AlertCircle, Plus, Trash2 } from "lucide-react";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { createCategory, deleteCategory } from "@/lib/actions/category";
import { createBrand, deleteBrand, getAllBrands } from "@/lib/actions/brands-management";
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
    brandId: z.string().optional(),
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
            brandId: initialData?.brandId || "",
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

    // Image Handling State
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>(
        initialData?.images?.map((img: any) => img.url) || []
    );

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);

            // Create previews
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newUrls]);
        }
    }

    function removeFile(index: number) {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    // Brand State
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");

    // Fetch brands on mount
    React.useEffect(() => {
        getAllBrands().then((res: any) => setBrands(res));
    }, []);

    async function handleCreateBrand() {
        if (newBrandName.trim()) {
            const res = await createBrand(newBrandName.trim());
            if (res.success) {
                const updated = await getAllBrands();
                setBrands(updated);

                const newB = updated.find((b: any) => b.name.toLowerCase() === newBrandName.trim().toLowerCase());
                if (newB) {
                    form.setValue("brandId", newB.id);
                }
                setIsBrandDialogOpen(false);
                setNewBrandName("");
            } else {
                alert(res.message || "Erro ao criar marca");
            }
        }
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Wrapper to handle internal logic with force flag
        const submitLogic = async (excludeNameCheck = false) => {
            setStatus("idle");
            startTransition(async () => {
                try {
                    const formData = new FormData();
                    Object.entries(values).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            formData.append(key, String(value));
                        }
                    });

                    // Append Images
                    selectedFiles.forEach((file) => {
                        formData.append("images", file);
                    });

                    if (initialData?.id) {
                        formData.append("id", initialData.id);
                    }

                    if (excludeNameCheck) {
                        formData.append("forceSave", "true");
                    }

                    // @ts-ignore
                    const res = await upsertProduct(formData);

                    if (res && res.success === false) {
                        if (res.requiresConfirmation) {
                            if (confirm(res.message)) {
                                // User confirmed, retry with forceSave
                                submitLogic(true);
                            } else {
                                setStatus("error"); // or stay idle?
                            }
                            return;
                        }

                        // Hard error
                        alert(res.message);
                        setStatus("error");
                        return;
                    }

                    setStatus("success");
                    // Optional: redirect or reset? The action redirects, but typically we wait.
                } catch (error) {
                    console.error(error);
                    setStatus("error");
                }
            });
        };

        submitLogic(false);
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
                        {initialData && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={async () => {
                                    if (confirm(`Tem certeza que deseja excluir o produto "${initialData.name}"? Esta ação não pode ser desfeita.`)) {
                                        await deleteProduct(initialData.id); // Renamed import or use from props? No, imported directly.
                                        // deleteProduct handles redirect, but we might want to ensure client state is clean.
                                        // The action redirects to /admin/products.
                                    }
                                }}
                                title="Excluir produto"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
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

                    {/* Hidden Input */}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {/* Dropzone / Trigger */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                        <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                            <Upload className="h-6 w-6" />
                        </div>
                        <span className="text-blue-600 font-bold mb-1">Adicionar fotos</span>
                        <span className="text-xs text-muted-foreground">Clique para selecionar fotos do produto</span>
                    </div>

                    {/* Previews */}
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-100 group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="h-3 w-3 flex items-center justify-center">x</div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                        <FormField control={form.control} name="categoryId" render={({ field }) => {
                            const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
                            const [newCategoryName, setNewCategoryName] = useState("");

                            async function handleCreateCategory() {
                                if (!newCategoryName.trim()) return;
                                const res = await createCategory(new FormData(), newCategoryName.trim()); // Small hack: adapt createCategory to accept string or FormData if needed, but here we need to fix the call. 
                                // Actually createCategory expects FormData. Let's fix usage.
                            }

                            // Correction: We need to define the handlers properly inside the component or outside if possible.
                            // But since we need access to 'categories' prop updates, it's tricky without a router refresh or state update.
                            // However, server actions usually purge cache.
                            // Let's implement the UI and simple handlers.

                            return (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <div className="flex gap-2">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="flex-1"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsCategoryDialogOpen(true)}
                                            title="Nova Categoria"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            disabled={!field.value}
                                            onClick={async () => {
                                                if (!field.value) return;
                                                // Find selected category
                                                const allCats = categories.flatMap((c: any) => [c, ...(c.children || [])]);
                                                const selected = allCats.find((c: any) => c.id === field.value);
                                                if (!selected) return;

                                                const count = selected._count?.products || 0;
                                                if (count > 0) {
                                                    if (!confirm(`Tem certeza? Existem ${count} produtos nesta categoria.`)) return;
                                                } else {
                                                    if (!confirm("Excluir esta categoria?")) return;
                                                }

                                                await deleteCategory(field.value);
                                                form.setValue("categoryId", ""); // Reset after delete
                                            }}
                                            title="Excluir Categoria Selecionada"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {isCategoryDialogOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
                                                <h3 className="text-lg font-bold">Nova Categoria</h3>
                                                <Input
                                                    placeholder="Nome da categoria"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" type="button" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
                                                    <Button type="button" onClick={async () => {
                                                        const formData = new FormData();
                                                        formData.append("name", newCategoryName);
                                                        await createCategory(formData);
                                                        setIsCategoryDialogOpen(false);
                                                        setNewCategoryName("");
                                                    }}>Criar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )
                        }} />

                        <FormField
                            control={form.control}
                            name="brandId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Marca</FormLabel>
                                    <div className="flex gap-2">
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Selecione uma marca..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsBrandDialogOpen(true)}
                                            title="Adicionar nova marca"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            disabled={!field.value}
                                            onClick={async () => {
                                                if (!field.value) return;
                                                const selected = brands.find(b => b.id === field.value);
                                                if (!selected) return;

                                                if (!confirm(`Tem certeza que deseja excluir a marca "${selected.name}"?`)) return;

                                                const res = await deleteBrand(field.value);
                                                if (res.success) {
                                                    const updated = await getAllBrands();
                                                    setBrands(updated);
                                                    form.setValue("brandId", "");
                                                } else {
                                                    alert(res.message);
                                                }
                                            }}
                                            title="Excluir marca selecionada"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Dialog for New Brand */}
                                    {isBrandDialogOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
                                                <h3 className="text-lg font-bold">Nova Marca</h3>
                                                <Input
                                                    placeholder="Nome da marca"
                                                    value={newBrandName}
                                                    onChange={(e) => setNewBrandName(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" type="button" onClick={() => setIsBrandDialogOpen(false)}>Cancelar</Button>
                                                    <Button type="button" onClick={handleCreateBrand}>Adicionar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
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
