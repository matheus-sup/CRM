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
import React, { useState, useTransition, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, Plus, Trash2, GripVertical, Palette, Info, ImageIcon, Star } from "lucide-react";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { createCategory, deleteCategory } from "@/lib/actions/category";
import { createBrand, deleteBrand, getAllBrands } from "@/lib/actions/brands-management";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Tipo para uma medida individual
interface Measurement {
    id: string;
    title: string;
    value: string;
    unit: "cm" | "mm";
}

// Componente para gerenciar medidas
function MeasurementsField({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
    const [measurements, setMeasurements] = useState<Measurement[]>(() => {
        if (!value) return [];
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    });

    const addMeasurement = () => {
        const newMeasurement: Measurement = {
            id: Date.now().toString(),
            title: "",
            value: "",
            unit: "cm",
        };
        const updated = [...measurements, newMeasurement];
        setMeasurements(updated);
        onChange(JSON.stringify(updated));
    };

    const updateMeasurement = (id: string, field: keyof Measurement, newValue: string) => {
        const updated = measurements.map((m) =>
            m.id === id ? { ...m, [field]: newValue } : m
        );
        setMeasurements(updated);
        onChange(JSON.stringify(updated));
    };

    const removeMeasurement = (id: string) => {
        const updated = measurements.filter((m) => m.id !== id);
        setMeasurements(updated);
        onChange(JSON.stringify(updated));
    };

    return (
        <div className="space-y-4">
            {measurements.length > 0 && (
                <div className="space-y-3">
                    {measurements.map((measurement) => (
                        <div
                            key={measurement.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
                        >
                            <Input
                                placeholder="Título (ex: Busto, Cintura)"
                                value={measurement.title}
                                onChange={(e) => updateMeasurement(measurement.id, "title", e.target.value)}
                                className="flex-1 bg-white"
                            />
                            <Input
                                type="number"
                                placeholder="0"
                                value={measurement.value}
                                onChange={(e) => updateMeasurement(measurement.id, "value", e.target.value)}
                                className="w-24 bg-white"
                            />
                            <Select
                                value={measurement.unit}
                                onValueChange={(v) => updateMeasurement(measurement.id, "unit", v)}
                            >
                                <SelectTrigger className="w-20 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="mm">mm</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMeasurement(measurement.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={addMeasurement}
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medida
            </Button>

            {measurements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                    Clique em "Adicionar Medida" para incluir as medidas do produto.
                </p>
            )}
        </div>
    );
}

// Color Variant types for the editor
interface ColorVariantState {
    id?: string;
    name: string;
    colorHex: string;
    colorImage: string; // URL of swatch image (alternative to colorHex)
    colorImageFile: File | null; // New file to upload for swatch
    colorImagePreview: string; // Preview URL for new file
    existingImages: string[]; // URLs already uploaded
    newFiles: File[];
    newFilePreviews: string[];
    price: string;
    stock: number;
    sku: string;
    order: number;
    isDefault: boolean;
}

function createEmptyVariant(order: number): ColorVariantState {
    return {
        name: "",
        colorHex: "#000000",
        colorImage: "",
        colorImageFile: null,
        colorImagePreview: "",
        existingImages: [],
        newFiles: [],
        newFilePreviews: [],
        price: "",
        stock: 0,
        sku: "",
        order,
        isDefault: false,
    };
}

function ColorVariantsEditor({
    variants,
    onChange,
}: {
    variants: ColorVariantState[];
    onChange: (variants: ColorVariantState[]) => void;
}) {
    const fileRefs = React.useRef<Record<number, HTMLInputElement | null>>({});
    const swatchFileRefs = React.useRef<Record<number, HTMLInputElement | null>>({});

    const addVariant = () => {
        onChange([...variants, createEmptyVariant(variants.length)]);
    };

    const removeVariant = (index: number) => {
        const updated = variants.filter((_, i) => i !== index).map((v, i) => ({ ...v, order: i }));
        onChange(updated);
    };

    const updateVariant = (index: number, field: keyof ColorVariantState, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const handleVariantFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const updated = [...variants];
            const v = { ...updated[index] };
            v.newFiles = [...v.newFiles, ...newFiles];
            v.newFilePreviews = [...v.newFilePreviews, ...newFiles.map(f => URL.createObjectURL(f))];
            updated[index] = v;
            onChange(updated);
        }
        // Reset input so same file can be selected again
        e.target.value = "";
    };

    const removeExistingVariantImage = (variantIndex: number, imageIndex: number) => {
        const updated = [...variants];
        const v = { ...updated[variantIndex] };
        v.existingImages = v.existingImages.filter((_, i) => i !== imageIndex);
        updated[variantIndex] = v;
        onChange(updated);
    };

    const removeNewVariantFile = (variantIndex: number, fileIndex: number) => {
        const updated = [...variants];
        const v = { ...updated[variantIndex] };
        v.newFiles = v.newFiles.filter((_, i) => i !== fileIndex);
        v.newFilePreviews = v.newFilePreviews.filter((_, i) => i !== fileIndex);
        updated[variantIndex] = v;
        onChange(updated);
    };

    const moveVariant = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= variants.length) return;
        const updated = [...variants];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated.map((v, i) => ({ ...v, order: i })));
    };

    const setDefaultVariant = (index: number) => {
        const updated = variants.map((v, i) => ({ ...v, isDefault: i === index }));
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            {variants.map((variant, index) => (
                <div key={variant.id || `new-${index}`} className="border rounded-lg p-4 space-y-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveVariant(index, "up")}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="h-3 w-3" viewBox="0 0 10 6"><path d="M1 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveVariant(index, "down")}
                                    disabled={index === variants.length - 1}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="h-3 w-3" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                                </button>
                            </div>
                            <span className="text-sm font-medium text-gray-500">Cor {index + 1}</span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-end">
                        {/* Color Name */}
                        <div className="w-40">
                            <label className="text-sm font-medium mb-1 block">Nome da Cor *</label>
                            <Input
                                placeholder="Ex: Preto, Cinza Mesclado"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, "name", e.target.value)}
                                className="bg-white"
                            />
                        </div>

                        {/* Color Picker / Image Swatch */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-1 block">Cor / Imagem</label>
                            {(() => {
                                const useImageMode = !variant.colorHex;
                                const imagePreview = variant.colorImagePreview || variant.colorImage || "";

                                const switchToImage = () => {
                                    const updated = [...variants];
                                    updated[index] = { ...updated[index], colorHex: "" };
                                    onChange(updated);
                                };

                                const switchToHex = () => {
                                    const updated = [...variants];
                                    updated[index] = { ...updated[index], colorHex: "#000000", colorImage: "", colorImageFile: null, colorImagePreview: "" };
                                    onChange(updated);
                                };

                                const handleSwatchImage = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const preview = URL.createObjectURL(file);
                                    const updated = [...variants];
                                    updated[index] = { ...updated[index], colorImageFile: file, colorImagePreview: preview, colorImage: "" };
                                    onChange(updated);
                                    e.target.value = "";
                                };

                                const removeSwatchImage = () => {
                                    const updated = [...variants];
                                    updated[index] = { ...updated[index], colorImage: "", colorImageFile: null, colorImagePreview: "" };
                                    onChange(updated);
                                };

                                return (
                                    <div className="flex gap-2 items-center flex-wrap">
                                        {/* Toggle Cor / Imagem */}
                                        <div className="flex rounded-md border border-slate-300 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={switchToHex}
                                                className={cn(
                                                    "px-2.5 py-1 text-xs font-medium transition-colors",
                                                    !useImageMode ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                                                )}
                                            >
                                                Cor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={switchToImage}
                                                className={cn(
                                                    "px-2.5 py-1 text-xs font-medium transition-colors border-l border-slate-300",
                                                    useImageMode ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                                                )}
                                            >
                                                <ImageIcon className="h-3 w-3 inline mr-1" />
                                                Imagem
                                            </button>
                                        </div>

                                        {/* Hex mode */}
                                        {!useImageMode && (
                                            <>
                                                <input
                                                    type="color"
                                                    value={variant.colorHex}
                                                    onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                                                    className="h-9 w-10 rounded border cursor-pointer"
                                                />
                                                <Input
                                                    value={variant.colorHex}
                                                    onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                                                    placeholder="#000000"
                                                    className="bg-white w-[100px] font-mono text-sm"
                                                />
                                            </>
                                        )}

                                        {/* Image mode */}
                                        {useImageMode && (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={(el) => { swatchFileRefs.current[index] = el; }}
                                                    onChange={handleSwatchImage}
                                                />
                                                {imagePreview && (
                                                    <div className="relative group">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Swatch"
                                                            className="w-9 h-9 rounded-full object-cover border-2 border-slate-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={removeSwatchImage}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => swatchFileRefs.current[index]?.click()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    {imagePreview ? "Trocar" : "Enviar imagem"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* SKU */}
                        <div className="w-40">
                            <label className="text-sm font-medium mb-1 block">SKU (opcional)</label>
                            <Input
                                placeholder="SKU da variante"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Price Override */}
                        <div>
                            <label className="text-sm font-medium mb-1 block">Preço (deixe vazio para usar o preço principal)</label>
                            <Input
                                placeholder="0.00"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, "price", e.target.value)}
                                className="bg-white"
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="text-sm font-medium mb-1 block">Estoque</label>
                            <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    {/* Variant Images */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Fotos desta Cor</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileRefs.current[index] = el; }}
                            onChange={(e) => handleVariantFileChange(index, e)}
                        />

                        {variant.existingImages.length === 0 && variant.newFilePreviews.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => fileRefs.current[index]?.click()}
                                className="w-full border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-colors cursor-pointer"
                            >
                                <ImageIcon className="h-6 w-6" />
                                <span className="text-xs font-medium">Adicionar fotos desta cor</span>
                                <span className="text-[11px] text-amber-500">
                                    Sem fotos, as fotos principais do produto serão usadas
                                </span>
                            </button>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {variant.existingImages.map((url, imgIdx) => (
                                    <div key={`existing-${imgIdx}`} className="relative w-16 h-16 rounded border overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingVariantImage(index, imgIdx)}
                                            className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                                {variant.newFilePreviews.map((url, fileIdx) => (
                                    <div key={`new-${fileIdx}`} className="relative w-16 h-16 rounded border overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewVariantFile(index, fileIdx)}
                                            className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileRefs.current[index]?.click()}
                                    className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            A primeira foto será usada como miniatura da cor na loja.
                        </p>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full border-dashed"
            >
                <Palette className="h-4 w-4 mr-2" />
                Adicionar Outra Cor
            </Button>

            {variants.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                    Nenhuma cor adicional. O produto será exibido apenas com a cor principal definida acima.
                </p>
            )}
        </div>
    );
}

const formSchema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    description: z.string().optional(),
    price: z.string().min(1, "Preço obrigatório"),
    compareAtPrice: z.string().optional(),
    costPerItem: z.string().optional(),
    stock: z.coerce.number().min(0, "Estoque inválido"),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().min(1, "Categoria obrigatória"),
    isNewArrival: z.boolean().default(false),
    brandId: z.string().optional(),
    videoUrl: z.string().optional().or(z.literal("")),
    weight: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    measurements: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
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
            measurements: initialData?.measurements || "",
            seoTitle: initialData?.seoTitle || "",
            seoDescription: initialData?.seoDescription || "",
        },
    });

    // Color Variants State
    const [colorVariants, setColorVariants] = useState<ColorVariantState[]>(() => {
        if (!initialData?.variants || initialData.variants.length === 0) return [];
        return initialData.variants.map((v: any, i: number) => ({
            id: v.id,
            name: v.name || "",
            colorHex: v.colorImage ? "" : (v.colorHex || "#000000"),
            colorImage: v.colorImage || "",
            colorImageFile: null,
            colorImagePreview: "",
            existingImages: Array.isArray(v.images) ? v.images : [],
            newFiles: [],
            newFilePreviews: [],
            price: v.price ? String(v.price) : "",
            stock: v.stock || 0,
            sku: v.sku || "",
            order: v.order ?? i,
            isDefault: v.isDefault || false,
        }));
    });

    // Image Handling State
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    // Track existing images separately (id + url)
    const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>(
        initialData?.images?.map((img: any) => ({ id: img.id, url: img.url })) || []
    );
    // Preview URLs for new files only
    const [newFilePreviewUrls, setNewFilePreviewUrls] = useState<string[]>([]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);

            // Create previews for new files
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setNewFilePreviewUrls((prev) => [...prev, ...newUrls]);
        }
    }

    function removeExistingImage(imageId: string) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    }

    function removeNewFile(index: number) {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setNewFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
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

                    // Append new images
                    selectedFiles.forEach((file) => {
                        formData.append("images", file);
                    });

                    // Append IDs of existing images to keep
                    existingImages.forEach((img) => {
                        formData.append("keepImageIds", img.id);
                    });

                    if (initialData?.id) {
                        formData.append("id", initialData.id);
                    }

                    if (excludeNameCheck) {
                        formData.append("forceSave", "true");
                    }

                    // Append color variants as JSON
                    if (colorVariants.length > 0) {
                        const variantsData = colorVariants.map((v, i) => ({
                            id: v.id || undefined,
                            name: v.name,
                            colorHex: v.colorHex,
                            colorImage: v.colorImage || undefined,
                            images: v.existingImages, // existing URLs only; new files handled separately
                            price: v.price ? parseFloat(v.price.replace(",", ".")) : null,
                            stock: v.stock,
                            sku: v.sku || undefined,
                            order: i,
                            isDefault: v.isDefault || false,
                        }));
                        formData.append("variantsJson", JSON.stringify(variantsData));

                        // Append new variant image files with mapping
                        const fileMapping: Record<string, number> = {};
                        let fileIndex = 0;
                        for (let vi = 0; vi < colorVariants.length; vi++) {
                            for (const file of colorVariants[vi].newFiles) {
                                formData.append("variantImageFiles", file);
                                fileMapping[String(fileIndex)] = vi;
                                fileIndex++;
                            }
                        }
                        if (fileIndex > 0) {
                            formData.append("variantImageMapping", JSON.stringify(fileMapping));
                        }

                        // Append color swatch image files with variant index mapping
                        const colorImageMapping: Record<string, number> = {};
                        let colorImageIdx = 0;
                        for (let vi = 0; vi < colorVariants.length; vi++) {
                            if (colorVariants[vi].colorImageFile) {
                                formData.append("variantColorImageFiles", colorVariants[vi].colorImageFile!);
                                colorImageMapping[String(colorImageIdx)] = vi;
                                colorImageIdx++;
                            }
                        }
                        if (colorImageIdx > 0) {
                            formData.append("variantColorImageMapping", JSON.stringify(colorImageMapping));
                        }
                    } else {
                        // Send empty array to clear all variants if user removed them
                        formData.append("variantsJson", "[]");
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
                } catch (error: any) {
                    console.error("SAVE ERROR:", error?.message || error, error);
                    if (error?.digest?.includes("NEXT_REDIRECT")) {
                        // redirect() throws — this is NOT an error
                        setStatus("success");
                        return;
                    }
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
                                <FormLabel>Nome *</FormLabel>
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

                    {/* Previews - Existing Images */}
                    {(existingImages.length > 0 || newFilePreviewUrls.length > 0) && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {/* Existing images */}
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-100 group">
                                    <img src={img.url} alt="Imagem existente" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="h-3 w-3 flex items-center justify-center">x</div>
                                    </button>
                                </div>
                            ))}
                            {/* New file previews */}
                            {newFilePreviewUrls.map((url, index) => (
                                <div key={`new-${index}`} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-100 group">
                                    <img src={url} alt={`Nova imagem ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="h-3 w-3 flex items-center justify-center">x</div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fixed color picker for main photos */}
                    <div className="mt-4 p-3 border rounded-lg bg-slate-50 space-y-2">
                        <label className="text-xs font-medium text-slate-600">Cor destas fotos (opcional)</label>
                        {(() => {
                            const defaultVariant = colorVariants.find(v => v.isDefault);
                            const defaultIndex = defaultVariant ? colorVariants.indexOf(defaultVariant) : -1;

                            // Determine mode: "image" if colorHex is empty (user chose image mode), else "hex"
                            const useImageMode = defaultVariant ? !defaultVariant.colorHex : false;

                            const handleColorChange = (field: "name" | "colorHex", value: string) => {
                                if (defaultIndex >= 0) {
                                    const updated = [...colorVariants];
                                    updated[defaultIndex] = { ...updated[defaultIndex], [field]: value };
                                    setColorVariants(updated);
                                } else {
                                    const newVariant = createEmptyVariant(0);
                                    newVariant.isDefault = true;
                                    if (field === "name") newVariant.name = value;
                                    if (field === "colorHex") newVariant.colorHex = value;
                                    setColorVariants([newVariant, ...colorVariants]);
                                }
                            };

                            const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const preview = URL.createObjectURL(file);
                                if (defaultIndex >= 0) {
                                    const updated = [...colorVariants];
                                    updated[defaultIndex] = { ...updated[defaultIndex], colorImageFile: file, colorImagePreview: preview, colorImage: "" };
                                    setColorVariants(updated);
                                } else {
                                    const newVariant = createEmptyVariant(0);
                                    newVariant.isDefault = true;
                                    newVariant.colorImageFile = file;
                                    newVariant.colorImagePreview = preview;
                                    setColorVariants([newVariant, ...colorVariants]);
                                }
                            };

                            const switchToImageMode = () => {
                                if (defaultIndex >= 0) {
                                    const updated = [...colorVariants];
                                    updated[defaultIndex] = { ...updated[defaultIndex], colorHex: "" };
                                    setColorVariants(updated);
                                } else {
                                    const newVariant = createEmptyVariant(0);
                                    newVariant.isDefault = true;
                                    newVariant.colorHex = "";
                                    setColorVariants([newVariant, ...colorVariants]);
                                }
                            };

                            const switchToHexMode = () => {
                                if (defaultIndex >= 0) {
                                    const updated = [...colorVariants];
                                    updated[defaultIndex] = { ...updated[defaultIndex], colorHex: "#000000", colorImage: "", colorImageFile: null, colorImagePreview: "" };
                                    setColorVariants(updated);
                                }
                            };

                            const removeImage = () => {
                                if (defaultIndex >= 0) {
                                    const updated = [...colorVariants];
                                    updated[defaultIndex] = { ...updated[defaultIndex], colorImage: "", colorImageFile: null, colorImagePreview: "" };
                                    setColorVariants(updated);
                                }
                            };

                            const clearDefaultColor = () => {
                                if (defaultIndex >= 0) {
                                    setColorVariants(colorVariants.filter((_, i) => i !== defaultIndex));
                                }
                            };

                            const colorName = defaultVariant?.name || "";
                            const colorHex = defaultVariant?.colorHex || "#000000";
                            const imagePreview = defaultVariant?.colorImagePreview || defaultVariant?.colorImage || "";

                            return (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Input
                                        placeholder="Ex: Azul, Preto"
                                        value={colorName}
                                        onChange={(e) => handleColorChange("name", e.target.value)}
                                        className="h-8 text-sm bg-white max-w-[180px]"
                                    />
                                    {/* Toggle between hex and image */}
                                    <div className="flex rounded-md border border-slate-300 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={switchToHexMode}
                                            className={cn(
                                                "px-2.5 py-1 text-xs font-medium transition-colors",
                                                !useImageMode ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            Cor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={switchToImageMode}
                                            className={cn(
                                                "px-2.5 py-1 text-xs font-medium transition-colors border-l border-slate-300",
                                                useImageMode ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <ImageIcon className="h-3 w-3 inline mr-1" />
                                            Imagem
                                        </button>
                                    </div>

                                    {/* Hex color picker - inline */}
                                    {!useImageMode && (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={colorHex}
                                                onChange={(e) => handleColorChange("colorHex", e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                                            />
                                            <Input
                                                value={colorHex}
                                                onChange={(e) => handleColorChange("colorHex", e.target.value)}
                                                className="h-8 text-sm bg-white w-[100px] font-mono"
                                            />
                                        </div>
                                    )}

                                    {/* Image swatch picker - inline */}
                                    {useImageMode && (
                                        <>
                                            {imagePreview ? (
                                                <div className="relative group">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Swatch"
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            ) : null}
                                            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                                                <Upload className="h-3.5 w-3.5" />
                                                {imagePreview ? "Trocar" : "Enviar imagem"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                        </>
                                    )}

                                    {defaultVariant && (
                                        <button
                                            type="button"
                                            onClick={clearDefaultColor}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Remover cor"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
                        <p className="text-[11px] text-slate-400">
                            Opcional. Se não definir uma cor, o produto aparecerá sem seletor de cor na loja. Se definir, esta cor já virá selecionada ao abrir o produto.
                        </p>
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

                {/* Color Variants - only non-default variants */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-blue-500" />
                        <h2 className="font-bold text-lg">Outras Cores do Produto</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Adicione as outras cores disponíveis. Cada cor terá suas próprias fotos.
                        A cor principal já foi definida na seção de fotos acima.
                    </p>
                    <ColorVariantsEditor
                        variants={colorVariants.filter(v => !v.isDefault)}
                        onChange={(nonDefaultVariants) => {
                            const defaultVariant = colorVariants.find(v => v.isDefault);
                            setColorVariants(defaultVariant ? [defaultVariant, ...nonDefaultVariants] : nonDefaultVariants);
                        }}
                    />
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

                {/* Medidas da Peça */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                    <h2 className="font-bold text-lg mb-4">Medidas da Peça</h2>
                    <MeasurementsField
                        value={form.watch("measurements")}
                        onChange={(value) => form.setValue("measurements", value)}
                    />
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
                                const formData = new FormData();
                                formData.append("name", newCategoryName.trim());
                                const res = await createCategory(formData);
                            }

                            // Correction: We need to define the handlers properly inside the component or outside if possible.
                            // But since we need access to 'categories' prop updates, it's tricky without a router refresh or state update.
                            // However, server actions usually purge cache.
                            // Let's implement the UI and simple handlers.

                            return (
                                <FormItem>
                                    <FormLabel>Categoria *</FormLabel>
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

                {/* Bottom Save Button */}
                <div className="flex justify-end py-4 border-t">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Salvar Alterações" : "Criar Produto"}
                    </Button>
                </div>

            </form>
        </Form>
    );
}
