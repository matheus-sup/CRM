"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Upload, Link as LinkIcon, Trash2, Check, Loader2 } from "lucide-react";
import { uploadMedia, addExternalMedia, getMediaLibrary, deleteMedia } from "@/lib/actions/media";
import { useToast } from "@/components/ui/use-toast"; // Assuming toast exists, or fallback
import { cn } from "@/lib/utils";

interface ImagePickerProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    copyrightVal?: string;
    onCopyrightChange?: (val: string) => void;
}

export function ImagePicker({ value, onChange, label = "Imagem", copyrightVal, onCopyrightChange }: ImagePickerProps) {
    const [open, setOpen] = useState(false);

    // Gallery State
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);

    // External URL State
    const [externalUrl, setExternalUrl] = useState("");
    const [copyright, setCopyright] = useState("");

    const loadImages = async () => {
        setLoading(true);
        const res = await getMediaLibrary(1, 50); // Fetch first 50
        setImages(res.media);
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            loadImages();
        }
    }, [open]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("copyright", copyright); // Optional default copyright
        formData.append("altText", file.name);

        const res = await uploadMedia(formData);
        if (res.success) {
            await loadImages(); // Refresh
            // Optionally auto-select?
        }
        setUploading(false);
    };

    const handleExternalAdd = async () => {
        if (!externalUrl) return;
        setUploading(true);
        const res = await addExternalMedia(externalUrl, copyright, "External Image");
        if (res.success) {
            await loadImages();
            setExternalUrl("");
        }
        setUploading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza?")) return;
        await deleteMedia(id);
        await loadImages();
    };

    const handleSelect = (media: any) => {
        onChange(media.url);
        if (onCopyrightChange && media.copyright) {
            onCopyrightChange(media.copyright);
        }
        setOpen(false);
    };

    // If we have a value, display preview
    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-50 min-h-[150px]",
                        value ? "border-solid border-slate-200 p-0 overflow-hidden relative group" : "border-slate-300 text-slate-400"
                    )}>
                        {value ? (
                            <>
                                <img src={value} alt="Preview" className="w-full h-40 object-contain bg-slate-50" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" size="sm">Trocar Imagem</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-8 w-8 opacity-50" />
                                <span className="text-sm font-medium">Clique para escolher uma imagem</span>
                            </>
                        )}
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Galeria de Mídia</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="gallery" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="gallery">Galeria</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                            <TabsTrigger value="external">URL Externa</TabsTrigger>
                        </TabsList>

                        {/* GALLERY TAB */}
                        <TabsContent value="gallery" className="flex-1 overflow-y-auto p-1">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className={cn(
                                                "relative aspect-square border rounded-md overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all",
                                                value === img.url ? "ring-2 ring-primary" : ""
                                            )}
                                            onClick={() => handleSelect(img)}
                                        >
                                            <img src={img.url} alt={img.altText || "Image"} className="w-full h-full object-cover" />
                                            {img.copyright && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-1 truncate px-2">
                                                    © {img.copyright}
                                                </div>
                                            )}
                                            <button
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                onClick={(e) => handleDelete(img.id, e)}
                                                title="Apagar permanentemente"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-400">
                                            Nenhuma imagem encontrada. Faça upload ou adicione uma URL.
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* UPLOAD TAB */}
                        <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center gap-4 border border-dashed rounded-lg m-1 bg-slate-50">
                            <Upload className="h-12 w-12 text-slate-300" />
                            <div className="text-center space-y-2">
                                <Label htmlFor="file-upload" className="cursor-pointer bg-primary text-secondary px-4 py-2 rounded-md hover:opacity-90 transition-opacity inline-block">
                                    {uploading ? "Enviando..." : "Escolher Arquivo"}
                                </Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 5MB</p>
                            </div>

                            <div className="w-full max-w-sm px-4 space-y-1">
                                <Label className="text-xs">Direitos Autorais (Opcional)</Label>
                                <Input
                                    placeholder="Ex: Freepik, Unsplash, Gut"
                                    value={copyright}
                                    onChange={(e) => setCopyright(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <p className="text-[10px] text-muted-foreground">Será salvo com a imagem para uso futuro.</p>
                            </div>
                        </TabsContent>

                        {/* URL TAB */}
                        <TabsContent value="external" className="flex-1 p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>URL da Imagem</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                    />
                                    <Button onClick={handleExternalAdd} disabled={uploading}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Direitos Autorais</Label>
                                <Input
                                    placeholder="Atribuição ou Fonte"
                                    value={copyright}
                                    onChange={(e) => setCopyright(e.target.value)}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Copyright Display/Edit below the picker */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Direitos / Créditos (HTML permitido)</Label>
                <Input
                    value={copyrightVal || ""}
                    onChange={(e) => onCopyrightChange && onCopyrightChange(e.target.value)}
                    placeholder="Ex: Imagem por <a href='...'>Freepik</a>"
                    className="h-8 text-xs bg-slate-50"
                />
            </div>
        </div>
    );
}
