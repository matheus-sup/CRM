"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Facebook, Instagram, CreditCard, GripVertical, Trash2, Pencil, Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FooterBlock {
    id: string;
    type: string;
    order: number;
    title?: string;
    content?: string;
    menuHandle?: string;
    phone?: string;
    email?: string;
    address?: string;
    newsletterText?: string;
    linkItems?: { id: string; label: string; url: string; }[];
}

interface BottomBlock {
    id: string;
    content: string;
    order?: number;
}

interface EditableFooterProps {
    config: any;
    menus?: any[];
    blocks: FooterBlock[];
    bottomBlocks?: BottomBlock[];
    selectedBlockId?: string | null;
    onBlockSelect?: (id: string | null) => void;
    onBlocksReorder?: (blocks: FooterBlock[]) => void;
    onBlockUpdate?: (block: FooterBlock) => void;
    onBlockDelete?: (id: string) => void;
    onBottomBlocksChange?: (blocks: BottomBlock[]) => void;
    bottomAlignment?: "left" | "center" | "right";
    onBottomAlignmentChange?: (alignment: "left" | "center" | "right") => void;
    onMenuItemReorder?: (menuId: string, itemId: string, direction: "up" | "down") => void;
}

// Editable Text Component
function EditableText({
    value,
    onChange,
    className,
    as = "span",
    placeholder = "Clique para editar...",
    style
}: {
    value: string;
    onChange: (newValue: string) => void;
    className?: string;
    as?: "h4" | "p" | "span";
    placeholder?: string;
    style?: React.CSSProperties;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(value);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== value) {
            onChange(editValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(value);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                    "bg-transparent border-b-2 border-blue-500 outline-none w-full",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    const Tag = as;
    return (
        <Tag
            onClick={handleClick}
            className={cn(
                className,
                "cursor-text hover:bg-blue-500/20 px-1 -mx-1 rounded transition-colors group/edit relative"
            )}
            style={style}
        >
            {value || placeholder}
            <Pencil className="h-3 w-3 absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-60" />
        </Tag>
    );
}

// Sortable Block Wrapper
function SortableBlock({
    block,
    children,
    isSelected,
    onSelect,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}: {
    block: FooterBlock;
    children: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const typeLabels: Record<string, string> = {
        about: "Sobre",
        menu: "Menu",
        contact: "Contato",
        payment: "Pagamento",
        newsletter: "Newsletter",
        custom: "Personalizado",
        custom_links: "Links"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group cursor-pointer transition-all duration-200 rounded-lg border",
                isDragging && "opacity-50 z-50",
                isSelected
                    ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent bg-blue-500/5"
                    : "border-dashed border-white/30 hover:border-blue-400 hover:border-solid hover:bg-blue-500/5"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {/* Floating Toolbar - Always visible */}
            <div
                className={cn(
                    "absolute -top-7 left-1/2 -translate-x-1/2 flex gap-1 rounded-md px-2 py-1 text-white text-xs items-center z-10 transition-all shadow-lg",
                    isSelected
                        ? "bg-blue-600"
                        : "bg-slate-700/90 group-hover:bg-blue-600"
                )}
            >
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded"
                    title="Arrastar para reordenar"
                >
                    <GripVertical className="h-3 w-3" />
                </button>
                {canMoveUp && (
                    <button
                        className="p-1 hover:bg-white/20 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp?.();
                        }}
                        title="Mover para esquerda"
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </button>
                )}
                <span className="font-medium px-1">{typeLabels[block.type] || block.type}</span>
                {canMoveDown && (
                    <button
                        className="p-1 hover:bg-white/20 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveDown?.();
                        }}
                        title="Mover para direita"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </button>
                )}
                <button
                    className="p-1 hover:bg-red-600 rounded ml-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    title="Remover bloco"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {/* Block Content */}
            <div className="p-4 pt-2">
                {children}
            </div>
        </div>
    );
}

