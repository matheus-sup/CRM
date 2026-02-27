import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { PageBlock } from "@/types/page-builder";
import { ArrowDown, ArrowUp, GripVertical, Settings2, Trash2, Type, Image as ImageIcon, Code, Box, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockLayerListProps {
    blocks: PageBlock[];
    onSelect: (blockId: string) => void;
    onMoveUp: (blockId: string) => void;
    onMoveDown: (blockId: string) => void;
    onDelete: (blockId: string) => void;
    onReorder?: (newBlocks: PageBlock[]) => void;
    onHighlightBlock?: (blockId: string) => void;
    selectedBlockId?: string | null;
}

const getBlockIcon = (type: string) => {
    switch (type) {
        case "hero": return ImageIcon;
        case "text": return Type;
        case "html": return Code;
        case "product-grid": return Box;
        case "columns": return Layout;
        case "promo-banner": return ImageIcon;
        default: return Settings2;
    }
};

const getBlockLabel = (block: PageBlock) => {
    if (block.label) return block.label;
    if (block.type === "hero") return block.content?.title || "Banner Hero";
    if (block.type === "text") return "Texto Rico";
    if (block.type === "html") return "HTML Personalizado";
    if (block.type === "product-grid") return "Grid de Produtos";
    if (block.type === "promo-banner") return block.content?.title || "Banner Promocional";
    return "Bloco";
};

// Sortable Item Component
function SortableBlockItem({ block, isSelected, onSelect, onHighlightBlock, onMoveUp, onMoveDown, onDelete, index, total }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        position: isDragging ? "relative" as const : "static" as const,
    };

    const Icon = getBlockIcon(block.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center justify-between p-2 rounded-lg border transition-all hover:border-blue-300",
                isSelected ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-slate-200",
                isDragging && "opacity-50 shadow-lg ring-2 ring-blue-400"
            )}
        >
            {/* Drag Handle & Info - Click to Select & Highlight */}
            <div
                className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden select-none"
                onClick={() => {
                    onSelect(block.id);
                    onHighlightBlock?.(block.id);
                }}
            >
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
                    <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                </div>

                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className={cn("text-sm font-medium truncate", isSelected ? "text-blue-900" : "text-slate-700")}>
                    {getBlockLabel(block)}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }}
                    disabled={index === 0}
                    title="Mover para cima"
                >
                    <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }}
                    disabled={index === total - 1}
                    title="Mover para baixo"
                >
                    <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-300 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    title="Excluir"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

export function BlockLayerList({ blocks, onSelect, onMoveUp, onMoveDown, onDelete, onReorder, onHighlightBlock, selectedBlockId }: BlockLayerListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && onReorder) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over?.id);

            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            onReorder(newBlocks);
        }
    };

    if (blocks.length === 0) {
        return (
            <div className="text-center py-10 px-4 text-slate-400">
                <p className="text-sm">Nenhum bloco adicionado.</p>
                <p className="text-xs mt-2">Clique em "Adicionar Seção" abaixo do preview para começar.</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2 p-1">
                    {blocks.map((block, index) => (
                        <SortableBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            total={blocks.length}
                            isSelected={selectedBlockId === block.id}
                            onSelect={onSelect}
                            onHighlightBlock={onHighlightBlock}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
