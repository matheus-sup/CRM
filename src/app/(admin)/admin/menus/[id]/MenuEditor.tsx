"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash, GripVertical, Link as LinkIcon, Pencil } from "lucide-react";
import Link from "next/link";

import { updateMenu, addMenuItem, deleteMenuItem, deleteMenu, updateMenuItem } from "@/lib/actions/menu";
import { LinkSelector } from "./LinkSelector";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderMenuItems } from "@/lib/actions/menu-reorder";

// Sortable Item Component
// Sortable Item Component
function SortableMenuItem({ item, onDelete, onUpdate }: { item: any; onDelete: (id: string) => void; onUpdate: (id: string, data: { label: string; url: string }) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(item.label);
    const [editUrl, setEditUrl] = useState(item.url);

    const handleSave = () => {
        onUpdate(item.id, { label: editLabel, url: editUrl });
        setIsEditing(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="p-3 flex items-center gap-3 hover:bg-slate-50 group bg-white border-b last:border-0 relative z-10">
            <div className="text-slate-300 cursor-move touch-none" {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Nome do link"
                        />
                        <Input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="h-8 text-xs font-mono"
                            placeholder="URL"
                        />
                    </div>
                ) : (
                    <>
                        <div className="font-medium text-slate-800">{item.label}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" /> {item.url}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1">
                {isEditing ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={handleSave}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                    >
                        <Save className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => onDelete(item.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function MenuEditor({ menu, categories = [] }: { menu: any, categories?: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("/produtos");
    const [newLinkLabel, setNewLinkLabel] = useState("");

    // Local state for items to allow instant UI updates
    const [items, setItems] = useState<any[]>(menu.items || []);

    // Sync items if props change (unlikely in this flow but good practice)
    useEffect(() => {
        setItems(menu.items || []);
    }, [menu.items]);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                const orderedIds = newItems.map((item) => item.id);
                reorderMenuItems(menu.id, orderedIds);

                return newItems;
            });
        }
    }


    // --- Menu Details Handlers ---
    const handleUpdateMenu = async (formData: FormData) => {
        setLoading(true);
        await updateMenu(menu.id, null, formData);
        setLoading(false);
    };

    const handleDeleteMenu = async () => {
        if (!confirm("Tem certeza que deseja excluir este menu? Isso não pode ser desfeito.")) return;
        const res = await deleteMenu(menu.id);
        if (res.success) router.push("/admin/menus");
    };

    // --- Menu Item Handlers ---
    const handleAddLink = async (formData: FormData) => {
        // Normalize URL if it's internal and missing slash
        let rawUrl = formData.get("url") as string;

        // Default to /produtos if empty
        if (!rawUrl || rawUrl.trim() === "") {
            rawUrl = "/produtos";
            formData.set("url", rawUrl);
        }

        if (rawUrl && !rawUrl.startsWith("http") && !rawUrl.startsWith("/") && !rawUrl.startsWith("#")) {
            formData.set("url", `/${rawUrl}`);
        }

        await addMenuItem(menu.id, null, formData);
        (document.getElementById("add-link-form") as HTMLFormElement)?.reset();
        setNewLinkLabel(""); // Reset controlled input
        // Since we revalidatePath on server action, the page will reload and update items.
        // But for better UX we could optimistically update local state too, but reload is fine for now.
    };

    // Wrapper for delete to pass to SortableItem
    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Excluir este link?")) return;
        await deleteMenuItem(itemId, menu.id);
    };


    // Wrapper for update item
    const handleUpdateItem = async (itemId: string, data: { label: string; url: string }) => {
        setItems(items.map(i => i.id === itemId ? { ...i, ...data } : i));
        await updateMenuItem(itemId, menu.id, data);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/menus">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Editar Menu</h1>
                        <p className="text-slate-500 text-sm">Gerencie os links e a estrutura.</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteMenu}>
                    <Trash className="h-4 w-4 mr-2" /> Excluir Menu
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Menu Settings */}
                <div className="hidden md:block space-y-6">
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Configurações Avançadas</h3>
                        <form action={handleUpdateMenu} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título Interno</Label>
                                <Input name="title" defaultValue={menu.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Identificador (Sistema)</Label>
                                <Input
                                    name="handle"
                                    defaultValue={menu.handle}
                                    readOnly
                                    className=" bg-slate-100 text-slate-500 cursor-not-allowed focus-visible:ring-0"
                                    title="Este campo não pode ser alterado"
                                />
                            </div>
                            <Button type="submit" variant="outline" className="w-full">
                                {loading ? "Salvando..." : "Salvar Configurações"}
                            </Button>
                        </form>
                    </div>

                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-800">
                        <p className="font-bold mb-1">Dica:</p>
                        <p>O identificador <strong>main</strong> é usado automaticamente para o cabeçalho da loja.</p>
                    </div>
                </div>

                {/* Right Col: Menu Items */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items List */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Links do Menu</h3>
                            <span className="text-xs text-slate-500">{items.length} itens</span>
                        </div>

                        <div className="">
                            {items.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={items}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {items.map((item) => (
                                            <SortableMenuItem
                                                key={item.id}
                                                item={item}
                                                onDelete={handleDeleteItem}
                                                onUpdate={handleUpdateItem}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    Nenhum link adicionado ainda.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-600" /> Adicionar Novo Link
                        </h3>
                        <form id="add-link-form" action={handleAddLink} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label>Nome do Botão</Label>
                                    <Input
                                        name="label"
                                        placeholder="ex: Promoções"
                                        required
                                        value={newLinkLabel}
                                        onChange={(e) => setNewLinkLabel(e.target.value)}
                                    />
                                </div>

                                <LinkSelector
                                    value={newLinkUrl}
                                    onChange={setNewLinkUrl}
                                    onSelectLabel={(label) => {
                                        // Only update if label is empty or we want to overwrite to help user
                                        // Better UX: Always update, because if they pick a new category they likely want the name too.
                                        setNewLinkLabel(label);
                                    }}
                                    categories={categories}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                Adicionar ao Menu
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
