"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    GripVertical,
    Plus,
    Trash2,
    Store,
    Link2,
    Phone,
    CreditCard,
    Mail,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    MapPin,
    Instagram,
    Facebook,
    Twitter,
    FileText,
    Pencil,
    List,
    ExternalLink,
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";
import { updateFooterBlocks } from "@/lib/actions/settings";
import Link from "next/link";
import { SharedLinkSelector } from "@/components/admin/SharedLinkSelector";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

export type BlockType = "about" | "menu" | "contact" | "payment" | "newsletter" | "custom" | "custom_links";

export interface FooterBlock {
    id: string;
    type: BlockType;
    order: number;
    menuHandle?: string;
    title?: string;
    // Content fields
    content?: string;
    phone?: string;
    email?: string;
    address?: string;
    newsletterText?: string;
    // For custom link lists
    linkItems?: { id: string; label: string; url: string; }[];
}

const BLOCK_TYPES: { value: BlockType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "about", label: "Sobre a Loja", icon: <Store className="h-4 w-4" />, description: "Nome, descrição e redes sociais" },
    { value: "menu", label: "Links", icon: <Link2 className="h-4 w-4" />, description: "Lista de links de um menu" },
    { value: "custom_links", label: "Minha Lista", icon: <List className="h-4 w-4" />, description: "Lista de links personalizada" },
    { value: "contact", label: "Contato", icon: <Phone className="h-4 w-4" />, description: "Endereço, telefone e email" },
    { value: "payment", label: "Pagamento", icon: <CreditCard className="h-4 w-4" />, description: "Métodos de pagamento aceitos" },
    { value: "newsletter", label: "Newsletter", icon: <Mail className="h-4 w-4" />, description: "Formulário de inscrição" },
    { value: "custom", label: "Texto Livre", icon: <FileText className="h-4 w-4" />, description: "Título e texto livre" },
];

interface FooterBlockEditorProps {
    menus: { id: string; handle: string; title: string; items?: any[] }[];
    config: any;
    categories: { id: string; name: string }[];
    initialData: any;
    onBlocksChange?: (data: { blocks: FooterBlock[], bottomBlocks: any[] }) => void;
    selectedBlockId?: string | null;
}

// Inline Editable Component
function EditablePreviewText({
    value,
    onChange,
    className,
    tag: Tag = "div",
    placeholder,
    multiline = false
}: {
    value?: string;
    onChange: (val: string) => void;
    className?: string;
    tag?: any;
    placeholder?: string;
    multiline?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
        setLocalValue(value || "");
    }, [value]);

    const submit = () => {
        setIsEditing(false);
        onChange(localValue);
    };

    if (isEditing) {
        if (multiline) {
            return (
                <Textarea
                    autoFocus
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={submit}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    className="min-h-[60px] text-xs bg-slate-800 border-slate-700 text-white resize-none"
                    placeholder={placeholder}
                />
            );
        }
        return (
            <Input
                autoFocus
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={submit}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                className="h-7 text-xs bg-slate-800 border-slate-700 text-white"
                placeholder={placeholder}
            />
        );
    }

    return (
        <Tag
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 border border-transparent hover:border-white/20 transition-all empty:before:content-[attr(placeholder)] empty:before:text-slate-600",
                className
            )}
            placeholder={placeholder}
        >
            {value}
        </Tag>
    );
}