export function EditableFooter({
    config,
    menus = [],
    blocks,
    bottomBlocks = [],
    selectedBlockId,
    onBlockSelect,
    onBlocksReorder,
    onBlockUpdate,
    onBlockDelete,
    onBottomBlocksChange,
    bottomAlignment = "center",
    onBottomAlignmentChange,
    onMenuItemReorder,
}: EditableFooterProps) {
    const storeName = config?.storeName || "Loja";

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Sort blocks by order
    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortedBlocks.findIndex(b => b.id === active.id);
        const newIndex = sortedBlocks.findIndex(b => b.id === over.id);
        const newBlocks = arrayMove(sortedBlocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }));

        if (onBlocksReorder) {
            onBlocksReorder(newBlocks);
        }
    };

    // Helper to update a specific block field
    const updateBlockField = (block: FooterBlock, field: string, value: string) => {
        if (onBlockUpdate) {
            onBlockUpdate({ ...block, [field]: value });
        }
    };

    // Helper to get menu by handle
    const getMenu = (handle?: string) => {
        if (!handle) return null;
        return menus.find(m => m.handle === handle);
    };

    // Render block content based on type - with inline editing
    const renderBlockContent = (block: FooterBlock) => {
        const description = block.content || config?.description || "Sua loja favorita.";
        const address = block.address || config?.address || "";
        const phone = block.phone || config?.phone || "";
        const email = block.email || config?.email || "";
        const paymentText = block.content || config?.paymentText || "Aceitamos todos os cartões, PIX e Boleto.";

        switch (block.type) {
            case "about":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || storeName}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <EditableText
                            value={block.content || description}
                            onChange={(v) => updateBlockField(block, "content", v)}
                            as="p"
                            className="text-sm leading-relaxed opacity-80"
                            style={{ color: config?.footerText || "#a3a3a3" }}
                            placeholder="Descrição da loja..."
                        />
                        {(config?.instagram || config?.facebook) && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {config?.instagram && (
                                    <span className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center" style={{ color: config?.footerText || "#a3a3a3" }}>
                                        <Instagram className="h-4 w-4" />
                                    </span>
                                )}
                                {config?.facebook && (
                                    <span className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center" style={{ color: config?.footerText || "#a3a3a3" }}>
                                        <Facebook className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );

            case "menu":
                const menu = getMenu(block.menuHandle);
                const sortedMenuItems = menu?.items?.length > 0
                    ? [...menu.items].sort((a: any, b: any) => a.order - b.order)
                    : [];
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || menu?.title || "Links"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <ul className="space-y-1 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {sortedMenuItems.length > 0 ? (
                                sortedMenuItems.map((item: any, itemIndex: number) => (
                                    <li
                                        key={item.id}
                                        className="group/menuitem flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity py-0.5 -mx-1 px-1 rounded hover:bg-white/5"
                                    >
                                        <span className="flex-1">{item.label}</span>
                                        <div className="flex gap-0.5 opacity-0 group-hover/menuitem:opacity-100 transition-opacity">
                                            {itemIndex > 0 && (
                                                <button
                                                    className="p-0.5 hover:bg-blue-600 rounded text-white/60 hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMenuItemReorder?.(menu.id, item.id, "up");
                                                    }}
                                                    title="Mover para cima"
                                                >
                                                    <ChevronUp className="h-3 w-3" />
                                                </button>
                                            )}
                                            {itemIndex < sortedMenuItems.length - 1 && (
                                                <button
                                                    className="p-0.5 hover:bg-blue-600 rounded text-white/60 hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMenuItemReorder?.(menu.id, item.id, "down");
                                                    }}
                                                    title="Mover para baixo"
                                                >
                                                    <ChevronDown className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="opacity-50 italic text-xs">Nenhum item no menu</li>
                            )}
                        </ul>
                    </div>
                );

            case "contact":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || "Atendimento"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <ul className="space-y-2 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {(block.address || address) && (
                                <li className="opacity-80">
                                    <EditableText
                                        value={block.address || address}
                                        onChange={(v) => updateBlockField(block, "address", v)}
                                        placeholder="Endereço..."
                                    />
                                </li>
                            )}
                            {(block.phone || phone) && (
                                <li className="opacity-80">
                                    <EditableText
                                        value={block.phone || phone}
                                        onChange={(v) => updateBlockField(block, "phone", v)}
                                        placeholder="Telefone..."
                                    />
                                </li>
                            )}
                            {(block.email || email) && (
                                <li className="opacity-80">
                                    <EditableText
                                        value={block.email || email}
                                        onChange={(v) => updateBlockField(block, "email", v)}
                                        placeholder="E-mail..."
                                    />
                                </li>
                            )}
                        </ul>
                    </div>
                );

            case "payment":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || "Pagamento Seguro"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <div className="flex gap-2 items-start opacity-80" style={{ color: config?.footerText || "#a3a3a3" }}>
                            <CreditCard className="h-6 w-6 shrink-0" />
                            <EditableText
                                value={block.content || paymentText}
                                onChange={(v) => updateBlockField(block, "content", v)}
                                className="text-sm"
                                placeholder="Métodos de pagamento aceitos..."
                            />
                        </div>
                    </div>
                );

            case "newsletter":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || "Newsletter"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <EditableText
                            value={block.newsletterText || "Receba nossas novidades e promoções exclusivas."}
                            onChange={(v) => updateBlockField(block, "newsletterText", v)}
                            as="p"
                            className="text-sm opacity-80"
                            style={{ color: config?.footerText || "#a3a3a3" }}
                            placeholder="Texto da newsletter..."
                        />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Seu e-mail"
                                className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 flex-1"
                                disabled
                            />
                            <Button size="sm" style={{ backgroundColor: config?.themeColor || "#db2777", color: "#ffffff" }} disabled>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );

            case "custom":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || "Título"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        <EditableText
                            value={block.content || ""}
                            onChange={(v) => updateBlockField(block, "content", v)}
                            as="p"
                            className="text-sm opacity-80"
                            style={{ color: config?.footerText || "#a3a3a3" }}
                            placeholder="Texto personalizado..."
                        />
                    </div>
                );

            case "custom_links":
                return (
                    <div className="space-y-4">
                        <EditableText
                            value={block.title || "Links"}
                            onChange={(v) => updateBlockField(block, "title", v)}
                            as="h4"
                            className="text-lg font-bold uppercase tracking-wider"
                            style={{ color: config?.footerText || "#ffffff" }}
                        />
                        {block.linkItems?.length ? (
                            <ul className="space-y-2 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                                {block.linkItems.map(item => (
                                    <li key={item.id} className="opacity-80 hover:opacity-100 transition-opacity">{item.label}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm opacity-50 italic" style={{ color: config?.footerText || "#a3a3a3" }}>Nenhum link configurado</p>
                        )}
                    </div>
                );

            default:
                return <div className="text-slate-500 text-sm">Bloco: {block.type}</div>;
        }
    };

    const bgStyle = { backgroundColor: config?.footerBg || "#171717" };
    const textStyle = { color: config?.footerText || "#a3a3a3" };

    return (
        <footer
            data-section="footer"
            className="pt-12 pb-6 transition-colors duration-300 relative"
            style={bgStyle}
            onClick={() => onBlockSelect?.(null)}
        >
            {/* Editor Mode Indicator */}
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Pencil className="h-3 w-3" />
                Modo Edição
            </div>

            <div className="container mx-auto px-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedBlocks.map(b => b.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start mt-4">
                            {sortedBlocks.map((block, index) => (
                                <SortableBlock
                                    key={block.id}
                                    block={block}
                                    isSelected={selectedBlockId === block.id}
                                    onSelect={() => onBlockSelect?.(block.id)}
                                    onDelete={() => onBlockDelete?.(block.id)}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < sortedBlocks.length - 1}
                                    onMoveUp={() => {
                                        if (index > 0) {
                                            const newBlocks = [...sortedBlocks];
                                            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
                                            const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
                                            onBlocksReorder?.(reordered);
                                        }
                                    }}
                                    onMoveDown={() => {
                                        if (index < sortedBlocks.length - 1) {
                                            const newBlocks = [...sortedBlocks];
                                            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
                                            const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
                                            onBlocksReorder?.(reordered);
                                        }
                                    }}
                                >
                                    {renderBlockContent(block)}
                                </SortableBlock>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Bottom Section - Editable */}
                <div
                    className="border-t border-white/10 mt-10 pt-6 relative group/bottom"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Bottom section toolbar */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/bottom:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Add a new bottom block
                                const newId = `bottom-${Date.now()}`;
                                const newBottom = [...bottomBlocks, { id: newId, content: "Novo texto", order: bottomBlocks.length }];
                                onBottomBlocksChange?.(newBottom);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
                            title="Adicionar texto"
                        >
                            <Plus className="h-3 w-3" />
                            Adicionar
                        </button>

                        {/* Alignment Controls */}
                        <div className="bg-slate-800 rounded-full p-1 flex items-center gap-1 border border-slate-700">
                            <button
                                onClick={(e) => { e.stopPropagation(); onBottomAlignmentChange?.("left"); }}
                                className={cn("p-1 rounded hover:bg-slate-700", bottomAlignment === "left" && "bg-blue-600 hover:bg-blue-700")}
                                title="Alinhar à Esquerda"
                            >
                                <AlignLeft className="h-3 w-3 text-white" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onBottomAlignmentChange?.("center"); }}
                                className={cn("p-1 rounded hover:bg-slate-700", bottomAlignment === "center" && "bg-blue-600 hover:bg-blue-700")}
                                title="Centralizar"
                            >
                                <AlignCenter className="h-3 w-3 text-white" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onBottomAlignmentChange?.("right"); }}
                                className={cn("p-1 rounded hover:bg-slate-700", bottomAlignment === "right" && "bg-blue-600 hover:bg-blue-700")}
                                title="Alinhar à Direita"
                            >
                                <AlignRight className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "flex flex-wrap items-center gap-4 text-sm",
                            bottomAlignment === "left" && "justify-start",
                            bottomAlignment === "center" && "justify-center",
                            bottomAlignment === "right" && "justify-end"
                        )}
                        style={textStyle}
                    >
                        {/* Render bottom blocks */}
                        {bottomBlocks.map((block, index) => (
                            <div
                                key={block.id}
                                className="group/item relative flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                            >
                                {/* Item controls */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity bg-blue-600 rounded px-1 py-0.5 flex items-center gap-1 text-white text-xs z-20">
                                    {index > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newBlocks = [...bottomBlocks];
                                                [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
                                                onBottomBlocksChange?.(newBlocks.map((b, i) => ({ ...b, order: i })));
                                            }}
                                            className="p-0.5 hover:bg-blue-700 rounded"
                                            title="Mover para esquerda"
                                        >
                                            <ChevronLeft className="h-3 w-3" />
                                        </button>
                                    )}
                                    {index < bottomBlocks.length - 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newBlocks = [...bottomBlocks];
                                                [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
                                                onBottomBlocksChange?.(newBlocks.map((b, i) => ({ ...b, order: i })));
                                            }}
                                            className="p-0.5 hover:bg-blue-700 rounded"
                                            title="Mover para direita"
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const filtered = bottomBlocks.filter(b => b.id !== block.id);
                                            onBottomBlocksChange?.(filtered.map((b, i) => ({ ...b, order: i })));
                                        }}
                                        className="p-0.5 hover:bg-red-600 rounded"
                                        title="Remover"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>

                                <EditableText
                                    value={block.content || "Texto"}
                                    onChange={(v) => {
                                        const updated = bottomBlocks.map(b =>
                                            b.id === block.id ? { ...b, content: v } : b
                                        );
                                        onBottomBlocksChange?.(updated);
                                    }}
                                    className="opacity-60 hover:opacity-100"
                                    placeholder="Digite o texto..."
                                />

                                {index < bottomBlocks.length - 1 && (
                                    <span className="mx-2 opacity-40">•</span>
                                )}
                            </div>
                        ))}

                        {/* Default copyright if no blocks */}
                        {bottomBlocks.length === 0 && (
                            <div
                                className="group/item relative px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Add first bottom block when clicking on default text
                                    const newId = `bottom-${Date.now()}`;
                                    onBottomBlocksChange?.([{
                                        id: newId,
                                        content: `© ${new Date().getFullYear()} ${storeName}. Todos os direitos reservados.`,
                                        order: 0
                                    }]);
                                }}
                            >
                                <span className="opacity-60 hover:opacity-100 transition-opacity">
                                    © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
                                </span>
                                <Pencil className="h-3 w-3 inline-block ml-2 opacity-0 group-hover/item:opacity-60" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
