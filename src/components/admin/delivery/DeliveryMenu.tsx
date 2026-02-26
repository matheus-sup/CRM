"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  getAllDeliveryCategories,
  createDeliveryCategory,
  updateDeliveryCategory,
  deleteDeliveryCategory,
  getDeliveryMenuItems,
  createDeliveryMenuItem,
  updateDeliveryMenuItem,
  deleteDeliveryMenuItem,
  toggleMenuItemAvailability,
  reorderDeliveryMenuItems,
  reorderDeliveryCategories,
} from "@/lib/actions/delivery";
import { uploadMedia } from "@/lib/actions/media";

type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  _count: { items: number };
};

type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  isAvailable: boolean;
  isActive: boolean;
  customizations: any[];
  extras: any[];
  tags: string[];
};

// Sortable Item Component
function SortableMenuItem({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-white",
        !item.isAvailable && "opacity-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </button>

      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{item.name}</h4>
          {item.extras && item.extras.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
              Adicionais
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-slate-500 truncate">{item.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {item.compareAtPrice && (
            <span className="text-xs text-slate-400 line-through">
              R$ {item.compareAtPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-bold text-green-600">
            R$ {item.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          title={item.isAvailable ? "Desativar" : "Ativar"}
        >
          {item.isAvailable ? (
            <ToggleRight className="w-5 h-5 text-green-600" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-slate-400" />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

export function DeliveryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Category dialog
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", imageUrl: "" });

  // Item dialog
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    compareAtPrice: "",
  });

  // Extras (adicionais)
  const [extras, setExtras] = useState<Array<{ name: string; price: number }>>([]);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");

  const [saving, setSaving] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, menuItems] = await Promise.all([
        getAllDeliveryCategories(),
        getDeliveryMenuItems(),
      ]);
      setCategories(cats);
      setItems(menuItems);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar cardápio");
    } finally {
      setLoading(false);
    }
  }

  function toggleCategoryExpanded(catId: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  }

  // Handle item drag end
  async function handleItemDragEnd(event: DragEndEvent, categoryId: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryItems = items.filter((i) => i.categoryId === categoryId);
    const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
    const newIndex = categoryItems.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);

    // Update local state immediately for smooth UX
    const newItems = items.map((item) => {
      const reorderedItem = reorderedItems.find((r) => r.id === item.id);
      if (reorderedItem) {
        const newOrder = reorderedItems.indexOf(reorderedItem);
        return { ...item, order: newOrder };
      }
      return item;
    });
    setItems(newItems);

    // Persist to database
    try {
      await reorderDeliveryMenuItems(
        reorderedItems.map((item, index) => ({ id: item.id, order: index }))
      );
    } catch (error) {
      toast.error("Erro ao reordenar itens");
      loadData(); // Revert on error
    }
  }

  // Category handlers
  function openCategoryDialog(cat?: Category) {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", imageUrl: "" });
    }
    setShowCategoryDialog(true);
  }

  async function handleSaveCategory() {
    if (!categoryForm.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateDeliveryCategory(editingCategory.id, categoryForm);
        toast.success("Categoria atualizada!");
      } else {
        await createDeliveryCategory(categoryForm);
        toast.success("Categoria criada!");
      }
      setShowCategoryDialog(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Excluir esta categoria e todos os itens?")) return;

    try {
      await deleteDeliveryCategory(id);
      toast.success("Categoria excluída!");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir categoria");
    }
  }

  // Item handlers
  function openItemDialog(catId: string, item?: MenuItem) {
    if (item) {
      setEditingItem(item);
      setItemForm({
        categoryId: item.categoryId,
        name: item.name,
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        price: String(item.price),
        compareAtPrice: item.compareAtPrice ? String(item.compareAtPrice) : "",
      });
      setImagePreview(item.imageUrl || null);
      setExtras(item.extras || []);
    } else {
      setEditingItem(null);
      setItemForm({
        categoryId: catId,
        name: "",
        description: "",
        imageUrl: "",
        price: "",
        compareAtPrice: "",
      });
      setImagePreview(null);
      setExtras([]);
    }
    setNewExtraName("");
    setNewExtraPrice("");
    setShowItemDialog(true);
  }

  function addExtra() {
    if (!newExtraName.trim()) return;
    const price = parseFloat(newExtraPrice) || 0;
    setExtras([...extras, { name: newExtraName.trim(), price }]);
    setNewExtraName("");
    setNewExtraPrice("");
  }

  function removeExtra(index: number) {
    setExtras(extras.filter((_, i) => i !== index));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    setImagePreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMedia(formData);
      if (result.success && result.media) {
        setItemForm({ ...itemForm, imageUrl: result.media.url });
        toast.success("Imagem enviada!");
      } else {
        toast.error(result.message || "Erro ao enviar imagem");
        setImagePreview(null);
      }
    } catch (error) {
      toast.error("Erro ao enviar imagem");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setItemForm({ ...itemForm, imageUrl: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSaveItem() {
    if (!itemForm.name.trim() || !itemForm.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const data = {
        categoryId: itemForm.categoryId,
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl: itemForm.imageUrl || undefined,
        price: parseFloat(itemForm.price),
        compareAtPrice: itemForm.compareAtPrice ? parseFloat(itemForm.compareAtPrice) : undefined,
        extras: extras.length > 0 ? extras : undefined,
      };

      if (editingItem) {
        await updateDeliveryMenuItem(editingItem.id, data);
        toast.success("Item atualizado!");
      } else {
        await createDeliveryMenuItem(data);
        toast.success("Item criado!");
      }
      setShowItemDialog(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Excluir este item?")) return;

    try {
      await deleteDeliveryMenuItem(id);
      toast.success("Item excluído!");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir item");
    }
  }

  async function handleToggleAvailability(id: string) {
    try {
      await toggleMenuItemAvailability(id);
      loadData();
    } catch (error) {
      toast.error("Erro ao alterar disponibilidade");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cardápio Digital</h2>
          <p className="text-sm text-slate-500">
            {categories.length} categorias, {items.length} itens
          </p>
        </div>
        <Button onClick={() => openCategoryDialog()} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">Nenhuma categoria criada ainda</p>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catItems = items.filter((item) => item.categoryId === cat.id);
            const isExpanded = expandedCategories.has(cat.id);

            return (
              <Card key={cat.id} className={cn(!cat.isActive && "opacity-50")}>
                <CardHeader className="py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategoryExpanded(cat.id)}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {cat.name}
                        <Badge variant="secondary" className="text-xs">
                          {catItems.length} itens
                        </Badge>
                        {!cat.isActive && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            Inativo
                          </Badge>
                        )}
                      </CardTitle>
                      {cat.description && (
                        <p className="text-sm text-slate-500">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openItemDialog(cat.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Item
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openCategoryDialog(cat)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {catItems.length === 0 ? (
                      <p className="text-center text-slate-400 py-4 text-sm">
                        Nenhum item nesta categoria
                      </p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleItemDragEnd(event, cat.id)}
                      >
                        <SortableContext
                          items={catItems.map((i) => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {catItems.map((item) => (
                              <SortableMenuItem
                                key={item.id}
                                item={item}
                                onEdit={() => openItemDialog(cat.id, item)}
                                onDelete={() => handleDeleteItem(item.id)}
                                onToggle={() => handleToggleAvailability(item.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Hambúrgueres"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Descrição opcional..."
              />
            </div>
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={categoryForm.imageUrl}
                onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Ex: X-Bacon"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Ingredientes, detalhes..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Preço Original (riscado)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemForm.compareAtPrice}
                  onChange={(e) => setItemForm({ ...itemForm, compareAtPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>Imagem</Label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              {/* Preview ou Upload */}
              {imagePreview || itemForm.imageUrl ? (
                <div className="relative w-32 h-32 mt-2">
                  <img
                    src={imagePreview || itemForm.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Enviar</span>
                    </>
                  )}
                </button>
              )}

              {/* URL alternativa */}
              <div className="mt-2">
                <Input
                  value={itemForm.imageUrl}
                  onChange={(e) => {
                    setItemForm({ ...itemForm, imageUrl: e.target.value });
                    setImagePreview(e.target.value || null);
                  }}
                  placeholder="ou cole uma URL..."
                  className="text-xs"
                />
              </div>
            </div>

            {/* Adicionais / Extras */}
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Adicionais</Label>
              <p className="text-xs text-slate-500 mb-3">
                Itens extras que o cliente pode adicionar (ex: queijo extra, bacon)
              </p>

              {/* Lista de extras existentes */}
              {extras.length > 0 && (
                <div className="space-y-2 mb-3">
                  {extras.map((extra, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{extra.name}</span>
                        <span className="text-sm text-green-600">
                          + R$ {extra.price.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtra(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar novo extra */}
              <div className="flex gap-2">
                <Input
                  value={newExtraName}
                  onChange={(e) => setNewExtraName(e.target.value)}
                  placeholder="Nome do adicional"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExtra();
                    }
                  }}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={newExtraPrice}
                  onChange={(e) => setNewExtraPrice(e.target.value)}
                  placeholder="Preço"
                  className="w-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExtra();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExtra}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
