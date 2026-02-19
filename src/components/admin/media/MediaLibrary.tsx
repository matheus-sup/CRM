"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Check, Loader2, Save } from "lucide-react";
import { uploadMedia, addExternalMedia, getMediaLibrary, deleteMedia } from "@/lib/actions/media";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is used, consistent with other files

interface MediaLibraryProps {
    onSelect?: (media: any) => void;
    selectedUrl?: string; // To highlight selected
}

export function MediaLibrary({ onSelect, selectedUrl }: MediaLibraryProps) {
    // Gallery State
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("gallery");

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        loadImages();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Status State for Feedback Animations
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleUploadExec = async () => {
        if (!selectedFile) return;

        setStatus('loading');
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("copyright", copyright);
        formData.append("altText", selectedFile.name);

        const res = await uploadMedia(formData);
        if (res.success) {
            toast.success("Imagem enviada com sucesso!");
            await loadImages();
            setStatus('success');
            setTimeout(() => {
                setSelectedFile(null); // Reset selection
                setStatus('idle');
                setUploading(false);
                setActiveTab("gallery"); // Switch to gallery view
            }, 1000); // Wait 1s to show success state
        } else {
            toast.error("Erro ao enviar imagem.");
            setStatus('error');
            setUploading(false);
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleExternalAdd = async () => {
        if (!externalUrl) return;
        setStatus('loading');
        setUploading(true);
        const res = await addExternalMedia(externalUrl, copyright, "External Image");
        if (res.success) {
            toast.success("Imagem adicionada com sucesso!");
            await loadImages();
            setStatus('success');
            setTimeout(() => {
                setExternalUrl("");
                setStatus('idle');
                setUploading(false);
                setActiveTab("gallery"); // Switch to gallery view
            }, 1000);
        } else {
            toast.error("Erro ao adicionar URL.");
            setStatus('error');
            setUploading(false);
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza?")) return;
        await deleteMedia(id);
        await loadImages();
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden h-full">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
                <TabsTrigger value="gallery">Galeria</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="external">URL Externa</TabsTrigger>
            </TabsList>

            {/* GALLERY TAB */}
            <TabsContent value="gallery" className="flex-1 overflow-y-auto p-1 min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className={cn(
                                    "relative aspect-square border rounded-md overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all",
                                    selectedUrl === img.url ? "ring-2 ring-primary" : ""
                                )}
                                onClick={() => onSelect && onSelect(img)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center gap-4 border border-dashed rounded-lg m-1 bg-slate-50 min-h-[300px]">
                <Upload className="h-12 w-12 text-slate-300" />
                <div className="text-center space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file-upload" className={cn(
                            "cursor-pointer px-4 py-2 rounded-md transition-all inline-block border",
                            selectedFile ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-slate-600 hover:bg-slate-50"
                        )}>
                            {selectedFile ? `Arquivo: ${selectedFile.name}` : "Escolher Arquivo"}
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                        {!selectedFile && <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 5MB</p>}
                    </div>

                    {selectedFile && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <Button
                                onClick={handleUploadExec}
                                disabled={status !== 'idle' && status !== 'error'}
                                className={cn(
                                    "transition-all duration-300 w-48",
                                    status === 'success' ? "bg-green-600 hover:bg-green-700" : "",
                                    status === 'error' ? "bg-red-600 hover:bg-red-700" : ""
                                )}
                            >
                                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {status === 'success' && <Check className="mr-2 h-4 w-4" />}
                                {status === 'idle' && <Save className="mr-2 h-4 w-4" />}
                                {status === 'loading' ? "Enviando..." :
                                    status === 'success' ? "Salvo!" :
                                        status === 'error' ? "Erro!" : "Salvar Imagem"}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="w-full max-w-sm px-4 space-y-1 mt-4">
                    <Label className="text-xs">Direitos Autorais (Opcional)</Label>
                    <Input
                        placeholder="Ex: Freepik, Unsplash, Própria"
                        value={copyright}
                        onChange={(e) => setCopyright(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Será salvo com a imagem para uso futuro.</p>
                </div>
            </TabsContent>

            {/* URL TAB */}
            <TabsContent value="external" className="flex-1 p-4 space-y-4 min-h-[300px]">
                <div className="space-y-2">
                    <Label>URL da Imagem</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                        />
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
                <Button
                    onClick={handleExternalAdd}
                    disabled={(!externalUrl || status !== 'idle') && status !== 'error'}
                    className={cn(
                        "w-full transition-all duration-300",
                        status === 'success' ? "bg-green-600 hover:bg-green-700" : "",
                        status === 'error' ? "bg-red-600 hover:bg-red-700" : ""
                    )}
                >
                    {status === 'loading' ? "Salvando..." :
                        status === 'success' ? "URL Adicionada!" :
                            status === 'error' ? "Erro ao Adicionar" : "Salvar URL na Galeria"}
                </Button>
            </TabsContent>
        </Tabs>
    );
}