// Sortable Block Wrapper
function SortableBlock({ id, children }: { id: string; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : "auto",
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative h-full">
            {children}
            {/* Drag Handle - Top Right */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -top-3 -right-3 p-1.5 bg-slate-800 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white cursor-grab active:cursor-grabbing shadow-md transition-opacity z-10"
                title="Arrastar para mover"
            >
                <GripVertical className="h-3.5 w-3.5" />
            </div>
            {/* Outline on hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-dashed group-hover:border-slate-600 rounded-lg pointer-events-none -m-2 p-2" />
        </div>
    );
}


function SortableBottomBlock({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative rounded p-1">
            {children}
            {/* Outline on hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-dashed group-hover:border-slate-600 rounded pointer-events-none -m-1" />

            {/* Drag Handle - Top Right */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -top-3 -right-3 p-1.5 bg-slate-800 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white cursor-grab active:cursor-grabbing shadow-md transition-opacity z-10"
                title="Arrastar para mover"
            >
                <GripVertical className="h-3.5 w-3.5" />
            </div>
        </div>
    );
}

// Helper to determine text color based on background
function getContrastColor(hexColor?: string) {
    if (!hexColor || !hexColor.startsWith('#')) return "#ffffff";
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}



export function FooterBlockEditor({ initialData, menus, config, categories, onBlocksChange, selectedBlockId }: FooterBlockEditorProps) {
    const [blocks, setBlocks] = useState<FooterBlock[]>(initialData.blocks || getDefaultBlocks());

    // Refs for block cards to enable scroll-to-view
    const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Scroll to and flash the selected block when selectedBlockId changes
    useEffect(() => {
        if (!selectedBlockId) return;

        const scrollToBlock = () => {
            const element = blockRefs.current[selectedBlockId];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Flash 2 times
                const flash = () => {
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
                };
                const unflash = () => {
                    element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
                };

                flash();
                setTimeout(() => {
                    unflash();
                    setTimeout(() => {
                        flash();
                        setTimeout(unflash, 300);
                    }, 150);
                }, 300);
            }
        };

        // Small delay to ensure element is rendered
        setTimeout(scrollToBlock, 100);
    }, [selectedBlockId]);

    // Bottom blocks state (migration from footerText)
    const [bottomBlocks, setBottomBlocks] = useState<{ id: string; content: string; align?: 'left' | 'center' | 'right' }[]>(() => {
        if (initialData.bottomBlocks) return initialData.bottomBlocks;
        if (initialData.footerText) return [{ id: "legacy", content: initialData.footerText, align: 'left' }];
        return [];
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    // Track if changes are internal to prevent sync loops
    const isInternalChange = useRef(false);

    // Use ref to avoid infinite loop - callback should not trigger re-render
    const onBlocksChangeRef = useRef(onBlocksChange);
    onBlocksChangeRef.current = onBlocksChange;

    // Sync blocks when initialData changes from outside (e.g., from EditableFooter in preview)
    useEffect(() => {
        // Skip if this is our own change propagating back
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (initialData.blocks && Array.isArray(initialData.blocks)) {
            // Compare by JSON to avoid unnecessary updates
            const currentJSON = JSON.stringify(blocks);
            const newJSON = JSON.stringify(initialData.blocks);
            if (currentJSON !== newJSON) {
                setBlocks(initialData.blocks);
            }
        }

        if (initialData.bottomBlocks && Array.isArray(initialData.bottomBlocks)) {
            const currentJSON = JSON.stringify(bottomBlocks);
            const newJSON = JSON.stringify(initialData.bottomBlocks);
            if (currentJSON !== newJSON) {
                setBottomBlocks(initialData.bottomBlocks);
            }
        }
    }, [initialData.blocks, initialData.bottomBlocks]);

    // Propagate changes to parent for live preview
    useEffect(() => {
        if (onBlocksChangeRef.current) {
            isInternalChange.current = true;
            onBlocksChangeRef.current({ blocks, bottomBlocks });
        }
    }, [blocks, bottomBlocks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function getDefaultBlocks(): FooterBlock[] {
        return [
            { id: "1", type: "about", order: 0, title: "Loja", content: config?.description || "Sua loja favorita..." },
            { id: "2", type: "menu", order: 1, menuHandle: "footer", title: "Institucional" },
            { id: "3", type: "contact", order: 2, title: "Atendimento", phone: config?.phone, email: config?.email, address: config?.address },
            { id: "4", type: "payment", order: 3, title: "Pagamento Seguro", content: config?.paymentText || "Aceitamos todos os cartões, PIX e Boleto." },
        ];
    }

    function addBlock(type: BlockType) {
        let newBlock: FooterBlock = {
            id: crypto.randomUUID(),
            type,
            order: blocks.length,
            title: BLOCK_TYPES.find(b => b.value === type)?.label,
        };

        if (type === "contact") newBlock = { ...newBlock, phone: config?.phone, email: config?.email, address: config?.address };
        if (type === "payment") newBlock = { ...newBlock, content: config?.paymentText || "Aceitamos PIX e Cartão" };
        if (type === "about") newBlock = { ...newBlock, content: config?.description };
        if (type === "custom_links") newBlock = { ...newBlock, linkItems: [{ id: crypto.randomUUID(), label: "Link Exemplo", url: "/" }] };

        setBlocks([...blocks, newBlock]);
        setShowAddMenu(false);
    }

    function removeBlock(id: string) {
        setBlocks(blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })));
    }

    function moveBlock(id: string, direction: "up" | "down") {
        const index = blocks.findIndex(b => b.id === id);
        if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        updateOrder(newBlocks);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        if (blocks.some(b => b.id === active.id)) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                return newItems.map((item, index) => ({ ...item, order: index }));
            });
        } else if (bottomBlocks.some(b => b.id === active.id)) {
            setBottomBlocks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    function updateOrder(items: FooterBlock[]) {
        setBlocks(items.map((b, i) => ({ ...b, order: i })));
    }

    function updateBlock(id: string, updates: Partial<FooterBlock>) {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    }

    // Helper functions for Custom Link Lists
    function addLinkItem(blockId: string) {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        const newItems = [...(block.linkItems || []), { id: crypto.randomUUID(), label: "Novo Link", url: "/" }];
        updateBlock(blockId, { linkItems: newItems });
    }

    function updateLinkItem(blockId: string, itemId: string, updates: Partial<{ label: string; url: string }>) {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        const newItems = block.linkItems?.map(item => item.id === itemId ? { ...item, ...updates } : item);
        updateBlock(blockId, { linkItems: newItems });
    }

    function removeLinkItem(blockId: string, itemId: string) {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        const newItems = block.linkItems?.filter(item => item.id !== itemId);
        updateBlock(blockId, { linkItems: newItems });
    }

    async function handleSave() {
        setIsSaving(true);
        try {
            // Save as an object wrapper
            await updateFooterBlocks({ blocks, bottomBlocks });
        } finally {
            setIsSaving(false);
        }
    }

    const getMenu = (handle?: string) => menus.find(m => m.handle === handle);

    const renderBlockFields = (block: FooterBlock) => {
        switch (block.type) {
            case "custom_links":
                return (
                    <div className="space-y-3 mt-2">
                        <Label className="text-xs">Itens da Lista</Label>
                        {(block.linkItems || []).map((item, idx) => (
                            <div key={item.id} className="flex gap-2 items-center">
                                <Input
                                    value={item.label}
                                    onChange={(e) => updateLinkItem(block.id, item.id, { label: e.target.value })}
                                    className="h-8 text-xs flex-1"
                                    placeholder="Texto"
                                />
                                <div className="flex-1">
                                    <SharedLinkSelector
                                        value={item.url}
                                        onChange={(val) => updateLinkItem(block.id, item.id, { url: val })}
                                        categories={categories}
                                        className="w-full"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLinkItem(block.id, item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addLinkItem(block.id)} className="w-full h-8 text-xs">
                            <Plus className="h-3 w-3 mr-2" /> Adicionar Link
                        </Button>
                    </div>
                );
            case "about":
                return (
                    <div className="space-y-2 mt-2">
                        <div>
                            <Label className="text-xs">Descrição da Loja</Label>
                            <Textarea
                                value={block.content || ""}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                className="h-20 text-xs"
                            />
                        </div>
                    </div>
                );
            case "menu":
                return (
                    <div className="space-y-2 mt-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label className="text-xs">Selecionar Menu</Label>
                                <Select
                                    value={block.menuHandle || ""}
                                    onValueChange={(value) => updateBlock(block.id, { menuHandle: value })}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {menus.map(menu => (
                                            <SelectItem key={menu.id} value={menu.handle}>{menu.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Link href={getMenu(block.menuHandle) ? `/admin/menus/${getMenu(block.menuHandle)?.id}` : "/admin/menus"} target="_blank">
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                        Links <Link2 className="ml-2 h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            case "contact":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Tel {block.phone && <span className="text-[10px] text-amber-500">(Override)</span>}</Label>
                            <div className="flex gap-1">
                                <Input
                                    value={block.phone || ""}
                                    onChange={(e) => updateBlock(block.id, { phone: e.target.value })}
                                    className="h-8 text-xs"
                                    placeholder={config?.phone || "Telefone Global"}
                                />
                                {block.phone && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => updateBlock(block.id, { phone: "" })} title="Usar Global">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Email {block.email && <span className="text-[10px] text-amber-500">(Override)</span>}</Label>
                            <div className="flex gap-1">
                                <Input
                                    value={block.email || ""}
                                    onChange={(e) => updateBlock(block.id, { email: e.target.value })}
                                    className="h-8 text-xs"
                                    placeholder={config?.email || "Email Global"}
                                />
                                {block.email && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => updateBlock(block.id, { email: "" })} title="Usar Global">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Endereço {block.address && <span className="text-[10px] text-amber-500">(Override)</span>}</Label>
                            <div className="flex gap-1">
                                <Input
                                    value={block.address || ""}
                                    onChange={(e) => updateBlock(block.id, { address: e.target.value })}
                                    className="h-8 text-xs"
                                    placeholder={config?.address || "Endereço Global"}
                                />
                                {block.address && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => updateBlock(block.id, { address: "" })} title="Usar Global">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case "payment":
                return <Input value={block.content || ""} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder="Ex: PIX e Cartão" className="h-8 text-xs mt-2" />;
            case "newsletter":
                return <Input value={block.newsletterText || ""} onChange={(e) => updateBlock(block.id, { newsletterText: e.target.value })} className="h-8 text-xs mt-2" />;
            case "custom":
                return <Textarea value={block.content || ""} onChange={(e) => updateBlock(block.id, { content: e.target.value })} className="h-20 text-xs mt-2" />;
            default: return null;
        }
    }

    const renderPreviewBlock = (block: FooterBlock) => {
        const storeName = config?.storeName || "Loja";

        return (
            <SortableBlock key={block.id} id={block.id}>
                {(() => {
                    switch (block.type) {
                        case "custom_links":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || "Meus Links"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <ul className="space-y-2 text-xs text-slate-400">
                                        {(block.linkItems || []).map((item) => (
                                            <li key={item.id} className="flex gap-2 items-center group/link">
                                                <EditablePreviewText
                                                    value={item.label}
                                                    onChange={(val) => updateLinkItem(block.id, item.id, { label: val })}
                                                />
                                                {/* Visual indicator for URL, clicking it could ideally edit URL but simple is ok */}
                                                <span className="text-[10px] text-slate-600 opacity-0 group-hover/link:opacity-100 transition-opacity" title={item.url}>{item.url}</span>
                                            </li>
                                        ))}
                                        <li>
                                            <button onClick={() => addLinkItem(block.id)} className="text-primary hover:underline">+ Adicionar</button>
                                        </li>
                                    </ul>
                                </div>
                            );
                        case "about":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || storeName}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <EditablePreviewText
                                        value={block.content || config?.description || "Descrição..."}
                                        onChange={(val) => updateBlock(block.id, { content: val })}
                                        className="text-xs text-slate-400 leading-relaxed block"
                                        multiline
                                    />
                                    <div className="flex gap-2 text-slate-500">
                                        <Instagram className="h-4 w-4" /><Facebook className="h-4 w-4" />
                                    </div>
                                </div>
                            );
                        case "menu":
                            const menu = getMenu(block.menuHandle);
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || menu?.title || "Links"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <ul className="space-y-2 text-xs text-slate-400">
                                        {menu?.items?.slice(0, 4).map((item: any) => (
                                            <li key={item.id}>{item.label}</li>
                                        )) || <li>Link de Exemplo...</li>}
                                    </ul>
                                    <Link
                                        href={menu ? `/admin/menus/${menu.id}` : "/admin/menus"}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline bg-primary/10 px-2 py-1 rounded"
                                    >
                                        <ExternalLink className="h-3 w-3" /> Gerenciar Menu
                                    </Link>
                                </div>
                            );
                        case "contact":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || "Atendimento"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <div className="space-y-2 text-xs text-slate-400">
                                        <div className="flex gap-2 items-center">
                                            <MapPin className="h-3 w-3 text-pink-500" />
                                            <EditablePreviewText value={block.address || config?.address} onChange={v => updateBlock(block.id, { address: v })} placeholder="Endereço..." />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Phone className="h-3 w-3 text-pink-500" />
                                            <EditablePreviewText value={block.phone || config?.phone} onChange={v => updateBlock(block.id, { phone: v })} placeholder="Telefone..." />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Mail className="h-3 w-3 text-pink-500" />
                                            <EditablePreviewText value={block.email || config?.email} onChange={v => updateBlock(block.id, { email: v })} placeholder="Email..." />
                                        </div>
                                    </div>
                                </div>
                            );
                        case "payment":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || "Pagamento"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <div className="flex gap-2 items-center text-slate-400">
                                        <CreditCard className="h-5 w-5" />
                                        <EditablePreviewText value={block.content || config?.paymentText} onChange={v => updateBlock(block.id, { content: v })} placeholder="Métodos..." className="text-xs" />
                                    </div>
                                </div>
                            );
                        case "newsletter":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || "Newsletter"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <EditablePreviewText value={block.newsletterText} onChange={v => updateBlock(block.id, { newsletterText: v })} className="text-xs text-slate-400 block" placeholder="Texto auxiliar..." />
                                    <div className="flex gap-1 opacity-50"><input className="w-full h-7 bg-slate-700 rounded text-xs px-2" disabled /><button className="bg-pink-500 h-7 w-7 rounded"></button></div>
                                </div>
                            );
                        case "custom":
                            return (
                                <div className="space-y-4">
                                    <EditablePreviewText
                                        value={block.title || "Título"}
                                        onChange={(val) => updateBlock(block.id, { title: val })}
                                        className="text-white text-sm font-bold uppercase tracking-wider block"
                                        tag="h4"
                                    />
                                    <EditablePreviewText
                                        value={block.content}
                                        onChange={(val) => updateBlock(block.id, { content: val })}
                                        className="text-xs text-slate-400 leading-relaxed block whitespace-pre-wrap"
                                        multiline
                                        placeholder="Clique para editar o conteúdo..."
                                    />
                                </div>
                            );
                        default: return null;
                    }
                })()}
            </SortableBlock>
        );
    };

    const gridCols = blocks.length <= 2 ? "grid-cols-2" : blocks.length <= 3 ? "grid-cols-3" : "grid-cols-4";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Editar Layout (Visual)</h3>
                    <p className="text-sm text-muted-foreground">Clique nos textos para editar. Arraste os blocos para reordenar.</p>
                </div>
                <div className="flex gap-2">

                    <Button variant="outline" onClick={() => setShowAddMenu(!showAddMenu)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bloco
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </div>

            {/* Preview visual removido (redundante) */}

            {
                showAddMenu && (
                    <Card className="border-dashed border-2 bg-slate-50">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {BLOCK_TYPES.map(bt => (
                                    <Button
                                        key={bt.value}
                                        variant="outline"
                                        className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 min-h-[120px]"
                                        onClick={() => addBlock(bt.value)}
                                    >
                                        <span className="p-3 rounded-xl bg-slate-100 shrink-0">{bt.icon}</span>
                                        <span className="text-xs font-medium text-center leading-tight">{bt.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocos do Rodapé</p>
                    <div className="h-px bg-border flex-1" />
                </div>
                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        ref={(el) => { blockRefs.current[block.id] = el; }}
                        className="transition-all rounded-lg"
                    >
                        <Card className="border-l-4 border-l-slate-200">
                            <CardContent className="p-3 flex items-start gap-4">
                            <div className="mt-2 text-slate-400"><GripVertical className="h-4 w-4" /></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 font-medium text-sm">
                                        {BLOCK_TYPES.find(b => b.value === block.type)?.icon}
                                        {block.title || "Sem Título"}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeBlock(block.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                                <div className="pl-6">{renderBlockFields(block)}</div>
                            </div>
                        </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div >
    );
}
