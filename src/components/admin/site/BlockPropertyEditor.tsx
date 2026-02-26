"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Image as ImageIcon, X } from "lucide-react";
import { PageBlock } from "@/types/page-builder";
import { ColorPickerInput } from "./ColorPickerInput";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { SharedLinkSelector } from "@/components/admin/SharedLinkSelector";

interface BlockPropertyEditorProps {
    block: PageBlock;
    onUpdate: (updatedBlock: PageBlock) => void;
    onDelete: (blockId: string) => void;
    onBack: () => void;
    focusField?: { field: string; timestamp: number } | null;
    products?: any[];
    categories?: any[];
    brands?: any[];
}

// =============================================================================
// COMPACT IMAGE PICKER - Small inline image picker with media library
// =============================================================================
function CompactImagePicker({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-1">
            {label && <Label className="text-xs">{label}</Label>}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className="border rounded cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-2 p-1.5">
                        {value ? (
                            <img src={value} alt="" className="h-10 w-10 object-cover rounded" />
                        ) : (
                            <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                            </div>
                        )}
                        <span className="text-xs text-slate-500 flex-1">{value ? "Trocar imagem" : "Selecionar imagem"}</span>
                        {value && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] h-[80vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle>Galeria de Mídia</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        <MediaLibrary onSelect={(media: any) => { onChange(media.url); setOpen(false); }} selectedUrl={value} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// =============================================================================
// TEXT BLOCK VISUAL EDITOR - Replaces raw HTML with easy-to-use fields
// =============================================================================
interface TextBlockEditorProps {
    content: any;
    styles: any;
    onContentChange: (key: string, value: any) => void;
    onStyleChange: (key: string, value: any) => void;
    focusField?: { field: string; timestamp: number } | null;
}

function TextBlockEditor({ content, styles, onContentChange, onStyleChange, focusField }: TextBlockEditorProps) {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

    // Handle focusField for click-to-edit
    useEffect(() => {
        if (!focusField?.field) return;

        const fieldName = focusField.field;

        const focusAndFlash = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
            if (!element) return;

            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();

            // Flash 2 times
            const flash = () => element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
            const unflash = () => element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');

            flash();
            setTimeout(() => {
                unflash();
                setTimeout(() => {
                    flash();
                    setTimeout(unflash, 300);
                }, 150);
            }, 300);
        };

        setTimeout(() => {
            if (fieldName === 'title' || fieldName === 'html') {
                focusAndFlash(titleInputRef.current);
            } else if (fieldName === 'description') {
                focusAndFlash(descriptionInputRef.current);
            }
        }, 100);
    }, [focusField]);

    // Parse existing HTML to extract title and description (one-time migration)
    const [title, setTitle] = useState(() => {
        if (content.title !== undefined) return content.title;
        // Try to extract from HTML
        const html = content.html || "";
        const h2Match = html.match(/<h2[^>]*>([^<]*)<\/h2>/i);
        return h2Match ? h2Match[1] : "";
    });

    const [description, setDescription] = useState(() => {
        if (content.description !== undefined) return content.description;
        // Try to extract from HTML
        const html = content.html || "";
        const pMatch = html.match(/<p[^>]*>([^<]*)<\/p>/i);
        return pMatch ? pMatch[1] : "";
    });

    const [titleSize, setTitleSize] = useState(content.titleSize || "2.5rem");
    const [alignment, setAlignment] = useState(styles?.textAlign || "center");

    // Generate HTML from visual fields
    const generateHtml = (t: string, d: string, size: string, align: string) => {
        const alignStyle = `text-align: ${align}`;
        const titleHtml = t ? `<h2 style="font-size: ${size}; font-weight: 300; margin-bottom: 1rem; letter-spacing: -0.02em;">${t}</h2>` : "";
        const descHtml = d ? `<p style="font-size: 1.125rem; color: #666; line-height: 1.8;">${d}</p>` : "";

        return `<div style="max-width: 800px; margin: 0 auto; ${alignStyle}; padding: 2rem 1rem;">${titleHtml}${descHtml}</div>`;
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
        onContentChange("title", value);
        onContentChange("html", generateHtml(value, description, titleSize, alignment));
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        onContentChange("description", value);
        onContentChange("html", generateHtml(title, value, titleSize, alignment));
    };

    const handleTitleSizeChange = (value: string) => {
        setTitleSize(value);
        onContentChange("titleSize", value);
        onContentChange("html", generateHtml(title, description, value, alignment));
    };

    const handleAlignmentChange = (value: string) => {
        setAlignment(value);
        onStyleChange("textAlign", value);
        onContentChange("html", generateHtml(title, description, titleSize, value));
    };

    return (
        <div className="space-y-4">
            {/* Title Field */}
            <div className="space-y-1">
                <Label>Título</Label>
                <Input
                    ref={titleInputRef}
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Digite o título da seção..."
                />
            </div>

            {/* Title Size */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-500">Tamanho do Título</Label>
                <div className="flex gap-2">
                    {[
                        { label: "P", value: "1.5rem" },
                        { label: "M", value: "2rem" },
                        { label: "G", value: "2.5rem" },
                        { label: "GG", value: "3rem" },
                    ].map((size) => (
                        <button
                            key={size.value}
                            type="button"
                            onClick={() => handleTitleSizeChange(size.value)}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                titleSize === size.value
                                    ? "bg-blue-50 border-blue-400 text-blue-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description Field */}
            <div className="space-y-1">
                <Label>Descrição</Label>
                <Textarea
                    ref={descriptionInputRef}
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Digite a descrição ou texto complementar..."
                    className="min-h-[100px]"
                />
            </div>

            {/* Alignment */}
            <div className="space-y-1">
                <Label className="text-xs text-slate-500">Alinhamento</Label>
                <div className="flex gap-2">
                    {[
                        { label: "Esquerda", value: "left", icon: "←" },
                        { label: "Centro", value: "center", icon: "↔" },
                        { label: "Direita", value: "right", icon: "→" },
                    ].map((align) => (
                        <button
                            key={align.value}
                            type="button"
                            onClick={() => handleAlignmentChange(align.value)}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                alignment === align.value
                                    ? "bg-blue-50 border-blue-400 text-blue-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                        >
                            {align.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview hint */}
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                As alterações são aplicadas em tempo real no preview à direita.
            </div>
        </div>
    );
}

export function BlockPropertyEditor({ block, onUpdate, onDelete, onBack, focusField, products = [], categories = [], brands = [] }: BlockPropertyEditorProps) {
    const [data, setData] = useState(block);

    // Refs for all possible fields across different block types
    const titleRef = useRef<HTMLInputElement>(null);
    const subtitleRef = useRef<HTMLInputElement>(null);
    const buttonTextRef = useRef<HTMLInputElement>(null);
    const buttonLinkRef = useRef<HTMLInputElement>(null);
    const htmlRef = useRef<HTMLTextAreaElement>(null);
    const codeRef = useRef<HTMLTextAreaElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const embedUrlRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const placeholderRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setData(block);
    }, [block.id]); // Reset when block selection changes

    // Scroll to the selected field when focusField changes
    useEffect(() => {
        if (!focusField?.field) return;

        const fieldName = focusField.field;

        const scrollToField = () => {
            let targetRef = null;

            // Map field names to refs
            switch (fieldName) {
                case 'title':
                    targetRef = titleRef;
                    break;
                case 'subtitle':
                    targetRef = subtitleRef;
                    break;
                case 'description':
                    targetRef = descriptionRef;
                    break;
                case 'placeholder':
                    targetRef = placeholderRef;
                    break;
                case 'button':
                case 'buttonText':
                    targetRef = buttonTextRef;
                    break;
                case 'buttonLink':
                    targetRef = buttonLinkRef;
                    break;
                case 'html':
                    targetRef = htmlRef;
                    break;
                case 'code':
                    targetRef = codeRef;
                    break;
                case 'username':
                    targetRef = usernameRef;
                    break;
                case 'embedUrl':
                    targetRef = embedUrlRef;
                    break;
            }

            if (targetRef?.current) {
                targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetRef.current.focus();

                // Flash highlight effect 2 times
                const element = targetRef.current;
                const flash = () => {
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
                };
                const unflash = () => {
                    element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
                };

                // First flash
                flash();
                setTimeout(() => {
                    unflash();
                    // Second flash
                    setTimeout(() => {
                        flash();
                        setTimeout(() => {
                            unflash();
                        }, 300);
                    }, 150);
                }, 300);
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(scrollToField, 100);
    }, [focusField]);

    const updateContent = (key: string, value: any) => {
        const newData = { ...data, content: { ...data.content, [key]: value } };
        setData(newData);
        onUpdate(newData); // Live update
    };

    const updateStyle = (key: string, value: any) => {
        const newData = { ...data, styles: { ...data.styles, [key]: value } };
        setData(newData);
        onUpdate(newData);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-bold text-slate-800 text-sm truncate w-40">Editar {block.label || block.type}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(block.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* --- HTML BLOCK EDITOR --- */}
                {block.type === "html" && (
                    <div className="space-y-3">
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            <strong>Atenção:</strong> Insira apenas códigos HTML/CSS/JS confiáveis.
                        </div>
                        <div className="space-y-1">
                            <Label>Código HTML Personalizado</Label>
                            <Textarea
                                ref={codeRef}
                                className="font-mono text-xs min-h-[300px] bg-slate-900 text-green-400"
                                value={data.content.code || ""}
                                onChange={(e) => updateContent("code", e.target.value)}
                                placeholder="<div class='minha-classe'>...</div>"
                            />
                        </div>
                    </div>
                )}

                {/* --- HERO BLOCK EDITOR (CAROUSEL MODE) --- */}
                {block.type === "hero" && (
                    <div className="space-y-4">
                        {/* Slides List */}
                        {(() => {
                            const slides = data.content.slides || [
                                {
                                    id: "slide-1",
                                    title: data.content.title || "Novo Banner",
                                    subtitle: data.content.subtitle || "Subtítulo do banner",
                                    buttonText: data.content.buttonText || "Ver Mais",
                                    buttonLink: data.content.buttonLink || "/produtos"
                                }
                            ];

                            return (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-700">Páginas do Carrossel</h4>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const newSlide = {
                                                    id: `slide-${Date.now()}`,
                                                    title: "Nova Página",
                                                    subtitle: "Subtítulo",
                                                    buttonText: "Ver Mais",
                                                    buttonLink: "/produtos"
                                                };
                                                updateContent("slides", [...slides, newSlide]);
                                            }}
                                        >
                                            + Adicionar Página
                                        </Button>
                                    </div>

                                    {/* List of Slides */}
                                    <div className="space-y-3">
                                        {slides.map((slide: any, index: number) => (
                                            <div key={slide.id} className="border rounded-lg p-4 bg-slate-50 space-y-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-xs text-slate-500">Página {index + 1}</span>
                                                    <div className="flex gap-1">
                                                        {/* Move Up */}
                                                        {index > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => {
                                                                    const newSlides = [...slides];
                                                                    [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
                                                                    updateContent("slides", newSlides);
                                                                }}
                                                            >
                                                                ↑
                                                            </Button>
                                                        )}
                                                        {/* Move Down */}
                                                        {index < slides.length - 1 && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => {
                                                                    const newSlides = [...slides];
                                                                    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
                                                                    updateContent("slides", newSlides);
                                                                }}
                                                            >
                                                                ↓
                                                            </Button>
                                                        )}
                                                        {/* Delete */}
                                                        {slides.length > 1 && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                                onClick={() => {
                                                                    if (confirm("Remover esta página?")) {
                                                                        updateContent("slides", slides.filter((_: any, i: number) => i !== index));
                                                                    }
                                                                }}
                                                            >
                                                                🗑️
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Slide Fields */}
                                                <div className="space-y-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Título</Label>
                                                        <Input
                                                            ref={index === 0 ? titleRef : undefined}
                                                            value={slide.title || ""}
                                                            onChange={(e) => {
                                                                const newSlides = [...slides];
                                                                newSlides[index] = { ...slide, title: e.target.value };
                                                                updateContent("slides", newSlides);
                                                            }}
                                                            placeholder="Título desta página"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Subtítulo</Label>
                                                        <Input
                                                            ref={index === 0 ? subtitleRef : undefined}
                                                            value={slide.subtitle || ""}
                                                            onChange={(e) => {
                                                                const newSlides = [...slides];
                                                                newSlides[index] = { ...slide, subtitle: e.target.value };
                                                                updateContent("slides", newSlides);
                                                            }}
                                                            placeholder="Subtítulo desta página"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Texto do Botão</Label>
                                                            <Input
                                                                ref={index === 0 ? buttonTextRef : undefined}
                                                                value={slide.buttonText || ""}
                                                                onChange={(e) => {
                                                                    const newSlides = [...slides];
                                                                    newSlides[index] = { ...slide, buttonText: e.target.value };
                                                                    updateContent("slides", newSlides);
                                                                }}
                                                                placeholder="Ver Mais"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Link</Label>
                                                            <Input
                                                                ref={index === 0 ? buttonLinkRef : undefined}
                                                                value={slide.buttonLink || ""}
                                                                onChange={(e) => {
                                                                    const newSlides = [...slides];
                                                                    newSlides[index] = { ...slide, buttonLink: e.target.value };
                                                                    updateContent("slides", newSlides);
                                                                }}
                                                                placeholder="/produtos"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 border-t pt-2 mt-2">
                                                        <CompactImagePicker
                                                            label="Imagem do Banner"
                                                            value={slide.imageUrl || ""}
                                                            onChange={(url) => {
                                                                const newSlides = [...slides];
                                                                newSlides[index] = { ...slide, imageUrl: url };
                                                                updateContent("slides", newSlides);
                                                            }}
                                                        />
                                                        <p className="text-[10px] text-slate-400">PNG, JPG ou GIF. Tamanho: 1920 × 840px</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Carousel Settings */}
                                    <div className="border-t pt-4 mt-4 space-y-3">
                                        <h4 className="font-semibold text-xs uppercase text-slate-400">Configurações do Carrossel</h4>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="autoplay"
                                                checked={data.content.autoplay || false}
                                                onChange={(e) => updateContent("autoplay", e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor="autoplay" className="text-sm font-normal">Avançar páginas automaticamente</Label>
                                        </div>

                                        {data.content.autoplay && (
                                            <div className="space-y-1">
                                                <Label className="text-xs">Intervalo (segundos)</Label>
                                                <Input
                                                    type="number"
                                                    min="2"
                                                    max="10"
                                                    value={data.content.autoplayInterval || 5}
                                                    onChange={(e) => updateContent("autoplayInterval", parseInt(e.target.value))}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <Label className="text-xs">Transição</Label>
                                            <select
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                value={data.content.transition || "fade"}
                                                onChange={(e) => updateContent("transition", e.target.value)}
                                            >
                                                <option value="fade">Fade (Suave)</option>
                                                <option value="slide">Slide (Deslizar)</option>
                                                <option value="none">Sem transição</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <ColorPickerInput
                                                id="button-bg"
                                                label="Cor do Botão"
                                                value={data.styles.buttonColor || "#db2777"}
                                                onChange={(val) => updateStyle("buttonColor", val)}
                                            />
                                            <ColorPickerInput
                                                id="button-text"
                                                label="Texto do Botão"
                                                value={data.styles.buttonTextColor || "#ffffff"}
                                                onChange={(val) => updateStyle("buttonTextColor", val)}
                                            />
                                        </div>
                                    </div>

                                </>
                            );
                        })()}
                    </div>
                )}

                {/* --- TEXT BLOCK EDITOR --- */}
                {block.type === "text" && (
                    <TextBlockEditor
                        content={data.content}
                        styles={data.styles}
                        onContentChange={(key, value) => updateContent(key, value)}
                        onStyleChange={(key, value) => updateStyle(key, value)}
                        focusField={focusField}
                    />
                )}

                {/* --- INSTAGRAM BLOCK EDITOR --- */}
                {block.type === "instagram" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Nome de Usuário (Username)</Label>
                            <Input
                                ref={usernameRef}
                                value={data.content.username || ""}
                                onChange={(e) => updateContent("username", e.target.value)}
                                placeholder="ex: minha_loja"
                            />
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
                            Para exibir fotos reais, futuramente precisaremos conectar com a API do Facebook/Instagram. Por enquanto, exibimos um layout demonstrativo.
                        </div>
                    </div>
                )}

                {/* --- MAP BLOCK EDITOR --- */}
                {block.type === "map" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Link de Incorporação (Embed URL)</Label>
                            <Textarea
                                ref={embedUrlRef}
                                className="min-h-[100px] text-xs font-mono"
                                value={data.content.embedUrl || ""}
                                onChange={(e) => updateContent("embedUrl", e.target.value)}
                                placeholder="Cole aqui o link do Google Maps (iframe src)..."
                            />
                        </div>
                        <div className="text-xs text-slate-500">
                            Vá no Google Maps &rarr; Compartilhar &rarr; Incorporar um mapa &rarr; Copie apenas o link dentro de 'src="..."'.
                        </div>
                    </div>
                )}

                {/* --- PROMO BLOCK EDITOR --- */}
                {block.type === "promo" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Título da Promoção</Label>
                            <Input
                                ref={titleRef}
                                value={data.content.title || ""}
                                onChange={(e) => updateContent("title", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Texto Auxiliar</Label>
                            <Input
                                ref={subtitleRef}
                                value={data.content.subtitle || ""}
                                onChange={(e) => updateContent("subtitle", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- PRODUCT GRID BLOCK EDITOR --- */}
                {block.type === "product-grid" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Layout da Vitrine</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "grid", label: "Grade", icon: "▦" },
                                    { id: "carousel", label: "Carrossel", icon: "◄ ►" },
                                    { id: "list", label: "Lista", icon: "☰" },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            const newData = { ...data, variant: opt.id };
                                            setData(newData);
                                            onUpdate(newData);
                                        }}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                                            (data.variant || "grid") === opt.id
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                                        }`}
                                    >
                                        <span className="text-lg">{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Modo de Seleção</Label>
                            <select
                                className="w-full text-sm border rounded h-9 px-2"
                                value={data.content.selectionMode || "auto"}
                                onChange={(e) => {
                                    const mode = e.target.value;
                                    const newData = {
                                        ...data,
                                        content: {
                                            ...data.content,
                                            selectionMode: mode,
                                            selectedProductIds: mode === "manual" ? [] : data.content.selectedProductIds
                                        }
                                    };
                                    setData(newData);
                                    onUpdate(newData);
                                }}
                            >
                                <option value="auto">Automático (por filtros)</option>
                                <option value="manual">Manual (escolha produtos)</option>
                            </select>
                        </div>

                        {data.content.selectionMode === "manual" ? (
                            <>
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                    <strong>Modo Manual:</strong> Clique nos produtos para adicionar/remover. Reorganize na seção abaixo.
                                </div>

                                {/* Selected Products Preview */}
                                {(data.content.selectedProductIds || []).length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-green-700">✓ Produtos Selecionados ({(data.content.selectedProductIds || []).length})</Label>
                                        <div className="border rounded-lg bg-green-50/50 max-h-[300px] overflow-y-auto">
                                            <div className="divide-y">
                                                {(data.content.selectedProductIds || []).map((productId: string, index: number) => {
                                                    const product = products.find(p => p.id === productId);
                                                    if (!product) return null;

                                                    return (
                                                        <div
                                                            key={productId}
                                                            className="flex items-center gap-2 p-2 hover:bg-green-100/50 transition-colors"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (index === 0) return;
                                                                        const currentIds = [...(data.content.selectedProductIds || [])];
                                                                        [currentIds[index], currentIds[index - 1]] = [currentIds[index - 1], currentIds[index]];
                                                                        updateContent("selectedProductIds", currentIds);
                                                                    }}
                                                                    disabled={index === 0}
                                                                    className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Mover para cima"
                                                                >
                                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (index === (data.content.selectedProductIds || []).length - 1) return;
                                                                        const currentIds = [...(data.content.selectedProductIds || [])];
                                                                        [currentIds[index], currentIds[index + 1]] = [currentIds[index + 1], currentIds[index]];
                                                                        updateContent("selectedProductIds", currentIds);
                                                                    }}
                                                                    disabled={index === (data.content.selectedProductIds || []).length - 1}
                                                                    className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Mover para baixo"
                                                                >
                                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center justify-center min-w-[24px] h-6 rounded bg-green-600 text-white text-xs font-bold">
                                                                {index + 1}
                                                            </div>

                                                            {product.images?.[0]?.url ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="h-12 w-12 object-cover rounded border-2 border-green-200"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 bg-green-200 rounded flex items-center justify-center text-xs text-green-700 font-bold border-2 border-green-300">
                                                                    {product.name.charAt(0)}
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentIds = data.content.selectedProductIds || [];
                                                                    const newIds = currentIds.filter((id: string) => id !== productId);
                                                                    updateContent("selectedProductIds", newIds);
                                                                }}
                                                                className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                                title="Remover"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Adicionar Produtos</Label>
                                    <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                                        {products.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                Nenhum produto encontrado
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {products.map((product) => {
                                                    const isSelected = (data.content.selectedProductIds || []).includes(product.id);
                                                    return (
                                                        <label
                                                            key={product.id}
                                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                                                isSelected ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const currentIds = data.content.selectedProductIds || [];
                                                                    const newIds = e.target.checked
                                                                        ? [...currentIds, product.id]
                                                                        : currentIds.filter((id: string) => id !== product.id);
                                                                    updateContent("selectedProductIds", newIds);
                                                                }}
                                                                className="h-4 w-4 rounded border-slate-300"
                                                            />
                                                            {product.images?.[0]?.url ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="h-10 w-10 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">
                                                                    {product.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <span className="text-xs font-semibold text-green-600">✓</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <Label>Tipo de Coleção</Label>
                                    <select
                                        className="w-full text-sm border rounded h-9 px-2"
                                        value={data.content.collectionType || "all"}
                                        onChange={(e) => updateContent("collectionType", e.target.value)}
                                    >
                                        <option value="all">Todos os Produtos</option>
                                        <option value="new">Novidades</option>
                                        <option value="featured">Em Destaque</option>
                                        <option value="category">Por Categoria</option>
                                    </select>
                                </div>

                                {data.content.collectionType === "category" && (
                                    <div className="space-y-1">
                                        <Label>Categoria</Label>
                                        <select
                                            className="w-full text-sm border rounded h-9 px-2"
                                            value={data.content.categoryId || ""}
                                            onChange={(e) => updateContent("categoryId", e.target.value)}
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-1">
                            <Label>Limite de Produtos</Label>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={data.content.limit || 8}
                                onChange={(e) => updateContent("limit", parseInt(e.target.value) || 8)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Título da Seção (Opcional)</Label>
                            <Input
                                ref={titleRef}
                                value={data.content.title || ""}
                                onChange={(e) => updateContent("title", e.target.value)}
                                placeholder="Ex: Produtos em Destaque"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tamanho dos Cards ({data.content.cardSize || 200}px)</Label>
                            <input
                                type="range"
                                min={120}
                                max={500}
                                step={10}
                                value={data.content.cardSize || 200}
                                onChange={(e) => updateContent("cardSize", parseInt(e.target.value))}
                                className="w-full h-1.5 accent-blue-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Pequeno</span>
                                <span>Médio</span>
                                <span>Grande</span>
                            </div>
                        </div>

                        {(data.variant || "grid") === "carousel" && (
                            <>
                                <div className="border-t pt-4 my-2"></div>
                                <h4 className="font-semibold text-xs uppercase text-slate-400 mb-3">Carrossel Automático</h4>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <Label className="text-sm font-medium">Ativar Rolagem Automática</Label>
                                        <p className="text-xs text-slate-500 mt-1">Os produtos vão rolar automaticamente</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.content.autoScroll || false}
                                            onChange={(e) => updateContent("autoScroll", e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {data.content.autoScroll && (
                                    <div className="space-y-1">
                                        <Label>Intervalo de Rolagem (segundos)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={data.content.autoScrollInterval || 3}
                                            onChange={(e) => updateContent("autoScrollInterval", parseInt(e.target.value) || 3)}
                                        />
                                        <p className="text-xs text-slate-500">Tempo entre cada rolagem automática (1-30 segundos)</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- BRANDS BLOCK EDITOR --- */}
                {block.type === "brands" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Título da Seção</Label>
                            <Input
                                ref={titleRef}
                                value={data.content.title || "Nossas Marcas Parceiras"}
                                onChange={(e) => updateContent("title", e.target.value)}
                                placeholder="Nossas Marcas Parceiras"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Subtítulo (opcional)</Label>
                            <Input
                                ref={subtitleRef}
                                value={data.content.subtitle || ""}
                                onChange={(e) => updateContent("subtitle", e.target.value)}
                                placeholder="Trabalhamos com as melhores marcas"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Modo de Seleção</Label>
                            <select
                                className="w-full text-sm border rounded h-9 px-2"
                                value={data.content.selectionMode || "auto"}
                                onChange={(e) => {
                                    const mode = e.target.value;
                                    const newData = {
                                        ...data,
                                        content: {
                                            ...data.content,
                                            selectionMode: mode,
                                            selectedBrandIds: mode === "manual" ? [] : data.content.selectedBrandIds
                                        }
                                    };
                                    setData(newData);
                                    onUpdate(newData);
                                }}
                            >
                                <option value="auto">Automático (mostrar todas)</option>
                                <option value="manual">Manual (escolher marcas)</option>
                            </select>
                        </div>

                        {data.content.selectionMode === "manual" ? (
                            <>
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                    <strong>Modo Manual:</strong> Clique nas marcas para adicionar/remover. Reorganize na seção abaixo.
                                </div>

                                {/* Selected Brands Preview */}
                                {(data.content.selectedBrandIds || []).length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-green-700">✓ Marcas Selecionadas ({(data.content.selectedBrandIds || []).length})</Label>
                                        <div className="border rounded-lg bg-green-50/50 max-h-[300px] overflow-y-auto">
                                            <div className="divide-y">
                                                {(data.content.selectedBrandIds || []).map((brandId: string, index: number) => {
                                                    const brand = brands.find(b => b.id === brandId);
                                                    if (!brand) return null;

                                                    const brandData = (data.content.brandsData || {})[brandId] || {};

                                                    return (
                                                        <div
                                                            key={brandId}
                                                            className="p-2 hover:bg-green-100/50 transition-colors space-y-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (index === 0) return;
                                                                            const currentIds = [...(data.content.selectedBrandIds || [])];
                                                                            [currentIds[index], currentIds[index - 1]] = [currentIds[index - 1], currentIds[index]];
                                                                            updateContent("selectedBrandIds", currentIds);
                                                                        }}
                                                                        disabled={index === 0}
                                                                        className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Mover para cima"
                                                                    >
                                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (index === (data.content.selectedBrandIds || []).length - 1) return;
                                                                            const currentIds = [...(data.content.selectedBrandIds || [])];
                                                                            [currentIds[index], currentIds[index + 1]] = [currentIds[index + 1], currentIds[index]];
                                                                            updateContent("selectedBrandIds", currentIds);
                                                                        }}
                                                                        disabled={index === (data.content.selectedBrandIds || []).length - 1}
                                                                        className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Mover para baixo"
                                                                    >
                                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center justify-center min-w-[24px] h-6 rounded bg-green-600 text-white text-xs font-bold">
                                                                    {index + 1}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium text-slate-800 truncate">
                                                                        {brand.name}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentIds = data.content.selectedBrandIds || [];
                                                                        const newIds = currentIds.filter((id: string) => id !== brandId);

                                                                        // Also remove from brandsData
                                                                        const newBrandsData = { ...(data.content.brandsData || {}) };
                                                                        delete newBrandsData[brandId];

                                                                        const newData = {
                                                                            ...data,
                                                                            content: {
                                                                                ...data.content,
                                                                                selectedBrandIds: newIds,
                                                                                brandsData: newBrandsData
                                                                            }
                                                                        };
                                                                        setData(newData);
                                                                        onUpdate(newData);
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                                    title="Remover"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            {/* Link field for each brand */}
                                                            <div className="ml-12 space-y-1">
                                                                <Label className="text-xs">Link (opcional)</Label>
                                                                <Input
                                                                    value={brandData.link || ""}
                                                                    onChange={(e) => {
                                                                        const newBrandsData = {
                                                                            ...(data.content.brandsData || {}),
                                                                            [brandId]: {
                                                                                ...(data.content.brandsData?.[brandId] || {}),
                                                                                link: e.target.value
                                                                            }
                                                                        };
                                                                        updateContent("brandsData", newBrandsData);
                                                                    }}
                                                                    placeholder="/marcas/nome-da-marca"
                                                                    className="text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Adicionar Marcas</Label>
                                    <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                                        {brands.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                Nenhuma marca encontrada
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {brands.map((brand) => {
                                                    const isSelected = (data.content.selectedBrandIds || []).includes(brand.id);
                                                    return (
                                                        <label
                                                            key={brand.id}
                                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                                                isSelected ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const currentIds = data.content.selectedBrandIds || [];
                                                                    const newIds = e.target.checked
                                                                        ? [...currentIds, brand.id]
                                                                        : currentIds.filter((id: string) => id !== brand.id);
                                                                    updateContent("selectedBrandIds", newIds);
                                                                }}
                                                                className="h-4 w-4 rounded border-slate-300"
                                                            />
                                                            <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-600 font-bold">
                                                                {brand.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate">
                                                                    {brand.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {brand._count?.products || 0} produtos
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <span className="text-xs font-semibold text-green-600">✓</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <Label>Limite de Marcas</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.content.limit || 6}
                                        onChange={(e) => updateContent("limit", parseInt(e.target.value) || 6)}
                                    />
                                    <p className="text-xs text-slate-500">Quantidade máxima de marcas a exibir (1-50)</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- CATEGORIES BLOCK EDITOR --- */}
                {block.type === "categories" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Título da Seção</Label>
                            <Input
                                ref={titleRef}
                                value={data.content.title || "Categorias em Destaque"}
                                onChange={(e) => updateContent("title", e.target.value)}
                                placeholder="Categorias em Destaque"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Link "Ver todas"</Label>
                            <SharedLinkSelector
                                value={data.content.viewAllLink || "/categorias"}
                                onChange={(val) => updateContent("viewAllLink", val)}
                                categories={categories || []}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Modo de Seleção</Label>
                            <select
                                className="w-full text-sm border rounded h-9 px-2"
                                value={data.content.selectionMode || "auto"}
                                onChange={(e) => {
                                    const mode = e.target.value;
                                    const newData = {
                                        ...data,
                                        content: {
                                            ...data.content,
                                            selectionMode: mode,
                                            selectedCategoryIds: mode === "manual" ? [] : data.content.selectedCategoryIds
                                        }
                                    };
                                    setData(newData);
                                    onUpdate(newData);
                                }}
                            >
                                <option value="auto">Automático (mostrar todas)</option>
                                <option value="manual">Manual (escolher categorias)</option>
                            </select>
                        </div>

                        {data.content.selectionMode === "manual" ? (
                            <>
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                    <strong>Modo Manual:</strong> Escolha categorias, edite nomes, links e imagens.
                                </div>

                                {/* Selected Categories Preview */}
                                {(data.content.selectedCategoryIds || []).length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-green-700">✓ Categorias Selecionadas ({(data.content.selectedCategoryIds || []).length})</Label>
                                        <div className="border rounded-lg bg-green-50/50 max-h-[400px] overflow-y-auto">
                                            <div className="divide-y">
                                                {(data.content.selectedCategoryIds || []).map((categoryId: string, index: number) => {
                                                    const category = categories.find(c => c.id === categoryId);
                                                    if (!category) return null;

                                                    const categoryData = (data.content.categoriesData || {})[categoryId] || {};

                                                    return (
                                                        <div
                                                            key={categoryId}
                                                            className="p-3 hover:bg-green-100/50 transition-colors space-y-3"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (index === 0) return;
                                                                            const currentIds = [...(data.content.selectedCategoryIds || [])];
                                                                            [currentIds[index], currentIds[index - 1]] = [currentIds[index - 1], currentIds[index]];
                                                                            updateContent("selectedCategoryIds", currentIds);
                                                                        }}
                                                                        disabled={index === 0}
                                                                        className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Mover para cima"
                                                                    >
                                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (index === (data.content.selectedCategoryIds || []).length - 1) return;
                                                                            const currentIds = [...(data.content.selectedCategoryIds || [])];
                                                                            [currentIds[index], currentIds[index + 1]] = [currentIds[index + 1], currentIds[index]];
                                                                            updateContent("selectedCategoryIds", currentIds);
                                                                        }}
                                                                        disabled={index === (data.content.selectedCategoryIds || []).length - 1}
                                                                        className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Mover para baixo"
                                                                    >
                                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center justify-center min-w-[24px] h-6 rounded bg-green-600 text-white text-xs font-bold">
                                                                    {index + 1}
                                                                </div>

                                                                {categoryData.imageUrl || category.imageUrl ? (
                                                                    <img
                                                                        src={categoryData.imageUrl || category.imageUrl}
                                                                        alt={categoryData.name || category.name}
                                                                        className="h-12 w-12 object-cover rounded border-2 border-green-200"
                                                                    />
                                                                ) : (
                                                                    <div className="h-12 w-12 bg-green-200 rounded flex items-center justify-center text-xs text-green-700 font-bold border-2 border-green-300">
                                                                        {(categoryData.name || category.name).charAt(0)}
                                                                    </div>
                                                                )}

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium text-slate-800 truncate">
                                                                        {categoryData.name || category.name}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {category.slug}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentIds = data.content.selectedCategoryIds || [];
                                                                        const newIds = currentIds.filter((id: string) => id !== categoryId);

                                                                        // Also remove from categoriesData
                                                                        const newCategoriesData = { ...(data.content.categoriesData || {}) };
                                                                        delete newCategoriesData[categoryId];

                                                                        const newData = {
                                                                            ...data,
                                                                            content: {
                                                                                ...data.content,
                                                                                selectedCategoryIds: newIds,
                                                                                categoriesData: newCategoriesData
                                                                            }
                                                                        };
                                                                        setData(newData);
                                                                        onUpdate(newData);
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                                    title="Remover"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            {/* Custom fields for each category */}
                                                            <div className="ml-12 space-y-2 bg-white/50 p-2 rounded border">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Nome Personalizado (opcional)</Label>
                                                                    <Input
                                                                        value={categoryData.name || ""}
                                                                        onChange={(e) => {
                                                                            const newCategoriesData = {
                                                                                ...(data.content.categoriesData || {}),
                                                                                [categoryId]: {
                                                                                    ...(data.content.categoriesData?.[categoryId] || {}),
                                                                                    name: e.target.value
                                                                                }
                                                                            };
                                                                            updateContent("categoriesData", newCategoriesData);
                                                                        }}
                                                                        placeholder={category.name}
                                                                        className="text-xs"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">Link do Card</Label>
                                                                    <SharedLinkSelector
                                                                        value={categoryData.link || `/search?category=${category.slug}`}
                                                                        onChange={(val) => {
                                                                            const newCategoriesData = {
                                                                                ...(data.content.categoriesData || {}),
                                                                                [categoryId]: {
                                                                                    ...(data.content.categoriesData?.[categoryId] || {}),
                                                                                    link: val
                                                                                }
                                                                            };
                                                                            updateContent("categoriesData", newCategoriesData);
                                                                        }}
                                                                        categories={categories || []}
                                                                        className="w-full"
                                                                    />
                                                                </div>

                                                                <CompactImagePicker
                                                                    value={categoryData.imageUrl || category.imageUrl || ""}
                                                                    onChange={(url) => {
                                                                        const newCategoriesData = {
                                                                            ...(data.content.categoriesData || {}),
                                                                            [categoryId]: {
                                                                                ...(data.content.categoriesData?.[categoryId] || {}),
                                                                                imageUrl: url
                                                                            }
                                                                        };
                                                                        updateContent("categoriesData", newCategoriesData);
                                                                    }}
                                                                    label="Imagem da Categoria"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Adicionar Categorias</Label>
                                    <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                Nenhuma categoria encontrada
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {categories.map((category) => {
                                                    const isSelected = (data.content.selectedCategoryIds || []).includes(category.id);
                                                    return (
                                                        <label
                                                            key={category.id}
                                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                                                isSelected ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const currentIds = data.content.selectedCategoryIds || [];
                                                                    const newIds = e.target.checked
                                                                        ? [...currentIds, category.id]
                                                                        : currentIds.filter((id: string) => id !== category.id);
                                                                    updateContent("selectedCategoryIds", newIds);
                                                                }}
                                                                className="h-4 w-4 rounded border-slate-300"
                                                            />
                                                            {category.imageUrl ? (
                                                                <img
                                                                    src={category.imageUrl}
                                                                    alt={category.name}
                                                                    className="h-10 w-10 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-600 font-bold">
                                                                    {category.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate">
                                                                    {category.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {category.slug}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <span className="text-xs font-semibold text-green-600">✓</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <Label>Limite de Categorias</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.content.limit || 8}
                                        onChange={(e) => updateContent("limit", parseInt(e.target.value) || 8)}
                                    />
                                    <p className="text-xs text-slate-500">Quantidade máxima de categorias a exibir (1-50)</p>
                                </div>

                                {/* Per-category image editing in auto mode */}
                                {categories && categories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Imagens das Categorias</Label>
                                        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                                            <div className="divide-y">
                                                {categories.slice(0, data.content.limit || 8).map((category: any) => {
                                                    const categoryData = (data.content.categoriesData || {})[category.id] || {};
                                                    const currentImage = categoryData.imageUrl || category.imageUrl || "";

                                                    return (
                                                        <div key={category.id} className="p-3 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                {currentImage ? (
                                                                    <img src={currentImage} alt={category.name} className="h-10 w-10 object-cover rounded" />
                                                                ) : (
                                                                    <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-600 font-bold">
                                                                        {category.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span className="text-sm font-medium flex-1">{category.name}</span>
                                                            </div>
                                                            <CompactImagePicker
                                                                value={currentImage}
                                                                onChange={(url) => {
                                                                    const newCategoriesData = {
                                                                        ...(data.content.categoriesData || {}),
                                                                        [category.id]: {
                                                                            ...(data.content.categoriesData?.[category.id] || {}),
                                                                            imageUrl: url
                                                                        }
                                                                    };
                                                                    updateContent("categoriesData", newCategoriesData);
                                                                }}
                                                            />
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Link do Card</Label>
                                                                <SharedLinkSelector
                                                                    value={categoryData.link || `/search?category=${category.slug}`}
                                                                    onChange={(val) => {
                                                                        const newCategoriesData = {
                                                                            ...(data.content.categoriesData || {}),
                                                                            [category.id]: {
                                                                                ...(data.content.categoriesData?.[category.id] || {}),
                                                                                link: val
                                                                            }
                                                                        };
                                                                        updateContent("categoriesData", newCategoriesData);
                                                                    }}
                                                                    categories={categories || []}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- NEWSLETTER BLOCK EDITOR --- */}
                {block.type === "newsletter" && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Título</Label>
                            <Input
                                ref={titleRef}
                                value={data.content.title || ""}
                                onChange={(e) => updateContent("title", e.target.value)}
                                placeholder="Entre para o Clube"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Descrição</Label>
                            <Textarea
                                ref={descriptionRef}
                                value={data.content.description || ""}
                                onChange={(e) => updateContent("description", e.target.value)}
                                placeholder="Receba novidades, dicas de beleza e ofertas exclusivas..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Placeholder do Campo de Email</Label>
                            <Input
                                ref={placeholderRef}
                                value={data.content.placeholder || ""}
                                onChange={(e) => updateContent("placeholder", e.target.value)}
                                placeholder="Seu melhor e-mail"
                            />
                            <p className="text-xs text-slate-500">Texto que aparece dentro do campo antes de digitar</p>
                        </div>

                        <div className="space-y-1">
                            <Label>Texto do Botão</Label>
                            <Input
                                ref={buttonTextRef}
                                value={data.content.buttonText || ""}
                                onChange={(e) => updateContent("buttonText", e.target.value)}
                                placeholder="Inscrever"
                            />
                        </div>
                    </div>
                )}

                <div className="border-t pt-4 my-2"></div>
                <h4 className="font-semibold text-xs uppercase text-slate-400 mb-3">Estilo / Layout</h4>

                <div className="space-y-4">
                    <ColorPickerInput
                        id="bg-color"
                        label="Cor de Fundo"
                        value={data.styles.backgroundColor || "#ffffff"}
                        onChange={(val) => updateStyle("backgroundColor", val)}
                    />

                    {block.type === "categories" && (
                        <CompactImagePicker
                            value={data.styles.backgroundImage || ""}
                            onChange={(url) => updateStyle("backgroundImage", url)}
                            label="Imagem de Fundo"
                        />
                    )}

                    {block.type === "hero" && (
                        <ColorPickerInput
                            id="title-color"
                            label="Cor do Título"
                            value={data.styles.titleColor || data.styles.textColor || "#000000"}
                            onChange={(val) => updateStyle("titleColor", val)}
                        />
                    )}

                    {(block.type === "categories" || block.type === "brands") && (
                        <ColorPickerInput
                            id="heading-color"
                            label="Cor do Título da Seção"
                            value={data.styles.headingColor || "#111827"}
                            onChange={(val) => updateStyle("headingColor", val)}
                        />
                    )}

                    {block.type === "newsletter" && (
                        <>
                            <ColorPickerInput
                                id="title-color"
                                label="Cor do Título"
                                value={data.styles.titleColor || "#ffffff"}
                                onChange={(val) => updateStyle("titleColor", val)}
                            />
                            <ColorPickerInput
                                id="icon-color"
                                label="Cor do Ícone"
                                value={data.styles.iconColor || "#6366f1"}
                                onChange={(val) => updateStyle("iconColor", val)}
                            />
                            <ColorPickerInput
                                id="button-color"
                                label="Cor do Botão"
                                value={data.styles.buttonColor || "#6366f1"}
                                onChange={(val) => updateStyle("buttonColor", val)}
                            />
                            <ColorPickerInput
                                id="button-text-color"
                                label="Cor do Texto do Botão"
                                value={data.styles.buttonTextColor || "#ffffff"}
                                onChange={(val) => updateStyle("buttonTextColor", val)}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Espaço Superior</Label>
                            <select
                                className="w-full text-sm border rounded h-9 px-2"
                                value={data.styles.paddingTop || "2rem"}
                                onChange={(e) => updateStyle("paddingTop", e.target.value)}
                            >
                                <option value="0">Nenhum</option>
                                <option value="1rem">Pequeno (16px)</option>
                                <option value="2rem">Médio (32px)</option>
                                <option value="4rem">Grande (64px)</option>
                                <option value="6rem">Extra Grande</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Espaço Inferior</Label>
                            <select
                                className="w-full text-sm border rounded h-9 px-2"
                                value={data.styles.paddingBottom || "2rem"}
                                onChange={(e) => updateStyle("paddingBottom", e.target.value)}
                            >
                                <option value="0">Nenhum</option>
                                <option value="1rem">Pequeno (16px)</option>
                                <option value="2rem">Médio (32px)</option>
                                <option value="4rem">Grande (64px)</option>
                                <option value="6rem">Extra Grande</option>
                            </select>
                        </div>
                    </div>

                    {/* Hide text alignment for text blocks (own control) and categories (always centered) */}
                    {block.type !== "text" && block.type !== "categories" && (
                        <div className="space-y-1">
                            <Label className="text-xs">Alinhamento de Texto</Label>
                            <div className="flex border rounded overflow-hidden">
                                {["left", "center", "right"].map((align) => (
                                    <button
                                        key={align}
                                        className={`flex-1 py-1.5 text-xs font-medium capitalize ${data.styles.textAlign === align ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                                        onClick={() => updateStyle("textAlign", align)}
                                    >
                                        {align === "left" ? "Esquerda" : align === "center" ? "Centro" : "Direita"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
